/**
 * Notification Item Component
 * Individual notification display
 */

import React from 'react';
import { Notification, NotificationType, NotificationPriority } from '@/lib/notification-manager';
import { 
  Calendar, 
  MessageSquare, 
  Bell, 
  AlertTriangle,
  X,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  onRemove?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

// Define the Icon component props interface
interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

type IconComponent = React.ComponentType<IconProps>;

const typeIcons: Record<NotificationType, IconComponent> = {
  appointment: Calendar,
  message: MessageSquare,
  system: Bell,
  alert: AlertTriangle
};

const typeColors: Record<NotificationType, string> = {
  appointment: 'text-blue-600 dark:text-blue-400',
  message: 'text-green-600 dark:text-green-400',
  system: 'text-gray-600 dark:text-gray-400',
  alert: 'text-red-600 dark:text-red-400'
};

const priorityColors: Record<NotificationPriority, string> = {
  low: 'border-l-gray-400',
  normal: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-600'
};

export function NotificationItem({
  notification,
  onRead,
  onRemove,
  onClick
}: NotificationItemProps) {
  const Icon = typeIcons[notification.type];
  const iconColor = typeColors[notification.type];
  const priorityColor = priorityColors[notification.priority];

  const handleClick = () => {
    if (!notification.read && onRead) {
      onRead(notification.id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(notification.id);
    }
  };

  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      className={`
        relative flex gap-3 p-4 border-l-4 ${priorityColor}
        ${notification.read ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}
        hover:bg-gray-100 dark:hover:bg-gray-700
        transition-colors cursor-pointer
      `}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={`text-sm font-semibold ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {notification.title}
          </h4>
          {!notification.read && (
            <Circle className="w-2 h-2 fill-blue-600 text-blue-600 flex-shrink-0" />
          )}
        </div>
        
        <p className={`text-sm ${notification.read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
          {notification.message}
        </p>
        
        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
          {formatTime(notification.timestamp)}
        </span>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
        onClick={handleRemove}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
