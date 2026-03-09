"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { WinningStore } from "@/types/store";

interface Props {
  stores: WinningStore[];
  topStores: WinningStore[];
  regions: string[];
}

interface LeafletMap {
  setView: (latlng: [number, number], zoom: number, options?: { animate: boolean }) => LeafletMap;
  fitBounds: (bounds: unknown, options?: { padding: [number, number]; animate: boolean }) => LeafletMap;
  remove: () => void;
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (content: string) => LeafletMarker;
  openPopup: () => LeafletMarker;
  remove: () => void;
  on: (event: string, handler: () => void) => LeafletMarker;
  getLatLng: () => { lat: number; lng: number };
}

interface LeafletLayerGroup {
  addTo: (map: LeafletMap) => LeafletLayerGroup;
  addLayer: (layer: LeafletMarker) => LeafletLayerGroup;
  removeLayer: (layer: LeafletMarker) => LeafletLayerGroup;
  clearLayers: () => LeafletLayerGroup;
  getLayers: () => LeafletMarker[];
  getBounds: () => unknown;
}

interface LeafletStatic {
  map: (el: HTMLElement) => LeafletMap;
  tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: LeafletMap) => void };
  marker: (latlng: [number, number]) => LeafletMarker;
  latLngBounds: (latlngs: [number, number][]) => unknown;
  layerGroup: () => LeafletLayerGroup;
}

declare global {
  interface Window {
    L: LeafletStatic;
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function StoresClient({ stores, topStores, regions }: Props) {
  const [mounted, setMounted] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedStore, setSelectedStore] = useState<WinningStore | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const layerGroupRef = useRef<LeafletLayerGroup | null>(null);
  // Map store index → marker for O(1) lookup
  const markerMapRef = useRef<Map<number, LeafletMarker>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize filtered stores to prevent unnecessary marker updates
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const matchRegion =
        selectedRegion === "전체" || s.region === selectedRegion;
      const matchSearch =
        !debouncedSearch ||
        s.name.includes(debouncedSearch) ||
        s.address.includes(debouncedSearch);
      return matchRegion && matchSearch;
    });
  }, [stores, selectedRegion, debouncedSearch]);

  // Also compute for instant list filtering (no debounce for list view)
  const listFilteredStores = useMemo(() => {
    return stores.filter((s) => {
      const matchRegion =
        selectedRegion === "전체" || s.region === selectedRegion;
      const matchSearch =
        !searchQuery ||
        s.name.includes(searchQuery) ||
        s.address.includes(searchQuery);
      return matchRegion && matchSearch;
    });
  }, [stores, selectedRegion, searchQuery]);

  // Create all markers once when map is ready, then show/hide based on filter
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !window.L) return;

    const L = window.L;
    const group = L.layerGroup().addTo(leafletMapRef.current);
    layerGroupRef.current = group;
    const markerMap = new Map<number, LeafletMarker>();

    stores.forEach((store, idx) => {
      const marker = L.marker([store.lat, store.lng]);
      marker.bindPopup(
        `<div style="font-size:13px;min-width:180px;line-height:1.5;">
          <strong>${escapeHtml(store.name)}</strong><br/>
          <span style="color:#666;font-size:12px;">${escapeHtml(store.address)}</span><br/>
          <span style="color:#2563eb;font-weight:600;">1등 당첨 ${store.totalWins}회</span>
        </div>`
      );
      marker.on("click", () => setSelectedStore(store));
      markerMap.set(idx, marker);
    });

    markerMapRef.current = markerMap;

    return () => {
      group.clearLayers();
    };
    // Only create markers once when map becomes ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // Show/hide markers based on filter — no DOM removal, just layer add/remove
  const prevFilterRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    const group = layerGroupRef.current;
    if (!group || !mapReady || !leafletMapRef.current) return;

    const filteredSet = new Set<number>();
    stores.forEach((store, idx) => {
      const matchRegion =
        selectedRegion === "전체" || store.region === selectedRegion;
      const matchSearch =
        !debouncedSearch ||
        store.name.includes(debouncedSearch) ||
        store.address.includes(debouncedSearch);
      if (matchRegion && matchSearch) filteredSet.add(idx);
    });

    const prevSet = prevFilterRef.current;

    // Remove markers no longer visible
    for (const idx of prevSet) {
      if (!filteredSet.has(idx)) {
        const marker = markerMapRef.current.get(idx);
        if (marker) group.removeLayer(marker);
      }
    }
    // Add newly visible markers
    for (const idx of filteredSet) {
      if (!prevSet.has(idx)) {
        const marker = markerMapRef.current.get(idx);
        if (marker) group.addLayer(marker);
      }
    }

    prevFilterRef.current = filteredSet;

    // Fit bounds only when region changes (not on search)
    if (filteredSet.size > 0) {
      const coords: [number, number][] = [];
      for (const idx of filteredSet) {
        coords.push([stores[idx].lat, stores[idx].lng]);
      }
      if (coords.length > 1) {
        leafletMapRef.current.fitBounds(
          window.L.latLngBounds(coords),
          { padding: [20, 20], animate: false }
        );
      } else if (coords.length === 1) {
        leafletMapRef.current.setView(coords[0], 15, { animate: false });
      }
    }
  }, [stores, selectedRegion, debouncedSearch, mapReady]);

  // Load Leaflet and initialize map
  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    const initMap = () => {
      if (!window.L || !mapRef.current) return;

      const L = window.L;
      const map = L.map(mapRef.current).setView([36.5, 127.8], 7);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
      setMapReady(true);
    };

    if (window.L) {
      initMap();
      return;
    }

    // Load Leaflet CSS + JS from jsdelivr
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mounted]);

  const handleStoreClick = useCallback((store: WinningStore) => {
    setSelectedStore(store);
    if (!leafletMapRef.current || !mapReady) return;

    leafletMapRef.current.setView([store.lat, store.lng], 15, { animate: false });

    // Find and open popup for this store
    const idx = stores.findIndex(
      (s) => s.name === store.name && s.address === store.address
    );
    const marker = markerMapRef.current.get(idx);
    if (marker) {
      // Ensure marker is on map
      const group = layerGroupRef.current;
      if (group) group.addLayer(marker);
      marker.openPopup();
    }

    setViewMode("map");
  }, [stores, mapReady]);

  if (!mounted) {
    return (
      <div className="bg-gray-100 rounded-2xl h-[500px] flex items-center justify-center">
        <p className="text-gray-500">지도를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="전체">전체 지역</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="판매점 이름 또는 주소 검색"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode("map")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "map"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            지도
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            목록
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        검색 결과: <strong>{listFilteredStores.length}곳</strong>
      </p>

      {/* Map View */}
      {viewMode === "map" && (
        <div
          ref={mapRef}
          className="w-full h-[500px] rounded-2xl border border-gray-200 shadow-sm z-0"
        />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {listFilteredStores.map((store, idx) => (
            <button
              key={`${store.name}-${idx}`}
              onClick={() => handleStoreClick(store)}
              className={`w-full text-left bg-white rounded-xl border p-4 hover:shadow-md transition-all ${
                selectedStore?.name === store.name &&
                selectedStore?.address === store.address
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {store.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{store.address}</p>
                </div>
                <span className="text-blue-600 font-bold text-sm whitespace-nowrap ml-3">
                  {store.totalWins}회 당첨
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Top Stores Ranking */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          🏆 전국 로또 명당 TOP 20
        </h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    순위
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    판매점
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    지역
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">
                    1등 당첨
                  </th>
                </tr>
              </thead>
              <tbody>
                {topStores.map((store, idx) => (
                  <tr
                    key={`${store.name}-${idx}`}
                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handleStoreClick(store)}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          idx < 3
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{store.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                        {store.address}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{store.region}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-blue-600 font-bold">
                        {store.totalWins}회
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Region Stats */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📍 지역별 명당 현황
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {regions.map((region) => {
            const regionStores = stores.filter((s) => s.region === region);
            const totalWins = regionStores.reduce(
              (sum, s) => sum + s.totalWins,
              0
            );
            return (
              <button
                key={region}
                onClick={() => {
                  setSelectedRegion(region);
                  setViewMode("map");
                }}
                className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md hover:border-blue-300 transition-all"
              >
                <p className="text-2xl font-bold text-blue-600">
                  {regionStores.length}
                </p>
                <p className="text-sm font-medium text-gray-900">{region}</p>
                <p className="text-xs text-gray-500">총 {totalWins}회 당첨</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
