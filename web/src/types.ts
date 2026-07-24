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
  occasion?: string | string[];
  createdAt: unknown;
}

export type TabId = "map" | "add" | "list";
