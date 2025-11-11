/**
 * Data Export API
 * POST /api/privacy/export-data
 * 
 * Request user data export (GDPR compliance)
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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

    // Check if there's already a pending or processing request
    const { data: existingRequest } = await supabase
      .from("data_export_requests")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { error: "Data export request already in progress" },
        { status: 409 }
      )
    }

    // Create new data export request
    const { data: exportRequest, error: insertError } = await supabase
      .from("data_export_requests")
      .insert({
        user_id: user.id,
        status: "pending",
        requested_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Log data export request
    await supabase.from("privacy_logs").insert({
      user_id: user.id,
      action: "data_export_requested",
      details: {
        request_id: exportRequest.id,
      },
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    })

    // TODO: Trigger background job to generate data export
    // This should be handled by a separate worker/cron job
    // For now, we'll just create the request

    return NextResponse.json({
      success: true,
      message: "Data export request submitted successfully",
      status: "pending",
      requestId: exportRequest.id,
    })
  } catch (error) {
    console.error("[API] Error requesting data export:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
