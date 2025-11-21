/**
 * Queue Display Component
 * Shows current queue status
 */

import React from 'react';
import { QueueEntry, QueuePriority, QueueStatus } from '@/lib/queue-manager';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, User, Calendar } from 'lucide-react';

interface QueueDisplayProps {
  entries: QueueEntry[];
  showEstimatedTime?: boolean;
  className?: string;
}

const priorityColors: Record<QueuePriority, string> = {
  normal: 'bg-blue-500',
  urgent: 'bg-orange-500',
  emergency: 'bg-red-500'
};

const priorityLabels: Record<QueuePriority, string> = {
  normal: 'Normal',
  urgent: 'Urgent',
  emergency: 'Emergency'
};

const statusColors: Record<QueueStatus, string> = {
  waiting: 'bg-gray-500',
  called: 'bg-yellow-500',
  'in-service': 'bg-green-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-gray-400',
  'no-show': 'bg-red-400'
};

const statusLabels: Record<QueueStatus, string> = {
  waiting: 'Waiting',
  called: 'Called',
  'in-service': 'In Service',
  completed: 'Completed',
  cancelled: 'Cancelled',
  'no-show': 'No Show'
};

export function QueueDisplay({ entries, showEstimatedTime = true, className = '' }: QueueDisplayProps) {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500 dark:text-gray-400">
            No patients in queue
          </CardContent>
        </Card>
      ) : (
        entries.map((entry, _index) => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Queue Number */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {entry.queueNumber}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{entry.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{entry.appointmentType}</span>
                    </div>
                  </div>
                </div>

                {/* Priority & Status */}
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${priorityColors[entry.priority]} text-white border-0`}>
                      {entry.priority === 'emergency' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {priorityLabels[entry.priority]}
                    </Badge>
                    <Badge variant="outline" className={`${statusColors[entry.status]} text-white border-0`}>
                      {statusLabels[entry.status]}
                    </Badge>
                  </div>

                  {/* Estimated Wait Time */}
                  {showEstimatedTime && entry.status === 'waiting' && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>Est. {formatTime(entry.estimatedWaitTime)}</span>
                    </div>
                  )}

                  {/* Check-in Time */}
                  <div className="text-xs text-gray-500">
                    Checked in: {formatTimestamp(entry.checkInTime)}
                  </div>

                  {/* Called Time */}
                  {entry.calledTime && (
                    <div className="text-xs text-gray-500">
                      Called: {formatTimestamp(entry.calledTime)}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {entry.notes && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{entry.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
