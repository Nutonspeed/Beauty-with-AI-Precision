/**
 * Queue Statistics Panel
 * Shows real-time queue metrics
 */

import React from 'react';
import { QueueStats } from '@/lib/queue-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PhoneCall,
  Activity,
  TrendingUp
} from 'lucide-react';

interface QueueStatsPanelProps {
  stats: QueueStats;
  className?: string;
}

export function QueueStatsPanel({ stats, className = '' }: QueueStatsPanelProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            Waiting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{stats.waiting}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <PhoneCall className="w-4 h-4" />
            Called
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">{stats.called}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Activity className="w-4 h-4" />
            In Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{stats.inService}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600">{stats.completed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            Avg Wait
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.averageWaitTime}m
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            Avg Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-600">
            {stats.averageServiceTime}m
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <XCircle className="w-4 h-4" />
            Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <XCircle className="w-4 h-4" />
            No Show
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.noShow}</div>
        </CardContent>
      </Card>
    </div>
  );
}
