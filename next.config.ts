import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "roast-me.wtako.net",
      },
    ],
    unoptimized: true
  },
  output: 'export'
};

export default nextConfig;
