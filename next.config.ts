import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The experimental feature "experimental.ppr" can only be enabled when using the latest canary version of Next.js
    // ppr: "incremental",
  },

  // External packages for server components
  serverExternalPackages: ["@supabase/supabase-js"],

  // Turbopack configuration (now stable)
  // turbopack: {
  //   resolveAlias: {
  //     // Add any necessary alias mappings here
  //   },
  // },

  // Bundle optimization for production builds (webpack)
  webpack: (config, { isServer, dev }) => {
    // Configure cache to avoid serialization warnings
    if (config.cache && typeof config.cache === "object") {
      config.cache.compression = "gzip";
    }

    // Only apply webpack optimizations for production builds
    if (!dev) {
      // Optimize bundle splitting
      if (!isServer) {
        config.optimization.splitChunks = {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,

            // Separate vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 20,
            },

            // UI components chunk
            ui: {
              test: /[\\/]components[\\/]ui[\\/]/,
              name: "ui-components",
              chunks: "all",
              priority: 15,
            },

            // Form components chunk
            forms: {
              test: /[\\/]components[\\/]forms[\\/]/,
              name: "form-components",
              chunks: "async",
              priority: 10,
            },

            // Features chunk
            features: {
              test: /[\\/]features[\\/]/,
              name: "features",
              chunks: "async",
              priority: 10,
            },

            // Shared utilities chunk
            shared: {
              test: /[\\/]shared[\\/]/,
              name: "shared-utils",
              chunks: "all",
              priority: 10,
            },
          },
        };
      }

      // Optimize imports - add any necessary alias mappings here
      // config.resolve.alias = {
      //   ...config.resolve.alias,
      // };
    }

    return config;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.clarity.ms https://scripts.clarity.ms", // unsafe-eval and unsafe-inline needed for Next.js dev, clarity.ms domains for Microsoft Clarity
              "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind CSS
              "img-src 'self' data: https:",
              "connect-src 'self' https://api.supabase.co wss://api.supabase.co https://nhbxragnkjqitmkvzkwn.supabase.co https://vercel.live https://vitals.vercel-insights.com https://www.clarity.ms https://h.clarity.ms",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
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
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
    deviceSizes: [640, 768, 1024, 1280, 1920], // Mobile-first responsive
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and thumbnail sizes
  },
};

export default nextConfig;
