export interface LottoResult {
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

export interface LottoNumbers {
  numbers: number[];
  bonusNumber: number;
}

export interface RecommendedSet {
  label: string;
  numbers: number[];
}

export type RecommendMethod =
  | "random"
  | "statistics"
  | "hot"
  | "cold"
  | "balanced"
  | "ai";

export interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
}

export interface LottoStats {
  totalDraws: number;
  frequencies: NumberFrequency[];
  recentFrequencies: NumberFrequency[];
  oddEvenRatio: { odd: number; even: number };
  highLowRatio: { high: number; low: number };
  mostCommon: number[];
  leastCommon: number[];
  hottestNumbers: number[];
  coldestNumbers: number[];
}

export interface NumberDetail {
  number: number;
  totalAppearances: number;
  frequencyPercent: number;
  bonusAppearances: number;
  lastAppearedRound: number;
  currentGap: number;
  maxGap: number;
  avgGap: number;
  recentRounds: number[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  tags: string[];
}

export interface LottoDataFile {
  lottery: string;
  lastUpdated: string;
  latestRound: number;
  draws: LottoResult[];
}

export interface TaxResult {
  prizeAmount: number;
  ticketCost: number;
  taxableAmount: number;
  incomeTax: number;
  localTax: number;
  totalTax: number;
  netAmount: number;
  effectiveRate: number;
}

export interface WinTierResult {
  tier: number;
  count: number;
  totalPrize: number;
}

export interface SimulationResult {
  totalSpent: number;
  totalWon: number;
  drawCount: number;
  wins: WinTierResult[];
  bestTier: number | null;
}

export interface DreamKeyword {
  id: string;
  emoji: string;
  name: string;
  interpretation: string;
  numbers: number[];
}

export interface DreamCategory {
  id: string;
  emoji: string;
  name: string;
  description: string;
  keywords: DreamKeyword[];
}

export interface MyGame {
  id: string;
  numbers: number[];
  round: number;
  createdAt: string;
}

export interface MyNumbersData {
  version: 1;
  games: MyGame[];
}

export interface BacktestResult {
  round: number;
  date: string;
  matchCount: number;
  matchedNumbers: number[];
  bonusMatch: boolean;
  tier: number | null;
  prize: number;
}

export interface PatternAnalysis {
  totalGames: number;
  numberFrequencies: { number: number; count: number; percentage: number }[];
  topNumbers: number[];
  oddRatio: number;
  evenRatio: number;
  highRatio: number;
  lowRatio: number;
  sectionCoverage: { section: string; count: number; percentage: number }[];
  avgConsecutivePairs: number;
  avgSpread: number;
}

export interface NumberReport {
  patterns: PatternAnalysis;
  story: string;
  suggestions: number[];
  suggestionReason: string;
}
