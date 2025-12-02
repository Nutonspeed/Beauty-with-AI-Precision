// PWA Configuration
export const pwaConfig = {
  // Service Worker Configuration
  serviceWorker: {
    enabled: process.env.NEXT_PUBLIC_PWA_ENABLED !== 'false',
    scope: '/',
    updateInterval: parseInt(process.env.NEXT_PUBLIC_PWA_UPDATE_INTERVAL || '3600000'), // 1 hour
    cacheStrategy: process.env.NEXT_PUBLIC_PWA_CACHE_STRATEGY || 'staleWhileRevalidate'
  },
  
  // Manifest Configuration
  manifest: {
    name: 'Beauty with AI Precision - Advanced Aesthetic Clinic Platform',
    shortName: 'Beauty AI',
    description: 'AI-powered aesthetic clinic platform with advanced skin analysis, 3D AR visualization, and comprehensive patient management',
    themeColor: '#ec4899',
    backgroundColor: '#ffffff',
    display: 'standalone',
    orientation: 'portrait-primary',
    startUrl: '/',
    scope: '/',
    lang: 'en',
    dir: 'ltr',
    categories: ['medical', 'health', 'beauty', 'lifestyle']
  },
  
  // Cache Configuration
  cache: {
    staticAssets: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxEntries: 100,
      patterns: [
        '/_next/static/',
        '/icons/',
        '/images/',
        '\.(png|jpg|jpeg|svg|gif|webp|ico)$',
        '\.(woff|woff2|ttf|eot)$'
      ]
    },
    apiResponses: {
      maxAge: 5 * 60 * 1000, // 5 minutes
      maxEntries: 50,
      patterns: [
        '/api/patients',
        '/api/treatments',
        '/api/appointments'
      ]
    },
    pages: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      maxEntries: 20,
      patterns: [
        '/',
        '/dashboard',
        '/analysis',
        '/ar-simulator',
        '/sales',
        '/clinic'
      ]
    }
  },
  
  // Offline Configuration
  offline: {
    enabled: true,
    fallbackPage: '/offline',
    showOfflineIndicator: true,
    autoSyncWhenOnline: true,
    maxRetries: 3,
    retryDelay: 5000
  },
  
  // Push Notifications
  push: {
    enabled: process.env.NEXT_PUBLIC_PWA_PUSH_ENABLED === 'true',
    publicKey: process.env.NEXT_PUBLIC_PWA_PUSH_PUBLIC_KEY,
    serverKey: process.env.PWA_PUSH_SERVER_KEY,
    vapidPublicKey: process.env.NEXT_PUBLIC_PWA_VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.PWA_VAPID_PRIVATE_KEY,
    vapidEmail: process.env.PWA_VAPID_EMAIL
  },
  
  // Background Sync
  backgroundSync: {
    enabled: true,
    syncInterval: parseInt(process.env.NEXT_PUBLIC_PWA_SYNC_INTERVAL || '300000'), // 5 minutes
    maxQueueSize: 100,
    retryStrategy: 'exponential'
  },
  
  // Install Prompt
  install: {
    enabled: true,
    delay: parseInt(process.env.NEXT_PUBLIC_PWA_INSTALL_DELAY || '30000'), // 30 seconds
    showOnMobile: true,
    showOnDesktop: true,
    maxShowCount: 3,
    dismissPeriod: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  
  // Update Notifications
  updates: {
    enabled: true,
    checkInterval: parseInt(process.env.NEXT_PUBLIC_PWA_UPDATE_CHECK_INTERVAL || '3600000'), // 1 hour
    showNotification: true,
    autoInstall: false,
    requireUserAction: true
  },
  
  // Performance
  performance: {
    preloadCriticalResources: true,
    prefetchNextPages: true,
    imageOptimization: true,
    bundleOptimization: true,
    compressionEnabled: true
  },
  
  // Analytics
  analytics: {
    trackPWAEvents: process.env.NEXT_PUBLIC_PWA_ANALYTICS_ENABLED === 'true',
    trackInstalls: true,
    trackUpdates: true,
    trackOfflineUsage: true,
    trackPerformance: true
  },
  
  // Security
  security: {
    requireHTTPS: process.env.NODE_ENV === 'production',
    cspEnabled: true,
    integrityChecks: true,
    secureCookies: true
  },
  
  // Development
  development: {
    debugMode: process.env.NODE_ENV === 'development',
    logLevel: process.env.NEXT_PUBLIC_PWA_LOG_LEVEL || 'info',
    mockOffline: process.env.NEXT_PUBLIC_PWA_MOCK_OFFLINE === 'true',
    skipWaiting: process.env.NEXT_PUBLIC_PWA_SKIP_WAITING === 'true'
  }
}

export default pwaConfig
