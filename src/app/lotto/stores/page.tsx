import type { Metadata } from "next";
import { getAllWinningStores, getTopStores, getRegions } from "@/lib/lottery/stores";
import StoresClient from "./StoresClient";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";

import { SITE_URL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "로또 명당 판매점 지도 - 1등 당첨 매장 찾기 [전국]",
  description:
    "전국 로또 1등 당첨 명당 판매점을 지도에서 찾아보세요. 지역별 검색, 당첨 횟수 순위, 내 주변 명당을 바로 확인할 수 있습니다.",
  alternates: { canonical: "/lotto/stores" },
  openGraph: {
    title: "로또 명당 판매점 지도 - 1등 당첨 매장 찾기 [전국]",
    description:
      "전국 로또 1등 당첨 명당 판매점을 지도에서 찾아보세요. 지역별 검색, 당첨 횟수 순위, 내 주변 명당을 바로 확인할 수 있습니다.",
    url: "/lotto/stores",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function StoresPage() {
  const stores = getAllWinningStores();
  const topStores = getTopStores(20);
  const regions = getRegions();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "로또 명당 판매점 지도",
    url: `${SITE_URL}/lotto/stores`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    description: "전국 로또 1등 당첨 명당 판매점을 지도에서 찾는 서비스",
    inLanguage: "ko",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <link
        rel="preload"
        href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"
        as="script"
      />
      <link
        rel="preload"
        href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"
        as="style"
      />
      <script
        type="application/ld+json"
        // JSON-LD is serialized from a trusted static object, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "로또 6/45", href: "/lotto" },
          { label: "명당 판매점" },
        ]}
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🏪 로또 명당 판매점 지도
      </h1>
      <p className="text-gray-600 mb-8">
        전국 로또 1등 당첨 판매점을 지도에서 찾아보세요. 총{" "}
        <strong>{stores.length}곳</strong>의 명당 판매점 정보를 제공합니다.
      </p>

      <AdBanner slot="stores-top" format="horizontal" className="mb-6" />

      <StoresClient stores={stores} topStores={topStores} regions={regions} />

      <AdBanner slot="stores-bottom" format="horizontal" className="mt-6" />

      <section className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          로또 명당이란?
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong>로또 명당</strong>은 로또 1등 당첨자가 여러 번 나온
            판매점을 말합니다. 통계적으로 특정 판매점에서 당첨이 더 잘
            되는 것은 아니지만, 판매량이 많은 곳일수록 당첨자가 나올
            확률이 높습니다.
          </p>
          <p>
            위 지도에 표시된 판매점들은 실제 로또 1등 당첨이 나온
            곳으로, 판매점별 당첨 횟수를 확인할 수 있습니다. 가까운
            명당 판매점을 찾아 행운을 시험해 보세요!
          </p>
          <p className="text-gray-500 text-xs">
            ※ 본 데이터는 공개된 당첨 판매점 정보를 기반으로 하며,
            특정 판매점에서의 구매가 당첨을 보장하지 않습니다. 복권
            구매는 개인의 판단과 책임 하에 이루어져야 합니다.
          </p>
        </div>
      </section>

    </div>
  );
}
