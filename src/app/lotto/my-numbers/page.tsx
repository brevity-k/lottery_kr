import type { Metadata } from "next";
import MyNumbersClient from "./MyNumbersClient";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME } from "@/lib/constants";
import RelatedFeatures from "@/components/ui/RelatedFeatures";
import { getAllResults } from "@/lib/api/dhlottery";
import { calculateStats } from "@/lib/lottery/stats";
import { buildFaqJsonLd } from "@/lib/utils/jsonld";

export const metadata: Metadata = {
  title: "내 로또 번호 분석 - 역대 당첨번호와 비교 [무료]",
  description:
    "자주 쓰는 로또 번호를 등록하고 역대 모든 당첨번호와 자동 비교하세요. 몇 개가 일치했는지 한눈에 확인할 수 있습니다.",
  alternates: { canonical: "/lotto/my-numbers" },
  openGraph: {
    title: "내 로또 번호 분석 - 역대 당첨번호와 비교 [무료]",
    description:
      "자주 쓰는 로또 번호를 등록하고 역대 모든 당첨번호와 자동 비교하세요. 몇 개가 일치했는지 한눈에 확인할 수 있습니다.",
    url: "/lotto/my-numbers",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function MyNumbersPage() {
  const allResults = getAllResults();
  const latestRound = allResults.length > 0 ? allResults[0].drwNo : 0;
  const stats = calculateStats(allResults, 20);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "내 번호 분석" },
      ]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 내 번호 분석</h1>
      <p className="text-gray-600 mb-8">
        매주 구매한 번호를 기록하고, 나만의 로또 통계를 확인해보세요.
      </p>

      <AdBanner slot="my-numbers-top" format="horizontal" className="mb-6" />

      <MyNumbersClient
        allResults={allResults}
        latestRound={latestRound}
        hotNumbers={stats.hottestNumbers}
        coldNumbers={stats.coldestNumbers}
      />

      <AdBanner slot="my-numbers-bottom" format="horizontal" className="mt-6" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd([
          { question: "내 번호 분석이란 무엇인가요?", answer: "자주 사용하는 로또 번호를 등록하면 역대 당첨번호와 자동으로 비교하여 일치 결과를 분석해 드리는 서비스입니다." },
          { question: "과거 당첨번호와 비교할 수 있나요?", answer: "네, 등록한 번호를 1회부터 최신 회차까지 모든 당첨번호와 비교하여 몇 개가 일치했는지 확인할 수 있습니다." },
        ])) }}
      />

      <RelatedFeatures currentPath="/lotto/my-numbers" />
    </div>
  );
}
