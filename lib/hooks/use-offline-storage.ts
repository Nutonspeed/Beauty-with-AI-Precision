// Offline Storage Hook - AR models and data caching
// Enables offline AR functionality

import { useState, useCallback } from 'react'

interface OfflineStorageItem {
  data: any
  timestamp: number
  expiresAt?: number
  version?: string
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Monitor online/offline status
  useState(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  })

  const saveToOffline = useCallback(async (key: string, data: any, expiresIn?: number) => {
    try {
      const item: OfflineStorageItem = {
        data,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
        version: '1.0'
      }

      // Check if IndexedDB is available
      if ('indexedDB' in window) {
        await saveToIndexedDB(key, item)
      } else {
        // Fallback to localStorage
        localStorage.setItem(`offline_${key}`, JSON.stringify(item))
      }

      console.log(`✅ Saved ${key} to offline storage`)
    } catch (error) {
      console.error('Failed to save to offline storage:', error)
      throw error
    }
  }, [])

  const loadFromOffline = useCallback(async (key: string): Promise<any | null> => {
    try {
      let item: OfflineStorageItem | null = null

      if ('indexedDB' in window) {
        item = await loadFromIndexedDB(key)
      } else {
        const stored = localStorage.getItem(`offline_${key}`)
        if (stored) {
          item = JSON.parse(stored)
        }
      }

      if (!item) return null

      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await removeFromOffline(key)
        return null
      }

      console.log(`✅ Loaded ${key} from offline storage`)
      return item.data
    } catch (error) {
      console.error('Failed to load from offline storage:', error)
      return null
    }
  }, [])

  const removeFromOffline = useCallback(async (key: string) => {
    try {
      if ('indexedDB' in window) {
        await removeFromIndexedDB(key)
      } else {
        localStorage.removeItem(`offline_${key}`)
      }

      console.log(`🗑️ Removed ${key} from offline storage`)
    } catch (error) {
      console.error('Failed to remove from offline storage:', error)
    }
  }, [])

  const getOfflineStorageInfo = useCallback(async () => {
    try {
      const info = {
        indexedDB: 'indexedDB' in window,
        localStorage: 'localStorage' in window,
        estimate: 0,
        items: 0
      }

      if ('indexedDB' in window) {
        // Get IndexedDB info (simplified)
        info.items = await getIndexedDBItemCount()
      } else if ('localStorage' in window) {
        // Count localStorage offline items
        let count = 0
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('offline_')) count++
        }
        info.items = count
      }

      return info
    } catch (error) {
      console.error('Failed to get offline storage info:', error)
      return { indexedDB: false, localStorage: false, estimate: 0, items: 0 }
    }
  }, [])

  // IndexedDB helpers
  const saveToIndexedDB = async (key: string, item: OfflineStorageItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ClinicIQ_Offline', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['offline_data'], 'readwrite')
        const store = transaction.objectStore('offline_data')
        const putRequest = store.put({ key, ...item })

        putRequest.onerror = () => reject(putRequest.error)
        putRequest.onsuccess = () => resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('offline_data')) {
          db.createObjectStore('offline_data', { keyPath: 'key' })
        }
      }
    })
  }

  const loadFromIndexedDB = async (key: string): Promise<OfflineStorageItem | null> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ClinicIQ_Offline', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['offline_data'], 'readonly')
        const store = transaction.objectStore('offline_data')
        const getRequest = store.get(key)

        getRequest.onerror = () => reject(getRequest.error)
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null)
        }
      }
    })
  }

  const removeFromIndexedDB = async (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ClinicIQ_Offline', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['offline_data'], 'readwrite')
        const store = transaction.objectStore('offline_data')
        const deleteRequest = store.delete(key)

        deleteRequest.onerror = () => reject(deleteRequest.error)
        deleteRequest.onsuccess = () => resolve()
      }
    })
  }

  const getIndexedDBItemCount = async (): Promise<number> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ClinicIQ_Offline', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['offline_data'], 'readonly')
        const store = transaction.objectStore('offline_data')
        const countRequest = store.count()

        countRequest.onerror = () => reject(countRequest.error)
        countRequest.onsuccess = () => resolve(countRequest.result)
      }
    })
  }

  return {
    saveToOffline,
    loadFromOffline,
    removeFromOffline,
    getOfflineStorageInfo,
    isOffline: !isOnline,
    isOnline
  }
}
