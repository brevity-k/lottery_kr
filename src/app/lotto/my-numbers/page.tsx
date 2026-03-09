import type { Metadata } from "next";
import MyNumbersClient from "./MyNumbersClient";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME } from "@/lib/constants";
import RelatedFeatures from "@/components/ui/RelatedFeatures";
import { getAllResults } from "@/lib/api/dhlottery";
import { calculateStats } from "@/lib/lottery/stats";

export const metadata: Metadata = {
  title: "내 로또 번호 관리 - 번호 저장·통계·당첨 확인",
  description:
    "내가 구매한 로또 번호를 저장하고 역대 당첨번호와 비교하세요. 패턴 분석, 번호별 통계, 과거 당첨 백테스트까지 바로 확인!",
  alternates: { canonical: "/lotto/my-numbers" },
  openGraph: {
    title: "내 로또 번호 관리 - 번호 저장·통계·당첨 확인",
    description:
      "내가 구매한 로또 번호를 저장하고 역대 당첨번호와 비교하세요. 패턴 분석, 번호별 통계, 과거 당첨 백테스트까지 바로 확인!",
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

      <RelatedFeatures currentPath="/lotto/my-numbers" />
    </div>
  );
}
