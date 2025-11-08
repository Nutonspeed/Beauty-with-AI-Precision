/**
 * Notification Manager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationManager, Notification, NotificationType, NotificationPriority } from '@/lib/notification-manager';

// Mock WebSocketClient
vi.mock('@/lib/websocket-client', () => ({
  default: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    send: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  }
}));

describe('NotificationManager', () => {
  let manager: NotificationManager;
  const userId = 'user-123';

  beforeEach(() => {
    manager = new NotificationManager();
    manager.initialize(userId, {});
  });

  afterEach(() => {
    manager.destroy();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with user ID', () => {
      const newManager = new NotificationManager();
      newManager.initialize('user-456', {});
      expect(newManager).toBeDefined();
      newManager.destroy();
    });
  });

  describe('Add Notifications', () => {
    it('should add a notification', () => {
      const notification = manager.addNotification({
        type: 'appointment',
        priority: 'normal',
        title: 'New Appointment',
        message: 'You have an appointment at 2pm'
      });

      expect(notification).toBeDefined();
      expect(notification.id).toBeDefined();
      expect(notification.read).toBe(false);
      expect(notification.timestamp).toBeDefined();
    });

    it('should call onNotificationReceived handler', () => {
      const handler = vi.fn();
      manager.destroy();
      manager = new NotificationManager();
      manager.initialize(userId, { onNotificationReceived: handler });

      manager.addNotification({
        type: 'message',
        priority: 'high',
        title: 'New Message',
        message: 'You have a new message'
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mark as Read', () => {
    it('should mark notification as read', () => {
      const notification = manager.addNotification({
        type: 'system',
        priority: 'low',
        title: 'System Update',
        message: 'System updated successfully'
      });

      expect(notification.read).toBe(false);
      manager.markAsRead(notification.id);

      const updated = manager.getNotification(notification.id);
      expect(updated?.read).toBe(true);
    });

    it('should call onNotificationRead handler', () => {
      const handler = vi.fn();
      manager.destroy();
      manager = new NotificationManager();
      manager.initialize(userId, { onNotificationRead: handler });

      const notification = manager.addNotification({
        type: 'alert',
        priority: 'urgent',
        title: 'Alert',
        message: 'Urgent alert'
      });

      manager.markAsRead(notification.id);
      expect(handler).toHaveBeenCalledWith(notification.id);
    });

    it('should mark all notifications as read', () => {
      manager.addNotification({
        type: 'appointment',
        priority: 'normal',
        title: 'Appointment 1',
        message: 'First appointment'
      });

      manager.addNotification({
        type: 'message',
        priority: 'normal',
        title: 'Message 1',
        message: 'First message'
      });

      expect(manager.getUnreadCount()).toBe(2);
      manager.markAllAsRead();
      expect(manager.getUnreadCount()).toBe(0);
    });
  });

  describe('Remove Notifications', () => {
    it('should remove a notification', () => {
      const notification = manager.addNotification({
        type: 'system',
        priority: 'low',
        title: 'Test',
        message: 'Test notification'
      });

      expect(manager.hasNotification(notification.id)).toBe(true);
      manager.removeNotification(notification.id);
      expect(manager.hasNotification(notification.id)).toBe(false);
    });

    it('should call onNotificationCleared handler', () => {
      const handler = vi.fn();
      manager.destroy();
      manager = new NotificationManager();
      manager.initialize(userId, { onNotificationCleared: handler });

      const notification = manager.addNotification({
        type: 'message',
        priority: 'normal',
        title: 'Test',
        message: 'Test notification'
      });

      manager.removeNotification(notification.id);
      expect(handler).toHaveBeenCalledWith(notification.id);
    });

    it('should clear all notifications', () => {
      manager.addNotification({
        type: 'appointment',
        priority: 'normal',
        title: 'Test 1',
        message: 'Test notification 1'
      });

      manager.addNotification({
        type: 'message',
        priority: 'normal',
        title: 'Test 2',
        message: 'Test notification 2'
      });

      expect(manager.getAllNotifications().length).toBe(2);
      manager.clearAll();
      expect(manager.getAllNotifications().length).toBe(0);
    });

    it('should call onAllCleared handler', () => {
      const handler = vi.fn();
      manager.destroy();
      manager = new NotificationManager();
      manager.initialize(userId, { onAllCleared: handler });

      manager.addNotification({
        type: 'system',
        priority: 'low',
        title: 'Test',
        message: 'Test notification'
      });

      manager.clearAll();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Query Notifications', () => {
    beforeEach(() => {
      manager.addNotification({
        type: 'appointment',
        priority: 'normal',
        title: 'Appointment',
        message: 'Appointment notification'
      });

      manager.addNotification({
        type: 'message',
        priority: 'high',
        title: 'Message',
        message: 'Message notification'
      });

      manager.addNotification({
        type: 'alert',
        priority: 'urgent',
        title: 'Alert',
        message: 'Alert notification'
      });
    });

    it('should get all notifications', () => {
      const all = manager.getAllNotifications();
      expect(all.length).toBe(3);
    });

    it('should get unread notifications', () => {
      const all = manager.getAllNotifications();
      manager.markAsRead(all[0].id);

      const unread = manager.getUnreadNotifications();
      expect(unread.length).toBe(2);
    });

    it('should get notifications by type', () => {
      const appointments = manager.getNotificationsByType('appointment');
      expect(appointments.length).toBe(1);
      expect(appointments[0].type).toBe('appointment');

      const messages = manager.getNotificationsByType('message');
      expect(messages.length).toBe(1);
      expect(messages[0].type).toBe('message');
    });

    it('should get notifications by priority', () => {
      const urgent = manager.getNotificationsByPriority('urgent');
      expect(urgent.length).toBe(1);
      expect(urgent[0].priority).toBe('urgent');

      const high = manager.getNotificationsByPriority('high');
      expect(high.length).toBe(1);
      expect(high[0].priority).toBe('high');
    });

    it('should get statistics', () => {
      const stats = manager.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.unread).toBe(3);
      expect(stats.byType.appointment).toBe(1);
      expect(stats.byType.message).toBe(1);
      expect(stats.byType.alert).toBe(1);
      expect(stats.byPriority.normal).toBe(1);
      expect(stats.byPriority.high).toBe(1);
      expect(stats.byPriority.urgent).toBe(1);
    });

    it('should get unread count', () => {
      expect(manager.getUnreadCount()).toBe(3);
      
      const all = manager.getAllNotifications();
      manager.markAsRead(all[0].id);
      expect(manager.getUnreadCount()).toBe(2);
    });
  });
});
