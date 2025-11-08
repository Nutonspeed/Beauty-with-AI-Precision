import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAnalyticsRealtime } from '@/hooks/use-analytics-realtime';

// Mock WebSocketClient - must be defined before vi.mock
vi.mock('@/lib/websocket-client', () => {
  let messageCallback: Function | null = null;
  const statusCallbacks: Function[] = [];

  const mockInstance = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribe: vi.fn((callback: Function) => {
      messageCallback = callback;
      // Return unsubscribe function
      return () => {
        messageCallback = null;
      };
    }),
    unsubscribe: vi.fn(),
    onStatusChange: vi.fn((callback: Function) => {
      statusCallbacks.push(callback);
      return () => {
        const index = statusCallbacks.indexOf(callback);
        if (index > -1) statusCallbacks.splice(index, 1);
      };
    }),
    // Test helpers
    __triggerMessage: (message: unknown) => {
      if (messageCallback) messageCallback(message);
    },
    __triggerStatusChange: (status: unknown) => {
      statusCallbacks.forEach(cb => cb(status));
    }
  };

  return {
    default: mockInstance
  };
});

// Get the mock instance for tests
let mockInstance: any;

beforeEach(async () => {
  mockInstance = (await import('@/lib/websocket-client')).default;
});

describe('Analytics Realtime', () => {
  beforeEach(() => {
    // Clear call history
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useAnalyticsRealtime Hook', () => {
    it('should connect and subscribe to analytics:realtime channel', () => {
      renderHook(() => useAnalyticsRealtime());

      expect(mockInstance.connect).toHaveBeenCalled();
      expect(mockInstance.subscribe).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should receive analytics updates', async () => {
      const { result } = renderHook(() => useAnalyticsRealtime());

      const analyticsData = {
        bookingRate: 15,
        revenue: 25000,
        activeUsers: 45,
        trend: 'up' as const,
        timestamp: Date.now()
      };

      // Simulate WebSocket message
      mockInstance.__triggerMessage({
        type: 'analytics_update',
        data: analyticsData
      });

      await waitFor(() => {
        expect(result.current.analytics).toEqual(analyticsData);
      });
    });

    it('should update connection status', async () => {
      const { result } = renderHook(() => useAnalyticsRealtime());

      // Simulate connection
      mockInstance.__triggerStatusChange({
        connected: true,
        reconnecting: false
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Simulate disconnection
      mockInstance.__triggerStatusChange({
        connected: false,
        reconnecting: false
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });

    it('should handle errors', async () => {
      const { result } = renderHook(() => useAnalyticsRealtime());

      const errorMessage = 'Connection failed';
      mockInstance.__triggerStatusChange({
        connected: false,
        error: errorMessage
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useAnalyticsRealtime());

      unmount();

      // The subscribe should have been called and returned an unsubscribe function
      expect(mockInstance.subscribe).toHaveBeenCalled();
    });

    it('should handle multiple analytics updates', async () => {
      const { result } = renderHook(() => useAnalyticsRealtime());

      const updates = [
        {
          bookingRate: 10,
          revenue: 15000,
          activeUsers: 30,
          trend: 'up' as const,
          timestamp: Date.now()
        },
        {
          bookingRate: 12,
          revenue: 18000,
          activeUsers: 35,
          trend: 'up' as const,
          timestamp: Date.now() + 1000
        },
        {
          bookingRate: 8,
          revenue: 12000,
          activeUsers: 28,
          trend: 'down' as const,
          timestamp: Date.now() + 2000
        }
      ];

      for (const update of updates) {
        mockInstance.__triggerMessage({
          type: 'analytics_update',
          data: update
        });

        await waitFor(() => {
          expect(result.current.analytics).toEqual(update);
        });
      }
    });
  });

  describe('Analytics Data Validation', () => {
    it('should handle valid analytics data', async () => {
      const { result } = renderHook(() => useAnalyticsRealtime());

      const validData = {
        bookingRate: 20,
        revenue: 50000,
        activeUsers: 75,
        trend: 'up' as const,
        timestamp: Date.now()
      };

      mockInstance.__triggerMessage({
        type: 'analytics_update',
        data: validData
      });

      await waitFor(() => {
        expect(result.current.analytics?.bookingRate).toBe(20);
        expect(result.current.analytics?.revenue).toBe(50000);
        expect(result.current.analytics?.activeUsers).toBe(75);
        expect(result.current.analytics?.trend).toBe('up');
      });
    });

    it('should ignore non-analytics messages', async () => {
      const { result } = renderHook(() => useAnalyticsRealtime());

      // Send non-analytics message
      mockInstance.__triggerMessage({
        type: 'other_message',
        data: { foo: 'bar' }
      });

      expect(result.current.analytics).toBeNull();
    });
  });
});
