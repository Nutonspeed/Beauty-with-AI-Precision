/**
 * useLocation Hook
 * React hook for location tracking
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import LocationTracker, { Position, Route, LocationUpdate } from '@/lib/location-tracker';

interface UseLocationOptions {
  autoStart?: boolean;
}

export function useLocation(options: UseLocationOptions = {}) {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [locationUpdate, setLocationUpdate] = useState<LocationUpdate | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const trackerRef = useRef(LocationTracker);

  useEffect(() => {
    const tracker = trackerRef.current;

    // Initialize tracker with handlers
    tracker.initialize({
      onPositionUpdate: (update) => {
        setLocationUpdate(update);
        setCurrentPosition(update.position);
      },
      onRouteStarted: (route) => {
        setCurrentRoute(route);
        setIsTracking(true);
      },
      onRouteCompleted: (route) => {
        setCurrentRoute(route);
        setIsTracking(false);
      },
      onArrival: (routeId) => {
        console.log('[useLocation] Arrived at destination:', routeId);
      },
      onError: (err) => {
        setError(err);
        console.error('[useLocation] Error:', err);
      }
    });

    return () => {
      tracker.destroy();
    };
  }, []);

  /**
   * Get current position from GPS
   */
  const getCurrentPosition = useCallback(async () => {
    try {
      setError(null);
      const position = await trackerRef.current.getCurrentPosition();
      setCurrentPosition(position);
      return position;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get position');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Start tracking a route
   */
  const startRoute = useCallback((route: Route) => {
    try {
      setError(null);
      trackerRef.current.startRoute(route);
      setCurrentRoute(route);
      setIsTracking(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start route');
      setError(error);
    }
  }, []);

  /**
   * Complete current route
   */
  const completeRoute = useCallback(() => {
    try {
      setError(null);
      trackerRef.current.completeRoute();
      setIsTracking(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to complete route');
      setError(error);
    }
  }, []);

  /**
   * Calculate distance between two positions
   */
  const calculateDistance = useCallback((pos1: Position, pos2: Position): number => {
    return trackerRef.current.calculateDistance(pos1, pos2);
  }, []);

  /**
   * Calculate ETA
   */
  const calculateETA = useCallback((distance: number, speed?: number): number => {
    return trackerRef.current.calculateETA(distance, speed);
  }, []);

  /**
   * Format distance for display
   */
  const formatDistance = useCallback((meters: number): string => {
    return trackerRef.current.formatDistance(meters);
  }, []);

  /**
   * Format ETA for display
   */
  const formatETA = useCallback((minutes: number): string => {
    return trackerRef.current.formatETA(minutes);
  }, []);

  return {
    // State
    currentPosition,
    currentRoute,
    locationUpdate,
    isTracking,
    error,

    // Actions
    getCurrentPosition,
    startRoute,
    completeRoute,
    calculateDistance,
    calculateETA,
    formatDistance,
    formatETA
  };
}
