import { getBallColor } from "@/lib/utils/format";

interface LottoBallProps {
  number: number;
  size?: "sm" | "md" | "lg";
  isBonus?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

export default function LottoBall({ number, size = "md", isBonus = false }: LottoBallProps) {
  return (
    <div className="flex items-center gap-1">
      {isBonus && <span className="text-gray-400 text-lg font-bold mr-1">+</span>}
      <div
        className={`${getBallColor(number)} ${sizeClasses[size]} rounded-full flex items-center justify-center font-bold shadow-md`}
      >
        {number}
      </div>
    </div>
  );
}
