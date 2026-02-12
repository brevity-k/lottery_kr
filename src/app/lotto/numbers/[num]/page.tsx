import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllResults } from "@/lib/api/dhlottery";
import { getNumberDetail } from "@/lib/lottery/stats";
import LottoBall from "@/components/lottery/LottoBall";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { LOTTO_MAX_NUMBER } from "@/lib/constants";

interface Props {
  params: Promise<{ num: string }>;
}

export function generateStaticParams() {
  return Array.from({ length: LOTTO_MAX_NUMBER }, (_, i) => ({ num: String(i + 1) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { num } = await params;
  return {
    title: `번호 ${num} 상세 통계 - 로또 6/45`,
    description: `로또 6/45 번호 ${num}의 출현 빈도, 평균 간격, 최대 간격, 최근 출현 회차 등 상세 통계를 확인하세요.`,
    alternates: { canonical: `/lotto/numbers/${num}` },
  };
}

export default async function NumberDetailPage({ params }: Props) {
  const { num } = await params;
  const numVal = parseInt(num, 10);

  if (isNaN(numVal) || numVal < 1 || numVal > LOTTO_MAX_NUMBER) {
    notFound();
  }

  const results = getAllResults();
  const detail = getNumberDetail(numVal, results);
  const totalDraws = results.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "번호별 통계", href: "/lotto/numbers" },
        { label: `번호 ${numVal}` },
      ]} />

      <div className="flex items-center gap-4 mb-8">
        <LottoBall number={numVal} size="lg" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">번호 {numVal} 통계</h1>
          <p className="text-gray-500 text-sm">전체 {totalDraws}회 기준</p>
        </div>
      </div>

      <AdBanner slot="number-detail-top" format="horizontal" className="mb-6" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="출현 횟수" value={`${detail.totalAppearances}회`} />
        <StatCard label="출현 확률" value={`${detail.frequencyPercent}%`} />
        <StatCard label="보너스 출현" value={`${detail.bonusAppearances}회`} />
        <StatCard label="현재 미출현" value={`${detail.currentGap}회`} />
        <StatCard label="최대 미출현" value={`${detail.maxGap}회`} />
        <StatCard label="평균 간격" value={`${detail.avgGap}회`} />
        <StatCard label="마지막 출현" value={`${detail.lastAppearedRound}회`} />
        <StatCard
          label="기대 출현율"
          value={`${((6 / 45) * 100).toFixed(1)}%`}
          sub={detail.frequencyPercent > (6 / 45) * 100 ? "기대 이상" : "기대 이하"}
        />
      </div>

      {/* Recent Rounds */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <h2 className="font-bold text-gray-900 mb-4">최근 출현 회차</h2>
        <div className="flex flex-wrap gap-2">
          {detail.recentRounds.map((round) => (
            <Link
              key={round}
              href={`/lotto/results/${round}`}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              {round}회
            </Link>
          ))}
        </div>
      </section>

      <AdBanner slot="number-detail-bottom" format="horizontal" className="mb-6" />

      {/* Navigation */}
      <div className="flex justify-between">
        {numVal > 1 && (
          <Link
            href={`/lotto/numbers/${numVal - 1}`}
            className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <LottoBall number={numVal - 1} size="sm" />
            <span>번호 {numVal - 1}</span>
          </Link>
        )}
        <div className="flex-1" />
        {numVal < 45 && (
          <Link
            href={`/lotto/numbers/${numVal + 1}`}
            className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <span>번호 {numVal + 1}</span>
            <LottoBall number={numVal + 1} size="sm" />
          </Link>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p className="text-2xl font-bold text-blue-600">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
