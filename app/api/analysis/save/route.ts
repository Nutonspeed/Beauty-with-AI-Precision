import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { SaveAnalysisRequest, SaveAnalysisResponse, ApiError } from "@/types/api"

/**
 * POST /api/analysis/save
 * Save skin analysis results to database
 */
export async function POST(request: NextRequest) {
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
    const body = (await request.json()) as SaveAnalysisRequest

    // Validate required fields
    if (!body.imageUrl || !body.concerns || !Array.isArray(body.concerns)) {
      return NextResponse.json<ApiError>(
        {
          success: false,
          error: "Missing required fields: imageUrl, concerns",
          code: "VALIDATION_ERROR",
        },
        { status: 400 },
      )
    }

    // Create analysis record
    const { data: analysis, error } = await supabase
      .from("skin_analyses")
      .insert({
        user_id: session.user.id,
        image_url: body.imageUrl,
        thumbnail_url: body.thumbnailUrl || null,
        concerns: body.concerns,
        heatmap_data: body.heatmapData || null,
        metrics: body.metrics,
        ai_version: body.aiVersion || "v1.0.0",
        patient_info: body.patientInfo || null,
        appointment_id: body.appointmentId || null,
        treatment_plan_id: body.treatmentPlanId || null,
      })
      .select()
      .single()

    if (error || !analysis) {
      throw new Error(error?.message || "Failed to create analysis")
    }

    return NextResponse.json<SaveAnalysisResponse>(
      {
        success: true,
        analysisId: analysis.id,
        message: "Analysis saved successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error saving analysis:", error)
    return NextResponse.json<ApiError>(
      {
        success: false,
        error: "Failed to save analysis",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
