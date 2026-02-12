import type { Metadata } from "next";
import { getAllResults } from "@/lib/api/dhlottery";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ResultsClient from "./ResultsClient";

export const metadata: Metadata = {
  title: "로또 당첨번호 조회 - 전 회차 당첨번호",
  description:
    "로또 6/45 1회부터 최신 회차까지 전체 당첨번호를 확인하세요. 회차별 당첨번호, 당첨금, 당첨자 수를 제공합니다.",
  alternates: { canonical: "/lotto/results" },
};

export default function ResultsPage() {
  const results = getAllResults();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "당첨번호" },
      ]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🔍 로또 당첨번호 조회
      </h1>
      <p className="text-gray-600 mb-8">
        1회부터 최신 회차까지 전체 당첨번호를 검색하고 확인하세요
      </p>

      <AdBanner slot="results-top" format="horizontal" className="mb-8" />

      <ResultsClient results={results} />

      <AdBanner slot="results-bottom" format="horizontal" className="mt-8" />
    </div>
  );
}
