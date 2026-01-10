/**
 * BookingForm Component - ฟอร์มจองนัดหมาย
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingInput, TimeSlot } from '@/lib/booking/booking-manager';
import { Calendar as CalendarIcon, Clock, User, CreditCard, CheckCircle } from 'lucide-react';

interface BookingFormProps {
  onSubmit: (input: BookingInput) => Promise<void>;
  availableSlots: TimeSlot[];
  onDateChange: (date: Date) => void;
  isLoading?: boolean;
}

const doctorOptions = [
  { value: 'dr001', label: 'พญ. สมหญิง ใจดี' },
  { value: 'dr002', label: 'นพ. วิทย์ มีสุข' },
  { value: 'dr003', label: 'พญ. ปริม สวย' },
];

export function BookingForm({ onSubmit, availableSlots, onDateChange, isLoading }: BookingFormProps) {
  const t = useTranslations();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const treatmentOptions = [
    { value: 'botox', label: t('salesPresentations.treatments.botox.name'), price: 15000 },
    { value: 'filler', label: t('salesPresentations.treatments.filler.name'), price: 20000 },
    { value: 'laser', label: t('salesPresentations.treatments.laser.name'), price: 12000 },
    { value: 'chemical_peel', label: t('salesPresentations.treatments.peel.name'), price: 8000 },
    { value: 'microneedling', label: t('salesPresentations.treatments.microneedling.name'), price: 6000 },
    { value: 'hydrafacial', label: t('salesPresentations.treatments.hydrafacial.name'), price: 5000 },
    { value: 'led_therapy', label: 'LED Therapy', price: 3000 },
    { value: 'mesotherapy', label: 'Mesotherapy', price: 10000 },
    { value: 'thread_lift', label: 'Thread Lift', price: 25000 },
    { value: 'prp', label: 'PRP', price: 18000 },
    { value: 'consultation', label: t('customerNotes.types.call'), price: 1500 },
  ];

  const doctorOptions = [
    { value: 'dr001', label: t('predictiveAnalytics.mock.name1') },
    { value: 'dr002', label: t('predictiveAnalytics.mock.name2') },
    { value: 'dr003', label: t('predictiveAnalytics.mock.name1') }, // Placeholder
  ];

  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    doctorId: '',
    treatmentType: '',
    selectedSlot: '',
    paymentMethod: 'promptpay' as 'promptpay' | 'credit_card' | 'cash',
    notes: '',
  });

  const [step, setStep] = useState(1); // 1: Select Date/Time, 2: Patient Info, 3: Payment

  useEffect(() => {
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  }, [selectedDate, onDateChange]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, selectedSlot: '' })); // Reset slot when date changes
  };

  const handleSlotSelect = (slotId: string) => {
    setFormData(prev => ({ ...prev, selectedSlot: slotId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !formData.selectedSlot) {
      return;
    }

    const slot = availableSlots.find(s => s.id === formData.selectedSlot);
    if (!slot) return;

    const input: BookingInput = {
      patientId: 'PAT' + Date.now(), // In real app, get from auth
      patientName: formData.patientName,
      patientEmail: formData.patientEmail,
      patientPhone: formData.patientPhone,
      doctorId: formData.doctorId,
      appointmentDate: selectedDate,
      startTime: slot.startTime,
      duration: slot.duration,
      treatmentType: formData.treatmentType,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    };

    await onSubmit(input);
  };

  const selectedTreatment = treatmentOptions.find(t => t.value === formData.treatmentType);
  const selectedSlot = availableSlots.find(s => s.id === formData.selectedSlot);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1: Select Date & Time */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {t('bookingForm.selectDateTime')}
            </CardTitle>
            <CardDescription>{t('bookingForm.selectDateTimeDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label>{t('bookingForm.selectDoctor')}</Label>
              <Select
                value={formData.doctorId}
                onValueChange={value => setFormData(prev => ({ ...prev, doctorId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('bookingForm.selectDoctor')} />
                </SelectTrigger>
                <SelectContent>
                  {doctorOptions.map(doctor => (
                    <SelectItem key={doctor.value} value={doctor.value}>
                      {doctor.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Treatment Selection */}
            <div className="space-y-2">
              <Label>{t('bookingForm.selectTreatment')}</Label>
              <Select
                value={formData.treatmentType}
                onValueChange={value => setFormData(prev => ({ ...prev, treatmentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('bookingForm.selectTreatment')} />
                </SelectTrigger>
                <SelectContent>
                  {treatmentOptions.map(treatment => (
                    <SelectItem key={treatment.value} value={treatment.value}>
                      {treatment.label} - {treatment.price.toLocaleString()} {t('common.currency.thb')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar */}
            <div className="space-y-2">
              <Label>{t('bookingForm.selectDate')}</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            {/* Available Slots */}
            {selectedDate && formData.doctorId && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('bookingForm.selectTime')}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <Button
                      key={slot.id}
                      type="button"
                      variant={formData.selectedSlot === slot.id ? 'default' : 'outline'}
                      disabled={!slot.isAvailable}
                      onClick={() => handleSlotSelect(slot.id)}
                      className="w-full"
                    >
                      {slot.startTime}
                      {!slot.isAvailable && ` (${t('bookingForm.full')})`}
                    </Button>
                  ))}
                </div>
                {availableSlots.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('bookingForm.loadingSlots')}</p>
                )}
              </div>
            )}

            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={!formData.selectedSlot || !formData.doctorId || !formData.treatmentType}
              className="w-full"
            >
              {t('common.next')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Patient Information */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('bookingForm.patientInfo')}
            </CardTitle>
            <CardDescription>{t('bookingForm.patientInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">{t('bookingForm.nameLabel')} *</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={e => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                placeholder={t('bookingForm.nameLabel')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientEmail">{t('bookingForm.emailLabel')} *</Label>
              <Input
                id="patientEmail"
                type="email"
                value={formData.patientEmail}
                onChange={e => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientPhone">{t('bookingForm.phoneLabel')} *</Label>
              <Input
                id="patientPhone"
                type="tel"
                value={formData.patientPhone}
                onChange={e => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                placeholder="0812345678"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('bookingForm.notesLabel')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('bookingForm.notesPlaceholder')}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                {t('common.previous')}
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!formData.patientName || !formData.patientEmail || !formData.patientPhone}
                className="flex-1"
              >
                {t('common.next')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment Method */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t('bookingForm.paymentMethod')}
            </CardTitle>
            <CardDescription>{t('bookingForm.selectPayment')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Summary */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h3 className="font-semibold">{t('bookingForm.summaryTitle')}</h3>
              <div className="text-sm space-y-1">
                <p>{t('bookingForm.summaryDate')}: {selectedDate?.toLocaleDateString(t('common.locale'))}</p>
                <p>{t('bookingForm.summaryTime')}: {selectedSlot?.startTime} - {selectedSlot?.endTime}</p>
                <p>{t('bookingForm.summaryDoctor')}: {doctorOptions.find(d => d.value === formData.doctorId)?.label}</p>
                <p>{t('bookingForm.summaryTreatment')}: {selectedTreatment?.label}</p>
                <p className="text-lg font-bold mt-2">
                  {t('bookingForm.summaryCost')}: {selectedTreatment?.price.toLocaleString()} {t('common.currency.thb')}
                </p>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label>{t('bookingForm.paymentMethod')}</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promptpay">PromptPay</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash ({t('common.status.completed')})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                {t('common.previous')}
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  t('bookingForm.bookingInProgress')
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('bookingForm.confirmBooking')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full ${
              s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </form>
  );
}
