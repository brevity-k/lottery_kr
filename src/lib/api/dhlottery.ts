import { LottoResult } from "@/types/lottery";

const BASE_URL = "https://www.dhlottery.co.kr/common.do";

export async function fetchLottoResult(
  round: number
): Promise<LottoResult | null> {
  try {
    const res = await fetch(
      `${BASE_URL}?method=getLottoNumber&drwNo=${round}`,
      { next: { revalidate: 3600 } }
    );
    const data: LottoResult = await res.json();
    if (data.returnValue === "fail") return null;
    return data;
  } catch {
    return null;
  }
}

export async function fetchLatestLottoRound(): Promise<number> {
  const now = new Date();
  const start = new Date("2002-12-07");
  const diffWeeks = Math.floor(
    (now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  let round = diffWeeks + 1;

  const result = await fetchLottoResult(round);
  if (result) return round;

  round -= 1;
  const prev = await fetchLottoResult(round);
  if (prev) return round;

  return round - 1;
}

export async function fetchMultipleLottoResults(
  startRound: number,
  endRound: number
): Promise<LottoResult[]> {
  const results: LottoResult[] = [];
  const promises: Promise<LottoResult | null>[] = [];

  for (let i = startRound; i <= endRound; i++) {
    promises.push(fetchLottoResult(i));
  }

  const settled = await Promise.all(promises);
  for (const r of settled) {
    if (r) results.push(r);
  }

  return results.sort((a, b) => b.drwNo - a.drwNo);
}

export async function fetchRecentResults(
  count: number = 10
): Promise<LottoResult[]> {
  const latest = await fetchLatestLottoRound();
  const start = Math.max(1, latest - count + 1);
  return fetchMultipleLottoResults(start, latest);
}
