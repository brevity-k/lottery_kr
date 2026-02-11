"use client";

interface AdBannerProps {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export default function AdBanner({
  slot = "XXXXXXXXXX",
  format = "auto",
  className = "",
}: AdBannerProps) {
  // In development, show placeholder
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm py-6 ${className}`}
      >
        광고 영역 (AdSense: {slot}, {format})
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
        }}
      />
    </div>
  );
}
