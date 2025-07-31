import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverMinification: false,
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
    ],
  },
};

export default nextConfig;
