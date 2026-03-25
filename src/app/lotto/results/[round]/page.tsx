import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLottoResult, getAllResults } from "@/lib/api/dhlottery";
import { getDrawNumbers, getTopNumbers, isYearParam } from "@/lib/lottery/stats";
import { SITE_NAME, SITE_URL, LOTTO_SECTIONS } from "@/lib/constants";
import { formatKRW, formatDate } from "@/lib/utils/format";
import LottoBall from "@/components/lottery/LottoBall";
import LottoResultCard from "@/components/lottery/LottoResultCard";
import Breadcrumb from "@/components/ui/Breadcrumb";

interface Props {
  params: Promise<{ round: string }>;
}

// --- Year archive helpers ---

function getResultsByYear(year: number) {
  const allResults = getAllResults();
  return allResults.filter((r) => {
    return parseInt(r.drwNoDate.substring(0, 4), 10) === year;
  });
}

function getAvailableYears(): number[] {
  const allResults = getAllResults();
  const years = new Set<number>();
  for (const r of allResults) {
    years.add(parseInt(r.drwNoDate.substring(0, 4), 10));
  }
  return [...years].sort((a, b) => a - b);
}

function getAvailableMonths(year: number): number[] {
  const results = getResultsByYear(year);
  const months = new Set<number>();
  for (const r of results) {
    months.add(parseInt(r.drwNoDate.substring(5, 7), 10));
  }
  return [...months].sort((a, b) => a - b);
}

// --- Round detail helpers ---

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

// --- Static params: both rounds and years ---

export function generateStaticParams() {
  const allResults = getAllResults();

  // Round params
  const roundParams = allResults.map((r) => ({ round: r.drwNo.toString() }));

  // Year params
  const years = getAvailableYears();
  const yearParams = years.map((y) => ({ round: y.toString() }));

  return [...roundParams, ...yearParams];
}

// --- Metadata ---

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { round } = await params;

  if (isYearParam(round)) {
    return generateYearMetadata(round);
  }
  return generateRoundMetadata(round);
}

function generateYearMetadata(year: string): Metadata {
  const yearNum = parseInt(year, 10);
  const results = getResultsByYear(yearNum);

  if (results.length === 0) {
    return { title: `${year}년 로또 당첨번호` };
  }

  const title = `${year}년 로또 당첨번호 모음 - 전체 ${results.length}회차 결과`;
  const description = `${year}년 로또 6/45 당첨번호 전체 ${results.length}회차를 확인하세요. 제${results[results.length - 1].drwNo}회~제${results[0].drwNo}회 당첨번호, 1등 당첨금, 월별 결과를 제공합니다.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/results/${year}` },
    openGraph: {
      title,
      description,
      url: `/lotto/results/${year}`,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
    },
  };
}

function generateRoundMetadata(round: string): Metadata {
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

// --- Page component ---

export default async function RoundOrYearPage({ params }: Props) {
  const { round } = await params;

  if (isYearParam(round)) {
    return <YearArchiveContent year={parseInt(round, 10)} />;
  }

  return <RoundDetailContent round={round} />;
}

// --- Year archive content ---

function YearArchiveContent({ year }: { year: number }) {
  const results = getResultsByYear(year);

  if (results.length === 0) {
    notFound();
  }

  const years = getAvailableYears();
  const currentIndex = years.indexOf(year);
  const prevYear = currentIndex > 0 ? years[currentIndex - 1] : null;
  const nextYear = currentIndex < years.length - 1 ? years[currentIndex + 1] : null;

  const months = getAvailableMonths(year);

  // Pre-compute month counts
  const monthCounts = new Map<number, number>();
  for (const r of results) {
    const m = parseInt(r.drwNoDate.substring(5, 7), 10);
    monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1);
  }

  const topNumbers = getTopNumbers(results, 5);

  const totalPrize = results.reduce((sum, r) => {
    if (r.firstWinamnt > 0 && r.firstPrzwnerCo > 0) {
      return sum + r.firstWinamnt * r.firstPrzwnerCo;
    }
    return sum;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: "로또 6/45", href: "/lotto" },
          { label: "당첨번호", href: "/lotto/results" },
          { label: `${year}년` },
        ]}
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {year}년 로또 당첨번호
      </h1>
      <p className="text-gray-600 mb-8">
        {year}년 로또 6/45 전체 {results.length}회차 당첨번호를 확인하세요
      </p>

      {/* Year summary stats */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {year}년 요약 통계
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{results.length}</div>
            <div className="text-xs text-gray-500 mt-1">총 추첨 횟수</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {results[results.length - 1].drwNo}~{results[0].drwNo}
            </div>
            <div className="text-xs text-gray-500 mt-1">회차 범위</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{months.length}</div>
            <div className="text-xs text-gray-500 mt-1">추첨 월수</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-orange-600">
              {totalPrize > 0 ? formatKRW(totalPrize) : "-"}
            </div>
            <div className="text-xs text-gray-500 mt-1">총 1등 당첨금</div>
          </div>
        </div>

        {/* Top 5 most common numbers */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {year}년 최다 출현 번호 TOP 5
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {topNumbers.map(({ number, count }, i) => (
              <div key={number} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">{i + 1}.</span>
                <Link
                  href={`/lotto/numbers/${number}`}
                  className="hover:scale-110 transition-transform"
                >
                  <LottoBall number={number} size="md" />
                </Link>
                <span className="text-sm text-gray-500">{count}회</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly links */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          월별 당첨번호
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {months.map((month) => (
            <Link
              key={month}
              href={`/lotto/results/${year}/${String(month).padStart(2, "0")}`}
              className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-3 text-center transition-colors"
            >
              <div className="text-lg font-bold text-gray-900">{month}월</div>
              <div className="text-xs text-gray-500">
                {monthCounts.get(month) ?? 0}회
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All results for this year */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {year}년 전체 당첨번호
        </h2>
        <div className="space-y-3">
          {results.map((result) => {
            const numbers = [result.drwtNo1, result.drwtNo2, result.drwtNo3, result.drwtNo4, result.drwtNo5, result.drwtNo6];
            const dateStr = result.drwNoDate;
            const month = parseInt(dateStr.substring(5, 7), 10);
            const day = parseInt(dateStr.substring(8, 10), 10);

            return (
              <Link
                key={result.drwNo}
                href={`/lotto/results/${result.drwNo}`}
                className="block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm p-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <span className="text-sm font-bold text-blue-600">
                      제{result.drwNo}회
                    </span>
                    <span className="text-xs text-gray-400">
                      {month}월 {day}일
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {numbers.map((num, i) => (
                      <LottoBall key={i} number={num} size="sm" />
                    ))}
                    <LottoBall number={result.bnusNo} size="sm" isBonus />
                  </div>
                  <div className="sm:ml-auto text-sm text-gray-500">
                    {result.firstWinamnt > 0 ? formatKRW(result.firstWinamnt) : "-"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Year navigation */}
      <div className="flex justify-between mt-8">
        {prevYear ? (
          <Link
            href={`/lotto/results/${prevYear}`}
            className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ← {prevYear}년
          </Link>
        ) : (
          <div />
        )}
        <Link
          href="/lotto/results"
          className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          전체 회차
        </Link>
        {nextYear ? (
          <Link
            href={`/lotto/results/${nextYear}`}
            className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {nextYear}년 →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// --- Round detail content ---

function RoundDetailContent({ round }: { round: string }) {
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

  // JSON-LD is serialized from a trusted static object, not user input
  const jsonLd = [
    {
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
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "당첨번호 조회", item: `${SITE_URL}/lotto/results` },
        { "@type": "ListItem", position: 3, name: `제${result.drwNo}회`, item: `${SITE_URL}/lotto/results/${result.drwNo}` },
      ],
    },
  ];

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
        // JSON-LD is serialized from a trusted static object, not user input
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
