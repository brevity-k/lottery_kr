"use client";

import { useState } from "react";
import { LottoStats, RecommendMethod, RecommendedSet } from "@/types/lottery";
import { generateRecommendation } from "@/lib/lottery/recommend";
import RecommendResult from "@/components/lottery/RecommendResult";

const methods: { id: RecommendMethod; label: string; icon: string; desc: string }[] = [
  { id: "random", label: "랜덤 추천", icon: "🎲", desc: "순수 랜덤으로 번호 생성" },
  { id: "statistics", label: "통계 기반", icon: "📊", desc: "전체 출현 빈도 기반 가중치 추천" },
  { id: "hot", label: "핫넘버", icon: "🔥", desc: "최근 자주 나온 번호 위주" },
  { id: "cold", label: "콜드넘버", icon: "❄️", desc: "최근 적게 나온 번호 위주" },
  { id: "balanced", label: "균형 추천", icon: "⚖️", desc: "홀짝/구간 균형 맞춤" },
  { id: "ai", label: "AI 추천", icon: "🤖", desc: "전체 통계 종합 분석" },
];

interface RecommendClientProps {
  stats: LottoStats;
}

export default function RecommendClient({ stats }: RecommendClientProps) {
  const [selectedMethod, setSelectedMethod] = useState<RecommendMethod>("ai");
  const [results, setResults] = useState<RecommendedSet[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = () => {
    const sets = generateRecommendation(
      selectedMethod,
      stats.frequencies,
      stats.recentFrequencies,
      5
    );
    setResults(sets);
    setIsGenerated(true);
  };

  return (
    <div>
      {/* Method Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">추천 방식 선택</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => {
                setSelectedMethod(method.id);
                setIsGenerated(false);
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedMethod === method.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-2xl block mb-1">{method.icon}</span>
              <span className="font-semibold text-sm text-gray-900 block">{method.label}</span>
              <span className="text-xs text-gray-500">{method.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors text-lg shadow-lg shadow-blue-600/25 mb-8"
      >
        {isGenerated ? "🔄 다시 추천받기" : "🎯 번호 추천받기"}
      </button>

      {/* Results */}
      {isGenerated && results.length > 0 && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              추천 번호 ({methods.find((m) => m.id === selectedMethod)?.label})
            </h2>
            <p className="text-sm text-gray-500">5세트의 추천 번호입니다</p>
          </div>

          <RecommendResult sets={results} />

          {/* Stats Summary */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">홀짝 비율 (전체)</h3>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 bg-blue-500 rounded-full"
                  style={{
                    width: `${(stats.oddEvenRatio.odd / (stats.oddEvenRatio.odd + stats.oddEvenRatio.even)) * 100}%`,
                  }}
                />
                <div
                  className="h-3 bg-pink-500 rounded-full"
                  style={{
                    width: `${(stats.oddEvenRatio.even / (stats.oddEvenRatio.odd + stats.oddEvenRatio.even)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>홀수 {((stats.oddEvenRatio.odd / (stats.oddEvenRatio.odd + stats.oddEvenRatio.even)) * 100).toFixed(1)}%</span>
                <span>짝수 {((stats.oddEvenRatio.even / (stats.oddEvenRatio.odd + stats.oddEvenRatio.even)) * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">고저 비율 (전체)</h3>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 bg-red-500 rounded-full"
                  style={{
                    width: `${(stats.highLowRatio.high / (stats.highLowRatio.high + stats.highLowRatio.low)) * 100}%`,
                  }}
                />
                <div
                  className="h-3 bg-green-500 rounded-full"
                  style={{
                    width: `${(stats.highLowRatio.low / (stats.highLowRatio.high + stats.highLowRatio.low)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>고 (23~45) {((stats.highLowRatio.high / (stats.highLowRatio.high + stats.highLowRatio.low)) * 100).toFixed(1)}%</span>
                <span>저 (1~22) {((stats.highLowRatio.low / (stats.highLowRatio.high + stats.highLowRatio.low)) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
