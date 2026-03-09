import { getAllBlogPosts } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

export function GET() {
  const posts = getAllBlogPosts();

  const items = posts
    .slice(0, 20)
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <category><![CDATA[${post.category}]]></category>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} - 로또 분석 블로그</title>
    <link>${SITE_URL}/blog</link>
    <description>로또 6/45 당첨번호 분석, 통계 기반 번호 추천, 복권 전략 콘텐츠</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
