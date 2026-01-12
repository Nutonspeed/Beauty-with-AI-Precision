/**
 * Queue Manager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QueueManager } from '@/lib/queue-manager';

// Mock WebSocket Client
vi.mock('@/lib/websocket-client', () => ({
  default: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
}));

describe('QueueManager', () => {
  let manager: QueueManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new QueueManager();
    manager.initialize('center-1', {});
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('Join Queue', () => {
    it('should add customer to queue', async () => {
      const wsClient = await import('@/lib/websocket-client');
      const entry = manager.joinQueue({
        customerId: 'P001',
        customerName: 'John Doe',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      expect(entry.id).toBeDefined();
      expect(entry.queueNumber).toBe(1);
      expect(entry.status).toBe('waiting');
      expect(entry.estimatedWaitTime).toBeGreaterThanOrEqual(0);
      expect(wsClient.default.send).toHaveBeenCalledWith('queue_join', expect.any(Object));
    });

    it('should assign sequential queue numbers', () => {
      const entry1 = manager.joinQueue({
        customerId: 'P001',
        customerName: 'John Doe',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      const entry2 = manager.joinQueue({
        customerId: 'P002',
        customerName: 'Jane Smith',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      expect(entry1.queueNumber).toBe(1);
      expect(entry2.queueNumber).toBe(2);
    });

    it('should call onQueueJoined handler', () => {
      const handler = vi.fn();
      manager.initialize('center-1', { onQueueJoined: handler });

      manager.joinQueue({
        customerId: 'P001',
        customerName: 'John Doe',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Call Next Customer', () => {
    beforeEach(() => {
      // Add multiple customers
      manager.joinQueue({
        customerId: 'P001',
        customerName: 'Normal Patient',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      manager.joinQueue({
        customerId: 'P002',
        customerName: 'Urgent Patient',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'urgent'
      });

      manager.joinQueue({
        customerId: 'P003',
        customerName: 'Emergency Patient',
        centerId: 'center-1',
        appointmentType: 'Emergency',
        priority: 'emergency'
      });
    });

    it('should call next customer by priority', () => {
      const called = manager.callNext();

      expect(called).toBeDefined();
      expect(called?.customerName).toBe('Emergency Patient');
      expect(called?.status).toBe('called');
    });

    it('should return null when queue is empty', () => {
      manager.callNext();
      manager.callNext();
      manager.callNext();

      const result = manager.callNext();
      expect(result).toBeNull();
    });

    it('should set called time', () => {
      const called = manager.callNext();
      expect(called?.calledTime).toBeDefined();
    });
  });

  describe('Call Specific Customer', () => {
    it('should call specific customer', () => {
      const entry = manager.joinQueue({
        customerId: 'P001',
        customerName: 'John Doe',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      manager.callClient(entry.id, 'specialist-1');

      const entries = manager.getAllEntries();
      const calledEntry = entries.find(e => e.id === entry.id);

      expect(calledEntry?.status).toBe('called');
      expect(calledEntry?.specialistId).toBe('specialist-1');
    });
  });

  describe('Service Management', () => {
    let entryId: string;

    beforeEach(() => {
      const entry = manager.joinQueue({
        customerId: 'P001',
        customerName: 'John Doe',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });
      entryId = entry.id;
      manager.callClient(entryId);
    });

    it('should start service', () => {
      manager.startService(entryId);

      const entries = manager.getAllEntries();
      const entry = entries.find(e => e.id === entryId);

      expect(entry?.status).toBe('in-service');
      expect(entry?.serviceStartTime).toBeDefined();
    });

    it('should complete service', () => {
      manager.startService(entryId);
      manager.completeService(entryId);

      const entries = manager.getAllEntries();
      const entry = entries.find(e => e.id === entryId);

      expect(entry?.status).toBe('completed');
      expect(entry?.serviceEndTime).toBeDefined();
    });
  });

  describe('Cancel and No-Show', () => {
    let entryId: string;

    beforeEach(() => {
      const entry = manager.joinQueue({
        customerId: 'P001',
        customerName: 'John Doe',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });
      entryId = entry.id;
    });

    it('should cancel entry', () => {
      manager.cancelEntry(entryId, 'Customer request');

      const entries = manager.getAllEntries();
      const entry = entries.find(e => e.id === entryId);

      expect(entry?.status).toBe('cancelled');
      expect(entry?.notes).toBe('Customer request');
    });

    it('should mark as no-show', () => {
      manager.callClient(entryId);
      manager.markNoShow(entryId);

      const entries = manager.getAllEntries();
      const entry = entries.find(e => e.id === entryId);

      expect(entry?.status).toBe('no-show');
    });
  });

  describe('Get Entries', () => {
    beforeEach(() => {
      manager.joinQueue({
        customerId: 'P001',
        customerName: 'Patient 1',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      const entry2 = manager.joinQueue({
        customerId: 'P002',
        customerName: 'Patient 2',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'urgent'
      });

      manager.callClient(entry2.id);
    });

    it('should get all entries', () => {
      const entries = manager.getAllEntries();
      expect(entries).toHaveLength(2);
    });

    it('should get entries by status', () => {
      const waiting = manager.getEntriesByStatus('waiting');
      const called = manager.getEntriesByStatus('called');

      expect(waiting).toHaveLength(1);
      expect(called).toHaveLength(1);
    });

    it('should get entry by client ID', () => {
      const entry = manager.getEntryByClientId('P001');

      expect(entry).toBeDefined();
      expect(entry?.customerName).toBe('Patient 1');
    });
  });

  describe('Queue Position', () => {
    it('should calculate correct position', () => {
      const entry1 = manager.joinQueue({
        customerId: 'P001',
        customerName: 'Patient 1',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      const entry2 = manager.joinQueue({
        customerId: 'P002',
        customerName: 'Patient 2',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      expect(manager.getPosition(entry1.id)).toBe(1);
      expect(manager.getPosition(entry2.id)).toBe(2);
    });

    it('should return -1 for non-waiting entries', () => {
      const entry = manager.joinQueue({
        customerId: 'P001',
        customerName: 'Patient 1',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      manager.callClient(entry.id);

      expect(manager.getPosition(entry.id)).toBe(-1);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      const entry1 = manager.joinQueue({
        customerId: 'P001',
        customerName: 'Patient 1',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      const entry2 = manager.joinQueue({
        customerId: 'P002',
        customerName: 'Patient 2',
        centerId: 'center-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      manager.callClient(entry1.id);
      manager.startService(entry1.id);
      manager.completeService(entry1.id);
    });

    it('should calculate queue statistics', () => {
      const stats = manager.getStats();

      expect(stats.total).toBe(2);
      expect(stats.waiting).toBe(1);
      expect(stats.completed).toBe(1);
    });

    it('should calculate average wait time', () => {
      const stats = manager.getStats();
      expect(stats.averageWaitTime).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average service time', () => {
      const stats = manager.getStats();
      expect(stats.averageServiceTime).toBeGreaterThanOrEqual(0);
    });
  });
});
