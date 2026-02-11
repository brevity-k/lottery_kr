import { LottoResult, LottoStats, NumberFrequency } from "@/types/lottery";

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
