/**
 * KST (Korean Standard Time, UTC+9) utilities.
 * Used by countdown timers and daily-changing features.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function getKSTDate(): Date {
  const now = new Date();
  return new Date(
    now.getTime() + KST_OFFSET_MS + now.getTimezoneOffset() * 60 * 1000
  );
}

/**
 * Calculate the Saturday draw date for a given round number.
 * Round 1 was 2002-12-07 (Saturday). Each subsequent round is 7 days later.
 */
export function getDrawDateForRound(round: number): Date {
  // Round 1: 2002-12-07 00:00 KST = 2002-12-06T15:00:00Z
  const FIRST_DRAW_UTC_MS = Date.UTC(2002, 11, 6, 15, 0, 0);
  const drawUTCMs = FIRST_DRAW_UTC_MS + (round - 1) * 7 * 24 * 60 * 60 * 1000;
  // Apply same fake-KST transform as getKSTDate() so comparisons with kstNow work correctly
  const d = new Date(drawUTCMs);
  return new Date(drawUTCMs + KST_OFFSET_MS + d.getTimezoneOffset() * 60 * 1000);
}
