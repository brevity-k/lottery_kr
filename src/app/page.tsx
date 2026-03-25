import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getAllResults } from "@/lib/api/dhlottery";
import { getRecentBlogPosts } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import BacktestClient from "./BacktestClient";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const allResults = getAllResults();
  const recentPosts = getRecentBlogPosts(3);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "내 번호 역대 당첨 검사 - 로또리",
      url: SITE_URL,
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web",
      description: `나의 로또 번호가 역대 ${allResults.length}회 추첨결과와 얼마나 일치하는지 즉시 검사합니다.`,
      inLanguage: "ko",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "KRW",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: "로또 번호 추천, 당첨번호 분석, 통계, 명당 판매점 지도 등 무료 서비스",
      inLanguage: "ko",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        // JSON-LD is serialized from a trusted static object, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          내 로또 번호, 역대 당첨번호와 비교하세요
        </h1>
        <p className="text-gray-600 text-lg">
          {allResults.length.toLocaleString()}회 전체 추첨 결과에서 당신의 번호를 검사합니다
        </p>
      </section>

      {/* Backtest Feature */}
      <Suspense fallback={null}>
        <BacktestClient allResults={allResults} />
      </Suspense>

      {/* Recent Blog Posts */}
      {recentPosts.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">최근 블로그</h2>
            <Link
              href="/blog"
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              전체보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
              >
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {post.category}
                </span>
                <h3 className="font-bold text-gray-900 mt-2 mb-1 text-sm line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500">{post.date}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SEO Text */}
      <section className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-3">내 번호 역대 당첨 검사란?</h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong>내 번호 역대 당첨 검사</strong>는 나만의 로또 번호가 역대 모든 추첨 결과에서
            얼마나 일치했는지 한눈에 확인할 수 있는 무료 서비스입니다.
            6개 번호를 입력하면 {allResults.length.toLocaleString()}회 이상의 전체 데이터를 즉시 분석합니다.
          </p>
          <p>
            등수별 당첨 현황, 가장 근접했던 순간, 그리고 매주 1장씩 구매했을 때의 수익 분석까지
            스토리 형식으로 드라마틱하게 보여드립니다. 결과는 링크로 공유할 수 있어 친구, 가족과 함께 즐길 수 있습니다.
          </p>
          <p className="text-gray-500 text-xs">
            ※ 본 서비스는 과거 당첨 데이터를 기반으로 한 분석 도구이며, 미래 당첨을 보장하지 않습니다.
            복권 구매는 개인의 판단과 책임 하에 이루어져야 합니다.
          </p>
        </div>
      </section>
    </div>
  );
}
