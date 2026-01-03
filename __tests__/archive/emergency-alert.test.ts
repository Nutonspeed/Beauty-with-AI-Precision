/**
 * Emergency Alert System Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEmergencyAlert } from '@/hooks/use-emergency-alert';
import EmergencyAlertManager, { EmergencyAlert } from '@/lib/emergency-alert-manager';

// Mock WebSocket Client
vi.mock('@/lib/websocket-client', () => ({
  default: {
    subscribe: vi.fn(),
    send: vi.fn(),
    on: vi.fn()
  },
  WebSocketClient: {
    subscribe: vi.fn(),
    send: vi.fn(),
    on: vi.fn()
  }
}));

describe('Emergency Alert System', () => {
  beforeEach(() => {
    EmergencyAlertManager.reset();
  });

  describe('Alert Broadcasting', () => {
    it('should broadcast alert with correct priority', async () => {
      console.log('[EmergencyAlertManager] Initialized');
      const manager = EmergencyAlertManager;
      
      const alert = await manager.broadcastAlert({
        level: 'critical',
        title: 'Patient Emergency',
        message: 'Room 302 requires immediate assistance',
        sourceId: 'nurse-1',
        sourceName: 'Nurse Station',
        facilityId: 'facility-1',
        requiresAck: true
      });

      expect(alert).toBeDefined();
      expect(alert.level).toBe('critical');
      expect(alert.priority).toBe(3);
      expect(alert.requiresAck).toBe(true);
    });

    it('should broadcast code-blue with highest priority', async () => {
      console.log('[EmergencyAlertManager] Initialized with handlers');
      const manager = EmergencyAlertManager;
      
      const alert = await manager.broadcastAlert({
        level: 'code-blue',
        title: 'Code Blue - Room 405',
        message: 'Cardiac arrest',
        sourceId: 'doctor-1',
        facilityId: 'facility-1',
        requiresAck: true
      });

      expect(alert.level).toBe('code-blue');
      expect(alert.priority).toBe(5);
    });

    it('should add alert to active alerts', async () => {
      console.log('[EmergencyAlertManager] Unsubscribed from provider: provider-1');
      const manager = EmergencyAlertManager;
      
      await manager.broadcastAlert({
        level: 'warning',
        title: 'Medication Reminder',
        message: 'Check patient medications',
        sourceId: 'system',
        facilityId: 'facility-1',
        requiresAck: false
      });

      const activeAlerts = manager.getActiveAlerts('facility-1');
      expect(activeAlerts.length).toBe(1);
      expect(activeAlerts[0].level).toBe('warning');
    });
  });

  describe('Alert Acknowledgment', () => {
    it('should track alert acknowledgment', async () => {
      const manager = EmergencyAlertManager;
      
      const alert = await manager.broadcastAlert({
        level: 'emergency',
        title: 'Fire Alert',
        message: 'Fire detected in building',
        sourceId: 'fire-system',
        facilityId: 'facility-1',
        requiresAck: true
      });

      const ack = await manager.acknowledgeAlert(alert.id, 'user-1', 'Dr. Smith');
      
      expect(ack.alertId).toBe(alert.id);
      expect(ack.userId).toBe('user-1');
      expect(ack.userName).toBe('Dr. Smith');
    });

    it('should track multiple acknowledgments', async () => {
      const manager = EmergencyAlertManager;
      
      const alert = await manager.broadcastAlert({
        level: 'critical',
        title: 'System Maintenance',
        message: 'Server maintenance at 2 AM',
        sourceId: 'admin',
        facilityId: 'facility-1',
        requiresAck: true
      });

      await manager.acknowledgeAlert(alert.id, 'user-1', 'Dr. Smith');
      await manager.acknowledgeAlert(alert.id, 'user-2', 'Nurse Jones');
      
      const acks = manager.getAlertAcknowledgments(alert.id);
      expect(acks.size).toBe(2);
      expect(acks.has('user-1')).toBe(true);
      expect(acks.has('user-2')).toBe(true);
    });

    it('should get unacknowledged alerts for user', async () => {
      const manager = EmergencyAlertManager;
      
      const alert1 = await manager.broadcastAlert({
        level: 'critical',
        title: 'Alert 1',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: true
      });

      const alert2 = await manager.broadcastAlert({
        level: 'emergency',
        title: 'Alert 2',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: true
      });

      await manager.acknowledgeAlert(alert1.id, 'user-1');

      const unacked = manager.getUnacknowledgedAlerts('user-1', 'facility-1');
      expect(unacked.length).toBe(1);
      expect(unacked[0].id).toBe(alert2.id);
    });
  });

  describe('Alert Management', () => {
    it('should dismiss alert and remove from active', async () => {
      const manager = EmergencyAlertManager;
      
      const alert = await manager.broadcastAlert({
        level: 'info',
        title: 'General Info',
        message: 'System update available',
        sourceId: 'system',
        facilityId: 'facility-1',
        requiresAck: false
      });

      await manager.dismissAlert(alert.id);
      
      const activeAlerts = manager.getActiveAlerts('facility-1');
      expect(activeAlerts.length).toBe(0);
    });

    it('should clear all facility alerts', async () => {
      const manager = EmergencyAlertManager;
      
      await manager.broadcastAlert({
        level: 'info',
        title: 'Alert 1',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: false
      });

      await manager.broadcastAlert({
        level: 'warning',
        title: 'Alert 2',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: false
      });

      manager.clearAllAlerts('facility-1');
      
      const activeAlerts = manager.getActiveAlerts('facility-1');
      expect(activeAlerts.length).toBe(0);
    });

    it('should maintain alert history', async () => {
      const manager = EmergencyAlertManager;
      
      await manager.broadcastAlert({
        level: 'critical',
        title: 'Historical Alert',
        message: 'Test history',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: false
      });

      const history = manager.getAlertHistory('facility-1');
      expect(history.length).toBe(1);
      expect(history[0].title).toBe('Historical Alert');
    });
  });

  describe('Alert Filtering', () => {
    it('should filter alerts by level', async () => {
      const manager = EmergencyAlertManager;
      
      await manager.broadcastAlert({
        level: 'info',
        title: 'Info Alert',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: false
      });

      await manager.broadcastAlert({
        level: 'critical',
        title: 'Critical Alert',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: false
      });

      const criticalAlerts = manager.getAlertsByLevel('critical', 'facility-1');
      expect(criticalAlerts.length).toBe(1);
      expect(criticalAlerts[0].level).toBe('critical');
    });

    it('should filter alerts by facility', async () => {
      const manager = EmergencyAlertManager;
      
      await manager.broadcastAlert({
        level: 'info',
        title: 'Facility 1',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: false
      });

      await manager.broadcastAlert({
        level: 'info',
        title: 'Facility 2',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-2',
        requiresAck: false
      });

      const facility1Alerts = manager.getActiveAlerts('facility-1');
      expect(facility1Alerts.length).toBe(1);
      expect(facility1Alerts[0].facilityId).toBe('facility-1');
    });
  });

  describe('Alert Statistics', () => {
    it('should calculate alert statistics', async () => {
      const manager = EmergencyAlertManager;
      
      await manager.broadcastAlert({
        level: 'info',
        title: 'Info',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: false
      });

      await manager.broadcastAlert({
        level: 'critical',
        title: 'Critical',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: true
      });

      const stats = manager.getStatistics('facility-1');
      expect(stats.total).toBe(2);
      expect(stats.byLevel.info).toBe(1);
      expect(stats.byLevel.critical).toBe(1);
      expect(stats.requiresAck).toBe(1);
    });

    it('should track acknowledgment in statistics', async () => {
      const manager = EmergencyAlertManager;
      
      const alert = await manager.broadcastAlert({
        level: 'emergency',
        title: 'Emergency',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: true
      });

      await manager.acknowledgeAlert(alert.id, 'user-1');

      const stats = manager.getStatistics('facility-1');
      expect(stats.requiresAck).toBe(1);
      expect(stats.acknowledged).toBe(1);
    });
  });

  describe('Multi-Facility Support', () => {
    it('should handle multiple facilities independently', async () => {
      const manager = EmergencyAlertManager;
      
      await manager.broadcastAlert({
        level: 'info',
        title: 'Facility 1 Alert',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: false
      });

      await manager.broadcastAlert({
        level: 'warning',
        title: 'Facility 2 Alert',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-2',
        requiresAck: false
      });

      const facility1Stats = manager.getStatistics('facility-1');
      const facility2Stats = manager.getStatistics('facility-2');

      expect(facility1Stats.total).toBe(1);
      expect(facility2Stats.total).toBe(1);
      expect(facility1Stats.byLevel.info).toBe(1);
      expect(facility2Stats.byLevel.warning).toBe(1);
    });
  });

  describe('React Hook Integration', () => {
    it('should initialize with facility subscription', () => {
      console.log('[useEmergencyAlert] Slot updated: slot-provider-1-1736906400000');
      const { result } = renderHook(() =>
        useEmergencyAlert({
          facilityId: 'facility-1',
          userId: 'user-1',
          autoSubscribe: true
        })
      );

      expect(result.current.activeAlerts).toEqual([]);
      expect(result.current.unacknowledgedCount).toBe(0);
    });

    it('should broadcast alert via hook', async () => {
      console.log('[useEmergencyAlert] Booking conflict: {');
      const { result } = renderHook(() =>
        useEmergencyAlert({
          facilityId: 'facility-1',
          userId: 'user-1',
          autoSubscribe: false
        })
      );

      let broadcastedAlert: EmergencyAlert | null = null;
      await act(async () => {
        broadcastedAlert = await result.current.broadcastAlert({
          level: 'warning',
          title: 'Hook Test',
          message: 'Testing hook',
          sourceId: 'test',
          facilityId: 'facility-1',
          requiresAck: false
        });
      });

      expect(broadcastedAlert).toBeDefined();
      expect(broadcastedAlert!.level).toBe('warning');
    });

    it('should acknowledge alert via hook', async () => {
      const { result } = renderHook(() =>
        useEmergencyAlert({
          facilityId: 'facility-1',
          userId: 'user-1',
          autoSubscribe: false
        })
      );

      let alert;
      await act(async () => {
        alert = await result.current.broadcastAlert({
          level: 'critical',
          title: 'Ack Test',
          message: 'Test',
          sourceId: 'test',
          facilityId: 'facility-1',
          requiresAck: true
        });
      });

      await act(async () => {
        await result.current.acknowledgeAlert(alert!.id);
      });

      await waitFor(() => {
        const stats = result.current.statistics;
        expect(stats.acknowledged).toBeGreaterThan(0);
      });
    });

    it('should handle errors gracefully', async () => {
      console.log('[useEmergencyAlert] Error: Error: Slot not found');
      const { result } = renderHook(() =>
        useEmergencyAlert({
          facilityId: 'facility-1',
          userId: 'user-1',
          autoSubscribe: false
        })
      );

      await act(async () => {
        await result.current.acknowledgeAlert('non-existent-alert');
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Priority and Sorting', () => {
    it('should sort alerts by priority', async () => {
      const manager = EmergencyAlertManager;
      
      await manager.broadcastAlert({
        level: 'info',
        title: 'Low Priority',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: false
      });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      await manager.broadcastAlert({
        level: 'code-blue',
        title: 'High Priority',
        message: 'Test',
        sourceId: 'test',
        facilityId: 'facility-1',
        requiresAck: true
      });

      const alerts = manager.getActiveAlerts('facility-1');
      // Should be sorted by priority (highest first), then timestamp (newest first)
      expect(alerts[0].priority).toBeGreaterThan(alerts[1].priority);
      expect(alerts[0].level).toBe('code-blue'); // Priority 5
      expect(alerts[1].level).toBe('info'); // Priority 1
    });
  });
});
