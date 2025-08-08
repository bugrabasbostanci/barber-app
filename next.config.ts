import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // This enables several experimental options to make debugging easier
    serverMinification: false,
    // The experimental feature "experimental.ppr" can only be enabled when using the latest canary version of Next.js
    // ppr: "incremental",
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval and unsafe-inline needed for Next.js dev
              "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind CSS
              "img-src 'self' data: https:",
              "connect-src 'self' https://api.supabase.co wss://api.supabase.co https://nhbxragnkjqitmkvzkwn.supabase.co https://vercel.live https://vitals.vercel-insights.com",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ]
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
