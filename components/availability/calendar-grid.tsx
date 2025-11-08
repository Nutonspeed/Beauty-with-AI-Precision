/**
 * Calendar Grid Component
 * Displays time slots in a calendar view
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { TimeSlot } from '@/lib/availability-manager';

interface CalendarGridProps {
  slots: TimeSlot[];
  onSlotClick?: (slot: TimeSlot) => void;
  formatTime: (timestamp: number) => string;
  className?: string;
}

export function CalendarGrid({
  slots,
  onSlotClick,
  formatTime,
  className
}: CalendarGridProps) {
  const getSlotColor = (status: TimeSlot['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800 dark:bg-green-950 dark:border-green-700 dark:text-green-200';
      case 'booked':
        return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200';
      case 'blocked':
        return 'bg-gray-200 border-gray-400 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400';
      case 'tentative':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-200';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getStatusBadge = (status: TimeSlot['status']) => {
    const colors = {
      available: 'bg-green-500',
      booked: 'bg-blue-500',
      blocked: 'bg-gray-500',
      tentative: 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Available Time Slots
        </CardTitle>
      </CardHeader>
      <CardContent>
        {slots.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No time slots available</p>
            <p className="text-sm mt-1">Generate a schedule to see available slots</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => onSlotClick && onSlotClick(slot)}
                disabled={slot.status === 'booked' || slot.status === 'blocked'}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${getSlotColor(slot.status)}
                  ${
                    slot.status === 'available'
                      ? 'cursor-pointer hover:shadow-md'
                      : 'cursor-not-allowed opacity-75'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-4 h-4" />
                  <div className={`w-2 h-2 rounded-full ${getStatusBadge(slot.status)}`} />
                </div>
                <div className="font-semibold text-sm">
                  {formatTime(slot.startTime)}
                </div>
                <div className="text-xs opacity-75">
                  {slot.duration} min
                </div>
                {slot.patientName && (
                  <div className="mt-2 text-xs font-medium truncate">
                    {slot.patientName}
                  </div>
                )}
                {slot.status === 'tentative' && (
                  <Badge className="mt-1 text-[10px] px-1 py-0">
                    Tentative
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Legend */}
        {slots.length > 0 && (
          <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Tentative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Blocked</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
