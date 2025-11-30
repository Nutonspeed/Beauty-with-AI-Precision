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

// Booking Confirmation SMS
export async function sendBookingConfirmationSMS(params: {
  to: string;
  customerName: string;
  bookingDate: string;
  bookingTime: string;
  treatment: string;
  clinicName: string;
  bookingId: string;
}) {
  const { to, customerName, bookingDate, bookingTime, treatment, clinicName, bookingId } = params;

  const message = `
✅ ยืนยันการจอง

สวัสดี ${customerName}
การจองของคุณได้รับการยืนยันแล้ว

📅 วันที่: ${bookingDate}
⏰ เวลา: ${bookingTime}
💆 การรักษา: ${treatment}
🏥 สถานที่: ${clinicName}
🔖 เลขที่: ${bookingId}

กรุณามาถึงก่อนเวลานัด 15 นาที
  `.trim();

  return sendSMS({ to, message });
}

// Booking Reminder SMS (24 hours before)
export async function sendBookingReminderSMS(params: {
  to: string;
  customerName: string;
  bookingDate: string;
  bookingTime: string;
  treatment: string;
  clinicName: string;
}) {
  const { to, customerName, bookingDate, bookingTime, treatment, clinicName } = params;

  const message = `
⏰ เตือนนัดหมาย

สวัสดี ${customerName}
คุณมีนัดหมายในวันพรุ่งนี้:

📅 ${bookingDate}
⏰ ${bookingTime}
💆 ${treatment}
🏥 ${clinicName}

เราตั้งตารอพบคุณ!
  `.trim();

  return sendSMS({ to, message });
}

// Payment Success SMS
export async function sendPaymentSuccessSMS(params: {
  to: string;
  amount: number;
  bookingId: string;
}) {
  const { to, amount, bookingId } = params;

  const message = `
✅ ชำระเงินสำเร็จ

จำนวนเงิน: ฿${amount.toFixed(2)}
เลขที่การจอง: ${bookingId}

ขอบคุณที่ใช้บริการครับ/ค่ะ
  `.trim();

  return sendSMS({ to, message });
}

// OTP SMS
export async function sendOTPSMS(params: {
  to: string;
  otp: string;
}) {
  const { to, otp } = params;

  const message = `
🔐 รหัส OTP ของคุณคือ: ${otp}

รหัสนี้จะหมดอายุใน 5 นาที
กรุณาอย่าแชร์รหัสนี้กับผู้อื่น
  `.trim();

  return sendSMS({ to, message });
}
