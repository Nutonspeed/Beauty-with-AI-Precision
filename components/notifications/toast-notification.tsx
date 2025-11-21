/**
 * Toast Notification Component
 * Floating toast notifications
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Notification, NotificationType } from '@/lib/notification-manager';
import { 
  Calendar, 
  MessageSquare, 
  Bell, 
  AlertTriangle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
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

const typeColors: Record<NotificationType, { bg: string; border: string; icon: string }> = {
  appointment: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-400 dark:border-blue-600',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  message: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-400 dark:border-green-600',
    icon: 'text-green-600 dark:text-green-400'
  },
  system: {
    bg: 'bg-gray-50 dark:bg-gray-900',
    border: 'border-gray-400 dark:border-gray-600',
    icon: 'text-gray-600 dark:text-gray-400'
  },
  alert: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-400 dark:border-red-600',
    icon: 'text-red-600 dark:text-red-400'
  }
};

const positionClasses: Record<string, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4'
};

export function ToastNotification({
  notification,
  onClose,
  duration = 5000,
  position = 'top-right'
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const Icon = typeIcons[notification.type];
  const colors = typeColors[notification.type];
  const positionClass = positionClasses[position];

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  return (
    <div
      className={`
        fixed ${positionClass} z-50
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : position.includes('right') ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4
          ${colors.bg} ${colors.border}
          min-w-[320px] max-w-md
        `}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {notification.message}
          </p>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Toast Container Component
 * Manages multiple toast notifications
 */

interface ToastContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  maxToasts?: number;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ToastContainer({
  notifications,
  onClose,
  maxToasts = 3,
  duration = 5000,
  position = 'top-right'
}: ToastContainerProps) {
  // Show only latest toasts up to maxToasts
  const visibleToasts = notifications.slice(0, maxToasts);

  return (
    <>
      {visibleToasts.map((notification, _index) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={() => onClose(notification.id)}
          duration={duration}
          position={position}
        />
      ))}
    </>
  );
}
