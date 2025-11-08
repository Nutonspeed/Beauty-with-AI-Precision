'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineAlert(true);
      setShowOfflineAlert(false);

      // Hide alert after 3 seconds
      setTimeout(() => {
        setShowOnlineAlert(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
      setShowOnlineAlert(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineAlert && !showOnlineAlert) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      {showOfflineAlert && (
        <Alert variant="destructive" className="animate-in slide-in-from-top">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're offline. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}

      {showOnlineAlert && (
        <Alert className="animate-in slide-in-from-top bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            You're back online! Syncing data...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
