"use client";

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';
import type { WebSocketMessage } from '@/types/websocket';

const ANNOUNCEMENT_CHANNEL = 'system:announcements';

interface AnnouncementMessage extends WebSocketMessage {
  type: 'ANNOUNCEMENT';
  data?: {
    message: string;
    at?: string;
  };
}

export function AnnouncementSubscriber() {
  const t = useTranslations('notifications.announcements');
  const handleMessage = useCallback((msg: WebSocketMessage) => {
    if (msg.type === 'ANNOUNCEMENT') {
      const announcement = msg as AnnouncementMessage;
      const text = announcement.data?.message || t('defaultTitle');
      toast.info(text, { 
        description: announcement.data?.at,
        duration: 5000,
      });
    }
  }, [t]);

  const { isReady, subscribe, unsubscribe, sendMessage } = useWebSocketConnection({
    callbacks: {
      onMessage: handleMessage,
    },
  });

  // Subscribe to announcements
  useEffect(() => {
    if (!isReady) return;
    
    subscribe([ANNOUNCEMENT_CHANNEL]);
    
    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      sendMessage({ type: 'PING' });
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      unsubscribe([ANNOUNCEMENT_CHANNEL]);
    };
  }, [isReady, subscribe, unsubscribe, sendMessage]);

  return null;
}

export default AnnouncementSubscriber;
