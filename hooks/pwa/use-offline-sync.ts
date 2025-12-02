// Offline Sync Hook
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
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
