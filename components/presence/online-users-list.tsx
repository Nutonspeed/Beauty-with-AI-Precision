'use client';

import { UserPresence } from '@/lib/presence-manager';
import { PresenceIndicator } from './presence-indicator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface OnlineUsersListProps {
  users: UserPresence[];
  currentUserId?: string;
  onUserClick?: (userId: string) => void;
  className?: string;
}

function getUserInitials(userName: string): string {
  return userName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatLastSeen(lastSeen: number, status: string): string {
  if (status === 'online') return 'Online now';

  const now = Date.now();
  const diff = now - lastSeen;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function OnlineUsersList({
  users,
  currentUserId,
  onUserClick,
  className
}: OnlineUsersListProps) {
  // Sort users: online first, then away, then offline
  const sortedUsers = [...users].sort((a, b) => {
    const statusOrder = { online: 0, away: 1, offline: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Filter out current user if needed
  const displayUsers = sortedUsers.filter(user => user.userId !== currentUserId);

  if (displayUsers.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8', className)}>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No other users online
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {displayUsers.map(user => {
        const isClickable = onUserClick !== undefined;

        return (
          <button
            key={user.userId}
            onClick={() => onUserClick?.(user.userId)}
            disabled={!isClickable}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-colors',
              isClickable && 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer',
              !isClickable && 'cursor-default'
            )}
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-blue-500 text-white">
                  {getUserInitials(user.userName)}
                </AvatarFallback>
              </Avatar>
              
              {/* Presence indicator on avatar */}
              <div className="absolute -bottom-0.5 -right-0.5">
                <PresenceIndicator status={user.status} size="sm" />
              </div>
            </div>

            {/* User info */}
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatLastSeen(user.lastSeen, user.status)}
              </p>
            </div>

            {/* Status label */}
            <PresenceIndicator
              status={user.status}
              showLabel
              size="sm"
            />
          </button>
        );
      })}
    </div>
  );
}
