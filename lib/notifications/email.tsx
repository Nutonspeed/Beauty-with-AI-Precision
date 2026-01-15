/**
 * Email notification service
 * Uses Resend API for sending emails
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // In production, use Resend or similar service
  // For now, log to console
  console.log("[Email] Sending email:", { to, subject })

  try {
    // Example with Resend (requires RESEND_API_KEY env var)
    if (process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "noreply@beautyplatform.com",
          to,
          subject,
          html,
          text,
        }),
      })

      if (!response.ok) {
        throw new Error(`Email API error: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[Email] Sent successfully:", data.id)
      return { success: true, id: data.id }
    }

    // Fallback: log only
    console.log("[Email] No API key configured, email not sent")
    return { success: false, error: "No email service configured" }
  } catch (error) {
    console.error("[Email] Error sending email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Email Subjects by Locale
const EMAIL_SUBJECTS = {
  th: {
    bookingConfirmed: "ยืนยันการจอง - AI Beauty Platform",
    bookingReminder: "เตือนนัดหมาย - พรุ่งนี้",
    analysisComplete: "ผลการวิเคราะห์ผิวของคุณพร้อมแล้ว",
    weeklyDigest: (data: any) => `📊 สรุปความคืบหน้าประจำสัปดาห์ (${data.weekStart} - ${data.weekEnd})`,
    automatedProgress: (data: any) => `✨ รายงานความคืบหน้า - ${data.reportPeriod}`,
    goalAchievement: (data: any) => `🎉 ยินดีด้วย! คุณบรรลุเป้าหมาย "${data.goalName}" แล้ว!`,
    reEngagement: `💜 เราคิดถึงคุณ! กลับมาดูแลผิวกันต่อนะ`,
  },
  en: {
    bookingConfirmed: "Booking Confirmation - AI Beauty Platform",
    bookingReminder: "Appointment Reminder - Tomorrow",
    analysisComplete: "Your AI Skin Analysis is Ready",
    weeklyDigest: (data: any) => `📊 Weekly Progress Digest (${data.weekStart} - ${data.weekEnd})`,
    automatedProgress: (data: any) => `✨ Progress Report - ${data.reportPeriod}`,
    goalAchievement: (data: any) => `🎉 Congratulations! You've achieved your goal "${data.goalName}"!`,
    reEngagement: `💜 We miss you! Come back and continue your skin care journey`,
  }
};

export async function sendBookingConfirmation(to: string, bookingDetails: any, locale: 'th' | 'en' = 'en') {
  const t = EMAIL_SUBJECTS[locale] || EMAIL_SUBJECTS.en;
  const subject = t.bookingConfirmed;
  const isThai = locale === 'th';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isThai ? "ยืนยันการจอง!" : "Booking Confirmed!"}</h1>
            <p>${isThai ? "นัดหมายของคุณได้รับการยืนยันแล้ว" : "Your appointment has been successfully scheduled"}</p>
          </div>
          <div class="content">
            <p>${isThai ? "เรียน คุณลูกค้า," : "Dear Customer,"}</p>
            <p>${isThai ? "ขอบคุณสำหรับการจอง ข้อมูลนัดหมายของคุณมีดังนี้:" : "Thank you for booking with us. Here are your appointment details:"}</p>
            
            <div class="details">
              <div class="detail-row">
                <strong>${isThai ? "โปรแกรม:" : "Program:"}</strong>
                <span>${bookingDetails.program_type}</span>
              </div>
              <div class="detail-row">
                <strong>${isThai ? "วันที่:" : "Date:"}</strong>
                <span>${bookingDetails.booking_date}</span>
              </div>
              <div class="detail-row">
                <strong>${isThai ? "เวลา:" : "Time:"}</strong>
                <span>${bookingDetails.booking_time}</span>
              </div>
              <div class="detail-row">
                <strong>${isThai ? "ศูนย์บริการ:" : "Center:"}</strong>
                <span>${bookingDetails.center?.name || "TBD"}</span>
              </div>
            </div>

            <p>${isThai ? "กรุณามาถึงก่อนเวลานัด 10 นาที" : "Please arrive 10 minutes before your appointment time."}</p>
            
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/customer/dashboard" class="button">${isThai ? "ดูการจองของฉัน" : "View My Bookings"}</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              ${isThai ? "หากคุณต้องการเลื่อนนัดหรือยกเลิก กรุณาติดต่อเราอย่างน้อย 24 ชั่วโมงล่วงหน้า" : "If you need to reschedule or cancel, please contact us at least 24 hours in advance."}
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

export async function sendBookingReminder(to: string, bookingDetails: any, locale: 'th' | 'en' = 'en') {
  const t = EMAIL_SUBJECTS[locale] || EMAIL_SUBJECTS.en;
  const subject = t.bookingReminder;
  const isThai = locale === 'th';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reminder-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isThai ? "เตือนนัดหมาย" : "Appointment Reminder"}</h1>
          </div>
          <div class="content">
            <div class="reminder-box">
              <strong>${isThai ? "นัดหมายของคุณคือวันพรุ่งนี้!" : "Your appointment is tomorrow!"}</strong>
            </div>
            
            <p>${isThai ? "นี่คือการแจ้งเตือนสำหรับนัดหมายที่กำลังจะมาถึง:" : "This is a friendly reminder about your upcoming appointment:"}</p>
            
            <ul>
              <li><strong>${isThai ? "โปรแกรม:" : "Program:"}</strong> ${bookingDetails.program_type}</li>
              <li><strong>${isThai ? "วันที่:" : "Date:"}</strong> ${bookingDetails.booking_date}</li>
              <li><strong>${isThai ? "เวลา:" : "Time:"}</strong> ${bookingDetails.booking_time}</li>
              <li><strong>${isThai ? "สถานที่:" : "Location:"}</strong> ${bookingDetails.center?.name || "TBD"}</li>
            </ul>

            <p>${isThai ? "เราตั้งตารอพบคุณ!" : "We look forward to seeing you!"}</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

export async function sendAnalysisComplete(to: string, _analysisId: string, locale: 'th' | 'en' = 'en') {
  const t = EMAIL_SUBJECTS[locale] || EMAIL_SUBJECTS.en;
  const subject = t.analysisComplete;
  const isThai = locale === 'th';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isThai ? "วิเคราะห์ผิวสำเร็จ!" : "Analysis Complete!"}</h1>
            <p>${isThai ? "ผลการวิเคราะห์ผิวด้วย AI ของคุณพร้อมแล้ว" : "Your AI skin analysis results are ready"}</p>
          </div>
          <div class="content">
            <p>${isThai ? "การวิเคราะห์ผิวของคุณเสร็จสิ้นเรียบร้อยแล้ว" : "Your skin analysis has been completed successfully."}</p>
            <p>${isThai ? "ดูผลลัพธ์เฉพาะบุคคลและคำแนะนำโปรแกรมได้เลย" : "View your personalized results and program recommendations now."}</p>
            
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/analysis/results" class="button">${isThai ? "ดูผลลัพธ์" : "View Results"}</a>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

// ========================================
// NEW EMAIL TEMPLATES (Phase 1)
// ========================================

import {
  generateWeeklyProgressDigest,
  generateAutomatedProgressReport,
  generateGoalAchievement,
  generateReEngagement,
  type WeeklyDigestData,
  type ProgressReportData,
  type GoalAchievementData,
  type ReEngagementData,
} from "./email-templates"

// Export types for external use
export type {
  WeeklyDigestData,
  ProgressReportData,
  GoalAchievementData,
  ReEngagementData,
}

/**
 * Send weekly progress digest email
 * Sent every Monday morning with summary of past week
 */
export async function sendWeeklyProgressDigest(to: string, data: WeeklyDigestData, locale: 'th' | 'en' = 'en') {
  const t = EMAIL_SUBJECTS[locale] || EMAIL_SUBJECTS.en;
  const subject = t.weeklyDigest(data)
  const html = generateWeeklyProgressDigest(data)

  return sendEmail({ to, subject, html })
}

/**
 * Send automated progress report
 * Sent every 2 weeks comparing latest analysis with previous
 */
export async function sendAutomatedProgressReport(to: string, data: ProgressReportData, locale: 'th' | 'en' = 'en') {
  const t = EMAIL_SUBJECTS[locale] || EMAIL_SUBJECTS.en;
  const subject = t.automatedProgress(data)
  const html = generateAutomatedProgressReport(data)

  return sendEmail({ to, subject, html })
}

/**
 * Send goal achievement celebration email
 * Sent immediately when user achieves a goal
 */
export async function sendGoalAchievementEmail(to: string, data: GoalAchievementData, locale: 'th' | 'en' = 'en') {
  const t = EMAIL_SUBJECTS[locale] || EMAIL_SUBJECTS.en;
  const subject = t.goalAchievement(data)
  const html = generateGoalAchievement(data)

  return sendEmail({ to, subject, html })
}

/**
 * Send re-engagement email
 * Sent to inactive users (no analysis for 7+ days)
 */
export async function sendReEngagementEmail(to: string, data: ReEngagementData, locale: 'th' | 'en' = 'en') {
  const t = EMAIL_SUBJECTS[locale] || EMAIL_SUBJECTS.en;
  const subject = t.reEngagement
  const html = generateReEngagement(data)

  return sendEmail({ to, subject, html })
}
