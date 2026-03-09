# Focused Redesign — "내 번호 역대 당첨 검사"

**Date:** 2026-03-09
**Goal:** Pivot from encyclopedia lottery site to a focused site with one killer feature: backtest your numbers against all historical draws.
**Approach:** Story-style reveal, shareable result card, URL-based sharing for viral loop.

## Core Feature

Enter 6 numbers → instant backtest against 1,200+ historical draws → dramatic story reveal → shareable result card.

### Input
- 6 number pickers (1-45) styled as lottery balls
- "검사하기" button + "랜덤 번호" quick-fill
- URL params auto-fill: `/?n=3,7,15,21,29,34`

### Story Reveal (5-6 seconds)
1. "1,214회 역대 당첨번호를 분석중..." — spinner (1-2s)
2. 총 매칭: "1,214회 중 3개 이상 일치 87회"
3. 등수별 breakdown with count-up animation (1등~5등)
4. 가장 가까운 순간 — dramatic pause → round detail with matched balls highlighted
5. 수익 분석 — cost vs prize, net P&L (green/red)
6. Share card + buttons

### After Reveal
- Result stays visible, detail table (3+ matches) collapsible below
- Share: Copy link, KakaoTalk, Web Share API

### URL Sharing
`/?n=3,7,15,21,29,34` auto-fills + auto-plays reveal → zero friction for receiver

## Site Structure

### Keep
- `/` — Homepage = backtest feature
- `/lotto/results` + `/lotto/results/[round]` — Results lookup
- `/lotto/recommend` — Number recommendation
- `/lotto/stores` — Store map (Leaflet + OSM)
- `/lotto/tax` — Tax calculator
- `/blog` + `/blog/[slug]` — Blog (SEO)
- `/faq` — FAQ
- `/about`, `/privacy`, `/terms`, `/contact`

### Remove (301 → `/`)
- `/lotto` (hub), `/lotto/dream`, `/lotto/lucky`, `/lotto/simulator`
- `/lotto/my-numbers`, `/lotto/stats`, `/lotto/numbers`, `/lotto/numbers/[num]`

### Header Navigation
홈 | 당첨번호 | 번호추천 | 명당 | 세금계산기 | 블로그

## Technical

- Pure client-side computation (lotto.json at build time)
- `src/lib/lottery/backtest.ts` — match engine
- CSS transitions + setTimeout for story animation
- Prize: 4등=50,000원, 5등=5,000원, 3등+ from lotto.json actual data
- Share card via OG meta tags + html2canvas for KakaoTalk
- 301 redirects in next.config.ts
