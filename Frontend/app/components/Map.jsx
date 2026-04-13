"use client";

import { useEffect, useRef } from "react";

const INITIAL_CENTER = [12.9716, 77.5946];
const INITIAL_ZOOM = 12;

export default function Map() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");

      if (!isMounted || !mapRef.current) return;

      const map = L.map(mapRef.current).setView(INITIAL_CENTER, INITIAL_ZOOM);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = map;
      map.invalidateSize();
    }

    initMap();

    return () => {
      isMounted = false;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="map"
      style={{ height: "400px", width: "100%" }}
      aria-label="Bangalore map"
    />
  );
}
