import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { AnalysisHistoryItem, ApiError } from "@/types/api"
import type { SkinConcern } from "@/lib/ai/tensorflow-analyzer"

/**
 * GET /api/analysis/history/[userId]
 * Get analysis history for a user
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
      .select("id, image_url, thumbnail_url, concerns, created_at")
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
      const concerns = analysis.concerns as unknown as SkinConcern[]

      // Count concerns by type
      const concernCount = {
        wrinkle: 0,
        pigmentation: 0,
        pore: 0,
        redness: 0,
        acne: 0,
        dark_circle: 0,
      }

      for (const concern of concerns) {
        if (concern.type in concernCount) {
          concernCount[concern.type as keyof typeof concernCount]++
        }
      }

      return {
        id: analysis.id,
        imageUrl: analysis.image_url,
        thumbnailUrl: analysis.thumbnail_url || undefined,
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
