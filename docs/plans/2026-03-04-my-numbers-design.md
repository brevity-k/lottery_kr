# My Numbers Lab — Design Document

**Date:** 2026-03-04
**Route:** `/lotto/my-numbers`
**Approach:** Single-page with 3 sections (Input, History, Report)
**Storage:** localStorage only (no accounts)
**AI:** Client-side algorithms only (no API calls)

## Data Model

```typescript
// localStorage key: "my-lotto-numbers"
interface MyNumbersData {
  version: 1;
  games: MyGame[];
}

interface MyGame {
  id: string;           // crypto.randomUUID()
  numbers: number[];    // 6 sorted numbers (1-45)
  round: number;        // which draw round this was for
  createdAt: string;    // ISO timestamp
}
```

- Single localStorage key, JSON serialized
- Games are immutable once saved (delete only, no edit)
- ~50KB for 1,000 games — no storage concern

## Page Layout

### A. Number Input (top)

- Reuse simulator's 45-ball toggle grid
- Round selector: dropdown defaulting to latest round
- "Save Game" button → localStorage + toast confirmation + grid reset
- Validation: exactly 6 numbers, valid round

### B. Game History (middle)

- Scrollable list, newest first
- Each row: round number, 6 LottoBalls, match result (e.g., "3/6"), delete button
- Match results auto-calculated against lotto.json draw data
- Color coding: green for 3+ matches, gold for prize-winning tiers (3+bonus, 4, 5, 5+bonus, 6)
- Empty state: friendly message encouraging first entry

### C. My Number Report (bottom)

- Only shows when 3+ games saved
- Three sub-sections:

#### Pattern Analysis

| Pattern | Logic | Example |
|---------|-------|---------|
| Frequency bias | Count each number across all games | "7번은 게임의 80%에 등장" |
| Odd/Even ratio | Compare vs ideal 3:3 | "홀수 비율 68%" |
| High/Low ratio | 1-22 vs 23-45 | "낮은 번호 위주" |
| Section coverage | 5 sections (1-9, 10-18, 19-27, 28-36, 37-45) | "30번대 미선택" |
| Number gaps | Spacing between numbers | "클러스터 성향" |
| Consecutive numbers | Adjacent pairs | "연속 번호 자주 포함" |

#### "Why I Pick These" Story

Template-based narrative filled with detected patterns:
```
"당신의 핵심 번호: {top3}. {oddEvenInsight}. {sectionInsight}.
최근 {recentCount}회차 트렌드를 고려하면, {suggestion}."
```

#### Suggested Adjustments

Cross-reference user patterns with hot/cold stats from lotto.json:
- Keep user's "core numbers" (most frequently picked)
- Suggest swaps for underperforming slots based on frequency gaps and recent trends

### D. Historical Backtest

Per-game backtest against all 1,212+ historical draws:
- Match count per historical round
- Best historical match: "Round 847에서 5/6 일치"
- Estimated winnings based on actual prize amounts
- Summary: "이 번호로 1회부터 플레이했다면 총 ₩X 당첨"
- Reuses existing `checkWinTier()` from `simulator.ts`

## Technical Decisions

- **localStorage only** — no auth, no server, fits static-first architecture
- **Client-side algorithms** — no Claude API costs, instant results
- **Reuse existing components** — LottoBall, ball grid (simulator), toast, share buttons
- **Server component** passes lotto data as props; client component handles all interaction
- **SSR-safe** via `mounted` state pattern (consistent with other pages)

## New Files

- `src/app/lotto/my-numbers/page.tsx` — server component (metadata, data loading)
- `src/app/lotto/my-numbers/MyNumbersClient.tsx` — client component (all UI + logic)
- `src/lib/lottery/my-numbers.ts` — pattern analysis, story generation, backtest logic

## Modified Files

- `src/types/lottery.ts` — add MyNumbersData, MyGame interfaces
- `src/components/layout/Header.tsx` — add nav link
- `src/app/sitemap.ts` — add route
- `scripts/health-check.ts` — add to critical files list
