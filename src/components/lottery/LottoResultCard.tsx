import { LottoResult } from "@/types/lottery";
import { formatDate, formatKRW } from "@/lib/utils/format";
import LottoBall from "./LottoBall";

interface LottoResultCardProps {
  result: LottoResult;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function LottoResultCard({
  result,
  showDetails = false,
  size = "md",
}: LottoResultCardProps) {
  const numbers = [
    result.drwtNo1,
    result.drwtNo2,
    result.drwtNo3,
    result.drwtNo4,
    result.drwtNo5,
    result.drwtNo6,
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm text-gray-500">제 </span>
          <span className="text-lg font-bold text-blue-600">{result.drwNo}</span>
          <span className="text-sm text-gray-500"> 회</span>
        </div>
        <span className="text-sm text-gray-500">{formatDate(result.drwNoDate)}</span>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {numbers.map((num, i) => (
          <LottoBall key={i} number={num} size={size} />
        ))}
        <LottoBall number={result.bnusNo} size={size} isBonus />
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">1등 당첨금</span>
            <p className="font-semibold text-gray-900">{formatKRW(result.firstWinamnt)}</p>
          </div>
          <div>
            <span className="text-gray-500">1등 당첨자</span>
            <p className="font-semibold text-gray-900">{result.firstPrzwnerCo}명</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">총 판매금액</span>
            <p className="font-semibold text-gray-900">{formatKRW(result.totSellamnt)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
