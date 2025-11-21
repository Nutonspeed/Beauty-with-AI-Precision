/**
 * Privacy Settings API
 * GET/PUT /api/privacy/settings
 * 
 * Manage user privacy settings and preferences
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET - Fetch user's privacy settings
export async function GET(request: NextRequest) {
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

    // Fetch privacy settings from database
    const { data: settings, error: settingsError } = await supabase
      .from("privacy_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (settingsError && settingsError.code !== "PGRST116") { // PGRST116 = not found
      throw settingsError
    }

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        emailPreferences: {
          weeklyDigest: true,
          progressReports: true,
          goalAchievements: true,
          reEngagement: false,
          bookingReminders: true,
          analysisComplete: true,
          marketingEmails: false,
          productUpdates: false,
        },
        privacySettings: {
          shareDataForResearch: false,
          shareAnonymousData: true,
          allowThirdPartyAnalytics: true,
        },
        dataExport: {
          requested: false,
          status: null,
          downloadUrl: null,
        },
        accountDeletion: {
          requested: false,
          scheduledFor: null,
        },
      })
    }

    // Check for data export request
    const { data: exportRequest } = await supabase
      .from("data_export_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    // Check for account deletion request
    const { data: deletionRequest } = await supabase
      .from("account_deletion_requests")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["pending", "confirmed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      emailPreferences: settings.email_preferences || {},
      privacySettings: {
        shareDataForResearch: settings.share_data_for_research || false,
        shareAnonymousData: settings.share_anonymous_data !== false, // Default true
        allowThirdPartyAnalytics: settings.allow_third_party_analytics !== false, // Default true
      },
      dataExport: exportRequest
        ? {
            requested: true,
            status: exportRequest.status,
            downloadUrl: exportRequest.download_url,
          }
        : { requested: false, status: null, downloadUrl: null },
      accountDeletion: deletionRequest
        ? {
            requested: true,
            scheduledFor: deletionRequest.scheduled_for,
          }
        : { requested: false, scheduledFor: null },
    })
  } catch (error) {
    console.error("[API] Error fetching privacy settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update user's privacy settings
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { emailPreferences, privacySettings } = body

    // Validate input
    if (!emailPreferences && !privacySettings) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Upsert privacy settings
    const { data, error: upsertError } = await supabase
      .from("privacy_settings")
      .upsert(
        {
          user_id: user.id,
          email_preferences: emailPreferences,
          share_data_for_research: privacySettings?.shareDataForResearch,
          share_anonymous_data: privacySettings?.shareAnonymousData,
          allow_third_party_analytics: privacySettings?.allowThirdPartyAnalytics,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single()

    if (upsertError) {
      throw upsertError
    }

    // Log privacy update
    await supabase.from("privacy_logs").insert({
      user_id: user.id,
      action: "privacy_updated",
      details: {
        emailPreferences,
        privacySettings,
      },
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Privacy settings updated successfully",
    })
  } catch (error) {
    console.error("[API] Error updating privacy settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
