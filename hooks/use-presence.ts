'use client';

import { useEffect, useState } from 'react';
import { PresenceManager, UserPresence, PresenceUpdate } from '@/lib/presence-manager';

interface UsePresenceOptions {
  userId: string;
  userName: string;
  enabled?: boolean;
}

export function usePresence({ userId, userName, enabled = true }: UsePresenceOptions) {
  const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(new Map());
  const [onlineCount, setOnlineCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const presenceManager = new PresenceManager();

    // Start tracking with handlers
    presenceManager.startTracking(userId, userName, {
      onPresenceUpdate: (update: PresenceUpdate) => {
        // Update presence map
        setPresenceMap(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(update.userId);
          
          newMap.set(update.userId, {
            userId: update.userId,
            userName: update.userName,
            status: update.status,
            lastSeen: update.timestamp,
            lastHeartbeat: existing?.lastHeartbeat || update.timestamp
          });

          return newMap;
        });

        // Update online count
        setOnlineCount(presenceManager.getOnlineCount());
      },

      onUserOnline: (userId: string, userName: string) => {
        console.log(`[Presence] User online: ${userName}`);
      },

      onUserOffline: (userId: string, userName: string) => {
        console.log(`[Presence] User offline: ${userName}`);
      },

      onUserAway: (userId: string, userName: string) => {
        console.log(`[Presence] User away: ${userName}`);
      }
    });

    // Start stale presence check
    presenceManager.startStaleCheck();

    setIsTracking(true);

    return () => {
      presenceManager.destroy();
      setIsTracking(false);
    };
  }, [userId, userName, enabled]);

  const getUserPresence = (targetUserId: string): UserPresence | null => {
    return presenceMap.get(targetUserId) || null;
  };

  const isUserOnline = (targetUserId: string): boolean => {
    const presence = presenceMap.get(targetUserId);
    return presence?.status === 'online';
  };

  const getLastSeen = (targetUserId: string): number | null => {
    const presence = presenceMap.get(targetUserId);
    return presence?.lastSeen || null;
  };

  const formatLastSeen = (targetUserId: string): string => {
    const presence = presenceMap.get(targetUserId);
    if (!presence) return 'Unknown';

    if (presence.status === 'online') return 'Online now';

    const now = Date.now();
    const diff = now - presence.lastSeen;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Periodically refresh presence map from manager
  useEffect(() => {
    if (!enabled || !isTracking) return;

    const presenceManager = new PresenceManager();
    const interval = setInterval(() => {
      const currentPresence = presenceManager.getAllPresence();
      setPresenceMap(currentPresence);
      setOnlineCount(presenceManager.getOnlineCount());
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [enabled, isTracking]);

  return {
    presenceMap,
    onlineCount,
    isTracking,
    getUserPresence,
    isUserOnline,
    getLastSeen,
    formatLastSeen,
    allUsers: Array.from(presenceMap.values())
  };
}
