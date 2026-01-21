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
const allowLocalImages = process.env.NODE_ENV !== 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: undefined, // Disable standalone completely
  distDir: '.next',
  compress: !FAST_BUILD,
  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: FAST_BUILD,
  },

  eslint: {
    ignoreDuringBuilds: true,
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
      ...(allowLocalImages
        ? [
            {
              protocol: 'http',
              hostname: 'localhost',
            },
          ]
        : []),
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
            value: 'camera=(self), microphone=(), geolocation=()',
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
    return []
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

  webpack: (config, { dev, isServer, webpack }) => {
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
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module) {
                return module.size() > 160000 &&
                  /node_modules[\\/]/.test(module.identifier())
              },
              name(module) {
                const hash = require('crypto').createHash('sha1')
                hash.update(module.identifier())
                return hash.digest('hex').substring(0, 8)
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name(module, chunks) {
                return 'shared-' + 
                  require('crypto').createHash('sha1')
                    .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                    .digest('hex').substring(0, 8)
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      }
      
      // Add webpack plugins for better optimization
      config.plugins.push(
        new webpack.optimize.ModuleConcatenationPlugin()
      )
    }

    return config
  },

  experimental: {
    workerThreads: false,
    cpus: FAST_BUILD ? 1 : 2, // Reduce CPU usage during build
    optimizePackageImports: FAST_BUILD
      ? []
      : [
          '@radix-ui/react-icons',
          'lucide-react',
          'framer-motion',
          '@tensorflow/tfjs',
          'date-fns',
          'recharts',
          'lodash',
        ], // Optimize more packages
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
