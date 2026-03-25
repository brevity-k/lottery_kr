import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "연금복권 720+ 완벽 가이드 - 당첨 확률, 구매 방법, 세금 [2026]",
  description:
    "연금복권 720+의 구매 방법, 당첨 구조, 확률, 세금까지 한눈에 정리했습니다. 매달 700만원씩 20년간 받는 1등의 모든 것을 알아보세요.",
  alternates: { canonical: "/pension" },
  openGraph: {
    title: "연금복권 720+ 완벽 가이드 - 당첨 확률, 구매 방법, 세금 [2026]",
    description:
      "연금복권 720+의 구매 방법, 당첨 구조, 확률, 세금까지 한눈에 정리했습니다. 매달 700만원씩 20년간 받는 1등의 모든 것을 알아보세요.",
    url: "/pension",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

const faqs = [
  {
    question: "연금복권 720+ 1등 당첨금은 얼마인가요?",
    answer:
      "1등 당첨 시 매월 700만원을 20년간 수령합니다. 세전 총액 16억 8,000만원이며, 세후 약 13억 1,000만원입니다.",
  },
  {
    question: "연금복권 당첨 확률은?",
    answer:
      "1등 당첨 확률은 500만분의 1로, 로또 6/45(약 814만분의 1)보다 높습니다.",
  },
  {
    question: "연금복권 세금은 어떻게 계산되나요?",
    answer:
      "매월 수령하는 당첨금에 22% (소득세 20% + 주민세 2%)가 원천징수됩니다. 월 700만원 기준 실수령액은 약 546만원입니다.",
  },
  {
    question: "연금복권은 모바일로 구매할 수 있나요?",
    answer:
      "네, 동행복권 모바일 웹(m.dhlottery.co.kr)에서 구매 가능합니다. 로또 판매점에서도 구매할 수 있습니다.",
  },
];

export default function PensionPage() {
  // JSON-LD is serialized from trusted static objects, not user input
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "연금복권 720+ 완벽 가이드",
      description:
        "연금복권 720+의 구매 방법, 당첨 구조, 확률, 세금까지 한눈에 정리했습니다.",
      url: `${SITE_URL}/pension`,
      inLanguage: "ko",
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* JSON-LD — trusted static content, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "연금복권 720+" }]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        연금복권 720+ 완벽 가이드
      </h1>
      <p className="text-gray-600 mb-8">
        매달 700만원씩 20년간! 연금복권 720+의 모든 것을 알아보세요
      </p>

      {/* 연금복권 720+란? */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          연금복권 720+란?
        </h2>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            연금복권 720+는 1등 당첨 시{" "}
            <strong className="text-blue-700">
              매월 700만원을 20년간 수령
            </strong>
            하는 연금형 복권입니다. 매주 <strong>목요일</strong>에 MBC에서
            추첨하며, 1장 1,000원에 구매할 수 있습니다.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-800 mb-3">
              등수별 당첨금
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-100/50">
                    <th className="text-left px-3 py-2 border border-blue-200 font-semibold text-blue-900">
                      등수
                    </th>
                    <th className="text-left px-3 py-2 border border-blue-200 font-semibold text-blue-900">
                      당첨금
                    </th>
                    <th className="text-left px-3 py-2 border border-blue-200 font-semibold text-blue-900">
                      수령 방식
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-yellow-50">
                    <td className="px-3 py-2 border border-blue-200 font-bold text-yellow-700">
                      1등
                    </td>
                    <td className="px-3 py-2 border border-blue-200 font-bold">
                      월 700만원 x 20년
                    </td>
                    <td className="px-3 py-2 border border-blue-200 text-gray-600">
                      연금 (총 16억 8,000만원)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-blue-200 font-semibold">
                      2등
                    </td>
                    <td className="px-3 py-2 border border-blue-200 font-semibold">
                      월 100만원 x 10년
                    </td>
                    <td className="px-3 py-2 border border-blue-200 text-gray-600">
                      연금 (총 1억 2,000만원)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-blue-200">3등</td>
                    <td className="px-3 py-2 border border-blue-200">
                      100만원
                    </td>
                    <td className="px-3 py-2 border border-blue-200 text-gray-600">
                      일시금
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-blue-200">4등</td>
                    <td className="px-3 py-2 border border-blue-200">
                      10만원
                    </td>
                    <td className="px-3 py-2 border border-blue-200 text-gray-600">
                      일시금
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-blue-200">5등</td>
                    <td className="px-3 py-2 border border-blue-200">5만원</td>
                    <td className="px-3 py-2 border border-blue-200 text-gray-600">
                      일시금
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-blue-200">6등</td>
                    <td className="px-3 py-2 border border-blue-200">
                      5,000원
                    </td>
                    <td className="px-3 py-2 border border-blue-200 text-gray-600">
                      일시금
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-blue-200">7등</td>
                    <td className="px-3 py-2 border border-blue-200">
                      1,000원
                    </td>
                    <td className="px-3 py-2 border border-blue-200 text-gray-600">
                      일시금
                    </td>
                  </tr>
                  <tr className="bg-purple-50">
                    <td className="px-3 py-2 border border-blue-200 font-semibold text-purple-700">
                      보너스
                    </td>
                    <td className="px-3 py-2 border border-blue-200 font-semibold">
                      월 100만원 x 10년
                    </td>
                    <td className="px-3 py-2 border border-blue-200 text-gray-600">
                      연금 (총 1억 2,000만원)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 구매 방법 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">구매 방법</h2>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-semibold text-gray-900 mb-1">가격</p>
              <p className="text-lg font-bold text-blue-600">1장 1,000원</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-semibold text-gray-900 mb-1">추첨일</p>
              <p className="text-lg font-bold text-blue-600">
                매주 목요일 (MBC)
              </p>
            </div>
          </div>

          <ul className="space-y-3 mt-4">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>
                <strong>구매처:</strong> 전국 동행복권 위탁 판매점 (로또
                판매점과 동일)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>
                <strong>번호 구성:</strong> 5개 조(1~5조) 중 1개 조 + 6자리
                번호(000000~999999)가 인쇄된 복권을 구매
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>
                <strong>선택 방식:</strong> 자동/수동 선택 불가 — 인쇄된 번호를
                그대로 구매
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span>
                <strong>모바일 구매:</strong> 동행복권 모바일 웹
                (m.dhlottery.co.kr)에서 가능
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* 당첨 확률 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">당첨 확률</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 border border-gray-200 font-semibold">
                  등수
                </th>
                <th className="text-left px-3 py-2 border border-gray-200 font-semibold">
                  당첨 조건
                </th>
                <th className="text-center px-3 py-2 border border-gray-200 font-semibold">
                  확률
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-yellow-50">
                <td className="px-3 py-2 border border-gray-200 font-bold text-yellow-700">
                  1등
                </td>
                <td className="px-3 py-2 border border-gray-200">
                  조 + 6자리 모두 일치
                </td>
                <td className="text-center px-3 py-2 border border-gray-200 font-semibold">
                  1/5,000,000
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200 font-semibold">
                  2등
                </td>
                <td className="px-3 py-2 border border-gray-200">
                  조 무관 + 6자리 일치
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  4/5,000,000
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200">3등</td>
                <td className="px-3 py-2 border border-gray-200">
                  조 일치 + 앞 5자리 일치
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  1/500,000
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200">4등</td>
                <td className="px-3 py-2 border border-gray-200">
                  조 일치 + 앞 4자리 일치
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  1/50,000
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200">5등</td>
                <td className="px-3 py-2 border border-gray-200">
                  조 일치 + 앞 3자리 일치
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  1/5,000
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200">6등</td>
                <td className="px-3 py-2 border border-gray-200">
                  조 일치 + 앞 2자리 일치
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  1/500
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200">7등</td>
                <td className="px-3 py-2 border border-gray-200">
                  조 일치 + 앞 1자리 일치
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  1/50
                </td>
              </tr>
              <tr className="bg-purple-50">
                <td className="px-3 py-2 border border-gray-200 font-semibold text-purple-700">
                  보너스
                </td>
                <td className="px-3 py-2 border border-gray-200">
                  각 조 보너스 번호 일치
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  5/5,000,000
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * 전체 번호 범위: 5개 조 x 1,000,000개 번호 = 5,000,000 가지
        </p>
      </section>

      {/* 세금 안내 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">세금 안내</h2>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 border border-gray-200 font-semibold">
                    등수
                  </th>
                  <th className="text-center px-3 py-2 border border-gray-200 font-semibold">
                    당첨금
                  </th>
                  <th className="text-center px-3 py-2 border border-gray-200 font-semibold">
                    세율
                  </th>
                  <th className="text-center px-3 py-2 border border-gray-200 font-semibold">
                    월 실수령액
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-yellow-50">
                  <td className="px-3 py-2 border border-gray-200 font-bold text-yellow-700">
                    1등
                  </td>
                  <td className="text-center px-3 py-2 border border-gray-200">
                    월 700만원
                  </td>
                  <td className="text-center px-3 py-2 border border-gray-200">
                    22%
                  </td>
                  <td className="text-center px-3 py-2 border border-gray-200 font-semibold text-blue-700">
                    약 546만원
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-gray-200 font-semibold">
                    2등
                  </td>
                  <td className="text-center px-3 py-2 border border-gray-200">
                    월 100만원
                  </td>
                  <td className="text-center px-3 py-2 border border-gray-200">
                    22%
                  </td>
                  <td className="text-center px-3 py-2 border border-gray-200 font-semibold text-blue-700">
                    약 78만원
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">3등</td>
                  <td className="text-center px-3 py-2 border border-gray-200">
                    100만원 (일시금)
                  </td>
                  <td className="text-center px-3 py-2 border border-gray-200">
                    22%
                  </td>
                  <td className="text-center px-3 py-2 border border-gray-200 font-semibold">
                    약 78만원
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    4등 이하
                  </td>
                  <td className="text-center px-3 py-2 border border-gray-200">
                    10만원 이하
                  </td>
                  <td className="text-center px-3 py-2 border border-gray-200 text-green-600 font-semibold">
                    비과세
                  </td>
                  <td className="text-center px-3 py-2 border border-gray-200 text-green-600 font-semibold">
                    전액 수령
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="font-semibold text-green-800 mb-1">
              연금복권 세금의 핵심 포인트
            </p>
            <p className="text-green-700 text-xs">
              연금복권 1등은 매월 700만원씩 수령하므로, 로또처럼 3억원 초과분에
              33%가 적용되지 않습니다. 매월 수령액 기준으로 22% (소득세 20% +
              주민세 2%)가 원천징수되어, 로또 대비 세금 부담이 적습니다.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/pension/tax"
              className="inline-block bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              연금복권 세금 계산기 바로가기
            </Link>
          </div>
        </div>
      </section>

      {/* 로또 6/45와 비교 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          로또 6/45 vs 연금복권 720+ 비교
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 border border-gray-200 font-semibold">
                  항목
                </th>
                <th className="text-center px-3 py-2 border border-gray-200 font-semibold">
                  로또 6/45
                </th>
                <th className="text-center px-3 py-2 border border-gray-200 font-semibold">
                  연금복권 720+
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border border-gray-200 font-medium">
                  가격
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  1,000원
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  1,000원
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200 font-medium">
                  추첨일
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  토요일
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  목요일
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200 font-medium">
                  1등 확률
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  1/8,145,060
                </td>
                <td className="text-center px-3 py-2 border border-gray-200 font-semibold text-blue-700">
                  1/5,000,000
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200 font-medium">
                  1등 당첨금
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  변동 (평균 20억+)
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  월 700만원 x 20년
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200 font-medium">
                  수령 방식
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  일시금
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  연금 (매월)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200 font-medium">
                  세금
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  22~33%
                </td>
                <td className="text-center px-3 py-2 border border-gray-200 font-semibold text-blue-700">
                  22% (월별)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-gray-200 font-medium">
                  번호 선택
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  자동/수동/반자동
                </td>
                <td className="text-center px-3 py-2 border border-gray-200">
                  인쇄 번호 구매
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          자주 묻는 질문
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm"
            >
              <summary className="cursor-pointer px-6 py-4 font-semibold text-gray-900 flex items-center justify-between list-none">
                <span>{faq.question}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform text-xl ml-4 shrink-0">
                  &#9662;
                </span>
              </summary>
              <div className="px-6 pb-5 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 관련 링크 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          관련 서비스
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/pension/tax"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">&#x1F4B0;</span>
            <div>
              <p className="font-semibold text-gray-900">
                연금복권 세금 계산기
              </p>
              <p className="text-xs text-gray-500">
                등수별 월 실수령액 확인
              </p>
            </div>
          </Link>
          <Link
            href="/lotto/tax"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">&#x1F9EE;</span>
            <div>
              <p className="font-semibold text-gray-900">로또 세금 계산기</p>
              <p className="text-xs text-gray-500">
                로또 당첨금 실수령액 확인
              </p>
            </div>
          </Link>
          <Link
            href="/lotto/recommend"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">&#x1F916;</span>
            <div>
              <p className="font-semibold text-gray-900">로또 번호 추천</p>
              <p className="text-xs text-gray-500">
                6가지 알고리즘 기반 추천
              </p>
            </div>
          </Link>
          <Link
            href="/faq"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">&#x2753;</span>
            <div>
              <p className="font-semibold text-gray-900">자주 묻는 질문</p>
              <p className="text-xs text-gray-500">
                로또 구매 · 수령 · 세금 FAQ
              </p>
            </div>
          </Link>
        </div>
      </section>

      <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          ※ 본 페이지의 정보는 참고용이며, 정확한 정보는 동행복권 공식
          사이트(dhlottery.co.kr)에서 확인하시기 바랍니다. 복권 구매는 개인의
          판단과 책임 하에 이루어져야 합니다.
        </p>
      </div>
    </div>
  );
}
