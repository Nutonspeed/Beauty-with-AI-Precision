import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript - Enable type checking in production
  typescript: {
    ignoreBuildErrors: true, // Temporarily disabled during development/deployment
  },

  // Note: Next.js 16 removes eslint config in next.config; use a separate eslint config and CI steps instead.

  // Images
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Build optimization for limited memory environments
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    cpus: 1,
  },
  
  // Development performance boost
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 5,
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
            value: 'DENY',
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
    experimental: {
      optimizeCss: true,
    },
  }),

  // Turbopack configuration
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

    // Optimize bundle size in production
    if (!dev && !isServer) {
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
    ...(process.env.NODE_ENV === 'production' && {
      optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    }),
  },
}

export default withNextIntl(nextConfig);
