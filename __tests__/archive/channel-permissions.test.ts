/**
 * Unit tests for channel permissions
 */

import { describe, it, expect } from 'vitest';
import { canSubscribeToChannel, filterAllowedChannels } from '@/lib/realtime/channel-permissions';

describe('Channel Permissions', () => {
  describe('canSubscribeToChannel', () => {
    it('should allow admin to subscribe to any channel', () => {
      const result = canSubscribeToChannel(
        'system:maintenance',
        'admin',
        'user-123',
        'center-456'
      );
      expect(result.allowed).toBe(true);
    });

    it('should allow center_owner to subscribe to system:announcements', () => {
      const result = canSubscribeToChannel(
        'system:announcements',
        'center_owner',
        'user-123'
      );
      expect(result.allowed).toBe(true);
    });

    it('should deny client from subscribing to system:maintenance', () => {
      const result = canSubscribeToChannel(
        'system:maintenance',
        'client',
        'user-123'
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not allowed');
    });

    it('should allow user to subscribe to their own notification channel', () => {
      const result = canSubscribeToChannel(
        'user:user-123:notifications',
        'client',
        'user-123'
      );
      expect(result.allowed).toBe(true);
    });

    it('should deny user from subscribing to another user notification channel', () => {
      const result = canSubscribeToChannel(
        'user:user-456:notifications',
        'client',
        'user-123'
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('your own');
    });

    it('should allow center staff to subscribe to their center queue', () => {
      const result = canSubscribeToChannel(
        'center:center-123:queue',
        'doctor',
        'user-456',
        'center-123'
      );
      expect(result.allowed).toBe(true);
    });

    it('should deny center staff from subscribing to another center queue', () => {
      const result = canSubscribeToChannel(
        'center:center-456:queue',
        'doctor',
        'user-123',
        'center-123'
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('clinic');
    });

    it('should deny client from subscribing to center queue', () => {
      const result = canSubscribeToChannel(
        'center:center-123:queue',
        'client',
        'user-123',
        'center-123'
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not allowed');
    });

    it('should deny subscription to unknown channel pattern', () => {
      const result = canSubscribeToChannel(
        'unknown:channel',
        'client',
        'user-123'
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('No permission rule');
    });
  });

  describe('filterAllowedChannels', () => {
    it('should filter channels correctly for client', () => {
      const channels = [
        'system:announcements',
        'system:maintenance',
        'user:user-123:notifications',
        'user:user-456:notifications',
        'center:center-123:queue'
      ];

      const result = filterAllowedChannels(channels, 'client', 'user-123');

      expect(result.allowed).toHaveLength(2);
      expect(result.allowed).toContain('system:announcements');
      expect(result.allowed).toContain('user:user-123:notifications');
      expect(result.denied).toHaveLength(3);
    });

    it('should filter channels correctly for doctor', () => {
      const channels = [
        'system:announcements',
        'system:maintenance',
        'center:center-123:queue',
        'center:center-456:queue',
        'user:user-123:notifications'
      ];

      const result = filterAllowedChannels(
        channels,
        'doctor',
        'user-123',
        'center-123'
      );

      expect(result.allowed).toHaveLength(4);
      expect(result.allowed).toContain('system:announcements');
      expect(result.allowed).toContain('system:maintenance');
      expect(result.allowed).toContain('center:center-123:queue');
      expect(result.allowed).toContain('user:user-123:notifications');
      expect(result.denied).toHaveLength(1);
      expect(result.denied[0].channel).toBe('center:center-456:queue');
    });

    it('should allow all channels for admin', () => {
      const channels = [
        'system:announcements',
        'system:maintenance',
        'center:center-123:queue',
        'user:user-456:notifications',
        'analytics:realtime'
      ];

      const result = filterAllowedChannels(
        channels,
        'admin',
        'user-123',
        'center-123'
      );

      expect(result.allowed).toHaveLength(5);
      expect(result.denied).toHaveLength(0);
    });
  });
});
