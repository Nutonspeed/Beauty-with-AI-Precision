import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { GetProfileResponse, UpdateProfileRequest, UserProfileData, ApiError } from "@/types/api"

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json<ApiError>(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      )
    }

    // Fetch or create profile
    let { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single()

    // Create default profile if doesn't exist
    if (error && error.code === "PGRST116") {
      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: session.user.id,
          primary_concerns: [],
          preferences: {},
        })
        .select()
        .single()

      if (createError) {
        throw new Error(createError instanceof Error ? createError.message : 'Unknown error')
      }
      profile = newProfile
    } else if (error) {
      throw new Error(error instanceof Error ? error.message : 'Unknown error')
    }

    if (!profile) {
      throw new Error("Failed to fetch or create profile")
    }

    // Get analysis count
    const { count: analysisCount } = await supabase
      .from("skin_analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)

    // Get last analysis date
    const { data: lastAnalysisData } = await supabase
      .from("skin_analyses")
      .select("created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    const profileData: UserProfileData = {
      id: profile.id,
      skinType: profile.skin_type || undefined,
      primaryConcerns: (profile.primary_concerns as string[]) || [],
      allergies: profile.allergies || undefined,
      preferences:
        (profile.preferences as {
          language?: string
          notifications?: boolean
          theme?: "light" | "dark" | "system"
        }) || {},
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }

    const response: GetProfileResponse = {
      success: true,
      profile: profileData,
      analysisCount: analysisCount || 0,
      lastAnalysis: lastAnalysisData?.created_at,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json<ApiError>(
      {
        success: false,
        error: "Failed to fetch profile",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/user/profile
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json<ApiError>(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      )
    }

    // Parse request body
    const body = (await request.json()) as UpdateProfileRequest

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (body.skinType !== undefined) updateData.skin_type = body.skinType
    if (body.primaryConcerns !== undefined) updateData.primary_concerns = body.primaryConcerns
    if (body.allergies !== undefined) updateData.allergies = body.allergies
    if (body.preferences !== undefined) updateData.preferences = body.preferences

    // Update profile (upsert if doesn't exist)
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: session.user.id,
          ...updateData,
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single()

    if (error || !profile) {
      throw new Error(error?.message || "Failed to update profile")
    }

    const profileData: UserProfileData = {
      id: profile.id,
      skinType: profile.skin_type || undefined,
      primaryConcerns: (profile.primary_concerns as string[]) || [],
      allergies: profile.allergies || undefined,
      preferences:
        (profile.preferences as {
          language?: string
          notifications?: boolean
          theme?: "light" | "dark" | "system"
        }) || {},
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }

    return NextResponse.json(
      {
        success: true,
        data: profileData,
        message: "Profile updated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json<ApiError>(
      {
        success: false,
        error: "Failed to update profile",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
