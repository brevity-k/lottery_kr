import { LottoResult, LottoDataFile } from "@/types/lottery";
import { DEFAULT_RECENT_RESULTS } from "@/lib/constants";
import fs from "fs";
import path from "path";

let cachedData: LottoDataFile | null = null;

function loadLottoData(): LottoDataFile {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), "src/data/lotto.json");
  const backupPath = path.join(process.cwd(), "src/data/lotto.json.bak");

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw || raw.trim() === "") {
      throw new Error("Data file is empty");
    }
    const data = JSON.parse(raw) as LottoDataFile;

    if (!data.draws || data.draws.length === 0) {
      throw new Error("Invalid data: no draws found");
    }

    cachedData = data;
    return cachedData;
  } catch (primaryErr) {
    console.error(`Failed to load lotto.json: ${primaryErr}`);

    // Attempt backup recovery
    try {
      if (fs.existsSync(backupPath)) {
        console.warn("Attempting to load from backup lotto.json.bak...");
        const raw = fs.readFileSync(backupPath, "utf-8");
        const data = JSON.parse(raw) as LottoDataFile;

        if (!data.draws || data.draws.length === 0) {
          throw new Error("Invalid backup: no draws found");
        }

        cachedData = data;
        return cachedData;
      }
    } catch (backupErr) {
      console.error(`Backup recovery also failed: ${backupErr}`);
    }

    throw new Error(
      "Failed to load lottery data from both primary and backup files"
    );
  }
}

export function getLatestRound(): number {
  return loadLottoData().latestRound;
}

export function getLottoResult(round: number): LottoResult | null {
  const data = loadLottoData();
  return data.draws.find((d) => d.drwNo === round) ?? null;
}

export function getRecentResults(count: number = DEFAULT_RECENT_RESULTS): LottoResult[] {
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
