import type { Metadata } from "next";
import { fetchRecentResults } from "@/lib/api/dhlottery";
import { calculateStats } from "@/lib/lottery/stats";
import AdBanner from "@/components/ads/AdBanner";
import RecommendClient from "./RecommendClient";

export const metadata: Metadata = {
  title: "로또 번호 추천 - AI 통계 기반 스마트 추천",
  description:
    "6가지 추천 알고리즘으로 로또 6/45 번호를 추천받으세요. 랜덤, 통계 기반, 핫넘버, 콜드넘버, 균형, AI 종합 추천을 제공합니다.",
};

export default async function RecommendPage() {
  const results = await fetchRecentResults(100);
  const stats = calculateStats(results, 20);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🤖 로또 번호 추천
      </h1>
      <p className="text-gray-600 mb-8">
        다양한 알고리즘으로 이번 주 로또 번호를 추천받으세요
      </p>

      <RecommendClient stats={stats} />

      <AdBanner slot="recommend-bottom" format="horizontal" className="mt-8" />

      {/* Disclaimer */}
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
