"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

const EXCLUDED_PATHS = ["/privacy", "/terms", "/contact"];

export default function AdSenseScript() {
  const pathname = usePathname();

  if (!ADSENSE_CLIENT) return null;
  if (EXCLUDED_PATHS.includes(pathname)) return null;

  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
