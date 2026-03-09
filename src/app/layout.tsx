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
    default: "로또리 - 한국 복권 번호 추천 | 로또 6/45 당첨번호 분석",
    template: "%s | 로또리",
  },
  description:
    "로또 6/45 번호 추천, 당첨번호 조회, 통계 분석을 한 곳에서. 통계 기반 스마트한 번호 추천으로 행운을 잡으세요!",
  keywords: [
    "로또",
    "로또 번호 추천",
    "로또 당첨번호",
    "로또 6/45",
    "로또 번호 생성기",
    "로또 당첨번호 조회",
    "로또 통계",
    "로또 시뮬레이터",
    "로또 세금 계산기",
    "꿈해몽 로또",
    "로또 명당",
    "복권 번호 추천",
    "당첨번호 조회",
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
    title: "로또리 - 한국 복권 번호 추천",
    description: "통계 기반 스마트한 로또 번호 추천 서비스",
    url: "/",
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "로또리 - 한국 복권 번호 추천",
    description: "통계 기반 스마트한 로또 번호 추천 서비스",
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
