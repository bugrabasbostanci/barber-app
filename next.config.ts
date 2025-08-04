import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // This enables several experimental options to make debugging easier
    serverMinification: false,
    // The experimental feature "experimental.ppr" can only be enabled when using the latest canary version of Next.js
    // ppr: "incremental",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "j508qhyzqd.ufs.sh",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "developers.google.com",
        port: "",
        pathname: "/**",
      },
      // Vercel avatars for demo components
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        port: "",
        pathname: "/**",
      },
      // Potential barber shop images and staff photos
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      // CloudFront or other CDN for barber shop assets
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
        port: "",
        pathname: "/**",
      },
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
    deviceSizes: [640, 768, 1024, 1280, 1920], // Mobile-first responsive
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and thumbnail sizes
  },
};

export default nextConfig;
