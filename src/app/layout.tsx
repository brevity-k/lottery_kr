import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { SITE_URL, SITE_NAME, GA4_MEASUREMENT_ID } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "내 로또 번호 역대 당첨 검사 - 로또리",
    template: "%s | 로또리",
  },
  description:
    "나의 로또 번호가 역대 1,200회 이상의 당첨번호와 얼마나 일치하는지 즉시 검사하세요. 가장 가까웠던 순간, 수익 분석까지 무료 제공.",
  keywords: [
    "로또 번호 검사",
    "로또 번호 비교",
    "로또 역대 당첨",
    "내 번호 확인",
    "로또",
    "로또 6/45",
    "로또 번호 추천",
    "로또 당첨번호",
    "로또 통계",
  ],
  alternates: {
    canonical: "/",
    languages: {
      ko: "/",
    },
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    title: "내 로또 번호 역대 당첨 검사 - 로또리",
    description: "나의 로또 번호가 역대 1,200회 이상의 당첨번호와 얼마나 일치하는지 즉시 검사하세요. 가장 가까웠던 순간, 수익 분석까지 무료 제공.",
    url: "/",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "내 로또 번호 역대 당첨 검사 - 로또리",
    description: "나의 로또 번호가 역대 1,200회 이상의 당첨번호와 얼마나 일치하는지 즉시 검사하세요. 가장 가까웠던 순간, 수익 분석까지 무료 제공.",
  },
  verification: {
    google: "l9x3-7Ka7vQqGyceePwBraUm1GpiQxsWF0MhGyLDNVQ",
    other: {
      "naver-site-verification": ["4d2b1b57bfa30e4b39180942c18dcd707a256e8a"],
    },
  },
  other: {
    "theme-color": "#2563eb",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content="ko" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_MEASUREMENT_ID}');
          `}
        </Script>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            strategy="beforeInteractive"
            crossOrigin="anonymous"
          />
        )}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          strategy="afterInteractive"
        />
        <link
          rel="preload"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
