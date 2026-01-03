/**
 * Location Tracker Tests
 * Test suite for GPS tracking and ETA calculation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import LocationTracker, { Position, Route } from '@/lib/location-tracker';

// Mock WebSocket client - needs to be a constructor for LocationTracker
vi.mock('@/lib/websocket-client', () => {
  class MockWebSocketClient {
    subscribe = vi.fn();
    unsubscribe = vi.fn();
    send = vi.fn();
    on = vi.fn();
    off = vi.fn();
  }

  return {
    WebSocketClient: MockWebSocketClient
  };
});

// Mock Geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

describe('LocationTracker', () => {
  let tracker: typeof LocationTracker;

  beforeEach(() => {
    tracker = LocationTracker;
    vi.clearAllMocks();
  });

  afterEach(() => {
    tracker.destroy();
  });

  describe('Distance Calculation', () => {
    it('should calculate distance between two positions', () => {
      const pos1: Position = {
        latitude: 13.7563,
        longitude: 100.5018,
        accuracy: 10,
        timestamp: Date.now()
      };

      const pos2: Position = {
        latitude: 13.7464,
        longitude: 100.5344,
        accuracy: 10,
        timestamp: Date.now()
      };

      const distance = tracker.calculateDistance(pos1, pos2);
      
      // Distance should be approximately 3.7 km
      expect(distance).toBeGreaterThan(3000);
      expect(distance).toBeLessThan(4000);
    });

    it('should return 0 for same position', () => {
      const pos: Position = {
        latitude: 13.7563,
        longitude: 100.5018,
        accuracy: 10,
        timestamp: Date.now()
      };

      const distance = tracker.calculateDistance(pos, pos);
      expect(distance).toBe(0);
    });

    it('should handle positions across hemispheres', () => {
      const pos1: Position = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        timestamp: Date.now()
      };

      const pos2: Position = {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10,
        timestamp: Date.now()
      };

      const distance = tracker.calculateDistance(pos1, pos2);
      
      // Distance should be approximately 5570 km
      expect(distance).toBeGreaterThan(5000000);
      expect(distance).toBeLessThan(6000000);
    });
  });

  describe('ETA Calculation', () => {
    it('should calculate ETA based on distance and default speed', () => {
      const distance = 10000; // 10 km
      const eta = tracker.calculateETA(distance);

      // At 40 km/h, 10 km should take 15 minutes
      expect(eta).toBe(15);
    });

    it('should calculate ETA with custom speed', () => {
      const distance = 10000; // 10 km
      const speed = 27.78; // 100 km/h in m/s
      const eta = tracker.calculateETA(distance, speed);

      // At 100 km/h, 10 km should take 6 minutes
      expect(eta).toBe(6);
    });

    it('should handle zero distance', () => {
      const distance = 0;
      const eta = tracker.calculateETA(distance);

      expect(eta).toBe(0);
    });

    it('should handle very short distances', () => {
      const distance = 100; // 100 meters
      const eta = tracker.calculateETA(distance);

      expect(eta).toBeLessThan(1);
    });
  });

  describe('Route Management', () => {
    it('should start route and set status to in-progress', () => {
      const route: Route = {
        id: 'route-1',
        visitId: 'visit-1',
        providerId: 'provider-1',
        patientId: 'patient-1',
        origin: {
          latitude: 13.7563,
          longitude: 100.5018,
          accuracy: 10,
          timestamp: Date.now()
        },
        destination: {
          latitude: 13.7464,
          longitude: 100.5344,
          accuracy: 10,
          timestamp: Date.now()
        },
        status: 'pending'
      };

      // Mock watchPosition to return immediately
      mockGeolocation.watchPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 13.7563,
            longitude: 100.5018,
            accuracy: 10,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        });
        return 1;
      });

      tracker.startRoute(route);

      const currentRoute = tracker.getCurrentRoute();
      expect(currentRoute).toBeDefined();
      expect(currentRoute?.status).toBe('in-progress');
      expect(currentRoute?.startTime).toBeDefined();
    });

    it('should complete route and calculate duration', () => {
      const route: Route = {
        id: 'route-1',
        visitId: 'visit-1',
        providerId: 'provider-1',
        patientId: 'patient-1',
        origin: {
          latitude: 13.7563,
          longitude: 100.5018,
          accuracy: 10,
          timestamp: Date.now()
        },
        destination: {
          latitude: 13.7464,
          longitude: 100.5344,
          accuracy: 10,
          timestamp: Date.now()
        },
        status: 'pending'
      };

      mockGeolocation.watchPosition.mockReturnValue(1);
      
      tracker.startRoute(route);
      
      // Wait a bit before completing
      setTimeout(() => {
        tracker.completeRoute();

        const currentRoute = tracker.getCurrentRoute();
        expect(currentRoute).toBeNull();
      }, 100);
    });
  });

  describe('Position Tracking', () => {
    it('should get current position', async () => {
      const mockPosition = {
        coords: {
          latitude: 13.7563,
          longitude: 100.5018,
          accuracy: 10,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const position = await tracker.getCurrentPosition();

      expect(position.latitude).toBe(13.7563);
      expect(position.longitude).toBe(100.5018);
      expect(position.accuracy).toBe(10);
    });

    it('should handle geolocation error', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1,
          message: 'User denied geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        });
      });

      await expect(tracker.getCurrentPosition()).rejects.toThrow('User denied geolocation');
    });
  });

  describe('Formatting', () => {
    it('should format distance in meters', () => {
      const formatted = tracker.formatDistance(500);
      expect(formatted).toBe('500 m');
    });

    it('should format distance in kilometers', () => {
      const formatted = tracker.formatDistance(1500);
      expect(formatted).toBe('1.5 km');
    });

    it('should format ETA in minutes', () => {
      const formatted = tracker.formatETA(45);
      expect(formatted).toBe('45 min');
    });

    it('should format ETA in hours and minutes', () => {
      const formatted = tracker.formatETA(90);
      expect(formatted).toBe('1h 30m');
    });

    it('should format ETA for multiple hours', () => {
      const formatted = tracker.formatETA(150);
      expect(formatted).toBe('2h 30m');
    });
  });

  describe('Geofencing', () => {
    it('should detect arrival when within threshold', () => {
      const onArrival = vi.fn();

      const route: Route = {
        id: 'route-1',
        visitId: 'visit-1',
        providerId: 'provider-1',
        patientId: 'patient-1',
        origin: {
          latitude: 13.7563,
          longitude: 100.5018,
          accuracy: 10,
          timestamp: Date.now()
        },
        destination: {
          latitude: 13.7564, // Very close to origin
          longitude: 100.5019,
          accuracy: 10,
          timestamp: Date.now()
        },
        status: 'pending'
      };

      tracker.initialize({ onArrival });

      // Mock position update very close to destination
      mockGeolocation.watchPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 13.7564,
            longitude: 100.5019,
            accuracy: 10,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        });
        return 1;
      });

      tracker.startRoute(route);

      // Give time for arrival detection
      setTimeout(() => {
        expect(onArrival).toHaveBeenCalledWith('route-1');
      }, 100);
    });
  });

  describe('Event Handlers', () => {
    it('should call onRouteStarted handler', () => {
      const onRouteStarted = vi.fn();

      tracker.initialize({ onRouteStarted });

      const route: Route = {
        id: 'route-1',
        visitId: 'visit-1',
        providerId: 'provider-1',
        patientId: 'patient-1',
        origin: {
          latitude: 13.7563,
          longitude: 100.5018,
          accuracy: 10,
          timestamp: Date.now()
        },
        destination: {
          latitude: 13.7464,
          longitude: 100.5344,
          accuracy: 10,
          timestamp: Date.now()
        },
        status: 'pending'
      };

      mockGeolocation.watchPosition.mockReturnValue(1);

      tracker.startRoute(route);

      expect(onRouteStarted).toHaveBeenCalled();
    });

    it('should call onRouteCompleted handler', () => {
      const onRouteCompleted = vi.fn();

      tracker.initialize({ onRouteCompleted });

      const route: Route = {
        id: 'route-1',
        visitId: 'visit-1',
        providerId: 'provider-1',
        patientId: 'patient-1',
        origin: {
          latitude: 13.7563,
          longitude: 100.5018,
          accuracy: 10,
          timestamp: Date.now()
        },
        destination: {
          latitude: 13.7464,
          longitude: 100.5344,
          accuracy: 10,
          timestamp: Date.now()
        },
        status: 'pending'
      };

      mockGeolocation.watchPosition.mockReturnValue(1);

      tracker.startRoute(route);
      tracker.completeRoute();

      expect(onRouteCompleted).toHaveBeenCalled();
    });
  });
});
