#!/usr/bin/env node

/**
 * Progressive Web App (PWA) Setup Script
 * Implements comprehensive PWA features for Beauty with AI Precision platform
 */

const fs = require('fs')
const path = require('path')

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Create PWA directories
function createPWADirectories() {
  colorLog('\n📁 Creating PWA directories...', 'cyan')
  
  const directories = [
    'public',
    'public/icons',
    'public/icons/icon-72x72',
    'public/icons/icon-96x96',
    'public/icons/icon-128x128',
    'public/icons/icon-144x144',
    'public/icons/icon-152x152',
    'public/icons/icon-192x192',
    'public/icons/icon-384x384',
    'public/icons/icon-512x512',
    'public/screenshots',
    'public/manifest',
    'lib/pwa',
    'lib/pwa/service-workers',
    'lib/pwa/strategies',
    'lib/pwa/cache',
    'lib/pwa/push',
    'lib/pwa/background-sync',
    'components/pwa',
    'components/pwa/install-prompt',
    'components/pwa/offline-ui',
    'components/pwa/update-notification',
    'hooks/pwa',
    'utils/pwa',
    'config/pwa'
  ]
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      colorLog(`  ✅ Created ${dir}`, 'green')
    } else {
      colorLog(`  ✅ ${dir} exists`, 'blue')
    }
  })
}

// Create service worker
function createServiceWorker() {
  colorLog('\n⚙️ Creating service worker...', 'cyan')
  
  const serviceWorker = `// Beauty with AI Precision - Service Worker
// Advanced PWA Service Worker with Caching Strategies

const CACHE_NAME = 'beauty-with-ai-precision-v1'
const RUNTIME_CACHE = 'beauty-with-ai-precision-runtime'
const STATIC_CACHE = 'beauty-with-ai-precision-static'

// Cache configuration
const CACHE_CONFIG = {
  static: {
    name: STATIC_CACHE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 100
  },
  runtime: {
    name: RUNTIME_CACHE,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    maxEntries: 50
  }
}

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/[locale]',
  '/[locale]/auth/login',
  '/[locale]/auth/register',
  '/[locale]/dashboard',
  '/[locale]/analysis',
  '/[locale]/ar-simulator',
  '/[locale]/sales',
  '/[locale]/clinic',
  '/offline',
  '/_next/static/css/',
  '/_next/static/js/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
]

// API endpoints that can be cached
const CACHEABLE_PATTERNS = {
  // Cache GET requests to API
  api: /^\\/api\\/(?!auth).*$/,
  // Cache images and assets
  assets: /\\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
  // Cache fonts
  fonts: /\\.(woff|woff2|ttf|eot)$/i
}

// Network strategies
const CacheStrategies = {
  // Cache first, then network
  cacheFirst: async (request) => {
    try {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
      
      const networkResponse = await fetch(request)
      if (networkResponse.ok) {
        const cache = await caches.open(RUNTIME_CACHE)
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    } catch (error) {
      console.error('Cache first strategy failed:', error)
      return new Response('Offline', { status: 503 })
    }
  },

  // Network first, then cache
  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request)
      if (networkResponse.ok) {
        const cache = await caches.open(RUNTIME_CACHE)
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    } catch (error) {
      console.log('Network failed, trying cache:', error)
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
      return new Response('Offline', { status: 503 })
    }
  },

  // Stale while revalidate
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(RUNTIME_CACHE)
    const cachedResponse = await cache.match(request)
    
    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    
    return cachedResponse || fetchPromise
  },

  // Cache only
  cacheOnly: async (request) => {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response('Not found in cache', { status: 404 })
  },

  // Network only
  networkOnly: async (request) => {
    try {
      return await fetch(request)
    } catch (error) {
      return new Response('Network unavailable', { status: 503 })
    }
  }
}

// Service Worker Lifecycle Events

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('❌ Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker activated')
        return self.clients.claim()
      })
      .catch(error => {
        console.error('❌ Failed to activate service worker:', error)
      })
  )
})

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests and chrome-extension
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }
  
  // Handle different request types
  if (isNavigationRequest(request)) {
    // Handle navigation requests (HTML pages)
    event.respondWith(handleNavigationRequest(request))
  } else if (isAPIRequest(request)) {
    // Handle API requests
    event.respondWith(handleAPIRequest(request))
  } else if (isAssetRequest(request)) {
    // Handle static assets
    event.respondWith(CacheStrategies.cacheFirst(request))
  } else {
    // Handle other requests
    event.respondWith(CacheStrategies.staleWhileRevalidate(request))
  }
})

// Push notification event
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received:', event)
  
  if (event.data) {
    const options = event.data.json()
    
    event.waitUntil(
      self.registration.showNotification(options.title, {
        body: options.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        tag: options.tag || 'default',
        data: options.data,
        actions: options.actions || [],
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false
      })
    )
  }
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action) {
    // Handle specific action clicks
    handleNotificationAction(event.action, event.notification.data)
  } else {
    // Handle default notification click
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          // Focus existing window if available
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus()
            }
          }
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow('/')
          }
        })
    )
  }
})

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync triggered:', event.tag)
  
  if (event.tag === 'periodic-sync') {
    event.waitUntil(doPeriodicSync())
  }
})

// Request Handlers

function isNavigationRequest(request) {
  return request.mode === 'navigate'
}

function isAPIRequest(request) {
  return request.url.includes('/api/')
}

function isAssetRequest(request) {
  return CACHEABLE_PATTERNS.assets.test(request.url) ||
         CACHEABLE_PATTERNS.fonts.test(request.url)
}

async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation requests
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
  } catch (error) {
    console.log('Network failed for navigation, trying cache:', error)
  }
  
  // Fallback to cache
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Fallback to offline page
  const offlineResponse = await caches.match('/offline')
  if (offlineResponse) {
    return offlineResponse
  }
  
  // Final fallback
  return new Response('Offline', { 
    status: 503,
    headers: { 'Content-Type': 'text/html' }
  })
}

async function handleAPIRequest(request) {
  const url = new URL(request.url)
  
  // Don't cache auth requests
  if (url.pathname.includes('/auth/')) {
    return CacheStrategies.networkOnly(request)
  }
  
  // Cache GET requests to API
  if (request.method === 'GET' && CACHEABLE_PATTERNS.api.test(url.pathname)) {
    return CacheStrategies.staleWhileRevalidate(request)
  }
  
  // Network only for other API requests
  return CacheStrategies.networkOnly(request)
}

async function handleNotificationAction(action, data) {
  console.log('Handling notification action:', action, data)
  
  switch (action) {
    case 'view':
      if (clients.openWindow) {
        return clients.openWindow(data.url || '/')
      }
      break
      
    case 'dismiss':
      // Just close the notification (already done)
      break
      
    default:
      console.log('Unknown notification action:', action)
  }
}

async function doBackgroundSync() {
  console.log('🔄 Performing background sync...')
  
  try {
    // Get all queued actions from IndexedDB
    const queuedActions = await getQueuedActions()
    
    for (const action of queuedActions) {
      try {
        await syncAction(action)
        await removeQueuedAction(action.id)
      } catch (error) {
        console.error('Failed to sync action:', action, error)
      }
    }
    
    console.log('✅ Background sync completed')
  } catch (error) {
    console.error('❌ Background sync failed:', error)
  }
}

async function doPeriodicSync() {
  console.log('⏰ Performing periodic sync...')
  
  try {
    // Refresh cached data
    await refreshCachedData()
    
    // Clean up old cache entries
    await cleanupCache()
    
    console.log('✅ Periodic sync completed')
  } catch (error) {
    console.error('❌ Periodic sync failed:', error)
  }
}

// Cache Management

async function cleanupCache() {
  const cache = await caches.open(RUNTIME_CACHE)
  const requests = await cache.keys()
  
  for (const request of requests) {
    const response = await cache.match(request)
    if (response) {
      const dateHeader = response.headers.get('date')
      if (dateHeader) {
        const age = Date.now() - new Date(dateHeader).getTime()
        if (age > CACHE_CONFIG.runtime.maxAge) {
          await cache.delete(request)
        }
      }
    }
  }
}

async function refreshCachedData() {
  // Implement data refresh logic
  console.log('🔄 Refreshing cached data...')
}

// IndexedDB helpers for background sync

async function getQueuedActions() {
  // Implement IndexedDB operations
  return []
}

async function removeQueuedAction(id) {
  // Implement IndexedDB operations
}

async function syncAction(action) {
  // Implement action sync logic
}

// Message handling for client communication
self.addEventListener('message', (event) => {
  console.log('📨 Message received from client:', event.data)
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME })
      break
      
    case 'CACHE_UPDATE':
      updateCache(event.data.url)
      break
      
    default:
      console.log('Unknown message type:', event.data.type)
  }
})

async function updateCache(url) {
  try {
    const response = await fetch(url)
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      await cache.put(url, response)
      console.log('✅ Cache updated for:', url)
    }
  } catch (error) {
    console.error('❌ Failed to update cache:', url, error)
  }
}

console.log('🚀 Beauty with AI Precision Service Worker loaded')
`

  // Write service worker
  const workers = [
    { file: 'public/sw.js', content: serviceWorker }
  ]
  
  workers.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create PWA manifest
function createPWAManifest() {
  colorLog('\n📱 Creating PWA manifest...', 'cyan')
  
  const manifest = `{
  "name": "Beauty with AI Precision - Advanced Aesthetic Clinic Platform",
  "short_name": "Beauty AI",
  "description": "AI-powered aesthetic clinic platform with advanced skin analysis, 3D AR visualization, and comprehensive patient management",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ec4899",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "en",
  "dir": "ltr",
  "categories": ["medical", "health", "beauty", "lifestyle"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Dashboard view with patient analytics"
    },
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile skin analysis interface"
    },
    {
      "src": "/screenshots/desktop-2.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "3D AR treatment visualization"
    },
    {
      "src": "/screenshots/mobile-2.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Patient management on mobile"
    }
  ],
  "shortcuts": [
    {
      "name": "New Analysis",
      "short_name": "Analysis",
      "description": "Start a new AI skin analysis",
      "url": "/analysis?source=pwa",
      "icons": [
        {
          "src": "/icons/icon-96x96.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Appointments",
      "short_name": "Calendar",
      "description": "View and manage appointments",
      "url": "/sales/appointments?source=pwa",
      "icons": [
        {
          "src": "/icons/icon-96x96.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Patients",
      "short_name": "Patients",
      "description": "Manage patient records",
      "url": "/clinic/patients?source=pwa",
      "icons": [
        {
          "src": "/icons/icon-96x96.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "AR Simulator",
      "short_name": "AR",
      "description": "3D AR treatment visualization",
      "url": "/ar-simulator?source=pwa",
      "icons": [
        {
          "src": "/icons/icon-96x96.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false,
  "edge_side_panel": {
    "preferred_width": 400
  },
  "launch_handler": {
    "client_mode": "focus-existing"
  },
  "protocol_handlers": [
    {
      "protocol": "web+beauty-ai",
      "url": "/handle-protocol?type=%s"
    }
  ],
  "file_handlers": [
    {
      "action": "/upload",
      "accept": {
        "image/*": [".jpg", ".jpeg", ".png", ".webp"]
      }
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "images",
          "accept": ["image/*"]
        }
      ]
    }
  }
}
`

  // Write manifest
  const manifests = [
    { file: 'public/manifest.json', content: manifest }
  ]
  
  manifests.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create PWA hooks
function createPWAHooks() {
  colorLog('\n🪝 Creating PWA hooks...', 'cyan')
  
  const usePWA = `// PWA Hook for React
import { useState, useEffect, useCallback } from 'react'

export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PWAInfo {
  isInstallable: boolean
  isInstalled: boolean
  isOffline: boolean
  isOnline: boolean
  swVersion: string
  updateAvailable: boolean
  updateReady: boolean
}

export interface PWAOptions {
  enableInstallPrompt?: boolean
  enableUpdateNotification?: boolean
  enableOfflineIndicator?: boolean
  checkInterval?: number
}

export function usePWA(options: PWAOptions = {}) {
  const {
    enableInstallPrompt = true,
    enableUpdateNotification = true,
    enableOfflineIndicator = true,
    checkInterval = 60000 // 1 minute
  } = options

  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null)
  const [pwaInfo, setPWAInfo] = useState<PWAInfo>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    isOnline: navigator.onLine,
    swVersion: '',
    updateAvailable: false,
    updateReady: false
  })

  // Check if app is installed
  const checkIsInstalled = useCallback(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: minimal-ui)').matches ||
           document.referrer.includes('android-app://') ||
           ('standalone' in window && (window as any).standalone)
  }, [])

  // Get service worker version
  const getSWVersion = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          const response = await fetch('/api/pwa/version')
          const data = await response.json()
          return data.version || 'unknown'
        }
      }
      return 'unknown'
    } catch (error) {
      console.error('Failed to get SW version:', error)
      return 'unknown'
    }
  }, [])

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          // Send message to service worker to check for updates
          registration.active?.postMessage({ type: 'CHECK_FOR_UPDATES' })
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }
  }, [])

  // Install PWA
  const install = useCallback(async () => {
    if (!installPrompt) {
      console.warn('Install prompt not available')
      return false
    }

    try {
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setPWAInfo(prev => ({ ...prev, isInstalled: true }))
        setInstallPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to install PWA:', error)
      return false
    }
  }, [installPrompt])

  // Skip waiting for service worker update
  const skipWaiting = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      }
    } catch (error) {
      console.error('Failed to skip waiting:', error)
    }
  }, [])

  // Reload page to apply update
  const reloadForUpdate = useCallback(() => {
    window.location.reload()
  }, [])

  // Listen for beforeinstallprompt event
  useEffect(() => {
    if (!enableInstallPrompt) return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as any)
      setPwaInfo(prev => ({ ...prev, isInstallable: true }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [enableInstallPrompt])

  // Listen for app installed event
  useEffect(() => {
    if (!enableInstallPrompt) return

    const handleAppInstalled = () => {
      setPwaInfo(prev => ({ ...prev, isInstalled: true }))
      setInstallPrompt(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [enableInstallPrompt])

  // Listen for online/offline events
  useEffect(() => {
    if (!enableOfflineIndicator) return

    const handleOnline = () => {
      setPwaInfo(prev => ({ ...prev, isOnline: true, isOffline: false }))
    }

    const handleOffline = () => {
      setPwaInfo(prev => ({ ...prev, isOnline: false, isOffline: true }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [enableOfflineIndicator])

  // Listen for service worker messages
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleMessage = (event: MessageEvent) => {
      switch (event.data.type) {
        case 'UPDATE_AVAILABLE':
          setPwaInfo(prev => ({ ...prev, updateAvailable: true }))
          break
        case 'UPDATE_READY':
          setPwaInfo(prev => ({ ...prev, updateReady: true }))
          break
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [])

  // Initialize PWA info
  useEffect(() => {
    const initializePWA = async () => {
      const isInstalled = checkIsInstalled()
      const swVersion = await getSWVersion()
      
      setPwaInfo(prev => ({
        ...prev,
        isInstalled,
        swVersion
      }))

      // Check for updates if enabled
      if (enableUpdateNotification) {
        checkForUpdates()
      }
    }

    initializePWA()
  }, [checkIsInstalled, getSWVersion, enableUpdateNotification, checkForUpdates])

  // Periodic update check
  useEffect(() => {
    if (!enableUpdateNotification || checkInterval <= 0) return

    const interval = setInterval(() => {
      checkForUpdates()
    }, checkInterval)

    return () => clearInterval(interval)
  }, [enableUpdateNotification, checkInterval, checkForUpdates])

  return {
    installPrompt,
    pwaInfo,
    install,
    skipWaiting,
    reloadForUpdate,
    checkForUpdates
  }
}

export default usePWA
`

  const useOfflineSync = `// Offline Sync Hook
import { useState, useEffect, useCallback } from 'react'

export interface SyncAction {
  id: string
  type: string
  data: any
  timestamp: number
  retryCount: number
}

export interface OfflineSyncOptions {
  enableBackgroundSync?: boolean
  maxRetries?: number
  retryDelay?: number
  storageKey?: string
}

export function useOfflineSync(options: OfflineSyncOptions = {}) {
  const {
    enableBackgroundSync = true,
    maxRetries = 3,
    retryDelay = 5000,
    storageKey = 'offline-sync-queue'
  } = options

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncQueue, setSyncQueue] = useState<SyncAction[]>([])
  const [isSyncing, setIsSyncing] = useState(false)

  // Get sync queue from storage
  const getSyncQueue = useCallback(async (): Promise<SyncAction[]> => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get sync queue:', error)
      return []
    }
  }, [storageKey])

  // Save sync queue to storage
  const saveSyncQueue = useCallback(async (queue: SyncAction[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(queue))
    } catch (error) {
      console.error('Failed to save sync queue:', error)
    }
  }, [storageKey])

  // Add action to sync queue
  const queueAction = useCallback(async (type: string, data: any) => {
    const action: SyncAction = {
      id: \`sync_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    }

    const queue = await getSyncQueue()
    queue.push(action)
    await saveSyncQueue(queue)
    setSyncQueue(queue)

    console.log('Action queued for sync:', action)
    return action.id
  }, [getSyncQueue, saveSyncQueue])

  // Remove action from sync queue
  const removeAction = useCallback(async (actionId: string) => {
    const queue = await getSyncQueue()
    const filteredQueue = queue.filter(action => action.id !== actionId)
    await saveSyncQueue(filteredQueue)
    setSyncQueue(filteredQueue)
  }, [getSyncQueue, saveSyncQueue])

  // Sync single action
  const syncAction = useCallback(async (action: SyncAction): Promise<boolean> => {
    try {
      console.log('Syncing action:', action)

      switch (action.type) {
        case 'CREATE_PATIENT':
          // Implement patient creation sync
          break
        case 'UPDATE_APPOINTMENT':
          // Implement appointment update sync
          break
        case 'SUBMIT_ANALYSIS':
          // Implement analysis submission sync
          break
        default:
          console.warn('Unknown sync action type:', action.type)
          return false
      }

      await removeAction(action.id)
      return true
    } catch (error) {
      console.error('Failed to sync action:', action, error)
      
      // Increment retry count
      action.retryCount++
      
      if (action.retryCount >= maxRetries) {
        console.error('Max retries exceeded for action:', action.id)
        await removeAction(action.id)
        return false
      }
      
      // Update action in queue
      const queue = await getSyncQueue()
      const updatedQueue = queue.map(a => a.id === action.id ? action : a)
      await saveSyncQueue(updatedQueue)
      setSyncQueue(updatedQueue)
      
      return false
    }
  }, [getSyncQueue, saveSyncQueue, removeAction, maxRetries])

  // Sync all queued actions
  const syncAll = useCallback(async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    
    try {
      const queue = await getSyncQueue()
      
      for (const action of queue) {
        const success = await syncAction(action)
        
        if (!success) {
          // Delay retry for failed actions
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
      
      console.log('Sync completed')
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, getSyncQueue, syncAction, retryDelay])

  // Clear sync queue
  const clearQueue = useCallback(async () => {
    await saveSyncQueue([])
    setSyncQueue([])
  }, [saveSyncQueue])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && enableBackgroundSync) {
      syncAll()
    }
  }, [isOnline, enableBackgroundSync, syncAll])

  // Load initial sync queue
  useEffect(() => {
    const loadQueue = async () => {
      const queue = await getSyncQueue()
      setSyncQueue(queue)
    }
    
    loadQueue()
  }, [getSyncQueue])

  return {
    isOnline,
    isSyncing,
    syncQueue,
    queueAction,
    syncAll,
    clearQueue
  }
}

export default useOfflineSync
`

  // Write hooks
  const hooks = [
    { file: 'hooks/pwa/use-pwa.ts', content: usePWA },
    { file: 'hooks/pwa/use-offline-sync.ts', content: useOfflineSync }
  ]
  
  hooks.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create PWA components
function createPWAComponents() {
  colorLog('\n🧩 Creating PWA components...', 'cyan')
  
  const installPrompt = `'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePWA } from '@/hooks/pwa/use-pwa'
import { 
  Download, 
  X, 
  Smartphone, 
  Zap, 
  Shield,
  Wifi,
  Bell
} from 'lucide-react'

interface PWAInstallPromptProps {
  className?: string
  showClose?: boolean
  position?: 'top' | 'bottom' | 'center'
}

export function PWAInstallPrompt({ 
  className = '',
  showClose = true,
  position = 'bottom'
}: PWAInstallPromptProps) {
  const { installPrompt, install, pwaInfo } = usePWA()
  const [dismissed, setDismissed] = React.useState(false)

  // Don't show if already installed, not installable, or dismissed
  if (pwaInfo.isInstalled || !pwaInfo.isInstallable || dismissed) {
    return null
  }

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      setDismissed(true)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    // Store dismissal in localStorage
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const positionClasses = {
    top: 'top-4 left-4 right-4',
    bottom: 'bottom-4 left-4 right-4',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  }

  return (
    <div className={\`fixed z-50 \${positionClasses[position]} \${className}\`}>
      <Card className="shadow-lg border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Smartphone className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">
                  Install Beauty AI App
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Get the full experience on your device
                </CardDescription>
              </div>
            </div>
            {showClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Works Offline</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Push Notifications</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="text-gray-600"
            >
              Maybe Later
            </Button>
          </div>
          
          <div className="mt-3 flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              Free • No Ads • No Tracking
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAInstallPrompt
`

  const offlineUI = `'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePWA } from '@/hooks/pwa/use-pwa'
import { 
  WifiOff, 
  RefreshCw, 
  Database,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface OfflineUIProps {
  className?: string
  showRetry?: boolean
  customMessage?: string
}

export function OfflineUI({ 
  className = '',
  showRetry = true,
  customMessage
}: OfflineUIProps) {
  const { pwaInfo } = usePWA()
  const [retryCount, setRetryCount] = React.useState(0)

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  if (!pwaInfo.isOffline) {
    return null
  }

  return (
    <div className={\`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 \${className}\`}>
      <Card className="w-full max-w-md shadow-2xl border-orange-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            You're Offline
          </CardTitle>
          <CardDescription className="text-gray-600">
            {customMessage || 'No internet connection detected. Some features may be unavailable.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>What's happening:</strong> The app is running in offline mode. 
              Cached data is still available, but real-time features are disabled.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Database className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Cached Data Available</p>
                <p className="text-xs text-gray-600">Recent patient data and analysis results</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Auto-sync When Online</p>
                <p className="text-xs text-gray-600">Changes will sync automatically when connection restores</p>
              </div>
            </div>
          </div>

          {showRetry && (
            <div className="space-y-2">
              <Button
                onClick={handleRetry}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={retryCount > 2}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryCount > 2 ? 'Try Again Later' : 'Retry Connection'}
              </Button>
              
              {retryCount > 0 && retryCount <= 2 && (
                <p className="text-xs text-center text-gray-500">
                  Retry attempts: {retryCount}/3
                </p>
              )}
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">
              The app will automatically reconnect when internet is available
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OfflineUI
`

  const updateNotification = `'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePWA } from '@/hooks/pwa/use-pwa'
import { 
  Download, 
  RefreshCw, 
  Zap,
  X,
  Info
} from 'lucide-react'

interface PWAUpdateNotificationProps {
  className?: string
  showClose?: boolean
  autoHide?: boolean
  hideDelay?: number
}

export function PWAUpdateNotification({ 
  className = '',
  showClose = true,
  autoHide = false,
  hideDelay = 10000
}: PWAUpdateNotificationProps) {
  const { pwaInfo, skipWaiting, reloadForUpdate } = usePWA()
  const [dismissed, setDismissed] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)

  // Auto-hide after delay
  React.useEffect(() => {
    if (autoHide && pwaInfo.updateReady && !dismissed) {
      const timer = setTimeout(() => {
        setDismissed(true)
      }, hideDelay)
      
      return () => clearTimeout(timer)
    }
  }, [autoHide, hideDelay, pwaInfo.updateReady, dismissed])

  // Don't show if no update available or dismissed
  if (!pwaInfo.updateReady || dismissed) {
    return null
  }

  const handleUpdate = async () => {
    setUpdating(true)
    
    try {
      await skipWaiting()
      reloadForUpdate()
    } catch (error) {
      console.error('Failed to update app:', error)
      setUpdating(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  return (
    <div className={\`fixed top-4 right-4 z-50 max-w-sm \${className}\`}>
      <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg animate-pulse">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">
                  App Update Available
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  A new version of Beauty AI is ready to install
                </CardDescription>
              </div>
            </div>
            {showClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>What's new:</strong> Performance improvements, bug fixes, and enhanced features.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Faster loading times</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <RefreshCw className="h-4 w-4 text-green-500" />
              <span>Improved reliability</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Info className="h-4 w-4 text-blue-500" />
              <span>Latest security updates</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleUpdate}
              disabled={updating}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium"
            >
              {updating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Update Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="text-gray-600"
              disabled={updating}
            >
              Later
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Update will install automatically when you close the app
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PWAUpdateNotification
`

  // Write components
  const components = [
    { file: 'components/pwa/install-prompt/pwa-install-prompt.tsx', content: installPrompt },
    { file: 'components/pwa/offline-ui/offline-ui.tsx', content: offlineUI },
    { file: 'components/pwa/update-notification/pwa-update-notification.tsx', content: updateNotification }
  ]
  
  components.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create PWA configuration
function createPWAConfig() {
  colorLog('\n⚙️ Creating PWA configuration...', 'cyan')
  
  const config = `// PWA Configuration
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
        '\\.(png|jpg|jpeg|svg|gif|webp|ico)$',
        '\\.(woff|woff2|ttf|eot)$'
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
`

  // Write configuration
  const configs = [
    { file: 'config/pwa/index.ts', content: config }
  ]
  
  configs.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create offline page
function createOfflinePage() {
  colorLog('\n📄 Creating offline page...', 'cyan')
  
  const offlinePage = `import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  WifiOff, 
  RefreshCw, 
  Database,
  Clock,
  Smartphone,
  Camera,
  Users
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Offline - Beauty with AI Precision',
  description: 'You are currently offline. Some features may be unavailable.',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Offline Card */}
        <Card className="shadow-xl border-orange-200 bg-white">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="h-10 w-10 text-orange-600" />
            </div>
            <CardTitle className="text-3xl text-gray-900 font-bold">
              You're Offline
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 max-w-md mx-auto">
              No internet connection detected. Don't worry - you can still access some features!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <WifiOff className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>What's happening:</strong> The app is running in offline mode using cached data. 
                Real-time features are disabled until you reconnect.
              </AlertDescription>
            </Alert>

            {/* Available Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Database className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900">Cached Data Available</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Access recent patient records, analysis results, and treatment history
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Camera className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900">Basic Analysis</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Perform skin analysis (results will sync when online)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Users className="h-6 w-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-purple-900">Patient Management</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    View and edit patient information (changes sync automatically)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-6 w-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Auto-Sync Queue</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    All changes will sync when connection is restored
                  </p>
                </div>
              </div>
            </div>

            {/* Limited Features */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Currently Unavailable</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time appointments and booking</li>
                <li>• Live chat and video calls</li>
                <li>• 3D AR simulator (requires internet)</li>
                <li>• Advanced AI analysis features</li>
                <li>• Push notifications</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Reconnecting
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Go Back
              </Button>
            </div>

            {/* Tips */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                <strong>💡 Pro tip:</strong> The app will automatically reconnect when internet is available
              </p>
              <p className="text-xs text-gray-500">
                Your work is saved locally and will sync to the cloud when you're back online
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PWA Install Prompt */}
        <Card className="shadow-lg border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Smartphone className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">
                  Install for Better Offline Experience
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Get the full PWA experience with enhanced offline capabilities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Benefits:</span> Faster loading, offline access, push notifications
              </div>
              <Button
                onClick={() => {
                  // Trigger PWA install prompt
                  const event = new CustomEvent('pwa-install-request')
                  window.dispatchEvent(event)
                }}
                size="sm"
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                Install App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
`

  // Write offline page
  const pages = [
    { file: 'app/[locale]/offline/page.tsx', content: offlinePage }
  ]
  
  pages.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create PWA utilities
function createPWAUtils() {
  colorLog('\n🛠️ Creating PWA utilities...', 'cyan')
  
  const utils = `// PWA Utilities
import { pwaConfig } from '@/config/pwa'

// Service Worker Utilities
export class ServiceWorkerUtils {
  static async register() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: pwaConfig.serviceWorker.scope
      })

      console.log('Service Worker registered:', registration)
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              window.dispatchEvent(new CustomEvent('pwa-update-available'))
            }
          })
        }
      })

      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }

  static async unregister() {
    if (!('serviceWorker' in navigator)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.unregister()
        console.log('Service Worker unregistered')
      }
    } catch (error) {
      console.error('Service Worker unregistration failed:', error)
    }
  }

  static async getRegistration() {
    if (!('serviceWorker' in navigator)) {
      return null
    }

    return await navigator.serviceWorker.getRegistration()
  }

  static async skipWaiting() {
    const registration = await this.getRegistration()
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  static async getVersion() {
    const registration = await this.getRegistration()
    if (registration && registration.active) {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel()
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version)
        }
        registration.active.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        )
      })
    }
    return 'unknown'
  }
}

// Cache Utilities
export class CacheUtils {
  static async clearCache(cacheName: string) {
    try {
      await caches.delete(cacheName)
      console.log('Cache cleared:', cacheName)
    } catch (error) {
      console.error('Failed to clear cache:', cacheName, error)
    }
  }

  static async clearAllCaches() {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log('All caches cleared')
    } catch (error) {
      console.error('Failed to clear all caches:', error)
    }
  }

  static async getCacheSize(cacheName: string) {
    try {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      let size = 0
      
      for (const request of requests) {
        const response = await cache.match(request)
        if (response) {
          const blob = await response.blob()
          size += blob.size
        }
      }
      
      return size
    } catch (error) {
      console.error('Failed to get cache size:', cacheName, error)
      return 0
    }
  }

  static async updateCache(url: string) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        const cache = await caches.open('runtime')
        await cache.put(url, response)
        console.log('Cache updated:', url)
      }
    } catch (error) {
      console.error('Failed to update cache:', url, error)
    }
  }
}

// Install Prompt Utilities
export class InstallPromptUtils {
  private static deferredPrompt: any = null

  static init() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()
      this.deferredPrompt = event
      window.dispatchEvent(new CustomEvent('pwa-install-available'))
    })

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null
      window.dispatchEvent(new CustomEvent('pwa-installed'))
    })
  }

  static async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false
    }

    try {
      await this.deferredPrompt.prompt()
      const result = await this.deferredPrompt.userChoice
      
      if (result.outcome === 'accepted') {
        this.deferredPrompt = null
        return true
      }
      
      return false
    } catch (error) {
      console.error('Install prompt failed:', error)
      return false
    }
  }

  static isInstallAvailable(): boolean {
    return this.deferredPrompt !== null
  }

  static isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: minimal-ui)').matches ||
           ('standalone' in window && (window as any).standalone)
  }
}

// Push Notification Utilities
export class PushUtils {
  static async subscribeToPush(registration: ServiceWorkerRegistration) {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(pwaConfig.push.vapidPublicKey!)
      })

      console.log('Push subscription:', subscription)
      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  static async unsubscribeFromPush() {
    try {
      const registration = await ServiceWorkerUtils.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          console.log('Unsubscribed from push notifications')
        }
      }
    } catch (error) {
      console.error('Push unsubscription failed:', error)
    }
  }

  static async getSubscription() {
    try {
      const registration = await ServiceWorkerUtils.getRegistration()
      if (registration) {
        return await registration.pushManager.getSubscription()
      }
    } catch (error) {
      console.error('Failed to get push subscription:', error)
    }
    return null
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }

  static isSupported(): boolean {
    return 'PushManager' in window && 'Notification' in window
  }

  private static urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }
}

// Background Sync Utilities
export class BackgroundSyncUtils {
  static async registerSync(registration: ServiceWorkerRegistration, tag: string = 'background-sync') {
    if ('serviceWorker' in navigator && 'sync' in registration) {
      try {
        await registration.sync.register(tag)
        console.log('Background sync registered:', tag)
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }
  }

  static async registerPeriodicSync(registration: ServiceWorkerRegistration, tag: string, minInterval: number) {
    if ('serviceWorker' in navigator && 'periodicSync' in registration) {
      try {
        await registration.periodicSync.register(tag, {
          minInterval
        })
        console.log('Periodic sync registered:', tag)
      } catch (error) {
        console.error('Periodic sync registration failed:', error)
      }
    }
  }

  static isSupported(): boolean {
    return 'serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype
  }
}

// Network Utilities
export class NetworkUtils {
  static isOnline(): boolean {
    return navigator.onLine
  }

  static getConnectionType(): string {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection
    
    return connection ? connection.effectiveType || 'unknown' : 'unknown'
  }

  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  static addConnectionListener(callback: (online: boolean) => void) {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }
}

// Device Utilities
export class DeviceUtils {
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  static isTablet(): boolean {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent)
  }

  static isDesktop(): boolean {
    return !this.isMobile() && !this.isTablet()
  }

  static getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      isDesktop: this.isDesktop(),
      connectionType: NetworkUtils.getConnectionType()
    }
  }

  static getScreenInfo() {
    return {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      orientation: (screen.orientation || {}).type || 'unknown'
    }
  }
}

// Performance Utilities
export class PerformanceUtils {
  static async measurePageLoad() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      return {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        total: navigation.loadEventEnd - navigation.navigationStart
      }
    }
    
    return null
  }

  static async measureResourceTiming(url: string) {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const resource = resources.find(r => r.name === url)
      
      if (resource) {
        return {
          dns: resource.domainLookupEnd - resource.domainLookupStart,
          tcp: resource.connectEnd - resource.connectStart,
          request: resource.responseStart - resource.requestStart,
          response: resource.responseEnd - resource.responseStart,
          total: resource.responseEnd - resource.requestStart
        }
      }
    }
    
    return null
  }

  static getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      }
    }
    
    return null
  }
}

// Initialize PWA utilities
export function initializePWA() {
  // Register service worker
  ServiceWorkerUtils.register()
  
  // Initialize install prompt
  InstallPromptUtils.init()
  
  console.log('PWA utilities initialized')
}

export default {
  ServiceWorkerUtils,
  CacheUtils,
  InstallPromptUtils,
  PushUtils,
  BackgroundSyncUtils,
  NetworkUtils,
  DeviceUtils,
  PerformanceUtils,
  initializePWA
}
`

  // Write utilities
  const utilityFiles = [
    { file: 'utils/pwa/index.ts', content: utils }
  ]
  
  utilityFiles.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Update Next.js configuration for PWA
function updateNextConfig() {
  colorLog('\n⚙️ Updating Next.js configuration for PWA...', 'cyan')
  
  try {
    const nextConfigPath = path.join(process.cwd(), 'next.config.js')
    
    if (fs.existsSync(nextConfigPath)) {
      let configContent = fs.readFileSync(nextConfigPath, 'utf8')
      
      // Check if PWA is already configured
      if (!configContent.includes('withPWA')) {
        // Add PWA import and configuration
        const pwaConfig = `
// PWA Configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*\\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    {
      urlPattern: /^https?.*\\.(woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      urlPattern: /^\\/api\\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60 // 5 minutes
        }
      }
    }
  ]
})
`
        
        // Add import at the top
        configContent = pwaConfig + configContent
        
        // Wrap the module.exports with withPWA
        configContent = configContent.replace(
          'module.exports = nextConfig',
          'module.exports = withPWA(nextConfig)'
        )
        
        fs.writeFileSync(nextConfigPath, configContent)
        colorLog('✅ Next.js configuration updated for PWA', 'green')
      } else {
        colorLog('✅ PWA already configured in Next.js', 'blue')
      }
    } else {
      colorLog('⚠️ next.config.js not found', 'yellow')
    }
  } catch (error) {
    colorLog(`⚠️ Could not update Next.js config: ${error.message}`, 'yellow')
  }
}

// Update package.json with PWA dependencies
function updatePackageDependencies() {
  colorLog('\n📦 Updating package.json with PWA dependencies...', 'cyan')
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Add PWA dependencies
    const newDependencies = {
      'next-pwa': '^5.6.0',
      'workbox-webpack-plugin': '^6.6.1',
      'web-push': '^3.6.6'
    }
    
    // Merge dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...newDependencies
    }
    
    // Add PWA dev dependencies
    const newDevDependencies = {
      '@types/web-push': '^3.6.3'
    }
    
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...newDevDependencies
    }
    
    // Add PWA scripts
    const newScripts = {
      'pwa:generate': 'pwa-assets-generator',
      'pwa:serve': 'next dev && npx workbox-cli serve',
      'pwa:build': 'next build && npx workbox-cli injectManifest'
    }
    
    packageJson.scripts = {
      ...packageJson.scripts,
      ...newScripts
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    colorLog('✅ Package.json updated with PWA dependencies and scripts', 'green')
    
  } catch (error) {
    colorLog(`⚠️ Could not update package.json: ${error.message}`, 'yellow')
  }
}

// Create PWA documentation
function createPWADocumentation() {
  colorLog('\n📚 Creating PWA documentation...', 'cyan')
  
  const docs = `# Progressive Web App (PWA) Features

## 🚀 Beauty with AI Precision - PWA Implementation

Beauty with AI Precision is a fully-featured Progressive Web App that provides native app-like experiences across all devices.

### ✨ Key PWA Features

#### 📱 Installable Application
- **One-click Installation**: Install directly from browser without app store
- **Home Screen Integration**: Appears on device home screen like native apps
- **App Shortcuts**: Quick access to key features from home screen
- **Splash Screens**: Professional loading screens on app launch

#### 🌐 Offline Functionality
- **Offline-First Architecture**: Core features work without internet
- **Smart Caching**: Intelligent caching strategies for optimal performance
- **Background Sync**: Automatic data synchronization when online
- **Offline Detection**: User-friendly offline indicators and fallbacks

#### ⚡ Performance Optimization
- **Instant Loading**: Sub-second app startup times
- **Resource Caching**: Static assets cached for instant access
- **Service Worker**: Advanced background processing
- **Bundle Optimization**: Optimized JavaScript and CSS loading

#### 🔔 Push Notifications
- **Real-time Alerts**: Appointment reminders, updates, and notifications
- **Customizable Preferences**: User-controlled notification settings
- **Rich Notifications**: Interactive notifications with actions
- **Background Processing**: Notifications work even when app is closed

#### 🔄 Automatic Updates
- **Seamless Updates**: Automatic app updates in background
- **Update Notifications**: User-friendly update prompts
- **Version Management**: Controlled rollout of new features
- **Rollback Support**: Ability to rollback problematic updates

## 🛠️ Technical Implementation

### Service Worker Architecture
\`\`\`javascript
// Advanced caching strategies
const strategies = {
  cacheFirst: async (request) => {
    // Cache first, fallback to network
  },
  networkFirst: async (request) => {
    // Network first, fallback to cache
  },
  staleWhileRevalidate: async (request) => {
    // Serve from cache, update in background
  }
}
\`\`\`

### Caching Configuration
- **Static Assets**: 7 days cache for images, fonts, icons
- **API Responses**: 5 minutes cache for dynamic data
- **Pages**: 24 hours cache for HTML content
- **Custom Patterns**: Configurable caching rules per route

### Offline Data Management
- **IndexedDB Storage**: Local data persistence
- **Sync Queue**: Background sync for offline actions
- **Conflict Resolution**: Smart handling of data conflicts
- **Storage Limits**: Respect device storage constraints

## 📋 Installation Guide

### For Users
1. **Visit the App**: Open Beauty with AI Precision in your browser
2. **Install Prompt**: Look for the "Install App" banner or button
3. **Confirm Installation**: Click "Install" to add to home screen
4. **Launch from Home**: Access like any native app

### For Developers
1. **Install Dependencies**:
   \`\`\`bash
   pnpm add next-pwa workbox-webpack-plugin web-push
   \`\`\`

2. **Configure PWA**:
   \`\`\`javascript
   // next.config.js
   const withPWA = require('next-pwa')({
     dest: 'public',
     register: true,
     skipWaiting: true
   })
   
   module.exports = withPWA(nextConfig)
   \`\`\`

3. **Add Service Worker**:
   \`\`\`javascript
   // public/sw.js
   // Service worker implementation
   \`\`\`

4. **Create Manifest**:
   \`\`\`json
   // public/manifest.json
   {
     "name": "Beauty with AI Precision",
     "short_name": "Beauty AI",
     "display": "standalone",
     "theme_color": "#ec4899"
   }
   \`\`\`

## 🔧 Configuration Options

### Environment Variables
\`\`\`bash
# PWA Settings
NEXT_PUBLIC_PWA_ENABLED=true
NEXT_PUBLIC_PWA_UPDATE_INTERVAL=3600000
NEXT_PUBLIC_PWA_CACHE_STRATEGY=staleWhileRevalidate

# Push Notifications
NEXT_PUBLIC_PWA_PUSH_ENABLED=true
NEXT_PUBLIC_PWA_PUSH_PUBLIC_KEY=your-public-key
PWA_PUSH_SERVER_KEY=your-server-key

# Background Sync
NEXT_PUBLIC_PWA_SYNC_INTERVAL=300000
NEXT_PUBLIC_PWA_SYNC_MAX_QUEUE_SIZE=100

# Install Prompt
NEXT_PUBLIC_PWA_INSTALL_DELAY=30000
NEXT_PUBLIC_PWA_INSTALL_MAX_SHOW_COUNT=3
\`\`\`

### Cache Strategies
- **Cache First**: Best for static assets, offline-first
- **Network First**: Best for dynamic content, freshness prioritized
- **Stale While Revalidate**: Best for balanced performance
- **Network Only**: Best for real-time data
- **Cache Only**: Best for offline fallbacks

## 📱 Device Compatibility

### Supported Platforms
- **Desktop**: Chrome, Edge, Firefox, Safari (limited)
- **Mobile**: Chrome Android, Safari iOS (limited), Samsung Internet
- **Tablet**: iPadOS, Android tablets

### Feature Support
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Workers | ✅ | ✅ | ✅ | ✅ |
| Web App Manifest | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ❌ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| Install Prompt | ✅ | ✅ | ✅ | ✅ |

## 🎯 Best Practices

### Performance Optimization
1. **Optimize Images**: Use WebP format and responsive images
2. **Minimize Bundle Size**: Code splitting and tree shaking
3. **Cache Strategically**: Balance freshness and performance
4. **Monitor Performance**: Use performance metrics and analytics

### User Experience
1. **Progressive Enhancement**: Ensure core functionality works offline
2. **Clear Indicators**: Show online/offline status
3. **Smooth Updates**: Non-disruptive update process
4. **Respect Preferences**: Honor user notification settings

### Security Considerations
1. **HTTPS Required**: PWA features need secure connections
2. **CSP Headers**: Content Security Policy for protection
3. **Service Worker Scope**: Limit service worker permissions
4. **Data Validation**: Validate all cached data

## 📊 Analytics and Monitoring

### PWA Metrics
- **Installation Rate**: Track app installations
- **Offline Usage**: Monitor offline feature usage
- **Performance Metrics**: Load times and cache hit rates
- **Update Adoption**: Track update installation rates

### Monitoring Tools
- **Performance API**: Built-in browser performance metrics
- **Service Worker Events**: Track service worker lifecycle
- **Custom Analytics**: PWA-specific event tracking
- **Error Reporting**: Comprehensive error monitoring

## 🔍 Troubleshooting

### Common Issues

#### Service Worker Not Registering
1. Check HTTPS requirement
2. Verify service worker scope
3. Check browser console for errors
4. Ensure valid service worker file

#### App Not Installing
1. Verify manifest configuration
2. Check service worker registration
3. Ensure HTTPS connection
4. Test on supported browsers

#### Cache Issues
1. Clear browser cache
2. Update cache version
3. Check cache storage limits
4. Verify cache strategies

#### Push Notifications Not Working
1. Check notification permissions
2. Verify VAPID keys
3. Test service worker push handler
4. Check browser support

### Debug Tools
- **Chrome DevTools**: Application tab for PWA debugging
- **Firefox Developer Tools**: Storage and Service Worker tabs
- **Safari Web Inspector**: Limited PWA debugging support
- **Lighthouse**: PWA audit and performance testing

## 🚀 Deployment

### Production Checklist
- [ ] HTTPS configured
- [ ] Service worker registered
- [ ] Web app manifest valid
- [ ] PWA icons generated
- [ ] Cache strategies configured
- [ ] Push notifications set up
- [ ] Offline pages created
- [ ] Performance optimized
- [ ] Analytics implemented
- [ ] Testing completed

### Deployment Steps
1. **Build Application**: \`pnpm build\`
2. **Generate Assets**: \`pnpm pwa:generate\`
3. **Test PWA Features**: Use Lighthouse and browser tools
4. **Deploy to Production**: Deploy with HTTPS
5. **Verify Installation**: Test install prompt and functionality
6. **Monitor Performance**: Set up analytics and monitoring

## 📚 Additional Resources

### Documentation
- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google PWA Checklist](https://developers.google.com/web/progressive-web-apps/checklist)
- [Next.js PWA Documentation](https://nextjs.org/docs/advanced-features/pwa)

### Tools
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Workbox](https://developers.google.com/web/tools/workbox)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)

### Examples
- [PWA Examples](https://github.com/pwa-builder/PWA-Examples)
- [Service Worker Recipes](https://github.com/GoogleChromeLabs/serviceworker-recipes)
- [Progressive Web Apps Samples](https://github.com/GoogleChrome/samples/tree/gh-pages/pwa)

---

**Beauty with AI Precision delivers a premium PWA experience with offline capabilities, push notifications, and native app-like performance.**

📱 [Install PWA Now](/)  
🚀 [View Features](./features.md)  
📊 [Check Performance](./performance.md)  
📞 [Get Support](https://support.beauty-with-ai-precision.com)
`

  // Write documentation
  const documentation = [
    { file: 'docs/pwa/README.md', content: docs }
  ]
  
  documentation.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Main execution function
async function main() {
  colorLog('📱 Setting up Progressive Web App (PWA) Features', 'bright')
  colorLog('='.repeat(60), 'cyan')
  
  try {
    createPWADirectories()
    createServiceWorker()
    createPWAManifest()
    createPWAHooks()
    createPWAComponents()
    createPWAConfig()
    createOfflinePage()
    createPWAUtils()
    updateNextConfig()
    updatePackageDependencies()
    createPWADocumentation()
    
    colorLog('\n' + '='.repeat(60), 'green')
    colorLog('🎉 Progressive Web App (PWA) Features setup completed!', 'bright')
    colorLog('\n📋 Next Steps:', 'cyan')
    colorLog('1. Install PWA dependencies: pnpm install', 'blue')
    colorLog('2. Generate app icons and assets', 'blue')
    colorLog('3. Configure environment variables for PWA', 'blue')
    colorLog('4. Test PWA installation and features', 'blue')
    colorLog('5. Set up push notification server', 'blue')
    
    colorLog('\n📱 PWA Features Implemented:', 'yellow')
    colorLog('• Installable app with home screen integration', 'white')
    colorLog('• Offline-first architecture with smart caching', 'white')
    colorLog('• Push notifications with rich interactive features', 'white')
    colorLog('• Background sync for offline data synchronization', 'white')
    colorLog('• Automatic updates with user-friendly prompts', 'white')
    colorLog('• Performance optimization with service workers', 'white')
    
    colorLog('\n🚀 Advanced Capabilities:', 'cyan')
    colorLog('• Multiple caching strategies (cache-first, network-first, stale-while-revalidate)', 'blue')
    colorLog('• IndexedDB for offline data storage and sync queue', 'blue')
    colorLog('• App shortcuts for quick access to key features', 'blue')
    colorLog('• Share target integration for easy content sharing', 'blue')
    colorLog('• File handlers for direct file opening', 'blue')
    colorLog('• Protocol handlers for custom URL schemes', 'blue')
    
    colorLog('\n🔧 Developer Tools:', 'green')
    colorLog('• React hooks for PWA functionality (usePWA, useOfflineSync)', 'white')
    colorLog('• TypeScript utilities for service worker management', 'white')
    colorLog('• Configurable PWA settings and environment variables', 'white')
    colorLog('• Performance monitoring and analytics integration', 'white')
    colorLog('• Comprehensive documentation and examples', 'white')
    
    colorLog('\n📊 Cross-Platform Support:', 'magenta')
    colorLog('• Desktop browsers (Chrome, Edge, Firefox)', 'white')
    colorLog('• Mobile browsers (Chrome Android, Safari iOS)', 'white')
    colorLog('• Tablet devices with responsive design', 'white')
    colorLog('• Progressive enhancement for older browsers', 'white')
    
  } catch (error) {
    colorLog(`\n❌ Setup failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run the setup
if (require.main === module) {
  main()
}

module.exports = {
  main,
  createPWADirectories,
  createServiceWorker,
  createPWAManifest,
  createPWAHooks,
  createPWAComponents,
  createPWAConfig,
  createOfflinePage,
  createPWAUtils,
  updateNextConfig,
  updatePackageDependencies,
  createPWADocumentation
}
