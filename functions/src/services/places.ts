import type { ResolvedPlace } from "../types";

const SEARCH_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

const FIELD_MASK = [
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.id",
  "places.primaryType",
].join(",");

interface PlacesTextSearchResponse {
  places?: Array<{
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
    primaryType?: string;
  }>;
}

const MAX_CANDIDATES = 5;
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Resolves a free-text query (place name + optional address hint) to real
 * places via Google Places API (New) Text Search. Text Search itself already
 * does fuzzy/nearby matching (e.g. a caption's "Grizzly Bear Restaurant" can
 * resolve to a real business actually named "Grizzly Bar") - the caller used
 * to only look at the top hit, which silently discarded any other
 * candidates Google considered a plausible match. Returning the ranked list
 * lets the UI offer them as a picker instead of forcing an exact-name retry.
 */
export async function resolvePlace(
  query: string,
  apiKey: string
): Promise<ResolvedPlace[]> {
  let res: Response;
  try {
    res = await fetch(SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({ textQuery: query }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("Google Places took too long to respond. Please try again.");
    }
    throw new Error(`Could not reach Google Places: ${(err as Error).message}`);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Places API request failed: ${res.status} ${res.statusText} - ${body}`);
  }

  const data = (await res.json()) as PlacesTextSearchResponse;

  return (data.places ?? [])
    .filter((place) => place.location && place.formattedAddress)
    .slice(0, MAX_CANDIDATES)
    .map((place) => ({
      placeName: place.displayName?.text ?? query,
      address: place.formattedAddress!,
      lat: place.location!.latitude,
      lng: place.location!.longitude,
      placeId: place.id,
      category: place.primaryType ?? "unknown",
    }));
}
