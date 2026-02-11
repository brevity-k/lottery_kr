import { LottoResult } from "@/types/lottery";
import fs from "fs";
import path from "path";

interface LottoDataFile {
  lottery: string;
  lastUpdated: string;
  latestRound: number;
  draws: LottoResult[];
}

let cachedData: LottoDataFile | null = null;

function loadLottoData(): LottoDataFile {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), "src/data/lotto.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  cachedData = JSON.parse(raw) as LottoDataFile;
  return cachedData;
}

export function getLatestRound(): number {
  return loadLottoData().latestRound;
}

export function getLottoResult(round: number): LottoResult | null {
  const data = loadLottoData();
  return data.draws.find((d) => d.drwNo === round) ?? null;
}

export function getRecentResults(count: number = 10): LottoResult[] {
  const data = loadLottoData();
  return data.draws.slice(0, count);
}

export function getMultipleResults(
  startRound: number,
  endRound: number
): LottoResult[] {
  const data = loadLottoData();
  return data.draws.filter(
    (d) => d.drwNo >= startRound && d.drwNo <= endRound
  );
}

export function getAllResults(): LottoResult[] {
  return loadLottoData().draws;
}
