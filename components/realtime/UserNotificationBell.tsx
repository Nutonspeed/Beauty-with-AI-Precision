"use client";

import { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChannelSubscriber } from '@/components/realtime/ChannelSubscriber';
import { channels } from '@/lib/realtime/channels';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface UserNotificationBellProps {
  userId: string;
}

export function UserNotificationBell({ userId }: UserNotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleRealtimeMessage = (msg: { type: string; data?: any }) => {
    if (msg.type === 'USER_NOTIFICATION') {
      const notification: Notification = {
        id: msg.data?.id || `notif-${Date.now()}`,
        type: msg.data?.type || 'info',
        message: msg.data?.message || 'New notification',
        timestamp: new Date(),
        read: false
      };

      setNotifications(prev => [notification, ...prev]);

      // Show toast for immediate feedback
      toast.info(notification.message, {
        description: msg.data?.description
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <ChannelSubscriber
        channels={[channels.user.notifications(userId)]}
        onMessage={handleRealtimeMessage}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-6 text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-6 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
