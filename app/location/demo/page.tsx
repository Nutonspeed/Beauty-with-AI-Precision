/**
 * Location Tracking Demo
 * Real-time GPS tracking with ETA calculation
 */

'use client';

import React, { useState } from 'react';
import { useLocation } from '@/hooks/use-location';
import { LocationMap } from '@/components/location/location-map';
import { LocationTrackerPanel } from '@/components/location/location-tracker-panel';
import { RouteInfoCard } from '@/components/location/route-info-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Route, Position } from '@/lib/location-tracker';
import {
  CheckCircle2,
  Users,
  Zap,
  MapPin,
  Navigation,
  Calculator,
  Radio
} from 'lucide-react';

export default function LocationTrackingDemo() {
  const {
    currentPosition,
    currentRoute,
    locationUpdate,
    isTracking,
    error,
    getCurrentPosition,
    startRoute,
    completeRoute,
    formatDistance,
    formatETA
  } = useLocation();

  // Test destination coordinates (example: hospital location)
  const [destLat, setDestLat] = useState('13.7563');
  const [destLng, setDestLng] = useState('100.5018');

  const handleGetCurrentLocation = async () => {
    try {
      const position = await getCurrentPosition();
      console.log('Current position:', position);
    } catch (err) {
      console.error('Failed to get position:', err);
    }
  };

  const handleStartTracking = async () => {
    try {
      // Get current position first
      const origin = await getCurrentPosition();
      
      // Create test route
      const testRoute: Route = {
        id: `route-${Date.now()}`,
        visitId: `visit-${Date.now()}`,
        providerId: 'provider-1',
        patientId: 'patient-1',
        origin,
        destination: {
          latitude: parseFloat(destLat),
          longitude: parseFloat(destLng),
          accuracy: 0,
          timestamp: Date.now()
        },
        status: 'pending',
        estimatedDuration: 30 // 30 minutes estimate
      };

      startRoute(testRoute);
    } catch (err) {
      console.error('Failed to start tracking:', err);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Live Location Tracking</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time GPS tracking with ETA calculation for home visit services
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Test Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-gray-500 mt-1">Core features implemented</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-gray-500 mt-1">Tracker, Hook, Map, Panel, Info</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-gray-500 mt-1">GPS, ETA, Distance, Geofence, WebSocket, Maps</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="py-4">
            <p className="text-red-600 dark:text-red-400">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
          <CardDescription>Configure and test location tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="destLat">Destination Latitude</Label>
              <Input
                id="destLat"
                type="number"
                step="0.000001"
                value={destLat}
                onChange={(e) => setDestLat(e.target.value)}
                placeholder="13.7563"
              />
            </div>
            <div>
              <Label htmlFor="destLng">Destination Longitude</Label>
              <Input
                id="destLng"
                type="number"
                step="0.000001"
                value={destLng}
                onChange={(e) => setDestLng(e.target.value)}
                placeholder="100.5018"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGetCurrentLocation}
              variant="outline"
              disabled={isTracking}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Get Current Location
            </Button>
            <Button
              onClick={handleStartTracking}
              disabled={isTracking}
              className="bg-green-600 hover:bg-green-700"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Start Test Route
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map and Tracker Panel */}
        <div className="lg:col-span-2 space-y-6">
          <LocationMap
            currentPosition={currentPosition}
            destination={currentRoute?.destination}
          />
          
          {currentRoute && (
            <RouteInfoCard route={currentRoute} />
          )}
        </div>

        {/* Tracker Panel */}
        <div>
          <LocationTrackerPanel
            currentRoute={currentRoute}
            locationUpdate={locationUpdate}
            isTracking={isTracking}
            onStartRoute={handleStartTracking}
            onCompleteRoute={completeRoute}
            formatDistance={formatDistance}
            formatETA={formatETA}
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              GPS Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Real-time position updates</li>
              <li>• High accuracy mode</li>
              <li>• Continuous tracking</li>
              <li>• Position history</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-500" />
              ETA Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Distance calculation (Haversine)</li>
              <li>• Speed-based ETA</li>
              <li>• Real-time updates</li>
              <li>• Arrival detection</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="w-5 h-5 text-green-500" />
              WebSocket Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Live position broadcasting</li>
              <li>• Multi-client sync</li>
              <li>• Route status updates</li>
              <li>• Arrival notifications</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="w-5 h-5 text-purple-500" />
              Geofencing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Arrival detection (100m threshold)</li>
              <li>• Automatic status updates</li>
              <li>• Zone-based triggers</li>
              <li>• Distance monitoring</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Route Management
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Start/complete routes</li>
              <li>• Duration tracking</li>
              <li>• Status management</li>
              <li>• Route history</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• 5-second update interval</li>
              <li>• Throttled broadcasting</li>
              <li>• Efficient calculations</li>
              <li>• Battery optimization</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Components</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <Badge variant="outline">LocationTracker (450 lines)</Badge>
              <Badge variant="outline">useLocation Hook</Badge>
              <Badge variant="outline">LocationMap</Badge>
              <Badge variant="outline">LocationTrackerPanel</Badge>
              <Badge variant="outline">RouteInfoCard</Badge>
              <Badge variant="outline">Demo Page</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Technologies</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <Badge>Geolocation API</Badge>
              <Badge>WebSocket</Badge>
              <Badge>React Hooks</Badge>
              <Badge>TypeScript</Badge>
              <Badge>Haversine Formula</Badge>
              <Badge>Tailwind CSS</Badge>
              <Badge>Real-time Sync</Badge>
              <Badge>Vitest</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Key Features</h4>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>• <strong>GPS Tracking:</strong> navigator.geolocation.watchPosition() for continuous updates</li>
              <li>• <strong>Distance Calculation:</strong> Haversine formula for great-circle distance</li>
              <li>• <strong>ETA Estimation:</strong> distance / average_speed (40 km/h default)</li>
              <li>• <strong>Geofencing:</strong> Automatic arrival detection at 100m threshold</li>
              <li>• <strong>WebSocket Sync:</strong> Real-time position broadcasting via channel</li>
              <li>• <strong>Route Management:</strong> Start, track, arrive, complete workflow</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>1. <strong>Get Current Location:</strong> Click "Get Current Location" to request GPS access</li>
            <li>2. <strong>Set Destination:</strong> Enter destination coordinates (default: Bangkok)</li>
            <li>3. <strong>Start Route:</strong> Click "Start Test Route" to begin tracking</li>
            <li>4. <strong>Monitor Tracking:</strong> Watch real-time distance, ETA, and speed updates</li>
            <li>5. <strong>Simulate Movement:</strong> Use browser DevTools to spoof GPS location</li>
            <li>6. <strong>Test Arrival:</strong> Move within 100m of destination to trigger arrival</li>
            <li>7. <strong>Complete Route:</strong> Click "Complete Route" to end tracking</li>
            <li>8. <strong>Check WebSocket:</strong> Verify position updates in Network tab</li>
          </ol>
        </CardContent>
      </Card>

      {/* Browser DevTools GPS Spoofing Guide */}
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-base">💡 GPS Testing Tip</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 dark:text-gray-300">
          <p className="mb-2">To test location tracking in Chrome DevTools:</p>
          <ol className="space-y-1 ml-4">
            <li>1. Press F12 to open DevTools</li>
            <li>2. Press Ctrl+Shift+P and type "sensors"</li>
            <li>3. Select "Show Sensors"</li>
            <li>4. In Sensors tab, enable "Location" override</li>
            <li>5. Enter custom coordinates or select preset locations</li>
            <li>6. Refresh page to apply new location</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
