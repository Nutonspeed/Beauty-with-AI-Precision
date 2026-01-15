import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !phoneNumber) {
  console.warn('Twilio credentials not set. SMS notifications will not work.');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Check if SMS is configured
 */
export function isSmsConfigured(): boolean {
  return !!(accountSid && authToken && phoneNumber && client);
}

export interface SendSMSParams {
  to: string;
  message: string;
}

export async function sendSMS({ to, message }: SendSMSParams) {
  if (!client || !phoneNumber) {
    console.error('Twilio client not initialized. Check TWILIO_* environment variables.');
    return {
      success: false,
      error: 'SMS service not configured',
    };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: phoneNumber,
      to: to,
    });

    console.log('SMS sent successfully:', result.sid);
    return {
      success: true,
      sid: result.sid,
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// SMS Templates
const SMS_TEMPLATES = {
  th: {
    bookingConfirmed: (data: any) => `✅ ยืนยันการจอง\n\nสวัสดี ${data.customerName}\nการจองของคุณได้รับการยืนยันแล้ว\n\n📅 วันที่: ${data.bookingDate}\n⏰ เวลา: ${data.bookingTime}\n💆 โปรแกรม: ${data.program}\n🏥 สถานที่: ${data.centerName}\n🔖 เลขที่: ${data.bookingId}\n\nกรุณามาถึงก่อนเวลานัด 15 นาที`,
    bookingReminder: (data: any) => `⏰ เตือนนัดหมาย\n\nสวัสดี ${data.customerName}\nคุณมีนัดหมายในวันพรุ่งนี้:\n\n📅 ${data.bookingDate}\n⏰ ${data.bookingTime}\n💆 ${data.program}\n🏥 ${data.centerName}\n\nเราตั้งตารอพบคุณ!`,
    paymentSuccess: (data: any) => `✅ ชำระเงินสำเร็จ\n\nจำนวนเงิน: ฿${data.amount.toFixed(2)}\nเลขที่การจอง: ${data.bookingId}\n\nขอบคุณที่ใช้บริการครับ/ค่ะ`,
    otp: (data: any) => `🔐 รหัส OTP ของคุณคือ: ${data.otp}\n\nรหัสนี้จะหมดอายุใน 5 นาที\nกรุณาอย่าแชร์รหัสนี้กับผู้อื่น`,
  },
  en: {
    bookingConfirmed: (data: any) => `✅ Booking Confirmed\n\nHello ${data.customerName}\nYour booking has been confirmed.\n\n📅 Date: ${data.bookingDate}\n⏰ Time: ${data.bookingTime}\n💆 Program: ${data.program}\n🏥 Center: ${data.centerName}\n🔖 ID: ${data.bookingId}\n\nPlease arrive 15 minutes early.`,
    bookingReminder: (data: any) => `⏰ Appointment Reminder\n\nHello ${data.customerName}\nYou have an appointment tomorrow:\n\n📅 ${data.bookingDate}\n⏰ ${data.bookingTime}\n💆 ${data.program}\n🏥 ${data.centerName}\n\nWe look forward to seeing you!`,
    paymentSuccess: (data: any) => `✅ Payment Successful\n\nAmount: ฿${data.amount.toFixed(2)}\nBooking ID: ${data.bookingId}\n\nThank you for choosing us.`,
    otp: (data: any) => `🔐 Your OTP is: ${data.otp}\n\nExpires in 5 minutes.\nPlease do not share this with anyone.`,
  },
};

// Booking Confirmation SMS
export async function sendBookingConfirmationSMS(params: {
  to: string;
  customerName: string;
  bookingDate: string;
  bookingTime: string;
  program: string;
  centerName: string;
  bookingId: string;
  locale?: 'th' | 'en';
}) {
  const { to, locale = 'th' } = params;
  const templates = SMS_TEMPLATES[locale] || SMS_TEMPLATES.th;
  const message = templates.bookingConfirmed(params).trim();

  return sendSMS({ to, message });
}

// Booking Reminder SMS (24 hours before)
export async function sendBookingReminderSMS(params: {
  to: string;
  customerName: string;
  bookingDate: string;
  bookingTime: string;
  program: string;
  centerName: string;
  locale?: 'th' | 'en';
}) {
  const { to, locale = 'th' } = params;
  const templates = SMS_TEMPLATES[locale] || SMS_TEMPLATES.th;
  const message = templates.bookingReminder(params).trim();

  return sendSMS({ to, message });
}

// Payment Success SMS
export async function sendPaymentSuccessSMS(params: {
  to: string;
  amount: number;
  bookingId: string;
  locale?: 'th' | 'en';
}) {
  const { to, locale = 'th' } = params;
  const templates = SMS_TEMPLATES[locale] || SMS_TEMPLATES.th;
  const message = templates.paymentSuccess(params).trim();

  return sendSMS({ to, message });
}

// OTP SMS
export async function sendOTPSMS(params: {
  to: string;
  otp: string;
  locale?: 'th' | 'en';
}) {
  const { to, locale = 'th' } = params;
  const templates = SMS_TEMPLATES[locale] || SMS_TEMPLATES.th;
  const message = templates.otp(params).trim();

  return sendSMS({ to, message });
}
