// PWA Manager - Handle service worker registration and PWA features
// Supports offline mode, install prompts, push notifications, and background sync

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAConfig {
  swUrl?: string;
  scope?: string;
  enablePushNotifications?: boolean;
  enableBackgroundSync?: boolean;
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export interface InstallPromptState {
  canInstall: boolean;
  isInstalled: boolean;
  platform: string | null;
}

export interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingItems: number;
}

export class PWAManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private config: PWAConfig;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: PWAConfig = {}) {
    this.config = {
      swUrl: '/sw.js',
      scope: '/',
      enablePushNotifications: true,
      enableBackgroundSync: true,
      ...config,
    };
  }

  /**
   * Initialize PWA features
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return;
    }

    try {
      // Register service worker
      await this.registerServiceWorker();

      // Setup install prompt listener
      this.setupInstallPrompt();

      // Setup online/offline listeners
      this.setupConnectionListeners();

      // Setup update checker
      this.setupUpdateChecker();

      // Request notification permission if enabled
      if (this.config.enablePushNotifications) {
        await this.requestNotificationPermission();
      }

      console.log('PWA Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PWA Manager:', error);
      throw error;
    }
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      this.swRegistration = await navigator.serviceWorker.register(
        this.config.swUrl!,
        { scope: this.config.scope }
      );

      console.log('Service Worker registered:', this.swRegistration);

      // Listen for updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration!.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              if (this.config.onUpdateAvailable) {
                this.config.onUpdateAvailable(this.swRegistration!);
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Setup install prompt listener
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('Install prompt captured');
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.deferredPrompt = null;
    });
  }

  /**
   * Setup online/offline listeners
   */
  private setupConnectionListeners(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored');
      if (this.config.onOnline) {
        this.config.onOnline();
      }

      // Trigger background sync when back online
      if (this.config.enableBackgroundSync) {
        this.triggerBackgroundSync('sync-bookings');
        this.triggerBackgroundSync('sync-notifications');
      }
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost');
      if (this.config.onOffline) {
        this.config.onOffline();
      }
    });
  }

  /**
   * Setup periodic update checker
   */
  private setupUpdateChecker(): void {
    // Check for updates every 60 minutes
    this.updateCheckInterval = setInterval(() => {
      if (this.swRegistration) {
        this.swRegistration.update();
      }
    }, 60 * 60 * 1000);
  }

  /**
   * Show install prompt to user
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  /**
   * Get install prompt state
   */
  getInstallPromptState(): InstallPromptState {
    return {
      canInstall: this.deferredPrompt !== null,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches,
      platform: this.deferredPrompt?.platforms[0] || null,
    };
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Get notification permission state
   */
  getNotificationPermissionState(): NotificationPermissionState {
    if (!('Notification' in window)) {
      return { granted: false, denied: true, default: false };
    }

    return {
      granted: Notification.permission === 'granted',
      denied: Notification.permission === 'denied',
      default: Notification.permission === 'default',
    };
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications(
    vapidPublicKey: string
  ): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return null;
    }

    try {
      const permission = await this.requestNotificationPermission();

      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);
      const keyBuffer = new ArrayBuffer(applicationServerKey.byteLength);
      new Uint8Array(keyBuffer).set(applicationServerKey);

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBuffer,
      });

      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();

      if (subscription) {
        const success = await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications:', success);
        return success;
      }

      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Get current push subscription
   */
  async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      return null;
    }

    try {
      return await this.swRegistration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  /**
   * Trigger background sync
   */
  async triggerBackgroundSync(tag: string): Promise<void> {
    if (!this.swRegistration || !('sync' in this.swRegistration)) {
      console.warn('Background Sync not supported');
      return;
    }

    try {
      const syncManager = (this.swRegistration as ServiceWorkerRegistration & {
        sync?: { register(tag: string): Promise<void> };
      }).sync;
      if (!syncManager) {
        throw new Error('Background sync not supported');
      }
      await syncManager.register(tag);
      console.log('Background sync registered:', tag);
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }

  /**
   * Get sync status from IndexedDB
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const db = await this.openDatabase();
      const pendingBookings = await this.getPendingBookings(db);

      return {
        isSyncing: false,
        lastSyncTime: Date.now(),
        pendingItems: pendingBookings.length,
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return {
        isSyncing: false,
        lastSyncTime: null,
        pendingItems: 0,
      };
    }
  }

  /**
   * Add pending booking to sync queue
   */
  async addPendingBooking(booking: any): Promise<void> {
    try {
      const db = await this.openDatabase();
      await this.savePendingBooking(db, booking);
      
      // Trigger background sync
      if (this.config.enableBackgroundSync) {
        await this.triggerBackgroundSync('sync-bookings');
      }
    } catch (error) {
      console.error('Failed to add pending booking:', error);
      throw error;
    }
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    if (!this.swRegistration) {
      return;
    }

    try {
      await this.swRegistration.update();
      
      // Tell service worker to skip waiting
      const newWorker = this.swRegistration.waiting || this.swRegistration.installing;
      
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update service worker:', error);
    }
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('ai-clinic-')) {
            return caches.delete(cacheName);
          }
        })
      );
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  /**
   * Check if app is running in standalone mode (installed)
   */
  isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.swRegistration;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }

  // Helper methods

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ai-clinic-db', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('pending-bookings')) {
          db.createObjectStore('pending-bookings', { keyPath: 'id' });
        }
      };
    });
  }

  private async getPendingBookings(db: IDBDatabase): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending-bookings'], 'readonly');
      const store = transaction.objectStore('pending-bookings');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async savePendingBooking(db: IDBDatabase, booking: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending-bookings'], 'readwrite');
      const store = transaction.objectStore('pending-bookings');
      const request = store.put(booking);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Singleton instance
let pwaManagerInstance: PWAManager | null = null;

export function getPWAManager(config?: PWAConfig): PWAManager {
  if (!pwaManagerInstance) {
    pwaManagerInstance = new PWAManager(config);
  }
  return pwaManagerInstance;
}

export function resetPWAManager(): void {
  if (pwaManagerInstance) {
    pwaManagerInstance.destroy();
    pwaManagerInstance = null;
  }
}
