/**
 * Location Map Component
 * Displays current location and route on a map
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Flag } from 'lucide-react';
import { Position } from '@/lib/location-tracker';

interface LocationMapProps {
  currentPosition?: Position | null;
  destination?: Position | null;
  className?: string;
}

export function LocationMap({ currentPosition, destination, className }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Simple coordinate display (replace with actual map library in production)
  const formatCoordinate = (value: number, isLatitude: boolean): string => {
    const direction = isLatitude
      ? value >= 0 ? 'N' : 'S'
      : value >= 0 ? 'E' : 'W';
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Map Container */}
        <div
          ref={mapRef}
          className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden"
        >
          {/* Simple visualization - replace with actual map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              {/* Current Position */}
              {currentPosition && (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg">
                  <Badge className="bg-blue-500 text-white mb-2">
                    <Navigation className="w-3 h-3 mr-1" />
                    Current Position
                  </Badge>
                  <div className="text-sm space-y-1">
                    <div>
                      Lat: {formatCoordinate(currentPosition.latitude, true)}
                    </div>
                    <div>
                      Lng: {formatCoordinate(currentPosition.longitude, false)}
                    </div>
                    {currentPosition.accuracy && (
                      <div className="text-xs text-gray-500">
                        Accuracy: ±{Math.round(currentPosition.accuracy)}m
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Destination */}
              {destination && (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg">
                  <Badge className="bg-red-500 text-white mb-2">
                    <Flag className="w-3 h-3 mr-1" />
                    Destination
                  </Badge>
                  <div className="text-sm space-y-1">
                    <div>
                      Lat: {formatCoordinate(destination.latitude, true)}
                    </div>
                    <div>
                      Lng: {formatCoordinate(destination.longitude, false)}
                    </div>
                  </div>
                </div>
              )}

              {/* No Data */}
              {!currentPosition && !destination && (
                <div className="text-gray-500 dark:text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No location data available</p>
                  <p className="text-xs mt-2">
                    Start tracking to see your location on the map
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Map Integration Note */}
          <div className="absolute bottom-2 left-2 right-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-2 text-xs text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> This is a simplified map display. In production, integrate with Google Maps, Mapbox, or Leaflet for full map functionality.
          </div>
        </div>

        {/* Map Legend */}
        <div className="mt-4 flex gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Current Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Destination</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
