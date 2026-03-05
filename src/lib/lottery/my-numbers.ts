import type { LottoResult, MyGame, MyNumbersData, BacktestResult, PatternAnalysis, NumberReport } from "@/types/lottery";
import { checkWinTier, getPrizeAmount } from "@/lib/lottery/simulator";
import { getDrawNumbers } from "@/lib/lottery/stats";
import { LOTTO_SECTIONS, LOTTO_HIGH_LOW_THRESHOLD, LOTTO_MAX_NUMBER } from "@/lib/constants";

const STORAGE_KEY = "my-lotto-numbers";

// --- localStorage CRUD ---

export function loadMyNumbers(): MyNumbersData {
  if (typeof window === "undefined") return { version: 1, games: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, games: [] };
    const data = JSON.parse(raw) as MyNumbersData;
    if (!data.version || !Array.isArray(data.games)) return { version: 1, games: [] };
    return data;
  } catch {
    return { version: 1, games: [] };
  }
}

export function saveMyNumbers(data: MyNumbersData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addGame(numbers: number[], round: number): MyNumbersData {
  const data = loadMyNumbers();
  const game: MyGame = {
    id: crypto.randomUUID(),
    numbers: [...numbers].sort((a, b) => a - b),
    round,
    createdAt: new Date().toISOString(),
  };
  data.games.unshift(game);
  saveMyNumbers(data);
  return data;
}

export function deleteGame(id: string): MyNumbersData {
  const data = loadMyNumbers();
  data.games = data.games.filter((g) => g.id !== id);
  saveMyNumbers(data);
  return data;
}

// --- Backtest ---

export function backtestGame(
  numbers: number[],
  allResults: LottoResult[]
): { results: BacktestResult[]; totalPrize: number; bestTier: number | null } {
  const results: BacktestResult[] = [];
  let totalPrize = 0;
  let bestTier: number | null = null;

  for (const draw of allResults) {
    const drawNums = getDrawNumbers(draw);
    const matched = numbers.filter((n) => drawNums.includes(n));
    const bonusMatch = numbers.includes(draw.bnusNo);
    const tier = checkWinTier(numbers, drawNums, draw.bnusNo);
    const prize = tier ? getPrizeAmount(tier) : 0;

    if (matched.length >= 3) {
      results.push({
        round: draw.drwNo,
        date: draw.drwNoDate,
        matchCount: matched.length,
        matchedNumbers: matched,
        bonusMatch,
        tier,
        prize,
      });
    }

    totalPrize += prize;
    if (tier !== null && (bestTier === null || tier < bestTier)) {
      bestTier = tier;
    }
  }

  return { results: results.sort((a, b) => b.matchCount - a.matchCount), totalPrize, bestTier };
}

// --- Match single game against its draw ---

export function matchGameAgainstDraw(
  game: MyGame,
  allResults: LottoResult[]
): { matchCount: number; matchedNumbers: number[]; bonusMatch: boolean; tier: number | null; prize: number } | null {
  const draw = allResults.find((r) => r.drwNo === game.round);
  if (!draw) return null;

  const drawNums = getDrawNumbers(draw);
  const matched = game.numbers.filter((n) => drawNums.includes(n));
  const bonusMatch = game.numbers.includes(draw.bnusNo);
  const tier = checkWinTier(game.numbers, drawNums, draw.bnusNo);
  const prize = tier ? getPrizeAmount(tier) : 0;

  return { matchCount: matched.length, matchedNumbers: matched, bonusMatch, tier, prize };
}

// --- Pattern Analysis ---

export function analyzePatterns(games: MyGame[]): PatternAnalysis {
  const totalGames = games.length;
  const numberCounts = new Map<number, number>();
  for (let i = 1; i <= LOTTO_MAX_NUMBER; i++) numberCounts.set(i, 0);

  let totalOdd = 0, totalEven = 0, totalHigh = 0, totalLow = 0;
  let totalConsecutivePairs = 0;
  let totalSpread = 0;

  for (const game of games) {
    for (const num of game.numbers) {
      numberCounts.set(num, (numberCounts.get(num) || 0) + 1);
      if (num % 2 === 1) totalOdd++; else totalEven++;
      if (num > LOTTO_HIGH_LOW_THRESHOLD) totalHigh++; else totalLow++;
    }

    // Consecutive pairs
    const sorted = [...game.numbers].sort((a, b) => a - b);
    let pairs = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] === 1) pairs++;
    }
    totalConsecutivePairs += pairs;

    // Spread (max - min)
    totalSpread += sorted[sorted.length - 1] - sorted[0];
  }

  const totalNumbers = totalGames * 6;
  const numberFrequencies = Array.from(numberCounts.entries())
    .map(([number, count]) => ({
      number,
      count,
      percentage: totalGames > 0 ? Math.round((count / totalGames) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const topNumbers = numberFrequencies
    .filter((f) => f.count > 0)
    .slice(0, 6)
    .map((f) => f.number);

  // Section coverage
  const sectionCoverage = LOTTO_SECTIONS.map(([min, max]) => {
    let count = 0;
    for (const game of games) {
      if (game.numbers.some((n) => n >= min && n <= max)) count++;
    }
    return {
      section: `${min}-${max}`,
      count,
      percentage: totalGames > 0 ? Math.round((count / totalGames) * 100) : 0,
    };
  });

  return {
    totalGames,
    numberFrequencies,
    topNumbers,
    oddRatio: totalNumbers > 0 ? Math.round((totalOdd / totalNumbers) * 100) : 50,
    evenRatio: totalNumbers > 0 ? Math.round((totalEven / totalNumbers) * 100) : 50,
    highRatio: totalNumbers > 0 ? Math.round((totalHigh / totalNumbers) * 100) : 50,
    lowRatio: totalNumbers > 0 ? Math.round((totalLow / totalNumbers) * 100) : 50,
    sectionCoverage,
    avgConsecutivePairs: totalGames > 0 ? Math.round((totalConsecutivePairs / totalGames) * 10) / 10 : 0,
    avgSpread: totalGames > 0 ? Math.round((totalSpread / totalGames) * 10) / 10 : 0,
  };
}

// --- Story Generator ---

export function generateStory(patterns: PatternAnalysis): string {
  const { topNumbers, oddRatio, sectionCoverage, avgConsecutivePairs, avgSpread } = patterns;

  const parts: string[] = [];

  // Core numbers
  if (topNumbers.length >= 3) {
    const top3 = topNumbers.slice(0, 3).join(", ");
    parts.push(`당신의 핵심 번호는 ${top3}번입니다. 대부분의 게임에 이 번호들이 포함되어 있습니다.`);
  }

  // Odd/Even
  if (oddRatio >= 60) {
    parts.push(`홀수를 선호하는 경향이 뚜렷합니다 (${oddRatio}%).`);
  } else if (oddRatio <= 40) {
    parts.push(`짝수를 선호하는 경향이 뚜렷합니다 (${100 - oddRatio}%).`);
  } else {
    parts.push(`홀짝 비율이 균형적입니다 (홀수 ${oddRatio}%).`);
  }

  // Section coverage
  const weakSections = sectionCoverage.filter((s) => s.percentage < 30);
  const strongSections = sectionCoverage.filter((s) => s.percentage >= 80);
  if (weakSections.length > 0) {
    parts.push(`${weakSections.map((s) => s.section).join(", ")} 구간을 거의 선택하지 않습니다.`);
  }
  if (strongSections.length > 0) {
    parts.push(`${strongSections.map((s) => s.section).join(", ")} 구간을 꾸준히 선택합니다.`);
  }

  // Clustering
  if (avgConsecutivePairs >= 1.5) {
    parts.push(`연속 번호를 자주 포함시키는 편입니다 (평균 ${avgConsecutivePairs}쌍).`);
  } else if (avgConsecutivePairs < 0.5) {
    parts.push("연속 번호를 거의 사용하지 않는 분산형 선택 스타일입니다.");
  }

  // Spread
  if (avgSpread < 25) {
    parts.push("번호가 좁은 범위에 몰려 있는 클러스터 성향입니다.");
  } else if (avgSpread > 35) {
    parts.push("번호를 넓은 범위에서 골고루 선택하는 스타일입니다.");
  }

  return parts.join(" ");
}

// --- Suggestions ---

export function generateSuggestions(
  patterns: PatternAnalysis,
  hotNumbers: number[],
  coldNumbers: number[]
): { numbers: number[]; reason: string } {
  const { topNumbers, sectionCoverage } = patterns;

  // Keep top 3 core numbers
  const kept = topNumbers.slice(0, 3).filter((n) => n >= 1 && n <= LOTTO_MAX_NUMBER);

  // Find weak sections
  const weakSections = sectionCoverage
    .filter((s) => s.percentage < 30)
    .map((s) => {
      const [min, max] = s.section.split("-").map(Number);
      return { min, max };
    });

  // Suggest hot numbers from weak sections, or just hot numbers
  const candidates = hotNumbers.filter((n) => !kept.includes(n));
  const suggestions: number[] = [...kept];

  // Try to fill from weak sections using hot numbers
  for (const sec of weakSections) {
    const fromSection = candidates.find(
      (n) => n >= sec.min && n <= sec.max && !suggestions.includes(n)
    );
    if (fromSection && suggestions.length < 6) {
      suggestions.push(fromSection);
    }
  }

  // Fill remaining with hot numbers
  for (const n of candidates) {
    if (suggestions.length >= 6) break;
    if (!suggestions.includes(n)) suggestions.push(n);
  }

  // If still not enough, fill with random cold numbers (contrarian play)
  for (const n of coldNumbers) {
    if (suggestions.length >= 6) break;
    if (!suggestions.includes(n)) suggestions.push(n);
  }

  suggestions.sort((a, b) => a - b);

  const keptStr = kept.join(", ");
  const weakStr = weakSections.map((s) => `${s.min}-${s.max}`).join(", ");
  const reason = weakSections.length > 0
    ? `핵심 번호 ${keptStr}번을 유지하고, 약한 구간(${weakStr})에서 최근 출현 빈도가 높은 번호를 추가했습니다.`
    : `핵심 번호 ${keptStr}번을 유지하고, 최근 출현 빈도가 높은 번호로 보강했습니다.`;

  return { numbers: suggestions.slice(0, 6), reason };
}

// --- Full Report ---

export function generateReport(
  games: MyGame[],
  hotNumbers: number[],
  coldNumbers: number[]
): NumberReport {
  const patterns = analyzePatterns(games);
  const story = generateStory(patterns);
  const { numbers: suggestions, reason } = generateSuggestions(patterns, hotNumbers, coldNumbers);

  return { patterns, story, suggestions, suggestionReason: reason };
}
