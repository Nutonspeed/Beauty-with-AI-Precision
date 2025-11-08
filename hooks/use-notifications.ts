/**
 * React hook for notification system
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  NotificationManager, 
  Notification, 
  NotificationType,
  NotificationPriority,
  NotificationStats 
} from '@/lib/notification-manager';

interface UseNotificationsProps {
  userId: string;
  enabled?: boolean;
}

export function useNotifications({ userId, enabled = true }: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
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
  });

  const managerRef = useRef<NotificationManager | null>(null);

  // Initialize manager
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new NotificationManager();
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
      }
    };
  }, []);

  // Initialize notifications
  useEffect(() => {
    if (enabled && managerRef.current) {
      managerRef.current.initialize(userId, {
        onNotificationReceived: (notification) => {
          updateState();
        },
        onNotificationRead: () => {
          updateState();
        },
        onNotificationCleared: () => {
          updateState();
        },
        onAllCleared: () => {
          updateState();
        }
      });

      updateState();
    }
  }, [userId, enabled]);

  /**
   * Update state from manager
   */
  const updateState = useCallback(() => {
    if (!managerRef.current) return;

    const allNotifications = managerRef.current.getAllNotifications();
    const count = managerRef.current.getUnreadCount();
    const currentStats = managerRef.current.getStats();

    setNotifications(allNotifications);
    setUnreadCount(count);
    setStats(currentStats);
  }, []);

  /**
   * Add a notification
   */
  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ): Notification | null => {
    if (!managerRef.current) return null;
    
    const newNotification = managerRef.current.addNotification(notification);
    updateState();
    return newNotification;
  }, [updateState]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId: string) => {
    if (managerRef.current) {
      managerRef.current.markAsRead(notificationId);
      updateState();
    }
  }, [updateState]);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.markAllAsRead();
      updateState();
    }
  }, [updateState]);

  /**
   * Remove notification
   */
  const removeNotification = useCallback((notificationId: string) => {
    if (managerRef.current) {
      managerRef.current.removeNotification(notificationId);
      updateState();
    }
  }, [updateState]);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.clearAll();
      updateState();
    }
  }, [updateState]);

  /**
   * Get notifications by type
   */
  const getByType = useCallback((type: NotificationType): Notification[] => {
    if (!managerRef.current) return [];
    return managerRef.current.getNotificationsByType(type);
  }, []);

  /**
   * Get notifications by priority
   */
  const getByPriority = useCallback((priority: NotificationPriority): Notification[] => {
    if (!managerRef.current) return [];
    return managerRef.current.getNotificationsByPriority(priority);
  }, []);

  /**
   * Get unread notifications
   */
  const getUnread = useCallback((): Notification[] => {
    if (!managerRef.current) return [];
    return managerRef.current.getUnreadNotifications();
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    stats,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    
    // Queries
    getByType,
    getByPriority,
    getUnread
  };
}
