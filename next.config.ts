import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  turbopack: {
    // Enable Turbopack for all builds
    resolveAlias: {
      // Ensure the app is exposed globally for DApp integration
      'app-global': './src/app/global.ts',
    },
  },
};

export default nextConfig;
