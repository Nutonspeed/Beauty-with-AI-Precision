'use client';

import { cn } from '@/lib/utils';

type PresenceStatus = 'online' | 'offline' | 'away';

interface PresenceIndicatorProps {
  status: PresenceStatus;
  showLabel?: boolean;
  showLastSeen?: boolean;
  lastSeenText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500'
} as const;

const statusLabels = {
  online: 'Online',
  offline: 'Offline',
  away: 'Away'
} as const;

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4'
} as const;

export function PresenceIndicator({
  status,
  showLabel = false,
  showLastSeen = false,
  lastSeenText = '',
  size = 'md',
  className
}: PresenceIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Status dot */}
      <div className="relative">
        <div
          className={cn(
            'rounded-full',
            sizeClasses[size],
            statusColors[status],
            status === 'online' && 'animate-pulse'
          )}
        />
        {status === 'online' && (
          <div
            className={cn(
              'absolute top-0 left-0 rounded-full',
              sizeClasses[size],
              'bg-green-500 opacity-50 animate-ping'
            )}
          />
        )}
      </div>

      {/* Status label */}
      {showLabel && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {statusLabels[status]}
        </span>
      )}

      {/* Last seen text */}
      {showLastSeen && lastSeenText && status !== 'online' && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {lastSeenText}
        </span>
      )}
    </div>
  );
}
