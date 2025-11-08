import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { GetAnalysisResponse, ApiError } from "@/types/api"
import type { SkinConcern } from "@/lib/ai/tensorflow-analyzer"

/**
 * GET /api/analysis/[id]
 * Get specific analysis by ID
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
  const { id } = await context.params

    // Fetch analysis
    const { data: analysis, error } = await supabase.from("skin_analyses").select("*").eq("id", id).single()

    if (error || !analysis) {
      return NextResponse.json<ApiError>(
        { success: false, error: "Analysis not found", code: "NOT_FOUND" },
        { status: 404 },
      )
    }

    const userRole = session.user.user_metadata?.role || "customer"

    // Check if user can access this analysis
    if (analysis.user_id !== session.user.id && userRole !== "super_admin") {
      return NextResponse.json<ApiError>({ success: false, error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
    }

    // Transform to response format
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
  } catch (error) {
    console.error("Error fetching analysis:", error)
    return NextResponse.json<ApiError>(
      {
        success: false,
        error: "Failed to fetch analysis",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
