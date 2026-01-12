declare module 'ws' {
  interface WebSocket {
    isAlive: boolean;
    clientId?: string;
    userId?: string;
    role?: string;
    centerId?: string;
  }
}

export interface WebSocketMessage {
  type: string;
  data?: unknown;
  channels?: string[];
  [key: string]: unknown;
}

export interface ClientInfo {
  socket: WebSocket;
  clientId: string;
  userId: string;
  role: string;
  centerId: string;
  subscribedChannels: Set<string>;
}
