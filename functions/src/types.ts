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
  extracted: ExtractedPlace | null;
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
  occasion?: string | string[];
}
