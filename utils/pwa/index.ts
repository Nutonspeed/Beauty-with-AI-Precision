// PWA Utilities
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
      return new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel()
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version)
        }
        if (registration.active) {
          registration.active.postMessage(
            { type: 'GET_VERSION' },
            [messageChannel.port2]
          )
        } else {
          reject(new Error('No active service worker'))
        }
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
        await (registration as any).sync.register(tag)
        console.log('Background sync registered:', tag)
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }
  }

  static async registerPeriodicSync(registration: ServiceWorkerRegistration, tag: string, minInterval: number) {
    if ('serviceWorker' in navigator && 'periodicSync' in registration) {
      try {
        await (registration as any).periodicSync.register(tag, {
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
        total: navigation.loadEventEnd - (navigation.activationStart || navigation.fetchStart)
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
