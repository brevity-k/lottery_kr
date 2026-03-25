import type { Metadata } from "next";
import Link from "next/link";
import { getAllResults } from "@/lib/api/dhlottery";
import { calculateStats } from "@/lib/lottery/stats";
import LottoBall from "@/components/lottery/LottoBall";
import FrequencyChart from "@/components/charts/FrequencyChart";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import RelatedFeatures from "@/components/ui/RelatedFeatures";
import { buildFaqJsonLd } from "@/lib/utils/jsonld";

export const metadata: Metadata = {
  title: "로또 통계 분석 - 핫넘버·콜드넘버·출현 빈도 [1,200회 데이터]",
  description:
    "역대 로또 6/45 전체 회차 통계를 분석합니다. 번호별 출현 빈도, 핫넘버, 콜드넘버, 구간별 분석을 한눈에 확인하세요.",
  alternates: { canonical: "/lotto/stats" },
  openGraph: {
    title: "로또 통계 분석 - 핫넘버·콜드넘버·출현 빈도 [1,200회 데이터]",
    description:
      "역대 로또 6/45 전체 회차 통계를 분석합니다. 번호별 출현 빈도, 핫넘버, 콜드넘버, 구간별 분석을 한눈에 확인하세요.",
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

      <Link
        href="/lotto/stats/pairs"
        className="mt-8 block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
              번호쌍 분석
            </h3>
            <p className="text-sm text-gray-600">
              역대 전체 추첨에서 가장 자주 함께 나온 번호 조합 TOP 20을 확인하세요
            </p>
          </div>
          <span className="text-blue-500 text-xl group-hover:translate-x-1 transition-transform shrink-0 ml-4">
            &rarr;
          </span>
        </div>
      </Link>

      <AdBanner slot="stats-bottom" format="horizontal" className="mt-8" />

      <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">통계 분석 안내</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          본 통계는 동행복권 공식 데이터를 기반으로 분석한 결과입니다.
          로또 추첨은 매 회차 독립적인 사건으로, 과거 통계가 미래 결과를 예측하지 않습니다.
          통계 데이터는 참고 자료로만 활용하시기 바랍니다.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd([
          { question: "로또에서 가장 많이 나온 번호는 무엇인가요?", answer: "역대 1,200회 이상의 추첨 데이터를 기반으로 가장 많이 출현한 번호를 확인할 수 있습니다. 통계 페이지에서 전체 빈도를 확인하세요." },
          { question: "핫넘버와 콜드넘버란 무엇인가요?", answer: "핫넘버는 최근 20회 추첨에서 자주 나온 번호이고, 콜드넘버는 오랫동안 나오지 않은 번호입니다. 두 가지 모두 번호 선택의 참고 자료로 활용됩니다." },
          { question: "통계를 보면 당첨 확률이 올라가나요?", answer: "로또는 매 회차 독립적인 무작위 추첨이므로, 과거 통계가 미래 결과를 예측하지 못합니다. 다만 번호 선택의 참고 자료로 활용할 수 있습니다." },
        ])) }}
      />

      <RelatedFeatures currentPath="/lotto/stats" />
    </div>
  );
}
