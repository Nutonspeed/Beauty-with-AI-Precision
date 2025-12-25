import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getSubscriptionStatus } from "@/lib/subscriptions/check-subscription"
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

    const { data: userProfile, error: userProfileErr } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single()

    if (userProfileErr) {
      console.error('[analysis/save] Failed to fetch user profile:', userProfileErr)
      return NextResponse.json<ApiError>(
        { success: false, error: 'Failed to fetch user profile', code: 'INTERNAL_ERROR' },
        { status: 500 },
      )
    }

    if (userProfile?.clinic_id) {
      const subStatus = await getSubscriptionStatus(userProfile.clinic_id)
      if (!subStatus.isActive || subStatus.isTrialExpired) {
        const statusCode = subStatus.subscriptionStatus === 'past_due' || subStatus.isTrialExpired ? 402 : 403
        return NextResponse.json<ApiError>(
          {
            success: false,
            error: subStatus.message,
            code: 'SUBSCRIPTION_REQUIRED',
          },
          { status: statusCode },
        )
      }
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

    // 🔥 FIX CRITICAL BUG #4: Build treatment plan from recommendations
    const treatmentPlan = body.recommendations
      ?.filter(r => r.priority === 'high' || r.priority === 'medium')
      .map((r, i) => `${i + 1}. ${r.text}`)
      .join('\n\n') || body.aiTreatmentPlan || 'Continue current skincare routine. Schedule follow-up in 3 months.'

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

        // 🔥 FIX CRITICAL BUG #1: Map quality metrics to database columns
        quality_lighting: body.qualityMetrics?.lighting ?? null,
        quality_blur: body.qualityMetrics?.blur ?? null,
        quality_face_size: body.qualityMetrics?.faceSize ?? null,
        quality_overall: body.qualityMetrics?.overallQuality ?? null,

        // 🔥 FIX CRITICAL BUG #2: Save AI concerns array
        ai_concerns: body.aiConcerns || [],

        // 🔥 FIX CRITICAL BUG #4: Save AI treatment plan
        ai_treatment_plan: treatmentPlan,

        // 🔥 FIX CRITICAL BUG #3: Normalize all scores to 0-100 scale
        // HybridAnalyzer returns 0-1 for overall, 0-10 for individual metrics
        // Database expects all scores in 0-100 range for consistency
        overall_score: body.analysisScores?.overall 
          ? Math.round(body.analysisScores.overall * 100) // 0-1 → 0-100
          : null,
        spots_score: body.analysisScores?.spots 
          ? Math.round(body.analysisScores.spots * 10) // 0-10 → 0-100
          : null,
        wrinkles_score: body.analysisScores?.wrinkles 
          ? Math.round(body.analysisScores.wrinkles * 10) // 0-10 → 0-100
          : null,
        texture_score: body.analysisScores?.texture 
          ? Math.round(body.analysisScores.texture * 10) // 0-10 → 0-100
          : null,
        pores_score: body.analysisScores?.pores 
          ? Math.round(body.analysisScores.pores * 10) // 0-10 → 0-100
          : null,
        redness_score: body.analysisScores?.redness 
          ? Math.round(body.analysisScores.redness * 10) // 0-10 → 0-100
          : null,
        uv_spots_score: body.analysisScores?.uvSpots 
          ? Math.round(body.analysisScores.uvSpots * 10) // 0-10 → 0-100
          : null,
        brown_spots_score: body.analysisScores?.brownSpots 
          ? Math.round(body.analysisScores.brownSpots * 10) // 0-10 → 0-100
          : null,
        red_areas_score: body.analysisScores?.redAreas 
          ? Math.round(body.analysisScores.redAreas * 10) // 0-10 → 0-100
          : null,
        porphyrins_score: body.analysisScores?.porphyrins 
          ? Math.round(body.analysisScores.porphyrins * 10) // 0-10 → 0-100
          : null,

        // Save AI skin type
        ai_skin_type: body.aiSkinType ?? null,

        // Keep recommendations structured
        recommendations: body.recommendations || [],
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
