import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllResults } from "@/lib/api/dhlottery";
import { getTopNumbers, isYearParam } from "@/lib/lottery/stats";
import { SITE_NAME } from "@/lib/constants";
import { formatKRW } from "@/lib/utils/format";
import LottoBall from "@/components/lottery/LottoBall";
import Breadcrumb from "@/components/ui/Breadcrumb";

interface Props {
  params: Promise<{ round: string; month: string }>;
}

function getResultsByYearMonth(year: number, month: number) {
  const allResults = getAllResults();
  return allResults.filter((r) => {
    const y = parseInt(r.drwNoDate.substring(0, 4), 10);
    const m = parseInt(r.drwNoDate.substring(5, 7), 10);
    return y === year && m === month;
  });
}

function getAvailableYearMonths(): { year: number; month: number }[] {
  const allResults = getAllResults();
  const set = new Set<string>();
  const result: { year: number; month: number }[] = [];
  for (const r of allResults) {
    const key = r.drwNoDate.substring(0, 7);
    if (!set.has(key)) {
      set.add(key);
      result.push({
        year: parseInt(key.substring(0, 4), 10),
        month: parseInt(key.substring(5, 7), 10),
      });
    }
  }
  return result.sort((a, b) => a.year - b.year || a.month - b.month);
}

export function generateStaticParams() {
  const yearMonths = getAvailableYearMonths();
  return yearMonths.map(({ year, month }) => ({
    round: year.toString(),
    month: String(month).padStart(2, "0"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { round, month } = await params;

  if (!isYearParam(round)) {
    return { title: "페이지를 찾을 수 없습니다" };
  }

  const yearNum = parseInt(round, 10);
  const monthNum = parseInt(month, 10);
  const results = getResultsByYearMonth(yearNum, monthNum);

  if (results.length === 0) {
    return { title: `${round}년 ${monthNum}월 로또 당첨번호` };
  }

  const monthPadded = String(monthNum).padStart(2, "0");
  const title = `${round}년 ${monthNum}월 로또 당첨번호 - ${results.length}회차 월별 결과`;
  const description = `${round}년 ${monthNum}월 로또 6/45 당첨번호 ${results.length}회차를 확인하세요. 제${results[results.length - 1].drwNo}회~제${results[0].drwNo}회 당첨번호, 1등 당첨금, 번호 통계를 제공합니다.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/results/${round}/${monthPadded}` },
    openGraph: {
      title,
      description,
      url: `/lotto/results/${round}/${monthPadded}`,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default async function MonthArchivePage({ params }: Props) {
  const { round, month } = await params;

  if (!isYearParam(round)) {
    notFound();
  }

  const yearNum = parseInt(round, 10);
  const monthNum = parseInt(month, 10);

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    notFound();
  }

  const results = getResultsByYearMonth(yearNum, monthNum);

  if (results.length === 0) {
    notFound();
  }

  // Find prev/next month
  const allYearMonths = getAvailableYearMonths();
  const currentIdx = allYearMonths.findIndex(
    (ym) => ym.year === yearNum && ym.month === monthNum
  );
  const prevYM = currentIdx > 0 ? allYearMonths[currentIdx - 1] : null;
  const nextYM = currentIdx < allYearMonths.length - 1 ? allYearMonths[currentIdx + 1] : null;

  const topNumbers = getTopNumbers(results, 5);

  const totalPrize = results.reduce((sum, r) => {
    if (r.firstWinamnt > 0 && r.firstPrzwnerCo > 0) {
      return sum + r.firstWinamnt * r.firstPrzwnerCo;
    }
    return sum;
  }, 0);

  const winnersCount = results.reduce((sum, r) => sum + r.firstPrzwnerCo, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: "로또 6/45", href: "/lotto" },
          { label: "당첨번호", href: "/lotto/results" },
          { label: `${yearNum}년`, href: `/lotto/results/${yearNum}` },
          { label: `${monthNum}월` },
        ]}
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {yearNum}년 {monthNum}월 로또 당첨번호
      </h1>
      <p className="text-gray-600 mb-8">
        {yearNum}년 {monthNum}월 로또 6/45 {results.length}회차 당첨번호를 확인하세요
      </p>

      {/* Month summary stats */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {monthNum}월 요약 통계
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{results.length}</div>
            <div className="text-xs text-gray-500 mt-1">추첨 횟수</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {results[results.length - 1].drwNo}~{results[0].drwNo}
            </div>
            <div className="text-xs text-gray-500 mt-1">회차 범위</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{winnersCount}명</div>
            <div className="text-xs text-gray-500 mt-1">1등 당첨자</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-orange-600">
              {totalPrize > 0 ? formatKRW(totalPrize) : "-"}
            </div>
            <div className="text-xs text-gray-500 mt-1">총 1등 당첨금</div>
          </div>
        </div>

        {/* Top numbers for the month */}
        {topNumbers.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {monthNum}월 최다 출현 번호 TOP 5
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
        )}
      </section>

      {/* All results for this month */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {yearNum}년 {monthNum}월 전체 당첨번호
        </h2>
        <div className="space-y-3">
          {results.map((result) => {
            const numbers = [result.drwtNo1, result.drwtNo2, result.drwtNo3, result.drwtNo4, result.drwtNo5, result.drwtNo6];
            const day = parseInt(result.drwNoDate.substring(8, 10), 10);

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
                      {monthNum}월 {day}일
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

      {/* Month navigation */}
      <div className="flex justify-between mt-8">
        {prevYM ? (
          <Link
            href={`/lotto/results/${prevYM.year}/${String(prevYM.month).padStart(2, "0")}`}
            className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ← {prevYM.year}년 {prevYM.month}월
          </Link>
        ) : (
          <div />
        )}
        <Link
          href={`/lotto/results/${yearNum}`}
          className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          {yearNum}년 전체
        </Link>
        {nextYM ? (
          <Link
            href={`/lotto/results/${nextYM.year}/${String(nextYM.month).padStart(2, "0")}`}
            className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {nextYM.year}년 {nextYM.month}월 →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
