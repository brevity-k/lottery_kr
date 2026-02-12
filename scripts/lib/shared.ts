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
 * Mirrors src/lib/constants.ts to avoid hardcoded magic numbers in scripts.
 */
export const LOTTO_MIN = 1;
export const LOTTO_MAX = 45;
export const LOTTO_PER_SET = 6;
export const LOTTO_SECTIONS: readonly [number, number][] = [
  [1, 9], [10, 18], [19, 27], [28, 36], [37, 45],
];
export const LOTTO_FIRST_DRAW_DATE = "2002-12-07";

/**
 * Generic retry wrapper with exponential backoff.
 * Retries up to `maxRetries` times with delays of 1s, 2s, 4s, etc.
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
        const delay = Math.pow(2, attempt - 1) * 1000;
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
      if (n < LOTTO_MIN || n > LOTTO_MAX) {
        errors.push(`Round ${draw.drwNo}: number ${n} out of range ${LOTTO_MIN}-${LOTTO_MAX}`);
      }
    }

    if (draw.bnusNo < LOTTO_MIN || draw.bnusNo > LOTTO_MAX) {
      errors.push(`Round ${draw.drwNo}: bonus ${draw.bnusNo} out of range ${LOTTO_MIN}-${LOTTO_MAX}`);
    }

    if (new Set(nums).size !== LOTTO_PER_SET) {
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
