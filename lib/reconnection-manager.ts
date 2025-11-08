/**
 * Reconnection Manager
 * Handles WebSocket reconnection with exponential backoff and offline queue
 */

export interface ReconnectionOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export interface QueuedMessage {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
}

export class ReconnectionManager {
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: QueuedMessage[] = [];
  private isOnline = true;
  private statusCallbacks: Array<(status: ConnectionStatus) => void> = [];
  private dbName = 'WebSocketQueueDB';
  private storeName = 'messages';

  // Default options
  private options: Required<ReconnectionOptions> = {
    maxRetries: 10,
    initialDelay: 1000, // 1 second
    maxDelay: 32000, // 32 seconds
    backoffMultiplier: 2
  };

  constructor(options?: ReconnectionOptions) {
    if (options) {
      this.options = { ...this.options, ...options };
    }

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      this.isOnline = navigator.onLine;
    }
  }

  /**
   * Calculate delay for next reconnection attempt (exponential backoff)
   */
  private calculateDelay(): number {
    const delay = Math.min(
      this.options.initialDelay * Math.pow(this.options.backoffMultiplier, this.reconnectAttempts),
      this.options.maxDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    return delay + jitter;
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect(connectFn: () => Promise<void>): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts >= this.options.maxRetries) {
      console.error('[Reconnection] Max retries reached');
      this.updateStatus({
        connected: false,
        reconnecting: false,
        error: 'Max reconnection attempts reached',
        queueSize: this.messageQueue.length
      });
      return;
    }

    const delay = this.calculateDelay();
    console.log(`[Reconnection] Attempt ${this.reconnectAttempts + 1}/${this.options.maxRetries} in ${(delay / 1000).toFixed(1)}s`);

    this.updateStatus({
      connected: false,
      reconnecting: true,
      nextAttemptIn: delay,
      attempt: this.reconnectAttempts + 1,
      maxAttempts: this.options.maxRetries,
      queueSize: this.messageQueue.length
    });

    this.reconnectTimeout = setTimeout(async () => {
      try {
        this.reconnectAttempts++;
        await connectFn();
        this.onReconnectSuccess();
      } catch (error) {
        console.error('[Reconnection] Failed:', error);
        this.scheduleReconnect(connectFn);
      }
    }, delay);
  }

  /**
   * Handle successful reconnection
   */
  private onReconnectSuccess(): void {
    console.log('[Reconnection] Success!');
    this.reconnectAttempts = 0;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.updateStatus({
      connected: true,
      reconnecting: false,
      queueSize: this.messageQueue.length
    });
  }

  /**
   * Reset reconnection state
   */
  reset(): void {
    this.reconnectAttempts = 0;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.updateStatus({
      connected: true,
      reconnecting: false,
      queueSize: this.messageQueue.length
    });
  }

  /**
   * Cancel reconnection attempts
   */
  cancel(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;
    
    this.updateStatus({
      connected: false,
      reconnecting: false,
      queueSize: this.messageQueue.length
    });
  }

  /**
   * Queue message for later delivery
   */
  queueMessage(type: string, payload: unknown): string {
    const message: QueuedMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      payload,
      timestamp: Date.now(),
      retries: 0
    };

    this.messageQueue.push(message);
    console.log(`[Queue] Message queued: ${type} (${this.messageQueue.length} in queue)`);

    this.updateStatus({
      connected: false,
      reconnecting: this.reconnectAttempts > 0,
      queueSize: this.messageQueue.length
    });

    // Persist to IndexedDB if available
    this.persistQueue().catch(console.error);

    return message.id;
  }

  /**
   * Get queued messages
   */
  getQueue(): QueuedMessage[] {
    return [...this.messageQueue];
  }

  /**
   * Clear message queue
   */
  async loadPersistedQueue(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          this.messageQueue = getAllRequest.result || [];
          console.log(`[Reconnection] Loaded ${this.messageQueue.length} messages from queue`);
          resolve();
        };

        getAllRequest.onerror = () => {
          console.error('Failed to load messages from IndexedDB');
          reject(new Error('Failed to load messages from IndexedDB'));
        };
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  clearQueue(): void {
    this.messageQueue = [];
    this.clearPersistedQueue().catch(console.error);
    
    this.updateStatus({
      connected: this.isOnline,
      reconnecting: this.reconnectAttempts > 0,
      queueSize: 0
    });
  }

  /**
   * Remove message from queue
   */
  removeFromQueue(messageId: string): void {
    const index = this.messageQueue.findIndex(m => m.id === messageId);
    if (index !== -1) {
      this.messageQueue.splice(index, 1);
      console.log(`[Queue] Message removed: ${messageId}`);
      
      this.updateStatus({
        connected: this.isOnline,
        reconnecting: this.reconnectAttempts > 0,
        queueSize: this.messageQueue.length
      });

      this.persistQueue().catch(console.error);
    }
  }

  /**
   * Replay queued messages
   */
  async replayQueue(sendFn: (type: string, payload: unknown) => Promise<void>): Promise<void> {
    if (this.messageQueue.length === 0) {
      console.log('[Queue] No messages to replay');
      return;
    }

    console.log(`[Queue] Replaying ${this.messageQueue.length} messages...`);

    const messages = [...this.messageQueue];
    const failed: QueuedMessage[] = [];

    for (const message of messages) {
      try {
        await sendFn(message.type, message.payload);
        this.removeFromQueue(message.id);
        console.log(`[Queue] Message sent: ${message.type}`);
      } catch (error) {
        console.error(`[Queue] Failed to send message ${message.id}:`, error);
        message.retries++;
        
        // Remove after 3 failed retries
        if (message.retries >= 3) {
          console.error(`[Queue] Max retries for message ${message.id}, removing`);
          this.removeFromQueue(message.id);
        } else {
          failed.push(message);
        }
      }
    }

    if (failed.length > 0) {
      console.log(`[Queue] ${failed.length} messages failed to send`);
    } else {
      console.log('[Queue] All messages replayed successfully');
    }
  }

  /**
   * Subscribe to connection status updates
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    // Send current status immediately
    callback({
      connected: this.isOnline && this.reconnectAttempts === 0,
      reconnecting: this.reconnectAttempts > 0,
      queueSize: this.messageQueue.length
    });

    // Return unsubscribe function
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Update connection status
   */
  private updateStatus(status: ConnectionStatus): void {
    for (const callback of this.statusCallbacks) {
      try {
        callback(status);
      } catch (error) {
        console.error('[Reconnection] Error in status callback:', error);
      }
    }
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    console.log('[Reconnection] Browser is online');
    this.isOnline = true;
    
    this.updateStatus({
      connected: false,
      reconnecting: true,
      queueSize: this.messageQueue.length
    });
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    console.log('[Reconnection] Browser is offline');
    this.isOnline = false;
    
    this.updateStatus({
      connected: false,
      reconnecting: false,
      offline: true,
      queueSize: this.messageQueue.length
    });
  };

  /**
   * Persist queue to IndexedDB
   */
  private async persistQueue(): Promise<void> {
    if (typeof indexedDB === 'undefined') return;

    try {
      const db = await this.openDB();
      const transaction = db.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');

      // Clear and re-populate
      await store.clear();
      
      for (const message of this.messageQueue) {
        await store.put(message);
      }

      console.log('[Queue] Persisted to IndexedDB');
    } catch (error) {
      console.error('[Queue] Failed to persist:', error);
    }
  }
  private async clearPersistedQueue(): Promise<void> {
    if (typeof indexedDB === 'undefined') return;

    try {
      const db = await this.openDB();
      const transaction = db.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      await store.clear();
      console.log('[Queue] Cleared from IndexedDB');
    } catch (error) {
      console.error('[Queue] Failed to clear persisted queue:', error);
    }
  }

  /**
   * Open IndexedDB
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('reconnection-queue', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.cancel();
    this.messageQueue = [];
    this.statusCallbacks = [];

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  /**
   * Get connection statistics
   */
  getStats(): ReconnectionStats {
    return {
      reconnectAttempts: this.reconnectAttempts,
      maxRetries: this.options.maxRetries,
      queueSize: this.messageQueue.length,
      isOnline: this.isOnline,
      isReconnecting: this.reconnectAttempts > 0 && this.reconnectTimeout !== null
    };
  }
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  offline?: boolean;
  error?: string;
  nextAttemptIn?: number;
  attempt?: number;
  maxAttempts?: number;
  queueSize: number;
}

export interface ReconnectionStats {
  reconnectAttempts: number;
  maxRetries: number;
  queueSize: number;
  isOnline: boolean;
  isReconnecting: boolean;
}
