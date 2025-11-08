"use client";

import { useEffect } from 'react';
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';

export function ChannelSubscriber({ channels, onMessage }: {
  channels: string[];
  onMessage?: (msg: { type: string; data?: unknown }) => void;
}) {
  const { isReady, subscribe, unsubscribe } = useWebSocketConnection({
    callbacks: onMessage ? { onMessage } : undefined,
  });

  useEffect(() => {
    if (!isReady || !channels?.length) return undefined;
    subscribe(channels);
    return () => { unsubscribe(channels); };
  }, [isReady, channels, subscribe, unsubscribe]);

  return null;
}

export default ChannelSubscriber;
