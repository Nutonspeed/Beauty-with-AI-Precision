/**
 * Availability Calendar System Tests
 * Test suite for real-time appointment scheduling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAvailability } from '@/hooks/demo/useAvailability';

// Mock WebSocket client
vi.mock('@/lib/websocket-client', () => ({
  default: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    send: vi.fn(),
    on: vi.fn()
  },
  WebSocketClient: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    send: vi.fn(),
    on: vi.fn()
  }
}));

describe('Availability Calendar System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Schedule Generation', () => {
    it('should generate daily schedule with time slots', async () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      await act(async () => {
        result.current.generateSchedule(
          '2025-01-15',
          'provider-1',
          { start: '09:00', end: '11:00' },
          30
        );
      });

      const schedule = result.current.getSchedule('2025-01-15', 'provider-1');
      expect(schedule).toBeTruthy();
      expect(schedule?.slots.length).toBeGreaterThan(0);
      expect(schedule?.date).toBe('2025-01-15');
    });

    it('should handle break times in schedule', async () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      await act(async () => {
        result.current.generateSchedule(
          '2025-01-15',
          'provider-1',
          { start: '09:00', end: '14:00' },
          60,
          [{ start: '12:00', end: '13:00' }]
        );
      });

      const schedule = result.current.getSchedule('2025-01-15', 'provider-1');
      expect(schedule).toBeTruthy();
      expect(schedule?.breakTimes).toBeDefined();
    });

    it('should get available slots', async () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      await act(async () => {
        result.current.generateSchedule(
          '2025-01-15',
          'provider-1',
          { start: '09:00', end: '10:00' },
          30
        );
      });

      const availableSlots = result.current.getAvailableSlots('2025-01-15', 'provider-1');
      expect(availableSlots.length).toBeGreaterThan(0);
      expect(availableSlots[0].status).toBe('available');
    });
  });

  describe('Slot Booking', () => {
    it('should book an available slot', async () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      await act(async () => {
        result.current.generateSchedule(
          '2025-01-15',
          'provider-1',
          { start: '09:00', end: '10:00' },
          30
        );
      });

      const availableSlots = result.current.getAvailableSlots('2025-01-15', 'provider-1');
      const slotToBook = availableSlots[0];

      const booking = await act(async () => {
        return await result.current.bookSlot({
          slotId: slotToBook.id,
          patientId: 'patient-1',
          patientName: 'John Doe',
          serviceType: 'consultation'
        });
      });

      expect(booking).toBeTruthy();
      expect(booking?.status).toBe('booked');
    });

    it('should prevent booking on non-available slots', async () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      await act(async () => {
        result.current.generateSchedule(
          '2025-01-15',
          'provider-1',
          { start: '09:00', end: '10:00' },
          30
        );
      });

      const slots = result.current.getAvailableSlots('2025-01-15', 'provider-1');
      
      // Book first time
      await act(async () => {
        await result.current.bookSlot({
          slotId: slots[0].id,
          patientId: 'patient-1',
          patientName: 'John Doe',
          serviceType: 'consultation'
        });
      });

      // Try to book again
      const secondBooking = await act(async () => {
        return await result.current.bookSlot({
          slotId: slots[0].id,
          patientId: 'patient-2',
          patientName: 'Jane Doe',
          serviceType: 'checkup'
        });
      });

      expect(secondBooking).toBeNull();
    });

    it('should create tentative booking', async () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      await act(async () => {
        result.current.generateSchedule(
          '2025-01-15',
          'provider-1',
          { start: '09:00', end: '10:00' },
          30
        );
      });

      const slots = result.current.getAvailableSlots('2025-01-15', 'provider-1');
      
      await act(async () => {
        result.current.createTentativeBooking(slots[0].id, 'patient-1');
      });

      const schedule = result.current.getSchedule('2025-01-15', 'provider-1');
      const tentativeSlot = schedule?.slots.find(s => s.id === slots[0].id);
      expect(tentativeSlot?.status).toBe('tentative');

      vi.useRealTimers();
    });
  });

  describe('Booking Management', () => {
    it('should cancel booking and release slot', async () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      await act(async () => {
        result.current.generateSchedule(
          '2025-01-15',
          'provider-1',
          { start: '09:00', end: '10:00' },
          30
        );
      });

      const slots = result.current.getAvailableSlots('2025-01-15', 'provider-1');
      
      // Book slot
      await act(async () => {
        await result.current.bookSlot({
          slotId: slots[0].id,
          patientId: 'patient-1',
          patientName: 'John Doe',
          serviceType: 'consultation'
        });
      });

      // Cancel booking
      await act(async () => {
        result.current.cancelBooking(slots[0].id);
      });

      const schedule = result.current.getSchedule('2025-01-15', 'provider-1');
      const releasedSlot = schedule?.slots.find(s => s.id === slots[0].id);
      expect(releasedSlot?.status).toBe('available');
    });

    it('should block and unblock slots', async () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      await act(async () => {
        result.current.generateSchedule(
          '2025-01-15',
          'provider-1',
          { start: '09:00', end: '10:00' },
          30
        );
      });

      const slots = result.current.getAvailableSlots('2025-01-15', 'provider-1');
      
      // Block slot
      await act(async () => {
        result.current.blockSlot(slots[0].id, 'Maintenance');
      });

      let schedule = result.current.getSchedule('2025-01-15', 'provider-1');
      let blockedSlot = schedule?.slots.find(s => s.id === slots[0].id);
      expect(blockedSlot?.status).toBe('blocked');

      // Unblock slot
      await act(async () => {
        result.current.unblockSlot(slots[0].id);
      });

      schedule = result.current.getSchedule('2025-01-15', 'provider-1');
      const unblockedSlot = schedule?.slots.find(s => s.id === slots[0].id);
      expect(unblockedSlot?.status).toBe('available');
    });
  });

  describe('Booking Statistics', () => {
    it('should calculate booking statistics correctly', async () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      await act(async () => {
        result.current.generateSchedule(
          '2025-01-15',
          'provider-1',
          { start: '09:00', end: '11:00' },
          30
        );
      });

      const slots = result.current.getAvailableSlots('2025-01-15', 'provider-1');
      
      // Book 2 slots
      await act(async () => {
        await result.current.bookSlot({
          slotId: slots[0].id,
          patientId: 'patient-1',
          patientName: 'John Doe',
          serviceType: 'consultation'
        });
        await result.current.bookSlot({
          slotId: slots[1].id,
          patientId: 'patient-2',
          patientName: 'Jane Doe',
          serviceType: 'checkup'
        });
      });

      const stats = result.current.getBookingStats('2025-01-15', 'provider-1');
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.booked).toBe(2);
      expect(stats.utilizationRate).toBeGreaterThan(0);
    });

    it('should include blocked slots in statistics', async () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      await act(async () => {
        result.current.generateSchedule(
          '2025-01-15',
          'provider-1',
          { start: '09:00', end: '10:00' },
          30
        );
      });

      const slots = result.current.getAvailableSlots('2025-01-15', 'provider-1');
      
      // Block one slot
      await act(async () => {
        result.current.blockSlot(slots[0].id, 'Break');
      });

      const stats = result.current.getBookingStats('2025-01-15', 'provider-1');
      expect(stats.blocked).toBe(1);
    });
  });

  describe('Multi-Provider Support', () => {
    it('should handle multiple providers independently', async () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      await act(async () => {
        result.current.generateSchedule(
          '2025-01-15',
          'provider-1',
          { start: '09:00', end: '10:00' },
          30
        );
        result.current.generateSchedule(
          '2025-01-15',
          'provider-2',
          { start: '10:00', end: '11:00' },
          30
        );
      });

      const schedule1 = result.current.getSchedule('2025-01-15', 'provider-1');
      const schedule2 = result.current.getSchedule('2025-01-15', 'provider-2');

      expect(schedule1?.providerId).toBe('provider-1');
      expect(schedule2?.providerId).toBe('provider-2');
      expect(schedule1?.slots).not.toEqual(schedule2?.slots);
    });
  });

  describe('Time Utilities', () => {
    it('should format time correctly', () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      const formatted = result.current.formatTime(Date.now());
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should format date correctly', () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      const formatted = result.current.formatDate('2025-01-15');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      const { result } = renderHook(() => 
        useAvailability({ providerId: 'provider-1', autoSubscribe: true })
      );

      const booking = await act(async () => {
        return await result.current.bookSlot({
          slotId: 'invalid-slot-id',
          patientId: 'patient-1',
          patientName: 'John Doe',
          serviceType: 'consultation'
        });
      });

      expect(booking).toBeNull();
    });
  });
});
