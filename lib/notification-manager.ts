/**
 * Notification Manager
 * Real-time notification system for appointments and messages
 */

import wsClient, { type WebSocketClient } from './websocket-client';

export type NotificationType = 'appointment' | 'message' | 'system' | 'alert';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
}

export interface NotificationEventHandlers {
  onNotificationReceived?: (notification: Notification) => void;
  onNotificationRead?: (notificationId: string) => void;
  onNotificationCleared?: (notificationId: string) => void;
  onAllCleared?: () => void;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

export class NotificationManager {
  private wsClient: WebSocketClient;
  private notifications: Map<string, Notification> = new Map();
  private handlers: NotificationEventHandlers = {};
  private userId: string | null = null;
  private maxNotifications: number = 100;

  constructor() {
    this.wsClient = wsClient;
    
    // Set up message handler
    this.wsClient.on('message', (message: any) => {
      this.handleNotificationMessage(message);
    });
  }

  /**
   * Initialize notification system
   */
  initialize(userId: string, handlers: NotificationEventHandlers): void {
    this.userId = userId;
    this.handlers = handlers;

    console.log(`[Notifications] Initialized for user: ${userId}`);
  }

  /**
   * Handle incoming notification messages
   */
  private handleNotificationMessage(data: any): void {
    switch (data.type) {
      case 'notification':
        this.addNotification(data.data);
        break;
      case 'notification_read':
        this.markAsRead(data.data.notificationId);
        break;
      case 'notification_cleared':
        this.removeNotification(data.data.notificationId);
        break;
      case 'notifications_cleared':
        this.clearAll();
        break;
    }
  }

  /**
   * Add a new notification
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      timestamp: Date.now(),
      read: false
    };

    this.notifications.set(newNotification.id, newNotification);

    // Enforce max notifications limit
    if (this.notifications.size > this.maxNotifications) {
      const oldestId = Array.from(this.notifications.keys())[0];
      this.notifications.delete(oldestId);
    }

    // Call handler
    if (this.handlers.onNotificationReceived) {
      this.handlers.onNotificationReceived(newNotification);
    }

    console.log(`[Notifications] Added: ${newNotification.title}`);
    return newNotification;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification && !notification.read) {
      notification.read = true;

      // Notify server
      this.wsClient.send('notification_read', {
        userId: this.userId,
        notificationId,
        timestamp: Date.now()
      });

      // Call handler
      if (this.handlers.onNotificationRead) {
        this.handlers.onNotificationRead(notificationId);
      }

      console.log(`[Notifications] Marked as read: ${notificationId}`);
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    let count = 0;
    for (const notification of this.notifications.values()) {
      if (!notification.read) {
        notification.read = true;
        count++;
      }
    }

    if (count > 0) {
      // Notify server
      this.wsClient.send('notifications_mark_all_read', {
        userId: this.userId,
        timestamp: Date.now()
      });

      console.log(`[Notifications] Marked ${count} notifications as read`);
    }
  }

  /**
   * Remove a notification
   */
  removeNotification(notificationId: string): void {
    if (this.notifications.delete(notificationId)) {
      // Notify server
      this.wsClient.send('notification_cleared', {
        userId: this.userId,
        notificationId,
        timestamp: Date.now()
      });

      // Call handler
      if (this.handlers.onNotificationCleared) {
        this.handlers.onNotificationCleared(notificationId);
      }

      console.log(`[Notifications] Removed: ${notificationId}`);
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications.clear();

    // Notify server
    this.wsClient.send('notifications_cleared', {
      userId: this.userId,
      timestamp: Date.now()
    });

    // Call handler
    if (this.handlers.onAllCleared) {
      this.handlers.onAllCleared();
    }

    console.log('[Notifications] Cleared all notifications');
  }

  /**
   * Get all notifications
   */
  getAllNotifications(): Notification[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    return this.getAllNotifications().filter(n => !n.read);
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: NotificationType): Notification[] {
    return this.getAllNotifications().filter(n => n.type === type);
  }

  /**
   * Get notifications by priority
   */
  getNotificationsByPriority(priority: NotificationPriority): Notification[] {
    return this.getAllNotifications().filter(n => n.priority === priority);
  }

  /**
   * Get notification statistics
   */
  getStats(): NotificationStats {
    const all = this.getAllNotifications();
    
    const stats: NotificationStats = {
      total: all.length,
      unread: all.filter(n => !n.read).length,
      byType: {
        appointment: 0,
        message: 0,
        system: 0,
        alert: 0
      },
      byPriority: {
        low: 0,
        normal: 0,
        high: 0,
        urgent: 0
      }
    };

    for (const notification of all) {
      stats.byType[notification.type]++;
      stats.byPriority[notification.priority]++;
    }

    return stats;
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  /**
   * Get notification by ID
   */
  getNotification(notificationId: string): Notification | undefined {
    return this.notifications.get(notificationId);
  }

  /**
   * Check if notification exists
   */
  hasNotification(notificationId: string): boolean {
    return this.notifications.has(notificationId);
  }

  /**
   * Cleanup and disconnect
   */
  destroy(): void {
    // Cleanup - the WebSocket client will handle disconnection
    this.notifications.clear();
    this.handlers = {};
    this.userId = null;

    console.log('[Notifications] Destroyed');
  }
}
