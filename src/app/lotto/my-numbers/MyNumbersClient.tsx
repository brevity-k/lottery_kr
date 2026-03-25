"use client";

import { useState, useEffect } from "react";
import LottoBall from "@/components/lottery/LottoBall";
import { useToast } from "@/components/ui/Toast";
import { LOTTO_MAX_NUMBER, LOTTO_NUMBERS_PER_SET, SITE_URL } from "@/lib/constants";
import { getKakaoSDK } from "@/lib/utils/kakao";
import { formatKRW } from "@/lib/utils/format";
import type { LottoResult, MyNumbersData, NumberReport } from "@/types/lottery";
import {
  loadMyNumbers,
  addGame,
  deleteGame,
  matchGameAgainstDraw,
  backtestGame,
  generateReport,
} from "@/lib/lottery/my-numbers";

const TIER_LABELS: Record<number, string> = {
  1: "1등 (6개 일치)",
  2: "2등 (5개+보너스)",
  3: "3등 (5개 일치)",
  4: "4등 (4개 일치)",
  5: "5등 (3개 일치)",
};

interface MyNumbersClientProps {
  allResults: LottoResult[];
  latestRound: number;
  hotNumbers: number[];
  coldNumbers: number[];
}

export default function MyNumbersClient({
  allResults,
  latestRound,
  hotNumbers,
  coldNumbers,
}: MyNumbersClientProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectedRound, setSelectedRound] = useState(latestRound);
  const [myData, setMyData] = useState<MyNumbersData>({ version: 1, games: [] });
  const [backtestTarget, setBacktestTarget] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    setMyData(loadMyNumbers());
  }, []);

  const toggleNumber = (num: number) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(num)) return prev.filter((n) => n !== num);
      if (prev.length >= LOTTO_NUMBERS_PER_SET) return prev;
      return [...prev, num].sort((a, b) => a - b);
    });
  };

  const handleAutoSelect = () => {
    const pool: number[] = [];
    for (let i = 1; i <= LOTTO_MAX_NUMBER; i++) pool.push(i);
    for (let i = pool.length - 1; i > pool.length - (LOTTO_NUMBERS_PER_SET + 1); i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setSelectedNumbers(pool.slice(pool.length - LOTTO_NUMBERS_PER_SET).sort((a, b) => a - b));
  };

  const handleReset = () => {
    setSelectedNumbers([]);
  };

  const handleSave = () => {
    if (selectedNumbers.length !== LOTTO_NUMBERS_PER_SET) {
      toast("번호 6개를 선택해주세요.", "error");
      return;
    }
    const updated = addGame(selectedNumbers, selectedRound);
    setMyData(updated);
    setSelectedNumbers([]);
    toast("번호가 저장되었습니다!");
  };

  const handleDelete = (id: string) => {
    const updated = deleteGame(id);
    setMyData(updated);
    if (backtestTarget === id) setBacktestTarget(null);
    toast("삭제되었습니다.");
  };

  const handleDeleteAll = () => {
    if (!window.confirm("저장된 모든 번호를 삭제하시겠습니까?")) return;
    const empty: MyNumbersData = { version: 1, games: [] };
    localStorage.setItem("my-lotto-numbers", JSON.stringify(empty));
    setMyData(empty);
    setBacktestTarget(null);
    toast("모든 번호가 삭제되었습니다.");
  };

  // --- Backtest data ---
  const backtestData = (() => {
    if (!backtestTarget) return null;
    const game = myData.games.find((g) => g.id === backtestTarget);
    if (!game) return null;
    return backtestGame(game.numbers, allResults);
  })();

  // --- Report ---
  const report: NumberReport | null =
    myData.games.length >= 3 ? generateReport(myData.games, hotNumbers, coldNumbers) : null;

  // --- Share handlers ---
  const handleCopyReport = () => {
    if (!report) return;
    const top3 = report.patterns.topNumbers.slice(0, 3).join(", ");
    const text = `📊 내 로또 번호 분석 리포트\n핵심 번호: ${top3}\n홀짝 비율: 홀수 ${report.patterns.oddRatio}% / 짝수 ${report.patterns.evenRatio}%\n추천 번호: ${report.suggestions.join(", ")}\n\n${SITE_URL}/lotto/my-numbers`;
    navigator.clipboard.writeText(text);
    toast("리포트가 클립보드에 복사되었습니다!");
  };

  const handleKakaoShare = () => {
    if (!report) return;
    const Kakao = getKakaoSDK();
    if (!Kakao) {
      toast("카카오톡 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.", "error");
      return;
    }
    const top3 = report.patterns.topNumbers.slice(0, 3).join(", ");
    Kakao.Share.sendDefault({
      objectType: "text",
      text: `📊 내 로또 번호 분석 리포트\n핵심 번호: ${top3}\n홀짝 비율: 홀수 ${report.patterns.oddRatio}% / 짝수 ${report.patterns.evenRatio}%\n추천 번호: ${report.suggestions.join(", ")}`,
      link: {
        mobileWebUrl: `${SITE_URL}/lotto/my-numbers`,
        webUrl: `${SITE_URL}/lotto/my-numbers`,
      },
    });
  };

  const handleWebShare = async () => {
    if (!report) return;
    const top3 = report.patterns.topNumbers.slice(0, 3).join(", ");
    try {
      await navigator.share({
        title: "내 로또 번호 분석 리포트",
        text: `핵심 번호: ${top3} / 추천 번호: ${report.suggestions.join(", ")}`,
        url: `${SITE_URL}/lotto/my-numbers`,
      });
    } catch {
      // User cancelled or not supported
    }
  };

  // --- Round options ---
  const roundOptions: number[] = [];
  for (let r = latestRound; r >= Math.max(1, latestRound - 52); r--) {
    roundOptions.push(r);
  }

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── A. Number Input ── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">번호 선택</h2>
          <span className="text-sm text-gray-500">
            6개 중 <span className="font-bold text-blue-600">{selectedNumbers.length}개</span> 선택됨
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-1 sm:gap-1.5 mb-4">
          {Array.from({ length: LOTTO_MAX_NUMBER }, (_, i) => i + 1).map((num) => {
            const isSelected = selectedNumbers.includes(num);
            return (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                className={`flex items-center justify-center min-h-[44px] transition-all ${
                  isSelected
                    ? "scale-110"
                    : selectedNumbers.length >= 6
                      ? "opacity-30"
                      : "opacity-60 hover:opacity-100"
                }`}
              >
                <LottoBall number={num} size="sm" />
              </button>
            );
          })}
        </div>

        {selectedNumbers.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-xl">
            <span className="text-sm text-blue-600 font-medium">선택:</span>
            <div className="flex gap-1.5">
              {selectedNumbers.map((num) => (
                <LottoBall key={num} number={num} size="sm" />
              ))}
            </div>
          </div>
        )}

        {/* Round selector */}
        <div className="flex items-center gap-3 mb-4">
          <label htmlFor="round-select" className="text-sm text-gray-700 font-medium whitespace-nowrap">
            적용 회차
          </label>
          <select
            id="round-select"
            value={selectedRound}
            onChange={(e) => setSelectedRound(Number(e.target.value))}
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {roundOptions.map((r) => (
              <option key={r} value={r}>
                제{r}회
              </option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAutoSelect}
            className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            자동 선택
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={selectedNumbers.length !== LOTTO_NUMBERS_PER_SET}
          className="w-full mt-3 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          번호 저장
        </button>
      </section>

      {/* ── B. Game History ── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          저장된 번호 ({myData.games.length}개)
        </h2>

        {myData.games.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">아직 저장된 번호가 없습니다</p>
            <p className="text-sm">위에서 번호를 선택하고 저장해보세요!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {myData.games.map((game) => {
                const match = matchGameAgainstDraw(game, allResults);
                return (
                  <div
                    key={game.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-900">
                        제{game.round}회
                      </span>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-sm p-1"
                        aria-label="삭제"
                      >
                        삭제
                      </button>
                    </div>

                    {/* Numbers */}
                    <div className="flex gap-1.5 mb-3">
                      {game.numbers.map((num) => (
                        <LottoBall key={num} number={num} size="sm" />
                      ))}
                    </div>

                    {/* Match result */}
                    <div className="flex items-center justify-between">
                      {match ? (
                        <span
                          className={`text-sm font-medium ${
                            match.tier !== null && match.tier <= 3
                              ? "text-amber-600"
                              : match.matchCount >= 3
                                ? "text-green-600"
                                : "text-gray-500"
                          }`}
                        >
                          {match.matchCount}/6 일치
                          {match.bonusMatch && " +보너스"}
                          {match.tier !== null && ` (${TIER_LABELS[match.tier]})`}
                          {match.prize > 0 && ` - ${formatKRW(match.prize)}`}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">추첨 대기</span>
                      )}

                      <button
                        onClick={() =>
                          setBacktestTarget(
                            backtestTarget === game.id ? null : game.id
                          )
                        }
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {backtestTarget === game.id ? "닫기" : "역대 분석"}
                      </button>
                    </div>

                    {/* Inline backtest */}
                    {backtestTarget === game.id && backtestData && (
                      <BacktestSection data={backtestData} />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleDeleteAll}
              className="w-full mt-4 text-sm text-red-500 hover:text-red-600 font-medium py-2"
            >
              전체 삭제
            </button>
          </>
        )}
      </section>

      {/* ── C. My Number Report ── */}
      {report && (
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">내 번호 리포트</h2>

          {/* Odd/Even ratio bar */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 font-medium mb-2">홀짝 비율</p>
            <div className="flex h-6 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${report.patterns.oddRatio}%` }}
              >
                {report.patterns.oddRatio > 15 && `홀 ${report.patterns.oddRatio}%`}
              </div>
              <div
                className="bg-pink-400 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${report.patterns.evenRatio}%` }}
              >
                {report.patterns.evenRatio > 15 && `짝 ${report.patterns.evenRatio}%`}
              </div>
            </div>
          </div>

          {/* Section coverage bars */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 font-medium mb-2">구간별 선택 빈도</p>
            <div className="space-y-2">
              {report.patterns.sectionCoverage.map((sec) => (
                <div key={sec.section} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-12 text-right">{sec.section}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-400 h-full rounded-full transition-all"
                      style={{ width: `${sec.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">{sec.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top numbers */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 font-medium mb-2">자주 선택하는 번호</p>
            <div className="flex gap-1.5">
              {report.patterns.topNumbers.map((num) => (
                <LottoBall key={num} number={num} size="sm" />
              ))}
            </div>
          </div>

          {/* Story */}
          <blockquote className="border-l-4 border-blue-400 bg-blue-50 rounded-r-xl p-4 mb-4 text-sm text-gray-700 leading-relaxed">
            {report.story}
          </blockquote>

          {/* Suggestions */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-green-800 font-semibold mb-2">맞춤 추천 번호</p>
            <div className="flex gap-1.5 mb-2">
              {report.suggestions.map((num) => (
                <LottoBall key={num} number={num} size="sm" />
              ))}
            </div>
            <p className="text-xs text-green-700">{report.suggestionReason}</p>
          </div>

          {/* Share buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCopyReport}
              className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              복사하기
            </button>
            <button
              onClick={handleKakaoShare}
              className="flex-1 bg-[#FEE500] text-[#191919] font-medium py-3 rounded-xl hover:brightness-95 transition-all text-sm"
            >
              카카오톡 공유
            </button>
            <button
              onClick={handleWebShare}
              className="flex-1 bg-blue-500 text-white font-medium py-3 rounded-xl hover:bg-blue-600 transition-colors text-sm"
            >
              공유하기
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            * 3개 이상의 번호를 저장하면 리포트가 생성됩니다. 번호를 더 저장할수록 분석이 정확해집니다.
          </p>
        </section>
      )}

      {/* ── Info Section ── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">이용 안내</h2>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">이용 방법</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>1~45 중 6개의 번호를 선택하거나 &quot;자동 선택&quot;을 클릭하세요.</li>
              <li>적용할 회차를 선택하고 &quot;번호 저장&quot;을 클릭하세요.</li>
              <li>저장된 번호는 자동으로 당첨 결과와 비교됩니다.</li>
              <li>3개 이상 저장하면 나만의 패턴 리포트가 생성됩니다.</li>
            </ol>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-yellow-800">
            저장된 번호는 브라우저의 로컬 스토리지에 보관됩니다. 브라우저 데이터를 삭제하면 함께 삭제됩니다.
            본 서비스는 참고용이며, 실제 복권 당첨을 보장하지 않습니다.
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Backtest Sub-component ---

function BacktestSection({
  data,
}: {
  data: { results: import("@/types/lottery").BacktestResult[]; totalPrize: number; bestTier: number | null };
}) {
  const top10 = data.results.slice(0, 10);

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <h4 className="text-sm font-semibold text-gray-900 mb-2">역대 분석 결과</h4>

      {/* Summary */}
      <div className="flex gap-4 mb-3">
        <div className="text-xs text-gray-600">
          총 추정 당첨금: <span className="font-bold text-gray-900">{formatKRW(data.totalPrize)}</span>
        </div>
        {data.bestTier !== null && (
          <div className="text-xs text-gray-600">
            최고 등수: <span className="font-bold text-amber-600">{data.bestTier}등</span>
          </div>
        )}
      </div>

      {top10.length === 0 ? (
        <p className="text-xs text-gray-400">3개 이상 일치한 회차가 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-2 py-1.5 border border-gray-200 font-semibold">회차</th>
                <th className="text-center px-2 py-1.5 border border-gray-200 font-semibold">일치</th>
                <th className="text-center px-2 py-1.5 border border-gray-200 font-semibold">등수</th>
                <th className="text-right px-2 py-1.5 border border-gray-200 font-semibold">추정 당첨금</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((r) => (
                <tr key={r.round}>
                  <td className="px-2 py-1.5 border border-gray-200">
                    {r.round}회 ({r.date})
                  </td>
                  <td className="text-center px-2 py-1.5 border border-gray-200">
                    <span
                      className={`font-bold ${
                        r.matchCount >= 5
                          ? "text-amber-600"
                          : r.matchCount >= 3
                            ? "text-green-600"
                            : "text-gray-600"
                      }`}
                    >
                      {r.matchCount}개{r.bonusMatch ? " +B" : ""}
                    </span>
                  </td>
                  <td className="text-center px-2 py-1.5 border border-gray-200">
                    {r.tier !== null ? (
                      <span className="font-bold text-amber-600">{TIER_LABELS[r.tier]}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-right px-2 py-1.5 border border-gray-200">
                    {r.prize > 0 ? formatKRW(r.prize) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.results.length > 10 && (
        <p className="text-xs text-gray-400 mt-2">
          3개 이상 일치: 총 {data.results.length}회 (상위 10개 표시)
        </p>
      )}
    </div>
  );
}
