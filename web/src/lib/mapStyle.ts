export function getMapboxStyle(): string {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isDark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12";
}
