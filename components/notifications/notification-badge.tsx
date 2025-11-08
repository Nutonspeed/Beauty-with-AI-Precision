/**
 * Notification Badge Component
 * Shows unread count badge
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface NotificationBadgeProps {
  count: number;
  max?: number;
  className?: string;
  showZero?: boolean;
}

export function NotificationBadge({ 
  count, 
  max = 99, 
  className = '',
  showZero = false 
}: NotificationBadgeProps) {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge 
      variant="destructive" 
      className={`px-1.5 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold ${className}`}
    >
      {displayCount}
    </Badge>
  );
}
