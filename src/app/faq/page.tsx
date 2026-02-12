import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "자주 묻는 질문 (FAQ) - 로또 구매, 당첨금 수령, 세금 안내",
  description:
    "로또 6/45 구매 방법, 당첨금 수령 절차, 세금 계산, 추첨 일정 등 자주 묻는 질문과 답변을 확인하세요.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    question: "로또 6/45는 어떻게 구매하나요?",
    answer:
      "로또 6/45는 전국 복권 판매점에서 1게임당 1,000원에 구매할 수 있습니다. 1장에 최대 5게임까지 선택 가능합니다. 온라인 구매는 동행복권 공식 사이트(dhlottery.co.kr)에서 가능하며, 본인 인증 후 주당 최대 10만원까지 구매할 수 있습니다.",
  },
  {
    question: "로또 추첨은 언제 하나요?",
    answer:
      "매주 토요일 오후 8시 45분에 MBC에서 생방송으로 추첨합니다. 추첨 결과는 추첨 직후 동행복권 사이트와 각종 포털에서 확인할 수 있습니다.",
  },
  {
    question: "로또 당첨금은 어떻게 수령하나요?",
    answer:
      "5등(5,000원)과 4등(50,000원)은 전국 복권 판매점에서 수령 가능합니다. 3등은 농협은행 지점에서, 1등과 2등은 농협은행 본점에서 신분증과 당첨 복권을 지참하여 수령합니다. 당첨금 수령 기한은 지급 개시일로부터 1년입니다.",
  },
  {
    question: "로또 당첨금에 세금이 얼마나 부과되나요?",
    answer:
      '200만원 이하는 비과세, 200만원 초과 3억원 이하는 22%(소득세 20% + 지방소득세 2%), 3억원 초과분은 33%(소득세 30% + 지방소득세 3%)가 부과됩니다. 정확한 실수령액은 <a href="/lotto/tax" class="text-blue-600 hover:underline">세금 계산기</a>에서 확인할 수 있습니다.',
  },
  {
    question: "로또 1등 당첨 확률은 얼마인가요?",
    answer:
      '로또 6/45의 1등 당첨 확률은 1/8,145,060입니다. 45개의 숫자 중 6개를 맞춰야 하며, 조합의 수는 45C6 = 8,145,060가지입니다. 자세한 통계 분석은 <a href="/lotto/stats" class="text-blue-600 hover:underline">통계 분석 페이지</a>에서 확인할 수 있습니다.',
  },
  {
    question: "로또 번호 추천은 어떤 방식으로 이루어지나요?",
    answer:
      '로또리에서는 6가지 추천 알고리즘을 제공합니다: 랜덤 추천, 통계 기반 추천, 핫넘버 추천, 콜드넘버 추천, 균형 추천, AI 종합 추천. 각 방식은 역대 당첨번호 통계를 기반으로 합니다. <a href="/lotto/recommend" class="text-blue-600 hover:underline">번호 추천 페이지</a>에서 직접 이용해보세요.',
  },
  {
    question: "로또 번호 선택 시 유의할 점이 있나요?",
    answer:
      "로또 추첨은 매 회차 독립적인 사건으로, 어떤 번호 조합이든 당첨 확률은 동일합니다. 다만, 많은 사람들이 선택하는 번호(생일 범위 1~31, 연속 번호 등)를 피하면 1등 당첨 시 당첨금을 나누는 인원이 줄어들 수 있습니다.",
  },
  {
    question: "당첨번호에 패턴이 있나요?",
    answer:
      '수학적으로 로또 추첨은 완전한 무작위이며, 과거 결과가 미래를 예측하지 않습니다. 그러나 역대 1,200회 이상의 데이터에서 번호별 출현 빈도, 홀짝 비율, 구간별 분포 등의 경향을 관찰할 수 있습니다. <a href="/lotto/numbers" class="text-blue-600 hover:underline">번호별 통계</a>에서 확인해보세요.',
  },
  {
    question: "로또 복권은 온라인으로 구매할 수 있나요?",
    answer:
      "네, 동행복권 공식 사이트(dhlottery.co.kr)에서 본인 인증 후 온라인 구매가 가능합니다. 주당 최대 구매 한도는 10만원이며, 예치금을 충전한 후 구매할 수 있습니다. 판매 시간은 매주 일~토요일 오후 6시까지입니다.",
  },
  {
    question: "로또 시뮬레이터는 실제와 동일한가요?",
    answer:
      '로또리의 시뮬레이터는 실제 추첨과 동일한 무작위 방식(45개 중 6개 + 보너스 1개)을 사용합니다. 1등~3등 당첨금은 역대 평균 추정치를 사용하며, 실제 당첨금은 매회 달라집니다. <a href="/lotto/simulator" class="text-blue-600 hover:underline">시뮬레이터</a>에서 직접 체험해보세요.',
  },
  {
    question: "당첨 복권을 분실하면 어떻게 하나요?",
    answer:
      "복권은 무기명 증권으로 분실 시 재발행이 불가합니다. 온라인 구매의 경우 계정에 자동 저장되어 분실 위험이 없습니다. 오프라인 구매 복권은 서명을 해두면 분실 시 일부 보호를 받을 수 있으니 구매 후 바로 서명하는 것을 권장합니다.",
  },
  {
    question: "로또리 사이트는 무료인가요?",
    answer:
      "네, 로또리의 모든 서비스(번호 추천, 당첨번호 조회, 통계 분석, 세금 계산기, 시뮬레이터, 블로그)는 무료로 이용 가능합니다. 회원가입 없이 바로 사용할 수 있습니다.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.replace(/<[^>]*>/g, ""),
      },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "자주 묻는 질문" }]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">자주 묻는 질문</h1>
      <p className="text-gray-600 mb-8">
        로또 구매, 당첨금 수령, 세금 등 자주 묻는 질문에 대한 답변입니다
      </p>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="group bg-white rounded-2xl border border-gray-200 shadow-sm"
          >
            <summary className="cursor-pointer px-6 py-4 font-semibold text-gray-900 flex items-center justify-between list-none">
              <span>{faq.question}</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform text-xl ml-4 shrink-0">
                ▾
              </span>
            </summary>
            <div className="px-6 pb-5 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
              <p dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </div>
          </details>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-gray-500 text-sm mb-3">
          원하는 답변을 찾지 못하셨나요?
        </p>
        <Link
          href="/contact"
          className="inline-block bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          문의하기
        </Link>
      </div>
    </div>
  );
}
