"use client";

import { useState, useEffect } from "react";
import LottoBall from "@/components/lottery/LottoBall";
import { useToast } from "@/components/ui/Toast";
import { SITE_URL, LOTTO_MAX_NUMBER, LOTTO_NUMBERS_PER_SET } from "@/lib/constants";
import { getKSTDate } from "@/lib/utils/kst";
import { getKakaoSDK } from "@/lib/utils/kakao";

// Mulberry32 deterministic PRNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getKSTDateSeed(): number {
  const kst = getKSTDate();
  const year = kst.getFullYear();
  const month = kst.getMonth() + 1;
  const day = kst.getDate();
  return year * 10000 + month * 100 + day;
}

function generateLuckyNumbers(seed: number): number[] {
  const rng = mulberry32(seed);
  const numbers: number[] = [];
  while (numbers.length < LOTTO_NUMBERS_PER_SET) {
    const n = Math.floor(rng() * LOTTO_MAX_NUMBER) + 1;
    if (!numbers.includes(n)) {
      numbers.push(n);
    }
  }
  return numbers.sort((a, b) => a - b);
}

function getTimeUntilMidnightKST(): { hours: number; minutes: number; seconds: number } {
  const kst = getKSTDate();
  const totalSeconds =
    (24 - kst.getHours() - 1) * 3600 +
    (60 - kst.getMinutes() - 1) * 60 +
    (60 - kst.getSeconds());
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function LuckyClient() {
  const [mounted, setMounted] = useState(false);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [dateLabel, setDateLabel] = useState("");
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const seed = getKSTDateSeed();
    setNumbers(generateLuckyNumbers(seed));

    const kst = getKSTDate();
    setDateLabel(
      `${kst.getFullYear()}년 ${kst.getMonth() + 1}월 ${kst.getDate()}일`
    );

    setCountdown(getTimeUntilMidnightKST());
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnightKST());

      // Check if date changed (midnight rollover)
      const newSeed = getKSTDateSeed();
      if (newSeed !== seed) {
        setNumbers(generateLuckyNumbers(newSeed));
        const newKst = getKSTDate();
        setDateLabel(
          `${newKst.getFullYear()}년 ${newKst.getMonth() + 1}월 ${newKst.getDate()}일`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const numbersText = numbers.join(", ");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`🍀 오늘의 행운 번호 (${dateLabel})\n${numbersText}`);
      toast("번호가 클립보드에 복사되었습니다!");
    } catch {
      toast("클립보드 복사에 실패했습니다.", "error");
    }
  };

  const handleKakaoShare = () => {
    const Kakao = getKakaoSDK();
    if (!Kakao) {
      toast("카카오톡 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.", "error");
      return;
    }
    Kakao.Share.sendDefault({
      objectType: "text",
      text: `🍀 오늘의 행운 번호 (${dateLabel})\n\n${numbersText}\n\n매일 바뀌는 행운의 번호를 확인하세요!`,
      link: {
        mobileWebUrl: `${SITE_URL}/lotto/lucky`,
        webUrl: `${SITE_URL}/lotto/lucky`,
      },
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "오늘의 행운 번호 - 로또리",
        text: `🍀 오늘의 행운 번호 (${dateLabel})\n${numbersText}`,
        url: `${SITE_URL}/lotto/lucky`,
      });
    } else {
      handleCopy();
    }
  };

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-2">오늘의 날짜</p>
          <p className="text-lg font-bold text-gray-900">--년 --월 --일</p>
        </div>
        <div className="flex justify-center gap-2 sm:gap-3 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-2">오늘의 날짜</p>
          <p className="text-lg font-bold text-gray-900">{dateLabel}</p>
        </div>

        <div className="flex justify-center gap-2 sm:gap-3 mb-8">
          {numbers.map((num, i) => (
            <LottoBall key={i} number={num} size="lg" className="max-sm:w-10 max-sm:h-10 max-sm:text-sm" />
          ))}
        </div>

        {/* Countdown to next day */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-2">다음 번호까지</p>
          <div className="flex justify-center gap-3 text-lg font-bold text-gray-700">
            <span>{String(countdown.hours).padStart(2, "0")}시간</span>
            <span>{String(countdown.minutes).padStart(2, "0")}분</span>
            <span>{String(countdown.seconds).padStart(2, "0")}초</span>
          </div>
        </div>
      </div>

      {/* Share buttons */}
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
    </div>
  );
}
