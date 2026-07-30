import { getResolvedTheme } from "./theme";

export function getMapboxStyle(): string {
  return getResolvedTheme() === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12";
}
