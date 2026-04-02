/**
 * Posts the latest unposted blog post to Bluesky using the AT Protocol API.
 *
 * Run: BLUESKY_HANDLE=... BLUESKY_APP_PASSWORD=... npx tsx scripts/post-to-bluesky.ts
 */

import * as path from "path";
import { AtpAgent, RichText } from "@atproto/api";
import type { BlogPost } from "../src/types/lottery";
import {
  withRetry,
  withTimeout,
  formatKSTDate,
  loadBlogPosts,
  loadTrackingData,
  saveTrackingData,
  SITE_URL,
  CATEGORY_EMOJI,
  DEFAULT_EMOJI,
  buildHashtags,
} from "./lib/shared";

const TRACKING_PATH = path.join(process.cwd(), "scripts/bsky-posted.json");
const MAX_GRAPHEMES = 300;

interface BskyPostedEntry {
  slug: string;
  postUri: string;
  postedAt: string;
}

const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });

function graphemeLength(text: string): number {
  return [...segmenter.segment(text)].length;
}

function buildPostText(post: BlogPost): string {
  const emoji = CATEGORY_EMOJI[post.category] ?? DEFAULT_EMOJI;
  const link = `${SITE_URL}/blog/${post.slug}`;
  const hashtags = buildHashtags(post.tags);

  const prefix = `${emoji} ${post.title}`;
  const suffix = `\n\n${hashtags}`;
  const skeleton = `${prefix}\n\n\n\n${link}${suffix}`;
  const maxDescLen = MAX_GRAPHEMES - graphemeLength(skeleton);

  if (maxDescLen <= 0) {
    return `${prefix}\n\n${link}${suffix}`;
  }

  const description = post.description || "";
  const segments = [...segmenter.segment(description)];

  let trimmed = description;
  if (segments.length > maxDescLen - 2) {
    trimmed = segments.slice(0, maxDescLen - 2).map((s) => s.segment).join("") + "…";
  }

  if (trimmed) {
    return `${prefix}\n\n${trimmed}\n\n${link}${suffix}`;
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
  const tracking = loadTrackingData<BskyPostedEntry>(TRACKING_PATH);
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
    () => withTimeout(
      agent.login({ identifier: handle, password: appPassword }),
      30_000,
      "Bluesky login"
    ),
    3,
    "Bluesky login"
  );

  const rt = new RichText({ text: postText });
  await rt.detectFacets(agent);

  const result = await withRetry(
    () =>
      withTimeout(
        agent.post({
          text: rt.text,
          facets: rt.facets,
          createdAt: new Date().toISOString(),
        }),
        30_000,
        "Bluesky post"
      ),
    3,
    "Bluesky post"
  );

  console.log(`✅ Posted to Bluesky: ${result.uri}`);

  tracking.posted.push({
    slug: unposted.slug,
    postUri: result.uri,
    postedAt: formatKSTDate(),
  });
  saveTrackingData(tracking, TRACKING_PATH);

  console.log(`📝 Tracking file updated: ${TRACKING_PATH}`);
}

main().catch((err) => {
  console.error("❌ Failed to post to Bluesky:", err);
  process.exit(1);
});
