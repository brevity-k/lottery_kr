import fs from "fs";
import path from "path";
import type { StoreDataFile, WinningStore } from "@/types/store";

let cachedData: StoreDataFile | null = null;

function loadStoreData(): StoreDataFile {
  if (cachedData) return cachedData;
  const filePath = path.join(process.cwd(), "src/data/winning-stores.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  cachedData = JSON.parse(raw);
  return cachedData!;
}

export function getAllWinningStores(): WinningStore[] {
  return loadStoreData().stores;
}

export function getStoresByRegion(region: string): WinningStore[] {
  return getAllWinningStores().filter((s) => s.region === region);
}

export function getTopStores(count: number = 20): WinningStore[] {
  return getAllWinningStores()
    .sort((a, b) => b.totalWins - a.totalWins)
    .slice(0, count);
}

export function getRegions(): string[] {
  const regions = new Set(getAllWinningStores().map((s) => s.region));
  return Array.from(regions).sort();
}

export function getStoreDataLastUpdated(): string {
  return loadStoreData().lastUpdated;
}
