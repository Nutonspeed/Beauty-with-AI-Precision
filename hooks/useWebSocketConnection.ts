'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// WebSocket message type
export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

// WebSocket callbacks interface
export interface WebSocketCallbacks {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onReconnect?: () => void;
}

// WebSocket connection state
export enum ReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

interface UseWebSocketConnectionOptions {
  autoConnect?: boolean;
  callbacks?: WebSocketCallbacks;
}

export function useWebSocketConnection(options: UseWebSocketConnectionOptions = {}) {
  // Temporarily disable WebSocket in development until Supabase auth integration is complete
  const { autoConnect = false, callbacks = {} } = options;
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const messageQueue = useRef<WebSocketMessage[]>([]);
  const isConnecting = useRef<boolean>(false);
  const [readyState, setReadyState] = useState<ReadyState>(ReadyState.CLOSED);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch WebSocket configuration
  const { data: wsConfig, isLoading } = useQuery({
    queryKey: ['ws-config'],
    queryFn: async () => {
      const res = await fetch('/api/ws/auth');
      if (!res.ok) throw new Error('Failed to fetch WebSocket config');
      return res.json();
    },
    enabled: autoConnect,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Set WebSocket URL
  useEffect(() => {
    if (wsConfig?.wsUrl && wsConfig?.token) {
      const url = new URL(wsConfig.wsUrl);
      url.searchParams.set('token', wsConfig.token);
      setSocketUrl(url.toString());
    } else if (process.env.NEXT_PUBLIC_WS_URL) {
      setSocketUrl(process.env.NEXT_PUBLIC_WS_URL);
    }
  }, [wsConfig]);

  // Send message function
  const sendMessage = useCallback((message: WebSocketMessage): boolean => {
    const messageStr = JSON.stringify(message);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(messageStr);
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    } else {
      // Queue message if not connected
      messageQueue.current.push(message);
      return false;
    }
  }, []);

  // Subscribe to channels
  const subscribe = useCallback((channels: string[]) => {
    return sendMessage({ type: 'SUBSCRIBE', channels });
  }, [sendMessage]);

  // Unsubscribe from channels
  const unsubscribe = useCallback((channels: string[]) => {
    return sendMessage({ type: 'UNSUBSCRIBE', channels });
  }, [sendMessage]);

  // WebSocket connection management
  useEffect(() => {
    if (!socketUrl) return;

    const connect = () => {
      if (isConnecting.current) return;
      isConnecting.current = true;
      
      try {
        const ws = new WebSocket(socketUrl);
        wsRef.current = ws;
        setReadyState(ReadyState.CONNECTING);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setReadyState(ReadyState.OPEN);
          isConnecting.current = false;
          reconnectAttempts.current = 0;
          callbacks.onOpen?.();
          
          // Send queued messages
          messageQueue.current.forEach(msg => sendMessage(msg));
          messageQueue.current = [];
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            callbacks.onMessage?.(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setReadyState(ReadyState.CLOSED);
          isConnecting.current = false;
          callbacks.onClose?.();

          // Try to reconnect
          if (reconnectAttempts.current < 5) {
            reconnectAttempts.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            reconnectTimeout.current = setTimeout(connect, delay);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          callbacks.onError?.(error);
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        isConnecting.current = false;
        setReadyState(ReadyState.CLOSED);
      }
    };

    if (autoConnect) {
      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [socketUrl, autoConnect, callbacks, sendMessage]);

  return {
    isReady: readyState === ReadyState.OPEN,
    isConnected: readyState === ReadyState.OPEN,
    isConnecting: readyState === ReadyState.CONNECTING,
    isDisconnected: readyState === ReadyState.CLOSED,
    isLoading,
    sendMessage,
    subscribe,
    unsubscribe,
    readyState,
    getWebSocket: () => wsRef.current,
  } as const;
}
