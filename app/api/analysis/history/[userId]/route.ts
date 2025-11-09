import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { AnalysisHistoryItem, ApiError } from "@/types/api"
import type { SkinConcern } from "@/lib/ai/tensorflow-analyzer"

/**
 * GET /api/analysis/history/[userId]
 * Get analysis history for a user
 * Updated to use correct schema (ai_concerns, *_count fields)
 */
export async function GET(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
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

    // Await params in Next.js 16
  const { userId } = await context.params

    const userRole = session.user.user_metadata?.role || "customer"

    // Check if user can access this data
    if (session.user.id !== userId && userRole !== "super_admin") {
      return NextResponse.json<ApiError>({ success: false, error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Fetch analysis history
    const { data: analyses, error } = await supabase
      .from("skin_analyses")
      .select("id, image_url, ai_concerns, spots_count, pores_count, wrinkles_count, redness_count, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(error.message)
    }

    // Get total count
    const { count } = await supabase
      .from("skin_analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    // Transform to response format
    const history: AnalysisHistoryItem[] = (analyses || []).map((analysis) => {
      // Convert ai_concerns array to SkinConcern format
      const aiConcerns = (analysis.ai_concerns || []) as string[]
      const concerns: SkinConcern[] = aiConcerns.map((type) => ({
        type: type as SkinConcern['type'],
        severity: 50, // Default severity (0-100) since we don't store individual severities
        confidence: 0.8, // Default confidence
        locations: [], // Empty locations array
      }))

      // Count concerns by type using CV counts from database
      const concernCount = {
        wrinkle: analysis.wrinkles_count || 0,
        pigmentation: analysis.spots_count || 0, // Map spots to pigmentation
        pore: analysis.pores_count || 0,
        redness: analysis.redness_count || 0,
        acne: 0, // Not tracked in current schema
        dark_circle: 0, // Not tracked in current schema
      }

      return {
        id: analysis.id,
        imageUrl: analysis.image_url,
        thumbnailUrl: undefined, // Not stored in current schema
        concerns,
        createdAt: analysis.created_at,
        concernCount,
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: history,
        pagination: {
          total: count || 0,
          limit,
          offset,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching analysis history:", error)
    return NextResponse.json<ApiError>(
      {
        success: false,
        error: "Failed to fetch analysis history",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
