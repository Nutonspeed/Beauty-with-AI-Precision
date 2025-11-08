import { WebSocket } from 'ws';

export interface Client {
  socket: WebSocket;
  userId: string;
  clinicId: string;
  role: string;
  clientId: string;
  lastActivity?: number;
  subscribedChannels?: string[];
}

export interface NotificationPayload {
  type: 'NEW_BOOKING' | 'BOOKING_UPDATED' | 'NEW_MESSAGE' | 'SYSTEM_ALERT' | 'CONNECTION_ESTABLISHED' | 'YOUR_BOOKING_UPDATED';
  data: any;
  timestamp: string;
  clinicId: string;
  targetRoles?: string[];
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface Booking {
  id: string;
  clinic_id: string;
  customer_id?: string;
  assigned_staff_id?: string;
  status: string;
  booking_date: string;
  price: number;
  // Add other booking fields as needed
}

export interface Message {
  id: string;
  clinic_id: string;
  sender_id: string;
  recipient_id?: string;
  content: string;
  created_at: string;
  // Add other message fields as needed
}
