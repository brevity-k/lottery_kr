# CLAUDE.md - Lottery.kr Project Documentation

## Project Overview

**Site:** lottery.io.kr (Korean lottery number recommendation)
**Repo:** github.com/brevity-k/lottery_kr
**Stack:** Next.js 16 App Router + TypeScript + Tailwind CSS 4 + Chart.js
**Hosting:** Vercel (free tier) — DEPLOYED & LIVE
**Domain:** lottery.io.kr (registered at Gabia, DNS pointing to Vercel)
**Data Source:** superkts.com (pre-fetched to local JSON)
**Email:** Resend (contact form auto-reply)
**Language:** Korean only
**Revenue Model:** Google AdSense
**Analytics:** Google Analytics 4 (G-TCRP4JXV63)
**Contact:** rottery0.kr@gmail.com

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

All lottery data is pre-fetched at build time. Zero runtime API calls (except contact form).

```
scripts/update-data.ts  -->  src/data/lotto.json  -->  Build-time reads via fs.readFileSync
content/blog/*.json     -->  src/lib/blog.ts      -->  Build-time reads via fs.readFileSync
```

- `prebuild` script runs `update-data` before every `next build`
- Data is cached in memory after first read (`dhlottery.ts`, `blog.ts`)
- All pages are statically generated, including `/lotto/results/[round]` and `/blog/[slug]` via `generateStaticParams()`
- Only dynamic route: `/api/contact` (serverless function for email)

### Data Flow

1. `scripts/update-data.ts` scrapes superkts.com meta descriptions + HTML body in batches of 10
2. Saves to `src/data/lotto.json` (currently ~1,210 rounds, ~252KB, includes prize amounts)
3. `src/lib/api/dhlottery.ts` reads JSON file synchronously at build time
4. `src/lib/blog.ts` reads blog post JSON files from `content/blog/` at build time
5. Pages and components consume data through exported functions

---

## Directory Structure

```
lottery_kr/
├── CLAUDE.md                          # This file
├── PLAN.md                            # Original project plan (14 sections)
├── package.json                       # Dependencies and scripts
├── next.config.ts                     # Next.js configuration
├── tsconfig.json                      # TypeScript configuration
├── postcss.config.mjs                 # PostCSS + Tailwind
├── public/
│   ├── robots.txt                     # Search engine crawl rules (lottery.io.kr)
│   └── ads.txt                        # AdSense publisher verification
├── scripts/
│   ├── update-data.ts                 # Fetches lottery data from superkts.com
│   ├── generate-blog-post.ts          # Generates blog post via Claude Haiku API
│   └── blog-topics.json               # 8 topic templates for blog rotation
├── content/
│   └── blog/                          # Blog post JSON files (auto-generated weekly)
├── .github/
│   └── workflows/
│       ├── update-data.yml            # Weekly data update (Sunday 00:00 KST)
│       └── generate-blog-post.yml     # Weekly blog generation (Sunday 10:00 KST)
└── src/
    ├── data/
    │   └── lotto.json                 # Pre-fetched lottery data (all rounds, with prizes)
    ├── types/
    │   └── lottery.ts                 # TypeScript type definitions (LottoResult, BlogPost, etc.)
    ├── lib/
    │   ├── api/
    │   │   └── dhlottery.ts           # Lottery data loading (reads from local JSON)
    │   ├── blog.ts                    # Blog data loading (reads from content/blog/*.json)
    │   ├── lottery/
    │   │   ├── recommend.ts           # 6 recommendation algorithms
    │   │   ├── stats.ts               # Statistical calculations
    │   │   └── tax.ts                 # Lottery tax calculation (Korean tax rules)
    │   └── utils/
    │       ├── format.ts              # Korean formatting utilities
    │       └── markdown.ts            # Zero-dependency markdown-to-HTML converter
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx             # Responsive header with mobile menu (includes 세금 계산기)
    │   │   └── Footer.tsx             # 3-column footer with links (includes 세금 계산기)
    │   ├── lottery/
    │   │   ├── LottoBall.tsx          # Colored ball (official 5-color scheme)
    │   │   ├── LottoResultCard.tsx    # Result display card (prize per winner + total)
    │   │   └── RecommendResult.tsx    # Client component with copy/KakaoTalk share/Web Share
    │   ├── charts/
    │   │   └── FrequencyChart.tsx     # Chart.js bar chart
    │   └── ads/
    │       └── AdBanner.tsx           # AdSense wrapper (placeholder in dev)
    └── app/
        ├── layout.tsx                 # Root layout (Korean, Pretendard font, GA4, Kakao SDK)
        ├── page.tsx                   # Homepage (includes 최근 블로그 글 section)
        ├── not-found.tsx              # 404 page
        ├── sitemap.ts                 # Dynamic sitemap (lotto rounds + blog posts)
        ├── globals.css                # Tailwind imports + custom styles
        ├── api/
        │   └── contact/route.ts       # Contact form API (Resend email + auto-reply)
        ├── lotto/
        │   ├── page.tsx               # Lotto landing page
        │   ├── recommend/
        │   │   ├── page.tsx           # Number recommendation (server)
        │   │   └── RecommendClient.tsx # Recommendation UI (client)
        │   ├── results/
        │   │   ├── page.tsx           # Latest 20 results
        │   │   └── [round]/page.tsx   # Round detail (statically generated)
        │   ├── stats/page.tsx         # Statistics & frequency analysis
        │   └── tax/
        │       ├── page.tsx           # Tax calculator (server, metadata)
        │       └── TaxCalculatorClient.tsx # Tax calculator UI (client)
        ├── blog/
        │   ├── page.tsx               # Blog list page
        │   └── [slug]/page.tsx        # Blog detail (async params, statically generated)
        ├── about/page.tsx             # About page
        ├── privacy/page.tsx           # Privacy policy
        ├── terms/page.tsx             # Terms of service
        └── contact/
            ├── page.tsx               # Contact page (server, metadata)
            └── ContactForm.tsx        # Contact form (client component)
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

## KakaoTalk Share (IMPLEMENTED)

Dedicated KakaoTalk share button on `/lotto/recommend` using the Kakao JavaScript SDK.

### Integration

- **Kakao JS SDK:** v2.7.4 loaded via `next/script` (`afterInteractive`) in `layout.tsx`
- **App Key:** `accfcea8c90806c685d4321fa93a4501`
- **SDK initialization:** Lazy — `Kakao.init()` called on first share click if not yet initialized

### Share Message

Uses `Kakao.Share.sendDefault()` with `objectType: 'text'`:
- Text: `🎯 로또리 번호 추천\n\nA세트: 1, 7, 12, 25, 33, 41\nB세트: ...`
- Link: `https://lottery.io.kr/lotto/recommend`

### Button Layout (RecommendResult.tsx)

3-button layout: 📋 복사하기 (gray) | 💬 카카오톡 공유 (yellow `#FEE500`) | 📱 공유하기 (blue, Web Share API)

### Prerequisites

- Domain `lottery.io.kr` must be registered in Kakao Developers console (My Application > Platform > Web > Site Domain)

---

## Lottery Tax Calculator (IMPLEMENTED)

Interactive tax calculator at `/lotto/tax` following Korean tax rules (effective 2023-01-01).

### Tax Brackets

| Prize Amount | Income Tax | Local Tax | Total |
|---|---|---|---|
| <= 200만원 | 0% | 0% | 0% (비과세) |
| 200만원 초과 ~ 3억원 | 20% | 2% | 22% |
| 3억원 초과 portion | 30% | 3% | 33% |

- Necessary expense deduction: 1,000원 (ticket cost) before tax calculation
- Progressive brackets: first 3억 at 22%, excess at 33%

### Components

- **`src/lib/lottery/tax.ts`** — Pure tax calculation functions (`calculateLotteryTax()`)
- **`src/app/lotto/tax/page.tsx`** — Server component (metadata + SEO)
- **`src/app/lotto/tax/TaxCalculatorClient.tsx`** — Client component (input, presets, breakdown table, tax rules info)

### Features

- Input field with comma-formatted numbers
- 6 preset buttons (5천원 ~ 20억원)
- Detailed breakdown: 당첨금, 필요경비, 과세대상, 소득세, 지방소득세, 세금합계, 실수령액, 실효세율
- Tax rules reference section with 2023 changes and prize claim info
- Linked from header nav, footer, and lotto landing page (4th feature card)

---

## Auto Blog Post Generation (IMPLEMENTED & VERIFIED)

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

**Important:** `/blog/[slug]/page.tsx` uses `async` params (`Promise<{ slug: string }>`) as required by Next.js 16.

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

### Current Blog Posts (9+)

| Slug | Category | Description |
|------|----------|-------------|
| `1210-draw-analysis` | 당첨번호 분석 | Round 1210 draw analysis |
| `lotto-number-selection-strategies` | 전략 가이드 | 5 number selection strategies |
| `understanding-lotto-probability` | 교육 | Lottery probability explained |
| `gamblers-fallacy` | 수학과 확률 | Gambler's Fallacy and independence |
| `expected-value-lottery` | 수학과 확률 | Expected value of a 1,000 won ticket |
| `birthday-paradox-lottery` | 수학과 확률 | Birthday paradox applied to lottery |
| `law-of-large-numbers` | 수학과 확률 | Convergence proven with 1,200 draws |
| `monte-carlo-simulation-lottery` | 수학과 확률 | Simulating 1M lottery purchases |
| `historical-jackpot-2026-02-11` | 역대 잭팟 | Historical jackpot records (auto-generated) |

New posts are added weekly by GitHub Actions (see workflow section).

### Schedule & Cost

- **Frequency:** Weekly (Sunday 10:00 KST via GitHub Actions cron)
- **Model:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
- **Cost:** ~$0.88/year for 52 weekly posts
- **Manual trigger:** `workflow_dispatch` enabled in GitHub Actions

### SEO Best Practices

- Every post grounded in real data from `lotto.json`
- 8 different topic templates for variety
- Each post targets distinct long-tail keywords
- AI disclaimer included: "이 글은 AI 분석 도구의 도움을 받아 작성되었으며, 실제 당첨 데이터를 기반으로 합니다."
- Monitor Google Search Console and Naver Search Advisor

---

## GitHub Actions Workflows

### 1. Data Update (`update-data.yml`)

- **Schedule:** Saturday 15:00 UTC = Sunday 00:00 KST (after Saturday lottery draw)
- **Action:** Fetches latest lottery data, commits `src/data/lotto.json` if changed
- **Trigger:** Also available via `workflow_dispatch`

### 2. Blog Generation (`generate-blog-post.yml`)

- **Schedule:** Sunday 01:00 UTC = Sunday 10:00 KST
- **Action:** Updates data + generates blog post via Claude API + commits
- **Requires:** `ANTHROPIC_API_KEY` GitHub Actions secret

---

## Contact Form & Auto Email (IMPLEMENTED)

### Architecture

```
User fills form → POST /api/contact → Resend API
  → Email to owner (rottery0.kr@gmail.com)
  → Auto-reply to submitter (confirmation email)
```

### Components

- **`src/app/contact/ContactForm.tsx`** — Client component with form state, validation, success/error handling
- **`src/app/contact/page.tsx`** — Server component with metadata + ContactForm
- **`src/app/api/contact/route.ts`** — API route: validates input, sends 2 emails via Resend

### Email Details

- **To owner:** `[로또리 문의] {subject}` — includes name, email, subject, message
- **Auto-reply:** `[로또리] 문의가 접수되었습니다` — confirms receipt, includes original message

### Required Setup

- Add `RESEND_API_KEY` as Vercel environment variable
- Sign up at [resend.com](https://resend.com) (free: 3,000 emails/month)
- Optional: Add `lottery.io.kr` domain in Resend for branded sender (instead of `onboarding@resend.dev`)

---

## Deployment (COMPLETE)

### Current Setup

- **Vercel:** Connected to `github.com/brevity-k/lottery_kr`, auto-deploys on push
- **Domain:** `lottery.io.kr` (Gabia → Vercel DNS)
- **SSL:** Auto-provisioned by Vercel

### DNS Records (at Gabia)

| Type | Host | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |
| TXT | `_vercel` | `vc-domain-verify=...` |

### Environment Variables

#### Vercel (Settings > Environment Variables)

| Key | Purpose |
|-----|---------|
| `RESEND_API_KEY` | Contact form email delivery |
| `ANTHROPIC_API_KEY` | Blog generation (optional, only if running generate-blog on Vercel) |

#### GitHub Actions (Settings > Secrets > Actions)

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Weekly auto blog generation |

### Setup Checklist

- [x] Deploy to Vercel (import GitHub repo)
- [x] Configure DNS for `lottery.io.kr` → Vercel
- [x] SSL certificate (automatic)
- [ ] Add `RESEND_API_KEY` to Vercel environment variables
- [x] Add `ANTHROPIC_API_KEY` to GitHub Actions secrets
- [ ] (Optional) Add `lottery.io.kr` domain to Resend for branded emails

---

## Google Analytics 4 (IMPLEMENTED)

- **Measurement ID:** `G-TCRP4JXV63`
- **Integration:** `next/script` with `afterInteractive` strategy in `layout.tsx`
- **Status:** Live and tracking on lottery.io.kr

---

## Google AdSense Setup

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

The site already has AdSense-required pages (`/about`, `/privacy`, `/terms`, `/contact`) and 5+ ad placement slots ready.

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

### Result Card Display

`LottoResultCard.tsx` shows:
- **1등 당첨금 (1인):** per-winner prize from `firstWinamnt`
- **1등 당첨자:** winner count from `firstPrzwnerCo`
- **총 1등 당첨금:** calculated as `firstWinamnt * firstPrzwnerCo`
- Rounds with no winners show "해당 없음"

### Next.js 16 Async Params

In Next.js 16, dynamic route `params` is a `Promise` that must be `await`ed. Both `[round]/page.tsx` and `[slug]/page.tsx` use `params: Promise<{...}>` with `await params`.

### Git Push Authentication

The remote URL includes the GitHub PAT for auth (avoids macOS Keychain conflict with `psychemistz` account):

```
origin https://brevity-k:<PAT>@github.com/brevity-k/lottery_kr.git
```

If the PAT expires, update with:
```bash
git remote set-url origin https://brevity-k:<NEW_PAT>@github.com/brevity-k/lottery_kr.git
```

### Performance

The site was originally making 50-100 API calls per page load to dhlottery.co.kr, causing 30-60 second load times. This was fixed by:
1. Pre-fetching all data to `src/data/lotto.json`
2. Rewriting all data access to use synchronous local file reads
3. Converting all pages from async to sync
4. Adding `generateStaticParams()` for round detail pages

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

**Credibility Rating: HIGH** - 100% consistency across all sources for all tested rounds.

---

## Competitive Analysis & Growth Strategy

### Competitive Landscape

| Site | Monthly Visits | Key Differentiator |
|------|---------------|-------------------|
| **dhlottery.co.kr** (official) | ~33.8M | Only legal online lottery purchase site |
| **lottorich.co.kr** | ~500K-1M | Freemium model, dream interpretation, community |
| **lotto.co.kr** | ~327K | Fortune/zodiac-based numbers |
| **lottoen.com** | ~100K+ | Winning store locator ("명당") — their entire brand |
| **lottoplay.co.kr** | ~49K | Mobile app, countdown timer, social login |
| **pyony.com** | ~30K+ | Multi-lottery, store locator, simulator |
| **lottery.io.kr** (ours) | New | Static-first speed, 6 algorithms, auto-blog, tax calculator |

### Traffic-Driving Features We're Missing (by Impact)

| Priority | Feature | Search Volume | Competitors |
|----------|---------|--------------|-------------|
| **HIGH** | 로또 명당 판매점 찾기 (winning store locator) | 20K+/mo | lottoen, pyony, lottoplay |
| **HIGH** | 연금복권 720+ support | 10K+/mo | pyony, freetto, dhlottery |
| **HIGH** | 로또 시뮬레이터 (lottery simulator) | 5K+/mo | Multiple standalone sites |
| **HIGH** | 꿈해몽 번호 (dream interpretation numbers) | 15K+/mo | lottorich, dedicated apps |
| **MEDIUM** | 운세/별자리 번호 (fortune/zodiac numbers) | 5K+/mo | lotto.co.kr, lottorich |
| **MEDIUM** | 오늘의 행운 번호 (daily lucky numbers) | 5K+/mo | superkts, lotto.co.kr |
| **MEDIUM** | 다음 추첨 카운트다운 (countdown timer) | — | lottoplay, pyony |
| **MEDIUM** | FAQ 페이지 + 구조화된 데이터 | Various | Most competitors |
| **LOW** | Community forum | — | lottorich, lottoplay |
| **LOW** | Mobile app (iOS/Android) | — | lottorich, lottoplay |

### SEO Gaps to Fix

| Issue | Impact | Effort |
|-------|--------|--------|
| No `og:image` on any page — social shares show no preview | High | Low |
| Sitemap only includes latest 100 rounds (1,110+ excluded) | High | Low |
| `/lotto/tax` missing from sitemap | Medium | Low |
| No `FAQPage` JSON-LD structured data | High | Medium |
| No `BreadcrumbList` structured data | Medium | Low |
| No per-number detail pages (`/lotto/numbers/[num]`) | High | Medium |
| Blog posts don't link to site features (internal linking) | Medium | Low |
| Tax calculator not linked from result cards | Medium | Low |
| No Naver Blog cross-posting (70%+ Korean searches on Naver) | Very High | Ongoing |

### UX Improvements Needed

- Replace `alert()` with toast notifications (copy confirmation)
- Add number generation animation (rolling/revealing effect)
- Add results search/filter and pagination (currently only latest 20)
- Add active navigation state to Header
- Add breadcrumbs on detail pages
- Improve mobile share button tap targets

---

## Growth Roadmap (Revised)

### Phase 1: COMPLETE
Core Lotto 6/45 — recommendations, stats, results, tax calculator, blog, contact, GA4, KakaoTalk share

### Phase 2: Quick Wins (1-2 weeks each, high impact)

| # | Feature | Target Keywords | Status |
|---|---------|----------------|--------|
| 2.1 | **Lottery simulator** (`/lotto/simulator`) — simulate 1K-100K draws, show total spent vs won | 로또 시뮬레이터 | Not started |
| 2.2 | **OG images** — branded preview images for social sharing | — (CTR improvement) | Not started |
| 2.3 | **Fix sitemap** — include all 1,210+ rounds + tax page | — (indexing improvement) | Not started |
| 2.4 | **FAQ page** (`/faq`) with `FAQPage` JSON-LD | 로또 구매 방법, 당첨금 수령 | Not started |
| 2.5 | **실수령액 계산기** branding — add alias/keyword to tax page title | 로또 실수령액 | Not started |
| 2.6 | **Next draw countdown** on homepage | — (return visits) | Not started |
| 2.7 | **Toast notifications** — replace `alert()` with polished toasts | — (UX) | Not started |
| 2.8 | **Blog post length** — increase to 2,000+ chars for better ranking | — (SEO) | Not started |

### Phase 3: Medium-term (1-3 months, significant traffic growth)

| # | Feature | Target Keywords | Status |
|---|---------|----------------|--------|
| 3.1 | **꿈해몽 번호 생성기** (`/lotto/dream`) — dream symbol → number mapping | 로또 꿈해몽, 꿈 번호 추천 | Not started |
| 3.2 | **오늘의 행운 번호** (`/lotto/lucky`) — daily changing numbers | 오늘의 로또 번호, 행운의 번호 | Not started |
| 3.3 | **연금복권 720+** (`/pension/`) — results, stats, recommendations | 연금복권 당첨번호, 연금복권 확률 | Not started |
| 3.4 | **Per-number detail pages** (`/lotto/numbers/[num]`) — 45 new SEO pages | 로또 번호 7 통계, 번호별 출현 빈도 | Not started |
| 3.5 | **이번주 예상번호** — auto-generated pre-draw prediction page | 1212회 로또 예상번호 | Not started |
| 3.6 | **Naver Blog cross-posting** — 2-3 posts/week, link back to site | — (Naver organic traffic) | Not started |
| 3.7 | **BreadcrumbList + internal linking** improvements | — (SEO) | Not started |
| 3.8 | **Number generation animation** — rolling/revealing ball effect | — (engagement) | Not started |
| 3.9 | **Results search/filter/pagination** — search by round, number, date | — (UX, dwell time) | Not started |

### Phase 4: Long-term (3-6 months, major features)

| # | Feature | Target Keywords | Status |
|---|---------|----------------|--------|
| 4.1 | **로또 명당 판매점 지도** (`/lotto/stores/`) — Kakao Map integration, public data from data.go.kr | 로또 명당, [지역] 로또 판매점 | Not started |
| 4.2 | **PWA push notifications** — Saturday draw results, weekly recommendations | — (retention, 190% increase) | Not started |
| 4.3 | **운세/별자리 번호** (`/lotto/fortune`) — birthday, zodiac, Chinese zodiac | 로또 운세, 별자리 로또 번호 | Not started |
| 4.4 | **My Numbers** — saved numbers with localStorage, auto-check weekly | — (retention) | Not started |
| 4.5 | **Community features** — comments (Giscus), prediction sharing, leaderboard | — (UGC, engagement) | Not started |
| 4.6 | **KakaoTalk Channel** — weekly draw results + recommendations to subscribers | — (retention) | Not started |
| 4.7 | **YouTube Shorts pipeline** — automated weekly draw result videos | — (new traffic source) | Not started |
| 4.8 | **AdSense approval + ad placement** | — (monetization) | Not started |

### Content Strategy

| Content Type | Target Keywords | Frequency |
|---|---|---|
| Weekly draw analysis | "1211회 당첨번호 분석" | Weekly (automated) |
| Pre-draw predictions | "이번주 로또 예상번호" | Weekly (new) |
| Dream interpretation guides | "로또 꿈해몽", "돼지꿈 번호" | 2-3/month |
| Winner store stories | "[지역] 로또 명당" | Monthly |
| Comparison content | "로또 vs 연금복권", "로또 vs 주식" | Monthly |
| Purchase/claim guides | "로또 온라인 구매 방법", "당첨금 수령" | Quarterly |
| Seasonal content | "설날 로또", "추석 로또" | Seasonal |

### Social Media Strategy

| Channel | Strategy | Frequency |
|---------|----------|-----------|
| **Naver Blog** | Cross-post abbreviated analysis, link back to site | 2-3/week |
| **KakaoTalk** | Share buttons on all interactive tools, viral loop | Per interaction |
| **YouTube Shorts** | 15-sec draw results, simulator shock videos | Weekly |
| **DCInside 로또갤** | Share genuine analysis, build reputation | Weekly |
| **Threads/Instagram** | Weekly "핫넘버" infographics, draw result 속보 | Weekly |

### Monetization Path

| Phase | Strategy | Expected Revenue |
|-------|----------|-----------------|
| Current | None | $0 |
| After traffic growth | Google AdSense | $50-500/month |
| Parallel | Naver Ad (네이버 광고) | Korea-specific, may outperform AdSense |
| Later | Premium features (ad-free, advanced filters) | $1K+/month at scale |
| Later | Coupang Partners affiliate | Supplementary |

---

## Dependencies

### Production
- `next` ^16.1.6
- `react` / `react-dom` ^19.2.4
- `chart.js` ^4.5.1
- `react-chartjs-2` ^5.3.1
- `@vercel/analytics` ^1.6.1
- `resend` (contact form email)

### Development
- `typescript` ^5
- `tailwindcss` ^4
- `@tailwindcss/postcss` ^4
- `@anthropic-ai/sdk` ^0.74.0
- `tsx` ^4.21.0
- `eslint` ^9
- `eslint-config-next` 16.2.0-canary.35
