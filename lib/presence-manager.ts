/**
 * Presence Manager
 * Tracks online/offline status with heartbeat and last seen timestamps
 */

import wsClient, { type WebSocketClient } from './websocket-client';

type PresenceStatus = 'online' | 'offline' | 'away';

export interface UserPresence {
  userId: string;
  userName: string;
  status: PresenceStatus;
  lastSeen: number;
  lastHeartbeat: number;
}

export interface PresenceUpdate {
  userId: string;
  userName: string;
  status: PresenceStatus;
  timestamp: number;
}

interface PresenceEventHandlers {
  onPresenceUpdate?: (update: PresenceUpdate) => void;
  onUserOnline?: (userId: string, userName: string) => void;
  onUserOffline?: (userId: string, userName: string) => void;
  onUserAway?: (userId: string, userName: string) => void;
}

export class PresenceManager {
  private readonly wsClient: WebSocketClient;
  private readonly presenceMap: Map<string, UserPresence> = new Map();
  private handlers: PresenceEventHandlers = {};
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private awayTimeout: NodeJS.Timeout | null = null;
  private staleCheckInterval: NodeJS.Timeout | null = null;
  private activityResetHandler: (() => void) | null = null;
  private activityEventTarget:
    | {
        addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
        removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
      }
    | null = null;
  private currentUserId: string | null = null;
  private currentUserName: string | null = null;
  private currentUserStatus: PresenceStatus = 'offline';
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly AWAY_THRESHOLD = 300000; // 5 minutes
  private readonly OFFLINE_THRESHOLD = 60000; // 1 minute after last heartbeat

  constructor() {
    this.wsClient = wsClient;
    
    // Set up message handler
    this.wsClient.on('message', (message: any) => {
      if (message.type === 'presence') {
        this.handlePresenceMessage(message.data);
      }
    });
  }

  /**
   * Start tracking presence for current user
   */
  startTracking(userId: string, userName: string, handlers: PresenceEventHandlers): void {
    this.currentUserId = userId;
    this.currentUserName = userName;
    this.handlers = handlers;

    // No need to explicitly subscribe - we're using the global message handler
    // and filtering by message type in handlePresenceMessage

    // Set initial status as online
    this.updateStatus('online');

    // Start heartbeat
    this.startHeartbeat();

    // Monitor user activity for away status
    this.setupActivityMonitoring();

    console.log(`[Presence] Started tracking for user: ${userId}`);
  }

  /**
   * Stop tracking presence
   */
  stopTracking(): void {
    if (!this.currentUserId) return;

    // Update status to offline
    this.updateStatus('offline');

    // Clear intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.awayTimeout) {
      clearTimeout(this.awayTimeout);
      this.awayTimeout = null;
    }

    if (this.staleCheckInterval) {
      clearInterval(this.staleCheckInterval);
      this.staleCheckInterval = null;
    }

    // No need to explicitly unsubscribe - the WebSocket client will handle cleanup

    // Clear activity listeners
    this.removeActivityListeners();

    this.currentUserId = null;
    this.currentUserName = null;
    this.handlers = {};

    console.log('[Presence] Stopped tracking');
  }

  /**
   * Get presence for a specific user
   */
  getUserPresence(userId: string): UserPresence | null {
    return this.presenceMap.get(userId) || null;
  }

  /**
   * Get all tracked users
   */
  getAllPresence(): Map<string, UserPresence> {
    return new Map(this.presenceMap);
  }

  /**
   * Get online users count
   */
  getOnlineCount(): number {
    return Array.from(this.presenceMap.values()).filter(p => p.status === 'online').length;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    const presence = this.presenceMap.get(userId);
    return presence?.status === 'online';
  }

  /**
   * Get last seen timestamp for user
   */
  getLastSeen(userId: string): number | null {
    const presence = this.presenceMap.get(userId);
    return presence?.lastSeen || null;
  }

  /**
   * Format last seen as human-readable string
   */
  formatLastSeen(userId: string): string {
    const presence = this.presenceMap.get(userId);
    if (!presence) return 'Unknown';

    if (presence.status === 'online') return 'Online now';

    const now = Date.now();
    const diff = now - presence.lastSeen;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  /**
   * Update current user's status (exposed for testing)
   */
  updateStatus(status: PresenceStatus): void {
    if (!this.currentUserId || !this.currentUserName) return;

    const timestamp = Date.now();
    this.currentUserStatus = status;

    // Send presence update via WebSocket
    this.wsClient.send('presence_update', {
      userId: this.currentUserId,
      userName: this.currentUserName,
      status,
      timestamp
    });

    console.log(`[Presence] Status updated: ${status}`);
  }

  /**
   * Start heartbeat to maintain online status
   */
  private startHeartbeat(): void {
    // Send initial heartbeat
    this.sendHeartbeat();

    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Send heartbeat signal
   */
  private sendHeartbeat(): void {
    if (!this.currentUserId || !this.currentUserName) return;

    this.wsClient.send('presence', {
      type: 'heartbeat',
      data: {
        userId: this.currentUserId,
        userName: this.currentUserName,
        timestamp: Date.now()
      }
    });

    // Update local presence
    const presence = this.presenceMap.get(this.currentUserId);
    if (presence) {
      presence.lastHeartbeat = Date.now();
      presence.lastSeen = Date.now();
    }
  }

  /**
   * Setup activity monitoring for away status
   */
  private setupActivityMonitoring(): void {
    this.removeActivityListeners();

    const globalTarget =
      typeof globalThis !== 'undefined' && typeof globalThis.addEventListener === 'function'
        ? (globalThis as unknown as {
            addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
            removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
          })
        : null;

    const windowTarget =
      (globalThis as any)?.window !== undefined &&
      typeof (globalThis as any).window?.addEventListener === 'function'
        ? ((globalThis as any).window as {
            addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
            removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
          })
        : null;

    const target = globalTarget ?? windowTarget;
    if (!target) return;

    // Reset away timeout on user activity
    const resetAwayTimeout = () => {
      if (this.awayTimeout) {
        clearTimeout(this.awayTimeout);
      }

      // If currently away, go back online
      if (this.currentUserStatus === 'away') {
        this.updateStatus('online');
      }

      // Set new timeout for away status
      this.awayTimeout = setTimeout(() => {
        this.updateStatus('away');
      }, this.AWAY_THRESHOLD);
    };

    // Store handler for removal later
    this.activityResetHandler = resetAwayTimeout;
    this.activityEventTarget = target;

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart'
    ];

    // Listen to user activity events
    for (const eventType of activityEvents) {
      target.addEventListener(eventType, resetAwayTimeout);
    }

    // Initial timeout
    resetAwayTimeout();
  }

  /**
   * Remove activity event listeners
   */
  private removeActivityListeners(): void {
    if (!this.activityResetHandler || !this.activityEventTarget) {
      return;
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart'
    ];

    for (const eventType of activityEvents) {
      this.activityEventTarget?.removeEventListener(eventType, this.activityResetHandler as EventListener);
    }

    this.activityResetHandler = null;
    this.activityEventTarget = null;
  }

  /**
   * Handle incoming presence messages
   */
  private handlePresenceMessage(data: any): void {
    switch (data.type) {
      case 'presence_update':
        this.handlePresenceUpdate(data.data);
        break;
      case 'heartbeat':
        this.handleHeartbeat(data.data);
        break;
      case 'presence_list':
        this.handlePresenceList(data.data);
        break;
    }
  }

  /**
   * Handle presence update from other users
   */
  private handlePresenceUpdate(update: PresenceUpdate): void {
    // Don't process own updates
    if (update.userId === this.currentUserId) return;

    this.updateLocalPresence(update.userId, update.userName, update.status, update.timestamp);

    // Call appropriate handlers
    if (this.handlers.onPresenceUpdate) {
      this.handlers.onPresenceUpdate(update);
    }

    if (update.status === 'online' && this.handlers.onUserOnline) {
      this.handlers.onUserOnline(update.userId, update.userName);
    } else if (update.status === 'offline' && this.handlers.onUserOffline) {
      this.handlers.onUserOffline(update.userId, update.userName);
    } else if (update.status === 'away' && this.handlers.onUserAway) {
      this.handlers.onUserAway(update.userId, update.userName);
    }
  }

  /**
   * Handle heartbeat from other users
   */
  private handleHeartbeat(data: { userId: string; userName: string; timestamp: number }): void {
    // Don't process own heartbeats
    if (data.userId === this.currentUserId) return;

    const presence = this.presenceMap.get(data.userId);
    if (presence) {
      presence.lastHeartbeat = data.timestamp;
      presence.lastSeen = data.timestamp;
      // If user was offline/away and sent heartbeat, mark as online
      if (presence.status !== 'online') {
        this.updateLocalPresence(data.userId, data.userName, 'online', data.timestamp);
      }
    } else {
      // New user heartbeat
      this.updateLocalPresence(data.userId, data.userName, 'online', data.timestamp);
    }
  }

  /**
   * Handle presence list (initial sync)
   */
  private handlePresenceList(data: { users: PresenceUpdate[] } | PresenceUpdate[]): void {
    // Handle both formats: {users: [...]} or [...]
    const users = Array.isArray(data) ? data : data.users;

    for (const user of users) {
      if (user.userId !== this.currentUserId) {
        this.updateLocalPresence(user.userId, user.userName, user.status, user.timestamp);
      }

      // Call presence update handler
      if (this.handlers.onPresenceUpdate) {
        this.handlers.onPresenceUpdate(user);
      }
    }
  }

  /**
   * Update local presence cache
   */
  private updateLocalPresence(
    userId: string,
    userName: string,
    status: PresenceStatus,
    timestamp: number
  ): void {
    // Don't track current user in presence map
    if (userId === this.currentUserId) return;

    const presence: UserPresence = {
      userId,
      userName,
      status,
      lastSeen: timestamp,
      lastHeartbeat: timestamp
    };

    this.presenceMap.set(userId, presence);
  }

  /**
   * Check for stale presence (users who haven't sent heartbeat)
   */
  private checkStalePresence(): void {
    const now = Date.now();

    for (const [userId, presence] of this.presenceMap.entries()) {
      // Skip current user
      if (userId === this.currentUserId) {
        continue;
      }

      const timeSinceLastHeartbeat = now - presence.lastHeartbeat;

      // Mark as offline if no heartbeat for 1 minute
      if (timeSinceLastHeartbeat > this.OFFLINE_THRESHOLD && presence.status !== 'offline') {
        this.updateLocalPresence(userId, presence.userName, 'offline', presence.lastSeen);

        if (this.handlers.onUserOffline) {
          this.handlers.onUserOffline(userId, presence.userName);
        }
      }
    }
  }

  /**
   * Start periodic stale presence checks
   */
  startStaleCheck(): void {
    if (this.staleCheckInterval) {
      clearInterval(this.staleCheckInterval);
    }

    this.staleCheckInterval = setInterval(() => {
      this.checkStalePresence();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopTracking();
    this.presenceMap.clear();
  }
}
