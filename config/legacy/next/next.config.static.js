
const createNextIntlPlugin = require('next-intl/plugin');
const { withSentryConfig } = require('@sentry/nextjs');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Skip build-time generation for problematic pages
  skipTrailingSlashRedirect: true,
  
  // Disable SSR for all pages
  experimental: {
    ssr: false,
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // TypeScript and ESLint optimizations
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true,
    },
  }),
  
  // Server external packages (not needed for static export)
  serverExternalPackages: [
    '@prisma/client',
    '@tensorflow/tfjs-node',
    '@google-cloud/vision',
    'sharp',
  ],
};

module.exports = withSentryConfig(withNextIntl(nextConfig), {
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
