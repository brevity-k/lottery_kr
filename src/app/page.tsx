import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getAllResults } from "@/lib/api/dhlottery";
import { getRecentBlogPosts } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import LottoResultCard from "@/components/lottery/LottoResultCard";
import DrawCountdown from "@/components/lottery/DrawCountdown";
import BacktestClient from "./BacktestClient";

export const metadata: Metadata = {
  title: "로또 6/45 최신 당첨번호 · 다음 회차 카운트다운 - 로또리",
  description:
    "로또 6/45 최신 당첨번호와 다음 추첨까지 실시간 카운트다운을 확인하세요. 번호 추천, 역대 당첨 검사, 통계 분석까지 무료 제공.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const allResults = getAllResults();
  const latestResult = allResults[0];
  const recentPosts = getRecentBlogPosts(3);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "로또 6/45 최신 당첨번호 - 로또리",
      url: SITE_URL,
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web",
      description: `로또 6/45 최신 당첨번호와 다음 추첨 카운트다운. 역대 ${allResults.length}회 데이터 기반 분석.`,
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
      {/* Trusted static JSON-LD — not user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Latest Draw Result */}
      <section className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
          최신 로또 당첨번호
        </h1>
        {latestResult && (
          <Link href={`/lotto/results/${latestResult.drwNo}`}>
            <LottoResultCard result={latestResult} showDetails size="lg" />
          </Link>
        )}
      </section>

      {/* Next Draw Countdown */}
      <section className="mb-8">
        <DrawCountdown nextRound={(latestResult?.drwNo ?? 0) + 1} />
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <QuickLink href="/lotto/recommend" emoji="🎯" label="번호 추천" />
        <QuickLink href="/lotto/results" emoji="🔍" label="당첨번호 조회" />
        <QuickLink href="/lotto/stats" emoji="📊" label="통계 분석" />
        <QuickLink href="/lotto/dream" emoji="🌙" label="꿈해몽 번호" />
      </section>

      {/* Backtest Feature */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
          내 번호 역대 당첨 검사
        </h2>
        <p className="text-gray-600 text-sm text-center mb-4">
          {allResults.length.toLocaleString()}회 전체 추첨 결과에서 당신의 번호를 검사합니다
        </p>
        <Suspense fallback={null}>
          <BacktestClient allResults={allResults} />
        </Suspense>
      </section>

      {/* Recent Blog Posts */}
      {recentPosts.length > 0 && (
        <section className="mb-10">
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
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-3">로또리 - 로또 6/45 종합 서비스</h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong>로또리</strong>는 로또 6/45 최신 당첨번호 확인, 다음 추첨 카운트다운,
            AI 기반 번호 추천, 역대 당첨번호 분석까지 한곳에서 제공하는 무료 서비스입니다.
          </p>
          <p>
            <strong>내 번호 역대 당첨 검사</strong>로 나만의 번호가 {allResults.length.toLocaleString()}회
            전체 추첨에서 얼마나 일치했는지 확인하고, 등수별 현황과 수익 분석을 스토리 형식으로 받아보세요.
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

function QuickLink({ href, emoji, label }: { href: string; emoji: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </Link>
  );
}
