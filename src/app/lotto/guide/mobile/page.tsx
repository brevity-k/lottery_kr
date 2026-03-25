import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "로또 모바일 구매 방법 - 동행복권 온라인 구매 가이드 [2026]",
  description:
    "동행복권 모바일 웹에서 로또 6/45를 구매하는 방법을 단계별로 안내합니다. 구매 한도, 이용 시간, 결제 방법 등 모바일 로또 구매의 모든 것.",
  alternates: { canonical: "/lotto/guide/mobile" },
  openGraph: {
    title: "로또 모바일 구매 방법 - 동행복권 온라인 구매 가이드 [2026]",
    description:
      "동행복권 모바일 웹에서 로또 6/45를 구매하는 방법을 단계별로 안내합니다. 구매 한도, 이용 시간, 결제 방법 등 모바일 로또 구매의 모든 것.",
    url: "/lotto/guide/mobile",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "article",
  },
};

const faqs = [
  {
    question: "로또 모바일 구매는 어디서 하나요?",
    answer:
      "동행복권 모바일 웹(m.dhlottery.co.kr)에서 구매할 수 있습니다. 별도 앱 설치 없이 모바일 브라우저에서 이용 가능합니다.",
  },
  {
    question: "로또 모바일 구매 한도는 얼마인가요?",
    answer:
      "1회 최대 5,000원(5게임), 주간 최대 100,000원까지 구매할 수 있습니다.",
  },
  {
    question: "모바일로 구매한 로또 당첨금은 어떻게 받나요?",
    answer:
      "5만원 이하는 예치금으로 자동 입금되며, 200만원 초과 당첨금은 농협은행 본점을 방문하여 수령해야 합니다.",
  },
];

export default function MobileGuidePage() {
  // JSON-LD is serialized from trusted static objects, not user input
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "로또 모바일 구매 방법",
      description:
        "동행복권 모바일 웹에서 로또 6/45를 구매하는 단계별 가이드입니다.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "동행복권 모바일 웹 접속",
          text: "모바일 브라우저에서 m.dhlottery.co.kr에 접속합니다.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "회원가입 및 본인인증",
          text: "만 18세 이상 본인인증을 완료하고 회원가입합니다.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "예치금 충전",
          text: "계좌이체를 통해 예치금을 충전합니다.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "로또 구매",
          text: "로또 6/45를 선택하고 번호를 선택(자동/수동/반자동)한 후 구매합니다.",
        },
      ],
      totalTime: "PT10M",
      inLanguage: "ko",
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
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "홈",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "로또 6/45",
          item: `${SITE_URL}/lotto`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "가이드",
          item: `${SITE_URL}/lotto/guide`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "모바일 구매",
          item: `${SITE_URL}/lotto/guide/mobile`,
        },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "로또 6/45", href: "/lotto" },
          { label: "가이드", href: "/lotto/guide" },
          { label: "모바일 구매" },
        ]}
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        로또 모바일 구매 방법
      </h1>
      <p className="text-gray-600 mb-8">
        동행복권 모바일 웹에서 로또 6/45를 구매하는 방법을 단계별로
        안내합니다. 2026년 2월부터 모바일 구매가 가능합니다.
      </p>

      {/* Section 1: 구매 방법 */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          모바일 로또 구매 단계
        </h2>
        <ol className="space-y-5">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                동행복권 모바일 웹 접속
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                모바일 브라우저에서{" "}
                <a
                  href="https://m.dhlottery.co.kr"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-blue-600 hover:underline"
                >
                  m.dhlottery.co.kr
                </a>
                에 접속합니다. 별도의 앱 설치 없이 모바일 브라우저에서 바로
                이용할 수 있습니다.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              2
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                회원가입 및 본인인증
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                만 18세 이상만 가입 가능합니다. 휴대폰 본인인증 또는
                공동인증서(구 공인인증서)를 통해 본인확인을 완료해야 합니다.
                실명 확인 후 아이디와 비밀번호를 설정합니다.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              3
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                예치금 충전
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                로또를 구매하려면 먼저 예치금을 충전해야 합니다. 계좌이체
                방식으로만 충전 가능하며, 신용카드 결제는 지원하지 않습니다.
                충전한 예치금으로 로또를 구매합니다.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              4
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                번호 선택 및 구매
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                &ldquo;로또 6/45&rdquo;를 선택한 후 번호를 고릅니다. 자동
                (랜덤), 수동 (직접 선택), 반자동 (일부 직접 + 나머지 랜덤) 중
                원하는 방식을 선택할 수 있습니다. 1게임당 1,000원이며, 한 번에
                최대 5게임까지 구매 가능합니다.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Section 2: 구매 한도 및 이용 시간 */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          구매 한도 및 이용 시간
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5">
          <h3 className="font-semibold text-blue-900 mb-3">구매 한도</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
              <span>
                <strong>1회 구매 한도:</strong> 5,000원 (5게임)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
              <span>
                <strong>주간 구매 한도:</strong> 100,000원
              </span>
            </li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="font-semibold text-blue-900 mb-3">이용 시간</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
              <span>
                <strong>평일 및 일요일:</strong> 06:00 ~ 24:00
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
              <span>
                <strong>토요일 (추첨일):</strong> 06:00 ~ 20:00 (추첨 45분
                전 마감)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
              <span>
                <strong>판매 시작:</strong> 매주 일요일 06:00부터 다음 회차
                판매
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3: 결제 방법 */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">결제 방법</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-green-600 text-lg flex-shrink-0">
              &#10003;
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                예치금 충전 (계좌이체)
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                본인 명의 은행 계좌에서 동행복권 예치금 계좌로 이체합니다.
                충전된 예치금으로 로또를 구매하며, 미사용 예치금은 언제든
                출금할 수 있습니다.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-red-500 text-lg flex-shrink-0">
              &#10007;
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                신용카드 결제 불가
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                신용카드, 체크카드, 간편결제(카카오페이, 네이버페이 등)는
                사용할 수 없습니다. 오직 계좌이체를 통한 예치금 충전만
                가능합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: 당첨금 수령 */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">당첨금 수령</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 pr-4 font-semibold text-gray-900">
                  당첨금 구간
                </th>
                <th className="text-left py-3 font-semibold text-gray-900">
                  수령 방법
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4">5만원 이하</td>
                <td className="py-3">예치금으로 자동 입금</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4">5만원 초과 ~ 200만원</td>
                <td className="py-3">
                  예치금 입금 또는 농협은행 지점 방문 수령
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4">200만원 초과</td>
                <td className="py-3">
                  농협은행 본점 방문 수령 (신분증 지참)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          당첨금에 대한 세금이 궁금하시다면{" "}
          <Link
            href="/lotto/tax"
            className="text-blue-600 hover:underline"
          >
            세금 계산기
          </Link>
          를 이용해보세요.
        </p>
      </section>

      {/* Section 5: 주의사항 */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">주의사항</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <ul className="space-y-3 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">&#9888;</span>
              <span>
                <strong>본인 명의만 가능:</strong> 타인 명의로 회원가입하거나
                구매할 수 없습니다. 적발 시 당첨금 지급이 거부될 수 있습니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">&#9888;</span>
              <span>
                <strong>해외 구매 불가:</strong> 국내 IP에서만 구매 가능합니다.
                VPN 사용 시에도 구매가 제한됩니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">&#9888;</span>
              <span>
                <strong>구매 취소 불가:</strong> 결제 완료 후에는 구매를 취소할
                수 없으니 번호를 신중하게 선택하세요.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">&#9888;</span>
              <span>
                <strong>QR코드로 당첨 확인:</strong> 모바일로 구매한 복권은
                &ldquo;나의 구매내역&rdquo;에서 QR코드로 당첨 여부를 확인할 수
                있습니다.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
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

      {/* CTA */}
      <div className="text-center mt-10">
        <p className="text-gray-500 text-sm mb-3">
          번호 선택이 고민이시라면?
        </p>
        <Link
          href="/lotto/recommend"
          className="inline-block bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          번호 추천 받기
        </Link>
      </div>
    </div>
  );
}
