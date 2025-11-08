/**
 * Service Worker for Multi-Clinic Sales Platform
 * Supports: 120 sales staff offline mode with clinic-scoped data
 * 
 * Features:
 * - Smart caching strategy (cache-first for images, network-first for API)
 * - IndexedDB integration for offline data
 * - Background sync for pending actions
 * - Push notifications for sales updates
 */

const CACHE_NAME = 'ai367bar-v2';
const RUNTIME_CACHE = 'ai367bar-runtime-v2';
const IMAGE_CACHE = 'ai367bar-images-v2';

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/sales/dashboard',
  '/analysis',
  '/leads',
  '/offline.html',
  '/manifest.json',
];

// Cache strategies
const CACHE_FIRST_PATTERNS = [
  /\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
  /\.(woff|woff2|ttf|eot)$/,
  /\/icons\//,
  /\/images\//,
];

const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /supabase/,
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[ServiceWorker] Pre-caching app shell');
        return cache.addAll(PRECACHE_URLS);
      }),
      caches.open(IMAGE_CACHE),
      caches.open(RUNTIME_CACHE),
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate event');
  
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            console.log('[ServiceWorker] Deleting old cache:', cacheToDelete);
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Determine caching strategy
  const isCacheFirst = CACHE_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname));
  const isNetworkFirst = NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname));

  if (isCacheFirst) {
    // Cache-first strategy (for images, fonts)
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (isNetworkFirst) {
    // Network-first strategy (for API calls)
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  } else {
    // Stale-while-revalidate (for pages)
    event.respondWith(staleWhileRevalidateStrategy(request, RUNTIME_CACHE));
  }
});

/**
 * Cache-first strategy
 */
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('[ServiceWorker] Serving from cache:', request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Cache-first fetch failed:', error);
    return new Response('', {
      status: 408,
      statusText: 'Request Timeout',
    });
  }
}

/**
 * Network-first strategy
 */
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'You are currently offline' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we already returned cache
    return null;
  });

  // Return cached response immediately, update cache in background
  if (cachedResponse) {
    fetchPromise; // Don't await, just update in background
    return cachedResponse;
  }

  // No cache, wait for network
  return fetchPromise.then((response) => {
    if (response) {
      return response;
    }
    
    // Network failed and no cache
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    return new Response('', {
      status: 408,
      statusText: 'Request Timeout',
    });
  });
}

// Background Sync - sync queued actions when online
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-all') {
    event.waitUntil(syncAllPendingActions());
  } else if (event.tag.startsWith('sync-')) {
    const actionType = event.tag.replace('sync-', '');
    event.waitUntil(syncPendingActionsByType(actionType));
  }
});

/**
 * Sync all pending actions
 */
async function syncAllPendingActions() {
  try {
    const db = await openDB();
    const actions = await getAllPendingActions(db);
    
    console.log(`[ServiceWorker] Syncing ${actions.length} pending actions`);
    
    for (const action of actions) {
      await syncAction(action, db);
    }
    
    console.log('[ServiceWorker] All actions synced successfully');
  } catch (error) {
    console.error('[ServiceWorker] Sync all failed:', error);
    throw error;
  }
}

/**
 * Sync pending actions by type
 */
async function syncPendingActionsByType(actionType) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['sync-queue'], 'readonly');
    const store = transaction.objectStore('sync-queue');
    const index = store.index('action_type');
    const actions = await getAllFromIndex(index, actionType);
    
    console.log(`[ServiceWorker] Syncing ${actions.length} ${actionType} actions`);
    
    for (const action of actions) {
      await syncAction(action, db);
    }
    
    console.log(`[ServiceWorker] ${actionType} actions synced successfully`);
  } catch (error) {
    console.error(`[ServiceWorker] Sync ${actionType} failed:`, error);
    throw error;
  }
}

/**
 * Sync individual action
 */
async function syncAction(action, db) {
  try {
    let response;
    
    switch (action.action_type) {
      case 'create_analysis':
        response = await fetch('/api/analysis/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;
        
      case 'update_analysis':
        response = await fetch(`/api/analysis/${action.resource_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;
        
      case 'create_lead':
        response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;
        
      case 'update_lead':
        response = await fetch(`/api/leads/${action.resource_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;
        
      case 'delete_lead':
        response = await fetch(`/api/leads/${action.resource_id}`, {
          method: 'DELETE',
        });
        break;
        
      default:
        console.error('[ServiceWorker] Unknown action type:', action.action_type);
        return;
    }
    
    if (response.ok) {
      // Remove from sync queue
      await deleteFromStore(db, 'sync-queue', action.id);
      console.log('[ServiceWorker] Action synced successfully:', action.id);
    } else {
      console.error('[ServiceWorker] Action sync failed:', action.id, response.status);
    }
  } catch (error) {
    console.error('[ServiceWorker] Action sync error:', action.id, error);
  }
}

/**
 * Open IndexedDB
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ai367bar-multi-clinic', 2);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('analyses')) {
        const analysesStore = db.createObjectStore('analyses', { keyPath: 'id' });
        analysesStore.createIndex('clinic_id', 'clinic_id', { unique: false });
        analysesStore.createIndex('sales_staff_id', 'sales_staff_id', { unique: false });
        analysesStore.createIndex('synced', 'synced', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('leads')) {
        const leadsStore = db.createObjectStore('leads', { keyPath: 'id' });
        leadsStore.createIndex('clinic_id', 'clinic_id', { unique: false });
        leadsStore.createIndex('sales_staff_id', 'sales_staff_id', { unique: false });
        leadsStore.createIndex('synced', 'synced', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('sync-queue')) {
        const syncStore = db.createObjectStore('sync-queue', { keyPath: 'id' });
        syncStore.createIndex('action_type', 'action_type', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('clinic-cache')) {
        db.createObjectStore('clinic-cache', { keyPath: 'clinic_id' });
      }
    };
  });
}

/**
 * Get all pending actions from sync queue
 */
function getAllPendingActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sync-queue'], 'readonly');
    const store = transaction.objectStore('sync-queue');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all items from index
 */
function getAllFromIndex(index, key) {
  return new Promise((resolve, reject) => {
    const request = index.getAll(key);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete from object store
 */
function deleteFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received:', event);
  
  let notificationData = {
    title: 'AI Clinic Notification',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'default',
    requireInteraction: false,
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || notificationData.tag,
        requireInteraction: payload.requireInteraction || false,
        data: payload.data || {}
      };
    } catch (error) {
      console.error('[ServiceWorker] Failed to parse push data:', error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.data.actions || []
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/sales/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if no match found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message handler - for skip waiting and other commands
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'SYNC_NOW') {
    // Trigger sync immediately
    syncAllPendingActions().catch((error) => {
      console.error('[ServiceWorker] Manual sync failed:', error);
    });
  }
});
