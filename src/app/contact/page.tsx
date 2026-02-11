import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "문의하기",
  description: "로또리에 문의사항이 있으시면 연락주세요.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">문의하기</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-6">
        <p className="text-gray-700 mb-6 leading-relaxed">
          로또리에 대한 문의사항, 제안, 오류 신고 등이 있으시면 아래 양식을
          이용해주세요. 확인 후 빠른 시일 내에 답변 드리겠습니다.
        </p>
        <ContactForm />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">다른 연락 방법</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg">📧</span>
            <div>
              <span className="text-sm text-gray-500">이메일</span>
              <p className="text-sm text-gray-700">rottery0.kr@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🐙</span>
            <div>
              <span className="text-sm text-gray-500">GitHub</span>
              <a
                href="https://github.com/brevity-k/lottery_kr"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-700"
              >
                github.com/brevity-k/lottery_kr
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
