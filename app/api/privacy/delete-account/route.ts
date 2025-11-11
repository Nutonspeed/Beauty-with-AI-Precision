/**
 * Account Deletion API
 * POST /api/privacy/delete-account - Request account deletion
 * DELETE /api/privacy/delete-account - Cancel account deletion
 * 
 * GDPR Right to Erasure with 30-day grace period
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST - Request account deletion
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { reason } = body

    // Check if there's already a pending or confirmed deletion request
    const { data: existingRequest } = await supabase
      .from("account_deletion_requests")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["pending", "confirmed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { 
          error: "Account deletion already scheduled",
          scheduledFor: existingRequest.scheduled_for 
        },
        { status: 409 }
      )
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString("hex")

    // Calculate scheduled deletion date (30 days from now)
    const scheduledFor = new Date()
    scheduledFor.setDate(scheduledFor.getDate() + 30)

    // Create deletion request
    const { data: deletionRequest, error: insertError } = await supabase
      .from("account_deletion_requests")
      .insert({
        user_id: user.id,
        status: "pending",
        reason: reason || null,
        requested_at: new Date().toISOString(),
        confirmation_token: confirmationToken,
        scheduled_for: scheduledFor.toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Log deletion request
    await supabase.from("privacy_logs").insert({
      user_id: user.id,
      action: "account_deletion_requested",
      details: {
        request_id: deletionRequest.id,
        scheduled_for: scheduledFor.toISOString(),
        reason: reason || "No reason provided",
      },
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    })

    // TODO: Send confirmation email with cancellation link
    // Email should include:
    // - Deletion scheduled date
    // - What data will be deleted
    // - How to cancel (link with token)
    // - Contact support if needed

    return NextResponse.json({
      success: true,
      message: "Account deletion scheduled successfully",
      scheduledFor: scheduledFor.toISOString(),
      confirmationToken,
    })
  } catch (error) {
    console.error("[API] Error requesting account deletion:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Cancel account deletion
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find pending deletion request
    const { data: deletionRequest } = await supabase
      .from("account_deletion_requests")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["pending", "confirmed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!deletionRequest) {
      return NextResponse.json(
        { error: "No pending account deletion request found" },
        { status: 404 }
      )
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from("account_deletion_requests")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", deletionRequest.id)

    if (updateError) {
      throw updateError
    }

    // Log cancellation
    await supabase.from("privacy_logs").insert({
      user_id: user.id,
      action: "account_deletion_cancelled",
      details: {
        request_id: deletionRequest.id,
        was_scheduled_for: deletionRequest.scheduled_for,
      },
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    })

    // TODO: Send cancellation confirmation email

    return NextResponse.json({
      success: true,
      message: "Account deletion cancelled successfully",
    })
  } catch (error) {
    console.error("[API] Error cancelling account deletion:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
