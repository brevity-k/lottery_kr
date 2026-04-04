import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  poweredByHeader: false,
  // Headers moved to vercel.json (not supported with output: 'export')
};

export default nextConfig;
