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
}) {
  const { to, customerName, bookingDate, bookingTime, program, centerName, centerAddress, bookingId } = params;

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
            <h1>🎉 การจองของคุณได้รับการยืนยันแล้ว</h1>
            <p>Booking Confirmation</p>
          </div>
          <div class="content">
            <p>สวัสดีคุณ ${customerName},</p>
            <p>ขอบคุณที่เลือกใช้บริการของเรา การจองของคุณได้รับการยืนยันแล้ว</p>
            
            <div class="booking-details">
              <h3>รายละเอียดการจอง</h3>
              <div class="detail-row">
                <span class="detail-label">หมายเลขการจอง:</span>
                <span class="detail-value">${bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">วันที่:</span>
                <span class="detail-value">${bookingDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">เวลา:</span>
                <span class="detail-value">${bookingTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">โปรแกรม:</span>
                <span class="detail-value">${program}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ศูนย์ความงาม:</span>
                <span class="detail-value">${centerName}</span>
              </div>
              ${centerAddress ? `
              <div class="detail-row">
                <span class="detail-label">ที่อยู่:</span>
                <span class="detail-value">${centerAddress}</span>
              </div>
              ` : ''}
            </div>

            <p><strong>สิ่งที่ต้องเตรียม:</strong></p>
            <ul>
              <li>มาถึงก่อนเวลานัด 15 นาที</li>
              <li>นำบัตรประชาชนมาด้วย</li>
              <li>แจ้งแพ้ยาหรือประวัติการรักษา (ถ้ามี)</li>
            </ul>

            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}" class="button">ดูรายละเอียดการจอง</a>
            </center>

            <p>หากต้องการเปลี่ยนแปลงหรือยกเลิกการจอง กรุณาติดต่อเราล่วงหน้าอย่างน้อย 24 ชั่วโมง</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CenterIQ AI. All rights reserved.</p>
            <p>Email นี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
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
  `;

  return sendEmail({
    to,
    subject: `✅ ยืนยันการจอง - ${program} วันที่ ${bookingDate}`,
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
}) {
  const { to, customerName, bookingDate, bookingTime, program, centerName } = params;

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
            <h1>⏰ การเตือนนัดหมายของคุณ</h1>
          </div>
          <div class="content">
            <p>สวัสดีคุณ ${customerName},</p>
            <p>นี่คือการเตือนว่าคุณมีนัดหมายในอีก 24 ชั่วโมง:</p>
            
            <div class="reminder-box">
              <p><strong>📅 วันที่:</strong> ${bookingDate}</p>
              <p><strong>⏰ เวลา:</strong> ${bookingTime}</p>
              <p><strong>💆 โปรแกรม:</strong> ${program}</p>
              <p><strong>🏥 สถานที่:</strong> ${centerName}</p>
            </div>

            <p>เราตั้งตารอพบคุณ!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `⏰ เตือนนัดหมาย: ${program} พรุ่งนี้ ${bookingTime}`,
    html,
  });
}
