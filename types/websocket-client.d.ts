import { LeadNotification, NotificationCallback, ConnectionStatus } from '@/lib/websocket-client';

declare module '@/lib/websocket-client' {
  interface WebSocketClient {
    // Existing methods
    connect(): void;
    disconnect(): void;
    onStatusChange(callback: (status: ConnectionStatus) => void): () => void;
    
    // Event emitter methods
    on(event: 'message', callback: NotificationCallback): void;
    off(event: 'message', callback: NotificationCallback): void;
    
    // Additional methods that might be needed
    isConnected(): boolean;
  }
}

export {};
