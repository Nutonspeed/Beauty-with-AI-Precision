import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const FAST_BUILD = process.env.FAST_BUILD === '1' || process.env.FAST_BUILD === 'true'
const ANALYZE = process.env.ANALYZE === '1' || process.env.ANALYZE === 'true'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript - Enable type checking in production
  typescript: {
    ignoreBuildErrors: true, // Temporarily disabled during development/deployment
  },

  // Note: Next.js 16 removes eslint config in next.config; use a separate eslint config and CI steps instead.

  // Images - ⚡ Performance Optimization (Week 9)
  images: {
    unoptimized: false, // Enable Next.js image optimization
    formats: ['image/avif', 'image/webp'], // Modern formats for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and thumbnail sizes
    minimumCacheTTL: 60 * 60 * 24 * 365, // Cache for 1 year (365 days)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.beauty-ai.com', // CDN domain (Week 9)
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net', // AWS CloudFront
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com', // Vercel Blob Storage
      },
    ],
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Tree shaking and modular imports (Production only)
  ...(process.env.NODE_ENV === 'production' && !FAST_BUILD && {
    modularizeImports: {
      '@radix-ui/react-icons': {
        transform: '@radix-ui/react-icons/dist/{{member}}',
      },
      'lucide-react': {
        transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      },
    },
  }),
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },

  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),

  // Turbopack configuration
  // Note: Turbopack has known issues with lucide-react module resolution in Next.js 16.0.1
  // Use Webpack build for now until Next.js 16.1+ fixes this issue
  turbopack: {
    resolveAlias: {
      '@': './.',
    },
  },

  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      // Client-side: exclude server-only modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        'pg-native': false,
      }
    }

    // Optimize bundle size in production (skip for FAST_BUILD)
    if (!dev && !isServer && !FAST_BUILD) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
          },
        },
      }
    }

    return config
  },

  serverExternalPackages: [
    '@prisma/client',
    '@tensorflow/tfjs-node',
    '@google-cloud/vision',
    'sharp',
  ],

  // Experimental features
  experimental: {
    // Disable workerThreads to avoid DataCloneError in config serialization
    workerThreads: false,
    ...(FAST_BUILD ? {} : { cpus: 1 }),
    ...(process.env.NODE_ENV === 'production' && !FAST_BUILD && {
      optimizePackageImports: [
        '@radix-ui/react-icons', 
        'lucide-react',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-select',
        '@radix-ui/react-tabs',
        '@radix-ui/react-toast',
      ],
      optimizeCss: true,
    }),
  },

  // Output configuration for smaller builds
  // Use 'standalone' only on Vercel to avoid Windows symlink errors locally (EPERM)
  output:
    process.env.NODE_ENV === 'production' && process.env.VERCEL ? 'standalone' : undefined,
}

// Bundle analyzer wrapper
const bundleAnalyzer = withBundleAnalyzer({
  enabled: ANALYZE,
  openAnalyzer: true,
})

export default withSentryConfig(bundleAnalyzer(withNextIntl(nextConfig)), {
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
