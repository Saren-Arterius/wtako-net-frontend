import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
    ],
    unoptimized: true
  },
  output: 'export'
};

export default nextConfig;
