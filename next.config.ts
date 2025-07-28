import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Cloudflare Pages deployment
  output: "standalone",
  
  // External packages for server components
  serverExternalPackages: ["@prisma/client"],
  
  // Disable automatic runtime selection to prevent conflicts
  experimental: {
    serverMinification: false,
  },
  
  // Headers for API routes
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
