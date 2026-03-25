import type { Metadata } from "next";
import PensionTaxClient from "./PensionTaxClient";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { buildFaqJsonLd } from "@/lib/utils/jsonld";

export const metadata: Metadata = {
  title: "연금복권 세금 계산기 - 매월 실수령액 확인 [2026]",
  description:
    "연금복권 720+ 당첨 시 매월 실수령액을 계산합니다. 1등 월 700만원, 2등 월 100만원의 세후 금액을 확인하세요.",
  alternates: { canonical: "/pension/tax" },
  openGraph: {
    title: "연금복권 세금 계산기 - 매월 실수령액 확인 [2026]",
    description:
      "연금복권 720+ 당첨 시 매월 실수령액을 계산합니다. 1등 월 700만원, 2등 월 100만원의 세후 금액을 확인하세요.",
    url: "/pension/tax",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function PensionTaxPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "연금복권 세금 계산기",
    url: `${SITE_URL}/pension/tax`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "연금복권 720+ 당첨 시 매월 실수령액을 계산합니다. 소득세·주민세 공제 후 금액을 즉시 확인하세요.",
    inLanguage: "ko",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "연금복권 720+",
          item: `${SITE_URL}/pension`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "세금 계산기",
          item: `${SITE_URL}/pension/tax`,
        },
      ],
    },
  };

  const faqJsonLd = buildFaqJsonLd([
    { question: "연금복권 1등 월 실수령액은 얼마인가요?", answer: "연금복권 1등 당첨 시 월 700만원에서 22%(소득세 20% + 주민세 2%)가 원천징수되어, 월 실수령액은 약 546만원입니다. 20년간 수령하면 총 실수령액은 약 13억 1,040만원입니다." },
    { question: "연금복권 세금은 로또와 다른가요?", answer: "네, 다릅니다. 로또는 3억원 초과분에 33%가 적용되지만, 연금복권은 매월 분할 수령하므로 월 수령액 기준으로 22%만 적용됩니다. 세금 부담이 상대적으로 적습니다." },
    { question: "연금복권 4등 이하도 세금을 내나요?", answer: "아니요. 당첨금 200만원 이하는 비과세이므로, 4등(10만원), 5등(5만원), 6등(5,000원), 7등(1,000원)은 세금 없이 전액 수령 가능합니다." },
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "연금복권 720+", href: "/pension" },
          { label: "세금 계산기" },
        ]}
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        &#x1F4B0; 연금복권 세금 계산기
      </h1>
      <p className="text-gray-600 mb-8">
        연금복권 720+ 등수를 선택하면 매월 실수령액을 바로 확인할 수 있습니다.
      </p>

      <PensionTaxClient />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}
