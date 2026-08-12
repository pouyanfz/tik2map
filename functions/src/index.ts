import { initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

import { fetchTikTokCaption } from "./services/oembed";
import { extractPlaceFromCaption } from "./services/gemini";
import { resolvePlace as resolvePlaceViaPlacesApi } from "./services/places";
import type {
  ResolvePlaceRequest,
  ResolvePlaceResponse,
  SearchPlaceRequest,
  SearchPlaceResponse,
  SavePlaceRequest,
  UpdatePlaceRequest,
  DeletePlaceRequest,
} from "./types";

initializeApp();

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const placesApiKey = defineSecret("PLACES_API_KEY");

async function getPlaceDocOrThrow(db: Firestore, id: string) {
  const docRef = db.collection("places").doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    throw new HttpsError("not-found", "This place no longer exists.");
  }
  return docRef;
}

// onCall redacts any thrown error that isn't already an HttpsError down to a
// message-less generic "INTERNAL" before it reaches the client - this
// rethrows unexpected failures (e.g. a Firestore outage) as an HttpsError
// carrying a real message, so the client can show it instead of nothing.
async function withReadableErrors<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", (err as Error).message || "Something went wrong. Please try again.");
  }
}

/**
 * Runs the extraction pipeline (oEmbed -> Gemini -> Places) for a TikTok URL.
 * Does not write to Firestore - the client shows a confirmation modal with
 * this result and calls savePlace separately once the user confirms.
 */
export const resolvePlaceFromTikTok = onCall<ResolvePlaceRequest>(
  { secrets: [geminiApiKey, placesApiKey], timeoutSeconds: 45 },
  async (request): Promise<ResolvePlaceResponse> => {
    const { tiktokUrl } = request.data;
    if (!tiktokUrl || typeof tiktokUrl !== "string") {
      throw new HttpsError("invalid-argument", "tiktokUrl is required.");
    }

    // Every step below throws a plain Error with a message meant for the
    // user (not a stack trace) - withReadableErrors is what turns that into
    // something the client actually sees, instead of the message-less
    // generic "internal" error onCall defaults to, which is why the Add tab
    // used to look "stuck" with nothing to explain what went wrong.
    return withReadableErrors(async () => {
      const { caption, thumbnailUrl } = await fetchTikTokCaption(tiktokUrl);

      const extracted = await extractPlaceFromCaption(caption, geminiApiKey.value());
      if (!extracted) {
        return { tiktokUrl, caption, thumbnailUrl, extracted: null, candidates: [] };
      }

      const query = extracted.address
        ? `${extracted.placeName}, ${extracted.address}`
        : extracted.placeName;

      const candidates = await resolvePlaceViaPlacesApi(query, placesApiKey.value());

      return { tiktokUrl, caption, thumbnailUrl, extracted, candidates };
    });
  }
);

/**
 * Resolves a manually-typed place name/address to a real place via Places API.
 * Used by the confirmation modal when the automatic pipeline found nothing
 * (or the user wants to correct a wrong auto-match) - same resolution path
 * resolvePlaceFromTikTok uses internally, just callable directly.
 */
export const searchPlace = onCall<SearchPlaceRequest>(
  { secrets: [placesApiKey], timeoutSeconds: 30 },
  async (request): Promise<SearchPlaceResponse> => {
    const { query } = request.data;
    if (!query || typeof query !== "string") {
      throw new HttpsError("invalid-argument", "query is required.");
    }

    return withReadableErrors(async () => {
      const candidates = await resolvePlaceViaPlacesApi(query, placesApiKey.value());
      return { candidates };
    });
  }
);

/**
 * Writes a confirmed place to Firestore. This is the only path that can
 * create `places` documents - direct client writes are denied by firestore.rules.
 */
export const savePlace = onCall<SavePlaceRequest>(async (request) => {
  const data = request.data;

  if (!data.placeName || !data.address || typeof data.lat !== "number" || typeof data.lng !== "number") {
    throw new HttpsError("invalid-argument", "placeName, address, lat, and lng are required.");
  }

  return withReadableErrors(async () => {
    const db = getFirestore();

    const existing = await db.collection("places").where("placeId", "==", data.placeId).limit(1).get();
    if (!existing.empty) {
      throw new HttpsError("already-exists", "This place is already saved.");
    }

    const docRef = await db.collection("places").add({
      tiktokUrl: data.tiktokUrl,
      placeName: data.placeName,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      placeId: data.placeId,
      category: data.category,
      note: data.note ?? "",
      tags: data.tags ?? [],
      occasion: data.occasion ?? [],
      cuisine: data.cuisine ?? "",
      thumbnailUrl: data.thumbnailUrl ?? null,
      createdAt: new Date(),
    });

    return { id: docRef.id };
  });
});

/**
 * Edits an existing place's user-facing fields (label-only - does not
 * re-resolve location/coordinates). Same "Admin SDK only" write path as
 * savePlace; direct client writes stay denied by firestore.rules.
 */
export const updatePlace = onCall<UpdatePlaceRequest>(async (request) => {
  const { id, placeName, note, tags, occasion, cuisine } = request.data;
  if (!id || typeof id !== "string") {
    throw new HttpsError("invalid-argument", "id is required.");
  }

  const update: Record<string, unknown> = {};
  if (placeName !== undefined) update.placeName = placeName;
  if (note !== undefined) update.note = note;
  if (tags !== undefined) update.tags = tags;
  if (occasion !== undefined) update.occasion = occasion;
  if (cuisine !== undefined) update.cuisine = cuisine;

  return withReadableErrors(async () => {
    const db = getFirestore();
    const docRef = await getPlaceDocOrThrow(db, id);

    await docRef.update(update);
    return { id };
  });
});

/**
 * Deletes a place. Same "Admin SDK only" write path as savePlace/updatePlace;
 * direct client deletes stay denied by firestore.rules.
 */
export const deletePlace = onCall<DeletePlaceRequest>(async (request) => {
  const { id } = request.data;
  if (!id || typeof id !== "string") {
    throw new HttpsError("invalid-argument", "id is required.");
  }

  return withReadableErrors(async () => {
    const db = getFirestore();
    const docRef = await getPlaceDocOrThrow(db, id);

    await docRef.delete();
    return { id };
  });
});
