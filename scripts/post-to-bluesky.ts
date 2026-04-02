/**
 * Posts the latest unposted blog post to Bluesky using the AT Protocol API.
 *
 * Run: BLUESKY_HANDLE=... BLUESKY_APP_PASSWORD=... npx tsx scripts/post-to-bluesky.ts
 */

import * as fs from "fs";
import * as path from "path";
import { AtpAgent, RichText } from "@atproto/api";
import type { BlogPost } from "../src/types/lottery";
import { withRetry, BLOG_DIR, formatKSTDate } from "./lib/shared";

const TRACKING_PATH = path.join(process.cwd(), "scripts/bsky-posted.json");
const SITE_URL = "https://lottery.io.kr";
const MAX_GRAPHEMES = 300;

interface PostedEntry {
  slug: string;
  postUri: string;
  postedAt: string;
}

interface TrackingData {
  posted: PostedEntry[];
}

const CATEGORY_EMOJI: Record<string, string> = {
  "당첨번호 분석": "🎯",
  "예상번호": "🔮",
  "예상번호 분석": "🔮",
};
const DEFAULT_EMOJI = "📊";

function loadTrackingData(): TrackingData {
  try {
    if (fs.existsSync(TRACKING_PATH)) {
      const raw = fs.readFileSync(TRACKING_PATH, "utf-8");
      const data = JSON.parse(raw) as TrackingData;
      if (Array.isArray(data.posted)) return data;
    }
  } catch (err) {
    console.warn(`⚠️ Failed to load tracking file, starting fresh: ${err}`);
  }
  return { posted: [] };
}

function saveTrackingData(data: TrackingData): void {
  fs.writeFileSync(TRACKING_PATH, JSON.stringify(data, null, 2) + "\n");
}

function loadBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".json"));
  const posts: BlogPost[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const post = JSON.parse(raw) as BlogPost;
      if (post.slug && post.title && post.date) {
        posts.push(post);
      }
    } catch {
      // Skip malformed files
    }
  }
  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

function graphemeLength(text: string): number {
  const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });
  return [...segmenter.segment(text)].length;
}

function buildPostText(post: BlogPost): string {
  const emoji = CATEGORY_EMOJI[post.category] ?? DEFAULT_EMOJI;
  const link = `${SITE_URL}/blog/${post.slug}`;

  const tagSet = new Set<string>();
  tagSet.add("#로또");
  for (const tag of post.tags.slice(0, 3)) {
    const cleaned = tag.replace(/^#/, "");
    if (cleaned) tagSet.add(`#${cleaned}`);
  }
  const hashtags = [...tagSet].join(" ");

  const prefix = `${emoji} ${post.title}`;
  const suffix = `\n\n${hashtags}`;
  const skeleton = `${prefix}\n\n\n\n${link}${suffix}`;
  const fixedLen = graphemeLength(skeleton);
  const maxDescLen = MAX_GRAPHEMES - fixedLen;

  if (maxDescLen <= 0) {
    return `${prefix}\n\n${link}${suffix}`;
  }

  let description = post.description || "";
  const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });
  const segments = [...segmenter.segment(description)];

  if (segments.length > maxDescLen - 2) {
    description = segments.slice(0, maxDescLen - 2).map((s) => s.segment).join("") + "…";
  }

  if (description) {
    return `${prefix}\n\n${description}\n\n${link}${suffix}`;
  }
  return `${prefix}\n\n${link}${suffix}`;
}

async function main(): Promise<void> {
  const handle = process.env.BLUESKY_HANDLE;
  const appPassword = process.env.BLUESKY_APP_PASSWORD;

  if (!handle || !appPassword) {
    console.error(
      "❌ Missing Bluesky credentials. Set BLUESKY_HANDLE, BLUESKY_APP_PASSWORD."
    );
    process.exit(1);
  }

  const posts = loadBlogPosts();
  const tracking = loadTrackingData();
  const postedSlugs = new Set(tracking.posted.map((e) => e.slug));

  const unposted = posts.find((p) => !postedSlugs.has(p.slug));
  if (!unposted) {
    console.log("✅ No unposted blog posts found — nothing to do.");
    process.exit(0);
  }

  const postText = buildPostText(unposted);
  console.log(`🦋 Posting to Bluesky: ${unposted.slug}`);
  console.log(`   Post (${graphemeLength(postText)} graphemes):\n${postText}\n`);

  const agent = new AtpAgent({ service: "https://bsky.social" });

  await withRetry(
    () => agent.login({ identifier: handle, password: appPassword }),
    3,
    "Bluesky login"
  );

  const rt = new RichText({ text: postText });
  await rt.detectFacets(agent);

  const result = await withRetry(
    () =>
      agent.post({
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
      }),
    3,
    "Bluesky post"
  );

  console.log(`✅ Posted to Bluesky: ${result.uri}`);

  tracking.posted.push({
    slug: unposted.slug,
    postUri: result.uri,
    postedAt: formatKSTDate(),
  });
  saveTrackingData(tracking);

  console.log(`📝 Tracking file updated: ${TRACKING_PATH}`);
}

main().catch((err) => {
  console.error("❌ Failed to post to Bluesky:", err);
  process.exit(1);
});
