import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output as standalone for optimized deployment
  output: "standalone",
  // Env vars exposed to browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Required for Vercel edge caching
  poweredByHeader: false,
};

export default nextConfig;
