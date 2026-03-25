import type { Metadata } from "next";
import Link from "next/link";
import DreamClient from "./DreamClient";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME } from "@/lib/constants";
import RelatedFeatures from "@/components/ui/RelatedFeatures";
import { DREAM_CATEGORIES } from "@/lib/lottery/dream";
import { buildFaqJsonLd } from "@/lib/utils/jsonld";

export const metadata: Metadata = {
  title: "꿈해몽 로또 번호 - 꿈풀이로 번호 추천 [42가지 꿈]",
  description:
    "꿈해몽으로 로또 번호를 추천받으세요. 돼지꿈, 뱀꿈, 돈꿈 등 42가지 꿈 해석과 연결된 로또 번호를 무료로 생성합니다.",
  alternates: { canonical: "/lotto/dream" },
  openGraph: {
    title: "꿈해몽 로또 번호 - 꿈풀이로 번호 추천 [42가지 꿈]",
    description:
      "꿈해몽으로 로또 번호를 추천받으세요. 돼지꿈, 뱀꿈, 돈꿈 등 42가지 꿈 해석과 연결된 로또 번호를 무료로 생성합니다.",
    url: "/lotto/dream",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function DreamPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "꿈해몽 번호 생성기" },
      ]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🔮 로또 꿈해몽 번호 생성기
      </h1>
      <p className="text-gray-600 mb-8">
        간밤에 꾼 꿈을 선택하면 전통 꿈해몽을 기반으로 행운의 로또 번호를 추천해 드립니다.
      </p>

      <AdBanner slot="dream-top" format="horizontal" className="mb-6" />

      <DreamClient />

      <AdBanner slot="dream-bottom" format="horizontal" className="mt-6" />

      <section className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">꿈해몽 번호란?</h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            꿈해몽 번호는 한국 전통 꿈해몽을 기반으로 꿈의 상징에 맞는
            로또 번호를 추천하는 서비스입니다. 각 꿈 키워드에는 전통적인
            해석과 연관된 번호 풀이 있으며, 그 중에서 6개가 랜덤으로 선택됩니다.
          </p>
          <p>
            같은 꿈 키워드를 선택해도 매번 다른 조합이 생성되므로,
            마음에 드는 번호가 나올 때까지 여러 번 시도해 보세요.
          </p>
          <p className="text-gray-500 text-xs">
            본 서비스의 번호 추천은 전통 꿈해몽을 참고한 재미 목적의 서비스이며, 당첨을 보장하지 않습니다.
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd([
          { question: "꿈해몽 로또 번호란 무엇인가요?", answer: "한국의 전통 꿈 해석에 기반하여 로또 번호를 추천하는 서비스입니다. 각 꿈의 상징에 연결된 번호를 조합하여 제안합니다." },
          { question: "어떤 꿈이 로또에 좋은 꿈인가요?", answer: "전통적으로 돼지꿈, 용꿈, 조상꿈, 금은보화 꿈 등이 재물운과 관련된 길몽으로 알려져 있습니다." },
          { question: "꿈해몽 번호는 신뢰할 수 있나요?", answer: "꿈해몽은 한국의 전통 문화적 해석으로, 과학적 근거는 없습니다. 재미와 문화적 참고로 활용하시기 바랍니다." },
        ])) }}
      />

      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">카테고리별 꿈해몽</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {DREAM_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/lotto/dream/${cat.id}`}
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md hover:border-blue-300 transition-all"
            >
              <p className="text-2xl">{cat.emoji}</p>
              <p className="text-sm font-medium text-gray-900">{cat.name}</p>
              <p className="text-xs text-gray-500">{cat.keywords.length}개 꿈</p>
            </Link>
          ))}
        </div>
      </section>

      <RelatedFeatures currentPath="/lotto/dream" />
    </div>
  );
}
