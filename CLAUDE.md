# CLAUDE.md - Rottery.kr Project Documentation

## Project Overview

**Site:** lottery.io.kr (Korean lottery number recommendation)
**Stack:** Next.js 16 App Router + TypeScript + Tailwind CSS 4 + Chart.js
**Hosting:** Vercel (free tier)
**Data Source:** superkts.com (pre-fetched to local JSON)
**Language:** Korean only
**Revenue Model:** Google AdSense

---

## Quick Commands

```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Build for production (runs update-data first via prebuild)
npm run update-data   # Fetch latest lottery data from superkts.com
npm run generate-blog # Generate a blog post via Claude Haiku API (needs ANTHROPIC_API_KEY)
npm run lint          # Run ESLint
```

---

## Architecture

### Static-First Design

All lottery data is pre-fetched at build time. Zero runtime API calls.

```
scripts/update-data.ts  -->  src/data/lotto.json  -->  Build-time reads via fs.readFileSync
```

- `prebuild` script runs `update-data` before every `next build`
- Data is cached in memory after first read (`dhlottery.ts`)
- All pages are statically generated, including `/lotto/results/[round]` via `generateStaticParams()`

### Data Flow

1. `scripts/update-data.ts` scrapes superkts.com meta descriptions + HTML body in batches of 10
2. Saves to `src/data/lotto.json` (currently ~1,210 rounds, ~252KB, includes prize amounts)
3. `src/lib/api/dhlottery.ts` reads JSON file synchronously at build time
4. `src/lib/blog.ts` reads blog post JSON files from `content/blog/` at build time
5. Pages and components consume data through exported functions

---

## Directory Structure

```
rottery_kr/
├── CLAUDE.md                          # This file
├── PLAN.md                            # Original project plan (14 sections)
├── package.json                       # Dependencies and scripts
├── next.config.ts                     # Next.js configuration
├── tsconfig.json                      # TypeScript configuration
├── postcss.config.mjs                 # PostCSS + Tailwind
├── public/
│   ├── robots.txt                     # Search engine crawl rules
│   └── ads.txt                        # AdSense publisher verification
├── scripts/
│   ├── update-data.ts                 # Fetches lottery data from superkts.com
│   ├── generate-blog-post.ts          # Generates blog post via Claude Haiku API
│   └── blog-topics.json               # 8 topic templates for blog rotation
├── content/
│   └── blog/                          # Blog post JSON files (auto-generated + seed)
├── .github/
│   └── workflows/
│       └── generate-blog-post.yml     # Weekly cron (Sunday 10:00 KST)
└── src/
    ├── data/
    │   └── lotto.json                 # Pre-fetched lottery data (all rounds)
    ├── types/
    │   └── lottery.ts                 # TypeScript type definitions (LottoResult, BlogPost, etc.)
    ├── lib/
    │   ├── api/
    │   │   └── dhlottery.ts           # Lottery data loading (reads from local JSON)
    │   ├── blog.ts                    # Blog data loading (reads from content/blog/*.json)
    │   ├── lottery/
    │   │   ├── recommend.ts           # 6 recommendation algorithms
    │   │   └── stats.ts               # Statistical calculations
    │   └── utils/
    │       ├── format.ts              # Korean formatting utilities
    │       └── markdown.ts            # Zero-dependency markdown-to-HTML converter
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx             # Responsive header with mobile menu
    │   │   └── Footer.tsx             # 3-column footer with links
    │   ├── lottery/
    │   │   ├── LottoBall.tsx          # Colored ball (official 5-color scheme)
    │   │   ├── LottoResultCard.tsx    # Result display card
    │   │   └── RecommendResult.tsx    # Client component with copy/share
    │   ├── charts/
    │   │   └── FrequencyChart.tsx     # Chart.js bar chart
    │   └── ads/
    │       └── AdBanner.tsx           # AdSense wrapper (placeholder in dev)
    └── app/
        ├── layout.tsx                 # Root layout (Korean, Pretendard font)
        ├── page.tsx                   # Homepage
        ├── not-found.tsx              # 404 page
        ├── sitemap.ts                 # Dynamic sitemap generator
        ├── globals.css                # Tailwind imports + custom styles
        ├── lotto/
        │   ├── page.tsx               # Lotto landing page
        │   ├── recommend/
        │   │   ├── page.tsx           # Number recommendation (server)
        │   │   └── RecommendClient.tsx # Recommendation UI (client)
        │   ├── results/
        │   │   ├── page.tsx           # Latest 20 results
        │   │   └── [round]/page.tsx   # Round detail (statically generated)
        │   └── stats/page.tsx         # Statistics & frequency analysis
        ├── blog/
        │   ├── page.tsx               # Blog list page
        │   └── [slug]/page.tsx        # Blog detail (statically generated)
        ├── about/page.tsx             # About page
        ├── privacy/page.tsx           # Privacy policy
        ├── terms/page.tsx             # Terms of service
        └── contact/page.tsx           # Contact page (rottery0.kr@gmail.com)
```

---

## Recommendation Algorithms

Six methods implemented in `src/lib/lottery/recommend.ts`:

| Method | Korean Name | Description |
|--------|-------------|-------------|
| `random` | 랜덤 추천 | Pure random from 1-45 |
| `statistics` | 통계 기반 | Weighted by all-time frequency |
| `hot` | 핫넘버 기반 | Weighted by recent 20-draw frequency (3x multiplier) |
| `cold` | 콜드넘버 기반 | Inverse recent frequency weighting |
| `balanced` | 균형 추천 | 1 number per section (1-9, 10-18, 19-27, 28-36, 37-45) + odd/even balance |
| `ai` | AI 종합 추천 | Composite: 20% all-time + 25% hot + 15% cold + 30% random + balance filter |

---

## Data Credibility Verification

Data from superkts.com was cross-verified against 4 independent sources for rounds 1208-1210:

### Round 1210 (2026-02-07): 1, 7, 9, 17, 27, 38 + Bonus 31

| Source | Numbers Match | Bonus Match |
|--------|-------------|-------------|
| superkts.com (our source) | Baseline | Baseline |
| kr.lottolyzer.com | Yes | Yes |
| picknum.com | Yes | Yes |
| Korean news (khan.co.kr, mt.co.kr) | Yes | Yes |

### Round 1209 (2026-01-31): 2, 17, 20, 35, 37, 39 + Bonus 24

| Source | Numbers Match | Bonus Match |
|--------|-------------|-------------|
| superkts.com | Baseline | Baseline |
| kr.lottolyzer.com | Yes | Yes |
| picknum.com | Yes | Yes |
| Korean news (khan.co.kr, namdonews.com) | Yes | Yes |

### Round 1208 (2026-01-24): 6, 27, 30, 36, 38, 42 + Bonus 25

| Source | Numbers Match | Bonus Match |
|--------|-------------|-------------|
| superkts.com | Baseline | Baseline |
| kr.lottolyzer.com | Yes | Yes |
| picknum.com | Yes | Yes |
| Korean news (khan.co.kr, news1.kr) | Yes | Yes |

**Credibility Rating: HIGH** - 100% consistency across all sources for all tested rounds.

**Note:** dhlottery.co.kr (official government site) was inaccessible programmatically due to RSA bot protection. All other sources ultimately derive their data from the official draws.

---

## Deployment Plan

### Prerequisites

1. **GitHub Repository:** Push code to GitHub (currently at `github.com/brevity-k/rotter_kr`)
2. **Vercel Account:** Sign up at vercel.com and connect your GitHub repo
3. **Domain:** Configure `lottery.io.kr` DNS to point to Vercel

### Deploy Steps

1. Push to GitHub (any branch triggers deploy if connected to Vercel)
2. Vercel automatically runs `npm run build` which:
   - Runs `prebuild` script (fetches latest lottery data from superkts.com)
   - Builds all static pages
   - Deploys to CDN
3. Custom domain setup in Vercel dashboard

### Updating Lottery Data

Data is updated automatically on every build via the `prebuild` script. To trigger a data update:
- Push any commit (triggers Vercel rebuild)
- Or use Vercel dashboard "Redeploy" button
- For automated weekly updates, use GitHub Actions cron (see Auto Blog section below)

---

## Google AdSense Setup

### What You Need to Provide

1. **Google AdSense Account**
   - Sign up at [adsense.google.com](https://adsense.google.com)
   - Need a Google account
   - Site must be live and accessible for review

2. **AdSense Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)
   - After approval, update `public/ads.txt` with your publisher ID:
     ```
     google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
     ```
   - Update `src/components/ads/AdBanner.tsx` to use your client ID

3. **AdSense Script Tag**
   - Add to `src/app/layout.tsx` in `<head>`:
     ```html
     <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
     ```

4. **Ad Unit IDs**
   - Create ad units in AdSense dashboard for each placement
   - The site has 5+ ad placements ready (see `AdBanner` component usage in pages)
   - Recommended formats: responsive banner, in-article, sidebar

### AdSense Approval Requirements (Already Satisfied)

The site already has these pages required for AdSense approval:
- `/about` - About page
- `/privacy` - Privacy policy (mentions AdSense cookies, Google Analytics)
- `/terms` - Terms of service
- `/contact` - Contact page

Additional requirements:
- Site must have sufficient original content (we have 1,210+ rounds of data + stats + recommendations)
- Site must be at least a few weeks old with regular traffic
- No copyright-infringing content
- Must be in a supported language (Korean is supported)

### AdSense Integration Checklist

- [ ] Sign up for Google AdSense
- [ ] Submit site for review (lottery.io.kr)
- [ ] Wait for approval (typically 1-4 weeks)
- [ ] Get Publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`)
- [ ] Update `public/ads.txt` with publisher ID
- [ ] Add AdSense script tag to `layout.tsx`
- [ ] Create ad units in AdSense dashboard
- [ ] Update `AdBanner.tsx` component with real ad unit IDs
- [ ] Test ad display on live site
- [ ] Monitor earnings in AdSense dashboard

---

## Auto Blog Post Generation (IMPLEMENTED)

### Architecture

```
GitHub Actions (cron: Sunday 10:00 KST)
  --> scripts/update-data.ts (refresh lottery data)
  --> scripts/generate-blog-post.ts (Claude Haiku 4.5 API)
  --> content/blog/{slug}.json
  --> git commit & push
  --> Vercel rebuild (static pages including new blog post)
```

### Blog Data Flow

1. Blog posts are stored as JSON files in `content/blog/`
2. `src/lib/blog.ts` reads all JSON files at build time (mirrors `dhlottery.ts` pattern with fs.readFileSync + cache)
3. `src/lib/utils/markdown.ts` converts markdown content to HTML (zero dependencies)
4. `/blog` list page and `/blog/[slug]` detail pages are statically generated via `generateStaticParams()`
5. Blog URLs are included in `sitemap.ts`, nav header, footer, and homepage

### Blog Post Format (JSON)

```json
{
  "slug": "1210-draw-analysis",
  "title": "제1210회 로또 당첨번호 분석",
  "description": "Short description for SEO",
  "content": "Markdown content here...",
  "date": "2026-02-09",
  "category": "당첨번호 분석",
  "tags": ["1210회", "당첨번호", "통계분석"]
}
```

### Topic Rotation

8 topic templates in `scripts/blog-topics.json`:

| Topic ID | Description |
|----------|-------------|
| `draw-analysis` | Latest round draw analysis (priority if not yet written) |
| `weekly-trend` | Weekly trend analysis with hot/cold numbers |
| `number-deep-dive` | Deep analysis of a specific number |
| `section-analysis` | Section-by-section frequency analysis |
| `odd-even-analysis` | Odd/even ratio pattern analysis |
| `consecutive-numbers` | Consecutive number probability analysis |
| `first-timer-guide` | Beginner's guide to lottery |
| `historical-jackpot` | Historical jackpot records |

The script auto-selects: draw analysis for new rounds first, then rotates other topics by week number.

### Schedule & Cost

- **Frequency:** Weekly (Sunday 10:00 KST via GitHub Actions cron)
- **Model:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
- **Cost:** ~$0.88/year for 52 weekly posts
- **Manual trigger:** `workflow_dispatch` enabled in GitHub Actions

### Required Setup

- [ ] Add `ANTHROPIC_API_KEY` as GitHub Actions secret (Settings > Secrets > Actions)
- Get key from [console.anthropic.com](https://console.anthropic.com)

### Seed Posts (3 included)

| Slug | Category |
|------|----------|
| `1210-draw-analysis` | 당첨번호 분석 |
| `lotto-number-selection-strategies` | 전략 가이드 |
| `understanding-lotto-probability` | 교육 |

### SEO Best Practices

- Every post grounded in real data from `lotto.json`
- 8 different topic templates for variety
- Each post targets distinct long-tail keywords
- AI disclaimer included: "이 글은 AI 분석 도구의 도움을 받아 작성되었으며, 실제 당첨 데이터를 기반으로 합니다."
- Monitor Google Search Console and Naver Search Advisor

---

## Known Issues & Technical Notes

### dhlottery.co.kr API is Blocked

The official lottery API (`dhlottery.co.kr/common.do?method=getLottoNumber`) now returns an HTML page with RSA JavaScript challenge instead of JSON. This is bot protection added sometime in 2025-2026. We use superkts.com as an alternative data source, which scrapes the official data and exposes it via HTML meta tags.

### Prize Amount Parsing

The `update-data.ts` script extracts prize amounts from two sources:
1. **Meta description** (Korean notation): `11억229만8407원씩` → parsed by `parseKoreanAmount()`
2. **HTML body** (exact numbers): `1,102,298,407원` → parsed by `parseCommaNumber()` (preferred, more precise)

The HTML body extraction only runs when `winners > 0` to avoid picking up 2nd prize amounts for rounds with no 1st place winners. `totSellamnt` (total selling amount) is not available from superkts.com and remains 0.

Out of 1,210 rounds: 1,196 have prize data, 14 have `firstWinamnt: 0` (no 1st prize winners — rounds 1, 4, 5, 7, 8, 9, 13, 18, 24, 41, 71, 289, 295, 463).

### Git Push Authentication

If pushing to GitHub fails with 403, it may be because macOS Keychain caches a different GitHub account's credentials (`psychemistz`). Workaround:

```bash
git -c http.extraHeader="Authorization: Basic $(echo -n 'brevity-k:YOUR_GITHUB_PAT' | base64)" push origin main
```

### Performance

The site was originally making 50-100 API calls per page load to dhlottery.co.kr, causing 30-60 second load times. This was fixed by:
1. Pre-fetching all data to `src/data/lotto.json`
2. Rewriting all data access to use synchronous local file reads
3. Converting all pages from async to sync
4. Adding `generateStaticParams()` for round detail pages

---

## Phase Roadmap (from PLAN.md)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | COMPLETE | Lotto 6/45 - core site, recommendations, stats, results |
| Phase 2 | Not started | Add pension lottery (연금복권 720+), more lottery types |
| Phase 3 | IN PROGRESS | Blog system (DONE), community features, push notifications |
| Phase 4 | Not started | Mobile app (PWA), premium features |

---

## Dependencies

### Production
- `next` ^16.1.6
- `react` / `react-dom` ^19.2.4
- `chart.js` ^4.5.1
- `react-chartjs-2` ^5.3.1
- `@vercel/analytics` ^1.6.1

### Development
- `typescript` ^5
- `tailwindcss` ^4
- `@tailwindcss/postcss` ^4
- `@anthropic-ai/sdk` ^0.74.0
- `tsx` ^4.21.0
- `eslint` ^9
- `eslint-config-next` 16.2.0-canary.35
