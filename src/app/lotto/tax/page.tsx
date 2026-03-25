import type { Metadata } from "next";
import TaxCalculatorClient from "./TaxCalculatorClient";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME, SITE_URL } from "@/lib/constants";


export const metadata: Metadata = {
  title: "로또 세금 계산기 - 당첨금 실수령액 즉시 확인",
  description:
    "로또 당첨금 세금을 즉시 계산합니다. 소득세 20~30%, 지방소득세 공제 후 실수령액을 바로 확인하세요. 2026 최신 세법 기준.",
  alternates: { canonical: "/lotto/tax" },
  openGraph: {
    title: "로또 세금 계산기 - 당첨금 실수령액 즉시 확인",
    description:
      "로또 당첨금 세금을 즉시 계산합니다. 소득세 20~30%, 지방소득세 공제 후 실수령액을 바로 확인하세요. 2026 최신 세법 기준.",
    url: "/lotto/tax",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function TaxPage() {
  // JSON-LD is serialized from a trusted static object, not user input
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "로또 세금 계산기",
    url: `${SITE_URL}/lotto/tax`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description: "로또 당첨금 세금(소득세·지방소득세) 공제 후 실수령액을 즉시 계산합니다.",
    inLanguage: "ko",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "세금 계산기", item: `${SITE_URL}/lotto/tax` },
      ],
    },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        // JSON-LD is serialized from a trusted static object, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "세금 계산기" },
      ]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 로또 세금 계산기</h1>
      <p className="text-gray-600 mb-8">
        당첨금을 입력하면 세금과 실수령액을 바로 확인할 수 있습니다.
      </p>

      <TaxCalculatorClient />

      {/* FAQPage JSON-LD — trusted static content, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "로또 당첨금 세금은 얼마인가요?",
              acceptedAnswer: { "@type": "Answer", text: "3억원 이하는 22% (소득세 20% + 주민세 2%), 3억원 초과분은 33% (소득세 30% + 주민세 3%)가 부과됩니다. 5만원 이하 당첨금은 비과세입니다." },
            },
            {
              "@type": "Question",
              name: "로또 3등도 세금을 내나요?",
              acceptedAnswer: { "@type": "Answer", text: "3등 당첨금은 보통 150만원 내외로, 5만원을 초과하므로 22%의 세금이 부과됩니다. 4등(5만원)과 5등(5천원)은 비과세입니다." },
            },
            {
              "@type": "Question",
              name: "세금은 어떻게 납부하나요?",
              acceptedAnswer: { "@type": "Answer", text: "당첨금 수령 시 자동으로 원천징수됩니다. 별도로 세금을 납부할 필요 없이, 세후 실수령액을 받게 됩니다." },
            },
          ],
        }) }}
      />
    </div>
  );
}
