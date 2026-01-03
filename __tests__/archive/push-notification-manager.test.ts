/**
 * Unit tests for Push Notification Manager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PushNotificationManager } from '@/lib/push-notification-manager';

describe('PushNotificationManager', () => {
  let pushManager: PushNotificationManager;

  beforeEach(() => {
    pushManager = new PushNotificationManager();
    
    // Mock service worker
    global.navigator = {
      serviceWorker: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(null),
            subscribe: vi.fn().mockResolvedValue({
              endpoint: 'https://example.com/push',
              getKey: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3]))
            })
          },
          showNotification: vi.fn(),
          active: {
            postMessage: vi.fn()
          }
        } as any)
      }
    } as any;

    // Mock Notification API
    global.Notification = {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('granted')
    } as any;

    // Mock PushManager
    (global as any).PushManager = class {};
  });

  describe('isSupported', () => {
    it('should return true when all APIs are available', () => {
      expect(pushManager.isSupported()).toBe(true);
    });
  });

  describe('getPermissionStatus', () => {
    it('should return current notification permission', () => {
      expect(pushManager.getPermissionStatus()).toBe('default');
    });
  });

  describe('requestPermission', () => {
    it('should request notification permission', async () => {
      const permission = await pushManager.requestPermission();
      expect(permission).toBe('granted');
      expect(global.Notification.requestPermission).toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('should initialize without error', async () => {
      await expect(pushManager.initialize()).resolves.toBeUndefined();
    });
  });

  describe('showWebSocketNotification', () => {
    it('should relay notification to service worker', async () => {
      await pushManager.initialize();
      
      const mockSW = await navigator.serviceWorker.ready;
      
      await pushManager.showWebSocketNotification(
        'Test Title',
        'Test Body',
        { test: true }
      );

      expect(mockSW.active?.postMessage).toHaveBeenCalledWith({
        type: 'SHOW_NOTIFICATION',
        payload: {
          title: 'Test Title',
          body: 'Test Body',
          data: { test: true }
        }
      });
    });
  });

  describe('relayWebSocketMessage', () => {
    it('should relay message to service worker', async () => {
      await pushManager.initialize();
      
      const mockSW = await navigator.serviceWorker.ready;
      const testMessage = { type: 'test', data: 'hello' };
      
      await pushManager.relayWebSocketMessage(testMessage);

      expect(mockSW.active?.postMessage).toHaveBeenCalledWith({
        type: 'WS_MESSAGE',
        payload: testMessage
      });
    });
  });
});
