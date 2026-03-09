import type { Metadata } from "next";
import SimulatorClient from "./SimulatorClient";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import RelatedFeatures from "@/components/ui/RelatedFeatures";

export const metadata: Metadata = {
  title: "로또 시뮬레이터 - 로또 당첨 확률 체험",
  description:
    "로또 6/45를 수천 번 사면 얼마나 벌 수 있을까? 100회부터 10만회까지 가상 추첨으로 당첨 확률과 수익률을 직접 체험해보세요.",
  alternates: { canonical: "/lotto/simulator" },
  openGraph: {
    title: "로또 시뮬레이터 - 로또 당첨 확률 체험",
    description:
      "로또 6/45를 수천 번 사면 얼마나 벌 수 있을까? 100회부터 10만회까지 가상 추첨으로 당첨 확률과 수익률을 직접 체험해보세요.",
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

      <RelatedFeatures currentPath="/lotto/simulator" />
    </div>
  );
}
