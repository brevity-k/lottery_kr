import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "로또리의 이용약관을 안내합니다.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-sm">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">제1조 (목적)</h2>
          <p className="text-gray-700">
            이 약관은 로또리(이하 &quot;사이트&quot;)가 제공하는 복권 번호 추천 및 당첨번호
            분석 서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">제2조 (서비스의 내용)</h2>
          <p className="text-gray-700">사이트는 다음과 같은 서비스를 제공합니다.</p>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>로또 6/45 당첨번호 조회</li>
            <li>통계 기반 번호 추천</li>
            <li>당첨번호 통계 분석</li>
            <li>복권 관련 정보 제공</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">제3조 (면책 조항)</h2>
          <ol className="list-decimal pl-5 text-gray-700 space-y-2">
            <li>
              본 사이트에서 제공하는 번호 추천은 통계적 분석을 기반으로 한 참고 자료이며,
              <strong> 당첨을 보장하지 않습니다.</strong>
            </li>
            <li>
              로또 추첨은 매 회차 독립적인 사건으로, 과거 통계가 미래 결과를 예측할 수 없습니다.
            </li>
            <li>
              본 사이트의 정보를 기반으로 한 복권 구매 결과에 대해 사이트는 어떠한 책임도 지지 않습니다.
            </li>
            <li>
              복권 구매는 전적으로 이용자 개인의 판단과 책임 하에 이루어져야 합니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">제4조 (서비스 이용)</h2>
          <ol className="list-decimal pl-5 text-gray-700 space-y-2">
            <li>서비스는 별도의 회원가입 없이 누구나 무료로 이용할 수 있습니다.</li>
            <li>사이트는 서비스의 안정적 제공을 위해 노력하나, 기술적 문제로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
            <li>사이트의 콘텐츠를 무단으로 복제, 배포하는 행위는 금지됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">제5조 (저작권)</h2>
          <p className="text-gray-700">
            본 사이트의 콘텐츠(텍스트, 디자인, 코드 등)에 대한 저작권은 로또리에 있습니다.
            당첨번호 데이터의 출처는 동행복권(dhlottery.co.kr)이며, 해당 데이터에 대한 권리는 동행복권에 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">제6조 (약관의 변경)</h2>
          <p className="text-gray-700">
            본 약관은 필요에 따라 변경될 수 있으며, 변경 시 본 페이지를 통해 공지합니다.
          </p>
        </section>

        <p className="text-gray-500 text-xs mt-8">시행일: 2026년 2월 10일</p>
      </div>
    </div>
  );
}
