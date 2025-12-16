
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fast build optimizations
  typescript: {
    ignoreBuildErrors: true, // Skip type checking for faster builds
  },
  
  // Disable ESLint for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Images - optimized for Vercel
  images: {
    unoptimized: true, // Disable image optimization for faster builds
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true, // Remove all console logs
    },
  }),
  
  // Fast build specific optimizations
  ...(process.env.FAST_BUILD && {
    // Disable heavy optimizations for faster builds
    experimental: {
      optimizePackageImports: false,
      optimizeCss: false,
      workerThreads: false,
      cpus: 1, // Use single CPU for faster builds
    },
    
    // Skip bundle analysis
    swcMinify: false,
    
    // Minimal webpack config
    webpack: (config) => {
      config.optimization = {
        ...config.optimization,
        minimize: false, // Skip minification for faster builds
        splitChunks: false, // Skip code splitting for faster builds
      };
      return config;
    },
  }),
  
  // Server external packages
  serverExternalPackages: [
    '@prisma/client',
    '@tensorflow/tfjs-node',
    '@google-cloud/vision',
    'sharp',
  ],
  
  // Output configuration
  output: process.env.VERCEL ? 'standalone' : undefined,
};

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
}, {
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
});
