import type { Metadata } from "next";
import { getAllResults } from "@/lib/api/dhlottery";
import { calculateStats } from "@/lib/lottery/stats";
import LottoBall from "@/components/lottery/LottoBall";
import FrequencyChart from "@/components/charts/FrequencyChart";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "로또 통계 분석 - 번호별 출현 빈도, 패턴 분석",
  description:
    "로또 6/45 역대 당첨번호 통계 분석. 번호별 출현 빈도, 홀짝 비율, 구간 분포, 핫넘버/콜드넘버를 확인하세요.",
  alternates: { canonical: "/lotto/stats" },
  openGraph: {
    title: "로또 통계 분석 - 번호별 출현 빈도, 패턴 분석",
    description:
      "로또 6/45 역대 당첨번호 통계 분석. 번호별 출현 빈도, 홀짝 비율, 구간 분포, 핫넘버/콜드넘버를 확인하세요.",
    url: "/lotto/stats",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function StatsPage() {
  const allResults = getAllResults();
  const stats = calculateStats(allResults, 20);

  const totalNumbers = stats.oddEvenRatio.odd + stats.oddEvenRatio.even;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "통계 분석" },
      ]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 로또 통계 분석</h1>
      <p className="text-gray-600 mb-8">
        전체 {stats.totalDraws}회 당첨번호 기반 통계 분석
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalDraws}</p>
          <p className="text-xs text-gray-500">분석 회차</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {((stats.oddEvenRatio.odd / totalNumbers) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">홀수 비율</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {((stats.highLowRatio.high / totalNumbers) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">고번호(23~45) 비율</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {((stats.highLowRatio.low / totalNumbers) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">저번호(1~22) 비율</p>
        </div>
      </div>

      <FrequencyChart
        frequencies={stats.frequencies}
        title={`번호별 출현 빈도 (전체 ${stats.totalDraws}회)`}
      />

      <AdBanner slot="stats-mid" format="horizontal" className="my-8" />

      <FrequencyChart
        frequencies={stats.recentFrequencies}
        title="번호별 출현 빈도 (최근 20회)"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">🔥 핫넘버 (최근 자주 출현)</h3>
          <p className="text-xs text-gray-500 mb-4">최근 20회에서 가장 많이 나온 번호</p>
          <div className="flex gap-2 flex-wrap">
            {stats.hottestNumbers.map((num) => (
              <LottoBall key={num} number={num} size="lg" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">❄️ 콜드넘버 (최근 적게 출현)</h3>
          <p className="text-xs text-gray-500 mb-4">최근 20회에서 가장 적게 나온 번호</p>
          <div className="flex gap-2 flex-wrap">
            {stats.coldestNumbers.map((num) => (
              <LottoBall key={num} number={num} size="lg" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">⭐ 역대 최다 출현</h3>
          <p className="text-xs text-gray-500 mb-4">전체 기간 가장 많이 나온 번호</p>
          <div className="flex gap-2 flex-wrap">
            {stats.mostCommon.map((num) => (
              <LottoBall key={num} number={num} size="lg" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">💤 역대 최소 출현</h3>
          <p className="text-xs text-gray-500 mb-4">전체 기간 가장 적게 나온 번호</p>
          <div className="flex gap-2 flex-wrap">
            {stats.leastCommon.map((num) => (
              <LottoBall key={num} number={num} size="lg" />
            ))}
          </div>
        </div>
      </div>

      <AdBanner slot="stats-bottom" format="horizontal" className="mt-8" />

      <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">통계 분석 안내</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          본 통계는 동행복권 공식 데이터를 기반으로 분석한 결과입니다.
          로또 추첨은 매 회차 독립적인 사건으로, 과거 통계가 미래 결과를 예측하지 않습니다.
          통계 데이터는 참고 자료로만 활용하시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
