import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { AnalysisHistoryItem, ApiError } from "@/types/api"
import type { SkinConcern } from "@/lib/ai/tensorflow-analyzer"
import { withAuthContext } from "@/lib/auth/middleware"
import { getSkinAnalysesHistory } from "@/lib/api/skin-analyses-history"

/**
 * GET /api/analysis/history/[userId]
 * Get analysis history for a user
 * Updated to use correct schema (ai_concerns, *_count fields)
 */
export const GET = withAuthContext(
  async (request: NextRequest, user, context: { params: Promise<{ userId: string }> }) => {
    const supabase = await createServerClient()

    // Await params in Next.js 16
    const { userId } = await context.params

    // Check if user can access this data
    if (user.id !== userId && user.role !== "super_admin") {
      return NextResponse.json<ApiError>({ success: false, error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const { rows: analyses, total: count } = await getSkinAnalysesHistory(supabase, {
      userId,
      limit,
      offset,
      sortBy: "created_at",
      sortOrder: "desc",
    })

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
      {
        status: 200,
        headers: {
          Deprecation: 'true',
          'X-Deprecated': 'true',
          Link: '</api/analysis/history>; rel="successor-version"',
        },
      },
    )
  },
  { rateLimitCategory: 'api' },
)
