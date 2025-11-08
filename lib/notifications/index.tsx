/**
 * Unified notification service
 * Handles email and SMS notifications
 */

import { sendEmail, sendBookingConfirmation, sendBookingReminder, sendAnalysisComplete } from "./email"
import { sendSMS, sendBookingConfirmationSMS, sendBookingReminderSMS, sendBookingCancellationSMS } from "./sms"

export interface NotificationOptions {
  type: "email" | "sms" | "both"
  to: string
  phone?: string
}

export async function notifyBookingConfirmation(options: NotificationOptions, bookingDetails: any) {
  const results = []

  if (options.type === "email" || options.type === "both") {
    const emailResult = await sendBookingConfirmation(options.to, bookingDetails)
    results.push({ channel: "email", ...emailResult })
  }

  if ((options.type === "sms" || options.type === "both") && options.phone) {
    const smsResult = await sendBookingConfirmationSMS(options.phone, bookingDetails)
    results.push({ channel: "sms", ...smsResult })
  }

  return results
}

export async function notifyBookingReminder(options: NotificationOptions, bookingDetails: any) {
  const results = []

  if (options.type === "email" || options.type === "both") {
    const emailResult = await sendBookingReminder(options.to, bookingDetails)
    results.push({ channel: "email", ...emailResult })
  }

  if ((options.type === "sms" || options.type === "both") && options.phone) {
    const smsResult = await sendBookingReminderSMS(options.phone, bookingDetails)
    results.push({ channel: "sms", ...smsResult })
  }

  return results
}

export async function notifyBookingCancellation(options: NotificationOptions, bookingDetails: any) {
  const results = []

  if (options.type === "email" || options.type === "both") {
    const emailResult = await sendEmail({
      to: options.to,
      subject: "Booking Cancelled",
      html: `<p>Your booking for ${bookingDetails.treatment_type} on ${bookingDetails.booking_date} has been cancelled.</p>`,
    })
    results.push({ channel: "email", ...emailResult })
  }

  if ((options.type === "sms" || options.type === "both") && options.phone) {
    const smsResult = await sendBookingCancellationSMS(options.phone, bookingDetails)
    results.push({ channel: "sms", ...smsResult })
  }

  return results
}

export async function notifyAnalysisComplete(email: string, analysisId: string) {
  return sendAnalysisComplete(email, analysisId)
}

export { sendEmail, sendSMS }
