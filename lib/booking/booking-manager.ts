/**
 * BookingManager - ระบบจัดการการจองนัดหมาย
 * 
 * Features:
 * - สร้าง อัพเดต ยกเลิก การจองนัดหมาย
 * - จัดการ Time Slots และตรวจสอบความพร้อม
 * - ส่ง Notifications (SMS/Email)
 * - จัดการการชำระเงิน
 * - Auto-reminder ก่อนนัดหมาย 24 ชั่วโมง
 */

import { createBrowserClient } from '@supabase/ssr';

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: Date;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  isAvailable: boolean;
  duration: number;  // minutes
}

export interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  treatmentType: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'promptpay' | 'credit_card' | 'cash';
  paymentAmount: number;
  notes?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingInput {
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  appointmentDate: Date;
  startTime: string;
  duration: number;
  treatmentType: string;
  paymentMethod: 'promptpay' | 'credit_card' | 'cash';
  notes?: string;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  bookingsByTreatment: Record<string, number>;
  bookingsByMonth: Record<string, number>;
}

export class BookingManager {
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Treatment prices
  private treatmentPrices: Record<string, number> = {
    'botox': 15000,
    'filler': 20000,
    'laser': 12000,
    'chemical_peel': 8000,
    'microneedling': 6000,
    'hydrafacial': 5000,
    'led_therapy': 3000,
    'mesotherapy': 10000,
    'thread_lift': 25000,
    'prp': 18000,
    'consultation': 1500,
  };

  // ===== Booking CRUD Operations =====

  /**
   * สร้างการจองใหม่
   */
  async createBooking(input: BookingInput): Promise<Booking> {
    // Check if time slot is available
    const isAvailable = await this.checkAvailability(
      input.doctorId,
      input.appointmentDate,
      input.startTime,
      input.duration
    );

    if (!isAvailable) {
      throw new Error('Time slot is not available');
    }

    // Calculate end time
    const endTime = this.calculateEndTime(input.startTime, input.duration);

    // Get doctor name
    const doctorName = await this.getDoctorName(input.doctorId);

    // Calculate payment amount
    const paymentAmount = this.treatmentPrices[input.treatmentType] || 0;

    const booking: Booking = {
      id: this.generateBookingId(),
      patientId: input.patientId,
      patientName: input.patientName,
      patientEmail: input.patientEmail,
      patientPhone: input.patientPhone,
      doctorId: input.doctorId,
      doctorName,
      appointmentDate: input.appointmentDate,
      startTime: input.startTime,
      endTime,
      duration: input.duration,
      treatmentType: input.treatmentType,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: input.paymentMethod,
      paymentAmount,
      notes: input.notes,
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    await this.saveBooking(booking);

    // Send confirmation email
    await this.sendConfirmationEmail(booking);

    // Send confirmation SMS
    await this.sendConfirmationSMS(booking);

    return booking;
  }

  /**
   * อัพเดทการจอง
   */
  async updateBooking(
    bookingId: string,
    updates: Partial<Booking>
  ): Promise<Booking> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const updatedBooking: Booking = {
      ...booking,
      ...updates,
      updatedAt: new Date(),
    };

    await this.saveBooking(updatedBooking);

    // If status changed, send notification
    if (updates.status && updates.status !== booking.status) {
      await this.sendStatusUpdateNotification(updatedBooking);
    }

    return updatedBooking;
  }

  /**
   * ยกเลิกการจอง
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    await this.updateBooking(bookingId, {
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : undefined,
    });

    const booking = await this.getBookingById(bookingId);
    if (booking) {
      await this.sendCancellationNotification(booking);
      
      // Process refund if paid
      if (booking.paymentStatus === 'paid') {
        await this.processRefund(booking);
      }
    }
  }

  /**
   * ดึงข้อมูลการจองทั้งหมดของผู้ป่วย
   */
  async getPatientBookings(patientId: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    return (data || []).map(this.mapDatabaseToBooking);
  }

  /**
   * ดึงข้อมูลการจองของหมอ
   */
  async getDoctorBookings(
    doctorId: string,
    date?: Date
  ): Promise<Booking[]> {
    let query = this.supabase
      .from('bookings')
      .select('*')
      .eq('doctor_id', doctorId);

    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      query = query.eq('appointment_date', dateStr);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching doctor bookings:', error);
      return [];
    }

    return (data || []).map(this.mapDatabaseToBooking);
  }

  /**
   * ดึงข้อมูลการจองตาม ID
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDatabaseToBooking(data);
  }

  // ===== Availability Management =====

  /**
   * ตรวจสอบว่าช่วงเวลามีว่างหรือไม่
   */
  async checkAvailability(
    doctorId: string,
    date: Date,
    startTime: string,
    duration: number
  ): Promise<boolean> {
    const endTime = this.calculateEndTime(startTime, duration);
    const dateStr = date.toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', dateStr)
      .in('status', ['pending', 'confirmed'])
      .or(`start_time.lt.${endTime},end_time.gt.${startTime}`);

    if (error) {
      console.error('Error checking availability:', error);
      return false;
    }

    return !data || data.length === 0;
  }

  /**
   * ดึงช่วงเวลาที่ว่างทั้งหมดในวัน
   */
  async getAvailableSlots(
    doctorId: string,
    date: Date,
    duration: number = 60
  ): Promise<TimeSlot[]> {
    const workingHours = {
      start: '09:00',
      end: '18:00',
    };

    const bookedSlots = await this.getDoctorBookings(doctorId, date);
    const allSlots: TimeSlot[] = [];

    // Generate all possible slots
    let currentTime = workingHours.start;
    while (currentTime < workingHours.end) {
      const endTime = this.calculateEndTime(currentTime, duration);
      
      const isAvailable = !bookedSlots.some(booking => {
        return (
          (currentTime >= booking.startTime && currentTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime)
        );
      });

      allSlots.push({
        id: `${doctorId}-${date.toISOString().split('T')[0]}-${currentTime}`,
        doctorId,
        date,
        startTime: currentTime,
        endTime,
        isAvailable,
        duration,
      });

      currentTime = endTime;
    }

    return allSlots;
  }

  // ===== Payment Processing =====

  /**
   * ประมวลผลการชำระเงิน
   */
  async processPayment(
    bookingId: string,
    paymentMethod: 'promptpay' | 'credit_card' | 'cash'
  ): Promise<{ success: boolean; transactionId?: string }> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    let success = false;
    let transactionId: string | undefined;

    if (paymentMethod === 'promptpay') {
      // Generate PromptPay QR code
      const qrData = await this.generatePromptPayQR(booking.paymentAmount);
      transactionId = qrData.transactionId;
      success = true; // In real scenario, wait for payment confirmation
    } else if (paymentMethod === 'credit_card') {
      // Process credit card payment via Stripe/Omise
      const result = await this.processCreditCardPayment(booking);
      success = result.success;
      transactionId = result.transactionId;
    } else {
      // Cash payment - mark as paid when received
      success = true;
      transactionId = this.generateTransactionId();
    }

    if (success) {
      await this.updateBooking(bookingId, {
        paymentStatus: 'paid',
        status: 'confirmed',
      });
    }

    return { success, transactionId };
  }

  /**
   * ประมวลผลการคืนเงิน
   */
  async processRefund(booking: Booking): Promise<void> {
    // In real implementation, process refund via payment gateway
    await this.updateBooking(booking.id, {
      paymentStatus: 'refunded',
    });

    console.log(`Refund processed for booking ${booking.id}`);
  }

  // ===== Notifications & Reminders =====

  /**
   * ส่ง Email ยืนยันการจอง
   */
  private async sendConfirmationEmail(booking: Booking): Promise<void> {
    const emailContent = `
      <h2>ยืนยันการจองนัดหมาย</h2>
      <p>สวัสดีคุณ ${booking.patientName},</p>
      <p>การจองนัดหมายของคุณได้รับการยืนยันแล้ว</p>
      <ul>
        <li>รหัสการจอง: ${booking.id}</li>
        <li>วันที่: ${booking.appointmentDate.toLocaleDateString('th-TH')}</li>
        <li>เวลา: ${booking.startTime} - ${booking.endTime}</li>
        <li>หมอ: ${booking.doctorName}</li>
        <li>ทรีทเมนท์: ${booking.treatmentType}</li>
        <li>ค่าใช้จ่าย: ${booking.paymentAmount.toLocaleString()} บาท</li>
      </ul>
      <p>หากต้องการยกเลิกหรือเปลี่ยนแปลงนัดหมาย กรุณาแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมง</p>
    `;

    // Send via email service (SendGrid/Resend)
    console.log(`Sending confirmation email to ${booking.patientEmail}`);
    // await emailService.send(booking.patientEmail, 'Booking Confirmation', emailContent);
  }

  /**
   * ส่ง SMS ยืนยันการจอง
   */
  private async sendConfirmationSMS(booking: Booking): Promise<void> {
    const message = `ยืนยันการจอง: ${booking.appointmentDate.toLocaleDateString('th-TH')} เวลา ${booking.startTime} กับ ${booking.doctorName}. รหัส: ${booking.id}`;

    // Send via SMS service (Twilio/Thai SMS providers)
    console.log(`Sending SMS to ${booking.patientPhone}: ${message}`);
    // await smsService.send(booking.patientPhone, message);
  }

  /**
   * ส่ง Reminder ก่อนนัดหมาย 24 ชั่วโมง
   */
  async sendReminders(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('appointment_date', dateStr)
      .eq('reminder_sent', false)
      .in('status', ['pending', 'confirmed']);

    if (error || !data) {
      console.error('Error fetching bookings for reminders:', error);
      return;
    }

    for (const row of data) {
      const booking = this.mapDatabaseToBooking(row);
      
      // Send reminder email
      await this.sendReminderEmail(booking);
      
      // Send reminder SMS
      await this.sendReminderSMS(booking);
      
      // Mark reminder as sent
      await this.updateBooking(booking.id, { reminderSent: true });
    }
  }

  private async sendReminderEmail(booking: Booking): Promise<void> {
    const message = `เตือน: คุณมีนัดหมายพรุ่งนี้ ${booking.appointmentDate.toLocaleDateString('th-TH')} เวลา ${booking.startTime} กับ ${booking.doctorName}`;
    console.log(`Sending reminder email to ${booking.patientEmail}`);
  }

  private async sendReminderSMS(booking: Booking): Promise<void> {
    const message = `เตือน: นัดหมายพรุ่งนี้ ${booking.startTime} กับ ${booking.doctorName}. รหัส: ${booking.id}`;
    console.log(`Sending reminder SMS to ${booking.patientPhone}`);
  }

  private async sendStatusUpdateNotification(booking: Booking): Promise<void> {
    console.log(`Status updated for booking ${booking.id}: ${booking.status}`);
  }

  private async sendCancellationNotification(booking: Booking): Promise<void> {
    console.log(`Booking cancelled: ${booking.id}`);
  }

  // ===== Analytics & Statistics =====

  /**
   * ดึงสถิติการจอง
   */
  async getBookingStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<BookingStats> {
    let query = this.supabase.from('bookings').select('*');

    if (startDate) {
      query = query.gte('appointment_date', startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('appointment_date', endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error || !data) {
      return this.getEmptyStats();
    }

    const bookings = data.map(this.mapDatabaseToBooking);

    const stats: BookingStats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      noShowBookings: bookings.filter(b => b.status === 'no-show').length,
      totalRevenue: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.paymentAmount, 0),
      averageBookingValue:
        bookings.length > 0
          ? bookings.reduce((sum, b) => sum + b.paymentAmount, 0) / bookings.length
          : 0,
      bookingsByTreatment: this.groupByTreatment(bookings),
      bookingsByMonth: this.groupByMonth(bookings),
    };

    return stats;
  }

  // ===== Helper Methods =====

  private calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  private generateBookingId(): string {
    return `BK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateTransactionId(): string {
    return `TX${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private async getDoctorName(doctorId: string): Promise<string> {
    // In real implementation, fetch from doctors table
    return `หมอ ${doctorId}`;
  }

  private async saveBooking(booking: Booking): Promise<void> {
    const row = this.mapBookingToDatabase(booking);
    
    const { error } = await this.supabase
      .from('bookings')
      .upsert(row);

    if (error) {
      console.error('Error saving booking:', error);
      throw new Error('Failed to save booking');
    }
  }

  private mapBookingToDatabase(booking: Booking): any {
    return {
      id: booking.id,
      patient_id: booking.patientId,
      patient_name: booking.patientName,
      patient_email: booking.patientEmail,
      patient_phone: booking.patientPhone,
      doctor_id: booking.doctorId,
      doctor_name: booking.doctorName,
      appointment_date: booking.appointmentDate.toISOString().split('T')[0],
      start_time: booking.startTime,
      end_time: booking.endTime,
      duration: booking.duration,
      treatment_type: booking.treatmentType,
      status: booking.status,
      payment_status: booking.paymentStatus,
      payment_method: booking.paymentMethod,
      payment_amount: booking.paymentAmount,
      notes: booking.notes,
      reminder_sent: booking.reminderSent,
      created_at: booking.createdAt.toISOString(),
      updated_at: booking.updatedAt.toISOString(),
    };
  }

  private mapDatabaseToBooking(row: any): Booking {
    return {
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      patientEmail: row.patient_email,
      patientPhone: row.patient_phone,
      doctorId: row.doctor_id,
      doctorName: row.doctor_name,
      appointmentDate: new Date(row.appointment_date),
      startTime: row.start_time,
      endTime: row.end_time,
      duration: row.duration,
      treatmentType: row.treatment_type,
      status: row.status,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      paymentAmount: row.payment_amount,
      notes: row.notes,
      reminderSent: row.reminder_sent,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private groupByTreatment(bookings: Booking[]): Record<string, number> {
    return bookings.reduce((acc, booking) => {
      acc[booking.treatmentType] = (acc[booking.treatmentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByMonth(bookings: Booking[]): Record<string, number> {
    return bookings.reduce((acc, booking) => {
      const month = booking.appointmentDate.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getEmptyStats(): BookingStats {
    return {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      noShowBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      bookingsByTreatment: {},
      bookingsByMonth: {},
    };
  }

  private async generatePromptPayQR(amount: number): Promise<{ transactionId: string; qrCode: string }> {
    // In real implementation, generate PromptPay QR code
    return {
      transactionId: this.generateTransactionId(),
      qrCode: `promptpay://qr/amount=${amount}`,
    };
  }

  private async processCreditCardPayment(booking: Booking): Promise<{ success: boolean; transactionId: string }> {
    // In real implementation, process via Stripe/Omise
    return {
      success: true,
      transactionId: this.generateTransactionId(),
    };
  }
}
