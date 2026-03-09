import type { LottoResult, BacktestResult } from "@/types/lottery";
import { checkWinTier, getPrizeAmount } from "@/lib/lottery/simulator";
import { getDrawNumbers } from "@/lib/lottery/stats";

export interface BacktestSummary {
  totalDraws: number;
  results: BacktestResult[];        // 3+ matches, sorted by matchCount desc
  tierCounts: Record<number, number>; // tier -> count (1-5)
  totalPrize: number;
  totalCost: number;                 // totalDraws * 1000
  netProfit: number;
  bestMatch: BacktestResult | null;  // highest matchCount (closest near-miss)
  matchThreeOrMore: number;
}

const TICKET_COST = 1000;

export function runBacktest(
  numbers: number[],
  allResults: LottoResult[]
): BacktestSummary {
  const results: BacktestResult[] = [];
  let totalPrize = 0;
  const tierCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let bestMatch: BacktestResult | null = null;

  for (const draw of allResults) {
    const drawNums = getDrawNumbers(draw);
    const matched = numbers.filter((n) => drawNums.includes(n));
    const bonusMatch = numbers.includes(draw.bnusNo);
    const tier = checkWinTier(numbers, drawNums, draw.bnusNo);
    const prize = tier ? getPrizeAmount(tier) : 0;

    if (tier) tierCounts[tier]++;

    if (matched.length >= 3) {
      const entry: BacktestResult = {
        round: draw.drwNo,
        date: draw.drwNoDate,
        matchCount: matched.length,
        matchedNumbers: matched,
        bonusMatch,
        tier,
        prize,
      };
      results.push(entry);

      if (!bestMatch || matched.length > bestMatch.matchCount ||
          (matched.length === bestMatch.matchCount && bonusMatch && !bestMatch.bonusMatch)) {
        bestMatch = entry;
      }
    }

    totalPrize += prize;
  }

  results.sort((a, b) => b.matchCount - a.matchCount || b.round - a.round);
  const totalCost = allResults.length * TICKET_COST;

  return {
    totalDraws: allResults.length,
    results,
    tierCounts,
    totalPrize,
    totalCost,
    netProfit: totalPrize - totalCost,
    bestMatch,
    matchThreeOrMore: results.length,
  };
}
