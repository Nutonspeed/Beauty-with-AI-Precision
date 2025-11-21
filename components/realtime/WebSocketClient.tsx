"use client";

import { useEffect, useRef, useCallback, useState, createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { NotificationPayload } from '@/lib/realtime/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

interface WebSocketCallbacks {
  // Connection events
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onReconnect?: (attempt: number) => void;
  
  // Message handlers
  onNewBooking?: (data: any) => void;
  onBookingUpdated?: (data: any) => void;
  onNewMessage?: (data: any) => void;
  onSystemAlert?: (data: any) => void;
  
  // Custom message handler for other message types
  onMessage?: (message: NotificationPayload) => void;
}

interface UseWebSocketOptions extends WebSocketCallbacks {
  // Whether to automatically connect when the component mounts
  autoConnect?: boolean;
  // Maximum number of reconnection attempts (0 for unlimited)
  maxReconnectAttempts?: number;
  // Delay between reconnection attempts in milliseconds
  reconnectInterval?: number;
  // Whether to show toast notifications for different events
  showToasts?: boolean;
}

export function useWebSocket({
  autoConnect = true,
  maxReconnectAttempts = 5,
  reconnectInterval = 3000,
  showToasts = true,
  ...callbacks
}: UseWebSocketOptions = {}) {
  const { data: session, status } = useSession();
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const isConnecting = useRef(false);
  const _router = useRouter();
  const { toast } = useToast();
  const callbacksRef = useRef(callbacks);
  const [isConnected, setIsConnected] = useState(false);
  
  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const connect = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.id || isConnecting.current) {
      return;
    }

    isConnecting.current = true;
    
    try {
      // Close existing connection if any
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }

      // Get a fresh session token
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();
      const token = sessionData?.accessToken;
      
      if (!token) {
        throw new Error('No access token available');
      }

      const wsUrl = new URL(WS_URL);
      wsUrl.searchParams.append('userId', session.user.id);
      wsUrl.searchParams.append('token', token);
      
      const socket = new WebSocket(wsUrl.toString());
      ws.current = socket;

      socket.onopen = () => {
        console.log('[WebSocket] Connected');
        reconnectAttempts.current = 0;
        isConnecting.current = false;
        setIsConnected(true);
        callbacksRef.current.onReconnect?.(reconnectAttempts.current);
        
        if (showToasts) {
          toast({
            title: 'Connected',
            description: 'Real-time updates are now active',
            variant: 'default',
          });
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as NotificationPayload;
          const { type, data } = message;
          
          // Call the general message handler if provided
          callbacksRef.current.onMessage?.(message);
          
          // Handle specific message types
          switch (type) {
            case 'NEW_BOOKING':
              callbacksRef.current.onNewBooking?.(data);
              if (showToasts) {
                toast({
                  title: 'New Booking',
                  description: `New booking received for ${data.serviceName || 'a service'}`,
                  variant: 'default',
                });
              }
              break;
              
            case 'BOOKING_UPDATED':
            case 'YOUR_BOOKING_UPDATED':
              callbacksRef.current.onBookingUpdated?.(data);
              if (showToasts && data.status) {
                toast({
                  title: type === 'YOUR_BOOKING_UPDATED' ? 'Your Booking Updated' : 'Booking Updated',
                  description: `Status: ${data.status}`,
                  variant: 'default',
                });
              }
              break;
              
            case 'NEW_MESSAGE':
              callbacksRef.current.onNewMessage?.(data);
              if (showToasts) {
                toast({
                  title: 'New Message',
                  description: data.content || 'You have a new message',
                  variant: 'default',
                });
              }
              break;
              
            case 'SYSTEM_ALERT':
              callbacksRef.current.onSystemAlert?.(data);
              if (showToasts) {
                toast({
                  title: data.title || 'System Alert',
                  description: data.message,
                  variant: data.severity || 'default',
                });
              }
              break;
              
            default:
              console.log('Unhandled message type:', type);
          }
        } catch (error) {
          console.error('Error processing message:', error, event.data);
        }
      };

      socket.onclose = (event) => {
        console.log('[WebSocket] Disconnected', event.code, event.reason);
        isConnecting.current = false;
        setIsConnected(false);
        callbacksRef.current.onClose?.(event);
        
        // Don't attempt to reconnect if closed normally
        if (event.code === 1000) {
          return;
        }
        
        // Attempt to reconnect if we haven't reached max attempts
        const shouldReconnect = maxReconnectAttempts === 0 || reconnectAttempts.current < maxReconnectAttempts;
        
        if (shouldReconnect) {
          reconnectAttempts.current++;
          const delay = Math.min(reconnectInterval * Math.pow(1.5, reconnectAttempts.current - 1), 30000); // Exponential backoff with max 30s
          
          console.log(`[WebSocket] Reconnecting in ${delay}ms... (attempt ${reconnectAttempts.current}${maxReconnectAttempts > 0 ? `/${maxReconnectAttempts}` : ''})`);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, delay);
          
          if (showToasts && reconnectAttempts.current === 1) {
            toast({
              title: 'Connection lost',
              description: 'Attempting to reconnect...',
              variant: 'destructive',
            });
          }
        } else if (showToasts) {
          toast({
            title: 'Connection failed',
            description: 'Unable to connect to the server. Please refresh the page to try again.',
            variant: 'destructive',
          });
        }
      };
      
      socket.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        isConnecting.current = false;
        callbacksRef.current.onError?.(error);
        
        if (showToasts) {
          toast({
            title: 'Connection error',
            description: 'There was a problem with the connection',
            variant: 'destructive',
          });
        }
      };
      
      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close(1000, 'Component unmounted');
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      isConnecting.current = false;
      
      if (showToasts) {
        toast({
          title: 'Connection error',
          description: 'Failed to establish WebSocket connection',
          variant: 'destructive',
        });
      }
    }
  }, [session?.user?.id, status, showToasts, reconnectInterval, maxReconnectAttempts, toast]);

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Cleanup function
    return () => {
      if (ws.current) {
        ws.current.close(1000, 'Component unmounted');
        ws.current = null;
      }
      
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      
      reconnectAttempts.current = 0;
      isConnecting.current = false;
    };
  }, [connect, autoConnect]);
  
  // Reconnect when session changes
  useEffect(() => {
    if (autoConnect && status === 'authenticated') {
      connect();
    }
  }, [status, connect, autoConnect]);
  
  // Send message function
  const sendMessage = useCallback((type: string, data?: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = { type, data, timestamp: new Date().toISOString() };
      ws.current.send(JSON.stringify(message));
      return true;
    }
    
    if (showToasts) {
      toast({
        title: 'Not connected',
        description: 'Unable to send message - not connected to server',
        variant: 'destructive',
      });
    }
    
    return false;
  }, [showToasts, toast]);
  
  // Subscribe to channels
  const subscribe = useCallback((channels: string | string[]) => {
    const channelsArray = Array.isArray(channels) ? channels : [channels];
    return sendMessage('SUBSCRIBE', { channels: channelsArray });
  }, [sendMessage]);
  
  // Unsubscribe from channels
  const unsubscribe = useCallback((channels: string | string[]) => {
    const channelsArray = Array.isArray(channels) ? channels : [channels];
    return sendMessage('UNSUBSCRIBE', { channels: channelsArray });
  }, [sendMessage]);
  
  // Connection status is now managed by state above
  
  return { 
    // Connection
    connect,
    disconnect: () => {
      if (ws.current) {
        ws.current.close(1000, 'User disconnected');
      }
    },
    isConnected,
    isConnecting: isConnecting.current,
    reconnectAttempts: reconnectAttempts.current,
    
    // Messaging
    sendMessage,
    subscribe,
    unsubscribe,
    
    // Current connection
    connection: ws.current,
  };
}

/**
 * WebSocket Provider Component
 * 
 * Wrap your app with this provider to enable WebSocket connections throughout your application.
 * Automatically handles reconnection and provides WebSocket context to child components.
 */
export function WebSocketProvider({ 
  children,
  options = {}
}: { 
  children: React.ReactNode;
  options?: Partial<UseWebSocketOptions>;
}) {
  const { isConnected, isConnecting, reconnectAttempts } = useWebSocket({
    autoConnect: true,
    showToasts: true,
    ...options,
    // Don't show toasts for the provider's connection status
    // as it might conflict with the actual usage in components
    onReconnect: (attempt) => {
      console.log(`[WebSocket] Reconnected (attempt ${attempt})`);
      options.onReconnect?.(attempt);
    },
    onError: (error) => {
      console.error('[WebSocket] Error:', error);
      options.onError?.(error);
    },
    onClose: (event) => {
      console.log('[WebSocket] Connection closed:', event.code, event.reason);
      options.onClose?.(event);
    },
  });

  // You can add a loading state or connection indicator here if needed
  return (
    <WebSocketContext.Provider value={{
      isConnected,
      isConnecting,
      reconnectAttempts,
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Create a context for WebSocket connection status
interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Custom hook to access WebSocket context
export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
