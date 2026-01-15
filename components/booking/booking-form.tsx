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

export function BookingForm({ onSubmit, availableSlots, onDateChange, isLoading }: BookingFormProps) {
  const t = useTranslations();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const programOptions = [
    { value: 'botox', label: t('salesPresentations.programs.botox.name'), price: 15000 },
    { value: 'filler', label: t('salesPresentations.programs.filler.name'), price: 20000 },
    { value: 'laser', label: t('salesPresentations.programs.laser.name'), price: 12000 },
    { value: 'chemical_peel', label: t('salesPresentations.programs.peel.name'), price: 8000 },
    { value: 'microneedling', label: t('salesPresentations.programs.microneedling.name'), price: 6000 },
    { value: 'hydrafacial', label: t('salesPresentations.programs.hydrafacial.name'), price: 5000 },
    { value: 'led_therapy', label: 'LED Therapy', price: 3000 },
    { value: 'mesotherapy', label: 'Mesotherapy', price: 10000 },
    { value: 'thread_lift', label: 'Thread Lift', price: 25000 },
    { value: 'prp', label: 'PRP', price: 18000 },
    { value: 'consultation', label: t('customerNotes.types.call'), price: 1500 },
  ];

  const specialistOptions = [
    { value: 'spec001', label: t('predictiveAnalytics.mock.name1') },
    { value: 'spec002', label: t('predictiveAnalytics.mock.name2') },
    { value: 'spec003', label: t('predictiveAnalytics.mock.name1') }, // Placeholder
  ];

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    specialistId: '',
    programType: '',
    selectedSlot: '',
    paymentMethod: 'promptpay' as 'promptpay' | 'credit_card' | 'cash',
    notes: '',
  });

  const [step, setStep] = useState(1); // 1: Select Date/Time, 2: Customer Info, 3: Payment

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
      clientId: 'CST' + Date.now(), // Reusing clientId field for now to avoid breaking lib/booking
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      specialistId: formData.specialistId,
      appointmentDate: selectedDate,
      startTime: slot.startTime,
      duration: slot.duration,
      programType: formData.programType,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    };

    await onSubmit(input);
  };

  const selectedProgram = programOptions.find(t => t.value === formData.programType);
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
            {/* Specialist Selection */}
            <div className="space-y-2">
              <Label>{t('bookingForm.selectSpecialist')}</Label>
              <Select
                value={formData.specialistId}
                onValueChange={value => setFormData(prev => ({ ...prev, specialistId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('bookingForm.specialistPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {specialistOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Program Selection */}
            <div className="space-y-2">
              <Label>{t('bookingForm.selectProgram')}</Label>
              <Select
                value={formData.programType}
                onValueChange={value => setFormData(prev => ({ ...prev, programType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('bookingForm.programPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {programOptions.map(program => (
                    <SelectItem key={program.value} value={program.value}>
                      {program.label} - {program.price.toLocaleString()} {t('common.currency.thb')}
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
            {selectedDate && formData.specialistId && (
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
              disabled={!formData.selectedSlot || !formData.specialistId || !formData.programType}
              className="w-full"
            >
              {t('common.next')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Customer Information */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('bookingForm.customerInfo')}
            </CardTitle>
            <CardDescription>{t('bookingForm.customerInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">{t('bookingForm.nameLabel')} *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder={t('bookingForm.nameLabel')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">{t('bookingForm.emailLabel')} *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={e => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">{t('bookingForm.phoneLabel')} *</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
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
                disabled={!formData.customerName || !formData.customerEmail || !formData.customerPhone}
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
                <p>{t('bookingForm.summarySpecialist')}: {specialistOptions.find(d => d.value === formData.specialistId)?.label}</p>
                <p>{t('bookingForm.summaryProgram')}: {selectedProgram?.label}</p>
                <p className="text-lg font-bold mt-2">
                  {t('bookingForm.summaryCost')}: {selectedProgram?.price.toLocaleString()} {t('common.currency.thb')}
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
