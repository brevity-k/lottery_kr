/**
 * Generates a blog post using Claude Haiku API based on lottery data.
 *
 * Run: ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-blog-post.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import type { LottoDataFile, BlogPost } from "../src/types/lottery";
import { withRetry, withTimeout, validateBlogContent, buildLotteryContext, buildEnrichedContext, getDrawNumbers, loadLottoData, ensureDir, getKSTDate, formatKSTDate, formatKoreanAmount, BLOG_DIR, TOPICS_PATH } from "./lib/shared";

interface TopicConfig {
  id: string;
  titleTemplate: string;
  category: string;
  tags: string[];
  prompt: string;
  enrichedContext?: boolean;
}

function loadTopics(): TopicConfig[] {
  try {
    if (!fs.existsSync(TOPICS_PATH)) {
      console.error(`❌ Blog topics file not found: ${TOPICS_PATH}`);
      process.exit(1);
    }
    const raw = fs.readFileSync(TOPICS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.topics || !Array.isArray(parsed.topics) || parsed.topics.length === 0) {
      console.error("❌ Invalid topics file: expected non-empty .topics array");
      process.exit(1);
    }
    return parsed.topics;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("❌")) throw err;
    console.error(`❌ Failed to load blog topics: ${err}`);
    process.exit(1);
  }
}

function selectTopic(topics: TopicConfig[], data: LottoDataFile): {
  topic: TopicConfig;
  vars: Record<string, string>;
} {
  const latest = data.draws[0];
  const numbers = getDrawNumbers(latest);
  const numbersStr = numbers.join(", ");
  const nextRound = String(latest.drwNo + 1);

  // Check what posts already exist
  const existingFiles = fs.existsSync(BLOG_DIR)
    ? fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".json"))
    : [];

  // Prefer draw-analysis for the latest round if not already written
  const drawAnalysisSlug = `${latest.drwNo}-draw-analysis.json`;
  const drawTopic = topics.find((t) => t.id === "draw-analysis");
  if (!existingFiles.includes(drawAnalysisSlug) && drawTopic) {
    return {
      topic: drawTopic,
      vars: {
        round: String(latest.drwNo),
        numbers: numbersStr,
        bonus: String(latest.bnusNo),
        nextRound,
      },
    };
  }

  // Otherwise, rotate through other topics based on KST week number
  const kstNow = getKSTDate();
  const weekOfYear = Math.ceil(
    (kstNow.getTime() - new Date(kstNow.getFullYear(), 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );
  const otherTopics = topics.filter((t) => t.id !== "draw-analysis");
  const selectedTopic = otherTopics[weekOfYear % otherTopics.length];

  const recentCount = "20";
  const year = kstNow.getFullYear().toString();
  const dateEnd = latest.drwNoDate;
  const dateStart =
    data.draws[Math.min(4, data.draws.length - 1)]?.drwNoDate ?? dateEnd;

  // Pick target number — deterministic for number-spotlight (cycles 1-45 by week),
  // random from latest draw for other topics
  const targetNumber = selectedTopic.id === "number-spotlight"
    ? String((weekOfYear % 45) + 1)
    : String(numbers[Math.floor(Math.random() * 6)]);

  // Calculate dateRange for dream-weekly topic (current week Mon~Sun in KST)
  const kstDay = kstNow.getDay(); // 0=Sun
  const mondayOffset = kstDay === 0 ? -6 : 1 - kstDay;
  const monday = new Date(kstNow.getTime() + mondayOffset * 24 * 60 * 60 * 1000);
  const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  const weekDateRange = `${monday.getMonth() + 1}월 ${monday.getDate()}일~${sunday.getMonth() + 1}월 ${sunday.getDate()}일`;

  // Generate random test numbers for what-if backtest topics
  const testNums: number[] = [];
  while (testNums.length < 6) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!testNums.includes(n)) testNums.push(n);
  }
  testNums.sort((a, b) => a - b);
  const testNumbers = testNums.join(", ");
  const testNumbersParam = testNums.join(",");
  const totalCost = `${(data.draws.length * 1000).toLocaleString()}원`;

  // Jackpot info from latest draw
  const jackpot = latest.firstWinamnt > 0
    ? String(latest.firstWinamnt)
    : "2000000000";
  const jackpotNum = Number(jackpot);
  const netJackpot = String(Math.round(jackpotNum * 0.67));

  return {
    topic: selectedTopic,
    vars: {
      round: String(latest.drwNo),
      numbers: numbersStr,
      bonus: String(latest.bnusNo),
      recentCount,
      year,
      dateRange: selectedTopic.id === "dream-weekly" ? weekDateRange : `${dateStart} ~ ${dateEnd}`,
      totalDraws: String(data.draws.length),
      targetNumber,
      nextRound,
      testNumbers,
      testNumbersParam,
      totalCost,
      jackpot: formatKoreanAmount(jackpotNum, false),
      netJackpot: formatKoreanAmount(Number(netJackpot), false),
    },
  };
}


function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

async function generatePost(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error(
      "❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다."
    );
    process.exit(1);
  }

  const data = loadLottoData();
  const topics = loadTopics();
  const { topic, vars } = selectTopic(topics, data);

  const title = fillTemplate(topic.titleTemplate, vars);
  const prompt = fillTemplate(topic.prompt, vars);
  const tags = topic.tags.map((t) => fillTemplate(t, vars));
  const context = topic.enrichedContext
    ? buildEnrichedContext(data)
    : buildLotteryContext(data);

  // Generate slug — use KST date for Korean audience
  const today = formatKSTDate();
  const slug =
    topic.id === "draw-analysis"
      ? `${vars.round}-draw-analysis`
      : `${topic.id}-${today}`;

  // Duplicate prevention: check if output file already exists
  const outputPath = path.join(BLOG_DIR, `${slug}.json`);
  if (fs.existsSync(outputPath)) {
    console.log(`✅ Post already exists: ${outputPath} — skipping.`);
    process.exit(0);
  }

  console.log(`📝 Generating: ${title}`);
  console.log(`   Topic: ${topic.id}`);

  const client = new Anthropic({ apiKey });

  const systemPrompt = `당신은 한국 로또 블로그 lottery.io.kr의 수석 작가입니다.
당신의 글은 네이버 블로그의 복붙 콘텐츠와 완전히 다릅니다.
독자가 "이건 진짜 다르다"며 끝까지 읽고 카톡으로 공유하는 글을 씁니다.

## 글쓰기 원칙 (반드시 따를 것)

### 1. 첫 문장 = 후킹
- 절대로 "안녕하세요", "오늘은 ~에 대해", "~를 분석해보겠습니다"로 시작하지 마세요.
- 구체적인 장면, 숫자, 질문으로 시작하세요.
- 좋은 예: "2003년 4월 12일, 한 남자가 407억원을 혼자 가져갔다."
- 좋은 예: "63명이 같은 번호를 골랐다. 1인당 4억. 혼자 골랐다면 260억이었다."
- 나쁜 예: "로또 당첨번호 분석을 해보겠습니다."

### 2. 숫자에 의미를 입혀라
- 나쁨: "34번이 181회 출현했습니다"
- 좋음: "34번은 181회로 역대 1위. 9번(133회)보다 48회 더 나왔지만, 이 격차는 1,216회 모수 대비 3%p에 불과합니다."
- 데이터를 나열하지 말고, 데이터가 말하는 이야기를 전달하세요.

### 3. 행동과학/심리학 프레이밍
- 가능하면 인지편향, 행동경제학 개념을 자연스럽게 녹이세요.
- 예: 도박사의 오류, 심적 회계, 쌍곡할인, 소유 효과, 확증 편향, 앵커링
- 학술 용어를 쓰되 쉽게 풀어서 설명하세요.

### 4. 한국적 맥락
- 한국 독자가 공감할 비유와 사례를 사용하세요.
- 예: 잠실야구장, 서울-부산 거리, 아파트 시세, 편의점 커피 가격
- 원화 기준, 한국 세법 기준으로 계산하세요.

### 5. 내부 링크 CTA
글 끝에 반드시 다음 중 관련 있는 링크를 자연스럽게 포함하세요:
- 번호 추천: /lotto/recommend
- 통계 분석: /lotto/stats
- 시뮬레이터: /lotto/simulator
- 세금 계산기: /lotto/tax
- 꿈해몽: /lotto/dream
- 당첨번호 조회: /lotto/results

### 6. 표(table)와 비교를 적극 활용
- 마크다운 표로 핵심 데이터를 정리하세요.
- 비교/대조 구조가 독자의 이해를 돕습니다.

## 금지 사항
- "~에 대해 알아보겠습니다" 식의 서론 금지
- "마치며", "마무리하며" 같은 클리셰 결론 금지
- 근거 없는 데이터 날조 금지 — 제공된 데이터만 사용
- 이모지 사용 금지
- "이 글은 AI 분석 도구의 도움을 받아 작성되었으며"는 글 맨 끝에 한 번만`;

  const userPrompt = `아래 데이터를 참고하여 블로그 글을 작성하세요.

${context}

---

주제: ${prompt}

작성 규칙:
- 한국어, 마크다운 형식
- 2000~4000자 (충분히 깊이 있게)
- 제공된 데이터의 실제 수치를 인용할 것 (구체적 회차, 번호, 금액)
- 마지막에 면책 문구 + AI 작성 안내 포함
- 내부 링크 CTA 포함`;

  const message = await withRetry(
    () =>
      withTimeout(
        client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 8000,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: userPrompt,
            },
          ],
        }),
        180_000,
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

  // Create description from first paragraph
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
    category: topic.category,
    tags,
  };

  ensureDir(BLOG_DIR);
  fs.writeFileSync(outputPath, JSON.stringify(post, null, 2));

  console.log(`✅ Blog post saved: ${outputPath}`);
  console.log(`   Slug: ${slug}`);
  console.log(`   Length: ${content.length} chars`);
}

generatePost().catch((err) => {
  console.error("❌ Generation failed:", err);
  process.exit(1);
});
