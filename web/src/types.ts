export interface Place {
  id: string;
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
  createdAt: unknown;
}

export type TabId = "map" | "add" | "list";

// A pending request for MapView to move its camera, issued by whichever tab
// caused it (a fresh single save, or a bulk import) - one mechanism instead
// of a separate prop/effect per trigger.
export type CameraAction =
  | { type: "focus"; lat: number; lng: number }
  | { type: "fit"; places: { lat: number; lng: number }[] };

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

export interface ResolvePlaceResponse {
  tiktokUrl: string;
  caption: string;
  thumbnailUrl: string | null;
  extracted: ExtractedPlace | null;
  resolved: ResolvedPlace | null;
}

export interface SearchPlaceResponse {
  resolved: ResolvedPlace | null;
}

export interface SavePlacePayload {
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

export interface UpdatePlacePayload {
  id: string;
  placeName?: string;
  note?: string;
  tags?: string[];
  occasion?: string[];
  cuisine?: string;
}
