/**
 * API: Send Re-engagement Email
 * POST /api/email/re-engagement
 * 
 * Sends re-engagement email to inactive customers
 * Should be triggered via cron job for users inactive >7 days
 */

import { NextRequest, NextResponse } from "next/server"
import { sendReEngagementEmail, type ReEngagementData } from "@/lib/notifications/email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body: { email: string; data: ReEngagementData } = await request.json()

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
    const { userName, daysSinceLastAnalysis, lastAnalysisDate, lastScore, personalizedMessage, quickActionUrl } = body.data
    
    if (!userName || daysSinceLastAnalysis === undefined || !lastAnalysisDate || lastScore === undefined || !personalizedMessage || !quickActionUrl) {
      return NextResponse.json(
        { error: "Missing required data fields" },
        { status: 400 }
      )
    }

    // Send email
    const result = await sendReEngagementEmail(body.email, body.data)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Re-engagement email sent successfully",
      id: result.id,
    })
  } catch (error) {
    console.error("[API] Error sending re-engagement email:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
