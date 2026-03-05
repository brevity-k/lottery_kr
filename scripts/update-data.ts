/**
 * Fetches all lotto 6/45 historical data and saves it to src/data/lotto.json.
 *
 * Primary source: smok95.github.io (static GitHub Pages JSON, reliable from CI)
 * Fallback source: superkts.com (HTML scraping)
 *
 * Run: npx tsx scripts/update-data.ts
 */

import * as fs from "fs";
import * as path from "path";
import type { LottoResult, LottoDataFile } from "../src/types/lottery";
import { DATA_PATH, BACKUP_PATH, LOTTO_FIRST_DRAW_DATE, validateDrawData, withRetry, getKSTDate } from "./lib/shared";

const FETCH_TIMEOUT_MS = 30_000;
const FIRST_DRAW_DATE = new Date(LOTTO_FIRST_DRAW_DATE);

// --- Data sources ---

const SMOK95_BASE = "https://smok95.github.io/lotto/results";
const SUPERKTS_BASE = "https://superkts.com/lotto";

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

function backupExistingData(): void {
  try {
    if (fs.existsSync(DATA_PATH)) {
      fs.copyFileSync(DATA_PATH, BACKUP_PATH);
      console.log(`📦 Backup created: ${BACKUP_PATH}`);
    }
  } catch (err) {
    console.warn(`⚠️ Failed to create backup: ${err}`);
  }
}

// --- smok95 source (primary) ---

interface Smok95Result {
  draw_no: number;
  numbers: number[];
  bonus_no: number;
  date: string;
  divisions?: { prize: number; winners: number }[];
  total_sales_amount?: number;
}

function smok95ToLottoResult(data: Smok95Result): LottoResult | null {
  if (!data.draw_no || !data.numbers || data.numbers.length !== 6 || !data.bonus_no) {
    return null;
  }
  const sorted = [...data.numbers].sort((a, b) => a - b);
  const date = data.date ? data.date.split("T")[0] : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const firstDiv = data.divisions?.[0];
  return {
    drwNo: data.draw_no,
    drwNoDate: date,
    drwtNo1: sorted[0],
    drwtNo2: sorted[1],
    drwtNo3: sorted[2],
    drwtNo4: sorted[3],
    drwtNo5: sorted[4],
    drwtNo6: sorted[5],
    bnusNo: data.bonus_no,
    firstWinamnt: firstDiv?.prize ?? 0,
    firstPrzwnerCo: firstDiv?.winners ?? 0,
    totSellamnt: data.total_sales_amount ?? 0,
    returnValue: "success",
  };
}

async function fetchRoundSmok95(round: number): Promise<LottoResult | null> {
  try {
    const res = await withRetry(
      () => fetchWithTimeout(`${SMOK95_BASE}/${round}.json`),
      3,
      `Fetch round ${round} (smok95)`
    );
    if (!res.ok) return null;
    const data: Smok95Result = await res.json();
    return smok95ToLottoResult(data);
  } catch {
    return null;
  }
}

// --- superkts source (fallback) ---

function parseKoreanAmount(text: string): number {
  let amount = 0;
  const eokMatch = text.match(/(\d+)억/);
  const manMatch = text.match(/억(\d+)만/);
  const wonMatch = text.match(/만(\d+)원/);
  const manOnlyMatch = !eokMatch ? text.match(/(\d+)만/) : null;
  const wonOnlyMatch = !eokMatch && !manOnlyMatch ? text.match(/(\d+)원/) : null;

  if (eokMatch) amount += parseInt(eokMatch[1]) * 100000000;
  if (manMatch) amount += parseInt(manMatch[1]) * 10000;
  if (manOnlyMatch) amount += parseInt(manOnlyMatch[1]) * 10000;
  if (wonMatch) amount += parseInt(wonMatch[1]);
  if (wonOnlyMatch) amount += parseInt(wonOnlyMatch[1]);

  return amount;
}

function parseCommaNumber(text: string): number {
  return parseInt(text.replace(/,/g, ""), 10) || 0;
}

async function fetchRoundSuperkts(round: number): Promise<LottoResult | null> {
  try {
    const res = await withRetry(
      () => fetchWithTimeout(`${SUPERKTS_BASE}/${round}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      }),
      2,
      `Fetch round ${round} (superkts)`
    );
    if (!res.ok) return null;
    const html = await res.text();

    const metaMatch = html.match(/name="description"\s+content="([^"]+)"/);
    if (!metaMatch) return null;

    const desc = metaMatch[1];

    const dateMatch = desc.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if (!dateMatch) return null;
    const date = `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`;

    const numMatch = desc.match(/당첨번호는\s*([\d,]+)\s*보너스\s*(\d+)/);
    if (!numMatch) return null;

    const numbers = numMatch[1].split(",").map(Number);
    const bonus = parseInt(numMatch[2]);

    if (numbers.length !== 6) return null;

    const winnerMatch = desc.match(/1등\s*당첨자는\s*(\d+)명/);
    const winners = winnerMatch ? parseInt(winnerMatch[1]) : 0;

    const prizeDescMatch = desc.match(/이며\s*(.+?)원씩/);
    let prize = prizeDescMatch ? parseKoreanAmount(prizeDescMatch[1] + "원") : 0;

    if (winners > 0) {
      const exactPrizeMatches = html.match(/([\d,]{10,})원/g);
      if (exactPrizeMatches) {
        const exactPrize = parseCommaNumber(exactPrizeMatches[0].replace("원", ""));
        if (exactPrize > 0) prize = exactPrize;
      }
    }

    return {
      drwNo: round,
      drwNoDate: date,
      drwtNo1: numbers[0],
      drwtNo2: numbers[1],
      drwtNo3: numbers[2],
      drwtNo4: numbers[3],
      drwtNo5: numbers[4],
      drwtNo6: numbers[5],
      bnusNo: bonus,
      firstWinamnt: prize,
      firstPrzwnerCo: winners,
      totSellamnt: 0,
      returnValue: "success",
    };
  } catch {
    return null;
  }
}

// --- Unified fetch with fallback ---

// Track consecutive superkts failures to avoid wasting time on a down source
let superktsFailCount = 0;
const SUPERKTS_MAX_FAILS = 3;

async function fetchRound(round: number): Promise<LottoResult | null> {
  // Try smok95 first (reliable from CI)
  const result = await fetchRoundSmok95(round);
  if (result) return result;

  // Fallback to superkts (skip if it's been consistently failing)
  if (superktsFailCount >= SUPERKTS_MAX_FAILS) return null;

  const fallback = await fetchRoundSuperkts(round);
  if (fallback) {
    superktsFailCount = 0;
    return fallback;
  }
  superktsFailCount++;
  return null;
}

async function findLatestRound(): Promise<number> {
  const kstNow = getKSTDate();
  const weeksSinceFirst = Math.floor(
    (kstNow.getTime() - FIRST_DRAW_DATE.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const estimated = weeksSinceFirst;

  let knownLatest = estimated;
  try {
    if (fs.existsSync(DATA_PATH)) {
      const existing = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
      if (existing.latestRound) knownLatest = Math.max(existing.latestRound, estimated);
    }
  } catch {
    // ignore — use estimated value
  }

  const searchStart = Math.max(knownLatest, estimated) + 5;
  for (let round = searchStart; round >= knownLatest; round--) {
    const result = await fetchRound(round);
    if (result) return round;
  }

  return knownLatest;
}

async function fetchAllData(): Promise<void> {
  console.log("🔍 Finding latest round...");
  const latestRound = await findLatestRound();
  console.log(`📌 Latest round: ${latestRound}`);

  let existingData: LottoDataFile | null = null;
  let startRound = 1;

  try {
    const existing = fs.readFileSync(DATA_PATH, "utf-8");
    existingData = JSON.parse(existing) as LottoDataFile;

    const hasPrizeData = existingData.draws.some((d) => d.firstWinamnt > 0);
    if (!hasPrizeData && existingData.draws.length > 0) {
      console.log("⚠️ Prize amount data is missing. Re-fetching all rounds...");
      existingData = null;
      startRound = 1;
    } else if (existingData.draws.length > 0 && existingData.latestRound >= latestRound) {
      console.log("✅ Data is already up to date!");
      return;
    } else {
      startRound = existingData.latestRound + 1;
      console.log(
        `📊 Existing data: ${existingData.draws.length} rounds (up to ${existingData.latestRound})`
      );
    }
  } catch {
    console.log(`📥 No existing data. Fetching all ${latestRound} rounds...`);
  }

  console.log(`📥 Fetching rounds ${startRound} to ${latestRound}...`);

  const newDraws: LottoResult[] = [];
  const batchSize = 10;

  for (let i = startRound; i <= latestRound; i += batchSize) {
    const end = Math.min(i + batchSize - 1, latestRound);
    const promises: Promise<LottoResult | null>[] = [];

    for (let j = i; j <= end; j++) {
      promises.push(fetchRound(j));
    }

    const results = await Promise.all(promises);
    const failedInBatch: number[] = [];
    for (let idx = 0; idx < results.length; idx++) {
      if (results[idx]) {
        newDraws.push(results[idx]!);
      } else {
        failedInBatch.push(i + idx);
      }
    }
    if (failedInBatch.length > 0) {
      console.warn(`\n  ⚠️ Failed to fetch rounds: ${failedInBatch.join(", ")}`);
    }

    const progress = Math.min(
      100,
      Math.round(
        ((end - startRound + 1) / (latestRound - startRound + 1)) * 100
      )
    );
    process.stdout.write(`\r  진행률: ${progress}% (${end}/${latestRound})`);

    // Small delay between batches to be polite
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("");

  const allDraws = existingData
    ? [...existingData.draws, ...newDraws]
    : newDraws;

  allDraws.sort((a, b) => b.drwNo - a.drwNo);

  // Validate data using shared validation before writing
  console.log("\n🔍 Validating data...");
  const validation = validateDrawData(allDraws);
  if (!validation.valid) {
    console.error("❌ Data validation failed:");
    for (const err of validation.errors) {
      console.error(`   - ${err}`);
    }
    process.exit(1);
  }
  console.log("✅ Data validation passed");

  // Backup existing data before overwrite
  backupExistingData();

  const output: LottoDataFile = {
    lottery: "lotto645",
    lastUpdated: getKSTDate().toISOString(),
    latestRound,
    draws: allDraws,
  };

  // Ensure output directory exists
  const outputDir = path.dirname(DATA_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(output));

  const fileSizeKB = Math.round(fs.statSync(DATA_PATH).size / 1024);
  console.log(
    `✅ Saved ${allDraws.length} rounds to ${DATA_PATH} (${fileSizeKB}KB)`
  );
}

fetchAllData().catch((err) => {
  // If existing data is available, don't block the build
  if (fs.existsSync(DATA_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")) as LottoDataFile;
      if (existing.draws && existing.draws.length > 0) {
        console.warn(`\n⚠️ Data update failed: ${err}`);
        console.warn(`   Using existing data (${existing.draws.length} rounds, latest: ${existing.latestRound})`);
        process.exit(0); // Don't block build
      }
    } catch {
      // Primary file is also broken — try backup
    }
  }
  // Last resort: attempt backup restoration
  if (fs.existsSync(BACKUP_PATH)) {
    try {
      const backup = JSON.parse(fs.readFileSync(BACKUP_PATH, "utf-8")) as LottoDataFile;
      if (backup.draws && backup.draws.length > 0) {
        fs.copyFileSync(BACKUP_PATH, DATA_PATH);
        console.warn(`\n⚠️ Data update failed: ${err}`);
        console.warn(`   Restored from backup (${backup.draws.length} rounds, latest: ${backup.latestRound})`);
        process.exit(0);
      }
    } catch {
      // Backup is also broken
    }
  }
  console.error(`\n❌ Data update failed and no existing/backup data available: ${err}`);
  process.exit(1);
});
