"use client";

const ADSENSE_CLIENT_ID = "ca-pub-XXXXXXXXXXXXXXXX";
const IS_PLACEHOLDER = ADSENSE_CLIENT_ID.includes("XXXX");

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
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm py-6 ${className}`}
      >
        광고 영역 (AdSense: {slot}, {format})
      </div>
    );
  }

  // Don't render empty ad containers with fake publisher ID in production
  if (IS_PLACEHOLDER) {
    return null;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
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
