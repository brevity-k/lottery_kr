import type { Metadata } from "next";
import { getRecentResults } from "@/lib/api/dhlottery";
import { calculateStats } from "@/lib/lottery/stats";
import Breadcrumb from "@/components/ui/Breadcrumb";
import RecommendClient from "./RecommendClient";
import { SITE_URL, SITE_NAME } from "@/lib/constants";


export const metadata: Metadata = {
  title: "로또 번호 추천 생성기 - 6가지 통계 기반 추천 [무료]",
  description:
    "랜덤·통계·핫넘버·콜드넘버·균형·AI 6가지 알고리즘으로 로또 번호를 무료 추천합니다. 1,200회+ 당첨 데이터 기반, 지금 바로 이번 주 번호를 받아보세요!",
  alternates: { canonical: "/lotto/recommend" },
  openGraph: {
    title: "로또 번호 추천 생성기 - 6가지 통계 기반 추천 [무료]",
    description:
      "랜덤·통계·핫넘버·콜드넘버·균형·AI 6가지 알고리즘으로 로또 번호를 무료 추천합니다. 1,200회+ 당첨 데이터 기반, 지금 바로 이번 주 번호를 받아보세요!",
    url: "/lotto/recommend",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function RecommendPage() {
  const results = getRecentResults(100);
  const stats = calculateStats(results, 20);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "로또 번호 추천 · 생성기",
    url: `${SITE_URL}/lotto/recommend`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    description: "6가지 알고리즘으로 로또 6/45 번호를 추천하는 무료 웹 서비스",
    inLanguage: "ko",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "번호 추천", item: `${SITE_URL}/lotto/recommend` },
      ],
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "번호 추천" },
      ]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🤖 로또 번호 추천 · 생성기
      </h1>
      <p className="text-gray-600 mb-8">
        다양한 알고리즘으로 이번 주 로또 번호를 추천받으세요
      </p>

      <RecommendClient stats={stats} />

      <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          ※ 본 사이트의 번호 추천은 역대 당첨번호의 통계적 분석을 기반으로 한 참고
          자료이며, 당첨을 보장하지 않습니다. 로또 추첨은 매 회차 독립적인 사건으로,
          과거 통계가 미래 결과를 예측하지 않습니다. 복권 구매는 개인의 판단과 책임
          하에 이루어져야 합니다.
        </p>
      </div>

    </div>
  );
}
