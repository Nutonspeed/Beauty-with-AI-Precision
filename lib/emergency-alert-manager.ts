/**
 * Emergency Alert Manager
 * Singleton manager for broadcasting emergency alerts with priority levels
 */

import WebSocketClient from '@/lib/websocket-client';

export type AlertLevel = 'info' | 'warning' | 'critical' | 'emergency' | 'code-blue';

export interface EmergencyAlert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  timestamp: number;
  sourceId: string;
  sourceName?: string;
  facilityId: string;
  priority: number;
  requiresAck: boolean;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
}

export interface AlertAcknowledgment {
  alertId: string;
  userId: string;
  userName?: string;
  acknowledgedAt: number;
}

interface AlertHandlers {
  onAlertReceived?: (alert: EmergencyAlert) => void;
  onAlertDismissed?: (alertId: string) => void;
  onAlertAcknowledged?: (ack: AlertAcknowledgment) => void;
  onAlertUpdated?: (alert: EmergencyAlert) => void;
  onError?: (error: Error) => void;
}

const PRIORITY_LEVELS: Record<AlertLevel, number> = {
  'info': 1,
  'warning': 2,
  'critical': 3,
  'emergency': 4,
  'code-blue': 5
};

const AUTO_DISMISS_TIMEOUT: Record<AlertLevel, number> = {
  'info': 30000, // 30 seconds
  'warning': 60000, // 1 minute
  'critical': 300000, // 5 minutes
  'emergency': 0, // No auto-dismiss
  'code-blue': 0 // No auto-dismiss
};

export class EmergencyAlertManager {
  private static instance: EmergencyAlertManager;
  private wsClient: typeof WebSocketClient;
  private handlers: AlertHandlers = {};
  private activeAlerts: Map<string, EmergencyAlert> = new Map();
  private alertHistory: EmergencyAlert[] = [];
  private acknowledgments: Map<string, Set<string>> = new Map();
  private subscribedFacilities: Set<string> = new Set();
  private dismissTimers: Map<string, NodeJS.Timeout> = new Map();
  private maxHistorySize = 100;

  private constructor() {
    this.wsClient = WebSocketClient;
    console.log('[EmergencyAlertManager] Initialized');
  }

  static getInstance(): EmergencyAlertManager {
    if (!EmergencyAlertManager.instance) {
      EmergencyAlertManager.instance = new EmergencyAlertManager();
    }
    return EmergencyAlertManager.instance;
  }

  /**
   * Initialize with event handlers
   */
  initialize(handlers: AlertHandlers): void {
    this.handlers = handlers;
    console.log('[EmergencyAlertManager] Initialized with handlers');
  }

  /**
   * Subscribe to alerts for a facility
   */
  subscribe(facilityId: string): void {
    if (this.subscribedFacilities.has(facilityId)) {
      console.log(`[EmergencyAlertManager] Already subscribed to facility: ${facilityId}`);
      return;
    }

    this.subscribedFacilities.add(facilityId);

    // Setup event handlers for WebSocket messages
    this.wsClient.on('message', (data: any) => {
      if (!data || typeof data !== 'object') return;

      switch (data.type) {
        case 'alert_broadcast':
          if (data.alert && data.alert.facilityId === facilityId) {
            this.handleAlertReceived(data.alert);
          }
          break;
        case 'alert_dismissed':
          if (data.alertId) {
            this.handleAlertDismissed(data.alertId);
          }
          break;
        case 'alert_acknowledged':
          if (data.acknowledgment) {
            this.handleAlertAcknowledged(data.acknowledgment);
          }
          break;
        case 'alert_updated':
          if (data.alert && data.alert.facilityId === facilityId) {
            this.handleAlertUpdated(data.alert);
          }
          break;
      }
    });

    console.log(`[EmergencyAlertManager] Subscribed to facility: ${facilityId}`);
  }

  /**
   * Unsubscribe from facility alerts
   */
  unsubscribe(facilityId: string): void {
    if (!this.subscribedFacilities.has(facilityId)) {
      return;
    }

    this.subscribedFacilities.delete(facilityId);

    // Clear timers for this facility's alerts
    this.activeAlerts.forEach((alert, alertId) => {
      if (alert.facilityId === facilityId) {
        this.clearDismissTimer(alertId);
      }
    });

    console.log(`[EmergencyAlertManager] Unsubscribed from facility: ${facilityId}`);
  }

  /**
   * Broadcast an emergency alert
   */
  async broadcastAlert(alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'priority'>): Promise<EmergencyAlert> {
    const fullAlert: EmergencyAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      priority: PRIORITY_LEVELS[alert.level]
    };

    this.activeAlerts.set(fullAlert.id, fullAlert);
    this.addToHistory(fullAlert);

    // Set up auto-dismiss timer if applicable
    const dismissTimeout = AUTO_DISMISS_TIMEOUT[alert.level];
    if (dismissTimeout > 0) {
      this.setDismissTimer(fullAlert.id, dismissTimeout);
    }

    // Broadcast via WebSocket
    this.wsClient.send('alert_broadcast', fullAlert);

    // Trigger local handler
    if (this.handlers.onAlertReceived) {
      this.handlers.onAlertReceived(fullAlert);
    }

    console.log(`[EmergencyAlertManager] Broadcasted alert: ${fullAlert.id} (${fullAlert.level})`);
    return fullAlert;
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string, userName?: string): Promise<AlertAcknowledgment> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`);
    }

    if (!alert.requiresAck) {
      console.log(`[EmergencyAlertManager] Alert ${alertId} does not require acknowledgment`);
      return {
        alertId,
        userId,
        userName,
        acknowledgedAt: Date.now()
      };
    }

    const ack: AlertAcknowledgment = {
      alertId,
      userId,
      userName,
      acknowledgedAt: Date.now()
    };

    // Track acknowledgment
    if (!this.acknowledgments.has(alertId)) {
      this.acknowledgments.set(alertId, new Set());
    }
    this.acknowledgments.get(alertId)!.add(userId);

    // Send acknowledgment via WebSocket
    this.wsClient.send('alert_acknowledged', ack);

    // Trigger local handler
    if (this.handlers.onAlertAcknowledged) {
      this.handlers.onAlertAcknowledged(ack);
    }

    console.log(`[EmergencyAlertManager] Alert ${alertId} acknowledged by ${userId}`);
    return ack;
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      console.log(`[EmergencyAlertManager] Alert ${alertId} not found`);
      return;
    }

    this.activeAlerts.delete(alertId);
    this.clearDismissTimer(alertId);

    // Send dismissal via WebSocket
    this.wsClient.send('alert_dismissed', { alertId });

    // Trigger local handler
    if (this.handlers.onAlertDismissed) {
      this.handlers.onAlertDismissed(alertId);
    }

    console.log(`[EmergencyAlertManager] Dismissed alert: ${alertId}`);
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(facilityId?: string): EmergencyAlert[] {
    const alerts = Array.from(this.activeAlerts.values());
    const filtered = facilityId
      ? alerts.filter(a => a.facilityId === facilityId)
      : alerts;
    return filtered.sort((a, b) => b.priority - a.priority || b.timestamp - a.timestamp);
  }

  /**
   * Get active alerts by level
   */
  getAlertsByLevel(level: AlertLevel, facilityId?: string): EmergencyAlert[] {
    return this.getActiveAlerts(facilityId).filter(a => a.level === level);
  }

  /**
   * Get unacknowledged alerts for a user
   */
  getUnacknowledgedAlerts(userId: string, facilityId?: string): EmergencyAlert[] {
    return this.getActiveAlerts(facilityId).filter(alert => {
      if (!alert.requiresAck) return false;
      const acks = this.acknowledgments.get(alert.id);
      return !acks || !acks.has(userId);
    });
  }

  /**
   * Get alert acknowledgments
   */
  getAlertAcknowledgments(alertId: string): Set<string> {
    return this.acknowledgments.get(alertId) || new Set();
  }

  /**
   * Get alert history
   */
  getAlertHistory(facilityId?: string): EmergencyAlert[] {
    if (facilityId) {
      return this.alertHistory.filter(a => a.facilityId === facilityId);
    }
    return [...this.alertHistory];
  }

  /**
   * Clear all alerts for a facility
   */
  clearAllAlerts(facilityId?: string): void {
    if (facilityId) {
      const alertsToClear = Array.from(this.activeAlerts.keys()).filter(
        id => this.activeAlerts.get(id)?.facilityId === facilityId
      );
      alertsToClear.forEach(id => this.dismissAlert(id));
    } else {
      this.activeAlerts.clear();
      this.acknowledgments.clear();
      this.dismissTimers.forEach(timer => clearTimeout(timer));
      this.dismissTimers.clear();
    }
    console.log(`[EmergencyAlertManager] Cleared all alerts${facilityId ? ` for facility: ${facilityId}` : ''}`);
  }

  /**
   * Get alert statistics
   */
  getStatistics(facilityId?: string): {
    total: number;
    byLevel: Record<AlertLevel, number>;
    requiresAck: number;
    acknowledged: number;
  } {
    const alerts = this.getActiveAlerts(facilityId);
    const stats = {
      total: alerts.length,
      byLevel: {
        info: 0,
        warning: 0,
        critical: 0,
        emergency: 0,
        'code-blue': 0
      } as Record<AlertLevel, number>,
      requiresAck: 0,
      acknowledged: 0
    };

    alerts.forEach(alert => {
      stats.byLevel[alert.level]++;
      if (alert.requiresAck) {
        stats.requiresAck++;
        const acks = this.acknowledgments.get(alert.id);
        if (acks && acks.size > 0) {
          stats.acknowledged++;
        }
      }
    });

    return stats;
  }

  // Private helper methods

  private handleAlertReceived(alert: EmergencyAlert): void {
    this.activeAlerts.set(alert.id, alert);
    this.addToHistory(alert);

    // Set up auto-dismiss timer
    const dismissTimeout = AUTO_DISMISS_TIMEOUT[alert.level];
    if (dismissTimeout > 0) {
      this.setDismissTimer(alert.id, dismissTimeout);
    }

    if (this.handlers.onAlertReceived) {
      this.handlers.onAlertReceived(alert);
    }

    console.log(`[EmergencyAlertManager] Received alert: ${alert.id} (${alert.level})`);
  }

  private handleAlertDismissed(alertId: string): void {
    this.activeAlerts.delete(alertId);
    this.clearDismissTimer(alertId);

    if (this.handlers.onAlertDismissed) {
      this.handlers.onAlertDismissed(alertId);
    }

    console.log(`[EmergencyAlertManager] Alert dismissed: ${alertId}`);
  }

  private handleAlertAcknowledged(ack: AlertAcknowledgment): void {
    if (!this.acknowledgments.has(ack.alertId)) {
      this.acknowledgments.set(ack.alertId, new Set());
    }
    this.acknowledgments.get(ack.alertId)!.add(ack.userId);

    if (this.handlers.onAlertAcknowledged) {
      this.handlers.onAlertAcknowledged(ack);
    }

    console.log(`[EmergencyAlertManager] Alert ${ack.alertId} acknowledged by ${ack.userId}`);
  }

  private handleAlertUpdated(alert: EmergencyAlert): void {
    if (this.activeAlerts.has(alert.id)) {
      this.activeAlerts.set(alert.id, alert);

      if (this.handlers.onAlertUpdated) {
        this.handlers.onAlertUpdated(alert);
      }

      console.log(`[EmergencyAlertManager] Alert updated: ${alert.id}`);
    }
  }

  private addToHistory(alert: EmergencyAlert): void {
    this.alertHistory.unshift(alert);
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.pop();
    }
  }

  private setDismissTimer(alertId: string, timeout: number): void {
    this.clearDismissTimer(alertId);
    const timer = setTimeout(() => {
      this.dismissAlert(alertId);
    }, timeout);
    this.dismissTimers.set(alertId, timer);
  }

  private clearDismissTimer(alertId: string): void {
    const timer = this.dismissTimers.get(alertId);
    if (timer) {
      clearTimeout(timer);
      this.dismissTimers.delete(alertId);
    }
  }

  /**
   * Reset manager state (for testing)
   */
  reset(): void {
    this.activeAlerts.clear();
    this.alertHistory = [];
    this.acknowledgments.clear();
    this.subscribedFacilities.clear();
    this.dismissTimers.forEach(timer => clearTimeout(timer));
    this.dismissTimers.clear();
    this.handlers = {};
    console.log('[EmergencyAlertManager] Reset complete');
  }
}

// Export singleton instance
export default EmergencyAlertManager.getInstance();
