"use client";

import { useState, useEffect } from "react";
import { getKSTDate } from "@/lib/utils/kst";

function getNextDrawInfo() {
  const kstNow = getKSTDate();

  // Find next Saturday 20:45 KST
  const target = new Date(kstNow);
  target.setHours(20, 45, 0, 0);

  const dayOfWeek = kstNow.getDay(); // 0=Sun, 6=Sat
  let daysUntilSat = (6 - dayOfWeek + 7) % 7;

  // If it's Saturday but past draw time, go to next Saturday
  if (daysUntilSat === 0 && kstNow >= target) {
    daysUntilSat = 7;
  }

  target.setDate(target.getDate() + daysUntilSat);

  const diffMs = target.getTime() - kstNow.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export default function DrawCountdown({ nextRound }: { nextRound: number }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(getNextDrawInfo());
    const interval = setInterval(() => {
      setTime(getNextDrawInfo());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-center text-white shadow-lg">
        <p className="text-sm opacity-80 mb-1">제 {nextRound}회 추첨까지</p>
        <div className="flex justify-center gap-4 text-2xl font-bold">
          <span>--일</span>
          <span>--시간</span>
          <span>--분</span>
          <span>--초</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-center text-white shadow-lg">
      <p className="text-sm opacity-80 mb-1">제 {nextRound}회 추첨까지</p>
      <div className="flex justify-center gap-3 sm:gap-5">
        <TimeUnit value={time.days} label="일" />
        <TimeUnit value={time.hours} label="시간" />
        <TimeUnit value={time.minutes} label="분" />
        <TimeUnit value={time.seconds} label="초" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl sm:text-4xl font-bold tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs opacity-70 mt-1">{label}</span>
    </div>
  );
}
