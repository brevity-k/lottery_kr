import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/constants";

export const runtime = "edge";
export const alt = "로또리 - 한국 복권 번호 추천";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎯</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            marginBottom: 16,
          }}
        >
          로또리
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 32,
          }}
        >
          통계 기반 스마트한 로또 번호 추천
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {[7, 14, 21, 33, 40, 45].map((num) => (
            <div
              key={num}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
                color: "white",
                background:
                  num <= 10
                    ? "#FBC400"
                    : num <= 20
                      ? "#69C8F2"
                      : num <= 30
                        ? "#FF7272"
                        : num <= 40
                          ? "#AAAAAA"
                          : "#B0D840",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {num}
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {SITE_URL.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    { ...size }
  );
}
