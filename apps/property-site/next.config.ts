import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@home4stay/data"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
