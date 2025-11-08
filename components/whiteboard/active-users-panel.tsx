/**
 * Active Users Panel Component
 * Shows active collaborators
 */

import React from 'react';
import { UserCursor } from '@/lib/whiteboard-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface ActiveUsersPanelProps {
  users: UserCursor[];
  lockedBy?: string | null;
  className?: string;
}

export function ActiveUsersPanel({ users, lockedBy, className = '' }: ActiveUsersPanelProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          Active Users
          <Badge variant="secondary" className="ml-auto">
            {users.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No other users online</p>
        ) : (
          users.map(user => (
            <div
              key={user.userId}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900"
            >
              <div
                className="w-3 h-3 rounded-full bg-blue-500"
                data-user-color={user.color}
              />
              <span className="text-sm font-medium flex-1">{user.userName}</span>
              {lockedBy === user.userId && (
                <Badge variant="outline" className="text-xs">
                  Drawing
                </Badge>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
