const createNextIntlPlugin = require('next-intl/plugin');

// Sentry is now initialized via instrumentation.ts with lazy loading
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for API routes compatibility
  // output: 'export',
  trailingSlash: true,
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
  skipTrailingSlashRedirect: true,
  
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
  },
  
  // TypeScript and ESLint optimizations
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  
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
};

// Enable next-intl for i18n support
// Sentry is initialized via instrumentation.ts with lazy loading
module.exports = withNextIntl(nextConfig);
