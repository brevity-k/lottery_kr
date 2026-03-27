import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDreamCategory, getAllDreamCategoryIds } from "@/lib/lottery/dream";
import AdBanner from "@/components/ads/AdBanner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import RelatedFeatures from "@/components/ui/RelatedFeatures";
import { SITE_NAME } from "@/lib/constants";
import DreamCategoryClient from "./DreamCategoryClient";
import { buildFaqJsonLd } from "@/lib/utils/jsonld";

interface Props {
  params: Promise<{ category: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDreamCategoryIds().map((id) => ({ category: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categoryId } = await params;
  const category = getDreamCategory(categoryId);
  if (!category) return {};

  const keywordNames = category.keywords.map((k) => k.name).slice(0, 4).join(", ");
  const title = `${category.name} 꿈 로또 번호 - 꿈해몽 번호 추천`;
  const description = `${keywordNames} 등 ${category.name} 관련 꿈해몽으로 로또 번호를 추천받으세요. ${category.keywords.length}가지 ${category.name} 꿈풀이 기반 행운의 번호를 확인하세요!`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/dream/${categoryId}` },
    openGraph: {
      title,
      description,
      url: `/lotto/dream/${categoryId}`,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default async function DreamCategoryPage({ params }: Props) {
  const { category: categoryId } = await params;
  const category = getDreamCategory(categoryId);

  if (!category) {
    notFound();
  }

  const faqItems = [
    {
      question: `${category.name} 꿈을 꾸면 로또 번호는 어떻게 정하나요?`,
      answer: `${category.name} 꿈은 전통 꿈해몽에서 각각 고유한 의미를 가지고 있습니다. ${category.keywords[0].name}꿈은 ${category.keywords[0].interpretation} 각 꿈 키워드에 연관된 번호 풀에서 6개를 랜덤으로 선택하여 추천합니다.`,
    },
    {
      question: `${category.name} 꿈 중에서 가장 좋은 꿈은 무엇인가요?`,
      answer: `${category.name} 관련 꿈은 모두 고유한 의미가 있습니다. ${category.keywords.slice(0, 3).map((k) => `${k.name}꿈은 ${k.interpretation.split(".")[0]}`).join(", ")} 등 다양한 해석이 있으니 꾸신 꿈에 맞는 키워드를 선택해보세요.`,
    },
    {
      question: `${category.name} 꿈해몽 번호는 매번 같은 번호가 나오나요?`,
      answer: `아닙니다. 같은 꿈 키워드를 선택해도 매번 다른 조합이 생성됩니다. 각 키워드에 연관된 9개의 번호 풀에서 6개를 랜덤으로 선택하므로, 마음에 드는 번호가 나올 때까지 여러 번 시도해 보세요.`,
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Breadcrumb items={[
        { label: "로또 6/45", href: "/lotto" },
        { label: "꿈해몽", href: "/lotto/dream" },
        { label: `${category.name} 꿈` },
      ]} />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {category.emoji} {category.name} 꿈 로또 번호
      </h1>
      <p className="text-gray-600 mb-8">
        {category.description}을 선택하면 전통 꿈해몽을 기반으로 행운의 로또 번호를 추천해 드립니다.
      </p>

      <AdBanner slot="dream-category-top" format="horizontal" className="mb-6" />

      {/* Keyword list with descriptions */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {category.name} 꿈 종류 ({category.keywords.length}가지)
        </h2>
        <div className="space-y-4">
          {category.keywords.map((kw) => (
            <div key={kw.id} className="flex gap-3">
              <span className="text-2xl shrink-0">{kw.emoji}</span>
              <div>
                <p className="font-medium text-gray-900">{kw.name}꿈</p>
                <p className="text-sm text-gray-600">{kw.interpretation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Number generation client component */}
      <DreamCategoryClient category={category} />

      <AdBanner slot="dream-category-bottom" format="horizontal" className="mt-6" />

      {/* FAQ section */}
      <section className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index}>
              <h3 className="font-medium text-gray-900 mb-1">Q. {item.question}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Link back to main dream page */}
      <div className="mt-6">
        <Link
          href="/lotto/dream"
          className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
        >
          &larr; 전체 꿈해몽 번호 생성기로 돌아가기
        </Link>
      </div>

      <RelatedFeatures currentPath="/lotto/dream" />
    </div>
  );
}
