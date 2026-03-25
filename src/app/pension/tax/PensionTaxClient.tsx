"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { SITE_URL } from "@/lib/constants";
import { getKakaoSDK } from "@/lib/utils/kakao";
import { formatKRW } from "@/lib/utils/format";

interface PensionPrize {
  label: string;
  monthlyAmount: number;
  months: number;
  isMonthly: boolean;
}

const prizes: PensionPrize[] = [
  { label: "1등 (월 700만원 x 20년)", monthlyAmount: 7_000_000, months: 240, isMonthly: true },
  { label: "2등 (월 100만원 x 10년)", monthlyAmount: 1_000_000, months: 120, isMonthly: true },
  { label: "3등 (100만원 일시금)", monthlyAmount: 1_000_000, months: 1, isMonthly: false },
  { label: "4등 (10만원)", monthlyAmount: 100_000, months: 1, isMonthly: false },
  { label: "5등 (5만원)", monthlyAmount: 50_000, months: 1, isMonthly: false },
  { label: "6등 (5,000원)", monthlyAmount: 5_000, months: 1, isMonthly: false },
  { label: "7등 (1,000원)", monthlyAmount: 1_000, months: 1, isMonthly: false },
  { label: "보너스 (월 100만원 x 10년)", monthlyAmount: 1_000_000, months: 120, isMonthly: true },
];

interface TaxResult {
  prize: PensionPrize;
  monthlyGross: number;
  monthlyIncomeTax: number;
  monthlyLocalTax: number;
  monthlyTotalTax: number;
  monthlyNet: number;
  totalGross: number;
  totalTax: number;
  totalNet: number;
  taxRate: number;
  isTaxFree: boolean;
}

function calculatePensionTax(prize: PensionPrize): TaxResult {
  const monthlyGross = prize.monthlyAmount;
  const totalGross = monthlyGross * prize.months;

  // 200만원 이하: 비과세
  const isTaxFree = monthlyGross <= 2_000_000;

  let monthlyIncomeTax = 0;
  let monthlyLocalTax = 0;

  if (!isTaxFree) {
    // 소득세 20%, 주민세 2% (소득세의 10%)
    monthlyIncomeTax = Math.floor(monthlyGross * 0.2);
    monthlyLocalTax = Math.floor(monthlyGross * 0.02);
  }

  const monthlyTotalTax = monthlyIncomeTax + monthlyLocalTax;
  const monthlyNet = monthlyGross - monthlyTotalTax;
  const totalTax = monthlyTotalTax * prize.months;
  const totalNet = totalGross - totalTax;
  const taxRate = isTaxFree ? 0 : 22;

  return {
    prize,
    monthlyGross,
    monthlyIncomeTax,
    monthlyLocalTax,
    monthlyTotalTax,
    monthlyNet,
    totalGross,
    totalTax,
    totalNet,
    taxRate,
    isTaxFree,
  };
}

export default function PensionTaxClient() {
  const [mounted, setMounted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [result, setResult] = useState<TaxResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCalculate = () => {
    const prize = prizes[selectedIndex];
    setResult(calculatePensionTax(prize));
  };

  const handleReset = () => {
    setSelectedIndex(0);
    setResult(null);
  };

  const getShareText = () => {
    if (!result) return "";
    const { prize, monthlyNet, totalNet } = result;
    if (prize.isMonthly) {
      return `연금복권 ${prize.label}\n월 실수령액: ${formatKRW(monthlyNet)}\n총 실수령액: ${formatKRW(totalNet)}`;
    }
    return `연금복권 ${prize.label}\n실수령액: ${formatKRW(totalNet)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareText());
    toast("계산 결과가 클립보드에 복사되었습니다!");
  };

  const handleKakaoShare = () => {
    const Kakao = getKakaoSDK();
    if (!Kakao) {
      toast("카카오톡 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.", "error");
      return;
    }
    Kakao.Share.sendDefault({
      objectType: "text",
      text: getShareText(),
      link: {
        mobileWebUrl: `${SITE_URL}/pension/tax`,
        webUrl: `${SITE_URL}/pension/tax`,
      },
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "연금복권 세금 계산기 - 로또리",
        text: getShareText(),
        url: `${SITE_URL}/pension/tax`,
      });
    } else {
      handleCopy();
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse mb-6" />
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Input Section */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">등수 선택</h2>

        <select
          value={selectedIndex}
          onChange={(e) => {
            setSelectedIndex(Number(e.target.value));
            setResult(null);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white mb-6 appearance-none cursor-pointer"
        >
          {prizes.map((prize, idx) => (
            <option key={idx} value={idx}>
              {prize.label}
            </option>
          ))}
        </select>

        {/* Quick preset buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {prizes.slice(0, 4).map((prize, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedIndex(idx);
                setResult(null);
              }}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedIndex === idx
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {idx === 0 ? "1등" : idx === 1 ? "2등" : idx === 2 ? "3등" : "4등"}
            </button>
          ))}
          <button
            onClick={() => {
              setSelectedIndex(7);
              setResult(null);
            }}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              selectedIndex === 7
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
            }`}
          >
            보너스
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCalculate}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
          >
            계산하기
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
        </div>
      </section>

      {/* Result Section */}
      {result && (
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">계산 결과</h2>

          {/* Net Amount Highlight */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-center">
            {result.prize.isMonthly ? (
              <>
                <p className="text-sm text-blue-600 mb-1">월 실수령액</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700 break-words">
                  {formatKRW(result.monthlyNet)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {result.prize.months / 12}년간 매월 수령
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-blue-600 mb-1">실수령액</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700 break-words">
                  {formatKRW(result.totalNet)}
                </p>
              </>
            )}
            {result.isTaxFree ? (
              <p className="text-sm text-green-600 mt-2">비과세 (200만원 이하)</p>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                세금 {result.taxRate}% 원천징수
              </p>
            )}
          </div>

          {/* Breakdown */}
          <div className="divide-y divide-gray-100">
            <Row label="당첨 등수" value={result.prize.label.split(" (")[0]} />
            {result.prize.isMonthly && (
              <>
                <Row label="월 당첨금 (세전)" value={formatKRW(result.monthlyGross)} />
                <Row
                  label="소득세 (20%)"
                  value={result.monthlyIncomeTax > 0 ? `- ${formatKRW(result.monthlyIncomeTax)}` : "비과세"}
                  sub={result.monthlyIncomeTax > 0}
                />
                <Row
                  label="주민세 (2%)"
                  value={result.monthlyLocalTax > 0 ? `- ${formatKRW(result.monthlyLocalTax)}` : "비과세"}
                  sub={result.monthlyLocalTax > 0}
                />
                <Row
                  label="월 세금 합계"
                  value={result.monthlyTotalTax > 0 ? `- ${formatKRW(result.monthlyTotalTax)}` : "0원"}
                  bold
                />
                <Row label="월 실수령액" value={formatKRW(result.monthlyNet)} highlight />
                <div className="h-3" />
                <Row label={`수령 기간`} value={`${result.prize.months / 12}년 (${result.prize.months}개월)`} />
                <Row label="총 당첨금 (세전)" value={formatKRW(result.totalGross)} />
                <Row
                  label="총 세금"
                  value={result.totalTax > 0 ? `- ${formatKRW(result.totalTax)}` : "0원"}
                  bold
                />
                <Row label="총 실수령액" value={formatKRW(result.totalNet)} highlight />
              </>
            )}
            {!result.prize.isMonthly && (
              <>
                <Row label="당첨금 (세전)" value={formatKRW(result.totalGross)} />
                <Row
                  label="소득세 (20%)"
                  value={result.monthlyIncomeTax > 0 ? `- ${formatKRW(result.monthlyIncomeTax)}` : "비과세"}
                  sub={result.monthlyIncomeTax > 0}
                />
                <Row
                  label="주민세 (2%)"
                  value={result.monthlyLocalTax > 0 ? `- ${formatKRW(result.monthlyLocalTax)}` : "비과세"}
                  sub={result.monthlyLocalTax > 0}
                />
                <Row
                  label="세금 합계"
                  value={result.totalTax > 0 ? `- ${formatKRW(result.totalTax)}` : "0원"}
                  bold
                />
                <Row label="실수령액" value={formatKRW(result.totalNet)} highlight />
              </>
            )}
          </div>
        </section>
      )}

      {/* Share buttons */}
      {result && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleCopy}
            className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            &#x1F4CB; 복사하기
          </button>
          <button
            onClick={handleKakaoShare}
            className="flex-1 bg-[#FEE500] text-[#191919] font-medium py-3 rounded-xl hover:brightness-95 transition-all text-sm"
          >
            &#x1F4AC; 카카오톡 공유
          </button>
          <button
            onClick={handleShare}
            className="flex-1 bg-blue-500 text-white font-medium py-3 rounded-xl hover:bg-blue-600 transition-colors text-sm"
          >
            &#x1F4F1; 공유하기
          </button>
        </div>
      )}

      {/* Tax Info */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">연금복권 세금 안내</h2>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">세율 구조</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 border border-gray-200 font-semibold">당첨금</th>
                    <th className="text-center px-3 py-2 border border-gray-200 font-semibold">소득세</th>
                    <th className="text-center px-3 py-2 border border-gray-200 font-semibold">주민세</th>
                    <th className="text-center px-3 py-2 border border-gray-200 font-semibold">합계</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border border-gray-200">200만원 이하</td>
                    <td className="text-center px-3 py-2 border border-gray-200">비과세</td>
                    <td className="text-center px-3 py-2 border border-gray-200">비과세</td>
                    <td className="text-center px-3 py-2 border border-gray-200 font-semibold text-green-600">0%</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-gray-200">200만원 초과</td>
                    <td className="text-center px-3 py-2 border border-gray-200">20%</td>
                    <td className="text-center px-3 py-2 border border-gray-200">2%</td>
                    <td className="text-center px-3 py-2 border border-gray-200 font-semibold">22%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">연금복권 vs 로또 세금 차이</h3>
            <p>
              로또 6/45는 당첨금 3억원 초과분에 33%의 높은 세율이 적용됩니다.
              반면 연금복권은 매월 분할 수령하므로 월 수령액 기준으로 22%만
              적용되어 <strong>세금 부담이 상대적으로 적습니다.</strong>
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">수령 안내</h3>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li><strong>1등, 2등, 보너스:</strong> NH농협은행 본점에서 수령 신청 후 매월 지급</li>
              <li><strong>3등:</strong> NH농협은행 전국 지점에서 수령</li>
              <li><strong>4등 이하:</strong> 복권 판매점 또는 NH농협은행에서 수령</li>
              <li><strong>수령 기한:</strong> 추첨일로부터 <strong>1년 이내</strong> 수령 신청</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-yellow-800">
            본 계산기는 참고용이며, 실제 세금은 개인 상황에 따라 달라질 수 있습니다.
            정확한 세금 계산은 국세청 또는 세무 전문가에게 문의하시기 바랍니다.
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
  sub,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  sub?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center py-2.5 px-1 ${
        highlight ? "bg-blue-50 -mx-1 px-2 rounded-lg" : ""
      }`}
    >
      <span className={`text-sm ${bold || highlight ? "font-semibold text-gray-900" : "text-gray-600"}`}>
        {label}
      </span>
      <span
        className={`text-sm ${
          highlight
            ? "font-bold text-blue-700 text-lg"
            : bold
            ? "font-semibold text-gray-900"
            : sub
            ? "text-red-500"
            : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
