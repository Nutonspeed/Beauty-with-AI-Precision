/**
 * Offline Manager
 * Handles offline functionality, data caching, and background sync
 */

export type SyncActionType = 'send-message' | 'update-lead' | 'create-booking';

export interface QueuedMessage {
  id: string;
  leadId: string;
  leadName: string;
  text: string;
  timestamp: Date;
}

export interface QueuedLeadUpdate {
  id: string;
  leadId: string;
  leadName: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface OfflineStatus {
  isOnline: boolean;
  queuedMessages: number;
  queuedUpdates: number;
  lastSyncTime: Date | null;
}

class OfflineManager {
  private isOnline = true;
  private listeners: Array<(status: OfflineStatus) => void> = [];
  private db: IDBDatabase | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initOnlineListeners();
    this.initServiceWorker();
    this.initIndexedDB();
  }

  /**
   * Initialize online/offline event listeners
   */
  private initOnlineListeners(): void {
    if (typeof globalThis.window === 'undefined') return;

    this.isOnline = globalThis.navigator.onLine;

    globalThis.window.addEventListener('online', () => {
      console.log('[OfflineManager] Connection restored');
      this.isOnline = true;
      this.notifyListeners();
      this.triggerBackgroundSync();
    });

    globalThis.window.addEventListener('offline', () => {
      console.log('[OfflineManager] Connection lost');
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  /**
   * Initialize Service Worker
   */
  private async initServiceWorker(): Promise<void> {
    if (typeof globalThis.window === 'undefined') return;
    if (!('serviceWorker' in globalThis.navigator)) {
      console.warn('[OfflineManager] Service Worker not supported');
      return;
    }

    try {
      this.swRegistration = await globalThis.navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[OfflineManager] Service Worker registered:', this.swRegistration.scope);

      // Listen for updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration?.installing;
        console.log('[OfflineManager] New Service Worker found');

        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && globalThis.navigator.serviceWorker.controller) {
            console.log('[OfflineManager] New Service Worker available');
            // Notify user about update
            this.notifyUpdate();
          }
        });
      });
    } catch (error) {
      console.error('[OfflineManager] Service Worker registration failed:', error);
    }
  }

  /**
   * Initialize IndexedDB
   */
  private async initIndexedDB(): Promise<void> {
    if (typeof globalThis.window === 'undefined') return;
    if (!('indexedDB' in globalThis.window)) {
      console.warn('[OfflineManager] IndexedDB not supported');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = globalThis.indexedDB.open('ai367bar-offline', 1);

      request.onerror = () => {
        console.error('[OfflineManager] IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineManager] IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('updates')) {
          db.createObjectStore('updates', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('leads')) {
          db.createObjectStore('leads', { keyPath: 'id' });
        }

        console.log('[OfflineManager] IndexedDB schema created');
      };
    });
  }

  /**
   * Queue a message for sending when online
   */
  public async queueMessage(message: Omit<QueuedMessage, 'id'>): Promise<void> {
    if (!this.db) {
      console.error('[OfflineManager] IndexedDB not initialized');
      return;
    }

    const queuedMessage: QueuedMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      const request = store.add(queuedMessage);

      request.onsuccess = () => {
        console.log('[OfflineManager] Message queued:', queuedMessage.id);
        this.notifyListeners();
        resolve();
      };

      request.onerror = () => {
        console.error('[OfflineManager] Failed to queue message:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Queue a lead update for syncing when online
   */
  public async queueLeadUpdate(update: Omit<QueuedLeadUpdate, 'id'>): Promise<void> {
    if (!this.db) {
      console.error('[OfflineManager] IndexedDB not initialized');
      return;
    }

    const queuedUpdate: QueuedLeadUpdate = {
      ...update,
      id: `upd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['updates'], 'readwrite');
      const store = transaction.objectStore('updates');
      const request = store.add(queuedUpdate);

      request.onsuccess = () => {
        console.log('[OfflineManager] Lead update queued:', queuedUpdate.id);
        this.notifyListeners();
        resolve();
      };

      request.onerror = () => {
        console.error('[OfflineManager] Failed to queue update:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get queued messages count
   */
  public async getQueuedMessagesCount(): Promise<number> {
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get queued updates count
   */
  public async getQueuedUpdatesCount(): Promise<number> {
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['updates'], 'readonly');
      const store = transaction.objectStore('updates');
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Trigger background sync
   */
  private async triggerBackgroundSync(): Promise<void> {
    if (!this.swRegistration) return;

    try {
      if ('sync' in this.swRegistration) {
        await (this.swRegistration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-messages');
        await (this.swRegistration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-lead-updates');
        console.log('[OfflineManager] Background sync triggered');
      } else {
        console.warn('[OfflineManager] Background Sync not supported');
        // Fallback: sync immediately
        this.syncNow();
      }
    } catch (error) {
      console.error('[OfflineManager] Failed to trigger background sync:', error);
    }
  }

  /**
   * Sync now (fallback for browsers without Background Sync API)
   */
  private async syncNow(): Promise<void> {
    console.log('[OfflineManager] Syncing now...');
    // This would be implemented with actual API calls
    // For now, just notify listeners
    this.notifyListeners();
  }

  /**
   * Subscribe to offline status changes
   */
  public subscribe(listener: (status: OfflineStatus) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  private async notifyListeners(): Promise<void> {
    const status = await this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Notify about Service Worker update
   */
  private notifyUpdate(): void {
    // This could show a toast notification
    console.log('[OfflineManager] App update available');
  }

  /**
   * Get current offline status
   */
  public async getStatus(): Promise<OfflineStatus> {
    const queuedMessages = await this.getQueuedMessagesCount();
    const queuedUpdates = await this.getQueuedUpdatesCount();

    return {
      isOnline: this.isOnline,
      queuedMessages,
      queuedUpdates,
      lastSyncTime: null // Would be tracked in IndexedDB
    };
  }

  /**
   * Check if online
   */
  public isCurrentlyOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Update Service Worker
   */
  public async updateServiceWorker(): Promise<void> {
    if (!this.swRegistration) return;

    const newWorker = this.swRegistration.installing || this.swRegistration.waiting;
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      globalThis.window.location.reload();
    }
  }
}

// Singleton instance
export const offlineManager = new OfflineManager();
