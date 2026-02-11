import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchLottoResult } from "@/lib/api/dhlottery";
import LottoResultCard from "@/components/lottery/LottoResultCard";
import AdBanner from "@/components/ads/AdBanner";

interface Props {
  params: Promise<{ round: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { round } = await params;
  return {
    title: `제 ${round}회 로또 당첨번호`,
    description: `로또 6/45 제 ${round}회 당첨번호, 당첨금액, 당첨자 수를 확인하세요.`,
  };
}

export default async function RoundDetailPage({ params }: Props) {
  const { round } = await params;
  const roundNum = parseInt(round, 10);

  if (isNaN(roundNum) || roundNum < 1) {
    notFound();
  }

  const result = await fetchLottoResult(roundNum);

  if (!result) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/lotto/results"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← 목록으로
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        제 {result.drwNo}회 로또 당첨번호
      </h1>

      <LottoResultCard result={result} showDetails size="lg" />

      <AdBanner slot="round-detail" format="horizontal" className="mt-8" />

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {roundNum > 1 && (
          <Link
            href={`/lotto/results/${roundNum - 1}`}
            className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ← 제 {roundNum - 1}회
          </Link>
        )}
        <div className="flex-1" />
        <Link
          href={`/lotto/results/${roundNum + 1}`}
          className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          제 {roundNum + 1}회 →
        </Link>
      </div>
    </div>
  );
}
