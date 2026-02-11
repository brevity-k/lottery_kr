/**
 * Fetches all lotto 6/45 historical data from superkts.com
 * and saves it to src/data/lotto.json for build-time use.
 *
 * Run: npx tsx scripts/update-data.ts
 */

import * as fs from "fs";

interface LottoResult {
  drwNo: number;
  drwNoDate: string;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
  firstWinamnt: number;
  firstPrzwnerCo: number;
  totSellamnt: number;
  returnValue: string;
}

interface LottoDataFile {
  lottery: string;
  lastUpdated: string;
  latestRound: number;
  draws: LottoResult[];
}

const OUTPUT_PATH = "./src/data/lotto.json";

function parseKoreanAmount(text: string): number {
  let amount = 0;
  const eokMatch = text.match(/(\d+)억/);
  const manMatch = text.match(/억\s*(\d+)만/);
  const manOnlyMatch = !eokMatch ? text.match(/(\d+)만/) : null;

  if (eokMatch) amount += parseInt(eokMatch[1]) * 100000000;
  if (manMatch) amount += parseInt(manMatch[1]) * 10000;
  if (manOnlyMatch) amount += parseInt(manOnlyMatch[1]) * 10000;

  return amount;
}

async function fetchRound(round: number): Promise<LottoResult | null> {
  try {
    const res = await fetch(`https://superkts.com/lotto/${round}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
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

    // Extract prize amount
    const prizeMatch = desc.match(/(\d+억[\d만원씩]+|[\d만원씩]+)/);
    const prize = prizeMatch ? parseKoreanAmount(prizeMatch[1]) : 0;

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
  // Try recent rounds to find the latest
  for (let round = 1220; round >= 1200; round--) {
    const result = await fetchRound(round);
    if (result) return round;
  }
  return 1210;
}

async function fetchAllData(): Promise<void> {
  console.log("🔍 Finding latest round...");
  const latestRound = await findLatestRound();
  console.log(`📌 Latest round: ${latestRound}`);

  // Check existing data
  let existingData: LottoDataFile | null = null;
  let startRound = 1;

  try {
    const existing = fs.readFileSync(OUTPUT_PATH, "utf-8");
    existingData = JSON.parse(existing) as LottoDataFile;
    if (existingData.draws.length > 0 && existingData.latestRound >= latestRound) {
      console.log("✅ Data is already up to date!");
      return;
    }
    startRound = existingData.latestRound + 1;
    console.log(
      `📊 Existing data: ${existingData.draws.length} rounds (up to ${existingData.latestRound})`
    );
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
    for (const r of results) {
      if (r) newDraws.push(r);
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

  const output: LottoDataFile = {
    lottery: "lotto645",
    lastUpdated: new Date().toISOString(),
    latestRound,
    draws: allDraws,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output));

  const fileSizeKB = Math.round(fs.statSync(OUTPUT_PATH).size / 1024);
  console.log(
    `✅ Saved ${allDraws.length} rounds to ${OUTPUT_PATH} (${fileSizeKB}KB)`
  );
}

fetchAllData().catch(console.error);
