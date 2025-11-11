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

export async function sendBookingConfirmation(to: string, bookingDetails: any) {
  const subject = "Booking Confirmation - AI Beauty Platform"
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
            <h1>Booking Confirmed!</h1>
            <p>Your appointment has been successfully scheduled</p>
          </div>
          <div class="content">
            <p>Dear Customer,</p>
            <p>Thank you for booking with us. Here are your appointment details:</p>
            
            <div class="details">
              <div class="detail-row">
                <strong>Treatment:</strong>
                <span>${bookingDetails.treatment_type}</span>
              </div>
              <div class="detail-row">
                <strong>Date:</strong>
                <span>${bookingDetails.booking_date}</span>
              </div>
              <div class="detail-row">
                <strong>Time:</strong>
                <span>${bookingDetails.booking_time}</span>
              </div>
              <div class="detail-row">
                <strong>Clinic:</strong>
                <span>${bookingDetails.clinic?.name || "TBD"}</span>
              </div>
            </div>

            <p>Please arrive 10 minutes before your appointment time.</p>
            
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/customer/dashboard" class="button">View My Bookings</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If you need to reschedule or cancel, please contact us at least 24 hours in advance.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

export async function sendBookingReminder(to: string, bookingDetails: any) {
  const subject = "Appointment Reminder - Tomorrow"
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
            <h1>Appointment Reminder</h1>
          </div>
          <div class="content">
            <div class="reminder-box">
              <strong>Your appointment is tomorrow!</strong>
            </div>
            
            <p>This is a friendly reminder about your upcoming appointment:</p>
            
            <ul>
              <li><strong>Treatment:</strong> ${bookingDetails.treatment_type}</li>
              <li><strong>Date:</strong> ${bookingDetails.booking_date}</li>
              <li><strong>Time:</strong> ${bookingDetails.booking_time}</li>
              <li><strong>Location:</strong> ${bookingDetails.clinic?.name || "TBD"}</li>
            </ul>

            <p>We look forward to seeing you!</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

export async function sendAnalysisComplete(to: string, analysisId: string) {
  const subject = "Your AI Skin Analysis is Ready"
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
            <h1>Analysis Complete!</h1>
            <p>Your AI skin analysis results are ready</p>
          </div>
          <div class="content">
            <p>Your skin analysis has been completed successfully.</p>
            <p>View your personalized results and treatment recommendations now.</p>
            
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/analysis/results" class="button">View Results</a>
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
export async function sendWeeklyProgressDigest(to: string, data: WeeklyDigestData) {
  const subject = `📊 สรุปความคืบหน้าประจำสัปดาห์ (${data.weekStart} - ${data.weekEnd})`
  const html = generateWeeklyProgressDigest(data)

  return sendEmail({ to, subject, html })
}

/**
 * Send automated progress report
 * Sent every 2 weeks comparing latest analysis with previous
 */
export async function sendAutomatedProgressReport(to: string, data: ProgressReportData) {
  const subject = `✨ รายงานความคืบหน้า - ${data.reportPeriod}`
  const html = generateAutomatedProgressReport(data)

  return sendEmail({ to, subject, html })
}

/**
 * Send goal achievement celebration email
 * Sent immediately when user achieves a goal
 */
export async function sendGoalAchievementEmail(to: string, data: GoalAchievementData) {
  const subject = `🎉 ยินดีด้วย! คุณบรรลุเป้าหมาย "${data.goalName}" แล้ว!`
  const html = generateGoalAchievement(data)

  return sendEmail({ to, subject, html })
}

/**
 * Send re-engagement email
 * Sent to inactive users (no analysis for 7+ days)
 */
export async function sendReEngagementEmail(to: string, data: ReEngagementData) {
  const subject = `💜 เราคิดถึงคุณ! กลับมาดูแลผิวกันต่อนะ`
  const html = generateReEngagement(data)

  return sendEmail({ to, subject, html })
}
