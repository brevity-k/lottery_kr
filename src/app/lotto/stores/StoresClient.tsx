"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { WinningStore } from "@/types/store";

interface Props {
  stores: WinningStore[];
  topStores: WinningStore[];
  regions: string[];
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level: number }
        ) => KakaoMap;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: { position: unknown; map?: KakaoMap }) => KakaoMarker;
        InfoWindow: new (options: {
          content: string;
          removable?: boolean;
        }) => KakaoInfoWindow;
        LatLngBounds: new () => KakaoLatLngBounds;
        event: {
          addListener: (
            target: unknown,
            type: string,
            handler: () => void
          ) => void;
        };
      };
    };
  }
}

interface KakaoMap {
  setCenter: (latlng: unknown) => void;
  setLevel: (level: number) => void;
  setBounds: (bounds: KakaoLatLngBounds) => void;
}

interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void;
}

interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void;
  close: () => void;
}

interface KakaoLatLngBounds {
  extend: (latlng: unknown) => void;
}

export default function StoresClient({ stores, topStores, regions }: Props) {
  const [mounted, setMounted] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<WinningStore | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const infoWindowRef = useRef<KakaoInfoWindow | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredStores = stores.filter((s) => {
    const matchRegion =
      selectedRegion === "전체" || s.region === selectedRegion;
    const matchSearch =
      !searchQuery ||
      s.name.includes(searchQuery) ||
      s.address.includes(searchQuery);
    return matchRegion && matchSearch;
  });

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }
  }, []);

  const addMarkers = useCallback(
    (map: KakaoMap, storesToMark: WinningStore[]) => {
      clearMarkers();

      if (storesToMark.length === 0) return;

      const bounds = new window.kakao.maps.LatLngBounds();

      storesToMark.forEach((store) => {
        const position = new window.kakao.maps.LatLng(store.lat, store.lng);
        const marker = new window.kakao.maps.Marker({ position, map });

        bounds.extend(position);

        window.kakao.maps.event.addListener(marker, "click", () => {
          if (infoWindowRef.current) infoWindowRef.current.close();

          const infoWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:8px 12px;font-size:13px;min-width:180px;line-height:1.5;">
              <strong>${escapeHtml(store.name)}</strong><br/>
              <span style="color:#666;font-size:12px;">${escapeHtml(store.address)}</span><br/>
              <span style="color:#2563eb;font-weight:600;">1등 당첨 ${store.totalWins}회</span>
            </div>`,
            removable: true,
          });

          infoWindow.open(map, marker);
          infoWindowRef.current = infoWindow;
          setSelectedStore(store);
        });

        markersRef.current.push(marker);
      });

      if (storesToMark.length > 1) {
        map.setBounds(bounds);
      } else {
        map.setCenter(
          new window.kakao.maps.LatLng(
            storesToMark[0].lat,
            storesToMark[0].lng
          )
        );
        map.setLevel(5);
      }
    },
    [clearMarkers]
  );

  // Initialize map
  useEffect(() => {
    if (!mounted || !mapRef.current) return;
    if (typeof window === "undefined" || !window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      if (!mapRef.current) return;

      const center = new window.kakao.maps.LatLng(36.5, 127.8);
      const map = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 13,
      });

      kakaoMapRef.current = map;
      setMapReady(true);
    });
  }, [mounted]);

  // Update markers when filter changes
  useEffect(() => {
    if (!mapReady || !kakaoMapRef.current) return;
    addMarkers(kakaoMapRef.current, filteredStores);
  }, [mapReady, filteredStores, addMarkers]);

  const handleStoreClick = (store: WinningStore) => {
    setSelectedStore(store);
    if (kakaoMapRef.current && mapReady) {
      const position = new window.kakao.maps.LatLng(store.lat, store.lng);
      kakaoMapRef.current.setCenter(position);
      kakaoMapRef.current.setLevel(4);

      if (infoWindowRef.current) infoWindowRef.current.close();

      const marker = markersRef.current.find((_, idx) => {
        const s = filteredStores[idx];
        return s && s.name === store.name && s.address === store.address;
      });

      if (marker) {
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:8px 12px;font-size:13px;min-width:180px;line-height:1.5;">
            <strong>${escapeHtml(store.name)}</strong><br/>
            <span style="color:#666;font-size:12px;">${escapeHtml(store.address)}</span><br/>
            <span style="color:#2563eb;font-weight:600;">1등 당첨 ${store.totalWins}회</span>
          </div>`,
          removable: true,
        });
        infoWindow.open(kakaoMapRef.current, marker);
        infoWindowRef.current = infoWindow;
      }
    }
    setViewMode("map");
  };

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
        검색 결과: <strong>{filteredStores.length}곳</strong>
      </p>

      {/* Map View */}
      {viewMode === "map" && (
        <div
          ref={mapRef}
          className="w-full h-[500px] rounded-2xl border border-gray-200 shadow-sm"
        />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredStores.map((store, idx) => (
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
