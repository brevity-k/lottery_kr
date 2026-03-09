# Focused Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Pivot lottery.io.kr from an encyclopedia to a focused site with one killer feature: "내 번호 역대 당첨 검사" — backtest your numbers against all historical draws with story-style reveal and shareable results.

**Architecture:** Reuse existing `backtestGame()` from `my-numbers.ts`. New client component for story reveal with CSS animations. Homepage becomes the feature. Removed pages get 301 redirects. Pure client-side computation — zero API calls.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, existing `lotto.json` build-time data.

**Note on dangerouslySetInnerHTML:** JSON-LD scripts use `dangerouslySetInnerHTML` only for serializing trusted static objects (not user input). This is the standard Next.js pattern for structured data — no XSS risk.

---

### Task 1: Backtest Engine

Extract and enhance the backtest logic from `my-numbers.ts` into a standalone module.

**Files:**
- Create: `src/lib/lottery/backtest.ts`

**Step 1: Create backtest.ts**

This reuses `backtestGame` logic but adds summary stats needed for the story reveal. The existing function in `my-numbers.ts` stays untouched (other code may import it).

```typescript
// src/lib/lottery/backtest.ts
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
```

**Step 2: Verify**

```bash
npm run dev  # Ensure no import errors
```

**Step 3: Commit**

```bash
git add src/lib/lottery/backtest.ts
git commit -m "feat: add standalone backtest engine for number history check"
```

---

### Task 2: Story Reveal Client Component

Build the animated reveal component that drives the core UX.

**Files:**
- Create: `src/app/BacktestClient.tsx`

**Step 1: Create BacktestClient.tsx**

This is a `"use client"` component with these phases:
- `idle` — user entering numbers
- `analyzing` — spinner animation (1.5s)
- `reveal-total` — show total matches (fade in, 1s)
- `reveal-tiers` — count-up tier breakdown (1.5s)
- `reveal-best` — dramatic best match (1.5s)
- `reveal-profit` — P&L summary (1s)
- `done` — share card visible, detail table accessible

Key implementation details:
- 6 number inputs: use `<input type="number">` with min=1 max=45, styled as circles
- Prevent duplicate numbers (validate on submit)
- "랜덤" button fills 6 random unique numbers
- URL param support: read `?n=3,7,15,21,29,34` on mount, auto-fill, auto-run
- Animation sequencing: use `setTimeout` chain triggered by state machine
- All data passed as prop: `allResults: LottoResult[]` from server component
- `mounted` state pattern for SSR compatibility
- Share buttons: Copy link, KakaoTalk (via `getKakaoSDK()`), Web Share API
- Share URL: `${window.location.origin}/?n=${numbers.join(',')}`
- Use existing `LottoBall` component for number display
- Use `useToast()` for validation errors

Component structure:
```
<BacktestClient allResults={allResults}>
  {/* Input Section */}
  <NumberInputs />
  <SubmitButton />
  <RandomButton />

  {/* Story Reveal (conditional) */}
  <AnalyzingSpinner />      {/* phase: analyzing */}
  <TotalMatches />           {/* phase: reveal-total */}
  <TierBreakdown />          {/* phase: reveal-tiers */}
  <BestMatch />              {/* phase: reveal-best, uses LottoBall */}
  <ProfitSummary />          {/* phase: reveal-profit */}

  {/* Result Section (after done) */}
  <ShareCard />
  <DetailTable />            {/* collapsible, shows all 3+ match rounds */}
</BacktestClient>
```

The component should be approximately 300-400 lines. Use existing `LottoBall` component for number display. Use `useToast()` for validation errors.

**Step 2: Verify**

```bash
npm run dev  # Visit / and test the component
```

**Step 3: Commit**

```bash
git add src/app/BacktestClient.tsx
git commit -m "feat: add story-style backtest reveal component"
```

---

### Task 3: Replace Homepage

Replace current homepage with the backtest feature as the hero.

**Files:**
- Modify: `src/app/page.tsx` — complete rewrite
- Modify: `src/app/layout.tsx` — update default title/description

**Step 1: Rewrite page.tsx**

Server component that:
- Loads `getAllResults()` from `src/lib/api/dhlottery`
- Loads `getRecentBlogPosts(3)` from `src/lib/blog`
- Renders hero headline: "내 로또 번호, 역대 당첨번호와 비교하세요"
- Renders subtitle: "{allResults.length}회 전체 추첨 결과에서 당신의 번호를 검사합니다"
- Renders `<BacktestClient allResults={allResults} />`
- Renders AdBanner below
- Renders minimal blog section (3 recent posts)
- Renders SEO text section explaining the feature
- JSON-LD: WebApplication schema (serialized from trusted static object, not user input)

**Step 2: Update layout.tsx default title**

In `src/app/layout.tsx`, change:
- Default title to: `"내 로또 번호 역대 당첨 검사 - 로또리"`
- Description to: `"나의 로또 번호가 역대 1,200회 이상의 당첨번호와 얼마나 일치하는지 즉시 검사하세요. 가장 가까웠던 순간, 수익 분석까지 무료 제공."`
- Add keywords: `로또 번호 검사`, `로또 번호 비교`, `로또 역대 당첨`, `내 번호 확인`

**Step 3: Verify and commit**

```bash
npm run dev  # Check homepage renders correctly
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: replace homepage with backtest feature as hero"
```

---

### Task 4: Slim Down Navigation

Update header and footer to reflect the focused site.

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`

**Step 1: Update Header navItems**

Replace the `navItems` array in `src/components/layout/Header.tsx`:

```typescript
const navItems = [
  { href: "/lotto/results", label: "당첨번호" },
  { href: "/lotto/recommend", label: "번호 추천" },
  { href: "/lotto/stores", label: "명당" },
  { href: "/lotto/tax", label: "세금 계산기" },
  { href: "/blog", label: "블로그" },
];
```

Also update the `isActive` function — remove the special case for `/lotto`:
```typescript
const isActive = (href: string) => pathname.startsWith(href);
```

**Step 2: Update Footer**

Slim down footer links to match. Remove references to removed pages (stats, simulator, lucky, dream, my-numbers, numbers).

**Step 3: Verify and commit**

```bash
npm run dev  # Check navigation on desktop and mobile
git add src/components/layout/Header.tsx src/components/layout/Footer.tsx
git commit -m "feat: slim navigation to focused site structure"
```

---

### Task 5: Add 301 Redirects for Removed Pages

Redirect old URLs to homepage to preserve any existing link equity.

**Files:**
- Modify: `next.config.ts`

**Step 1: Add redirects**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/lotto", destination: "/", permanent: true },
      { source: "/lotto/dream", destination: "/", permanent: true },
      { source: "/lotto/lucky", destination: "/", permanent: true },
      { source: "/lotto/simulator", destination: "/", permanent: true },
      { source: "/lotto/my-numbers", destination: "/", permanent: true },
      { source: "/lotto/stats", destination: "/", permanent: true },
      { source: "/lotto/numbers", destination: "/", permanent: true },
      { source: "/lotto/numbers/:num", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
```

**Step 2: Verify and commit**

```bash
npm run dev
# curl -I http://localhost:3000/lotto/dream -> should show 308 (permanent redirect)
git add next.config.ts
git commit -m "feat: add 301 redirects for removed pages"
```

---

### Task 6: Remove Unused Pages and Code

Delete files for removed features. Keep the library code intact (other features may reference it, and it costs nothing at runtime).

**Files to delete:**
- `src/app/lotto/page.tsx` (hub page, redirected)
- `src/app/lotto/dream/` (entire directory)
- `src/app/lotto/lucky/` (entire directory)
- `src/app/lotto/simulator/` (entire directory)
- `src/app/lotto/my-numbers/` (entire directory)
- `src/app/lotto/stats/` (entire directory)
- `src/app/lotto/numbers/` (entire directory)
- `src/components/ui/RelatedFeatures.tsx` (no longer needed)

**Step 1: Delete files**

```bash
rm -rf src/app/lotto/dream/
rm -rf src/app/lotto/lucky/
rm -rf src/app/lotto/simulator/
rm -rf src/app/lotto/my-numbers/
rm -rf src/app/lotto/stats/
rm -rf src/app/lotto/numbers/
rm src/app/lotto/page.tsx
rm src/components/ui/RelatedFeatures.tsx
```

**Step 2: Remove RelatedFeatures imports from remaining pages**

Grep for `RelatedFeatures` in remaining pages and remove the import + component usage:
- `src/app/lotto/recommend/page.tsx`
- `src/app/lotto/tax/page.tsx`
- `src/app/lotto/stores/page.tsx`
- `src/app/lotto/results/page.tsx` (if present)
- `src/app/lotto/results/[round]/page.tsx` (if present)
- `src/app/faq/page.tsx` (if present)

**Step 3: Update sitemap**

In `src/app/sitemap.ts`, remove entries for deleted pages (stats, simulator, lucky, dream, my-numbers, numbers, /lotto hub). Keep: homepage, results, recommend, stores, tax, blog, faq, about.

**Step 4: Verify build**

```bash
npm run build  # Must succeed with no missing imports
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: remove unused pages and simplify site structure"
```

---

### Task 7: Update Sitemap and SEO

Ensure sitemap, robots.txt, RSS feed, and metadata reflect the new focused site.

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `public/robots.txt` (if needed)

**Step 1: Simplify sitemap**

Update `src/app/sitemap.ts` to only include:
- `/` — priority 1.0, daily
- `/lotto/results` — priority 0.8, weekly
- `/lotto/results/[round]` — priority 0.5, never (keep all rounds)
- `/lotto/recommend` — priority 0.7, weekly
- `/lotto/stores` — priority 0.7, monthly
- `/lotto/tax` — priority 0.5, monthly
- `/blog` — priority 0.7, weekly
- `/blog/[slug]` — priority 0.6, never
- `/faq` — priority 0.5, monthly
- `/about` — priority 0.3, monthly

Remove: /lotto/stats, /lotto/dream, /lotto/lucky, /lotto/simulator, /lotto/my-numbers, /lotto/numbers/*

**Step 2: Verify and commit**

```bash
npm run build
git add src/app/sitemap.ts public/robots.txt
git commit -m "feat: update sitemap for focused site structure"
```

---

## Execution Order

1. **Task 1** — Backtest engine (foundation, no UI)
2. **Task 2** — Story reveal component (the core feature)
3. **Task 3** — Replace homepage (wire it up)
4. **Task 4** — Slim navigation (cosmetic, quick)
5. **Task 5** — 301 redirects (safety net before deleting)
6. **Task 6** — Remove unused pages (cleanup)
7. **Task 7** — Update sitemap/SEO (final polish)

After all tasks: full build verification, then PR to main.
