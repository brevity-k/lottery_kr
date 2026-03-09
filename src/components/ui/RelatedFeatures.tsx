import Link from "next/link";

const allFeatures = [
  { href: "/lotto/recommend", icon: "🤖", label: "번호 추천", desc: "AI 통계 기반 번호 추천" },
  { href: "/lotto/results", icon: "🔍", label: "당첨번호 조회", desc: "전 회차 당첨번호 확인" },
  { href: "/lotto/stats", icon: "📊", label: "통계 분석", desc: "번호별 출현 빈도 분석" },
  { href: "/lotto/simulator", icon: "🎰", label: "시뮬레이터", desc: "당첨 확률 직접 체험" },
  { href: "/lotto/tax", icon: "💰", label: "세금 계산기", desc: "당첨금 실수령액 계산" },
  { href: "/lotto/lucky", icon: "🍀", label: "행운 번호", desc: "매일 바뀌는 행운의 번호" },
  { href: "/lotto/dream", icon: "🔮", label: "꿈해몽", desc: "꿈으로 번호 추천" },
  { href: "/lotto/my-numbers", icon: "📋", label: "내 번호", desc: "나만의 번호 분석" },
];

export default function RelatedFeatures({ currentPath }: { currentPath: string }) {
  const features = allFeatures.filter((f) => f.href !== currentPath).slice(0, 4);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-gray-900 mb-4">다른 서비스도 이용해보세요</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md hover:border-blue-300 transition-all"
          >
            <span className="text-2xl block mb-2">{f.icon}</span>
            <span className="font-semibold text-gray-900 text-sm block">{f.label}</span>
            <span className="text-xs text-gray-500">{f.desc}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
