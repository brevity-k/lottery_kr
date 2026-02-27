# CLAUDE.md - Lottery.kr

## Developer Identity Policy

**STRICT:** Never disclose the developer's real name, personal email, or any GitHub accounts other than `brevity-k` in any code, commits, comments, PRs, issues, documentation, or AI-generated content related to this project. The only public identity for this project is `brevity-k`. Any references to other accounts or personal identifiers must be redacted. This rule applies to all AI assistants, automation scripts, and contributors.

## Project Overview

- **Site:** lottery.io.kr (Korean lottery number recommendation, Korean only)
- **Stack:** Next.js 16 App Router + TypeScript + Tailwind CSS 4 + Chart.js
- **Hosting:** Vercel (auto-deploys on push to `github.com/brevity-k/lottery_kr`)
- **Domain:** lottery.io.kr (Gabia DNS → Vercel)
- **Data:** superkts.com → pre-fetched to `src/data/lotto.json` (build-time only)
- **Blog:** Auto-generated weekly via Claude Haiku 4.5 + GitHub Actions
- **Email:** Resend (contact form, auto-reply)
- **Analytics:** GA4 (`G-TCRP4JXV63`), AdSense (pending approval)
- **Contact:** rottery0.kr@gmail.com

## Quick Commands

```bash
npm run dev                 # Dev server (localhost:3000)
npm run build               # Production build (runs update-data via prebuild)
npm run update-data         # Fetch lottery data from superkts.com
npm run generate-blog       # Blog post via Claude Haiku (needs ANTHROPIC_API_KEY)
npm run generate-prediction # Prediction post for next draw (needs ANTHROPIC_API_KEY)
npm run health-check        # Data freshness, integrity, blog, critical files
npm run post-to-x           # Post latest blog to X/Twitter (needs X_* secrets)
npm run lint                # ESLint
```

## Architecture

### Static-First Design

All data pre-fetched at build time. Zero runtime API calls (except `/api/contact`).

```
scripts/update-data.ts  →  src/data/lotto.json  →  fs.readFileSync at build
content/blog/*.json     →  src/lib/blog.ts      →  fs.readFileSync at build
```

- `prebuild` runs `update-data` before `next build` (graceful degradation if network fails)
- `dhlottery.ts` falls back to `lotto.json.bak` if primary corrupted
- `blog.ts` skips malformed JSON files instead of crashing
- All pages statically generated via `generateStaticParams()`

### Key Patterns

- **Next.js 16 async params:** Dynamic routes use `params: Promise<{...}>` with `await params`
- **KST timezone:** All dates use KST. `src/lib/utils/kst.ts` (app), `scripts/lib/shared.ts` (scripts)
- **Kakao SDK:** Lazy init via `getKakaoSDK()` from `src/lib/utils/kakao.ts` (App Key: `accfcea8c90806c685d4321fa93a4501`)
- **Share pattern:** 3 buttons (Copy / KakaoTalk / Web Share API) used in RecommendResult, LuckyClient, SimulatorClient
- **Hydration-safe:** Client components use `mounted` state pattern for SSR compatibility
- **Translation popup disabled:** `translate="no"` + `notranslate` meta + `Content-Language` meta in `layout.tsx`

## Directory Structure

```
├── scripts/
│   ├── lib/shared.ts              # Shared utilities (paths, constants, retry, validation)
│   ├── update-data.ts             # Fetch lottery data (retry + validation + backup)
│   ├── generate-blog-post.ts      # Blog via Claude Haiku API
│   ├── generate-prediction.ts     # Prediction post generation
│   ├── health-check.ts            # Validates data/blog freshness + critical files
│   ├── post-to-x.ts              # X/Twitter posting (OAuth 1.0a, zero deps)
│   ├── x-posted.json             # Posted slugs tracking (git-tracked)
│   └── blog-topics.json          # 12 topic templates for blog rotation
├── content/blog/                  # Blog post JSON files (auto-generated)
├── src/
│   ├── data/lotto.json            # All lottery rounds (~1,210+, with prizes)
│   ├── types/lottery.ts           # LottoResult, LottoDataFile, BlogPost, etc.
│   ├── lib/
│   │   ├── api/dhlottery.ts       # Lottery data loading (local JSON)
│   │   ├── blog.ts                # Blog data loading (content/blog/*.json)
│   │   ├── constants.ts           # SITE_URL, LOTTO_*, KAKAO_APP_KEY, etc.
│   │   ├── lottery/
│   │   │   ├── recommend.ts       # 6 recommendation algorithms
│   │   │   ├── stats.ts           # Statistical calculations
│   │   │   ├── simulator.ts       # Lottery simulator
│   │   │   └── tax.ts             # Tax calculation (Korean brackets)
│   │   └── utils/                 # format.ts, kakao.ts, kst.ts, markdown.ts
│   ├── components/
│   │   ├── layout/                # Header.tsx, Footer.tsx
│   │   ├── lottery/               # LottoBall, LottoResultCard, RecommendResult, ResultsCountdown
│   │   ├── blog/                  # PredictionResults.tsx
│   │   ├── charts/                # FrequencyChart.tsx (Chart.js)
│   │   └── ads/                   # AdBanner.tsx (returns null until real AdSense ID)
│   └── app/
│       ├── layout.tsx             # Root (Korean, Pretendard, GA4, Kakao SDK)
│       ├── page.tsx               # Homepage
│       ├── sitemap.ts             # Dynamic (all rounds + blog, excludes noindex pages)
│       ├── api/contact/route.ts   # Contact form (Resend)
│       ├── lotto/
│       │   ├── recommend/         # Number recommendation (6 algorithms)
│       │   ├── results/           # Latest results + [round] detail (enriched, JSON-LD)
│       │   ├── stats/             # Statistics & frequency
│       │   ├── lucky/             # Daily lucky numbers (client-side PRNG)
│       │   ├── tax/               # Tax calculator
│       │   └── simulator/         # Lottery simulator
│       ├── blog/                  # Blog list + [slug] detail
│       ├── faq/                   # FAQ with FAQPage JSON-LD
│       ├── about/, privacy/, terms/, contact/
│       └── lotto/numbers/[num]/   # Per-number detail (45 pages)
```

## Recommendation Algorithms

Six methods in `src/lib/lottery/recommend.ts`:

| Method | Description |
|--------|-------------|
| `random` | Pure random 1-45 |
| `statistics` | Weighted by all-time frequency |
| `hot` | Weighted by recent 20-draw frequency (3x) |
| `cold` | Inverse recent frequency |
| `balanced` | 1 per section (1-9, 10-18, 19-27, 28-36, 37-45) + odd/even balance |
| `ai` | Composite: 20% all-time + 25% hot + 15% cold + 30% random + balance filter |

## Weekly Automation

All workflows: retry with 60s delay, auto-create GitHub Issue on failure.

| Day | Time (KST) | Event | Workflow |
|-----|-----------|-------|----------|
| Friday | 19:00 | Generate prediction post | `generate-prediction.yml` |
| Friday | ~19:05 | Tweet prediction | `post-to-x.yml` |
| Saturday | 20:45 | Lotto draw (external) | — |
| Sunday | 00:00 | Fetch new draw data | `update-data.yml` |
| Sunday | 10:00 | Generate blog post | `generate-blog-post.yml` |
| Sunday | ~10:05 | Tweet blog post | `post-to-x.yml` |
| Monday | 12:00 | Health check | `health-check.yml` |

Blog/prediction workflows commit data updates **separately** before content generation (data not lost if AI fails).

### Shared Utilities (`scripts/lib/shared.ts`)

Single source of truth for scripts: file paths, lottery constants, `withRetry()`, `withTimeout()`, `validateDrawData()`, `validateBlogContent()`, `buildLotteryContext()`, `loadLottoData()`.

### Blog Post Format

```json
{
  "slug": "1210-draw-analysis",
  "title": "제1210회 로또 당첨번호 분석",
  "description": "SEO description",
  "content": "Markdown content...",
  "date": "2026-02-09",
  "category": "당첨번호 분석",
  "tags": ["1210회", "당첨번호"]
}
```

12 topic templates in `scripts/blog-topics.json`. Auto-selects draw analysis for new rounds first, then rotates.

## Environment Variables

**Vercel:** `RESEND_API_KEY`

**GitHub Actions Secrets:** `ANTHROPIC_API_KEY`, `X_CONSUMER_KEY`, `X_SECRET_KEY`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`

## Known Issues

### Data Source

Official API (`dhlottery.co.kr`) blocked by RSA bot protection since 2025. Using superkts.com (HTML scraping). Data cross-verified against 4 independent sources — 100% match.

### Prize Parsing

`update-data.ts` extracts prizes from meta description (`parseKoreanAmount()`) and HTML body (`parseCommaNumber()`, preferred). HTML extraction only runs when `winners > 0`. `totSellamnt` unavailable from superkts.com (remains 0). 14 rounds have no 1st prize winners (rounds 1, 4, 5, 7-9, 13, 18, 24, 41, 71, 289, 295, 463).

### Git Authentication

Remote URL uses PAT (avoids macOS Keychain conflict with another local account):
```
origin https://brevity-k:<PAT>@github.com/brevity-k/lottery_kr.git
```
Update on expiry: `git remote set-url origin https://brevity-k:<NEW_PAT>@github.com/brevity-k/lottery_kr.git`

### SEO Notes

- Result pages enriched with stats, JSON-LD, clickable balls (Google indexing fix)
- `/privacy`, `/terms`, `/contact` have `noindex` + excluded from sitemap
- `robots.txt` blocks `/api/`, asset URLs to save crawl budget
- Sitemap uses real dates (draw dates, post dates — not `new Date()`)
- `AdBanner.tsx` returns `null` until real AdSense publisher ID replaces `ca-pub-XXXXXXXXXXXXXXXX`

### Prediction Lifecycle

3-phase client-side countdown (`ResultsCountdown.tsx`):
1. **Before draw** (< Sat 20:45 KST): Blue countdown to draw
2. **After draw** (Sat 20:45 – Sun 00:15): Amber countdown to results
3. **Results available** (>= Sun 00:15 or data exists): Green with actual numbers

`PredictionResults.tsx` enriches prediction posts with actual results at build time via `getLottoResult(round)`.

## Remaining Roadmap

### High Priority
- 꿈해몽 번호 생성기 (`/lotto/dream`) — dream → number mapping (15K+/mo search)
- 로또 명당 판매점 지도 (`/lotto/stores/`) — Kakao Map + data.go.kr (20K+/mo search)
- 연금복권 720+ (`/pension/`) — results, stats, recommendations (10K+/mo search)
- Naver Blog cross-posting (70%+ Korean searches on Naver)
- AdSense approval + ad placement

### Medium Priority
- 운세/별자리 번호 (`/lotto/fortune`) — zodiac-based numbers
- Number generation animation (rolling/revealing)
- PWA push notifications (draw results)
- Blog internal linking to site features

### Low Priority
- My Numbers (localStorage, auto-check weekly)
- Community (Giscus comments, leaderboard)
- KakaoTalk Channel
- YouTube Shorts pipeline

## Dependencies

**Production:** next ^16.1.6, react ^19.2.4, chart.js ^4.5.1, react-chartjs-2 ^5.3.1, @vercel/analytics ^1.6.1, resend
**Dev:** typescript ^5, tailwindcss ^4, @anthropic-ai/sdk ^0.74.0, tsx ^4.21.0, eslint ^9
