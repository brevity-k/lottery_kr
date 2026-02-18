import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "로또리의 개인정보처리방침을 안내합니다.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "개인정보처리방침",
    description: "로또리의 개인정보처리방침을 안내합니다.",
    url: "/privacy",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Breadcrumb items={[{ label: "개인정보처리방침" }]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-sm">
        <p className="text-gray-700">
          로또리(이하 &quot;사이트&quot;)는 이용자의 개인정보를 중요시하며, 개인정보보호법 등 관련 법령을 준수하고 있습니다.
        </p>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. 수집하는 개인정보</h2>
          <p className="text-gray-700">
            본 사이트는 별도의 회원가입 없이 이용할 수 있으며, 개인정보를 직접 수집하지 않습니다.
            다만, 서비스 이용 과정에서 아래와 같은 정보가 자동으로 생성되어 수집될 수 있습니다.
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>접속 IP 주소, 서비스 이용 기록, 접속 로그</li>
            <li>쿠키(Cookie)를 통한 비식별 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. 쿠키(Cookie) 사용</h2>
          <p className="text-gray-700">
            본 사이트는 Google AdSense 및 Google Analytics를 사용하고 있으며,
            이들 서비스는 쿠키를 사용하여 이용자에게 맞춤형 광고를 제공하고 웹사이트 트래픽을 분석합니다.
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li><strong>Google AdSense:</strong> 이용자의 관심사에 기반한 광고를 표시하기 위해 쿠키를 사용합니다.</li>
            <li><strong>Google Analytics:</strong> 웹사이트 이용 통계를 수집하기 위해 쿠키를 사용합니다.</li>
            <li><strong>Vercel Analytics:</strong> 웹사이트 성능 분석을 위해 익명의 데이터를 수집합니다.</li>
          </ul>
          <p className="text-gray-700">
            이용자는 웹 브라우저의 설정을 통해 쿠키의 허용/거부를 선택할 수 있습니다.
            다만, 쿠키를 거부할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. 개인정보의 제3자 제공</h2>
          <p className="text-gray-700">
            본 사이트는 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만, 위에 명시된 Google 서비스의 쿠키 정책에 따라 비식별 정보가 수집될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. 개인정보의 보관 및 파기</h2>
          <p className="text-gray-700">
            본 사이트는 개인정보를 직접 보관하지 않으며,
            서버 로그는 보안 목적으로 일정 기간 보관 후 자동 삭제됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. 이용자의 권리</h2>
          <p className="text-gray-700">
            이용자는 언제든지 쿠키 설정을 변경하거나, 브라우저의 개인정보 보호 기능을 이용하여
            정보 수집을 거부할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">6. 개인정보처리방침의 변경</h2>
          <p className="text-gray-700">
            본 개인정보처리방침은 법령이나 서비스의 변경에 따라 수정될 수 있으며,
            변경 시 본 페이지를 통해 공지합니다.
          </p>
        </section>

        <p className="text-gray-500 text-xs mt-8">시행일: 2026년 2월 10일</p>
      </div>
    </div>
  );
}
