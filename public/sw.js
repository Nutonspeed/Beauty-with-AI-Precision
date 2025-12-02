// Beauty with AI Precision - Service Worker
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
  api: /^\/api\/(?!auth).*$/,
  // Cache images and assets
  assets: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
  // Cache fonts
  fonts: /\.(woff|woff2|ttf|eot)$/i
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
