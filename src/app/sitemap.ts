import fs from "fs";
import path from "path";
import { MetadataRoute } from "next";
import { getAllResults } from "@/lib/api/dhlottery";
import { getAllBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";
import { getAllDreamCategoryIds } from "@/lib/lottery/dream";

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
    { url: `${baseUrl}/lotto/stats`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/lotto/stats/pairs`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/lotto/dream`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/lotto/simulator`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/lotto/lucky`, lastModified: siteLastUpdated, changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/lotto/my-numbers`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/lotto/tax`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/lotto/numbers`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/pension`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/pension/tax`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified: siteLastUpdated, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/lotto/guide/mobile`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: siteLastUpdated, changeFrequency: "monthly", priority: 0.3 },
    // /privacy, /terms, /contact excluded — they have robots noindex
  ];

  // All lottery result pages (round, year, month archives)
  let roundPages: MetadataRoute.Sitemap = [];
  let yearPages: MetadataRoute.Sitemap = [];
  let monthPages: MetadataRoute.Sitemap = [];
  try {
    const allResults = getAllResults();

    roundPages = allResults.map((r) => ({
      url: `${baseUrl}/lotto/results/${r.drwNo}`,
      lastModified: r.drwNoDate,
      changeFrequency: "never" as const,
      priority: 0.5,
    }));

    const yearsSet = new Set<string>();
    const yearMonthsSet = new Set<string>();

    for (const r of allResults) {
      const year = r.drwNoDate.substring(0, 4);
      const yearMonth = r.drwNoDate.substring(0, 7);
      yearsSet.add(year);
      yearMonthsSet.add(yearMonth);
    }

    yearPages = [...yearsSet].sort().map((year) => ({
      url: `${baseUrl}/lotto/results/${year}`,
      lastModified: siteLastUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    monthPages = [...yearMonthsSet].sort().map((ym) => {
      const [year, month] = ym.split("-");
      return {
        url: `${baseUrl}/lotto/results/${year}/${month}`,
        lastModified: siteLastUpdated,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      };
    });
  } catch (err) {
    console.error("Sitemap: failed to load lottery data:", err);
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

  // Individual number pages (1-45)
  const numberPages: MetadataRoute.Sitemap = Array.from({ length: 45 }, (_, i) => ({
    url: `${baseUrl}/lotto/numbers/${i + 1}`,
    lastModified: siteLastUpdated,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  // Dream category pages
  const dreamCategoryPages: MetadataRoute.Sitemap = getAllDreamCategoryIds().map((id) => ({
    url: `${baseUrl}/lotto/dream/${id}`,
    lastModified: siteLastUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...numberPages, ...dreamCategoryPages, ...yearPages, ...monthPages, ...roundPages, ...blogPages];
}
