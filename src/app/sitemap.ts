import { MetadataRoute } from "next";
import { getAllResults } from "@/lib/api/dhlottery";
import { getAllBlogPosts } from "@/lib/blog";
import { SITE_URL, LOTTO_MAX_NUMBER } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  // Fixed date for pages that rarely change (avoids new Date() which signals false freshness)
  const siteLastUpdated = "2026-02-23";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: siteLastUpdated, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/lotto`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/lotto/recommend`, lastModified: siteLastUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/lotto/results`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/lotto/stats`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/lotto/simulator`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/lotto/lucky`, lastModified: siteLastUpdated, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/lotto/tax`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.3 },
    // /privacy, /terms, /contact excluded — they have robots noindex
  ];

  // Number detail pages (1-45)
  const numberPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/lotto/numbers`, lastModified: siteLastUpdated, changeFrequency: "weekly" as const, priority: 0.7 },
    ...Array.from({ length: LOTTO_MAX_NUMBER }, (_, i) => ({
      url: `${baseUrl}/lotto/numbers/${i + 1}`,
      lastModified: siteLastUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];

  // All round pages with actual draw dates as lastModified
  let roundPages: MetadataRoute.Sitemap = [];
  try {
    const allResults = getAllResults();
    roundPages = allResults.map((r) => ({
      url: `${baseUrl}/lotto/results/${r.drwNo}`,
      lastModified: r.drwNoDate,
      changeFrequency: "never" as const,
      priority: 0.5,
    }));
  } catch (err) {
    console.error("Sitemap: failed to load lottery data for round pages:", err);
  }

  // Blog pages with actual post dates
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogPosts = getAllBlogPosts();
    blogPages = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: "never" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("Sitemap: failed to load blog posts:", err);
  }

  return [...staticPages, ...roundPages, ...numberPages, ...blogPages];
}
