import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "소개",
  description: "로또리는 한국 복권 번호 추천 및 당첨번호 분석 서비스입니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Breadcrumb items={[{ label: "소개" }]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-8">로또리 소개</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">서비스 소개</h2>
          <p className="text-gray-700 leading-relaxed">
            <strong>로또리(Rottery)</strong>는 한국 복권 번호 추천 및 당첨번호 분석 서비스입니다.
            동행복권 공식 데이터를 기반으로 역대 당첨번호 통계를 분석하고,
            다양한 알고리즘을 활용한 번호 추천 서비스를 제공합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">제공 서비스</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>번호 추천:</strong> 랜덤, 통계 기반, 핫넘버, 콜드넘버, 균형, AI 종합 추천 등 6가지 알고리즘</li>
            <li><strong>당첨번호 조회:</strong> 로또 6/45 1회부터 최신 회차까지 전체 당첨번호</li>
            <li><strong>통계 분석:</strong> 번호별 출현 빈도, 홀짝 비율, 고저 비율, 구간 분포 분석</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">면책 조항</h2>
          <p className="text-gray-700 leading-relaxed">
            본 사이트의 번호 추천은 통계적 분석을 기반으로 한 참고 자료이며, 당첨을 보장하지 않습니다.
            로또 추첨은 매 회차 독립적인 사건으로, 과거 통계가 미래 결과를 예측하지 않습니다.
            복권 구매는 개인의 판단과 책임 하에 이루어져야 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">데이터 출처</h2>
          <p className="text-gray-700 leading-relaxed">
            본 사이트의 당첨번호 데이터는 동행복권(dhlottery.co.kr) 공식 데이터를 기반으로 합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
