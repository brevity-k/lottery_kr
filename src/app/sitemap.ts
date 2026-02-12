import { MetadataRoute } from "next";
import { getLatestRound } from "@/lib/api/dhlottery";
import { getAllBlogPosts } from "@/lib/blog";
import { SITE_URL, LOTTO_MAX_NUMBER } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/lotto`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/lotto/recommend`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/lotto/results`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/lotto/stats`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/lotto/simulator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/lotto/lucky`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/lotto/tax`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Number detail pages (1-45) — always available regardless of data
  const numberPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/lotto/numbers`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    ...Array.from({ length: LOTTO_MAX_NUMBER }, (_, i) => ({
      url: `${baseUrl}/lotto/numbers/${i + 1}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];

  // Round pages — only recent rounds to focus crawl budget on new site
  // Older rounds are discoverable via internal links and pagination
  const SITEMAP_RECENT_ROUNDS = 100;
  let roundPages: MetadataRoute.Sitemap = [];
  try {
    const latestRound = getLatestRound();
    const startRound = Math.max(1, latestRound - SITEMAP_RECENT_ROUNDS + 1);
    for (let i = latestRound; i >= startRound; i--) {
      roundPages.push({
        url: `${baseUrl}/lotto/results/${i}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: i >= latestRound - 10 ? 0.7 : 0.5,
      });
    }
  } catch (err) {
    console.error("Sitemap: failed to load lottery data for round pages:", err);
  }

  // Blog pages — graceful fallback if data loading fails
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogPosts = getAllBlogPosts();
    blogPages = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("Sitemap: failed to load blog posts:", err);
  }

  return [...staticPages, ...roundPages, ...numberPages, ...blogPages];
}
