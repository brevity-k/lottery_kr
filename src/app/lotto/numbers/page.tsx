import type { Metadata } from "next";
import Link from "next/link";
import { getAllResults } from "@/lib/api/dhlottery";
import { calculateFrequencies } from "@/lib/lottery/stats";
import LottoBall from "@/components/lottery/LottoBall";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "번호별 통계 - 로또 6/45 번호 1~45 출현 분석",
  description:
    "로또 6/45 번호 1부터 45까지 각 번호의 출현 빈도, 최근 출현 회차, 평균 간격 등 상세 통계를 확인하세요.",
  alternates: { canonical: "/lotto/numbers" },
};

export default function NumbersIndexPage() {
  const results = getAllResults();
  const frequencies = calculateFrequencies(results);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "번호별 통계" },
      ]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">🔢 번호별 통계</h1>
      <p className="text-gray-600 mb-8">
        1부터 45까지 각 번호를 클릭하면 상세 통계를 확인할 수 있습니다
      </p>

      <AdBanner slot="numbers-top" format="horizontal" className="mb-8" />

      <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-9 gap-3">
        {frequencies.map((f) => (
          <Link
            key={f.number}
            href={`/lotto/numbers/${f.number}`}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-blue-50 transition-colors group"
          >
            <LottoBall number={f.number} size="lg" />
            <span className="text-xs text-gray-500 group-hover:text-blue-600 font-medium">
              {f.count}회
            </span>
          </Link>
        ))}
      </div>

      <AdBanner slot="numbers-bottom" format="horizontal" className="mt-8" />

      <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          전체 {results.length}회 추첨 데이터를 기반으로 분석한 통계입니다.
          각 번호를 클릭하면 출현 빈도, 간격 분석, 최근 출현 이력 등 상세 정보를 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
