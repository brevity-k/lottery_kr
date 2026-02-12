/**
 * Fetches all lotto 6/45 historical data from superkts.com
 * and saves it to src/data/lotto.json for build-time use.
 *
 * Run: npx tsx scripts/update-data.ts
 */

import * as fs from "fs";
import * as path from "path";
import type { LottoResult, LottoDataFile } from "../src/types/lottery";
import { DATA_PATH, BACKUP_PATH, LOTTO_FIRST_DRAW_DATE, validateDrawData, withRetry } from "./lib/shared";

const FETCH_TIMEOUT_MS = 30_000;
const FIRST_DRAW_DATE = new Date(LOTTO_FIRST_DRAW_DATE);

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

async function fetchRound(round: number): Promise<LottoResult | null> {
  try {
    const res = await withRetry(
      () => fetchWithTimeout(`https://superkts.com/lotto/${round}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      }),
      3,
      `Fetch round ${round}`
    );
    if (!res.ok) return null;
    const html = await res.text();

    // Parse from meta description:
    // "1205회 로또는 2026년 1월 3일에 추첨하였고 당첨번호는 1,4,16,23,31,41 보너스 2 입니다. 1등 당첨자는 10명이며 32억2638만6263원씩"
    const metaMatch = html.match(
      /name="description"\s+content="([^"]+)"/
    );
    if (!metaMatch) return null;

    const desc = metaMatch[1];

    // Extract date
    const dateMatch = desc.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if (!dateMatch) return null;
    const date = `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`;

    // Extract numbers
    const numMatch = desc.match(/당첨번호는\s*([\d,]+)\s*보너스\s*(\d+)/);
    if (!numMatch) return null;

    const numbers = numMatch[1].split(",").map(Number);
    const bonus = parseInt(numMatch[2]);

    if (numbers.length !== 6) return null;

    // Extract winners count
    const winnerMatch = desc.match(/1등\s*당첨자는\s*(\d+)명/);
    const winners = winnerMatch ? parseInt(winnerMatch[1]) : 0;

    // Extract prize amount from meta description (format: "이며 11억229만8407원씩")
    const prizeDescMatch = desc.match(/이며\s*(.+?)원씩/);
    let prize = prizeDescMatch ? parseKoreanAmount(prizeDescMatch[1] + "원") : 0;

    // Try to get exact prize from HTML body (format: "1,102,298,407원")
    // Only if we know there are winners, to avoid picking up 2nd prize amounts
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

async function findLatestRound(): Promise<number> {
  // Estimate current round from elapsed weeks since first draw
  const weeksSinceFirst = Math.floor(
    (Date.now() - FIRST_DRAW_DATE.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const estimated = weeksSinceFirst;

  // Check existing data for a known baseline (no hardcoded fallback — rely on estimation)
  let knownLatest = estimated;
  try {
    if (fs.existsSync(DATA_PATH)) {
      const existing = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
      if (existing.latestRound) knownLatest = Math.max(existing.latestRound, estimated);
    }
  } catch {
    // ignore — use estimated value
  }

  // Search forward from max of known and estimated, with buffer
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

  // Check existing data
  let existingData: LottoDataFile | null = null;
  let startRound = 1;

  try {
    const existing = fs.readFileSync(DATA_PATH, "utf-8");
    existingData = JSON.parse(existing) as LottoDataFile;

    // Check if prize data is missing (all firstWinamnt = 0) -> force full re-fetch
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
    lastUpdated: new Date().toISOString(),
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
