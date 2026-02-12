/**
 * Generates a blog post using Claude Haiku API based on lottery data.
 *
 * Run: ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-blog-post.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import type { LottoDataFile, BlogPost } from "../src/types/lottery";
import { withRetry, withTimeout, validateBlogContent, buildLotteryContext, getDrawNumbers, loadLottoData, ensureDir, BLOG_DIR, TOPICS_PATH } from "./lib/shared";

interface TopicConfig {
  id: string;
  titleTemplate: string;
  category: string;
  tags: string[];
  prompt: string;
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

  // Otherwise, rotate through other topics based on week number
  const weekOfYear = Math.ceil(
    (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );
  const otherTopics = topics.filter((t) => t.id !== "draw-analysis");
  const selectedTopic = otherTopics[weekOfYear % otherTopics.length];

  const recentCount = "20";
  const year = new Date().getFullYear().toString();
  const dateEnd = latest.drwNoDate;
  const dateStart =
    data.draws[Math.min(4, data.draws.length - 1)]?.drwNoDate ?? dateEnd;

  // Pick a random target number for deep-dive topics
  const targetNumber = String(numbers[Math.floor(Math.random() * 6)]);

  return {
    topic: selectedTopic,
    vars: {
      round: String(latest.drwNo),
      numbers: numbersStr,
      bonus: String(latest.bnusNo),
      recentCount,
      year,
      dateRange: `${dateStart} ~ ${dateEnd}`,
      totalDraws: String(data.draws.length),
      targetNumber,
      nextRound,
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
  const context = buildLotteryContext(data);

  // Generate slug
  const today = new Date().toISOString().slice(0, 10);
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

  const message = await withRetry(
    () =>
      withTimeout(
        client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `당신은 한국 로또 6/45 분석 블로그의 전문 작가입니다. 아래 데이터를 참고하여 블로그 글을 작성해주세요.

${context}

---

${prompt}

작성 규칙:
- 한국어로 작성
- 마크다운 형식 (##, **, -, 등)
- 1500~2500단어
- 데이터에 기반한 사실만 언급
- 마지막에 다음 문구를 포함: "이 글은 AI 분석 도구의 도움을 받아 작성되었으며, 실제 당첨 데이터를 기반으로 합니다."
- "당첨을 보장하지 않는다"는 면책 문구 포함`,
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
  const content = message.content[0].text;

  if (!content) {
    console.error("❌ API에서 빈 응답을 받았습니다.");
    process.exit(1);
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
