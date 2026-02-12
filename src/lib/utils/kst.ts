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
