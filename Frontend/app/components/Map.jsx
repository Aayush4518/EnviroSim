"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Layers } from "lucide-react";

const INITIAL_CENTER = [12.9716, 77.5946];
const INITIAL_ZOOM = 12;

// Mock risk data points (in real app, this would come from your backend/API)
const RISK_DATA = {
  pollution: [
    { lat: 12.9716, lng: 77.5946, intensity: 0.8, label: "High Pollution Zone" },
    { lat: 12.975, lng: 77.635, intensity: 0.6, label: "Moderate Pollution" },
  ],
  flood: [
    { lat: 12.935, lng: 77.585, intensity: 0.7, label: "Flood Risk Area" },
    { lat: 12.96, lng: 77.605, intensity: 0.5, label: "Low Flood Risk" },
  ],
  temperature: [
    { lat: 12.945, lng: 77.615, intensity: 0.75, label: "Heat Island Effect" },
    { lat: 12.99, lng: 77.56, intensity: 0.55, label: "Moderate Temperature" },
  ],
};

export default function Map() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatmapLayersRef = useRef({});
  const [searchQuery, setSearchQuery] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [isHeatmapPanelOpen, setIsHeatmapPanelOpen] = useState(false);
  const [activeHeatmaps, setActiveHeatmaps] = useState({
    pollution: false,
    flood: false,
    temperature: false,
  });

  // LOCATION SEARCH FUNCTIONALITY
  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon } = results[0];
        mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lon)], 14);
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // HEATMAP LAYER TOGGLE FUNCTIONALITY
  const addHeatmapLayer = async (type) => {
    const LeafletModule = await import("leaflet");
    const L = LeafletModule.default || LeafletModule;
    const map = mapInstanceRef.current;
    const points = RISK_DATA[type];

    if (!map) return;

    // Create a custom pane for heatmaps if it doesn't exist
    if (!map.getPane('heatmapPane')) {
      map.createPane('heatmapPane');
      map.getPane('heatmapPane').style.zIndex = 650; // Above default overlays (600)
    }

    const colors = {
      pollution: { low: "#90EE90", high: "#FF4500" },
      flood: { low: "#87CEEB", high: "#00008B" },
      temperature: { low: "#FFB6C1", high: "#FF0000" },
    };

    const color = colors[type];
    const layerGroup = L.layerGroup();

    points.forEach((point) => {
      const radius = 2000 + point.intensity * 3000;
      const fillColor =
        point.intensity > 0.7
          ? color.high
          : point.intensity > 0.4
          ? tintColor(color.high, color.low, 0.5)
          : color.low;

      const circle = L.circle([point.lat, point.lng], {
        color: "#333",
        weight: 2,
        opacity: 0.8,
        fillColor: fillColor,
        fillOpacity: 0.5,
        radius: radius,
        pane: 'heatmapPane',
      })
        .bindPopup(`<strong>${point.label}</strong><br/>Risk: ${Math.round(point.intensity * 100)}%`)
        .addTo(layerGroup);
    });

    layerGroup.addTo(map);
    heatmapLayersRef.current[type] = layerGroup;
    console.log(`Heatmap ${type} added with pane`, map.getPane('heatmapPane'));
  };

  const removeHeatmapLayer = (type) => {
    const map = mapInstanceRef.current;
    if (heatmapLayersRef.current[type]) {
      map.removeLayer(heatmapLayersRef.current[type]);
      delete heatmapLayersRef.current[type];
    }
  };

  const toggleHeatmap = async (type) => {
    if (!mapReady || !mapInstanceRef.current) {
      console.warn('Map not ready yet');
      return;
    }
    
    const newState = !activeHeatmaps[type];
    setActiveHeatmaps((prev) => ({ ...prev, [type]: newState }));

    if (newState) {
      await addHeatmapLayer(type);
    } else {
      removeHeatmapLayer(type);
    }
  };

  // COLOR INTERPOLATION HELPER
  const tintColor = (color1, color2, factor) => {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);
    const r = Math.round(((c1 >> 16) & 255) * factor + ((c2 >> 16) & 255) * (1 - factor));
    const g = Math.round(
      (((c1 >> 8) & 255) * factor + ((c2 >> 8) & 255) * (1 - factor))
    );
    const b = Math.round(((c1 & 255) * factor + (c2 & 255) * (1 - factor)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  };

  // MAP INITIALIZATION
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        const LeafletModule = await import("leaflet");
        const L = LeafletModule.default || LeafletModule;

        if (!isMounted || !mapRef.current) return;

        const map = L.map(mapRef.current, {
          scrollWheelZoom: true,
          dragging: true,
          zoomControl: true,
        }).setView(INITIAL_CENTER, INITIAL_ZOOM);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        mapInstanceRef.current = map;
        map.invalidateSize();
        
        // Give map time to fully initialize before allowing interactions
        setTimeout(() => {
          if (isMounted) {
            setMapReady(true);
          }
        }, 500);
      } catch (error) {
        console.error("Map initialization error:", error);
      }
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
    <div className="relative w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {/* MAP CONTAINER */}
      <div
        ref={mapRef}
        className="map pointer-events-auto"
        style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}
        aria-label="Bangalore map"
      />
      <button
        onClick={() => setIsHeatmapPanelOpen(!isHeatmapPanelOpen)}
        className="fixed z-40 flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 pointer-events-auto"
        style={{ bottom: '8px', right: '16px', zIndex: 40 }}
        aria-label="Toggle heatmap panel"
        title={isHeatmapPanelOpen ? "Close heatmaps" : "Open heatmaps"}
      >
        <Layers className="w-6 h-6" />
      </button>

      {/* HEATMAP TOGGLE UI COMPONENT */}
      {isHeatmapPanelOpen && (
      <div className="fixed right-4 z-50 bg-white rounded-lg shadow-xl p-4 border border-gray-200 w-80 pointer-events-auto animate-in fade-in slide-in-from-bottom-2" style={{ bottom: '60px', right: '16px', zIndex: 9999 }}>
        {/* SEARCH LOCATION INSIDE HEATMAP MENU */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <form onSubmit={handleLocationSearch} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800">Search Location</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search location..."
                  className="w-full px-3 py-2 pl-9 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Go
              </button>
            </div>
          </form>
        </div>
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
          <Layers className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-800">Risk Heatmaps</h3>
        </div>

        <div className="space-y-2">
          {/* Pollution Heatmap Toggle */}
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              checked={activeHeatmaps.pollution}
              onChange={() => toggleHeatmap("pollution")}
              className="w-4 h-4 text-orange-500 rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-800">Air Pollution</p>
              <p className="text-xs text-gray-500">Pollution intensity</p>
            </div>
          </label>

          {/* Flood Heatmap Toggle */}
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              checked={activeHeatmaps.flood}
              onChange={() => toggleHeatmap("flood")}
              className="w-4 h-4 text-blue-500 rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-800">Flood Risk</p>
              <p className="text-xs text-gray-500">Water accumulation zones</p>
            </div>
          </label>

          {/* Temperature Heatmap Toggle */}
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              checked={activeHeatmaps.temperature}
              onChange={() => toggleHeatmap("temperature")}
              className="w-4 h-4 text-red-500 rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-800">Heat Islands</p>
              <p className="text-xs text-gray-500">Temperature hotspots</p>
            </div>
          </label>
        </div>

        {/* Legend Section */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <p className="font-medium mb-2">Risk Levels:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>High Risk &gt; 70%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Medium Risk 40-70%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Low Risk &lt; 40%</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* MAP CONTAINER */}
      <div
        ref={mapRef}
        className="map pointer-events-auto"
        style={{ height: "100%", width: "100%" }}
        aria-label="Bangalore map"
      />
    </div>
  );
}
