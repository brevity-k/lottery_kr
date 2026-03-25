"use client";

import { useState } from "react";
import LottoBall from "@/components/lottery/LottoBall";
import { useToast } from "@/components/ui/Toast";
import { SITE_URL } from "@/lib/constants";
import { getKakaoSDK } from "@/lib/utils/kakao";
import { DREAM_CATEGORIES, generateDreamNumbers } from "@/lib/lottery/dream";
import type { DreamCategory, DreamKeyword } from "@/types/lottery";

export default function DreamClient() {
  const [selectedCategory, setSelectedCategory] = useState<DreamCategory | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<DreamKeyword | null>(null);
  const [numbers, setNumbers] = useState<number[]>([]);
  const { toast } = useToast();

  const handleCategorySelect = (category: DreamCategory) => {
    setSelectedCategory(category);
    setSelectedKeyword(null);
    setNumbers([]);
  };

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
        mobileWebUrl: `${SITE_URL}/lotto/dream`,
        webUrl: `${SITE_URL}/lotto/dream`,
      },
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "꿈해몽 번호 생성기 - 로또리",
        text: `${shareTitle}\n${numbersText}`,
        url: `${SITE_URL}/lotto/dream`,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-6">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {DREAM_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory?.id === cat.id
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Keyword cards */}
      {selectedCategory && (
        <div>
          <p className="text-sm text-gray-500 mb-3">{selectedCategory.description}</p>
          <div className="grid grid-cols-2 gap-3">
            {selectedCategory.keywords.map((kw) => (
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
      )}

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
