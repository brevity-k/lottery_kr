import type { Metadata } from "next";
import LuckyClient from "./LuckyClient";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "오늘의 행운 번호 - 매일 바뀌는 로또 번호",
  description:
    "매일 자정에 바뀌는 오늘의 행운 번호를 확인하세요. 같은 날이면 누구나 같은 번호를 받습니다. 로또 6/45 행운의 번호 추천.",
  alternates: { canonical: "/lotto/lucky" },
  openGraph: {
    title: "오늘의 행운 번호 - 매일 바뀌는 로또 번호",
    description:
      "매일 자정에 바뀌는 오늘의 행운 번호를 확인하세요. 같은 날이면 누구나 같은 번호를 받습니다. 로또 6/45 행운의 번호 추천.",
    url: "/lotto/lucky",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function LuckyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "오늘의 행운 번호" },
      ]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🍀 오늘의 행운 번호
      </h1>
      <p className="text-gray-600 mb-8">
        매일 자정(KST)에 바뀌는 행운의 번호입니다. 같은 날이면 누구나 같은 번호를 받습니다.
      </p>

      <AdBanner slot="lucky-top" format="horizontal" className="mb-6" />

      <LuckyClient />

      <AdBanner slot="lucky-bottom" format="horizontal" className="mt-6" />

      <section className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">오늘의 행운 번호란?</h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            오늘의 행운 번호는 매일 자정(한국시간)에 자동으로 바뀌는 로또 추천 번호입니다.
            같은 날에는 모든 방문자가 동일한 번호를 받게 됩니다.
          </p>
          <p>
            이 번호는 날짜를 기반으로 한 수학적 알고리즘으로 생성되며,
            당첨을 보장하지 않는 재미 목적의 서비스입니다.
          </p>
          <p className="text-gray-500 text-xs">
            본 서비스의 번호 추천은 통계적 분석을 기반으로 한 참고 자료이며, 당첨을 보장하지 않습니다.
          </p>
        </div>
      </section>
    </div>
  );
}
