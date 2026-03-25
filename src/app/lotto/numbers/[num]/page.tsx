import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllResults } from "@/lib/api/dhlottery";
import { getNumberDetail, getCompanionNumbers, getNumberGaps } from "@/lib/lottery/stats";
import LottoBall from "@/components/lottery/LottoBall";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { LOTTO_MAX_NUMBER, SITE_NAME, SITE_URL } from "@/lib/constants";
import { buildFaqJsonLd } from "@/lib/utils/jsonld";

interface Props {
  params: Promise<{ num: string }>;
}

export function generateStaticParams() {
  return Array.from({ length: LOTTO_MAX_NUMBER }, (_, i) => ({ num: String(i + 1) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { num } = await params;
  const numVal = parseInt(num, 10);
  const results = getAllResults();
  const detail = getNumberDetail(numVal, results);
  const companions = getCompanionNumbers(numVal, results, 3);
  const companionText = companions.map((c) => c.number).join(", ");
  const description = `로또 6/45 번호 ${num}: 총 ${detail.totalAppearances}회 출현(${detail.frequencyPercent}%), 동반번호 ${companionText}, 마지막 출현 ${detail.lastAppearedRound}회. 상세 통계와 출현 간격 분석을 확인하세요.`;

  return {
    title: `번호 ${num} 상세 통계 - 로또 6/45`,
    description,
    alternates: { canonical: `/lotto/numbers/${num}` },
    openGraph: {
      title: `번호 ${num} 상세 통계 - 로또 6/45`,
      description,
      url: `/lotto/numbers/${num}`,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
    },
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
  const companions = getCompanionNumbers(numVal, results, 5);
  const gapData = getNumberGaps(numVal, results);
  const currentGapFromLatest = totalDraws > 0 ? results[0].drwNo - gapData.lastSeen : 0;
  const avgGapValue = gapData.gaps.length > 0
    ? Math.round((gapData.gaps.reduce((a, b) => a + b, 0) / gapData.gaps.length) * 10) / 10
    : 0;

  const companionTop3Text = companions.slice(0, 3).map((c) => `${c.number}번(${c.count}회)`).join(", ");

  const faqItems = [
    {
      question: `${numVal}번은 총 몇 번 나왔나요?`,
      answer: `로또 6/45에서 ${numVal}번은 전체 ${totalDraws}회 추첨 중 총 ${detail.totalAppearances}회 출현했습니다. 출현 확률은 ${detail.frequencyPercent}%이며, 기대 출현율 ${((6 / 45) * 100).toFixed(1)}% 대비 ${detail.frequencyPercent > (6 / 45) * 100 ? "높은" : "낮은"} 수치입니다.`,
    },
    {
      question: `${numVal}번과 자주 같이 나오는 번호는?`,
      answer: `${numVal}번과 가장 자주 같이 출현한 동반번호는 ${companionTop3Text}입니다. 동반번호는 같은 회차에서 함께 당첨번호로 나온 횟수를 기준으로 산출됩니다.`,
    },
    {
      question: `${numVal}번이 마지막으로 나온 회차는?`,
      answer: `${numVal}번이 마지막으로 출현한 회차는 제${gapData.lastSeen}회입니다. 현재 ${currentGapFromLatest}회 연속 미출현 중이며, 최근 10회 출현 간격의 평균은 ${avgGapValue}회입니다.`,
    },
  ];

  const jsonLdData = [
    buildFaqJsonLd(faqItems),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "로또 6/45", item: `${SITE_URL}/lotto` },
        { "@type": "ListItem", position: 3, name: "번호별 통계", item: `${SITE_URL}/lotto/numbers` },
        { "@type": "ListItem", position: 4, name: `번호 ${numVal}`, item: `${SITE_URL}/lotto/numbers/${numVal}` },
      ],
    },
  ];

  const jsonLdString = JSON.stringify(jsonLdData);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
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

      {/* Companion Numbers */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <h2 className="font-bold text-gray-900 mb-2">동반번호 TOP 5</h2>
        <p className="text-xs text-gray-500 mb-4">
          {numVal}번과 같은 회차에서 가장 자주 함께 출현한 번호입니다
        </p>
        <div className="space-y-3">
          {companions.map((c, idx) => (
            <div key={c.number} className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-400 w-5">{idx + 1}</span>
              <Link href={`/lotto/numbers/${c.number}`}>
                <LottoBall number={c.number} size="md" />
              </Link>
              <div className="flex-1">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${Math.round((c.count / companions[0].count) * 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{c.count}회</span>
            </div>
          ))}
        </div>
      </section>

      {/* Gap Analysis */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <h2 className="font-bold text-gray-900 mb-2">출현 간격 분석</h2>
        <p className="text-xs text-gray-500 mb-4">
          최근 10회 출현 사이의 간격 (회차 수)
        </p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-600">마지막 출현</span>
          <Link
            href={`/lotto/results/${gapData.lastSeen}`}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            {gapData.lastSeen}회
          </Link>
          <span className="text-sm text-gray-600">|</span>
          <span className="text-sm text-gray-600">현재 미출현</span>
          <span className="text-sm font-bold text-orange-600">{currentGapFromLatest}회</span>
        </div>
        {gapData.gaps.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {gapData.gaps.map((gap, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[3rem]"
              >
                <span className="text-lg font-bold text-gray-800">{gap}</span>
                <span className="text-[10px] text-gray-400">회차</span>
              </div>
            ))}
          </div>
        )}
        {gapData.gaps.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            평균 간격: <span className="font-medium text-gray-700">{avgGapValue}회</span>
            {" | "}최대 간격: <span className="font-medium text-gray-700">{Math.max(...gapData.gaps)}회</span>
            {" | "}최소 간격: <span className="font-medium text-gray-700">{Math.min(...gapData.gaps)}회</span>
          </p>
        )}
      </section>

      {/* FAQ */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <h2 className="font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
        <div className="space-y-3">
          {faqItems.map((faq, idx) => (
            <details
              key={idx}
              className="group border border-gray-100 rounded-xl"
            >
              <summary className="cursor-pointer px-4 py-3 font-medium text-sm text-gray-900 flex items-center justify-between list-none">
                <span>{faq.question}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg ml-3 shrink-0">
                  ▾
                </span>
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3">
                {faq.answer}
              </div>
            </details>
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
