"use client";

import { RecommendedSet } from "@/types/lottery";
import LottoBall from "./LottoBall";

interface RecommendResultProps {
  sets: RecommendedSet[];
}

export default function RecommendResult({ sets }: RecommendResultProps) {
  const handleCopy = () => {
    const text = sets
      .map((s) => `${s.label}: ${s.numbers.join(", ")}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    alert("번호가 클립보드에 복사되었습니다!");
  };

  return (
    <div className="space-y-4">
      {sets.map((set, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full min-w-[50px] text-center">
            {set.label}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {set.numbers.map((num, i) => (
              <LottoBall key={i} number={num} size="md" />
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleCopy}
          className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm"
        >
          📋 복사하기
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "로또리 번호 추천",
                text: sets.map((s) => `${s.label}: ${s.numbers.join(", ")}`).join("\n"),
                url: window.location.href,
              });
            } else {
              handleCopy();
            }
          }}
          className="flex-1 bg-yellow-400 text-gray-900 font-medium py-3 rounded-xl hover:bg-yellow-500 transition-colors text-sm"
        >
          📱 공유하기
        </button>
      </div>
    </div>
  );
}
