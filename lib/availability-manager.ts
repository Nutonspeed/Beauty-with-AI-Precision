/**
 * Availability Manager
 * Real-time calendar and booking management
 */

import WebSocketClient from './websocket-client';

export interface TimeSlot {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // minutes
  status: 'available' | 'booked' | 'blocked' | 'tentative';
  providerId: string;
  patientId?: string;
  patientName?: string;
  serviceType?: string;
  notes?: string;
  bookedAt?: number;
  bookedBy?: string;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  providerId: string;
  slots: TimeSlot[];
  workingHours: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  breakTimes?: Array<{
    start: string; // HH:mm
    end: string; // HH:mm
  }>;
}

export interface BookingRequest {
  slotId: string;
  patientId: string;
  patientName: string;
  serviceType: string;
  notes?: string;
}

export interface AvailabilityEventHandlers {
  onSlotBooked?: (slot: TimeSlot) => void;
  onSlotCancelled?: (slot: TimeSlot) => void;
  onSlotUpdated?: (slot: TimeSlot) => void;
  onScheduleUpdated?: (schedule: DaySchedule) => void;
  onBookingConflict?: (conflict: { slotId: string; reason: string }) => void;
  onError?: (error: Error) => void;
}

export class AvailabilityManager {
  private static instance: AvailabilityManager;
  private wsClient: typeof WebSocketClient;
  private schedules: Map<string, DaySchedule> = new Map(); // key: date-providerId
  private handlers: AvailabilityEventHandlers = {};
  private subscribedProviders: Set<string> = new Set();
  private unsubscribeCallbacks: Map<string, () => void> = new Map();

  // Configuration
  private readonly DEFAULT_SLOT_DURATION = 30; // minutes
  private readonly BOOKING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes for tentative bookings

  private constructor() {
    this.wsClient = WebSocketClient;
    console.log('[AvailabilityManager] Initialized');
  }

  public static getInstance(): AvailabilityManager {
    if (!AvailabilityManager.instance) {
      AvailabilityManager.instance = new AvailabilityManager();
    }
    return AvailabilityManager.instance;
  }

  /**
   * Initialize availability manager
   */
  public initialize(handlers?: AvailabilityEventHandlers): void {
    this.handlers = handlers || {};

    // Set up WebSocket listener
    this.wsClient.on('message', this.handleAvailabilityMessage.bind(this));

    console.log('[AvailabilityManager] Initialized with handlers');
  }

  /**
   * Subscribe to provider's availability updates
   */
  public subscribeToProvider(providerId: string): void {
    if (this.subscribedProviders.has(providerId)) return;

    this.subscribedProviders.add(providerId);

    console.log('[AvailabilityManager] Subscribed to provider:', providerId);
  }

  /**
   * Unsubscribe from provider's availability updates
   */
  public unsubscribeFromProvider(providerId: string): void {
    if (!this.subscribedProviders.has(providerId)) return;

    this.subscribedProviders.delete(providerId);

    console.log('[AvailabilityManager] Unsubscribed from provider:', providerId);
  }

  /**
   * Generate time slots for a day
   */
  public generateDaySchedule(
    date: string,
    providerId: string,
    workingHours: { start: string; end: string },
    slotDuration: number = this.DEFAULT_SLOT_DURATION,
    breakTimes?: Array<{ start: string; end: string }>
  ): DaySchedule {
    const slots: TimeSlot[] = [];
    const dateObj = new Date(date);

    // Parse working hours
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);

    let currentTime = new Date(dateObj);
    currentTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(dateObj);
    endTime.setHours(endHour, endMin, 0, 0);

    // Generate slots
    while (currentTime < endTime) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

      // Check if slot overlaps with break time
      const isBreakTime = breakTimes?.some((breakTime) => {
        const [breakStartHour, breakStartMin] = breakTime.start.split(':').map(Number);
        const [breakEndHour, breakEndMin] = breakTime.end.split(':').map(Number);

        const breakStart = new Date(dateObj);
        breakStart.setHours(breakStartHour, breakStartMin, 0, 0);

        const breakEnd = new Date(dateObj);
        breakEnd.setHours(breakEndHour, breakEndMin, 0, 0);

        return slotStart < breakEnd && slotEnd > breakStart;
      });

      if (!isBreakTime) {
        const slot: TimeSlot = {
          id: `slot-${providerId}-${slotStart.getTime()}`,
          startTime: slotStart.getTime(),
          endTime: slotEnd.getTime(),
          duration: slotDuration,
          status: 'available',
          providerId
        };

        slots.push(slot);
      }

      currentTime = slotEnd;
    }

    const schedule: DaySchedule = {
      date,
      providerId,
      slots,
      workingHours,
      breakTimes
    };

    // Store schedule
    const key = `${date}-${providerId}`;
    this.schedules.set(key, schedule);

    return schedule;
  }

  /**
   * Get schedule for a specific day and provider
   */
  public getSchedule(date: string, providerId: string): DaySchedule | null {
    const key = `${date}-${providerId}`;
    return this.schedules.get(key) || null;
  }

  /**
   * Get all schedules
   */
  public getAllSchedules(): DaySchedule[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Get available slots for a date and provider
   */
  public getAvailableSlots(date: string, providerId: string): TimeSlot[] {
    const schedule = this.getSchedule(date, providerId);
    if (!schedule) return [];

    return schedule.slots.filter((slot) => slot.status === 'available');
  }

  /**
   * Book a time slot
   */
  public async bookSlot(request: BookingRequest): Promise<TimeSlot | null> {
    const slot = this.findSlotById(request.slotId);
    if (!slot) {
      const error = new Error('Slot not found');
      if (this.handlers.onError) {
        this.handlers.onError(error);
      }
      return null;
    }

    // Check if slot is available
    if (slot.status !== 'available') {
      if (this.handlers.onBookingConflict) {
        this.handlers.onBookingConflict({
          slotId: request.slotId,
          reason: `Slot is already ${slot.status}`
        });
      }
      return null;
    }

    // Update slot
    const bookedSlot: TimeSlot = {
      ...slot,
      status: 'booked',
      patientId: request.patientId,
      patientName: request.patientName,
      serviceType: request.serviceType,
      notes: request.notes,
      bookedAt: Date.now(),
      bookedBy: request.patientId
    };

    this.updateSlot(bookedSlot);

    // Notify handlers
    if (this.handlers.onSlotBooked) {
      this.handlers.onSlotBooked(bookedSlot);
    }

    // Broadcast via WebSocket
    this.wsClient.send('availability:broadcast', {
      event: 'slot_booked',
      slot: bookedSlot
    });

    console.log('[AvailabilityManager] Slot booked:', bookedSlot.id);

    return bookedSlot;
  }

  /**
   * Create tentative booking (temporary hold)
   */
  public createTentativeBooking(
    slotId: string,
    patientId: string
  ): TimeSlot | null {
    const slot = this.findSlotById(slotId);
    if (!slot || slot.status !== 'available') {
      return null;
    }

    const tentativeSlot: TimeSlot = {
      ...slot,
      status: 'tentative',
      patientId,
      bookedAt: Date.now()
    };

    this.updateSlot(tentativeSlot);

    // Auto-release after timeout
    setTimeout(() => {
      const currentSlot = this.findSlotById(slotId);
      if (currentSlot?.status === 'tentative' && currentSlot.patientId === patientId) {
        this.releaseSlot(slotId);
      }
    }, this.BOOKING_TIMEOUT_MS);

    // Broadcast tentative booking
    this.wsClient.send('availability:broadcast', {
      event: 'slot_tentative',
      slot: tentativeSlot
    });

    console.log('[AvailabilityManager] Tentative booking created:', slotId);

    return tentativeSlot;
  }

  /**
   * Cancel a booking
   */
  public cancelBooking(slotId: string): TimeSlot | null {
    const slot = this.findSlotById(slotId);
    if (!slot) return null;

    const cancelledSlot: TimeSlot = {
      ...slot,
      status: 'available',
      patientId: undefined,
      patientName: undefined,
      serviceType: undefined,
      notes: undefined,
      bookedAt: undefined,
      bookedBy: undefined
    };

    this.updateSlot(cancelledSlot);

    // Notify handlers
    if (this.handlers.onSlotCancelled) {
      this.handlers.onSlotCancelled(cancelledSlot);
    }

    // Broadcast via WebSocket
    this.wsClient.send('availability:broadcast', {
      event: 'slot_cancelled',
      slot: cancelledSlot
    });

    console.log('[AvailabilityManager] Booking cancelled:', slotId);

    return cancelledSlot;
  }

  /**
   * Release tentative booking
   */
  public releaseSlot(slotId: string): TimeSlot | null {
    const slot = this.findSlotById(slotId);
    if (!slot || slot.status !== 'tentative') return null;

    return this.cancelBooking(slotId);
  }

  /**
   * Block a time slot
   */
  public blockSlot(slotId: string, reason?: string): TimeSlot | null {
    const slot = this.findSlotById(slotId);
    if (!slot) return null;

    const blockedSlot: TimeSlot = {
      ...slot,
      status: 'blocked',
      notes: reason
    };

    this.updateSlot(blockedSlot);

    // Broadcast via WebSocket
    this.wsClient.send('availability:broadcast', {
      event: 'slot_blocked',
      slot: blockedSlot
    });

    console.log('[AvailabilityManager] Slot blocked:', slotId);

    return blockedSlot;
  }

  /**
   * Unblock a time slot
   */
  public unblockSlot(slotId: string): TimeSlot | null {
    const slot = this.findSlotById(slotId);
    if (!slot || slot.status !== 'blocked') return null;

    const unblockedSlot: TimeSlot = {
      ...slot,
      status: 'available',
      notes: undefined
    };

    this.updateSlot(unblockedSlot);

    // Broadcast via WebSocket
    this.wsClient.send('availability:broadcast', {
      event: 'slot_unblocked',
      slot: unblockedSlot
    });

    console.log('[AvailabilityManager] Slot unblocked:', slotId);

    return unblockedSlot;
  }

  /**
   * Find slot by ID
   */
  private findSlotById(slotId: string): TimeSlot | null {
    for (const schedule of this.schedules.values()) {
      const slot = schedule.slots.find((s) => s.id === slotId);
      if (slot) return slot;
    }
    return null;
  }

  /**
   * Update slot in schedule
   */
  private updateSlot(updatedSlot: TimeSlot): void {
    for (const [key, schedule] of this.schedules.entries()) {
      const slotIndex = schedule.slots.findIndex((s) => s.id === updatedSlot.id);
      if (slotIndex !== -1) {
        schedule.slots[slotIndex] = updatedSlot;
        this.schedules.set(key, schedule);

        // Notify handlers
        if (this.handlers.onSlotUpdated) {
          this.handlers.onSlotUpdated(updatedSlot);
        }

        // Notify schedule update
        if (this.handlers.onScheduleUpdated) {
          this.handlers.onScheduleUpdated(schedule);
        }

        break;
      }
    }
  }

  /**
   * Handle WebSocket messages
   */
  private handleAvailabilityMessage(message: any): void {
    if (!message.event) return;

    switch (message.event) {
      case 'slot_booked':
        console.log('[AvailabilityManager] Slot booked by another client');
        if (message.slot) {
          this.updateSlot(message.slot);
        }
        break;
      case 'slot_cancelled':
        console.log('[AvailabilityManager] Slot cancelled by another client');
        if (message.slot) {
          this.updateSlot(message.slot);
        }
        break;
      case 'slot_tentative':
        console.log('[AvailabilityManager] Tentative booking by another client');
        if (message.slot) {
          this.updateSlot(message.slot);
        }
        break;
      case 'slot_blocked':
        console.log('[AvailabilityManager] Slot blocked by another client');
        if (message.slot) {
          this.updateSlot(message.slot);
        }
        break;
      case 'slot_unblocked':
        console.log('[AvailabilityManager] Slot unblocked by another client');
        if (message.slot) {
          this.updateSlot(message.slot);
        }
        break;
      case 'schedule_updated':
        console.log('[AvailabilityManager] Schedule updated');
        if (message.schedule) {
          const key = `${message.schedule.date}-${message.schedule.providerId}`;
          this.schedules.set(key, message.schedule);
          if (this.handlers.onScheduleUpdated) {
            this.handlers.onScheduleUpdated(message.schedule);
          }
        }
        break;
    }
  }

  /**
   * Get booking statistics
   */
  public getBookingStats(date: string, providerId: string): {
    total: number;
    available: number;
    booked: number;
    blocked: number;
    tentative: number;
    utilizationRate: number;
  } {
    const schedule = this.getSchedule(date, providerId);
    if (!schedule) {
      return {
        total: 0,
        available: 0,
        booked: 0,
        blocked: 0,
        tentative: 0,
        utilizationRate: 0
      };
    }

    const total = schedule.slots.length;
    const available = schedule.slots.filter((s) => s.status === 'available').length;
    const booked = schedule.slots.filter((s) => s.status === 'booked').length;
    const blocked = schedule.slots.filter((s) => s.status === 'blocked').length;
    const tentative = schedule.slots.filter((s) => s.status === 'tentative').length;
    const utilizationRate = total > 0 ? (booked / total) * 100 : 0;

    return {
      total,
      available,
      booked,
      blocked,
      tentative,
      utilizationRate
    };
  }

  /**
   * Format time for display
   */
  public formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  /**
   * Format date for display
   */
  public formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    // Unsubscribe from all providers
    this.subscribedProviders.clear();
    this.schedules.clear();
    this.handlers = {};

    console.log('[AvailabilityManager] Destroyed');
  }
}

export default AvailabilityManager.getInstance();
