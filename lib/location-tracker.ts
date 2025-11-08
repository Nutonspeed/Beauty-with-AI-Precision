/**
 * Location Tracker
 * Real-time GPS tracking with ETA calculation and geofencing
 */

import { WebSocketClient } from './websocket-client';

export interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  heading?: number;
  speed?: number;
}

export interface Route {
  id: string;
  visitId: string;
  providerId: string;
  patientId: string;
  origin: Position;
  destination: Position;
  status: 'pending' | 'in-progress' | 'arrived' | 'completed' | 'cancelled';
  startTime?: number;
  arrivalTime?: number;
  completionTime?: number;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
}

export interface LocationUpdate {
  routeId: string;
  position: Position;
  distance: number; // meters
  eta: number; // minutes
  speed: number; // km/h
}

export interface LocationEventHandlers {
  onPositionUpdate?: (update: LocationUpdate) => void;
  onArrival?: (routeId: string) => void;
  onRouteStarted?: (route: Route) => void;
  onRouteCompleted?: (route: Route) => void;
  onError?: (error: Error) => void;
}

export class LocationTracker {
  private static instance: LocationTracker;
  private wsClient: WebSocketClient;
  private unsubscribeCallbacks: Array<() => void> = [];
  private messageHandler: ((message: any) => void) | null = null;
  private watchId: number | null = null;
  private currentRoute: Route | null = null;
  private handlers: LocationEventHandlers = {};
  private updateInterval: NodeJS.Timeout | null = null;
  private lastPosition: Position | null = null;
  
  // Configuration
  private readonly UPDATE_INTERVAL_MS = 5000; // 5 seconds
  private readonly ARRIVAL_THRESHOLD_METERS = 100; // 100 meters
  private readonly AVERAGE_SPEED_KMH = 40; // City driving speed
  
  private constructor() {
    this.wsClient = new WebSocketClient();
    this.messageHandler = this.handleWebSocketMessage.bind(this);
    console.log('[LocationTracker] Initialized');  }

  public static getInstance(): LocationTracker {
    if (!LocationTracker.instance) {
      LocationTracker.instance = new LocationTracker();
    }
    return LocationTracker.instance;
  }

  /**
   * Initialize location tracking
   */
  public initialize(handlers?: LocationEventHandlers): void {
    this.handlers = handlers || {};
    
    // Set up WebSocket listener
    if (this.messageHandler) {
      this.wsClient.on('message', this.messageHandler);
    }
    
    console.log('[LocationTracker] Initialized with handlers');
  }

  /**
   * Start tracking a route
   */
  public startRoute(route: Route): void {
    this.currentRoute = {
      ...route,
      status: 'in-progress',
      startTime: Date.now()
    };

    // Store the route ID for filtering messages
    const routeId = route.id;
    
    // Create a message handler for this route
    const messageHandler = (notification: any) => {
      try {
        // Check if this is a location update for our route
        if (notification && notification.type === 'location' && notification.data && notification.data.routeId === routeId) {
          this.handleLocationMessage(notification.data);
        }
      } catch (error) {
        console.error('[LocationTracker] Error handling message:', error);
        if (this.handlers.onError) {
          this.handlers.onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };
    
    // Add the message handler
    this.wsClient.on('message', messageHandler);
    
    // Store the unsubscribe function for cleanup
    this.unsubscribeCallbacks.push(() => {
      this.wsClient.off('message', messageHandler);
    });

    // Start watching position
    this.startWatchingPosition();

    // Notify handlers
    if (this.handlers.onRouteStarted) {
      this.handlers.onRouteStarted(this.currentRoute);
    }

    // Send WebSocket event
    this.wsClient.send('location:broadcast', {
      event: 'route_started',
      route: this.currentRoute
    });

    console.log('[LocationTracker] Route started:', route.id);
  }

  /**
   * Complete current route
   */
  public completeRoute(): void {
    if (!this.currentRoute) return;

    this.currentRoute = {
      ...this.currentRoute,
      status: 'completed',
      completionTime: Date.now(),
      actualDuration: this.currentRoute.startTime
        ? Math.round((Date.now() - this.currentRoute.startTime) / 60000)
        : undefined
    };

    // Stop watching position
    this.stopWatchingPosition();

    // Unsubscribe callbacks will handle cleanup

    // Notify handlers
    if (this.handlers.onRouteCompleted) {
      this.handlers.onRouteCompleted(this.currentRoute);
    }

    // Send WebSocket event
    this.wsClient.send('location:broadcast', {
      event: 'route_completed',
      route: this.currentRoute
    });

    console.log('[LocationTracker] Route completed:', this.currentRoute.id);
    
    this.currentRoute = null;
  }

  /**
   * Start watching GPS position
   */
  private startWatchingPosition(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const error = new Error('Geolocation not supported');
      if (this.handlers.onError) {
        this.handlers.onError(error);
      }
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const pos: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined
        };

        this.handlePositionUpdate(pos);
      },
      (error) => {
        console.error('[LocationTracker] Position error:', error);
        if (this.handlers.onError) {
          this.handlers.onError(new Error(error.message));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    console.log('[LocationTracker] Started watching position');
  }

  /**
   * Stop watching GPS position
   */
  private stopWatchingPosition(): void {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('[LocationTracker] Stopped watching position');
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Handle position update from GPS
   */
  private handlePositionUpdate(position: Position): void {
    if (!this.currentRoute) return;

    this.lastPosition = position;

    // Calculate distance to destination
    const distance = this.calculateDistance(
      position,
      this.currentRoute.destination
    );

    // Calculate ETA
    const eta = this.calculateETA(distance, position.speed);

    // Calculate current speed
    const speed = position.speed
      ? position.speed * 3.6 // m/s to km/h
      : this.AVERAGE_SPEED_KMH;

    // Create update object
    const update: LocationUpdate = {
      routeId: this.currentRoute.id,
      position,
      distance,
      eta,
      speed
    };

    // Check for arrival
    if (distance <= this.ARRIVAL_THRESHOLD_METERS && this.currentRoute.status === 'in-progress') {
      this.handleArrival();
    }

    // Notify handlers
    if (this.handlers.onPositionUpdate) {
      this.handlers.onPositionUpdate(update);
    }

    // Broadcast position via WebSocket
    this.wsClient.send('location:broadcast', {
      event: 'position_update',
      update
    });

    console.log('[LocationTracker] Position updated:', {
      distance: Math.round(distance),
      eta,
      speed: Math.round(speed)
    });
  }

  /**
   * Handle arrival at destination
   */
  private handleArrival(): void {
    if (!this.currentRoute) return;

    this.currentRoute = {
      ...this.currentRoute,
      status: 'arrived',
      arrivalTime: Date.now()
    };

    // Notify handlers
    if (this.handlers.onArrival) {
      this.handlers.onArrival(this.currentRoute.id);
    }

    // Send WebSocket event
    this.wsClient.send('location:broadcast', {
      event: 'arrival',
      routeId: this.currentRoute.id,
      arrivalTime: this.currentRoute.arrivalTime
    });

    console.log('[LocationTracker] Arrived at destination');
  }

  /**
   * Calculate distance between two positions (Haversine formula)
   */
  public calculateDistance(pos1: Position, pos2: Position): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Calculate ETA based on distance and speed
   */
  public calculateETA(distance: number, speed?: number): number {
    const speedKmh = speed ? speed * 3.6 : this.AVERAGE_SPEED_KMH;
    const distanceKm = distance / 1000;
    const hours = distanceKm / speedKmh;
    return Math.round(hours * 60); // Return minutes
  }

  /**
   * Get current position
   */
  public getCurrentPosition(): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined
          });
        },
        (error) => {
          reject(new Error(error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: any): void {
    try {
      if (!message || typeof message !== 'object') return;
      
      // Handle different message types
      if (message.type === 'location' && message.data) {
        this.handleLocationMessage(message.data);
      }
    } catch (error) {
      console.error('[LocationTracker] Error in WebSocket message handler:', error);
      if (this.handlers.onError) {
        this.handlers.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  /**
   * Handle location update messages
   */
  private handleLocationMessage(update: any): void {
    if (!update || !this.currentRoute || update.routeId !== this.currentRoute.id) return;
    
    // Ensure the update has all required fields
    const validUpdate: LocationUpdate = {
      routeId: update.routeId,
      position: update.position || this.lastPosition || this.currentRoute.origin,
      distance: typeof update.distance === 'number' ? update.distance : 0,
      eta: typeof update.eta === 'number' ? update.eta : 0,
      speed: typeof update.speed === 'number' ? update.speed : 0
    };
    
    // Update last position
    this.lastPosition = validUpdate.position;
    
    // Notify handlers
    if (this.handlers.onPositionUpdate) {
      this.handlers.onPositionUpdate(validUpdate);
    }
    
    // Handle arrival if close to destination
    if (validUpdate.distance <= this.ARRIVAL_THRESHOLD_METERS && this.currentRoute.status === 'in-progress') {
      this.handleArrival();
    }
  }

  /**
   * Get current route
   */
  public getCurrentRoute(): Route | null {
    return this.currentRoute;
  }

  /**
   * Get last known position
   */
  public getLastPosition(): Position | null {
    return this.lastPosition;
  }

  /**
   * Format distance for display
   */
  public formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Format ETA for display
   */
  public formatETA(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    // Stop watching position
    this.stopWatchingPosition();
    
    // Clear any intervals
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    // Remove all message listeners
    this.unsubscribeCallbacks.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('[LocationTracker] Error during cleanup:', error);
      }
    });
    this.unsubscribeCallbacks = [];
    
    // Remove the main message handler
    if (this.messageHandler) {
      this.wsClient.off('message', this.messageHandler);
      this.messageHandler = null;
    }
    
    console.log('[LocationTracker] Destroyed');
  }
}

export default LocationTracker.getInstance();
