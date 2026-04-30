import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@home4stay/data"],
  turbopack: {
    // Set root to the monorepo root to allow resolving hoisted dependencies
    root: path.resolve(__dirname, "../../")
  }
};

export default nextConfig;
