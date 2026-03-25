import type { Metadata } from "next";
import Link from "next/link";
import { getAllResults } from "@/lib/api/dhlottery";
import { getNumberPairFrequencies } from "@/lib/lottery/stats";
import LottoBall from "@/components/lottery/LottoBall";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import RelatedFeatures from "@/components/ui/RelatedFeatures";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "로또 자주 나오는 번호 조합 - 번호쌍 출현 빈도 분석 [역대 전체]",
  description:
    "로또 6/45 역대 전체 추첨에서 가장 자주 함께 나온 번호 조합 TOP 20을 분석합니다. 번호 궁합이 좋은 조합을 확인하세요.",
  alternates: { canonical: "/lotto/stats/pairs" },
  openGraph: {
    title: "로또 자주 나오는 번호 조합 - 번호쌍 출현 빈도 분석 [역대 전체]",
    description:
      "로또 6/45 역대 전체 추첨에서 가장 자주 함께 나온 번호 조합 TOP 20을 분석합니다. 번호 궁합이 좋은 조합을 확인하세요.",
    url: "/lotto/stats/pairs",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function PairsPage() {
  const allResults = getAllResults();
  const topPairs = getNumberPairFrequencies(allResults, 20);
  const totalDraws = allResults.length;

  // FAQPage JSON-LD — trusted static content, no user input
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "로또에서 가장 자주 나오는 번호 조합은?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "역대 전체 추첨 데이터를 분석한 결과, 가장 자주 함께 출현한 번호 조합을 확인할 수 있습니다. 상위 조합은 통계 페이지에서 확인하세요.",
        },
      },
      {
        "@type": "Question",
        name: "번호 궁합이 좋은 조합은?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "번호 궁합은 과거 데이터에서 자주 함께 출현한 번호쌍을 의미합니다. 다만 로또는 독립시행이므로 과거 조합이 미래 결과를 예측하지는 않습니다.",
        },
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "통계 분석", href: "/lotto/stats" },
        { label: "번호쌍 분석" },
      ]} />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        로또 자주 나오는 번호 조합
      </h1>
      <p className="text-gray-600 mb-8">
        전체 {totalDraws}회 추첨에서 가장 자주 함께 출현한 번호쌍 TOP 20
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-center text-gray-600 font-semibold w-16">순위</th>
                <th className="px-4 py-3 text-center text-gray-600 font-semibold">번호 조합</th>
                <th className="px-4 py-3 text-center text-gray-600 font-semibold w-24">출현 횟수</th>
                <th className="px-4 py-3 text-center text-gray-600 font-semibold w-24">출현율</th>
              </tr>
            </thead>
            <tbody>
              {topPairs.map(({ pair, count }, index) => {
                const percentage = ((count / totalDraws) * 100).toFixed(1);
                const maxCount = topPairs[0].count;
                const barWidth = (count / maxCount) * 100;

                return (
                  <tr
                    key={`${pair[0]}-${pair[1]}`}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        index < 3
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/lotto/numbers/${pair[0]}`} className="hover:opacity-80 transition-opacity">
                          <LottoBall number={pair[0]} size="md" />
                        </Link>
                        <span className="text-gray-400 text-lg font-light">+</span>
                        <Link href={`/lotto/numbers/${pair[1]}`} className="hover:opacity-80 transition-opacity">
                          <LottoBall number={pair[1]} size="md" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-gray-900">{count}회</span>
                        <div className="w-full max-w-[80px] bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 rounded-full h-1.5 transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AdBanner slot="pairs-mid" format="horizontal" className="my-8" />

      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-8">
        <h2 className="font-bold text-gray-900 mb-3 text-lg">번호쌍 분석이란?</h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            번호쌍 분석은 로또 6/45 역대 전체 추첨에서 두 번호가 함께 출현한 빈도를
            분석하는 통계입니다. 한 회차에서 뽑히는 6개의 번호 중 2개씩 짝지어
            총 15개의 조합이 만들어지며, 이를 전체 회차에 대해 집계합니다.
          </p>
          <p>
            &ldquo;번호 궁합&rdquo;이 좋다는 것은 과거 데이터에서 해당 두 번호가
            자주 함께 출현했다는 의미입니다. 예를 들어 출현율이 높은 번호쌍은
            같은 추첨에서 함께 당첨번호에 포함된 횟수가 많다는 뜻입니다.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
        <h2 className="font-semibold text-gray-900 mb-3">활용 팁</h2>
        <ul className="text-sm text-gray-600 space-y-2 leading-relaxed">
          <li className="flex gap-2">
            <span className="text-blue-500 font-bold shrink-0">1.</span>
            <span>자주 함께 나온 번호쌍을 참고하여 번호 조합에 포함시켜 보세요.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-bold shrink-0">2.</span>
            <span>각 번호를 클릭하면 해당 번호의 상세 통계 페이지에서 더 많은 정보를 확인할 수 있습니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-bold shrink-0">3.</span>
            <span>
              <Link href="/lotto/stats" className="text-blue-600 hover:underline">
                전체 통계 분석
              </Link>
              에서 개별 번호의 출현 빈도도 함께 확인해 보세요.
            </span>
          </li>
        </ul>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">통계 분석 안내</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          본 통계는 동행복권 공식 데이터를 기반으로 분석한 결과입니다.
          로또 추첨은 매 회차 독립적인 사건으로, 과거 통계가 미래 결과를 예측하지 않습니다.
          번호쌍 출현 빈도는 참고 자료로만 활용하시기 바랍니다.
        </p>
      </div>

      {/* FAQPage JSON-LD — trusted static content, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <AdBanner slot="pairs-bottom" format="horizontal" className="mt-8" />

      <RelatedFeatures currentPath="/lotto/stats/pairs" />
    </div>
  );
}
