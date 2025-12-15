// const createNextIntlPlugin = require('next-intl/plugin');
// const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for API routes compatibility
  // output: 'export',
  trailingSlash: false,
  images: {
    // unoptimized: true, // Not needed without static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Skip build-time generation for problematic pages
  // skipTrailingSlashRedirect: true, // Deprecated in Next.js 15+

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Bundle optimization
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/dist/{{member}}',
    },
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'date-fns',
      'recharts',
    ],
    // Enable webpack build worker for proper static asset generation
    webpackBuildWorker: false,
  },

  // TypeScript and ESLint optimizations
  typescript: {
    ignoreBuildErrors: false, // Enable to catch build errors
  },
  // eslint config removed - deprecated in Next.js 16

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true,
    },
  }),

  // Server external packages
  serverExternalPackages: [
    '@prisma/client',
    '@tensorflow/tfjs-node',
    '@google-cloud/vision',
    'sharp',
  ],

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/leads', destination: '/th/sales/leads', permanent: true },
      { source: '/sales/leads', destination: '/th/sales/leads', permanent: true },
      { source: '/sales/leads/:id', destination: '/th/sales/leads/:id', permanent: true },
    ];
  },
};

// Enable next-intl for i18n support
// Sentry is initialized via instrumentation.ts with lazy loading
// module.exports = withNextIntl(nextConfig);
module.exports = nextConfig;
