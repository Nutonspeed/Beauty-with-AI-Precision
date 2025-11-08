/**
 * Route Info Card
 * Displays route details and statistics
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { Route } from '@/lib/location-tracker';

interface RouteInfoCardProps {
  route: Route;
  className?: string;
}

export function RouteInfoCard({ route, className }: RouteInfoCardProps) {
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = () => {
    switch (route.status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'arrived':
        return 'bg-green-500';
      case 'completed':
        return 'bg-purple-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Route Details
          </span>
          <Badge className={`${getStatusColor()} text-white`}>
            {route.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Visit ID</div>
            <div className="font-mono text-sm">{route.visitId}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Patient ID</div>
            <div className="font-mono text-sm">{route.patientId}</div>
          </div>
        </div>

        {/* Timings */}
        <div className="space-y-3 border-t pt-3">
          <h4 className="font-semibold text-sm">Timeline</h4>
          
          {route.startTime && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Started:</span>
              <span>{new Date(route.startTime).toLocaleString()}</span>
            </div>
          )}

          {route.arrivalTime && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">Arrived:</span>
              <span>{new Date(route.arrivalTime).toLocaleString()}</span>
            </div>
          )}

          {route.completionTime && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">Completed:</span>
              <span>{new Date(route.completionTime).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Duration Stats */}
        <div className="space-y-3 border-t pt-3">
          <h4 className="font-semibold text-sm">Duration</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {route.estimatedDuration && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Estimated</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatDuration(route.estimatedDuration)}
                </div>
              </div>
            )}

            {route.actualDuration && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Actual</div>
                <div className="text-lg font-bold text-purple-600">
                  {formatDuration(route.actualDuration)}
                </div>
              </div>
            )}
          </div>

          {route.estimatedDuration && route.actualDuration && (
            <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Variance:</span>
              <span className={
                route.actualDuration <= route.estimatedDuration
                  ? 'text-green-600 font-semibold'
                  : 'text-orange-600 font-semibold'
              }>
                {route.actualDuration <= route.estimatedDuration ? '-' : '+'}
                {Math.abs(route.actualDuration - route.estimatedDuration)} min
              </span>
            </div>
          )}
        </div>

        {/* Coordinates */}
        <div className="space-y-3 border-t pt-3">
          <h4 className="font-semibold text-sm">Coordinates</h4>
          
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-gray-600 dark:text-gray-400 mb-1">Origin</div>
              <div className="font-mono">
                {route.origin.latitude.toFixed(6)}, {route.origin.longitude.toFixed(6)}
              </div>
            </div>
            
            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-gray-600 dark:text-gray-400 mb-1">Destination</div>
              <div className="font-mono">
                {route.destination.latitude.toFixed(6)}, {route.destination.longitude.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
