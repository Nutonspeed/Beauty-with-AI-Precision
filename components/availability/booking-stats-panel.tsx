/**
 * Booking Stats Panel
 * Display booking statistics and analytics
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BookingStatsProps {
  stats: {
    total: number;
    available: number;
    booked: number;
    blocked: number;
    tentative: number;
    utilizationRate: number;
  };
  className?: string;
}

export function BookingStatsPanel({ stats, className }: BookingStatsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Booking Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Utilization Rate */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Utilization Rate
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.utilizationRate.toFixed(1)}%
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`bg-blue-600 h-2 rounded-full transition-all duration-500 ${
                stats.utilizationRate >= 90 ? 'w-full' :
                stats.utilizationRate >= 75 ? 'w-3/4' :
                stats.utilizationRate >= 50 ? 'w-1/2' :
                stats.utilizationRate >= 25 ? 'w-1/4' :
                'w-1/12'
              }`}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Slots */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Total Slots</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>

          {/* Available */}
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Available</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </div>

          {/* Booked */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Booked</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.booked}</div>
          </div>

          {/* Blocked */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-xs">Blocked</span>
            </div>
            <div className="text-2xl font-bold">{stats.blocked}</div>
          </div>
        </div>

        {/* Tentative */}
        {stats.tentative > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Tentative Bookings</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.tentative}</div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Will auto-release in 5 minutes
            </div>
          </div>
        )}

        {/* Distribution */}
        <div className="space-y-2">
          <div className="text-sm font-semibold">Slot Distribution</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Available:</span>
              <span className="font-semibold">
                {stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Booked:</span>
              <span className="font-semibold">
                {stats.total > 0 ? ((stats.booked / stats.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            {stats.blocked > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Blocked:</span>
                <span className="font-semibold">
                  {stats.total > 0 ? ((stats.blocked / stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
