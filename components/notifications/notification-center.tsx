/**
 * Notification Center Component
 * Full notification inbox UI
 */

import React, { useState } from 'react';
import { Notification, NotificationType, NotificationPriority } from '@/lib/notification-manager';
import { NotificationItem } from './notification-item';
import { NotificationBadge } from './notification-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  CheckCheck, 
  Trash2,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Settings
} from 'lucide-react';

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

type FilterType = 'all' | 'unread' | 'appointment' | 'message' | 'alert';

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
  onClearAll,
  onNotificationClick,
  className = ''
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  // Count by type
  const appointmentCount = notifications.filter(n => n.type === 'appointment' && !n.read).length;
  const messageCount = notifications.filter(n => n.type === 'message' && !n.read).length;
  const alertCount = notifications.filter(n => n.type === 'alert' && !n.read).length;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-sm"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
            
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>
        
        <CardDescription>
          {notifications.length === 0 ? (
            'No notifications'
          ) : (
            `${notifications.length} total, ${unreadCount} unread`
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <div className="border-b px-4">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
              <TabsTrigger value="all" className="relative">
                All
                {notifications.length > 0 && (
                  <span className="ml-1.5 text-xs text-gray-500">({notifications.length})</span>
                )}
              </TabsTrigger>
              
              <TabsTrigger value="unread" className="relative">
                Unread
                {unreadCount > 0 && <NotificationBadge count={unreadCount} className="ml-1.5" />}
              </TabsTrigger>
              
              <TabsTrigger value="appointment" className="relative">
                <Calendar className="w-4 h-4 mr-1" />
                Appointments
                {appointmentCount > 0 && <NotificationBadge count={appointmentCount} className="ml-1.5" />}
              </TabsTrigger>
              
              <TabsTrigger value="message" className="relative">
                <MessageSquare className="w-4 h-4 mr-1" />
                Messages
                {messageCount > 0 && <NotificationBadge count={messageCount} className="ml-1.5" />}
              </TabsTrigger>
              
              <TabsTrigger value="alert" className="relative">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Alerts
                {alertCount > 0 && <NotificationBadge count={alertCount} className="ml-1.5" />}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={filter} className="m-0">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={onMarkAsRead}
                    onRemove={onRemove}
                    onClick={onNotificationClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
