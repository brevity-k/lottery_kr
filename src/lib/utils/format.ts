export function formatKRW(amount: number): string {
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function getBallColor(num: number): string {
  if (num <= 10) return "bg-[#FBC400] text-gray-900";
  if (num <= 20) return "bg-[#69C8F2] text-white";
  if (num <= 30) return "bg-[#FF7272] text-white";
  if (num <= 40) return "bg-[#AAAAAA] text-white";
  return "bg-[#B0D840] text-gray-900";
}

export function getBallBorderColor(num: number): string {
  if (num <= 10) return "#FBC400";
  if (num <= 20) return "#69C8F2";
  if (num <= 30) return "#FF7272";
  if (num <= 40) return "#AAAAAA";
  return "#B0D840";
}
