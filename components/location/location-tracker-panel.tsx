/**
 * Location Tracker Panel
 * Tracking controls and status display
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Square,
  MapPin,
  Clock,
  Gauge,
  Navigation2,
  CheckCircle2
} from 'lucide-react';
import { Route, LocationUpdate } from '@/lib/location-tracker';

interface LocationTrackerPanelProps {
  currentRoute: Route | null;
  locationUpdate: LocationUpdate | null;
  isTracking: boolean;
  onStartRoute: () => void;
  onCompleteRoute: () => void;
  formatDistance: (meters: number) => string;
  formatETA: (minutes: number) => string;
  className?: string;
}

export function LocationTrackerPanel({
  currentRoute,
  locationUpdate,
  isTracking,
  onStartRoute,
  onCompleteRoute,
  formatDistance,
  formatETA,
  className
}: LocationTrackerPanelProps) {
  const getStatusColor = () => {
    if (!currentRoute) return 'bg-gray-500';
    switch (currentRoute.status) {
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
            <Navigation2 className="w-5 h-5" />
            Route Tracking
          </span>
          {currentRoute && (
            <Badge className={`${getStatusColor()} text-white`}>
              {currentRoute.status.toUpperCase()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex gap-2">
          {!isTracking ? (
            <Button
              onClick={onStartRoute}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Tracking
            </Button>
          ) : (
            <Button
              onClick={onCompleteRoute}
              variant="destructive"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Complete Route
            </Button>
          )}
        </div>

        {/* Route Info */}
        {currentRoute && (
          <div className="space-y-3">
            <div className="border-t pt-3">
              <h4 className="font-semibold mb-2 text-sm">Route Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Visit ID:</span>
                  <span className="font-mono">{currentRoute.visitId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Patient ID:</span>
                  <span className="font-mono">{currentRoute.patientId}</span>
                </div>
                {currentRoute.startTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Started:</span>
                    <span>{new Date(currentRoute.startTime).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Live Tracking Data */}
        {locationUpdate && (
          <div className="space-y-3 border-t pt-3">
            <h4 className="font-semibold mb-2 text-sm">Live Tracking</h4>
            
            {/* Distance */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <div className="text-xs text-gray-600 dark:text-gray-400">Distance to Destination</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatDistance(locationUpdate.distance)}
                </div>
              </div>
            </div>

            {/* ETA */}
            <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <div className="text-xs text-gray-600 dark:text-gray-400">Estimated Time of Arrival</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatETA(locationUpdate.eta)}
                </div>
              </div>
            </div>

            {/* Speed */}
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <Gauge className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <div className="text-xs text-gray-600 dark:text-gray-400">Current Speed</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(locationUpdate.speed)} km/h
                </div>
              </div>
            </div>

            {/* Position Accuracy */}
            {locationUpdate.position.accuracy && (
              <div className="text-xs text-gray-500 text-center">
                GPS Accuracy: ±{Math.round(locationUpdate.position.accuracy)}m
              </div>
            )}
          </div>
        )}

        {/* Arrival Status */}
        {currentRoute?.status === 'arrived' && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-green-800 dark:text-green-200">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <div className="font-semibold">Arrived at Destination</div>
                {currentRoute.arrivalTime && (
                  <div className="text-xs">
                    {new Date(currentRoute.arrivalTime).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Route Message */}
        {!currentRoute && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No active route</p>
            <p className="text-xs mt-1">Start tracking to begin</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
