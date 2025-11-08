/**
 * Push Notification Manager
 * Integrates WebSocket notifications with PWA push notifications
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  /**
   * Initialize push notification manager
   */
  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in globalThis)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('✅ Push subscription found:', this.subscription.endpoint);
      } else {
        console.log('ℹ️ No push subscription found');
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      throw error;
    }
  }

  /**
   * Request push notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in globalThis)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(vapidPublicKey: string): Promise<PushSubscriptionData> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    // Check permission
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    try {
      // Subscribe to push manager
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      });

      console.log('✅ Push subscription created:', this.subscription.endpoint);

      // Convert subscription to storable format
      const subscriptionData = this.serializeSubscription(this.subscription);
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscriptionData);

      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<void> {
    if (!this.subscription) {
      console.log('No active push subscription');
      return;
    }

    try {
      await this.subscription.unsubscribe();
      
      // Notify server
      await this.removeSubscriptionFromServer();
      
      this.subscription = null;
      console.log('✅ Push subscription removed');
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  /**
   * Get current subscription
   */
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in globalThis && 
           'Notification' in globalThis;
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if ('Notification' in globalThis) {
      return Notification.permission;
    }
    return 'denied';
  }

  /**
   * Show local notification (without push)
   */
  async showNotification(
    title: string, 
    options: NotificationOptions = {}
  ): Promise<void> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    const permission = this.getPermissionStatus();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    await this.registration.showNotification(title, {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      ...options
    });
  }

  /**
   * Send WebSocket message to Service Worker for offline storage
   */
  async relayWebSocketMessage(message: unknown): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.warn('Service Worker not active, cannot relay message');
      return;
    }

    this.registration.active.postMessage({
      type: 'WS_MESSAGE',
      payload: message
    });
  }

  /**
   * Trigger notification from WebSocket message
   */
  async showWebSocketNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.warn('Service Worker not active');
      return;
    }

    this.registration.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      payload: { title, body, data }
    });
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Serialize push subscription for storage
   */
  private serializeSubscription(subscription: PushSubscription): PushSubscriptionData {
    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: key ? this.arrayBufferToBase64(key) : '',
        auth: auth ? this.arrayBufferToBase64(auth) : ''
      }
    };
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(
    subscription: PushSubscriptionData
  ): Promise<void> {
    try {
      const response = await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error(`Failed to save subscription: ${response.statusText}`);
      }

      console.log('✅ Push subscription saved to server');
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(): Promise<void> {
    if (!this.subscription) return;

    try {
      const response = await fetch('/api/push-subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: this.subscription.endpoint })
      });

      if (!response.ok) {
        throw new Error(`Failed to remove subscription: ${response.statusText}`);
      }

      console.log('✅ Push subscription removed from server');
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      throw error;
    }
  }
}

// Singleton instance
let pushNotificationManager: PushNotificationManager | null = null;

export function getPushNotificationManager(): PushNotificationManager {
  if (!pushNotificationManager) {
    pushNotificationManager = new PushNotificationManager();
  }
  return pushNotificationManager;
}
