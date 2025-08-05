import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Use experimental flag for advanced features
  experimental: {
    // Optimize for single-page applications
    optimizePackageImports: ['react', 'react-dom'],
    // Use server actions for better browser compatibility
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Configure Turbopack (now stable, no longer experimental)
  turbopack: {
    // Turbopack configuration for all builds
    resolveAlias: {
      // Ensure the app is exposed globally for DApp integration
      'app-global': './src/app/global.ts',
    },
  },
};

export default nextConfig;
