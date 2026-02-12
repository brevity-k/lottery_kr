import { LottoResult, LottoStats, NumberFrequency, NumberDetail } from "@/types/lottery";

function getNumbers(result: LottoResult): number[] {
  return [
    result.drwtNo1,
    result.drwtNo2,
    result.drwtNo3,
    result.drwtNo4,
    result.drwtNo5,
    result.drwtNo6,
  ];
}

export function calculateFrequencies(
  results: LottoResult[]
): NumberFrequency[] {
  const counts = new Map<number, number>();
  for (let i = 1; i <= 45; i++) counts.set(i, 0);

  for (const result of results) {
    for (const num of getNumbers(result)) {
      counts.set(num, (counts.get(num) || 0) + 1);
    }
  }

  const total = results.length;
  return Array.from(counts.entries())
    .map(([number, count]) => ({
      number,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0,
    }))
    .sort((a, b) => a.number - b.number);
}

export function calculateStats(
  allResults: LottoResult[],
  recentCount: number = 20
): LottoStats {
  const frequencies = calculateFrequencies(allResults);
  const recentResults = allResults.slice(0, recentCount);
  const recentFrequencies = calculateFrequencies(recentResults);

  let totalOdd = 0;
  let totalEven = 0;
  let totalHigh = 0;
  let totalLow = 0;

  for (const result of allResults) {
    for (const num of getNumbers(result)) {
      if (num % 2 === 1) totalOdd++;
      else totalEven++;
      if (num > 22) totalHigh++;
      else totalLow++;
    }
  }

  const sortedByCount = [...frequencies].sort((a, b) => b.count - a.count);
  const recentSorted = [...recentFrequencies].sort(
    (a, b) => b.count - a.count
  );

  return {
    totalDraws: allResults.length,
    frequencies,
    recentFrequencies,
    oddEvenRatio: { odd: totalOdd, even: totalEven },
    highLowRatio: { high: totalHigh, low: totalLow },
    mostCommon: sortedByCount.slice(0, 6).map((f) => f.number),
    leastCommon: sortedByCount.slice(-6).map((f) => f.number),
    hottestNumbers: recentSorted.slice(0, 6).map((f) => f.number),
    coldestNumbers: recentSorted.slice(-6).map((f) => f.number),
  };
}

export function getNumberDetail(num: number, results: LottoResult[]): NumberDetail {
  // Results are sorted by drwNo descending (newest first)
  let totalAppearances = 0;
  let bonusAppearances = 0;
  const appearedRounds: number[] = [];

  for (const result of results) {
    if (getNumbers(result).includes(num)) {
      totalAppearances++;
      appearedRounds.push(result.drwNo);
    }
    if (result.bnusNo === num) {
      bonusAppearances++;
    }
  }

  const totalDraws = results.length;
  const frequencyPercent = totalDraws > 0
    ? Math.round((totalAppearances / totalDraws) * 100 * 10) / 10
    : 0;

  // Sort rounds ascending for gap calculations
  const sortedRounds = [...appearedRounds].sort((a, b) => a - b);
  const latestRound = results.length > 0 ? results[0].drwNo : 0;
  const lastAppearedRound = sortedRounds.length > 0 ? sortedRounds[sortedRounds.length - 1] : 0;
  const currentGap = latestRound - lastAppearedRound;

  // Calculate gaps between consecutive appearances
  let maxGap = 0;
  let totalGap = 0;
  for (let i = 1; i < sortedRounds.length; i++) {
    const gap = sortedRounds[i] - sortedRounds[i - 1];
    if (gap > maxGap) maxGap = gap;
    totalGap += gap;
  }
  if (currentGap > maxGap) maxGap = currentGap;

  const avgGap = sortedRounds.length > 1
    ? Math.round((totalGap / (sortedRounds.length - 1)) * 10) / 10
    : 0;

  // Recent rounds (up to 10, sorted by drwNo descending)
  const recentRounds = appearedRounds.slice(0, 10);

  return {
    number: num,
    totalAppearances,
    frequencyPercent,
    bonusAppearances,
    lastAppearedRound,
    currentGap,
    maxGap,
    avgGap,
    recentRounds,
  };
}
