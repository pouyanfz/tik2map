import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

import { fetchTikTokCaption } from "./services/oembed";
import { extractPlaceFromCaption } from "./services/gemini";
import { resolvePlace as resolvePlaceViaPlacesApi } from "./services/places";
import type {
  ResolvePlaceRequest,
  ResolvePlaceResponse,
  SavePlaceRequest,
} from "./types";

initializeApp();

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const placesApiKey = defineSecret("PLACES_API_KEY");

/**
 * Runs the extraction pipeline (oEmbed -> Gemini -> Places) for a TikTok URL.
 * Does not write to Firestore - the client shows a confirmation modal with
 * this result and calls savePlace separately once the user confirms.
 */
export const resolvePlaceFromTikTok = onCall<ResolvePlaceRequest>(
  { secrets: [geminiApiKey, placesApiKey] },
  async (request): Promise<ResolvePlaceResponse> => {
    const { tiktokUrl } = request.data;
    if (!tiktokUrl || typeof tiktokUrl !== "string") {
      throw new HttpsError("invalid-argument", "tiktokUrl is required.");
    }

    const caption = await fetchTikTokCaption(tiktokUrl);

    const extracted = await extractPlaceFromCaption(caption, geminiApiKey.value());
    if (!extracted) {
      return { tiktokUrl, caption, extracted: null, resolved: null };
    }

    const query = extracted.address
      ? `${extracted.placeName}, ${extracted.address}`
      : extracted.placeName;

    const resolved = await resolvePlaceViaPlacesApi(query, placesApiKey.value());

    return { tiktokUrl, caption, extracted, resolved };
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

  const db = getFirestore();
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
    occasion: data.occasion ?? "",
    createdAt: new Date(),
  });

  return { id: docRef.id };
});
