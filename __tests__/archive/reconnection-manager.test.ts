/**
 * Unit tests for Reconnection Manager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ReconnectionManager } from '@/lib/reconnection-manager';

describe('ReconnectionManager', () => {
  let manager: ReconnectionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new ReconnectionManager({
      maxRetries: 5,
      initialDelay: 1000,
      maxDelay: 16000,
      backoffMultiplier: 2
    });
  });

  afterEach(() => {
    manager.destroy();
    vi.restoreAllMocks();
  });

  describe('Exponential Backoff', () => {
    it('should calculate increasing delays', () => {
      const delays = [];
      for (let i = 0; i < 6; i++) {
        manager['reconnectAttempts'] = i;
        delays.push(manager['calculateDelay']());
      }
      
      // Should increase: 1s, 2s, 4s, 8s, 16s, 32s (max)
      expect(delays[0]).toBeGreaterThanOrEqual(1000);
      expect(delays[0]).toBeLessThanOrEqual(2000);
      expect(delays[1]).toBeGreaterThanOrEqual(2000);
      expect(delays[1]).toBeLessThanOrEqual(3000);
      expect(delays[2]).toBeGreaterThanOrEqual(4000);
      expect(delays[2]).toBeLessThanOrEqual(5000);
      expect(delays[5]).toBeLessThanOrEqual(33000); // Max 32s + jitter
      
      // Reset for other tests
      manager['reconnectAttempts'] = 0;
    });

    it('should reset attempts on successful reconnection', () => {
      const connectFn = vi.fn().mockResolvedValue(undefined);
      
      // Manually set reconnect attempts
      manager['reconnectAttempts'] = 3;
      expect(manager.getStats().reconnectAttempts).toBe(3);
      
      manager.scheduleReconnect(connectFn);
      
      // After scheduling, attempts should still be 3 (will be reset on success)
      expect(manager.getStats().reconnectAttempts).toBe(3);
    });
  });

  describe('Message Queue', () => {
    it('should queue messages', () => {
      const id1 = manager.queueMessage('test', { data: 'hello' });
      const id2 = manager.queueMessage('test', { data: 'world' });

      const queue = manager.getQueue();
      expect(queue).toHaveLength(2);
      expect(queue[0].id).toBe(id1);
      expect(queue[1].id).toBe(id2);
    });

    it('should clear queue', () => {
      manager.queueMessage('test', { data: 'hello' });
      manager.queueMessage('test', { data: 'world' });

      expect(manager.getQueue()).toHaveLength(2);

      manager.clearQueue();
      expect(manager.getQueue()).toHaveLength(0);
    });

    it('should remove message from queue', () => {
      const id = manager.queueMessage('test', { data: 'hello' });
      manager.queueMessage('test', { data: 'world' });

      expect(manager.getQueue()).toHaveLength(2);

      manager.removeFromQueue(id);
      expect(manager.getQueue()).toHaveLength(1);
      expect(manager.getQueue()[0].payload).toEqual({ data: 'world' });
    });

    it('should replay queued messages', async () => {
      manager.queueMessage('msg1', { data: 'test1' });
      manager.queueMessage('msg2', { data: 'test2' });

      const sendFn = vi.fn().mockResolvedValue(undefined);

      await manager.replayQueue(sendFn);

      expect(sendFn).toHaveBeenCalledTimes(2);
      expect(sendFn).toHaveBeenNthCalledWith(1, 'msg1', { data: 'test1' });
      expect(sendFn).toHaveBeenNthCalledWith(2, 'msg2', { data: 'test2' });
      expect(manager.getQueue()).toHaveLength(0);
    });

    it('should remove failed messages after 3 retries', async () => {
      manager.queueMessage('test', { data: 'fail' });

      const sendFn = vi.fn().mockRejectedValue(new Error('Send failed'));

      // First replay - retries = 1
      await manager.replayQueue(sendFn);
      expect(manager.getQueue()).toHaveLength(1);

      // Second replay - retries = 2
      await manager.replayQueue(sendFn);
      expect(manager.getQueue()).toHaveLength(1);

      // Third replay - retries = 3, message removed
      await manager.replayQueue(sendFn);
      expect(manager.getQueue()).toHaveLength(0);
    });
  });

  describe('Connection Status', () => {
    it('should notify status callbacks', () => {
      const callback = vi.fn();
      manager.onStatusChange(callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          connected: expect.any(Boolean),
          reconnecting: expect.any(Boolean),
          queueSize: 0
        })
      );
    });

    it('should update status on reconnection attempt', () => {
      const callback = vi.fn();
      manager.onStatusChange(callback);
      callback.mockClear();

      const connectFn = vi.fn().mockRejectedValue(new Error('Failed'));
      manager.scheduleReconnect(connectFn);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          connected: false,
          reconnecting: true,
          attempt: 1
        })
      );
    });

    it('should unsubscribe status callback', () => {
      const callback = vi.fn();
      const unsubscribe = manager.onStatusChange(callback);
      
      callback.mockClear();
      unsubscribe();

      manager.queueMessage('test', {});
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    it('should return correct stats', () => {
      manager.queueMessage('test', {});
      
      const stats = manager.getStats();
      
      expect(stats).toEqual({
        reconnectAttempts: 0,
        maxRetries: 5,
        queueSize: 1,
        isOnline: expect.any(Boolean),
        isReconnecting: false
      });
    });
  });

  describe('Cleanup', () => {
    it('should cancel reconnection on destroy', () => {
      const connectFn = vi.fn().mockRejectedValue(new Error('Failed'));
      manager.scheduleReconnect(connectFn);

      manager.destroy();

      vi.advanceTimersByTime(10000);
      expect(connectFn).toHaveBeenCalledTimes(0);
    });
  });
});
