"use client";

import { useState, useEffect } from "react";
import LottoBall from "@/components/lottery/LottoBall";
import { useToast } from "@/components/ui/Toast";
import { SITE_URL } from "@/lib/constants";
import { getKakaoSDK } from "@/lib/utils/kakao";
import { generateDreamNumbers } from "@/lib/lottery/dream";
import type { DreamCategory, DreamKeyword } from "@/types/lottery";

interface Props {
  category: DreamCategory;
}

export default function DreamCategoryClient({ category }: Props) {
  const [mounted, setMounted] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<DreamKeyword | null>(null);
  const [numbers, setNumbers] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeywordSelect = (keyword: DreamKeyword) => {
    setSelectedKeyword(keyword);
    setNumbers(generateDreamNumbers(keyword.id));
  };

  const handleRegenerate = () => {
    if (selectedKeyword) {
      setNumbers(generateDreamNumbers(selectedKeyword.id));
    }
  };

  const numbersText = numbers.join(", ");
  const shareTitle = selectedKeyword
    ? `🔮 꿈해몽 번호 (${selectedKeyword.emoji} ${selectedKeyword.name}꿈)`
    : "";
  const shareUrl = `${SITE_URL}/lotto/dream/${category.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareTitle}\n${numbersText}`);
    toast("번호가 클립보드에 복사되었습니다!");
  };

  const handleKakaoShare = () => {
    const Kakao = getKakaoSDK();
    if (!Kakao) {
      toast("카카오톡 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.", "error");
      return;
    }
    Kakao.Share.sendDefault({
      objectType: "text",
      text: `${shareTitle}\n\n${numbersText}\n\n${selectedKeyword?.interpretation}\n\n꿈해몽으로 로또 번호를 뽑아보세요!`,
      link: {
        mobileWebUrl: shareUrl,
        webUrl: shareUrl,
      },
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${category.name} 꿈해몽 번호 - 로또리`,
        text: `${shareTitle}\n${numbersText}`,
        url: shareUrl,
      });
    } else {
      handleCopy();
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            꿈 키워드를 선택하세요
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {category.keywords.map((kw) => (
              <div
                key={kw.id}
                className="p-4 rounded-xl border border-gray-200 bg-white opacity-50"
              >
                <span className="text-2xl block mb-1">{kw.emoji}</span>
                <span className="text-sm font-medium text-gray-900">{kw.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Keyword cards */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          꿈 키워드를 선택하세요
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {category.keywords.map((kw) => (
            <button
              key={kw.id}
              onClick={() => handleKeywordSelect(kw)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedKeyword?.id === kw.id
                  ? "border-purple-400 bg-purple-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"
              }`}
            >
              <span className="text-2xl block mb-1">{kw.emoji}</span>
              <span className="text-sm font-medium text-gray-900">{kw.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {selectedKeyword && numbers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">
              {selectedKeyword.emoji} {selectedKeyword.name}꿈 해몽 번호
            </p>
            <p className="text-sm text-purple-600 font-medium">
              {selectedKeyword.interpretation}
            </p>
          </div>

          <div className="flex justify-center gap-2 sm:gap-3 mb-6">
            {numbers.map((num, i) => (
              <LottoBall key={i} number={num} size="lg" className="max-sm:w-10 max-sm:h-10 max-sm:text-sm" />
            ))}
          </div>

          <button
            onClick={handleRegenerate}
            className="w-full bg-purple-600 text-white font-medium py-3 rounded-xl hover:bg-purple-700 transition-colors text-sm"
          >
            🔄 다른 번호 뽑기
          </button>
        </div>
      )}

      {/* Share buttons */}
      {numbers.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
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
            onClick={handleShare}
            className="flex-1 bg-blue-500 text-white font-medium py-3 rounded-xl hover:bg-blue-600 transition-colors text-sm"
          >
            📱 공유하기
          </button>
        </div>
      )}
    </div>
  );
}
