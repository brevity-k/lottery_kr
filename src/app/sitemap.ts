import { MetadataRoute } from "next";
import { fetchLatestLottoRound } from "@/lib/api/dhlottery";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rottery.kr";
  const latestRound = await fetchLatestLottoRound();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/lotto`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/lotto/recommend`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/lotto/results`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/lotto/stats`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Generate pages for recent 100 rounds
  const roundPages: MetadataRoute.Sitemap = [];
  const startRound = Math.max(1, latestRound - 99);
  for (let i = latestRound; i >= startRound; i--) {
    roundPages.push({
      url: `${baseUrl}/lotto/results/${i}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return [...staticPages, ...roundPages];
}
