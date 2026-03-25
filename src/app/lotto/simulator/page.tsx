import type { Metadata } from "next";
import SimulatorClient from "./SimulatorClient";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import RelatedFeatures from "@/components/ui/RelatedFeatures";

export const metadata: Metadata = {
  title: "로또 시뮬레이터 - 당첨될 때까지 돌려보기 [무료]",
  description:
    "실제 로또와 동일한 확률로 시뮬레이션합니다. 1등이 나올 때까지 몇 번을 사야 하는지 직접 체험해 보세요.",
  alternates: { canonical: "/lotto/simulator" },
  openGraph: {
    title: "로또 시뮬레이터 - 당첨될 때까지 돌려보기 [무료]",
    description:
      "실제 로또와 동일한 확률로 시뮬레이션합니다. 1등이 나올 때까지 몇 번을 사야 하는지 직접 체험해 보세요.",
    url: "/lotto/simulator",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function SimulatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "로또 시뮬레이터",
    url: `${SITE_URL}/lotto/simulator`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    description: "로또 6/45 당첨 확률을 직접 체험하는 시뮬레이터",
    inLanguage: "ko",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Trusted static JSON-LD, no user input */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "시뮬레이터" },
      ]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">🎰 로또 시뮬레이터</h1>
      <p className="text-gray-600 mb-8">
        로또를 수천 번 사면 결과가 어떨까요? 직접 체험해보세요.
      </p>

      <AdBanner slot="simulator-top" format="horizontal" className="mb-6" />

      <SimulatorClient />

      <AdBanner slot="simulator-bottom" format="horizontal" className="mt-6" />

      {/* FAQPage JSON-LD — trusted static content, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "로또 시뮬레이터란 무엇인가요?",
              acceptedAnswer: { "@type": "Answer", text: "실제 로또와 동일한 확률로 번호를 추첨하는 시뮬레이션입니다. 실제 돈을 쓰지 않고 로또의 당첨 확률을 체험할 수 있습니다." },
            },
            {
              "@type": "Question",
              name: "시뮬레이터에서 1등이 나올 확률은?",
              acceptedAnswer: { "@type": "Answer", text: "실제 로또와 동일하게 약 814만분의 1입니다. 1,000원씩 1만 번을 구매해도 1등 당첨 확률은 약 0.12%입니다." },
            },
          ],
        }) }}
      />

      <RelatedFeatures currentPath="/lotto/simulator" />
    </div>
  );
}
