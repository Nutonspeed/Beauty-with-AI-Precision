/**
 * SMS notification service
 * Uses Twilio API for sending SMS
 */

interface SMSOptions {
  to: string
  message: string
}

export async function sendSMS({ to, message }: SMSOptions) {
  console.log("[SMS] Sending SMS:", { to, message })

  try {
    // Example with Twilio (requires TWILIO credentials)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${auth}`,
          },
          body: new URLSearchParams({
            To: to,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: message,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`SMS API error: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[SMS] Sent successfully:", data.sid)
      return { success: true, id: data.sid }
    }

    // Fallback: log only
    console.log("[SMS] No API credentials configured, SMS not sent")
    return { success: false, error: "No SMS service configured" }
  } catch (error) {
    console.error("[SMS] Error sending SMS:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendBookingConfirmationSMS(to: string, bookingDetails: any) {
  const message = `Booking confirmed! ${bookingDetails.treatment_type} on ${bookingDetails.booking_date} at ${bookingDetails.booking_time}. See you soon!`
  return sendSMS({ to, message })
}

export async function sendBookingReminderSMS(to: string, bookingDetails: any) {
  const message = `Reminder: Your ${bookingDetails.treatment_type} appointment is tomorrow at ${bookingDetails.booking_time}. ${bookingDetails.clinic?.name || ""}. See you soon!`
  return sendSMS({ to, message })
}

export async function sendBookingCancellationSMS(to: string, bookingDetails: any) {
  const message = `Your appointment for ${bookingDetails.treatment_type} on ${bookingDetails.booking_date} has been cancelled. Contact us to reschedule.`
  return sendSMS({ to, message })
}
