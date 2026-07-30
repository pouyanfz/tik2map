import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxStyle } from "../../lib/mapStyle";

interface MiniMapProps {
  lat: number;
  lng: number;
  label?: string;
}

export function MiniMap({ lat, lng, label }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: getMapboxStyle(),
      center: [lng, lat],
      zoom: 14,
      interactive: false,
    });
    mapRef.current = map;

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 20,
    }).setText(label ?? "");
    popupRef.current = popup;

    const marker = new mapboxgl.Marker().setLngLat([lng, lat]).setPopup(popup).addTo(map);
    markerRef.current = marker;
    if (label) marker.togglePopup();

    return () => map.remove();
  }, []);

  useEffect(() => {
    mapRef.current?.setCenter([lng, lat]);
    markerRef.current?.setLngLat([lng, lat]);
  }, [lat, lng]);

  useEffect(() => {
    popupRef.current?.setText(label ?? "");
  }, [label]);

  return <div ref={containerRef} className="mini-map" />;
}
