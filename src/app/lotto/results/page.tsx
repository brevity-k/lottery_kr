import type { Metadata } from "next";
import { getAllResults } from "@/lib/api/dhlottery";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ResultsClient from "./ResultsClient";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "로또 당첨번호 조회 - 1회~최신 전체 회차 확인",
  description:
    "로또 6/45 1회부터 최신 회차까지 전체 당첨번호를 조회하세요. 회차별 당첨번호, 1등 당첨금, 당첨자 수를 바로 확인할 수 있습니다.",
  alternates: { canonical: "/lotto/results" },
  openGraph: {
    title: "로또 당첨번호 조회 - 1회~최신 전체 회차 확인",
    description:
      "로또 6/45 1회부터 최신 회차까지 전체 당첨번호를 조회하세요. 회차별 당첨번호, 1등 당첨금, 당첨자 수를 바로 확인할 수 있습니다.",
    url: "/lotto/results",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function ResultsPage() {
  const results = getAllResults();

  // JSON-LD is serialized from a trusted static object, not user input
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "로또 당첨번호 조회",
    url: `${SITE_URL}/lotto/results`,
    description: `로또 6/45 1회부터 제${results[0]?.drwNo ?? ""}회까지 전체 당첨번호 조회`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "당첨번호 조회", item: `${SITE_URL}/lotto/results` },
      ],
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        // JSON-LD is serialized from a trusted static object, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "당첨번호" },
      ]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🔍 로또 당첨번호 조회
      </h1>
      <p className="text-gray-600 mb-8">
        1회부터 최신 회차까지 전체 당첨번호를 검색하고 확인하세요
      </p>

      <ResultsClient results={results} />
    </div>
  );
}
