/**
 * useBooking Hook - React hook for booking management
 */

'use client';

import { useState, useCallback } from 'react';
import { BookingManager, Booking, BookingInput, TimeSlot, BookingStats } from '@/lib/booking/booking-manager';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  availableSlots: TimeSlot[];
  stats: BookingStats | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  lastSyncAt: number | null;
}

const createInitialState = (): BookingState => ({
  bookings: [],
  currentBooking: null,
  availableSlots: [],
  stats: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  lastSyncAt: null,
});

export function useBooking() {
  const [bookingManager] = useState(() => new BookingManager());
  const [state, setState] = useState<BookingState>(createInitialState());

  const handleError = useCallback((err: unknown, defaultMessage: string) => {
    const message = err instanceof Error ? err.message : defaultMessage;
    setState(prev => ({ ...prev, error: message, isProcessing: false, isLoading: false }));
    console.error(`[Booking System] Error: ${message}`, err);
    throw err;
  }, []);

  const createBooking = async (input: BookingInput): Promise<Booking | null> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    const startTime = Date.now();
    
    try {
      const booking = await bookingManager.createBooking(input);
      
      setState(prev => ({
        ...prev,
        currentBooking: booking,
        isProcessing: false,
        lastSyncAt: Date.now()
      }));

      // Auto-refresh patient history if relevant
      if (input.patientId) {
        await loadPatientBookings(input.patientId);
      }

      console.log(`[Booking] Cycle created in ${Date.now() - startTime}ms`);
      return booking;
    } catch (err) {
      return handleError(err, 'Booking acquisition failed');
    }
  };

  const updateBooking = async (bookingId: string, updates: Partial<Booking>): Promise<Booking | null> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const booking = await bookingManager.updateBooking(bookingId, updates);
      
      setState(prev => ({
        ...prev,
        currentBooking: booking,
        bookings: prev.bookings.map(b => b.id === bookingId ? booking : b),
        isProcessing: false
      }));

      return booking;
    } catch (err) {
      return handleError(err, 'Operational update failed');
    }
  };

  const cancelBooking = async (bookingId: string, reason?: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      await bookingManager.cancelBooking(bookingId, reason);
      
      setState(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
        ),
        isProcessing: false
      }));

      return true;
    } catch (err) {
      handleError(err, 'Resource cancellation failed');
      return false;
    }
  };

  const loadPatientBookings = async (patientId: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await bookingManager.getPatientBookings(patientId);
      setState(prev => ({ ...prev, bookings: data, isLoading: false, lastSyncAt: Date.now() }));
    } catch (err) {
      handleError(err, 'Data retrieval failed');
    }
  };

  const loadAvailableSlots = async (doctorId: string, date: Date, duration: number = 60): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const slots = await bookingManager.getAvailableSlots(doctorId, date, duration);
      setState(prev => ({ ...prev, availableSlots: slots, isLoading: false }));
    } catch (err) {
      handleError(err, 'Availability lookup failed');
    }
  };

  const processPayment = async (
    bookingId: string, 
    paymentMethod: 'promptpay' | 'credit_card' | 'cash'
  ): Promise<{ success: boolean; transactionId?: string }> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const result = await bookingManager.processPayment(bookingId, paymentMethod);
      
      if (result.success) {
        await updateBooking(bookingId, {
          paymentStatus: 'paid',
          status: 'confirmed',
        });
      }

      setState(prev => ({ ...prev, isProcessing: false }));
      return result;
    } catch (err) {
      handleError(err, 'Transaction settlement failed');
      return { success: false };
    }
  };

  const clearError = useCallback(() => setState(prev => ({ ...prev, error: null })), []);

  return {
    ...state,
    createBooking,
    updateBooking,
    cancelBooking,
    loadPatientBookings,
    loadAvailableSlots,
    processPayment,
    clearError,
    setCurrentBooking: (booking: Booking | null) => setState(prev => ({ ...prev, currentBooking: booking })),
  };
}
