import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PresenceManager, UserPresence, PresenceUpdate } from '@/lib/presence-manager';

// Mock WebSocketClient - define functions inside factory to avoid hoisting issues
const mockSend = vi.fn();
const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();
const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockOn = vi.fn();

vi.mock('@/lib/websocket-client', () => ({
  default: {
    get send() { return mockSend; },
    get subscribe() { return mockSubscribe; },
    get unsubscribe() { return mockUnsubscribe; },
    get connect() { return mockConnect; },
    get on() { return mockOn; },
    isConnected: true
  },
  WebSocketClient: {
    getInstance: () => ({
      get send() { return mockSend; },
      get subscribe() { return mockSubscribe; },
      get unsubscribe() { return mockUnsubscribe; },
      get connect() { return mockConnect; },
      get on() { return mockOn; },
      isConnected: true
    })
  }
}));

describe('PresenceManager', () => {
  let presenceManager: PresenceManager;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    presenceManager = new PresenceManager();
  });

  afterEach(() => {
    presenceManager.destroy();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with empty presence map', () => {
      const allPresence = presenceManager.getAllPresence();
      expect(allPresence.size).toBe(0);
    });
  });

  describe('Tracking', () => {
    it('should start tracking with user info', () => {
      const handlers = {
        onPresenceUpdate: vi.fn(),
        onUserOnline: vi.fn()
      };

      presenceManager.startTracking('user1', 'John Doe', handlers);

      // Should send presence_update (from updateStatus) and heartbeat
      expect(mockSend).toHaveBeenCalledWith('presence_update', {
        userId: 'user1',
        userName: 'John Doe',
        status: 'online',
        timestamp: expect.any(Number)
      });

      expect(mockSend).toHaveBeenCalledWith('presence', {
        type: 'heartbeat',
        data: {
          userId: 'user1',
          userName: 'John Doe',
          timestamp: expect.any(Number)
        }
      });
    });

    it('should send heartbeat at regular intervals', () => {
      presenceManager.startTracking('user1', 'John Doe', {});

      mockSend.mockClear();

      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30000);

      expect(mockSend).toHaveBeenCalledWith('presence', {
        type: 'heartbeat',
        data: {
          userId: 'user1',
          userName: 'John Doe',
          timestamp: expect.any(Number)
        }
      });
    });

    it('should stop tracking and cleanup', () => {
      presenceManager.startTracking('user1', 'John Doe', {});

      mockSend.mockClear();

      presenceManager.stopTracking();

      // Should send offline status
      expect(mockSend).toHaveBeenCalledWith('presence_update', {
        userId: 'user1',
        userName: 'John Doe',
        status: 'offline',
        timestamp: expect.any(Number)
      });

      // Should not send more heartbeats
      mockSend.mockClear();
      vi.advanceTimersByTime(30000);
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe('Presence Updates', () => {
    it('should handle presence_update messages', () => {
      const onPresenceUpdate = vi.fn();
      presenceManager.startTracking('user1', 'John Doe', { onPresenceUpdate });

      // Get message handler callback from mockOn
      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];
      expect(messageHandler).toBeDefined();

      // Simulate presence update message
      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user2',
            userName: 'Jane Smith',
            status: 'online',
            timestamp: Date.now()
          }
        }
      });

      expect(onPresenceUpdate).toHaveBeenCalledWith({
        userId: 'user2',
        userName: 'Jane Smith',
        status: 'online',
        timestamp: expect.any(Number)
      });
    });

    it('should handle presence_list messages', () => {
      const onPresenceUpdate = vi.fn();
      presenceManager.startTracking('user1', 'John Doe', { onPresenceUpdate });

      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];

      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_list',
          data: {
            users: [
              { userId: 'user2', userName: 'Jane', status: 'online', lastSeen: Date.now() },
              { userId: 'user3', userName: 'Bob', status: 'away', lastSeen: Date.now() - 60000 }
            ]
          }
        }
      });

      // Should call onPresenceUpdate for each user
      expect(onPresenceUpdate).toHaveBeenCalledTimes(2);
    });

    it('should call onUserOnline when user goes online', () => {
      const onUserOnline = vi.fn();
      presenceManager.startTracking('user1', 'John Doe', { onUserOnline });

      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];

      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user2',
            userName: 'Jane Smith',
            status: 'online',
            timestamp: Date.now()
          }
        }
      });

      expect(onUserOnline).toHaveBeenCalledWith('user2', 'Jane Smith');
    });

    it('should call onUserOffline when user goes offline', () => {
      const onUserOffline = vi.fn();
      presenceManager.startTracking('user1', 'John Doe', { onUserOffline });

      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];

      // First make user online
      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user2',
            userName: 'Jane Smith',
            status: 'online',
            timestamp: Date.now()
          }
        }
      });

      // Then offline
      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user2',
            userName: 'Jane Smith',
            status: 'offline',
            timestamp: Date.now()
          }
        }
      });

      expect(onUserOffline).toHaveBeenCalledWith('user2', 'Jane Smith');
    });

    it('should call onUserAway when user goes away', () => {
      const onUserAway = vi.fn();
      presenceManager.startTracking('user1', 'John Doe', { onUserAway });

      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];

      // First make user online
      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user2',
            userName: 'Jane Smith',
            status: 'online',
            timestamp: Date.now()
          }
        }
      });

      // Then away
      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user2',
            userName: 'Jane Smith',
            status: 'away',
            timestamp: Date.now()
          }
        }
      });

      expect(onUserAway).toHaveBeenCalledWith('user2', 'Jane Smith');
    });
  });

  describe('Activity Monitoring', () => {
    it('should update status to online on activity', () => {
      presenceManager.startTracking('user1', 'John Doe', {});

      // Simulate user going away
      presenceManager.updateStatus('away');

      mockSend.mockClear();

      // Simulate activity (mousemove)
      const event = new Event('mousemove');
      globalThis.dispatchEvent(event);

      // Should send online status
      expect(mockSend).toHaveBeenCalledWith('presence_update', {
        userId: 'user1',
        userName: 'John Doe',
        status: 'online',
        timestamp: expect.any(Number)
      });
    });

    it('should throttle activity updates', () => {
      presenceManager.startTracking('user1', 'John Doe', {});
      presenceManager.updateStatus('away');

      mockSend.mockClear();

      // Simulate multiple quick activities
      for (let i = 0; i < 10; i++) {
        globalThis.dispatchEvent(new Event('mousemove'));
      }

      // Should only send once (throttled)
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('Stale Presence Detection', () => {
    it('should detect stale presence and mark as offline', () => {
      const onUserOffline = vi.fn();
      presenceManager.startTracking('user1', 'John Doe', { onUserOffline });

      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];

      // Add a user with old heartbeat
      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user2',
            userName: 'Jane Smith',
            status: 'online',
            timestamp: Date.now() - 120000 // 2 minutes ago
          }
        }
      });

      // Manually set old heartbeat
      const presence = presenceManager.getUserPresence('user2');
      if (presence) {
        presence.lastHeartbeat = Date.now() - 120000;
      }

      // Start stale check
      presenceManager.startStaleCheck();

      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30000);

      // Should mark as offline
      expect(onUserOffline).toHaveBeenCalledWith('user2', 'Jane Smith');
    });

    it('should check stale presence at regular intervals', () => {
      presenceManager.startTracking('user1', 'John Doe', {});
      presenceManager.startStaleCheck();

      const checkStalePresenceSpy = vi.spyOn(presenceManager as any, 'checkStalePresence');

      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30000);
      expect(checkStalePresenceSpy).toHaveBeenCalledTimes(1);

      // Another 30 seconds
      vi.advanceTimersByTime(30000);
      expect(checkStalePresenceSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Utility Methods', () => {
    it('should get user presence', () => {
      presenceManager.startTracking('user1', 'John Doe', {});

      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];

      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user2',
            userName: 'Jane Smith',
            status: 'online',
            timestamp: Date.now()
          }
        }
      });

      const presence = presenceManager.getUserPresence('user2');
      expect(presence).toMatchObject({
        userId: 'user2',
        userName: 'Jane Smith',
        status: 'online'
      });
    });

    it('should get all presence', () => {
      presenceManager.startTracking('user1', 'John Doe', {});

      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];

      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_list',
          data: {
            users: [
              { userId: 'user2', userName: 'Jane', status: 'online', lastSeen: Date.now() },
              { userId: 'user3', userName: 'Bob', status: 'away', lastSeen: Date.now() }
            ]
          }
        }
      });

      const allPresence = presenceManager.getAllPresence();
      expect(allPresence.size).toBe(2);
    });

    it('should get online count', () => {
      presenceManager.startTracking('user1', 'John Doe', {});

      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];

      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_list',
          data: {
            users: [
              { userId: 'user2', userName: 'Jane', status: 'online', lastSeen: Date.now() },
              { userId: 'user3', userName: 'Bob', status: 'away', lastSeen: Date.now() },
              { userId: 'user4', userName: 'Alice', status: 'online', lastSeen: Date.now() }
            ]
          }
        }
      });

      const count = presenceManager.getOnlineCount();
      expect(count).toBe(2);
    });

    it('should check if user is online', () => {
      presenceManager.startTracking('user1', 'John Doe', {});

      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];

      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user2',
            userName: 'Jane Smith',
            status: 'online',
            timestamp: Date.now()
          }
        }
      });

      expect(presenceManager.isUserOnline('user2')).toBe(true);
      expect(presenceManager.isUserOnline('user3')).toBe(false);
    });

    it('should get last seen timestamp', () => {
      presenceManager.startTracking('user1', 'John Doe', {});

      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];
      const timestamp = Date.now() - 60000;

      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user2',
            userName: 'Jane Smith',
            status: 'offline',
            timestamp
          }
        }
      });

      const lastSeen = presenceManager.getLastSeen('user2');
      expect(lastSeen).toBe(timestamp);
    });

    it('should format last seen text', () => {
      presenceManager.startTracking('user1', 'John Doe', {});

      const messageHandler = mockOn.mock.calls.find(call => call[0] === 'message')?.[1];

      // Online user
      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user2',
            userName: 'Jane',
            status: 'online',
            timestamp: Date.now()
          }
        }
      });

      expect(presenceManager.formatLastSeen('user2')).toBe('Online now');

      // User offline 5 minutes ago
      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user3',
            userName: 'Bob',
            status: 'offline',
            timestamp: Date.now() - 300000
          }
        }
      });

      expect(presenceManager.formatLastSeen('user3')).toBe('5 minutes ago');

      // User offline 2 hours ago
      messageHandler({
        type: 'presence',
        data: {
          type: 'presence_update',
          data: {
            userId: 'user4',
            userName: 'Alice',
            status: 'offline',
            timestamp: Date.now() - 7200000
          }
        }
      });

      expect(presenceManager.formatLastSeen('user4')).toBe('2 hours ago');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on destroy', () => {
      presenceManager.startTracking('user1', 'John Doe', {});
      presenceManager.startStaleCheck();

      presenceManager.destroy();

      // Should clear timers
      mockSend.mockClear();
      vi.advanceTimersByTime(30000);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should remove activity listeners on destroy', () => {
      presenceManager.startTracking('user1', 'John Doe', {});
      presenceManager.updateStatus('away');

      presenceManager.destroy();

      mockSend.mockClear();

      // Activity should not trigger updates
      globalThis.dispatchEvent(new Event('mousemove'));
      expect(mockSend).not.toHaveBeenCalled();
    });
  });
});
