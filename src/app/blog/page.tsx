import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "로또 분석 블로그 - 당첨번호 분석 & 통계 전략",
  description:
    "매주 업데이트되는 로또 당첨번호 분석, 통계 심층분석, 번호 선택 전략을 확인하세요. 데이터 기반 로또 정보 블로그.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "로또 분석 블로그 - 당첨번호 분석 & 통계 전략",
    description:
      "매주 업데이트되는 로또 당첨번호 분석, 통계 심층분석, 번호 선택 전략을 확인하세요. 데이터 기반 로또 정보 블로그.",
    url: "/blog",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  // JSON-LD is serialized from a trusted static object, not user input
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "로또 분석 블로그",
    url: `${SITE_URL}/blog`,
    description: "매주 업데이트되는 로또 당첨번호 분석, 통계 심층분석, 번호 선택 전략 블로그",
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    inLanguage: "ko",
    blogPost: posts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.date,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        // JSON-LD is serialized from a trusted static object, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "블로그" }]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">블로그</h1>
      <p className="text-gray-600 mb-8">
        로또 당첨번호 분석, 통계 심층분석, 전략 가이드 등 유용한 글을
        만나보세요.
      </p>

      {posts.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          아직 작성된 글이 없습니다.
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.date}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {post.description}
                </p>
                <div className="flex gap-2 mt-3">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
