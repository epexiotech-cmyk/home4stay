import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@home4stay/data"],
  turbopack: {
    root: "../../"
  }
};

export default nextConfig;
