import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Hardcoded test marker so the Mapbox render path can be verified in
// isolation before real place data is wired in (build order step 1).
const TEST_MARKER = { lng: -73.9857, lat: 40.7484, label: "Test marker" };

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [TEST_MARKER.lng, TEST_MARKER.lat],
      zoom: 12,
    });

    new mapboxgl.Marker()
      .setLngLat([TEST_MARKER.lng, TEST_MARKER.lat])
      .setPopup(new mapboxgl.Popup().setText(TEST_MARKER.label))
      .addTo(map);

    return () => map.remove();
  }, []);

  return <div ref={containerRef} className="map-view" />;
}
