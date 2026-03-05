# My Numbers Lab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal lottery number tracking page at `/lotto/my-numbers` where users save their weekly picks, see match results against real draws, get pattern analysis with a personalized "why I pick these" story, and receive data-driven number suggestions.

**Architecture:** Single-page client component with localStorage persistence. Server component loads all draw data at build time and passes it as props. All analysis runs client-side using existing `checkWinTier()` and stats utilities. No auth, no API calls.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, localStorage, existing LottoBall/toast/share components.

---

### Task 1: Add types to `src/types/lottery.ts`

**Files:**
- Modify: `src/types/lottery.ts:105` (append after SimulationResult)

**Step 1: Add the new interfaces at the end of the file**

```typescript
// Append after the DreamCategory interface (line 121)

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
```

**Step 2: Commit**

```bash
git add src/types/lottery.ts
git commit -m "feat(my-numbers): add types for MyGame, BacktestResult, PatternAnalysis, NumberReport"
```

---

### Task 2: Create analysis engine `src/lib/lottery/my-numbers.ts`

**Files:**
- Create: `src/lib/lottery/my-numbers.ts`

**Step 1: Create the analysis module**

This file contains all client-side logic: localStorage CRUD, pattern analysis, story generation, backtest, and suggestions.

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/lottery/my-numbers.ts
git commit -m "feat(my-numbers): add analysis engine with localStorage, backtest, patterns, story, suggestions"
```

---

### Task 3: Create server page `src/app/lotto/my-numbers/page.tsx`

**Files:**
- Create: `src/app/lotto/my-numbers/page.tsx`

**Step 1: Create the server component**

Follow the exact pattern of `src/app/lotto/simulator/page.tsx`: metadata, breadcrumb, ad slots, client component. Pass `allResults` and `latestRound` as props (server loads from lotto.json, client uses for matching/backtest).

Also need `hotNumbers` and `coldNumbers` from stats for the suggestion engine.

```typescript
import type { Metadata } from "next";
import MyNumbersClient from "./MyNumbersClient";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME } from "@/lib/constants";
import { getAllResults } from "@/lib/api/dhlottery";
import { calculateStats } from "@/lib/lottery/stats";

export const metadata: Metadata = {
  title: "내 번호 분석 - 나만의 로또 통계",
  description:
    "매주 구매한 로또 번호를 기록하고, 당첨 결과 비교, 패턴 분석, 맞춤 전략 추천까지. 나만의 로또 통계를 확인해보세요.",
  alternates: { canonical: "/lotto/my-numbers" },
  openGraph: {
    title: "내 번호 분석 - 나만의 로또 통계",
    description:
      "매주 구매한 로또 번호를 기록하고, 당첨 결과 비교, 패턴 분석, 맞춤 전략 추천까지. 나만의 로또 통계를 확인해보세요.",
    url: "/lotto/my-numbers",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function MyNumbersPage() {
  const allResults = getAllResults();
  const latestRound = allResults.length > 0 ? allResults[0].drwNo : 0;
  const stats = calculateStats(allResults, 20);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "내 번호 분석" },
      ]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 내 번호 분석</h1>
      <p className="text-gray-600 mb-8">
        매주 구매한 번호를 기록하고, 나만의 로또 통계를 확인해보세요.
      </p>

      <AdBanner slot="my-numbers-top" format="horizontal" className="mb-6" />

      <MyNumbersClient
        allResults={allResults}
        latestRound={latestRound}
        hotNumbers={stats.hottestNumbers}
        coldNumbers={stats.coldestNumbers}
      />

      <AdBanner slot="my-numbers-bottom" format="horizontal" className="mt-6" />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/lotto/my-numbers/page.tsx
git commit -m "feat(my-numbers): add server page with metadata and data loading"
```

---

### Task 4: Create client component `src/app/lotto/my-numbers/MyNumbersClient.tsx`

**Files:**
- Create: `src/app/lotto/my-numbers/MyNumbersClient.tsx`

**Step 1: Build the full client component**

This is the largest task. It includes 4 sections: Number Input, Game History, Report, and Backtest.

Follow these patterns from `SimulatorClient.tsx`:
- `"use client"` directive
- Ball grid: `grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-1 sm:gap-1.5`
- `toggleNumber` with max 6 check
- `handleAutoSelect` with Fisher-Yates
- Selected numbers display in blue pill row
- `useToast()` for feedback
- `mounted` state for SSR safety
- White card sections: `bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm`
- Share buttons: copy / KakaoTalk / Web Share

Key state:
```typescript
const [mounted, setMounted] = useState(false);
const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
const [selectedRound, setSelectedRound] = useState(latestRound);
const [myData, setMyData] = useState<MyNumbersData>({ version: 1, games: [] });
const [backtestTarget, setBacktestTarget] = useState<MyGame | null>(null);
const [backtestResults, setBacktestResults] = useState<BacktestResultData | null>(null);
```

On mount: `loadMyNumbers()` into state.

**Section A — Number Input:**
- 45-ball grid (copy from simulator)
- Round dropdown (`<select>`) with rounds from `latestRound` down to `latestRound - 52` (1 year)
- Auto-select and reset buttons
- "번호 저장" button → calls `addGame()`, updates state, shows toast, resets grid

**Section B — Game History:**
- Map `myData.games` → rows with LottoBalls + match info
- For each game, call `matchGameAgainstDraw(game, allResults)`
- If match result exists, show `matchCount/6` with color coding
- If no draw data yet (future round), show "추첨 대기"
- Delete button per row
- "전체 삭제" button at bottom with confirm
- "역대 분석" button per row → triggers backtest for that game's numbers

**Section C — Report (if games.length >= 3):**
- Call `generateReport(myData.games, hotNumbers, coldNumbers)`
- Display pattern cards (odd/even ratio bar, section coverage bars, top numbers as LottoBalls)
- Story text in a styled blockquote
- Suggested numbers as LottoBalls with reason text

**Section D — Backtest Modal/Section (when triggered):**
- Show top 10 backtest results (3+ matches) sorted by matchCount desc
- Summary stats: total estimated prize, best tier
- "이 번호로 1회부터 플레이했다면 총 ₩X 당첨" summary line

The full component code should be ~400-500 lines following existing patterns exactly.

**Step 2: Commit**

```bash
git add src/app/lotto/my-numbers/MyNumbersClient.tsx
git commit -m "feat(my-numbers): add client component with input, history, report, backtest"
```

---

### Task 5: Wire up navigation, sitemap, and health check

**Files:**
- Modify: `src/components/layout/Header.tsx:8` — add nav item
- Modify: `src/app/sitemap.ts:21` — add route
- Modify: `scripts/health-check.ts:216` — add critical file

**Step 1: Add nav item to Header.tsx**

Add to `navItems` array (after dream, before blog):
```typescript
  { href: "/lotto/my-numbers", label: "내 번호" },
```

**Step 2: Add to sitemap.ts**

Add after the dream entry in `staticPages`:
```typescript
    { url: `${baseUrl}/lotto/my-numbers`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.8 },
```

**Step 3: Add to health-check.ts critical files**

Add after `"src/app/lotto/dream/page.tsx"`:
```typescript
    "src/app/lotto/my-numbers/page.tsx",
```

**Step 4: Commit**

```bash
git add src/components/layout/Header.tsx src/app/sitemap.ts scripts/health-check.ts
git commit -m "feat(my-numbers): add nav link, sitemap entry, health check"
```

---

### Task 6: Build and verify

**Step 1: Run the dev server and test manually**

```bash
npm run dev
```

Open `http://localhost:3000/lotto/my-numbers` and verify:
- Page loads without hydration errors
- Ball grid renders and is interactive
- Saving a game works (check localStorage in DevTools)
- Game appears in history with match results
- Deleting a game works
- Report section appears after 3+ games
- Backtest shows results when triggered
- Share buttons work (copy at minimum)

**Step 2: Run production build**

```bash
npm run build
```

Verify no build errors and the page is included in output.

**Step 3: Run health check**

```bash
npm run health-check
```

Verify all checks pass.

**Step 4: Run lint**

```bash
npm run lint
```

Fix any lint errors.

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix(my-numbers): address build/lint issues"
```

---

### Task 7: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add my-numbers to the directory structure and description**

Add to the directory tree under `lotto/`:
```
│       │   ├── my-numbers/        # Personal number tracking & analysis
```

Add to the feature descriptions or relevant sections.

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add my-numbers to CLAUDE.md directory structure"
```
