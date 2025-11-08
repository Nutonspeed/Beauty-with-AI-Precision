'use client';

/**
 * Offline Indicator Component
 * Shows connection status and pending sync count
 * 
 * Features:
 * - Real-time connection status
 * - Pending sync count badge
 * - Manual sync button
 * - Sync progress indicator
 */

import { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { getBackgroundSyncManager } from '@/lib/sync/background-sync';
import { getIndexedDB } from '@/lib/db/indexed-db';
import type { SyncProgress } from '@/lib/sync/background-sync';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Initialize online status
    setIsOnline(navigator.onLine);

    // Setup online/offline listeners
    const handleOnline = () => {
      console.log('[OfflineIndicator] Connection restored');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[OfflineIndicator] Connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Setup sync progress listener
    const syncManager = getBackgroundSyncManager();
    const unsubscribe = syncManager.subscribe((progress) => {
      setSyncProgress(progress);

      if (!progress.in_progress && progress.completed > 0) {
        setLastSyncTime(new Date());
      }
    });

    // Update pending count periodically
    const updatePendingCount = async () => {
      try {
        const indexedDB = getIndexedDB();
        await indexedDB.initialize();
        const actions = await indexedDB.getPendingSyncActions();
        setPendingCount(actions.length);
      } catch (error) {
        console.error('[OfflineIndicator] Failed to get pending count:', error);
      }
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Manual sync trigger
  const handleManualSync = async () => {
    if (!isOnline) {
      alert('Cannot sync while offline. Please check your connection.');
      return;
    }

    try {
      const syncManager = getBackgroundSyncManager();
      const result = await syncManager.syncAll();

      if (result.success) {
        alert(`Sync completed: ${result.synced_count} items synced`);
      } else {
        alert(
          `Sync completed with errors:\n${result.synced_count} synced, ${result.failed_count} failed`
        );
      }
    } catch (error) {
      console.error('[OfflineIndicator] Manual sync failed:', error);
      alert('Sync failed. Please try again later.');
    }
  };

  // Don't show if online and no pending items
  if (isOnline && pendingCount === 0 && !syncProgress?.in_progress) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
          bg-white dark:bg-gray-800 
          border-2 rounded-lg shadow-lg
          transition-all duration-300
          ${isOnline ? 'border-green-500' : 'border-orange-500'}
          ${showDetails ? 'w-80' : 'w-auto'}
        `}
      >
        {/* Compact View */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-3 p-3 w-full hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {/* Status Icon */}
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-orange-500" />
          )}

          {/* Status Text */}
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isOnline ? 'Online' : 'Offline'}
            </div>
            {pendingCount > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {pendingCount} pending {pendingCount === 1 ? 'item' : 'items'}
              </div>
            )}
          </div>

          {/* Sync Progress */}
          {syncProgress?.in_progress && (
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
          )}

          {/* Pending Count Badge */}
          {pendingCount > 0 && !syncProgress?.in_progress && (
            <span className="bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Detailed View */}
        {showDetails && (
          <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700">
            {/* Connection Status */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {isOnline ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Pending Items */}
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    {pendingCount} {pendingCount === 1 ? 'item' : 'items'} waiting to sync
                  </span>
                </div>
              )}

              {/* Last Sync Time */}
              {lastSyncTime && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last synced: {lastSyncTime.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Sync Progress Bar */}
            {syncProgress?.in_progress && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Syncing...</span>
                  <span>
                    {syncProgress.completed}/{syncProgress.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (syncProgress.completed / syncProgress.total) * 100
                      }%`,
                    }}
                  />
                </div>
                {syncProgress.current_action && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {syncProgress.current_action}
                  </div>
                )}
              </div>
            )}

            {/* Manual Sync Button */}
            {!syncProgress?.in_progress && isOnline && pendingCount > 0 && (
              <button
                onClick={handleManualSync}
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Sync Now
              </button>
            )}

            {/* Offline Message */}
            {!isOnline && (
              <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs text-orange-700 dark:text-orange-300">
                You're offline. Changes will sync automatically when you're back online.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
