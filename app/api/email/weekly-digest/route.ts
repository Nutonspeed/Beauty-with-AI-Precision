/**
 * API: Send Weekly Progress Digest Email
 * POST /api/email/weekly-digest
 * 
 * Sends weekly progress summary to customer
 * Should be triggered every Monday via cron job
 */

import { NextRequest, NextResponse } from "next/server"
import { sendWeeklyProgressDigest, type WeeklyDigestData } from "@/lib/notifications/email"
import { withClinicAuth } from "@/lib/auth/middleware"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export const POST = withClinicAuth(async (request: NextRequest) => {
  try {
    const body: { email: string; data: WeeklyDigestData } = await request.json()

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
    const { userName, weekStart, weekEnd, totalAnalyses, improvements, goalsCompleted, totalGoals, nextSteps, viewReportUrl } = body.data
    
    if (!userName || !weekStart || !weekEnd || totalAnalyses === undefined || !improvements || goalsCompleted === undefined || totalGoals === undefined || !nextSteps || !viewReportUrl) {
      return NextResponse.json(
        { error: "Missing required data fields" },
        { status: 400 }
      )
    }

    // Send email
    const result = await sendWeeklyProgressDigest(body.email, body.data)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Weekly progress digest sent successfully",
      id: result.id,
    })
  } catch (error) {
    console.error("[API] Error sending weekly digest:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
})
