"use client";

import { RecommendedSet } from "@/types/lottery";
import LottoBall from "./LottoBall";

declare global {
  interface Window {
    Kakao?: {
      init(appKey: string): void;
      isInitialized(): boolean;
      Share: {
        sendDefault(settings: {
          objectType: string;
          text: string;
          link: { mobileWebUrl: string; webUrl: string };
        }): void;
      };
    };
  }
}

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

  const handleKakaoShare = () => {
    const Kakao = window.Kakao;
    if (!Kakao) {
      alert("카카오톡 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!Kakao.isInitialized()) {
      Kakao.init("accfcea8c90806c685d4321fa93a4501");
    }
    const text = sets
      .map((s) => `${s.label}: ${s.numbers.join(", ")}`)
      .join("\n");
    Kakao.Share.sendDefault({
      objectType: "text",
      text: `🎯 로또리 번호 추천\n\n${text}`,
      link: {
        mobileWebUrl: "https://lottery.io.kr/lotto/recommend",
        webUrl: "https://lottery.io.kr/lotto/recommend",
      },
    });
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
          onClick={handleKakaoShare}
          className="flex-1 bg-[#FEE500] text-[#191919] font-medium py-3 rounded-xl hover:brightness-95 transition-all text-sm"
        >
          💬 카카오톡 공유
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
          className="flex-1 bg-blue-500 text-white font-medium py-3 rounded-xl hover:bg-blue-600 transition-colors text-sm"
        >
          📱 공유하기
        </button>
      </div>
    </div>
  );
}
