'use client';

import { useEffect, useState } from 'react';
import { getPWAManager } from '@/lib/pwa/pwa-manager';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, Bell, BellOff, Wifi, WifiOff, Smartphone } from 'lucide-react';

export default function PWADemoPage() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    isSyncing: false,
    lastSyncTime: null as number | null,
    pendingItems: 0,
  });

  useEffect(() => {
    const pwaManager = getPWAManager({
      onUpdateAvailable: () => {
        setUpdateAvailable(true);
      },
      onOnline: () => {
        setIsOnline(true);
      },
      onOffline: () => {
        setIsOnline(false);
      },
    });

    // Initialize PWA
    pwaManager.initialize().catch(console.error);

    // Update states
    const updateStates = () => {
      const state = pwaManager.getInstallPromptState();
      setIsInstalled(state.isInstalled);
      setCanInstall(state.canInstall);
      setIsOnline(pwaManager.isOnline());

      const notifState = pwaManager.getNotificationPermissionState();
      if (notifState.granted) setNotificationPermission('granted');
      else if (notifState.denied) setNotificationPermission('denied');
      else setNotificationPermission('default');

      pwaManager.getSyncStatus().then(setSyncStatus);
    };

    updateStates();

    // Update states every 5 seconds
    const interval = setInterval(updateStates, 5000);

    return () => {
      clearInterval(interval);
      pwaManager.destroy();
    };
  }, []);

  const handleInstall = async () => {
    const pwaManager = getPWAManager();
    await pwaManager.showInstallPrompt();
  };

  const handleRequestNotifications = async () => {
    const pwaManager = getPWAManager();
    const permission = await pwaManager.requestNotificationPermission();
    setNotificationPermission(permission);
  };

  const handleUpdate = async () => {
    const pwaManager = getPWAManager();
    await pwaManager.updateServiceWorker();
  };

  const handleClearCache = async () => {
    const pwaManager = getPWAManager();
    await pwaManager.clearCaches();
    window.location.reload();
  };

  const handleTriggerSync = async () => {
    const pwaManager = getPWAManager();
    await pwaManager.triggerBackgroundSync('sync-bookings');
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">PWA Features Demo</h1>
        <p className="text-muted-foreground">
          Progressive Web App capabilities for offline mode, push notifications, and more
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Installation Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Installation</CardTitle>
              <Smartphone className="h-5 w-5 text-purple-600" />
            </div>
            <CardDescription>PWA installation status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                {isInstalled ? (
                  <Badge variant="default" className="bg-green-600">Installed</Badge>
                ) : canInstall ? (
                  <Badge variant="secondary">Can Install</Badge>
                ) : (
                  <Badge variant="outline">Browser Only</Badge>
                )}
              </div>
            </div>

            {canInstall && !isInstalled && (
              <Button onClick={handleInstall} className="w-full" variant="default">
                <Download className="mr-2 h-4 w-4" />
                Install App
              </Button>
            )}

            {isInstalled && (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ App is installed on your device
              </p>
            )}
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Connection</CardTitle>
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
            </div>
            <CardDescription>Network connectivity status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                {isOnline ? (
                  <Badge variant="default" className="bg-green-600">Online</Badge>
                ) : (
                  <Badge variant="destructive">Offline</Badge>
                )}
              </div>
            </div>

            {!isOnline && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Working in offline mode. Changes will sync when online.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {notificationPermission === 'granted' ? (
                <Bell className="h-5 w-5 text-blue-600" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <CardDescription>Push notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Permission:</span>
                {notificationPermission === 'granted' ? (
                  <Badge variant="default" className="bg-blue-600">Granted</Badge>
                ) : notificationPermission === 'denied' ? (
                  <Badge variant="destructive">Denied</Badge>
                ) : (
                  <Badge variant="outline">Not Requested</Badge>
                )}
              </div>
            </div>

            {notificationPermission === 'default' && (
              <Button onClick={handleRequestNotifications} className="w-full" variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Enable Notifications
              </Button>
            )}

            {notificationPermission === 'granted' && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                ✓ Notifications enabled
              </p>
            )}
          </CardContent>
        </Card>

        {/* Background Sync */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Background Sync</CardTitle>
              <RefreshCw className="h-5 w-5 text-purple-600" />
            </div>
            <CardDescription>Offline data synchronization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Items:</span>
                <Badge variant="secondary">{syncStatus.pendingItems}</Badge>
              </div>
              {syncStatus.lastSyncTime && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Sync:</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={handleTriggerSync}
              className="w-full"
              variant="outline"
              disabled={syncStatus.pendingItems === 0}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </Button>
          </CardContent>
        </Card>

        {/* Service Worker */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Service Worker</CardTitle>
              {updateAvailable && (
                <Badge variant="default" className="bg-orange-600">Update Available</Badge>
              )}
            </div>
            <CardDescription>Caching and offline functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {updateAvailable && (
              <Button onClick={handleUpdate} className="w-full" variant="default">
                <Download className="mr-2 h-4 w-4" />
                Update App
              </Button>
            )}

            <Button onClick={handleClearCache} className="w-full" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Cache
            </Button>
          </CardContent>
        </Card>

        {/* Features List */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>PWA Features Implemented</CardTitle>
            <CardDescription>Complete list of Progressive Web App capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Offline Support</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Service Worker caching</li>
                  <li>✓ Network-first strategy for API</li>
                  <li>✓ Cache-first strategy for images</li>
                  <li>✓ Offline fallback pages</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Installation</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Install prompt UI</li>
                  <li>✓ App manifest configuration</li>
                  <li>✓ Home screen shortcuts</li>
                  <li>✓ Standalone display mode</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Notifications</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Push notification support</li>
                  <li>✓ Permission management</li>
                  <li>✓ Notification click handlers</li>
                  <li>✓ Background sync triggers</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Background Sync</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Queue offline actions</li>
                  <li>✓ Sync when back online</li>
                  <li>✓ IndexedDB storage</li>
                  <li>✓ Pending items tracking</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Caching Strategy</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Static asset caching</li>
                  <li>✓ Dynamic content caching</li>
                  <li>✓ Cache expiration</li>
                  <li>✓ Cache cleanup on update</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Mobile Optimized</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Responsive layouts</li>
                  <li>✓ Touch-friendly UI</li>
                  <li>✓ Optimized for performance</li>
                  <li>✓ Reduced data usage</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testing Guide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Testing Guide</CardTitle>
          <CardDescription>How to test PWA features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Test Offline Mode</h4>
            <p className="text-sm text-muted-foreground">
              Open DevTools → Network tab → Select "Offline" → Navigate the app
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">2. Test Installation</h4>
            <p className="text-sm text-muted-foreground">
              Click "Install App" button or use browser's install prompt (Chrome: three-dot menu → Install app)
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">3. Test Service Worker</h4>
            <p className="text-sm text-muted-foreground">
              Open DevTools → Application tab → Service Workers → Check status and caches
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">4. Test Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Enable notifications → Check browser permissions → Trigger test notification
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
