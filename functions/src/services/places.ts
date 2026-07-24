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

/**
 * Resolves a free-text query (place name + optional address hint) to a real
 * place via Google Places API (New) Text Search. Returns null if no place is found.
 */
export async function resolvePlace(
  query: string,
  apiKey: string
): Promise<ResolvedPlace | null> {
  const res = await fetch(SEARCH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: query }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Places API request failed: ${res.status} ${res.statusText} - ${body}`);
  }

  const data = (await res.json()) as PlacesTextSearchResponse;
  const place = data.places?.[0];

  if (!place || !place.location || !place.formattedAddress) {
    return null;
  }

  return {
    placeName: place.displayName?.text ?? query,
    address: place.formattedAddress,
    lat: place.location.latitude,
    lng: place.location.longitude,
    placeId: place.id,
    category: place.primaryType ?? "unknown",
  };
}
