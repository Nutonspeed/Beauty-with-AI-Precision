// PWA Hook for React
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
      setPWAInfo(prev => ({ ...prev, isInstallable: true }))
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
      setPWAInfo(prev => ({ ...prev, isInstalled: true }))
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
      setPWAInfo(prev => ({ ...prev, isOnline: true, isOffline: false }))
    }

    const handleOffline = () => {
      setPWAInfo(prev => ({ ...prev, isOnline: false, isOffline: true }))
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
          setPWAInfo(prev => ({ ...prev, updateAvailable: true }))
          break
        case 'UPDATE_READY':
          setPWAInfo(prev => ({ ...prev, updateReady: true }))
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
      
      setPWAInfo(prev => ({
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
