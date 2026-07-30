import type { Place } from "../types";

export function googleMapsViewUrl(place: Place): string {
  return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}&query_place_id=${place.placeId}`;
}

export function googleMapsDirectionsUrl(place: Place): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=${place.placeId}`;
}

export function appleMapsViewUrl(place: Place): string {
  return `https://maps.apple.com/?ll=${place.lat},${place.lng}&q=${encodeURIComponent(place.placeName)}`;
}

export function appleMapsDirectionsUrl(place: Place): string {
  return `https://maps.apple.com/?daddr=${place.lat},${place.lng}&dirflg=d`;
}
