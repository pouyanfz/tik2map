export interface ExtractedPlace {
  placeName: string;
  address: string | null;
}

export interface ResolvedPlace {
  placeName: string;
  address: string;
  lat: number;
  lng: number;
  placeId: string;
  category: string;
}

export interface ResolvePlaceRequest {
  tiktokUrl: string;
}

export interface ResolvePlaceResponse {
  tiktokUrl: string;
  caption: string;
  thumbnailUrl: string | null;
  extracted: ExtractedPlace | null;
  // Ranked list of Places API matches (possibly empty) - the caption's guess
  // at a name doesn't always match the business's real listed name (e.g.
  // "Grizzly Bear Restaurant" vs. the actual "Grizzly Bar"), so the top hit
  // isn't always right. The client offers these as a picker instead of
  // discarding everything but candidates[0].
  candidates: ResolvedPlace[];
}

export interface SearchPlaceRequest {
  query: string;
}

export interface SearchPlaceResponse {
  candidates: ResolvedPlace[];
}

export interface SavePlaceRequest {
  tiktokUrl: string;
  placeName: string;
  address: string;
  lat: number;
  lng: number;
  placeId: string;
  category: string;
  note?: string;
  tags?: string[];
  occasion?: string[];
  cuisine?: string;
  thumbnailUrl?: string | null;
}

export interface UpdatePlaceRequest {
  id: string;
  placeName?: string;
  note?: string;
  tags?: string[];
  occasion?: string[];
  cuisine?: string;
}

export interface DeletePlaceRequest {
  id: string;
}
