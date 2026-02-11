import type { Metadata } from "next";
import Link from "next/link";
import { getLatestRound, getMultipleResults } from "@/lib/api/dhlottery";
import LottoResultCard from "@/components/lottery/LottoResultCard";
import AdBanner from "@/components/ads/AdBanner";

export const metadata: Metadata = {
  title: "로또 당첨번호 조회 - 전 회차 당첨번호",
  description:
    "로또 6/45 1회부터 최신 회차까지 전체 당첨번호를 확인하세요. 회차별 당첨번호, 당첨금, 당첨자 수를 제공합니다.",
};

export default function ResultsPage() {
  const latestRound = getLatestRound();
  const startRound = Math.max(1, latestRound - 19);
  const results = getMultipleResults(startRound, latestRound).sort(
    (a, b) => b.drwNo - a.drwNo
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🔍 로또 당첨번호 조회
      </h1>
      <p className="text-gray-600 mb-8">
        최신 회차부터 과거 당첨번호까지 확인하세요
      </p>

      <AdBanner slot="results-top" format="horizontal" className="mb-8" />

      <div className="space-y-4">
        {results.map((result, idx) => (
          <div key={result.drwNo}>
            <Link href={`/lotto/results/${result.drwNo}`}>
              <LottoResultCard result={result} showDetails />
            </Link>
            {idx === 4 && (
              <AdBanner slot="results-mid" format="horizontal" className="mt-4" />
            )}
          </div>
        ))}
      </div>

      <AdBanner slot="results-bottom" format="horizontal" className="mt-8" />
    </div>
  );
}
