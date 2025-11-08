/**
 * Availability Calendar Demo
 * Real-time availability calendar with instant booking
 */

'use client';

import React, { useState } from 'react';
import { useAvailability } from '@/hooks/demo/useAvailability';
import { CalendarGrid } from '@/components/availability/calendar-grid';
import { BookingForm } from '@/components/availability/booking-form';
import { BookingStatsPanel } from '@/components/availability/booking-stats-panel';
import { ScheduleControls } from '@/components/availability/schedule-controls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TimeSlot } from '@/lib/availability-manager';
import {
  CheckCircle2,
  Users,
  Zap,
  Calendar,
  Clock,
  Shield,
  Radio
} from 'lucide-react';

export default function AvailabilityDemo() {
  const {
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
    formatTime,
    formatDate
  } = useAvailability({ providerId: 'provider-1', autoSubscribe: true });

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [currentProviderId] = useState('provider-1');

  // Get current schedule and stats
  const currentSchedule = getSchedule(selectedDate, currentProviderId);
  const stats = getBookingStats(selectedDate, currentProviderId);
  const availableSlots = currentSchedule?.slots || [];

  const handleGenerateSchedule = (config: any) => {
    generateSchedule(
      config.date,
      config.providerId,
      config.workingHours,
      config.slotDuration,
      config.breakTimes
    );
    setSelectedDate(config.date);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
      // Create tentative booking
      createTentativeBooking(slot.id, 'temp-patient');
    }
  };

  const handleBooking = async (data: {
    patientId: string;
    patientName: string;
    serviceType: string;
    notes?: string;
  }) => {
    if (!selectedSlot) return;

    const result = await bookSlot({
      slotId: selectedSlot.id,
      ...data
    });

    if (result) {
      setSelectedSlot(null);
    }
  };

  const handleCancelBooking = () => {
    if (selectedSlot) {
      cancelBooking(selectedSlot.id);
    }
    setSelectedSlot(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Real-time Availability Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Live appointment scheduling with instant booking confirmation
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Test Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-gray-500 mt-1">Core features implemented</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-gray-500 mt-1">Manager, Hook, Grid, Form, Stats, Controls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-500 mt-1">Slots, Booking, Blocking, Tentative, Stats, WebSocket, Conflicts, Auto-release</p>
          </CardContent>
        </Card>
      </div>

      {/* Error/Conflict Display */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="py-4">
            <p className="text-red-600 dark:text-red-400">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {bookingConflict && (
        <Card className="border-yellow-500">
          <CardContent className="py-4">
            <p className="text-yellow-600 dark:text-yellow-400">
              <strong>Booking Conflict:</strong> {bookingConflict.reason}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls and Stats */}
        <div className="space-y-6">
          <ScheduleControls onGenerate={handleGenerateSchedule} />
          {currentSchedule && <BookingStatsPanel stats={stats} />}
        </div>

        {/* Middle Column - Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <CalendarGrid
            slots={availableSlots}
            onSlotClick={handleSlotClick}
            formatTime={formatTime}
          />

          {selectedSlot && (
            <BookingForm
              selectedSlot={selectedSlot}
              onBook={handleBooking}
              onCancel={handleCancelBooking}
              formatTime={formatTime}
            />
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Slot Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Configurable working hours</li>
              <li>• Custom slot duration</li>
              <li>• Break time management</li>
              <li>• Multi-day scheduling</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Instant Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Real-time availability check</li>
              <li>• Instant confirmation</li>
              <li>• Conflict prevention</li>
              <li>• Booking validation</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Tentative Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• 5-minute hold period</li>
              <li>• Auto-release on timeout</li>
              <li>• Prevent double booking</li>
              <li>• Visual indicators</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Conflict Management
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Concurrent booking detection</li>
              <li>• Status validation</li>
              <li>• Error notifications</li>
              <li>• Automatic recovery</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-500" />
              WebSocket Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Real-time slot updates</li>
              <li>• Multi-client sync</li>
              <li>• Booking broadcasts</li>
              <li>• Status changes</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Provider Management
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Multi-provider support</li>
              <li>• Channel subscriptions</li>
              <li>• Individual schedules</li>
              <li>• Provider tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              Slot Blocking
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Block/unblock slots</li>
              <li>• Maintenance windows</li>
              <li>• Emergency blocking</li>
              <li>• Reason tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-500" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            <ul className="space-y-1">
              <li>• Utilization rate</li>
              <li>• Booking statistics</li>
              <li>• Slot distribution</li>
              <li>• Real-time metrics</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Components</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <Badge variant="outline">AvailabilityManager (550 lines)</Badge>
              <Badge variant="outline">useAvailability Hook</Badge>
              <Badge variant="outline">CalendarGrid</Badge>
              <Badge variant="outline">BookingForm</Badge>
              <Badge variant="outline">BookingStatsPanel</Badge>
              <Badge variant="outline">ScheduleControls</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Technologies</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <Badge>WebSocket</Badge>
              <Badge>React Hooks</Badge>
              <Badge>TypeScript</Badge>
              <Badge>Tailwind CSS</Badge>
              <Badge>Time Management</Badge>
              <Badge>State Sync</Badge>
              <Badge>Real-time Updates</Badge>
              <Badge>Vitest</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Key Features</h4>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>• <strong>Slot Generation:</strong> Automatic time slot creation with working hours and breaks</li>
              <li>• <strong>Instant Booking:</strong> Real-time availability check with immediate confirmation</li>
              <li>• <strong>Tentative Bookings:</strong> 5-minute temporary hold to prevent double booking</li>
              <li>• <strong>Conflict Prevention:</strong> Status validation and concurrent booking detection</li>
              <li>• <strong>WebSocket Sync:</strong> Real-time updates across all connected clients</li>
              <li>• <strong>Statistics:</strong> Utilization rate, booking counts, and distribution metrics</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>1. <strong>Generate Schedule:</strong> Configure working hours and click "Generate Schedule"</li>
            <li>2. <strong>View Slots:</strong> See all available time slots in the calendar grid</li>
            <li>3. <strong>Select Slot:</strong> Click on an available (green) slot to start booking</li>
            <li>4. <strong>Fill Form:</strong> Enter patient name, service type, and optional notes</li>
            <li>5. <strong>Confirm Booking:</strong> Click "Confirm Booking" for instant confirmation</li>
            <li>6. <strong>Check Stats:</strong> Monitor utilization rate and booking statistics</li>
            <li>7. <strong>Test Tentative:</strong> Wait 5 minutes to see auto-release (or confirm before timeout)</li>
            <li>8. <strong>Multi-client:</strong> Open in multiple tabs to test real-time sync</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
