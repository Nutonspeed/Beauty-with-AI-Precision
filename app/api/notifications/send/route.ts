import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEmail, sendSMS } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or staff
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (!["admin", "clinic_staff", "sales_staff"].includes(userProfile?.role || "")) {
      return NextResponse.json({ error: "Forbidden - Staff access required" }, { status: 403 })
    }

    const body = await request.json()
    const { type, to, phone, subject, message } = body

    const results = []

    if (type === "email" || type === "both") {
      const emailResult = await sendEmail({
        to,
        subject: subject || "Notification from AI Beauty Platform",
        html: `<p>${message}</p>`,
        text: message,
      })
      results.push({ channel: "email", ...emailResult })
    }

    if ((type === "sms" || type === "both") && phone) {
      const smsResult = await sendSMS({ to: phone, message })
      results.push({ channel: "sms", ...smsResult })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json(
      { error: "Failed to send notification", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
