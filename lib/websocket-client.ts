/**
 * WebSocket Client Manager for Real-time Lead Notifications
 * 
 * Integrates with Push Notification Manager and Reconnection Manager
 */

import { getPushNotificationManager } from './push-notification-manager';
import { ReconnectionManager, ConnectionStatus } from './reconnection-manager';

export type NotificationType = 'new_lead' | 'status_change' | 'high_priority';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface LeadNotification {
  id: string;
  leadId: string;
  leadName: string;
  type: NotificationType;
  priority: PriorityLevel;
  priorityScore: number;
  message: string;
  timestamp: Date;
  leadData?: {
    age: number;
    score: number;
    isOnline: boolean;
    estimatedValue: number;
    skinType: string;
    lastActivity: string;
    analysisTimestamp: Date;
    engagementCount: number;
  };
}

export type NotificationCallback = (notification: LeadNotification) => void;

type EventType = 'message' | 'connect' | 'disconnect';
type EventListener = (...args: any[]) => void;

export class WebSocketClient {
  private eventListeners: Map<EventType, Set<EventListener>> = new Map();
  private _connected: boolean = false;
  private listeners: NotificationCallback[] = [];
  private simulationInterval: NodeJS.Timeout | null = null;
  private mockLeadCounter: number = 5;
  private reconnectionManager: ReconnectionManager;
  private messageQueue: any[] = [];

  constructor() {
    this.reconnectionManager = new ReconnectionManager({
      maxRetries: 10,
      initialDelay: 1000,
      maxDelay: 32000,
      backoffMultiplier: 2
    });

    this.loadPersistedQueue();
  }

  private async loadPersistedQueue() {
    try {
      await this.reconnectionManager.loadPersistedQueue();
    } catch (error) {
      console.error('Failed to load persisted queue:', error);
    }
  }

  public get connected(): boolean {
    return this._connected;
  }

  // Event emitter methods
  on(event: EventType, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(listener);
  }

  off(event: EventType, listener: EventListener): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emit(event: EventType, ...args: any[]): void {
    this.eventListeners.get(event)?.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Connect to WebSocket server (simulated for demo)
   */
  connect(): void {
    if (this.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log('[WebSocket] Connecting...');
    
    // Simulate connection delay
    setTimeout(() => {
      this._connected = true;
      this.emit('connect');
      console.log('[WebSocket] Connected successfully');
      
      // Reset reconnection manager
      this.reconnectionManager.reset();
      
      // Replay queued messages
      this.replayQueuedMessages();
      
      // Start mock notification simulation
      this.startMockNotifications();
    }, 1000);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (!this.connected) {
      console.log('[WebSocket] Not connected');
      return;
    }

    console.log('[WebSocket] Disconnecting...');
    this._connected = false;
    this.emit('disconnect');
    
    // Cancel reconnection
    this.reconnectionManager.cancel();
    
    // Stop mock notifications
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    console.log('[WebSocket] Disconnected');
  }

  /**
   * Handle connection loss and schedule reconnection
   */
  private handleConnectionLoss(): void {
    if (!this.connected) return;

    console.log('[WebSocket] Connection lost');
    this._connected = false;
    this.emit('disconnect');
    
    // Stop mock notifications
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    // Schedule reconnection
    this.reconnectionManager.scheduleReconnect(() => this.reconnect());
  }

  /**
   * Reconnect to WebSocket server
   */
  private async reconnect(): Promise<void> {
    console.log('[WebSocket] Reconnecting...');
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 80% success rate for testing
        if (Math.random() > 0.2) {
          this._connected = true;
          this.emit('connect');
          console.log('[WebSocket] Reconnected successfully');
          
          // Reset reconnection manager
          this.reconnectionManager.reset();
          
          // Replay queued messages
          this.replayQueuedMessages();
          
          // Restart mock notifications
          this.startMockNotifications();
          
          resolve();
        } else {
          reject(new Error('Connection failed'));
        }
      }, 500);
    });
  }

  /**
   * Replay queued messages after reconnection
   */
  private async replayQueuedMessages(): Promise<void> {
    await this.reconnectionManager.replayQueue(async (type, payload) => {
      console.log('[WebSocket] Replaying message:', type, payload);
      // In real implementation, send to actual WebSocket server
      // For now, just log it
    });
  }

  /**
   * Send message (with offline queueing)
   */
  send(type: string, payload: unknown): void {
    if (!this.connected) {
      console.log('[WebSocket] Offline - queueing message');
      this.reconnectionManager.queueMessage(type, payload);
      return;
    }

    console.log('[WebSocket] Sending:', type, payload);
    // In real implementation, send to actual WebSocket server
  }

  /**
   * Subscribe to connection status updates
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    return this.reconnectionManager.onStatusChange(callback);
  }

  /**
   * Get reconnection statistics
   */
  getReconnectionStats() {
    return this.reconnectionManager.getStats();
  }

  /**
   * Subscribe to notifications
   */
  subscribe(callback: NotificationCallback): () => void {
    this.listeners.push(callback);
    console.log('[WebSocket] Subscriber added. Total:', this.listeners.length);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      console.log('[WebSocket] Subscriber removed. Total:', this.listeners.length);
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Public method to listen to events
   */
  public addEventListener(event: EventType, listener: EventListener): void {
    this.on(event, listener);
  }

  /**
   * Public method to stop listening to events
   */
  public removeEventListener(event: EventType, listener: EventListener): void {
    this.off(event, listener);
  }

  /**
   * Emit notification to all listeners
   */
  private async emitNotification(notification: LeadNotification): Promise<void> {
    
    // Send to push notification manager for offline storage
    try {
      const pushManager = getPushNotificationManager();
      await pushManager.relayWebSocketMessage(notification);
      
      // Show push notification if appropriate
      if (notification.priority === 'critical' || notification.priority === 'high') {
        await pushManager.showWebSocketNotification(
          `${notification.type === 'new_lead' ? '🆕 New Lead' : notification.type === 'high_priority' ? '⚡ High Priority' : '📊 Status Change'}`,
          notification.message,
          {
            leadId: notification.leadId,
            type: notification.type,
            priority: notification.priority,
            url: '/sales/dashboard'
          }
        );
      }
    } catch (error) {
      console.warn('[WebSocket] Failed to relay to push manager:', error);
    }
    
    // Emit to listeners
    for (const callback of this.listeners) {
      try {
        callback(notification);
      } catch (error) {
        console.error('[WebSocket] Error in callback:', error);
      }
    }
  }

  /**
   * Start mock notification simulation (for demo purposes)
   * In production, replace this with actual WebSocket event handling
   */
  private startMockNotifications(): void {
    // Random interval between 20-60 seconds
    const getRandomInterval = () => Math.random() * 40000 + 20000;

    const scheduleNext = () => {
      const interval = getRandomInterval();
      console.log(`[WebSocket] Next mock notification in ${(interval / 1000).toFixed(0)}s`);

      this.simulationInterval = setTimeout(() => {
        if (this.connected) {
          this.generateMockNotification();
          scheduleNext(); // Schedule next notification
        }
      }, interval);
    };

    // Start first notification after 10 seconds
    this.simulationInterval = setTimeout(() => {
      if (this.connected) {
        this.generateMockNotification();
        scheduleNext();
      }
    }, 10000);
  }

  /**
   * Generate mock notification (for demo)
   */
  private generateMockNotification(): void {
    const mockNames = [
      'Natalie Thompson',
      'Amanda Chen',
      'Jennifer Park',
      'Rachel Kim',
      'Sophia Martinez',
      'Olivia Brown',
      'Isabella Garcia',
      'Mia Rodriguez',
      'Charlotte Lee',
      'Amelia Taylor'
    ];

    const mockSkinTypes = ['Combination', 'Dry', 'Oily', 'Sensitive', 'Normal'];

    // Random type (70% new_lead, 20% status_change, 10% high_priority)
    const rand = Math.random();
    let type: NotificationType;
    if (rand < 0.7) {
      type = 'new_lead';
    } else if (rand < 0.9) {
      type = 'status_change';
    } else {
      type = 'high_priority';
    }

    // Generate random lead data
    const score = Math.floor(Math.random() * 40) + 50; // 50-90
    const isOnline = Math.random() > 0.3; // 70% online
    const estimatedValue = Math.floor(Math.random() * 60000) + 30000; // 30K-90K
    const engagementCount = Math.floor(Math.random() * 8) + 1; // 1-8
    const age = Math.floor(Math.random() * 20) + 25; // 25-45

    // Calculate priority based on factors (simplified)
    let priorityScore = 0;
    if (isOnline) priorityScore += 50;
    if (score < 60) priorityScore += 50;
    else if (score < 70) priorityScore += 30;
    else if (score < 80) priorityScore += 15;
    if (estimatedValue >= 75000) priorityScore += 30;
    else if (estimatedValue >= 50000) priorityScore += 20;
    else if (estimatedValue >= 30000) priorityScore += 10;
    priorityScore += 15; // Fresh analysis
    if (engagementCount >= 5) priorityScore += 20;
    else if (engagementCount >= 3) priorityScore += 10;
    else priorityScore += 5;

    // Determine priority level
    let priority: PriorityLevel;
    if (priorityScore >= 100) priority = 'critical';
    else if (priorityScore >= 70) priority = 'high';
    else if (priorityScore >= 40) priority = 'medium';
    else priority = 'low';

    // Generate message based on type
    const leadName = mockNames[Math.floor(Math.random() * mockNames.length)];
    let message: string;
    
    if (type === 'new_lead') {
      message = `New lead: ${leadName} completed skin analysis`;
    } else if (type === 'status_change') {
      message = `${leadName} is now online`;
    } else {
      message = `🔥 High-priority lead: ${leadName} (Score: ${priorityScore})`;
    }

    const notification: LeadNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      leadId: `lead_${this.mockLeadCounter++}`,
      leadName,
      type,
      priority,
      priorityScore,
      message,
      timestamp: new Date(),
      leadData: {
        age,
        score,
        isOnline,
        estimatedValue,
        skinType: mockSkinTypes[Math.floor(Math.random() * mockSkinTypes.length)],
        lastActivity: 'Just now',
        analysisTimestamp: new Date(),
        engagementCount
      }
    };

    this.emit('message', notification);
  }
}

// Singleton instance
const wsClient = new WebSocketClient();

// Expose event methods on singleton
export const wsClientInstance = {
  ...wsClient,
  on: wsClient['on'].bind(wsClient),
  off: wsClient['off'].bind(wsClient)
};

export default wsClient;
