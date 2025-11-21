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
    manager.initialize('clinic-1', {});
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('Join Queue', () => {
    it('should add patient to queue', async () => {
      const wsClient = await import('@/lib/websocket-client');
      const entry = manager.joinQueue({
        patientId: 'P001',
        patientName: 'John Doe',
        clinicId: 'clinic-1',
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
        patientId: 'P001',
        patientName: 'John Doe',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      const entry2 = manager.joinQueue({
        patientId: 'P002',
        patientName: 'Jane Smith',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      expect(entry1.queueNumber).toBe(1);
      expect(entry2.queueNumber).toBe(2);
    });

    it('should call onQueueJoined handler', () => {
      const handler = vi.fn();
      manager.initialize('clinic-1', { onQueueJoined: handler });

      manager.joinQueue({
        patientId: 'P001',
        patientName: 'John Doe',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Call Next Patient', () => {
    beforeEach(() => {
      // Add multiple patients
      manager.joinQueue({
        patientId: 'P001',
        patientName: 'Normal Patient',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      manager.joinQueue({
        patientId: 'P002',
        patientName: 'Urgent Patient',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'urgent'
      });

      manager.joinQueue({
        patientId: 'P003',
        patientName: 'Emergency Patient',
        clinicId: 'clinic-1',
        appointmentType: 'Emergency',
        priority: 'emergency'
      });
    });

    it('should call next patient by priority', () => {
      const called = manager.callNext();

      expect(called).toBeDefined();
      expect(called?.patientName).toBe('Emergency Patient');
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

  describe('Call Specific Patient', () => {
    it('should call specific patient', () => {
      const entry = manager.joinQueue({
        patientId: 'P001',
        patientName: 'John Doe',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      manager.callPatient(entry.id, 'doctor-1');

      const entries = manager.getAllEntries();
      const calledEntry = entries.find(e => e.id === entry.id);

      expect(calledEntry?.status).toBe('called');
      expect(calledEntry?.doctorId).toBe('doctor-1');
    });
  });

  describe('Service Management', () => {
    let entryId: string;

    beforeEach(() => {
      const entry = manager.joinQueue({
        patientId: 'P001',
        patientName: 'John Doe',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });
      entryId = entry.id;
      manager.callPatient(entryId);
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
        patientId: 'P001',
        patientName: 'John Doe',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });
      entryId = entry.id;
    });

    it('should cancel entry', () => {
      manager.cancelEntry(entryId, 'Patient request');

      const entries = manager.getAllEntries();
      const entry = entries.find(e => e.id === entryId);

      expect(entry?.status).toBe('cancelled');
      expect(entry?.notes).toBe('Patient request');
    });

    it('should mark as no-show', () => {
      manager.callPatient(entryId);
      manager.markNoShow(entryId);

      const entries = manager.getAllEntries();
      const entry = entries.find(e => e.id === entryId);

      expect(entry?.status).toBe('no-show');
    });
  });

  describe('Get Entries', () => {
    beforeEach(() => {
      manager.joinQueue({
        patientId: 'P001',
        patientName: 'Patient 1',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      const entry2 = manager.joinQueue({
        patientId: 'P002',
        patientName: 'Patient 2',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'urgent'
      });

      manager.callPatient(entry2.id);
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

    it('should get entry by patient ID', () => {
      const entry = manager.getEntryByPatientId('P001');

      expect(entry).toBeDefined();
      expect(entry?.patientName).toBe('Patient 1');
    });
  });

  describe('Queue Position', () => {
    it('should calculate correct position', () => {
      const entry1 = manager.joinQueue({
        patientId: 'P001',
        patientName: 'Patient 1',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      const entry2 = manager.joinQueue({
        patientId: 'P002',
        patientName: 'Patient 2',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      expect(manager.getPosition(entry1.id)).toBe(1);
      expect(manager.getPosition(entry2.id)).toBe(2);
    });

    it('should return -1 for non-waiting entries', () => {
      const entry = manager.joinQueue({
        patientId: 'P001',
        patientName: 'Patient 1',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      manager.callPatient(entry.id);

      expect(manager.getPosition(entry.id)).toBe(-1);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      const entry1 = manager.joinQueue({
        patientId: 'P001',
        patientName: 'Patient 1',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      const entry2 = manager.joinQueue({
        patientId: 'P002',
        patientName: 'Patient 2',
        clinicId: 'clinic-1',
        appointmentType: 'General',
        priority: 'normal'
      });

      manager.callPatient(entry1.id);
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
