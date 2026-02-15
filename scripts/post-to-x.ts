/**
 * Posts the latest unposted blog post to X (Twitter) using OAuth 1.0a.
 *
 * Run: X_CONSUMER_KEY=... X_SECRET_KEY=... X_ACCESS_TOKEN=... X_ACCESS_TOKEN_SECRET=... npx tsx scripts/post-to-x.ts
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import type { BlogPost } from "../src/types/lottery";
import { withRetry, withTimeout, BLOG_DIR, formatKSTDate } from "./lib/shared";

const TRACKING_PATH = path.join(process.cwd(), "scripts/x-posted.json");
const SITE_URL = "https://lottery.io.kr";
const T_CO_URL_LENGTH = 23; // X wraps all URLs to 23 chars via t.co
const X_MAX_WEIGHTED_CHARS = 280;

interface PostedEntry {
  slug: string;
  tweetId: string;
  postedAt: string;
}

interface TrackingData {
  posted: PostedEntry[];
}

/** Category → emoji mapping for tweet text. */
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
  // Sort by date descending (latest first)
  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

/**
 * Calculates X's weighted character count.
 * CJK/emoji = 2, Latin/number/space/punctuation = 1, URLs = 23 (t.co).
 */
function weightedLength(text: string): number {
  const urlRegex = /https?:\/\/\S+/g;
  const urls = text.match(urlRegex) || [];
  const noUrls = text.replace(urlRegex, "");
  let weight = urls.length * T_CO_URL_LENGTH;
  for (const ch of noUrls) {
    const code = ch.codePointAt(0) ?? 0;
    // CJK Jamo, CJK Symbols, CJK Unified, Hangul Syllables, CJK Compat, Emoji
    if (
      (code >= 0x1100 && code <= 0x11ff) ||
      (code >= 0x3000 && code <= 0x9fff) ||
      (code >= 0xac00 && code <= 0xd7ff) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0x1f000 && code <= 0x1ffff)
    ) {
      weight += 2;
    } else {
      weight += 1;
    }
  }
  return weight;
}

function buildTweetText(post: BlogPost): string {
  const emoji = CATEGORY_EMOJI[post.category] ?? DEFAULT_EMOJI;
  const link = `${SITE_URL}/blog/${post.slug}`;

  // Build hashtags: first 3 tags + always include #로또
  const tagSet = new Set<string>();
  tagSet.add("#로또");
  for (const tag of post.tags.slice(0, 3)) {
    const cleaned = tag.replace(/^#/, "");
    if (cleaned) tagSet.add(`#${cleaned}`);
  }
  const hashtags = [...tagSet].join(" ");

  // Format: "{emoji} {title}\n\n{description}\n\n{link}\n\n{hashtags}"
  const prefix = `${emoji} ${post.title}`;
  const suffix = `\n\n${hashtags}`;
  const skeleton = `${prefix}\n\n\n\n${link}${suffix}`; // with empty desc placeholder
  const fixedWeight = weightedLength(skeleton);
  const maxDescWeight = X_MAX_WEIGHTED_CHARS - fixedWeight;

  if (maxDescWeight <= 0) {
    return `${prefix}\n\n${link}${suffix}`;
  }

  let description = post.description || "";
  // Trim description to fit weighted budget
  let trimmed = "";
  let descWeight = 0;
  for (const ch of description) {
    const code = ch.codePointAt(0) ?? 0;
    const w =
      (code >= 0x1100 && code <= 0x11ff) ||
      (code >= 0x3000 && code <= 0x9fff) ||
      (code >= 0xac00 && code <= 0xd7ff) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0x1f000 && code <= 0x1ffff)
        ? 2
        : 1;
    if (descWeight + w > maxDescWeight - 2) {
      // -2 for "…"
      trimmed += "…";
      break;
    }
    trimmed += ch;
    descWeight += w;
  }

  if (trimmed) {
    return `${prefix}\n\n${trimmed}\n\n${link}${suffix}`;
  }
  return `${prefix}\n\n${link}${suffix}`;
}

// --- OAuth 1.0a signing (native, no dependencies) ---

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

function buildOAuthHeader(
  method: string,
  url: string,
  bodyParams: Record<string, string>,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  tokenSecret: string
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = generateNonce();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  // Combine all params for signature base string
  const allParams: Record<string, string> = { ...oauthParams, ...bodyParams };
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map((k) => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join("&");

  const signatureBase = `${method}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  oauthParams["oauth_signature"] = signature;

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${headerParts}`;
}

async function postTweet(
  text: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  tokenSecret: string
): Promise<string> {
  const url = "https://api.x.com/2/tweets";
  const body = JSON.stringify({ text });

  const authHeader = buildOAuthHeader(
    "POST",
    url,
    {}, // X API v2 uses JSON body, not form-encoded — body params are NOT included in OAuth signature
    consumerKey,
    consumerSecret,
    accessToken,
    tokenSecret
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `X API error ${response.status}: ${responseText}`
    );
  }

  const result = JSON.parse(responseText);
  const tweetId = result?.data?.id;
  if (!tweetId) {
    throw new Error(`X API returned unexpected response: ${responseText}`);
  }

  return tweetId;
}

async function main(): Promise<void> {
  // Load env vars
  const consumerKey = process.env.X_CONSUMER_KEY;
  const consumerSecret = process.env.X_SECRET_KEY;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const tokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!consumerKey || !consumerSecret || !accessToken || !tokenSecret) {
    console.error(
      "❌ Missing X API credentials. Set X_CONSUMER_KEY, X_SECRET_KEY, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET."
    );
    process.exit(1);
  }

  // Load blog posts and tracking data
  const posts = loadBlogPosts();
  const tracking = loadTrackingData();
  const postedSlugs = new Set(tracking.posted.map((e) => e.slug));

  // Find the latest unposted post
  const unposted = posts.find((p) => !postedSlugs.has(p.slug));
  if (!unposted) {
    console.log("✅ No unposted blog posts found — nothing to do.");
    process.exit(0);
  }

  const tweetText = buildTweetText(unposted);
  console.log(`🐦 Posting to X: ${unposted.slug}`);
  console.log(`   Tweet (${weightedLength(tweetText)} weighted chars):\n${tweetText}\n`);

  const tweetId = await withRetry(
    () =>
      withTimeout(
        postTweet(tweetText, consumerKey, consumerSecret, accessToken, tokenSecret),
        30_000,
        "X API"
      ),
    3,
    "X API"
  );

  console.log(`✅ Tweet posted: https://x.com/i/status/${tweetId}`);

  // Update tracking file
  tracking.posted.push({
    slug: unposted.slug,
    tweetId,
    postedAt: formatKSTDate(),
  });
  saveTrackingData(tracking);

  console.log(`📝 Tracking file updated: ${TRACKING_PATH}`);
}

main().catch((err) => {
  console.error("❌ Failed to post to X:", err);
  process.exit(1);
});
