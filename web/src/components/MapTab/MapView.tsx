import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getTagStyle } from "../../lib/tags";
import { getCuisineOption } from "../../lib/cuisines";
import { getMapboxStyle } from "../../lib/mapStyle";
import { toggleId } from "../../lib/arrayUtils";
import { PlaceDetailSheet } from "./PlaceDetailSheet";
import { FilterPanel } from "./FilterPanel";
import type { CameraAction, Place } from "../../types";

const FALLBACK_CENTER: [number, number] = [0, 20];
const FALLBACK_ZOOM = 1.5;

function createMarkerElement(color: string, icon: string, flag: string | undefined): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "map-marker-wrapper";

  const el = document.createElement("div");
  el.className = "map-marker";
  el.style.background = color;
  el.textContent = icon;
  wrapper.appendChild(el);

  if (flag) {
    const badge = document.createElement("span");
    badge.className = "map-marker-flag";
    badge.textContent = flag;
    wrapper.appendChild(badge);
  }

  return wrapper;
}

function boundsFromPlaces(places: { lat: number; lng: number }[]): mapboxgl.LngLatBounds {
  const bounds = new mapboxgl.LngLatBounds();
  places.forEach((p) => bounds.extend([p.lng, p.lat]));
  return bounds;
}

interface MapViewProps {
  places: Place[];
  placesLoading: boolean;
  cameraAction: CameraAction | null;
}

export function MapView({ places, placesLoading, cameraAction }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const hasCenteredRef = useRef(false);

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoSettled, setGeoSettled] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: getMapboxStyle(),
      center: FALLBACK_CENTER,
      zoom: FALLBACK_ZOOM,
    });
    mapRef.current = map;
    map.addControl(
      new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }),
      "bottom-left"
    );

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoSettled(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
        setGeoSettled(true);
      },
      () => setGeoSettled(true),
      { timeout: 5000 }
    );
  }, []);

  // Decide the initial view once, after we know whether geolocation succeeded
  // and the saved places have loaded: prefer the user's location, fall back
  // to fitting all saved places, and only then the neutral world view. Only
  // latch `hasCenteredRef` once we actually center on something - otherwise
  // an empty map with no geolocation burns its one shot doing nothing, and
  // places added later (e.g. a bulk import) never pan the camera into view
  // without a full page reload.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || hasCenteredRef.current || !geoSettled || placesLoading || cameraAction) return;

    if (userLocation) {
      hasCenteredRef.current = true;
      map.setCenter(userLocation);
      map.setZoom(13);
    } else if (places.length > 0) {
      hasCenteredRef.current = true;
      map.fitBounds(boundsFromPlaces(places), { padding: 60, maxZoom: 14 });
    }
  }, [geoSettled, placesLoading, userLocation, places, cameraAction]);

  // An explicit camera request from elsewhere in the app - a fresh single
  // save ("focus") or a bulk import ("fit") - fires once per new action
  // object/array reference (App.tsx creates a new one each time).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !cameraAction) return;
    hasCenteredRef.current = true;

    if (cameraAction.type === "focus") {
      map.flyTo({ center: [cameraAction.lng, cameraAction.lat], zoom: 15 });
      return;
    }
    if (cameraAction.places.length === 1) {
      map.flyTo({ center: [cameraAction.places[0].lng, cameraAction.places[0].lat], zoom: 15 });
    } else if (cameraAction.places.length > 1) {
      map.fitBounds(boundsFromPlaces(cameraAction.places), { padding: 60, maxZoom: 14 });
    }
  }, [cameraAction]);

  const filteredPlaces = useMemo(
    () =>
      places.filter((p) => {
        if (selectedTags.length && !p.tags?.some((t) => selectedTags.includes(t))) return false;
        if (selectedOccasions.length && !p.occasion?.some((o) => selectedOccasions.includes(o))) return false;
        if (selectedCategories.length && !selectedCategories.includes(p.category)) return false;
        if (selectedCuisines.length && (!p.cuisine || !selectedCuisines.includes(p.cuisine))) return false;
        return true;
      }),
    [places, selectedTags, selectedOccasions, selectedCategories, selectedCuisines]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Always rebuild from scratch rather than diffing by id - a diff would
    // skip re-rendering markers whose place data changed (e.g. tags/cuisine
    // edited) but whose id stayed the same, leaving stale-looking markers
    // until a full page reload. Place counts are small enough that this is
    // cheap.
    for (const marker of markersRef.current.values()) {
      marker.remove();
    }
    markersRef.current.clear();

    for (const place of filteredPlaces) {
      const { color, icon } = getTagStyle(place.tags);
      const flag = getCuisineOption(place.cuisine)?.flag;
      const el = createMarkerElement(color, icon, flag);
      el.addEventListener("click", () => setSelectedPlace(place));
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([place.lng, place.lat]).addTo(map);
      markersRef.current.set(place.id, marker);
    }
  }, [filteredPlaces]);

  const categories = useMemo(() => Array.from(new Set(places.map((p) => p.category))).sort(), [places]);

  return (
    <div className="map-view-container">
      <div ref={containerRef} className="map-view" />
      <button type="button" className="map-filter-btn" onClick={() => setFilterOpen(true)}>
        Filter
      </button>
      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={categories}
        selectedTags={selectedTags}
        selectedOccasions={selectedOccasions}
        selectedCategories={selectedCategories}
        selectedCuisines={selectedCuisines}
        onToggleTag={(id) => setSelectedTags((prev) => toggleId(prev, id))}
        onToggleOccasion={(id) => setSelectedOccasions((prev) => toggleId(prev, id))}
        onToggleCategory={(id) => setSelectedCategories((prev) => toggleId(prev, id))}
        onToggleCuisine={(id) => setSelectedCuisines((prev) => toggleId(prev, id))}
        onClear={() => {
          setSelectedTags([]);
          setSelectedOccasions([]);
          setSelectedCategories([]);
          setSelectedCuisines([]);
        }}
      />
      {selectedPlace && <PlaceDetailSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} />}
    </div>
  );
}
