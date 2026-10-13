import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // a stray lockfile in $HOME otherwise makes Next guess the wrong workspace root
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
