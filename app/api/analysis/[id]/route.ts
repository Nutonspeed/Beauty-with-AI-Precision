import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { GetAnalysisResponse, ApiError } from "@/types/api"
import type { SkinConcern } from "@/lib/ai/tensorflow-analyzer"
import { withAuthContext } from "@/lib/auth/middleware"

/**
 * GET /api/analysis/[id]
 * Get specific analysis by ID
 */
export const GET = withAuthContext(
  async (request: NextRequest, user, context: { params: Promise<{ id: string }> }) => {
    // delegate to existing implementation by inlining the logic above
    const supabase = await createServerClient()
    const { id } = await context.params

    const { data: analysis, error } = await supabase.from("skin_analyses").select("*").eq("id", id).single()

    if (error || !analysis) {
      return NextResponse.json<ApiError>(
        { success: false, error: "Analysis not found", code: "NOT_FOUND" },
        { status: 404 },
      )
    }

    if (analysis.user_id !== user.id && user.role !== "super_admin") {
      return NextResponse.json<ApiError>({ success: false, error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    const response: GetAnalysisResponse = {
      id: analysis.id,
      imageUrl: analysis.image_url,
      thumbnailUrl: analysis.thumbnail_url || undefined,
      concerns: analysis.concerns as unknown as SkinConcern[],
      heatmapData: analysis.heatmap_data as Record<string, unknown> | undefined,
      metrics: analysis.metrics as unknown as {
        totalTime: number
        inferenceTime: number
        detectionCount: number
      },
      aiVersion: analysis.ai_version,
      createdAt: analysis.created_at,
    }

    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 },
    )
  },
  { rateLimitCategory: 'api' },
)
