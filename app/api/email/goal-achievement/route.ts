/**
 * API: Send Goal Achievement Email
 * POST /api/email/goal-achievement
 * 
 * Sends celebration email when customer achieves a goal
 * Should be triggered immediately when goal is completed
 */

import { NextRequest, NextResponse } from "next/server"
import { sendGoalAchievementEmail, type GoalAchievementData } from "@/lib/notifications/email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body: { email: string; data: GoalAchievementData } = await request.json()

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
    const { userName, goalName, goalType, startValue, targetValue, currentValue, daysToComplete, celebrationMessage, nextGoalSuggestion, viewProgressUrl } = body.data
    
    if (!userName || !goalName || !goalType || startValue === undefined || targetValue === undefined || currentValue === undefined || daysToComplete === undefined || !celebrationMessage || !nextGoalSuggestion || !viewProgressUrl) {
      return NextResponse.json(
        { error: "Missing required data fields" },
        { status: 400 }
      )
    }

    // Send email
    const result = await sendGoalAchievementEmail(body.email, body.data)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Goal achievement email sent successfully",
      id: result.id,
    })
  } catch (error) {
    console.error("[API] Error sending goal achievement email:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
