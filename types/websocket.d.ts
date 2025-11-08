declare module 'ws' {
  interface WebSocket {
    isAlive: boolean;
    clientId?: string;
    userId?: string;
    role?: string;
    clinicId?: string;
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
  clinicId: string;
  subscribedChannels: Set<string>;
}
