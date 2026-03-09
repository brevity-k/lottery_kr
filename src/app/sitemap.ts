import fs from "fs";
import path from "path";
import { MetadataRoute } from "next";
import { getAllResults } from "@/lib/api/dhlottery";
import { getAllBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  // Use lotto.json modification time so sitemap reflects actual data freshness
  let siteLastUpdated = "2026-02-23";
  try {
    const dataFilePath = path.join(process.cwd(), "src/data/lotto.json");
    const stat = fs.statSync(dataFilePath);
    siteLastUpdated = stat.mtime.toISOString().split("T")[0];
  } catch {
    // fallback to hardcoded date
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: siteLastUpdated, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/lotto/results`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/lotto/recommend`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/lotto/stores`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/lotto/tax`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.3 },
    // /privacy, /terms, /contact excluded — they have robots noindex
    // Removed pages (/lotto, /lotto/stats, /lotto/simulator, etc.) have 301 redirects
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

  return [...staticPages, ...roundPages, ...blogPages];
}
