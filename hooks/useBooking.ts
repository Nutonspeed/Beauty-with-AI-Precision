/**
 * useBooking Hook - React hook for booking management
 */

'use client';

import { useState } from 'react';
import { BookingManager, Booking, BookingInput, TimeSlot, BookingStats } from '@/lib/booking/booking-manager';

export function useBooking() {
  const [bookingManager] = useState(() => new BookingManager());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== Create Booking =====
  const createBooking = async (input: BookingInput): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const booking = await bookingManager.createBooking(input);
      setCurrentBooking(booking);
      
      // Refresh bookings list
      if (input.patientId) {
        await loadPatientBookings(input.patientId);
      }

      return booking;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create booking';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Update Booking =====
  const updateBooking = async (
    bookingId: string,
    updates: Partial<Booking>
  ): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const booking = await bookingManager.updateBooking(bookingId, updates);
      setCurrentBooking(booking);
      
      // Update in list
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? booking : b))
      );

      return booking;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update booking';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Cancel Booking =====
  const cancelBooking = async (bookingId: string, reason?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await bookingManager.cancelBooking(bookingId, reason);
      
      // Update in list
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
        )
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel booking';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Load Patient Bookings =====
  const loadPatientBookings = async (patientId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await bookingManager.getPatientBookings(patientId);
      setBookings(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load bookings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Load Doctor Bookings =====
  const loadDoctorBookings = async (doctorId: string, date?: Date): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await bookingManager.getDoctorBookings(doctorId, date);
      setBookings(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load doctor bookings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Load Available Slots =====
  const loadAvailableSlots = async (
    doctorId: string,
    date: Date,
    duration: number = 60
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const slots = await bookingManager.getAvailableSlots(doctorId, date, duration);
      setAvailableSlots(slots);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load available slots';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Process Payment =====
  const processPayment = async (
    bookingId: string,
    paymentMethod: 'promptpay' | 'credit_card' | 'cash'
  ): Promise<{ success: boolean; transactionId?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await bookingManager.processPayment(bookingId, paymentMethod);
      
      if (result.success) {
        // Update booking status
        await updateBooking(bookingId, {
          paymentStatus: 'paid',
          status: 'confirmed',
        });
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process payment';
      setError(message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Load Statistics =====
  const loadStats = async (startDate?: Date, endDate?: Date): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await bookingManager.getBookingStats(startDate, endDate);
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Send Reminders =====
  const sendReminders = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await bookingManager.sendReminders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reminders';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Clear Error =====
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    bookings,
    currentBooking,
    availableSlots,
    stats,
    isLoading,
    error,

    // Actions
    createBooking,
    updateBooking,
    cancelBooking,
    loadPatientBookings,
    loadDoctorBookings,
    loadAvailableSlots,
    processPayment,
    loadStats,
    sendReminders,
    clearError,
    setCurrentBooking,
  };
}
