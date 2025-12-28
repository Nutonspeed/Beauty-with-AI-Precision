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

    const { data: analysis, error } = await supabase
      .from("skin_analyses")
      .select(`
        id,
        user_id,
        image_url,
        thumbnail_url,
        concerns,
        heatmap_data,
        metrics,
        ai_version,
        created_at,
        updated_at,
        analysis_data
      `)
      .eq("id", id)
      .single()

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

export const PATCH = withAuthContext(
  async (request: NextRequest, user, context: { params: Promise<{ id: string }> }) => {
    try {
      const supabase = await createServerClient()
      const { id } = await context.params

      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
      const hasNotes = Object.prototype.hasOwnProperty.call(body, "notes")
      const hasRecommendations = Object.prototype.hasOwnProperty.call(body, "recommendations")

      if (!hasNotes && !hasRecommendations) {
        return NextResponse.json<ApiError>(
          {
            success: false,
            error: "Missing fields to update",
            code: "VALIDATION_ERROR",
          },
          { status: 400 },
        )
      }

      if (hasNotes && body.notes !== null && typeof body.notes !== "string") {
        return NextResponse.json<ApiError>(
          {
            success: false,
            error: "Invalid notes",
            code: "VALIDATION_ERROR",
          },
          { status: 400 },
        )
      }

      if (
        hasRecommendations &&
        body.recommendations !== null &&
        !(Array.isArray(body.recommendations) && body.recommendations.every((v) => typeof v === "string"))
      ) {
        return NextResponse.json<ApiError>(
          {
            success: false,
            error: "Invalid recommendations",
            code: "VALIDATION_ERROR",
          },
          { status: 400 },
        )
      }

      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (hasNotes) {
        updatePayload.notes = body.notes
      }

      if (hasRecommendations) {
        updatePayload.recommendations = body.recommendations
      }

      const { data: analysis, error } = await supabase
        .from("skin_analyses")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id")
        .single()

      if (error || !analysis) {
        return NextResponse.json<ApiError>(
          {
            success: false,
            error: error?.message || "Failed to update analysis",
            code: "DATABASE_ERROR",
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            id: analysis.id,
          },
        },
        { status: 200 },
      )
    } catch (error) {
      return NextResponse.json<ApiError>(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          code: "INTERNAL_ERROR",
        },
        { status: 500 },
      )
    }
  },
  { rateLimitCategory: "api" },
)
