import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLottoResult, getAllResults } from "@/lib/api/dhlottery";
import { SITE_NAME } from "@/lib/constants";
import LottoResultCard from "@/components/lottery/LottoResultCard";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";

interface Props {
  params: Promise<{ round: string }>;
}

export function generateStaticParams() {
  const results = getAllResults();
  return results.map((r) => ({ round: r.drwNo.toString() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { round } = await params;
  return {
    title: `제 ${round}회 로또 당첨번호`,
    description: `로또 6/45 제 ${round}회 당첨번호, 당첨금액, 당첨자 수를 확인하세요.`,
    alternates: {
      canonical: `/lotto/results/${round}`,
    },
    openGraph: {
      title: `제 ${round}회 로또 당첨번호`,
      description: `로또 6/45 제 ${round}회 당첨번호, 당첨금액, 당첨자 수를 확인하세요.`,
      url: `/lotto/results/${round}`,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "article",
    },
  };
}

export default async function RoundDetailPage({ params }: Props) {
  const { round } = await params;
  const roundNum = parseInt(round, 10);

  if (isNaN(roundNum) || roundNum < 1) {
    notFound();
  }

  const result = getLottoResult(roundNum);

  if (!result) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "당첨번호", href: "/lotto/results" },
        { label: `제${result.drwNo}회` },
      ]} />

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        제 {result.drwNo}회 로또 당첨번호
      </h1>

      <LottoResultCard result={result} showDetails size="lg" />

      <AdBanner slot="round-detail" format="horizontal" className="mt-8" />

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
