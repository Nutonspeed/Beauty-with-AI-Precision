import wsClient, { WebSocketClient } from '../websocket-client';

export type {
  LeadNotification,
  NotificationCallback,
  NotificationType,
  PriorityLevel
} from '../websocket-client';

export { wsClient, WebSocketClient };

export default wsClient;
