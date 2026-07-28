import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "img.cjdropshipping.com",
      },
      {
        protocol: "https",
        hostname: "*.cjdropshipping.com",
      },
    ],
  },
};

export default nextConfig;
