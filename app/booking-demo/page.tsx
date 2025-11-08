/**
 * Booking Demo Page - ทดสอบระบบจองนัดหมาย
 */

'use client';

import React, { useState, useEffect } from 'react';
import { BookingForm } from '@/components/booking/booking-form';
import { useBooking } from '@/hooks/useBooking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react';
import { BookingInput } from '@/lib/booking/booking-manager';

export default function BookingDemoPage() {
  const {
    bookings,
    currentBooking,
    availableSlots,
    stats,
    isLoading,
    error,
    createBooking,
    loadPatientBookings,
    loadAvailableSlots,
    loadStats,
    cancelBooking,
    clearError,
  } = useBooking();

  const [selectedDoctorId, setSelectedDoctorId] = useState('dr001');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSuccess, setShowSuccess] = useState(false);

  // Load available slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      loadAvailableSlots(selectedDoctorId, selectedDate, 60);
    }
  }, [selectedDoctorId, selectedDate]);

  // Load sample patient bookings
  useEffect(() => {
    // In real app, get patient ID from auth
    loadPatientBookings('PAT123');
    loadStats();
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSubmit = async (input: BookingInput) => {
    setSelectedDoctorId(input.doctorId);
    const result = await createBooking(input);
    
    if (result) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('ต้องการยกเลิกการจองหรือไม่?')) {
      await cancelBooking(bookingId, 'Cancelled by patient');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: React.ReactNode; label: string }> = {
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" />, label: 'รอยืนยัน' },
      confirmed: { variant: 'default', icon: <CheckCircle className="w-3 h-3" />, label: 'ยืนยันแล้ว' },
      completed: { variant: 'outline', icon: <CheckCircle className="w-3 h-3" />, label: 'เสร็จสิ้น' },
      cancelled: { variant: 'destructive', icon: <XCircle className="w-3 h-3" />, label: 'ยกเลิก' },
      'no-show': { variant: 'destructive', icon: <AlertCircle className="w-3 h-3" />, label: 'ไม่มา' },
    };

    const config = variants[status] || variants.pending;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'รอชำระ' },
      paid: { variant: 'default', label: 'ชำระแล้ว' },
      refunded: { variant: 'outline', label: 'คืนเงินแล้ว' },
    };

    const config = variants[status] || variants.pending;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            ระบบจองนัดหมาย
          </h1>
          <p className="text-muted-foreground">
            Booking & Appointment System - จองนัดหมายทรีทเมนท์ออนไลน์
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && currentBooking && (
          <Card className="border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-green-900">จองสำเร็จ!</h3>
                  <p className="text-sm text-green-700">
                    รหัสการจอง: {currentBooking.id} - เราได้ส่งข้อมูลการจองไปยังอีเมล {currentBooking.patientEmail} แล้ว
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  ปิด
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalBookings}</p>
                    <p className="text-sm text-muted-foreground">นัดหมายทั้งหมด</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.confirmedBookings}</p>
                    <p className="text-sm text-muted-foreground">ยืนยันแล้ว</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completedBookings}</p>
                    <p className="text-sm text-muted-foreground">เสร็จสิ้นแล้ว</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {(stats.totalRevenue / 1000).toFixed(0)}K
                    </p>
                    <p className="text-sm text-muted-foreground">รายได้ (บาท)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div>
            <BookingForm
              onSubmit={handleSubmit}
              availableSlots={availableSlots}
              onDateChange={handleDateChange}
              isLoading={isLoading}
            />
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>การจองของคุณ</CardTitle>
                <CardDescription>
                  รายการนัดหมายทั้งหมด ({bookings.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>ยังไม่มีการจอง</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map(booking => (
                      <div key={booking.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {booking.appointmentDate.toLocaleDateString('th-TH')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {booking.startTime} - {booking.endTime}
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            {getStatusBadge(booking.status)}
                            {getPaymentBadge(booking.paymentStatus)}
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">รหัส:</span>{' '}
                            <span className="font-mono">{booking.id.slice(0, 10)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">หมอ:</span> {booking.doctorName}
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">ทรีทเมนท์:</span>{' '}
                            {booking.treatmentType}
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">ค่าใช้จ่าย:</span>{' '}
                            <span className="font-semibold">
                              {booking.paymentAmount.toLocaleString()} บาท
                            </span>
                          </div>
                        </div>

                        {booking.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            ยกเลิกการจอง
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Popular Treatments */}
            {stats && Object.keys(stats.bookingsByTreatment).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    ทรีทเมนท์ยอดนิยม
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.bookingsByTreatment)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([treatment, count]) => (
                        <div key={treatment} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{treatment.replace('_', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                                style={{
                                  width: `${(count / stats.totalBookings) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>Features ของระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">BookingManager</h4>
                  <p className="text-sm text-muted-foreground">
                    จัดการ CRUD operations สำหรับการจอง
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Calendar Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    ตรวจสอบช่วงเวลาว่าง และจัดการ Time Slots
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">SMS/Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    ส่งการแจ้งเตือนอัตโนมัติ
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Payment Gateway</h4>
                  <p className="text-sm text-muted-foreground">
                    รองรับ PromptPay และบัตรเครดิต
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Auto-reminder</h4>
                  <p className="text-sm text-muted-foreground">
                    เตือนก่อนนัดหมาย 24 ชั่วโมง
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Booking Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    วิเคราะห์สถิติและรายได้
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
