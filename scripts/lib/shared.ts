/**
 * Shared utilities for automation scripts.
 * Centralizes retry logic, validation, paths, and common helpers
 * to eliminate duplication across scripts.
 */

import * as fs from "fs";
import * as path from "path";
import type { LottoResult, LottoDataFile } from "../../src/types/lottery";

/** Centralized file paths — single source of truth for all scripts. */
export const DATA_PATH = path.join(process.cwd(), "src/data/lotto.json");
export const BACKUP_PATH = path.join(process.cwd(), "src/data/lotto.json.bak");
export const BLOG_DIR = path.join(process.cwd(), "content/blog");
export const TOPICS_PATH = path.join(process.cwd(), "scripts/blog-topics.json");

/**
 * Lottery constants re-exported for scripts that can't use @/ alias.
 * Uses the same names as src/lib/constants.ts — single naming convention
 * across the entire codebase.
 */
export const LOTTO_MIN_NUMBER = 1;
export const LOTTO_MAX_NUMBER = 45;
export const LOTTO_NUMBERS_PER_SET = 6;
export const LOTTO_SECTIONS: readonly [number, number][] = [
  [1, 9], [10, 18], [19, 27], [28, 36], [37, 45],
];
export const LOTTO_FIRST_DRAW_DATE = "2002-12-07";

/**
 * KST (Korean Standard Time, UTC+9) utilities for scripts.
 * Mirrors src/lib/utils/kst.ts — scripts can't use @/ alias.
 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function getKSTDate(): Date {
  const now = new Date();
  return new Date(now.getTime() + KST_OFFSET_MS + now.getTimezoneOffset() * 60 * 1000);
}

/** Formats a KST Date as YYYY-MM-DD string. */
export function formatKSTDate(d: Date = getKSTDate()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Maximum backoff delay (30s) to prevent extreme waits with high retry counts. */
const MAX_BACKOFF_MS = 30_000;

/** Default timeout for external API calls (2 minutes). */
const DEFAULT_API_TIMEOUT_MS = 120_000;

/**
 * Generic retry wrapper with exponential backoff (capped at 30s).
 * Retries up to `maxRetries` times with delays of 1s, 2s, 4s, … (max 30s).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  label = "Operation"
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt < maxRetries) {
        const delay = Math.min(Math.pow(2, attempt - 1) * 1000, MAX_BACKOFF_MS);
        console.warn(
          `⚠️ ${label} failed, retrying in ${delay / 1000}s... (attempt ${attempt}/${maxRetries}): ${err}`
        );
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error(`${label}: exhausted all retries`);
}

/**
 * Wraps a promise with a timeout. Rejects if the operation doesn't
 * complete within `timeoutMs` milliseconds.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = DEFAULT_API_TIMEOUT_MS,
  label = "Operation"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Ensures a directory exists, creating it recursively if needed.
 * Exits with code 1 on failure to prevent silent write errors.
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (err) {
      console.error(`❌ Failed to create directory ${dirPath}: ${err}`);
      process.exit(1);
    }
  }
}

/**
 * Builds a lottery context string from recent draws for AI prompts.
 * Shared between generate-blog-post.ts and generate-prediction.ts.
 */
export function buildLotteryContext(data: LottoDataFile, recentCount = 10): string {
  const recent = data.draws.slice(0, recentCount);
  const lines = recent.map((d) => {
    const nums = getDrawNumbers(d);
    return `${d.drwNo}회 (${d.drwNoDate}): ${nums.join(", ")} + 보너스 ${d.bnusNo}`;
  });
  return `최근 ${recentCount}회차 당첨번호:\n${lines.join("\n")}`;
}

/**
 * Builds an enriched context string with statistics, records, and patterns.
 * Used for in-depth blog posts that need real data to cite.
 */
export function buildEnrichedContext(data: LottoDataFile): string {
  const draws = data.draws;
  const totalDraws = draws.length;
  const latest = draws[0];

  // --- Number frequency ---
  const freq: Record<number, number> = {};
  for (let i = 1; i <= LOTTO_MAX_NUMBER; i++) freq[i] = 0;
  draws.forEach((d) => getDrawNumbers(d).forEach((n) => freq[n]++));
  const freqArr = Object.entries(freq)
    .map(([n, c]) => ({ num: Number(n), count: c }))
    .sort((a, b) => b.count - a.count);
  const top5 = freqArr.slice(0, 5);
  const bottom5 = freqArr.slice(-5).reverse();
  const expectedCount = Math.round((totalDraws * 6) / 45 * 10) / 10;

  // --- Jackpot records ---
  const withWinners = draws.filter((d) => d.firstPrzwnerCo > 0 && d.firstWinamnt > 0);
  const byPrize = [...withWinners].sort((a, b) => b.firstWinamnt - a.firstWinamnt).slice(0, 5);
  const fewestWinners = [...withWinners].sort((a, b) => a.firstPrzwnerCo - b.firstPrzwnerCo).slice(0, 5);
  const mostWinners = [...withWinners].sort((a, b) => b.firstPrzwnerCo - a.firstPrzwnerCo).slice(0, 5);

  // --- Patterns ---
  let below31Count = 0;
  let oddEven33 = 0;
  let consecutivePairs = 0;
  draws.forEach((d) => {
    const nums = getDrawNumbers(d);
    if (nums.every((n) => n <= 31)) below31Count++;
    const oddCount = nums.filter((n) => n % 2 === 1).length;
    if (oddCount === 3) oddEven33++;
    for (let i = 0; i < nums.length - 1; i++) {
      if (nums[i + 1] - nums[i] === 1) { consecutivePairs++; break; }
    }
  });

  // --- Recent 10 draws ---
  const recentLines = draws.slice(0, 10).map((d) => {
    const nums = getDrawNumbers(d);
    const prize = d.firstWinamnt > 0 ? `1등 ${d.firstPrzwnerCo}명, 1인당 ${formatKoreanAmount(d.firstWinamnt)}` : "1등 없음";
    return `${d.drwNo}회 (${d.drwNoDate}): ${nums.join(", ")} + 보너스 ${d.bnusNo} — ${prize}`;
  });

  return `=== 로또 6/45 통계 (총 ${totalDraws}회, 제1회~제${latest.drwNo}회) ===

최근 10회차:
${recentLines.join("\n")}

번호별 출현 빈도 (기대치: ${expectedCount}회):
- 최다: ${top5.map((x) => `${x.num}번(${x.count}회)`).join(", ")}
- 최소: ${bottom5.map((x) => `${x.num}번(${x.count}회)`).join(", ")}

역대 1인당 최고 당첨금 TOP 5:
${byPrize.map((d) => `- ${d.drwNo}회: ${formatKoreanAmount(d.firstWinamnt)} (${d.firstPrzwnerCo}명, ${d.drwNoDate})`).join("\n")}

역대 최다 1등 당첨자:
${mostWinners.map((d) => `- ${d.drwNo}회: ${d.firstPrzwnerCo}명, 1인당 ${formatKoreanAmount(d.firstWinamnt)} (번호: ${getDrawNumbers(d).join(", ")})`).join("\n")}

역대 최소 1등 당첨자 (1명 독식):
${fewestWinners.map((d) => `- ${d.drwNo}회: ${formatKoreanAmount(d.firstWinamnt)} 독식 (${d.drwNoDate})`).join("\n")}

패턴 통계:
- 6개 번호 모두 31 이하: ${below31Count}/${totalDraws}회 (${(below31Count / totalDraws * 100).toFixed(1)}%)
- 홀짝 3:3 비율: ${oddEven33}/${totalDraws}회 (${(oddEven33 / totalDraws * 100).toFixed(1)}%)
- 연속번호 포함: ${consecutivePairs}/${totalDraws}회 (${(consecutivePairs / totalDraws * 100).toFixed(1)}%)
- 1등 확률: 1/8,145,060`;
}

/** Formats a number into Korean 억/만 notation. */
function formatKoreanAmount(amount: number): string {
  if (amount >= 100_000_000) {
    const eok = Math.floor(amount / 100_000_000);
    const man = Math.floor((amount % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (amount >= 10_000) {
    return `${Math.floor(amount / 10_000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

/** Blog content validation thresholds. */
const MIN_BLOG_CONTENT_LENGTH = 800;
const AI_DISCLAIMER_MARKERS = ["AI 분석 도구", "AI가"];

/**
 * Validates generated blog content before publication.
 * Returns an array of warning messages (empty = valid).
 */
export function validateBlogContent(content: string): string[] {
  const warnings: string[] = [];

  if (content.length < MIN_BLOG_CONTENT_LENGTH) {
    warnings.push(`Content too short (${content.length} chars, minimum ${MIN_BLOG_CONTENT_LENGTH})`);
  }

  if (!AI_DISCLAIMER_MARKERS.some((m) => content.includes(m))) {
    warnings.push("Missing AI disclaimer");
  }

  if (!content.includes("##")) {
    warnings.push("No markdown headings found");
  }

  // Verify content looks like markdown (not HTML or plain text)
  const hasMarkdownStructure =
    content.includes("##") || content.includes("**") || content.includes("- ");
  if (!hasMarkdownStructure) {
    warnings.push("Content does not appear to be formatted as markdown");
  }

  return warnings;
}

/**
 * Validates lottery draw data integrity.
 * Shared between update-data.ts (pre-write validation)
 * and health-check.ts (periodic integrity check).
 */
export function validateDrawData(
  draws: LottoResult[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (draws.length === 0) {
    errors.push("No draws found");
    return { valid: false, errors };
  }

  for (const draw of draws) {
    const nums = getDrawNumbers(draw);

    for (const n of nums) {
      if (n < LOTTO_MIN_NUMBER || n > LOTTO_MAX_NUMBER) {
        errors.push(`Round ${draw.drwNo}: number ${n} out of range ${LOTTO_MIN_NUMBER}-${LOTTO_MAX_NUMBER}`);
      }
    }

    if (draw.bnusNo < LOTTO_MIN_NUMBER || draw.bnusNo > LOTTO_MAX_NUMBER) {
      errors.push(`Round ${draw.drwNo}: bonus ${draw.bnusNo} out of range ${LOTTO_MIN_NUMBER}-${LOTTO_MAX_NUMBER}`);
    }

    if (new Set(nums).size !== LOTTO_NUMBERS_PER_SET) {
      errors.push(`Round ${draw.drwNo}: duplicate numbers found in ${nums.join(",")}`);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(draw.drwNoDate)) {
      errors.push(`Round ${draw.drwNo}: invalid date format "${draw.drwNoDate}"`);
    }
  }

  // Check sequential round numbers
  const sorted = [...draws].sort((a, b) => a.drwNo - b.drwNo);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].drwNo !== sorted[i - 1].drwNo + 1) {
      errors.push(`Missing round(s) between ${sorted[i - 1].drwNo} and ${sorted[i].drwNo}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Extracts the 6 main numbers from a LottoResult as an array.
 */
export function getDrawNumbers(draw: LottoResult): number[] {
  return [
    draw.drwtNo1,
    draw.drwtNo2,
    draw.drwtNo3,
    draw.drwtNo4,
    draw.drwtNo5,
    draw.drwtNo6,
  ];
}

/**
 * Loads and parses lotto.json with backup fallback.
 * Mirrors the resilience pattern of src/lib/api/dhlottery.ts.
 */
export function loadLottoData(): LottoDataFile {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    if (!raw || raw.trim() === "") {
      throw new Error("Data file is empty");
    }
    const data = JSON.parse(raw) as LottoDataFile;
    if (!data.draws || data.draws.length === 0) {
      throw new Error("Invalid data: no draws found");
    }
    return data;
  } catch (primaryErr) {
    console.error(`Failed to load ${DATA_PATH}: ${primaryErr}`);
    try {
      if (fs.existsSync(BACKUP_PATH)) {
        console.warn(`Attempting to load from backup ${BACKUP_PATH}...`);
        const raw = fs.readFileSync(BACKUP_PATH, "utf-8");
        const data = JSON.parse(raw) as LottoDataFile;
        if (!data.draws || data.draws.length === 0) {
          throw new Error("Invalid backup: no draws found");
        }
        return data;
      }
    } catch (backupErr) {
      console.error(`Backup recovery also failed: ${backupErr}`);
    }
    throw new Error("Failed to load lottery data from both primary and backup files");
  }
}
