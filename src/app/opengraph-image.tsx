import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "로또리 - 로또 번호 추천 및 당첨번호 분석";
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
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Site name */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}
        >
          로또리
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.85)",
            marginBottom: 48,
          }}
        >
          로또 번호 추천 · 당첨번호 분석 · 통계
        </div>

        {/* Divider line */}
        <div
          style={{
            width: 80,
            height: 3,
            background: "rgba(255, 255, 255, 0.4)",
            borderRadius: 2,
            marginBottom: 32,
          }}
        />

        {/* URL */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.6)",
            letterSpacing: "0.05em",
          }}
        >
          lottery.io.kr
        </div>
      </div>
    ),
    { ...size }
  );
}
