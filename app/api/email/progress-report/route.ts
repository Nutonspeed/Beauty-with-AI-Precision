/**
 * API: Send Progress Report Email
 * POST /api/email/progress-report
 * 
 * Sends automated progress report comparing 2 analyses
 * Should be triggered every 2 weeks or when customer requests
 */

import { NextRequest, NextResponse } from "next/server"
import { sendAutomatedProgressReport, type ProgressReportData } from "@/lib/notifications/email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body: { email: string; data: ProgressReportData } = await request.json()

    // Validate input
    if (!body.email || !body.data) {
      return NextResponse.json(
        { error: "Missing required fields: email, data" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate data structure
    const { userName, reportPeriod, currentAnalysis, previousAnalysis, improvements, treatmentFollowed, recommendations, viewOnlineUrl } = body.data
    
    if (!userName || !reportPeriod || !currentAnalysis || !previousAnalysis || !improvements || treatmentFollowed === undefined || !recommendations || !viewOnlineUrl) {
      return NextResponse.json(
        { error: "Missing required data fields" },
        { status: 400 }
      )
    }

    // Send email
    const result = await sendAutomatedProgressReport(body.email, body.data)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Progress report sent successfully",
      id: result.id,
    })
  } catch (error) {
    console.error("[API] Error sending progress report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
