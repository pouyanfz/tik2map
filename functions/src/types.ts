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
  resolved: ResolvedPlace | null;
}

export interface SearchPlaceRequest {
  query: string;
}

export interface SearchPlaceResponse {
  resolved: ResolvedPlace | null;
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
