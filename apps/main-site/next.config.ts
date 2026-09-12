import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@home4stay/data"],
  turbopack: {
    // Set root to the monorepo root to allow resolving hoisted dependencies
    root: path.resolve(process.cwd(), "../..")
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  experimental: {
    serverActions: {},
  },
};

export default nextConfig;