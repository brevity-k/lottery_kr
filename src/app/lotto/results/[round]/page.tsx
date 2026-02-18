import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLottoResult, getAllResults } from "@/lib/api/dhlottery";
import { getDrawNumbers } from "@/lib/lottery/stats";
import { SITE_NAME, SITE_URL, LOTTO_SECTIONS } from "@/lib/constants";
import { formatKRW, formatDate } from "@/lib/utils/format";
import LottoBall from "@/components/lottery/LottoBall";
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

function getRoundAnalysis(round: number) {
  const result = getLottoResult(round);
  if (!result) return null;

  const numbers = getDrawNumbers(result);
  const sum = numbers.reduce((a, b) => a + b, 0);
  const oddCount = numbers.filter((n) => n % 2 === 1).length;
  const evenCount = numbers.length - oddCount;

  const sectionCounts = LOTTO_SECTIONS.map(([min, max]) => ({
    label: `${min}-${max}`,
    count: numbers.filter((n) => n >= min && n <= max).length,
  }));

  const sorted = [...numbers].sort((a, b) => a - b);
  const consecutivePairs: [number, number][] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      consecutivePairs.push([sorted[i], sorted[i + 1]]);
    }
  }

  const avgSum = 135;

  const allResults = getAllResults();
  const resultsWithPrize = allResults.filter((r) => r.firstWinamnt > 0);
  const avgPrize =
    resultsWithPrize.length > 0
      ? resultsWithPrize.reduce((s, r) => s + r.firstWinamnt, 0) /
        resultsWithPrize.length
      : 0;

  return {
    result,
    numbers,
    sum,
    oddCount,
    evenCount,
    sectionCounts,
    consecutivePairs,
    avgSum,
    avgPrize,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { round } = await params;
  const roundNum = parseInt(round, 10);
  const analysis = getRoundAnalysis(roundNum);

  if (!analysis) {
    return { title: `제 ${round}회 로또 당첨번호` };
  }

  const { result, numbers } = analysis;
  const numbersStr = numbers.join(", ");
  const prizeStr =
    result.firstWinamnt > 0 ? ` 1등 ${formatKRW(result.firstWinamnt)}.` : "";
  const description = `제${round}회 로또 당첨번호 ${numbersStr} + 보너스 ${result.bnusNo}.${prizeStr} 당첨번호 분석, 통계, 구간별 분포를 확인하세요.`;

  return {
    title: `제 ${round}회 로또 당첨번호 - ${numbersStr}`,
    description,
    alternates: {
      canonical: `/lotto/results/${round}`,
    },
    openGraph: {
      title: `제 ${round}회 로또 당첨번호 - ${numbersStr}`,
      description,
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

  const analysis = getRoundAnalysis(roundNum);

  if (!analysis) {
    notFound();
  }

  const {
    result,
    numbers,
    sum,
    oddCount,
    evenCount,
    sectionCounts,
    consecutivePairs,
    avgSum,
    avgPrize,
  } = analysis;

  const sumDiff = sum - avgSum;
  const sumComment =
    sumDiff > 15
      ? "평균보다 높은 편"
      : sumDiff < -15
        ? "평균보다 낮은 편"
        : "평균 범위";
  const prizeComment =
    result.firstWinamnt > 0
      ? result.firstWinamnt > avgPrize
        ? "역대 평균보다 높은 당첨금"
        : "역대 평균보다 낮은 당첨금"
      : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `제${result.drwNo}회 로또 6/45 당첨번호 분석`,
    description: `제${result.drwNo}회 당첨번호 ${numbers.join(", ")} + 보너스 ${result.bnusNo}. 번호합 ${sum}, 홀짝비 ${oddCount}:${evenCount}, 구간별 분포 분석.`,
    datePublished: result.drwNoDate,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/lotto/results/${result.drwNo}`,
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: "로또 6/45", href: "/lotto" },
          { label: "당첨번호", href: "/lotto/results" },
          { label: `제${result.drwNo}회` },
        ]}
      />

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        제 {result.drwNo}회 로또 당첨번호
      </h1>

      <LottoResultCard result={result} showDetails size="lg" />

      {/* Per-round analysis section */}
      <section className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          제{result.drwNo}회 당첨번호 분석
        </h2>

        <p className="text-gray-700 mb-6 leading-relaxed">
          {formatDate(result.drwNoDate)} 추첨된 제{result.drwNo}회 당첨번호는{" "}
          <strong>{numbers.join(", ")}</strong> (보너스 {result.bnusNo})입니다.
          번호합은 {sum}으로 {sumComment}이며, 홀수 {oddCount}개·짝수{" "}
          {evenCount}개 조합입니다.
          {consecutivePairs.length > 0 &&
            ` 연속번호 ${consecutivePairs.map((p) => `${p[0]}-${p[1]}`).join(", ")}이(가) 포함되어 있습니다.`}
          {result.firstPrzwnerCo > 0 &&
            result.firstWinamnt > 0 &&
            ` 1등 당첨자 ${result.firstPrzwnerCo}명, 1인당 ${formatKRW(result.firstWinamnt)}(${prizeComment}).`}
        </p>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            당첨번호 상세
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {numbers.map((num) => (
              <Link
                key={num}
                href={`/lotto/numbers/${num}`}
                title={`번호 ${num} 통계 보기`}
                className="hover:scale-110 transition-transform"
              >
                <LottoBall number={num} size="lg" />
              </Link>
            ))}
            <span className="text-gray-400 text-lg font-bold mx-1">+</span>
            <Link
              href={`/lotto/numbers/${result.bnusNo}`}
              title={`보너스 번호 ${result.bnusNo} 통계 보기`}
              className="hover:scale-110 transition-transform"
            >
              <LottoBall number={result.bnusNo} size="lg" />
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            번호를 클릭하면 해당 번호의 상세 통계를 볼 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{sum}</div>
            <div className="text-xs text-gray-500 mt-1">번호합</div>
            <div className="text-xs text-gray-400">평균 {avgSum}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {oddCount}:{evenCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">홀:짝</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {consecutivePairs.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">연속번호 쌍</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {result.firstPrzwnerCo > 0 ? `${result.firstPrzwnerCo}명` : "-"}
            </div>
            <div className="text-xs text-gray-500 mt-1">1등 당첨자</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            구간별 분포
          </h3>
          <div className="flex gap-2">
            {sectionCounts.map(({ label, count }) => (
              <div
                key={label}
                className="flex-1 bg-gray-50 rounded-xl p-3 text-center"
              >
                <div className="text-lg font-bold text-gray-900">{count}개</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {result.firstWinamnt > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              1등 당첨 정보
            </h3>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">1인당 당첨금</span>
                  <div className="font-bold text-gray-900">
                    {formatKRW(result.firstWinamnt)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">당첨자 수</span>
                  <div className="font-bold text-gray-900">
                    {result.firstPrzwnerCo}명
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">총 1등 당첨금</span>
                  <div className="font-bold text-gray-900">
                    {formatKRW(result.firstWinamnt * result.firstPrzwnerCo)}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-orange-100">
                <Link
                  href="/lotto/tax"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  당첨금 세금 계산하기 →
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

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
