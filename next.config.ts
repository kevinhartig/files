import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Use experimental flag to enable more Turbopack features
  experimental: {
    // Enable Turbopack for production builds
    turbo: {
      // Turbopack-specific options can be added here
      resolveAlias: {
        // Ensure the app is exposed globally for DApp integration
        'app-global': './src/app/global.ts',
      },
    },
    // Optimize for single-page applications
    optimizePackageImports: ['react', 'react-dom'],
    // Use server actions for better browser compatibility
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Keep the turbopack config for development
  turbopack: {
    // Enable Turbopack for all builds
    resolveAlias: {
      // Ensure the app is exposed globally for DApp integration
      'app-global': './src/app/global.ts',
    },
  },
};

export default nextConfig;
