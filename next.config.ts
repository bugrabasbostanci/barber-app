import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Cloudflare deployment
  serverExternalPackages: ["@prisma/client"],

  // Ensure proper runtime selection
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
