import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'noreply@yourdomain.com';

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set. Email notifications will not work.');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!resend) {
    console.error('Resend client not initialized. Check RESEND_API_KEY.');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const data = await resend.emails.send({
      from: emailFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    console.log('Email sent successfully:', data);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Booking Confirmation Email
export async function sendBookingConfirmationEmail(params: {
  to: string;
  customerName: string;
  bookingDate: string;
  bookingTime: string;
  program: string;
  centerName: string;
  centerAddress?: string;
  bookingId: string;
  locale?: 'th' | 'en';
}) {
  const { to, customerName, bookingDate, bookingTime, program, centerName, centerAddress, bookingId, locale = 'th' } = params;
  const isThai = locale === 'th';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isThai ? '🎉 การจองของคุณได้รับการยืนยันแล้ว' : '🎉 Your Booking is Confirmed'}</h1>
            <p>${isThai ? 'Booking Confirmation' : 'Appointment scheduled successfully'}</p>
          </div>
          <div class="content">
            <p>${isThai ? `สวัสดีคุณ ${customerName},` : `Hello ${customerName},`}</p>
            <p>${isThai ? 'ขอบคุณที่เลือกใช้บริการของเรา การจองของคุณได้รับการยืนยันแล้ว' : 'Thank you for choosing us. Your booking has been confirmed.'}</p>
            
            <div class="booking-details">
              <h3>${isThai ? 'รายละเอียดการจอง' : 'Booking Details'}</h3>
              <div class="detail-row">
                <span class="detail-label">${isThai ? 'หมายเลขการจอง:' : 'Booking ID:'}</span>
                <span class="detail-value">${bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${isThai ? 'วันที่:' : 'Date:'}</span>
                <span class="detail-value">${bookingDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${isThai ? 'เวลา:' : 'Time:'}</span>
                <span class="detail-value">${bookingTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${isThai ? 'โปรแกรม:' : 'Program:'}</span>
                <span class="detail-value">${program}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${isThai ? 'ศูนย์ความงาม:' : 'Beauty Center:'}</span>
                <span class="detail-value">${centerName}</span>
              </div>
              ${centerAddress ? `
              <div class="detail-row">
                <span class="detail-label">${isThai ? 'ที่อยู่:' : 'Address:'}</span>
                <span class="detail-value">${centerAddress}</span>
              </div>
              ` : ''}
            </div>

            <p><strong>${isThai ? 'สิ่งที่ต้องเตรียม:' : 'What to prepare:'}</strong></p>
            <ul>
              <li>${isThai ? 'มาถึงก่อนเวลานัด 15 นาที' : 'Arrive 15 minutes early'}</li>
              <li>${isThai ? 'นำบัตรประชาชนมาด้วย' : 'Bring your ID card'}</li>
              <li>${isThai ? 'แจ้งแพ้ยาหรือประวัติการรักษา (ถ้ามี)' : 'Inform of any allergies or medical history (if any)'}</li>
            </ul>

            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}" class="button">${isThai ? 'ดูรายละเอียดการจอง' : 'View Booking Details'}</a>
            </center>

            <p>${isThai ? 'หากต้องการเปลี่ยนแปลงหรือยกเลิกการจอง กรุณาติดต่อเราล่วงหน้าอย่างน้อย 24 ชั่วโมง' : 'If you need to change or cancel your booking, please contact us at least 24 hours in advance.'}</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CenterIQ AI. All rights reserved.</p>
            <p>${isThai ? 'Email นี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ' : 'This is an automated email. Please do not reply.'}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = isThai ? `
การจองของคุณได้รับการยืนยันแล้ว

รายละเอียดการจอง:
หมายเลขการจอง: ${bookingId}
วันที่: ${bookingDate}
เวลา: ${bookingTime}
โปรแกรม: ${program}
ศูนย์ความงาม: ${centerName}
${centerAddress ? `ที่อยู่: ${centerAddress}` : ''}

สิ่งที่ต้องเตรียม:
- มาถึงก่อนเวลานัด 15 นาที
- นำบัตรประชาชนมาด้วย
- แจ้งแพ้ยาหรือประวัติการรักษา (ถ้ามี)

ขอบคุณที่ใช้บริการ
  ` : `
Your booking has been confirmed.

Booking Details:
Booking ID: ${bookingId}
Date: ${bookingDate}
Time: ${bookingTime}
Program: ${program}
Center: ${centerName}
${centerAddress ? `Address: ${centerAddress}` : ''}

What to prepare:
- Arrive 15 minutes early
- Bring your ID card
- Inform of any allergies or medical history (if any)

Thank you for your business.
  `;

  return sendEmail({
    to,
    subject: isThai ? `✅ ยืนยันการจอง - ${program} วันที่ ${bookingDate}` : `✅ Booking Confirmed - ${program} on ${bookingDate}`,
    html,
    text,
  });
}

// Booking Reminder Email (24 hours before)
export async function sendBookingReminderEmail(params: {
  to: string;
  customerName: string;
  bookingDate: string;
  bookingTime: string;
  program: string;
  centerName: string;
  locale?: 'th' | 'en';
}) {
  const { to, customerName, bookingDate, bookingTime, program, centerName, locale = 'th' } = params;
  const isThai = locale === 'th';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #fbbf24; color: #1f2937; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .reminder-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #fbbf24; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isThai ? '⏰ การเตือนนัดหมายของคุณ' : '⏰ Your Appointment Reminder'}</h1>
          </div>
          <div class="content">
            <p>${isThai ? `สวัสดีคุณ ${customerName},` : `Hello ${customerName},`}</p>
            <p>${isThai ? 'นี่คือการเตือนว่าคุณมีนัดหมายในอีก 24 ชั่วโมง:' : 'This is a reminder that you have an appointment in the next 24 hours:'}</p>
            
            <div class="reminder-box">
              <p><strong>${isThai ? '📅 วันที่:' : '📅 Date:'}</strong> ${bookingDate}</p>
              <p><strong>${isThai ? '⏰ เวลา:' : '⏰ Time:'}</strong> ${bookingTime}</p>
              <p><strong>${isThai ? '💆 โปรแกรม:' : '💆 Program:'}</strong> ${program}</p>
              <p><strong>${isThai ? '🏥 สถานที่:' : '🏥 Location:'}</strong> ${centerName}</p>
            </div>

            <p>${isThai ? 'เราตั้งตารอพบคุณ!' : 'We look forward to seeing you!'}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: isThai ? `⏰ เตือนนัดหมาย: ${program} พรุ่งนี้ ${bookingTime}` : `⏰ Appointment Reminder: ${program} tomorrow at ${bookingTime}`,
    html,
  });
}
