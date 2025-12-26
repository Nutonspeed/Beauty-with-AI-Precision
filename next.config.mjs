import createNextIntlPlugin from 'next-intl/plugin'
import withBundleAnalyzer from '@next/bundle-analyzer'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const isVercel = process.env.VERCEL === '1'
const envFast =
  process.env.FAST_BUILD === '1' ||
  process.env.FAST_BUILD === 'true' ||
  process.env.FAST_BUILD === 'yes'
const FAST_BUILD = envFast || isVercel
const ANALYZE = process.env.ANALYZE === '1' || process.env.ANALYZE === 'true'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isVercel ? 'standalone' : undefined,
  distDir: '.next',
  compress: !FAST_BUILD,
  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: FAST_BUILD,
  },

  // Note: ESLint is now configured via .eslintrc.json

  productionBrowserSourceMaps: !FAST_BUILD,


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

  async redirects() {
    return [
      { source: '/leads', destination: '/th/sales/leads', permanent: true },
      { source: '/sales/leads', destination: '/th/sales/leads', permanent: true },
      { source: '/sales/leads/:id', destination: '/th/sales/leads/:id', permanent: true },
    ]
  },

  ...(process.env.NODE_ENV === 'production' && !FAST_BUILD && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),

  serverExternalPackages: ['@prisma/client', '@tensorflow/tfjs-node', '@google-cloud/vision', 'sharp'],
  
  // Legacy experimental options (deprecated)
  // turbopack: {
  //   resolveAlias: {
  //     '@': './.',
  //   },
  // },

  webpack: (config, { dev, isServer }) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@opentelemetry[\\/]/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ]

    if (!isServer) {
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

  experimental: {
    workerThreads: false,
    cpus: FAST_BUILD ? (isVercel ? 2 : 1) : undefined,
    optimizePackageImports: FAST_BUILD
      ? []
      : [
          '@radix-ui/react-icons',
          'lucide-react',
          '@radix-ui/react-dialog',
          '@radix-ui/react-dropdown-menu',
          '@radix-ui/react-select',
          '@radix-ui/react-tabs',
          '@radix-ui/react-toast',
        ],
    optimizeCss: false, // Disable CSS optimization to fix critters error
    webpackBuildWorker: false,
    // Note: serverExternalPackages has been moved to root level
  },
}

// Bundle analyzer wrapper
const bundleAnalyzer = withBundleAnalyzer({
  enabled: ANALYZE,
  openAnalyzer: true,
})

export default bundleAnalyzer(withNextIntl(nextConfig))
