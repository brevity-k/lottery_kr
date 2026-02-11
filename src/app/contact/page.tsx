import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의하기",
  description: "로또리에 문의사항이 있으시면 연락주세요.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">문의하기</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <p className="text-gray-700 mb-6 leading-relaxed">
          로또리에 대한 문의사항, 제안, 오류 신고 등이 있으시면 아래 방법으로 연락주세요.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">📧</span>
            <div>
              <h3 className="font-semibold text-gray-900">이메일</h3>
              <p className="text-gray-600 text-sm">rottery0.kr@gmail.com</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">🐙</span>
            <div>
              <h3 className="font-semibold text-gray-900">GitHub</h3>
              <a
                href="https://github.com/brevity-k/rottery_kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:text-blue-700"
              >
                github.com/brevity-k/rottery_kr
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">
            문의 내용에 따라 답변까지 1~3일 정도 소요될 수 있습니다.
            서비스 개선을 위한 제안은 언제든지 환영합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
