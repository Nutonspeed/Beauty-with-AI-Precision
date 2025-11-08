/**
 * Booking Form Component
 * Form for booking a time slot
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, FileText } from 'lucide-react';
import { TimeSlot } from '@/lib/availability-manager';

interface BookingFormProps {
  selectedSlot: TimeSlot | null;
  onBook: (data: {
    patientId: string;
    patientName: string;
    serviceType: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
  formatTime: (timestamp: number) => string;
  className?: string;
}

export function BookingForm({
  selectedSlot,
  onBook,
  onCancel,
  formatTime,
  className
}: BookingFormProps) {
  const [patientName, setPatientName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName || !serviceType) {
      alert('Please fill in all required fields');
      return;
    }

    onBook({
      patientId: `patient-${Date.now()}`,
      patientName,
      serviceType,
      notes: notes || undefined
    });

    // Reset form
    setPatientName('');
    setServiceType('');
    setNotes('');
  };

  if (!selectedSlot) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            Select a time slot to book
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Book Appointment
        </CardTitle>
        <CardDescription>
          {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
          {' '}({selectedSlot.duration} minutes)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Name */}
          <div className="space-y-2">
            <Label htmlFor="patientName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Patient Name *
            </Label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Service Type *
            </Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">General Consultation</SelectItem>
                <SelectItem value="checkup">Health Check-up</SelectItem>
                <SelectItem value="followup">Follow-up Visit</SelectItem>
                <SelectItem value="vaccination">Vaccination</SelectItem>
                <SelectItem value="dental">Dental Care</SelectItem>
                <SelectItem value="physical">Physical Therapy</SelectItem>
                <SelectItem value="diagnostic">Diagnostic Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or symptoms..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              Confirm Booking
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
