import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/lotto", destination: "/", permanent: true },
      { source: "/lotto/dream", destination: "/", permanent: true },
      { source: "/lotto/lucky", destination: "/", permanent: true },
      { source: "/lotto/simulator", destination: "/", permanent: true },
      { source: "/lotto/my-numbers", destination: "/", permanent: true },
      { source: "/lotto/stats", destination: "/", permanent: true },
      { source: "/lotto/numbers", destination: "/", permanent: true },
      { source: "/lotto/numbers/:num", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
