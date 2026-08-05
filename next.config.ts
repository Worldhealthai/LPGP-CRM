import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "**.lusha.com" },
    ],
  },
  experimental: {
    // Client router cache: reuse a just-visited dynamic page for 30s instead
    // of refetching — makes hopping between Pipeline/Leads/Database instant.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
