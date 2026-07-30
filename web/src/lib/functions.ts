import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import type {
  ResolvePlaceResponse,
  SearchPlaceResponse,
  SavePlacePayload,
  UpdatePlacePayload,
} from "../types";

const resolvePlaceFromTikTokCallable = httpsCallable<{ tiktokUrl: string }, ResolvePlaceResponse>(
  functions,
  "resolvePlaceFromTikTok"
);

const searchPlaceCallable = httpsCallable<{ query: string }, SearchPlaceResponse>(
  functions,
  "searchPlace"
);

const savePlaceCallable = httpsCallable<SavePlacePayload, { id: string }>(functions, "savePlace");

const updatePlaceCallable = httpsCallable<UpdatePlacePayload, { id: string }>(functions, "updatePlace");

const deletePlaceCallable = httpsCallable<{ id: string }, { id: string }>(functions, "deletePlace");

export async function resolvePlaceFromTikTok(tiktokUrl: string): Promise<ResolvePlaceResponse> {
  const res = await resolvePlaceFromTikTokCallable({ tiktokUrl });
  return res.data;
}

export async function searchPlace(query: string): Promise<SearchPlaceResponse> {
  const res = await searchPlaceCallable({ query });
  return res.data;
}

export async function savePlace(payload: SavePlacePayload): Promise<{ id: string }> {
  const res = await savePlaceCallable(payload);
  return res.data;
}

export async function updatePlace(payload: UpdatePlacePayload): Promise<{ id: string }> {
  const res = await updatePlaceCallable(payload);
  return res.data;
}

export async function deletePlace(id: string): Promise<{ id: string }> {
  const res = await deletePlaceCallable({ id });
  return res.data;
}
