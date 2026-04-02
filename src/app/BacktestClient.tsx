"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import LottoBall from "@/components/lottery/LottoBall";
import { useToast } from "@/components/ui/Toast";
import { getKakaoSDK } from "@/lib/utils/kakao";
import { formatKRW } from "@/lib/utils/format";
import { getBallBorderColor } from "@/lib/utils/format";
import { runBacktest, type BacktestSummary } from "@/lib/lottery/backtest";
import { LOTTO_MIN_NUMBER, LOTTO_MAX_NUMBER, LOTTO_NUMBERS_PER_SET, SITE_URL } from "@/lib/constants";
import type { LottoResult } from "@/types/lottery";

type Phase = "idle" | "analyzing" | "reveal-total" | "reveal-tiers" | "reveal-best" | "reveal-profit" | "done";

const PHASES: Phase[] = ["idle", "analyzing", "reveal-total", "reveal-tiers", "reveal-best", "reveal-profit", "done"];

const TIER_LABELS: Record<number, string> = {
  1: "1등 (6개 일치)",
  2: "2등 (5개+보너스)",
  3: "3등 (5개 일치)",
  4: "4등 (4개 일치)",
  5: "5등 (3개 일치)",
};

interface Props {
  allResults: LottoResult[];
}

export default function BacktestClient({ allResults }: Props) {
  const [mounted, setMounted] = useState(false);
  const [numbers, setNumbers] = useState<string[]>(["", "", "", "", "", ""]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [summary, setSummary] = useState<BacktestSummary | null>(null);
  const [tierAnimated, setTierAnimated] = useState<Record<number, number>>({});
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const autoRanRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read URL params on mount
  useEffect(() => {
    if (!mounted || autoRanRef.current) return;
    const nParam = searchParams.get("n");
    if (!nParam) return;

    const parsed = nParam.split(",").map((s) => s.trim()).filter(Boolean).map(Number);
    if (parsed.length === LOTTO_NUMBERS_PER_SET && parsed.every((n) => n >= LOTTO_MIN_NUMBER && n <= LOTTO_MAX_NUMBER && !isNaN(n))) {
      const unique = new Set(parsed);
      if (unique.size === LOTTO_NUMBERS_PER_SET) {
        setNumbers(parsed.map(String));
        autoRanRef.current = true;
        // Auto-run after a brief delay for UI to settle
        setTimeout(() => {
          runAnalysis(parsed);
        }, 300);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, searchParams]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, []);

  const phaseIndex = PHASES.indexOf(phase);

  const clearTimers = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  };

  const addTimer = (fn: () => void, ms: number) => {
    timerRef.current.push(setTimeout(fn, ms));
  };

  const handleInputChange = (index: number, value: string) => {
    // Allow empty or numeric only
    if (value !== "" && !/^\d{1,2}$/.test(value)) return;
    const num = value === "" ? "" : value;
    setNumbers((prev) => {
      const next = [...prev];
      next[index] = num;
      return next;
    });
    // Auto-advance to next input when 2 digits entered
    if (value.length === 2 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && numbers[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const fillRandom = () => {
    const pool: number[] = [];
    for (let i = LOTTO_MIN_NUMBER; i <= LOTTO_MAX_NUMBER; i++) pool.push(i);
    for (let i = pool.length - 1; i > pool.length - (LOTTO_NUMBERS_PER_SET + 1); i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const selected = pool.slice(pool.length - LOTTO_NUMBERS_PER_SET).sort((a, b) => a - b);
    setNumbers(selected.map(String));
    // Reset state if previously run
    if (phase !== "idle") {
      resetState();
    }
  };

  const resetState = () => {
    clearTimers();
    setPhase("idle");
    setSummary(null);
    setTierAnimated({});
    setDetailOpen(false);
  };

  const validate = (): number[] | null => {
    const parsed = numbers.map(Number);
    if (numbers.some((n) => n === "")) {
      toast("6개의 번호를 모두 입력해주세요.", "error");
      return null;
    }
    if (parsed.some((n) => isNaN(n) || n < LOTTO_MIN_NUMBER || n > LOTTO_MAX_NUMBER)) {
      toast(`1~${LOTTO_MAX_NUMBER} 사이의 번호를 입력해주세요.`, "error");
      return null;
    }
    if (new Set(parsed).size !== LOTTO_NUMBERS_PER_SET) {
      toast("중복된 번호가 있습니다.", "error");
      return null;
    }
    return parsed;
  };

  const runAnalysis = useCallback((nums: number[]) => {
    clearTimers();
    setPhase("analyzing");
    setSummary(null);
    setTierAnimated({});
    setDetailOpen(false);

    const result = runBacktest(nums, allResults);

    addTimer(() => {
      setSummary(result);
      setPhase("reveal-total");

      addTimer(() => {
        setPhase("reveal-tiers");
        // Animate tier counts
        animateTierCounts(result.tierCounts);

        addTimer(() => {
          setPhase("reveal-best");

          addTimer(() => {
            setPhase("reveal-profit");

            addTimer(() => {
              setPhase("done");
            }, 1000);
          }, 1500);
        }, 1500);
      }, 1000);
    }, 1500);
  }, [allResults]);

  const animateTierCounts = (targets: Record<number, number>) => {
    const current: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const steps = 20;
    const intervalMs = 1200 / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      for (const tier of [1, 2, 3, 4, 5]) {
        current[tier] = Math.round(targets[tier] * progress);
      }
      setTierAnimated({ ...current });
      if (step >= steps) {
        clearInterval(interval);
        setTierAnimated({ ...targets });
      }
    }, intervalMs);

    // Store interval for cleanup
    timerRef.current.push(interval as unknown as ReturnType<typeof setTimeout>);
  };

  const handleSubmit = () => {
    const parsed = validate();
    if (!parsed) return;
    runAnalysis(parsed);
  };

  const handleReset = () => {
    setNumbers(["", "", "", "", "", ""]);
    resetState();
    inputRefs.current[0]?.focus();
  };

  // Share helpers
  const getShareUrl = () => {
    const sorted = numbers.map(Number).sort((a, b) => a - b);
    return `${SITE_URL}/?n=${sorted.join(",")}`;
  };

  const handleCopyLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      toast("링크가 복사되었습니다!");
    }).catch(() => {
      toast("복사에 실패했습니다.", "error");
    });
  };

  const handleKakaoShare = () => {
    if (!summary) return;
    const Kakao = getKakaoSDK();
    if (!Kakao) {
      toast("카카오톡 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.", "error");
      return;
    }
    const sorted = numbers.map(Number).sort((a, b) => a - b);
    const shareUrl = getShareUrl();
    Kakao.Share.sendDefault({
      objectType: "text",
      text: `내 로또 번호 [${sorted.join(", ")}] 역대 ${summary.totalDraws}회 검사 결과: ${summary.matchThreeOrMore}회 일치! 나도 검사해보기 →`,
      link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
    });
  };

  const handleWebShare = () => {
    if (!summary) return;
    const sorted = numbers.map(Number).sort((a, b) => a - b);
    if (navigator.share) {
      navigator.share({
        title: "내 번호 역대 당첨 검사 - 로또리",
        text: `내 번호 [${sorted.join(", ")}] 역대 ${summary.totalDraws}회 검사 결과: ${summary.matchThreeOrMore}회 일치!`,
        url: getShareUrl(),
      });
    } else {
      handleCopyLink();
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {numbers.map((num, i) => {
            const n = Number(num);
            const borderColor = num && n >= LOTTO_MIN_NUMBER && n <= LOTTO_MAX_NUMBER ? getBallBorderColor(n) : "#d1d5db";
            return (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={num}
                onChange={(e) => handleInputChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                placeholder={String(i + 1)}
                className="w-12 h-12 rounded-full text-center text-lg font-bold border-2 outline-none transition-colors focus:ring-2 focus:ring-yellow-300"
                style={{ borderColor }}
                disabled={phase !== "idle" && phase !== "done"}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 mt-4">
          {phase === "idle" || phase === "done" ? (
            <>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full transition-colors shadow-sm"
              >
                검사하기
              </button>
              <button
                onClick={fillRandom}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors"
              >
                랜덤
              </button>
              {phase === "done" && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors"
                >
                  초기화
                </button>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-400">분석 중...</div>
          )}
        </div>
      </div>

      {/* Analyzing Spinner */}
      {phase === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 font-medium">
            역대 {allResults.length.toLocaleString()}회차 검사 중...
          </p>
        </div>
      )}

      {/* Reveal: Total Matches */}
      {summary && phaseIndex >= PHASES.indexOf("reveal-total") && (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center transition-all duration-500 ${
          phaseIndex === PHASES.indexOf("reveal-total") && phase === "reveal-total"
            ? "animate-fade-in-up"
            : ""
        }`}>
          <p className="text-gray-500 text-sm mb-1">역대 {summary.totalDraws.toLocaleString()}회 중</p>
          <p className="text-4xl font-black text-yellow-600">
            {summary.matchThreeOrMore > 0
              ? `${summary.matchThreeOrMore.toLocaleString()}회 일치!`
              : "일치 없음"}
          </p>
          <p className="text-gray-400 text-xs mt-2">3개 이상 번호가 일치한 횟수</p>
        </div>
      )}

      {/* Reveal: Tier Breakdown */}
      {summary && phaseIndex >= PHASES.indexOf("reveal-tiers") && (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${
          phase === "reveal-tiers" ? "animate-fade-in-up" : ""
        }`}>
          <h3 className="text-center font-bold text-gray-800 mb-4">등수별 당첨 현황</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((tier) => {
              const count = tierAnimated[tier] ?? 0;
              const target = summary.tierCounts[tier] ?? 0;
              const maxCount = Math.max(...Object.values(summary.tierCounts), 1);
              const barWidth = target > 0 ? Math.max((count / maxCount) * 100, 4) : 0;
              const tierColors: Record<number, string> = {
                1: "bg-red-500",
                2: "bg-orange-400",
                3: "bg-yellow-400",
                4: "bg-blue-400",
                5: "bg-gray-400",
              };
              return (
                <div key={tier} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-32 shrink-0">
                    {TIER_LABELS[tier]}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    {barWidth > 0 && (
                      <div
                        className={`${tierColors[tier]} h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2`}
                        style={{ width: `${barWidth}%` }}
                      >
                        <span className="text-xs font-bold text-white">{count}</span>
                      </div>
                    )}
                  </div>
                  {barWidth === 0 && (
                    <span className="text-xs text-gray-400">0회</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reveal: Best Match */}
      {summary && summary.bestMatch && phaseIndex >= PHASES.indexOf("reveal-best") && (
        <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-sm border border-yellow-200 p-6 text-center transition-all duration-500 ${
          phase === "reveal-best" ? "animate-fade-in-up" : ""
        }`}>
          <p className="text-sm text-yellow-700 font-medium mb-2">가장 근접한 당첨</p>
          <p className="text-2xl font-black text-yellow-700 mb-1">
            {summary.bestMatch.matchCount}개 일치
            {summary.bestMatch.bonusMatch && " + 보너스"}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            제{summary.bestMatch.round}회 ({summary.bestMatch.date})
            {summary.bestMatch.tier && ` — ${TIER_LABELS[summary.bestMatch.tier]}`}
          </p>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {summary.bestMatch.matchedNumbers.map((n) => (
              <LottoBall key={n} number={n} size="md" />
            ))}
          </div>
          {summary.bestMatch.prize > 0 && (
            <p className="mt-3 text-sm font-bold text-yellow-800">
              당첨금: {formatKRW(summary.bestMatch.prize)}
            </p>
          )}
        </div>
      )}

      {/* Reveal: Best Match (no matches at all) */}
      {summary && !summary.bestMatch && phaseIndex >= PHASES.indexOf("reveal-best") && (
        <div className={`bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6 text-center transition-all duration-500 ${
          phase === "reveal-best" ? "animate-fade-in-up" : ""
        }`}>
          <p className="text-gray-500 text-lg font-medium">
            역대 기록에서 3개 이상 일치한 회차가 없습니다.
          </p>
          <p className="text-sm text-gray-400 mt-1">다른 번호로 다시 시도해보세요!</p>
        </div>
      )}

      {/* Reveal: Profit Summary */}
      {summary && phaseIndex >= PHASES.indexOf("reveal-profit") && (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${
          phase === "reveal-profit" ? "animate-fade-in-up" : ""
        }`}>
          <h3 className="text-center font-bold text-gray-800 mb-4">손익 요약</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">총 투자</p>
              <p className="text-sm font-bold text-gray-700">{formatKRW(summary.totalCost)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">총 당첨금</p>
              <p className="text-sm font-bold text-green-600">{formatKRW(summary.totalPrize)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">순이익</p>
              <p className={`text-sm font-bold ${summary.netProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
                {summary.netProfit >= 0 ? "+" : ""}{formatKRW(Math.abs(summary.netProfit))}
              </p>
            </div>
          </div>
          {summary.netProfit < 0 && (
            <p className="text-center text-xs text-gray-400 mt-3">
              * 매주 1장씩 {summary.totalDraws.toLocaleString()}회 구매 시 기준 (5등 고정 당첨금 기준)
            </p>
          )}
        </div>
      )}

      {/* Done: Share Buttons */}
      {phase === "done" && summary && (
        <div className="flex items-center justify-center gap-2 flex-wrap animate-fade-in">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors"
          >
            링크 복사
          </button>
          <button
            onClick={handleKakaoShare}
            className="px-4 py-2 bg-[#FEE500] hover:bg-[#FDD835] text-gray-900 text-sm font-medium rounded-full transition-colors"
          >
            카카오톡
          </button>
          <button
            onClick={handleWebShare}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors"
          >
            공유하기
          </button>
        </div>
      )}

      {/* Done: Detail Table */}
      {phase === "done" && summary && summary.results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setDetailOpen(!detailOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>상세 결과 ({summary.results.length}건)</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${detailOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {detailOpen && (
            <div className="border-t border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-500 font-medium">회차</th>
                    <th className="px-4 py-2 text-left text-gray-500 font-medium">추첨일</th>
                    <th className="px-4 py-2 text-center text-gray-500 font-medium">일치</th>
                    <th className="px-4 py-2 text-center text-gray-500 font-medium">등수</th>
                    <th className="px-4 py-2 text-right text-gray-500 font-medium">당첨금</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summary.results.map((r) => (
                    <tr key={r.round} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-800">제{r.round}회</td>
                      <td className="px-4 py-2.5 text-gray-500">{r.date}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex items-center gap-1">
                          <span className="font-bold text-yellow-600">{r.matchCount}개</span>
                          {r.bonusMatch && <span className="text-xs text-purple-500">+B</span>}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {r.tier ? (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            r.tier === 1 ? "bg-red-100 text-red-700" :
                            r.tier === 2 ? "bg-orange-100 text-orange-700" :
                            r.tier === 3 ? "bg-yellow-100 text-yellow-700" :
                            r.tier === 4 ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {r.tier}등
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600">
                        {r.prize > 0 ? formatKRW(r.prize) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inline CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
