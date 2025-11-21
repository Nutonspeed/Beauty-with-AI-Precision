'use client';

import { useEffect, useState, useCallback } from 'react';
import { getPWAManager } from '@/lib/pwa/pwa-manager';
import type {
  PWAConfig,
  InstallPromptState,
  NotificationPermissionState,
  SyncStatus,
} from '@/lib/pwa/pwa-manager';

export interface UsePWAReturn {
  // Installation
  installState: InstallPromptState;
  showInstallPrompt: () => Promise<boolean>;
  
  // Connection
  isOnline: boolean;
  
  // Notifications
  notificationState: NotificationPermissionState;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribeToPushNotifications: (vapidPublicKey: string) => Promise<PushSubscription | null>;
  unsubscribeFromPushNotifications: () => Promise<boolean>;
  
  // Background Sync
  syncStatus: SyncStatus;
  triggerBackgroundSync: (tag: string) => Promise<void>;
  addPendingBooking: (booking: any) => Promise<void>;
  
  // Service Worker
  updateAvailable: boolean;
  updateServiceWorker: () => Promise<void>;
  clearCaches: () => Promise<void>;
  
  // Utilities
  isStandalone: boolean;
  isInitialized: boolean;
}

export function usePWA(config?: PWAConfig): UsePWAReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [installState, setInstallState] = useState<InstallPromptState>({
    canInstall: false,
    isInstalled: false,
    platform: null,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [notificationState, setNotificationState] = useState<NotificationPermissionState>({
    granted: false,
    denied: false,
    default: true,
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    pendingItems: 0,
  });
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Update all states
  const updateStates = useCallback(() => {
    const pwaManager = getPWAManager();
    
    setInstallState(pwaManager.getInstallPromptState());
    setIsOnline(pwaManager.isOnline());
    setNotificationState(pwaManager.getNotificationPermissionState());
    setIsStandalone(pwaManager.isStandalone());
    
    pwaManager.getSyncStatus().then(setSyncStatus).catch(console.error);
  }, []);

  // Initialize PWA Manager
  useEffect(() => {
    const pwaManager = getPWAManager({
      ...config,
      onUpdateAvailable: (registration) => {
        setUpdateAvailable(true);
        if (config?.onUpdateAvailable) {
          config.onUpdateAvailable(registration);
        }
      },
      onOnline: () => {
        setIsOnline(true);
        if (config?.onOnline) {
          config.onOnline();
        }
      },
      onOffline: () => {
        setIsOnline(false);
        if (config?.onOffline) {
          config.onOffline();
        }
      },
    });

    pwaManager.initialize().then(() => {
      setIsInitialized(true);
      updateStates();
    }).catch(console.error);

    // Update states periodically
    const interval = setInterval(updateStates, 5000);

    return () => {
      clearInterval(interval);
      pwaManager.destroy();
    };
  }, [config, updateStates]);

  // Install Prompt
  const showInstallPrompt = useCallback(async () => {
    const pwaManager = getPWAManager();
    const success = await pwaManager.showInstallPrompt();
    updateStates();
    return success;
  }, [updateStates]);

  // Notification Permission
  const requestNotificationPermission = useCallback(async () => {
    const pwaManager = getPWAManager();
    const permission = await pwaManager.requestNotificationPermission();
    updateStates();
    return permission;
  }, [updateStates]);

  // Subscribe to Push Notifications
  const subscribeToPushNotifications = useCallback(async (vapidPublicKey: string) => {
    const pwaManager = getPWAManager();
    return await pwaManager.subscribeToPushNotifications(vapidPublicKey);
  }, []);

  // Unsubscribe from Push Notifications
  const unsubscribeFromPushNotifications = useCallback(async () => {
    const pwaManager = getPWAManager();
    return await pwaManager.unsubscribeFromPushNotifications();
  }, []);

  // Background Sync
  const triggerBackgroundSync = useCallback(async (tag: string) => {
    const pwaManager = getPWAManager();
    await pwaManager.triggerBackgroundSync(tag);
    updateStates();
  }, [updateStates]);

  // Add Pending Booking
  const addPendingBooking = useCallback(async (booking: any) => {
    const pwaManager = getPWAManager();
    await pwaManager.addPendingBooking(booking);
    updateStates();
  }, [updateStates]);

  // Update Service Worker
  const updateServiceWorker = useCallback(async () => {
    const pwaManager = getPWAManager();
    await pwaManager.updateServiceWorker();
  }, []);

  // Clear Caches
  const clearCaches = useCallback(async () => {
    const pwaManager = getPWAManager();
    await pwaManager.clearCaches();
  }, []);

  return {
    // Installation
    installState,
    showInstallPrompt,
    
    // Connection
    isOnline,
    
    // Notifications
    notificationState,
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    
    // Background Sync
    syncStatus,
    triggerBackgroundSync,
    addPendingBooking,
    
    // Service Worker
    updateAvailable,
    updateServiceWorker,
    clearCaches,
    
    // Utilities
    isStandalone,
    isInitialized,
  };
}
