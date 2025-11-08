/**
 * Demo hook: availability calendar management
 */
"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import AvailabilityManager, {
  type BookingRequest,
  type DaySchedule,
} from '@/lib/availability-manager';

export interface UseAvailabilityOptions {
  providerId?: string;
  autoSubscribe?: boolean;
}

export function useAvailability(options: UseAvailabilityOptions = {}) {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [bookingConflict, setBookingConflict] = useState<
    | {
        slotId: string;
        reason: string;
      }
    | null
  >(null);
  const [error, setError] = useState<Error | null>(null);
  const managerRef = useRef(AvailabilityManager);

  const updateSchedules = useCallback(() => {
    const allSchedules = managerRef.current.getAllSchedules();
    setSchedules(allSchedules);
  }, []);

  useEffect(() => {
    const manager = managerRef.current;

    manager.initialize({
      onSlotBooked: () => updateSchedules(),
      onSlotCancelled: () => updateSchedules(),
      onSlotUpdated: () => updateSchedules(),
      onScheduleUpdated: () => updateSchedules(),
      onBookingConflict: (conflict) => {
        setBookingConflict(conflict);
        console.warn('[useAvailability] Booking conflict:', conflict);
      },
      onError: (err) => {
        setError(err);
        console.error('[useAvailability] Error:', err);
      },
    });

    if (options.providerId && options.autoSubscribe !== false) {
      manager.subscribeToProvider(options.providerId);
    }

    return () => {
      if (options.providerId) {
        manager.unsubscribeFromProvider(options.providerId);
      }
    };
  }, [options.providerId, options.autoSubscribe, updateSchedules]);

  const generateSchedule = useCallback(
    (
      date: string,
      providerId: string,
      workingHours: { start: string; end: string },
      slotDuration?: number,
      breakTimes?: Array<{ start: string; end: string }>,
    ) => {
      try {
        setError(null);
        const schedule = managerRef.current.generateDaySchedule(
          date,
          providerId,
          workingHours,
          slotDuration,
          breakTimes,
        );
        updateSchedules();
        return schedule;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to generate schedule');
        setError(error);
        return null;
      }
    },
    [updateSchedules],
  );

  const getSchedule = useCallback((date: string, providerId: string) => {
    return managerRef.current.getSchedule(date, providerId);
  }, []);

  const getAvailableSlots = useCallback((date: string, providerId: string) => {
    return managerRef.current.getAvailableSlots(date, providerId);
  }, []);

  const bookSlot = useCallback(
    async (request: BookingRequest) => {
      try {
        setError(null);
        setBookingConflict(null);
        const bookedSlot = await managerRef.current.bookSlot(request);
        updateSchedules();
        return bookedSlot;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to book slot');
        setError(error);
        return null;
      }
    },
    [updateSchedules],
  );

  const createTentativeBooking = useCallback(
    (slotId: string, patientId: string) => {
      try {
        setError(null);
        const tentativeSlot = managerRef.current.createTentativeBooking(
          slotId,
          patientId,
        );
        updateSchedules();
        return tentativeSlot;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to create tentative booking');
        setError(error);
        return null;
      }
    },
    [updateSchedules],
  );

  const cancelBooking = useCallback(
    (slotId: string) => {
      try {
        setError(null);
        const cancelledSlot = managerRef.current.cancelBooking(slotId);
        updateSchedules();
        return cancelledSlot;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to cancel booking');
        setError(error);
        return null;
      }
    },
    [updateSchedules],
  );

  const blockSlot = useCallback(
    (slotId: string, reason?: string) => {
      try {
        setError(null);
        const blockedSlot = managerRef.current.blockSlot(slotId, reason);
        updateSchedules();
        return blockedSlot;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to block slot');
        setError(error);
        return null;
      }
    },
    [updateSchedules],
  );

  const unblockSlot = useCallback(
    (slotId: string) => {
      try {
        setError(null);
        const unblockedSlot = managerRef.current.unblockSlot(slotId);
        updateSchedules();
        return unblockedSlot;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to unblock slot');
        setError(error);
        return null;
      }
    },
    [updateSchedules],
  );

  const getBookingStats = useCallback((date: string, providerId: string) => {
    return managerRef.current.getBookingStats(date, providerId);
  }, []);

  const subscribeToProvider = useCallback((providerId: string) => {
    managerRef.current.subscribeToProvider(providerId);
  }, []);

  const unsubscribeFromProvider = useCallback((providerId: string) => {
    managerRef.current.unsubscribeFromProvider(providerId);
  }, []);

  const formatTime = useCallback((timestamp: number) => {
    return managerRef.current.formatTime(timestamp);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return managerRef.current.formatDate(dateString);
  }, []);

  return {
    schedules,
    selectedDate,
    bookingConflict,
    error,
    setSelectedDate,
    generateSchedule,
    getSchedule,
    getAvailableSlots,
    bookSlot,
    createTentativeBooking,
    cancelBooking,
    blockSlot,
    unblockSlot,
    getBookingStats,
    subscribeToProvider,
    unsubscribeFromProvider,
    formatTime,
    formatDate,
  };
}
