/**
 * Generates a weekly prediction blog post for the upcoming lottery draw.
 * Runs every Friday before the Saturday draw.
 *
 * Run: ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-prediction.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import type { LottoResult, LottoDataFile, BlogPost } from "../src/types/lottery";
import { withRetry, withTimeout, getDrawNumbers, validateBlogContent, buildLotteryContext, loadLottoData, ensureDir, formatKSTDate, BLOG_DIR, LOTTO_MIN_NUMBER, LOTTO_MAX_NUMBER, LOTTO_NUMBERS_PER_SET, LOTTO_SECTIONS } from "./lib/shared";

function computeFrequency(draws: LottoResult[]): Map<number, number> {
  const freq = new Map<number, number>();
  for (let i = LOTTO_MIN_NUMBER; i <= LOTTO_MAX_NUMBER; i++) freq.set(i, 0);
  for (const draw of draws) {
    for (const n of getDrawNumbers(draw)) {
      freq.set(n, (freq.get(n) || 0) + 1);
    }
  }
  return freq;
}

function getTopN(freq: Map<number, number>, n: number, ascending = false): number[] {
  return [...freq.entries()]
    .sort((a, b) => ascending ? a[1] - b[1] : b[1] - a[1])
    .slice(0, n)
    .map(([num]) => num);
}

function generateRecommendedSets(data: LottoDataFile): string {
  const recent20 = data.draws.slice(0, 20);
  const recentFreq = computeFrequency(recent20);
  const allFreq = computeFrequency(data.draws);

  const hotNumbers = getTopN(recentFreq, 10);
  const coldNumbers = getTopN(recentFreq, 10, true);
  const allTimeTop = getTopN(allFreq, 15);

  // Set 1: Hot numbers weighted
  const set1 = pickWeighted(hotNumbers, 6);
  // Set 2: Mix of hot + all-time
  const mixed = [...hotNumbers.slice(0, 5), ...allTimeTop.slice(0, 5)];
  const set2 = pickWeighted([...new Set(mixed)], 6);
  // Set 3: Balanced (1 per section + some cold)
  const set3 = pickBalanced(coldNumbers);

  return [
    `A세트 (핫넘버 기반): ${set1.sort((a, b) => a - b).join(", ")}`,
    `B세트 (종합 분석): ${set2.sort((a, b) => a - b).join(", ")}`,
    `C세트 (균형 추천): ${set3.sort((a, b) => a - b).join(", ")}`,
  ].join("\n");
}

function pickWeighted(pool: number[], count: number): number[] {
  const result: number[] = [];
  const available = [...pool];
  while (result.length < count && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    result.push(available[idx]);
    available.splice(idx, 1);
  }
  // Fill remaining from random if pool too small
  while (result.length < count) {
    const n = Math.floor(Math.random() * LOTTO_MAX_NUMBER) + LOTTO_MIN_NUMBER;
    if (!result.includes(n)) result.push(n);
  }
  return result;
}

function pickBalanced(coldNumbers: number[]): number[] {
  const result: number[] = [];
  for (const [min, max] of LOTTO_SECTIONS) {
    const coldInSection = coldNumbers.filter((n) => n >= min && n <= max);
    if (coldInSection.length > 0) {
      result.push(coldInSection[Math.floor(Math.random() * coldInSection.length)]);
    } else {
      result.push(min + Math.floor(Math.random() * (max - min + 1)));
    }
  }
  // Add 6th number
  while (result.length < LOTTO_NUMBERS_PER_SET) {
    const n = Math.floor(Math.random() * LOTTO_MAX_NUMBER) + LOTTO_MIN_NUMBER;
    if (!result.includes(n)) result.push(n);
  }
  return result;
}

async function generatePrediction(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  const data = loadLottoData();
  const latest = data.draws[0];
  const nextRound = latest.drwNo + 1;

  // Sanity check: ensure we're not predicting a round that was already drawn
  if (data.draws.some((d) => d.drwNo >= nextRound)) {
    console.error(`❌ Round ${nextRound} already exists in data. Data may be stale or script ran late.`);
    process.exit(1);
  }

  const slug = `${nextRound}-prediction`;

  // Duplicate prevention
  const outputPath = path.join(BLOG_DIR, `${slug}.json`);
  if (fs.existsSync(outputPath)) {
    console.log(`✅ Prediction already exists: ${outputPath} — skipping.`);
    process.exit(0);
  }

  // Build rich context — shared base + prediction-specific data
  const baseContext = buildLotteryContext(data);
  const recent20 = data.draws.slice(0, 20);
  const recentFreq = computeFrequency(recent20);
  const hotNumbers = getTopN(recentFreq, 8);
  const coldNumbers = getTopN(recentFreq, 8, true);
  const recommendedSets = generateRecommendedSets(data);

  const context = `${baseContext}

최근 20회차 핫넘버 (출현 빈도 상위): ${hotNumbers.join(", ")}
최근 20회차 콜드넘버 (출현 빈도 하위): ${coldNumbers.join(", ")}

AI 추천 번호 3세트:
${recommendedSets}`;

  console.log(`📝 Generating prediction for round ${nextRound}...`);

  const client = new Anthropic({ apiKey });

  const message = await withRetry(
    () =>
      withTimeout(
        client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 6000,
          messages: [
            {
              role: "user",
              content: `당신은 한국 로또 블로그의 인기 작가입니다. 딱딱한 통계 나열이 아니라, 독자가 재미있게 읽고 공유하고 싶은 글을 씁니다.

톤앤매너:
- 친근하고 대화하듯이 (존댓말 기반, 가끔 구어체 사용)
- 첫 문장에서 호기심을 잡으세요 ("이번 주 로또, 흐름이 심상치 않습니다")
- 숫자에 의미를 부여하세요 ("5주 연속 출현한 19번, 이번 주도 나올까?")
- 독자에게 직접 말하세요 ("당신이라면 이 번호를 넣겠습니까?")

아래 데이터를 참고하여 제${nextRound}회 로또 예상번호 분석 글을 작성해주세요.

${context}

---

다음 내용을 포함하되, 스토리텔링 형식으로 풀어주세요:
1. 지난주 결과 한줄 요약 + 이번 주 흐름 전망
2. 핫넘버 TOP 3 — 왜 주목해야 하는지 (최근 20회 기준)
3. 오래 안 나와서 '폭발 직전'인 콜드넘버 TOP 3
4. AI 추천 번호 3세트 — 각 세트별 한줄 근거
5. '이 번호가 역대 기록에서 얼마나 잘 맞았을지 궁금하다면?' → https://lottery.io.kr 에서 내 번호 검사

작성 규칙:
- 한국어로 작성
- 마크다운 형식 (##, **, -, 등)
- 1500~2500단어
- 데이터에 기반한 사실만 언급 (없는 데이터 지어내지 마세요)
- "예상번호는 통계적 참고자료일 뿐 당첨을 보장하지 않습니다"라는 면책 문구 포함
- 마지막에: "이 글은 AI 분석 도구의 도움을 받아 작성되었으며, 실제 당첨 데이터를 기반으로 합니다."
- 글 끝에 내 번호 검사 CTA: "내 번호의 역대 성적이 궁금하다면? → https://lottery.io.kr 에서 바로 검사해보세요"`,
            },
          ],
        }),
        120_000,
        "Claude API"
      ),
    3,
    "Claude API"
  );

  if (!message.content || message.content.length === 0 || message.content[0].type !== "text") {
    console.error("❌ API에서 예상치 못한 응답 형식을 받았습니다.");
    process.exit(1);
  }
  let content = message.content[0].text;

  if (!content) {
    console.error("❌ API에서 빈 응답을 받았습니다.");
    process.exit(1);
  }

  // Ensure AI disclaimer is present — append if the model omitted it
  const AI_DISCLAIMER = "\n\n---\n\n*이 글은 AI 분석 도구의 도움을 받아 작성되었으며, 실제 당첨 데이터를 기반으로 합니다.*";
  if (!content.includes("AI 분석 도구") && !content.includes("AI가")) {
    content += AI_DISCLAIMER;
  }

  // Validate content — block publication on failure
  const warnings = validateBlogContent(content);
  if (warnings.length > 0) {
    console.error("❌ Content validation failed:");
    for (const w of warnings) {
      console.error(`   - ${w}`);
    }
    process.exit(1);
  }

  const today = formatKSTDate();
  const title = `제${nextRound}회 로또 예상번호 분석 - 이번 주 추천 번호`;

  const firstParagraph = content
    .split("\n")
    .find((l) => l.trim() && !l.startsWith("#"));
  const description = firstParagraph
    ? firstParagraph.replace(/\*\*/g, "").slice(0, 150).trim()
    : title;

  const post: BlogPost = {
    slug,
    title,
    description,
    content,
    date: today,
    category: "예상번호",
    tags: [`${nextRound}회`, "예상번호", "로또전망", "AI추천", "통계분석"],
  };

  ensureDir(BLOG_DIR);
  fs.writeFileSync(outputPath, JSON.stringify(post, null, 2));

  console.log(`✅ Prediction post saved: ${outputPath}`);
  console.log(`   Round: ${nextRound}`);
  console.log(`   Length: ${content.length} chars`);
}

generatePrediction().catch((err) => {
  console.error("❌ Prediction generation failed:", err);
  process.exit(1);
});
