"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { NumberFrequency } from "@/types/lottery";
import { getBallBorderColor } from "@/lib/utils/format";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FrequencyChartProps {
  frequencies: NumberFrequency[];
  title?: string;
}

export default function FrequencyChart({
  frequencies,
  title = "번호별 출현 빈도",
}: FrequencyChartProps) {
  const data = {
    labels: frequencies.map((f) => f.number.toString()),
    datasets: [
      {
        label: "출현 횟수",
        data: frequencies.map((f) => f.count),
        backgroundColor: frequencies.map((f) => {
          const color = getBallBorderColor(f.number);
          return color + "CC";
        }),
        borderColor: frequencies.map((f) => getBallBorderColor(f.number)),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: "bold" as const },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f0f0f0" },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="h-[300px] md:h-[400px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
