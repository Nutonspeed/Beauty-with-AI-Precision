import { createClient as createServerClient } from "@/lib/supabase/server"
import type { VISIAEquivalentResult } from "@/lib/ai/phase2/visia-equivalent-pipeline"

export interface SaveEnhancedAnalysisParams {
  analysisId: string // Reference to base skin_analyses record
  clinicId: string
  customerId: string
  enhancedResult: VISIAEquivalentResult
  tier: "free" | "premium" | "clinical"
  processingTimeMs: number
}

export interface EnhancedAnalysisRecord {
  id: string
  analysis_id: string
  clinic_id: string
  customer_id: string

  // Phase 2A: Lighting Simulation
  uv_simulation: any
  polarized_simulation: any
  rbx_decomposition: any

  // Phase 2B: Depth Estimation
  depth_map: any
  wrinkle_depth_metrics: any
  firmness_score: number
  volume_metrics: any

  // Phase 2C-2D (future)
  dermatology_model_version: string | null
  specialized_metrics: any | null
  sensor_data: any | null
  calibration_data: any | null

  // Accuracy tracking
  confidence_scores: any
  accuracy_tier: string
  estimated_accuracy: number

  processing_time_ms: number
  ai_model_versions: any

  created_at: string
  updated_at: string
}

/**
 * Save enhanced Phase 2 analysis results to Supabase
 */
export async function saveEnhancedAnalysis(
  params: SaveEnhancedAnalysisParams,
): Promise<{ success: boolean; analysisId?: string; error?: string }> {
  try {
    const supabase = await createServerClient()

    const { analysisId, clinicId, customerId, enhancedResult, tier, processingTimeMs } = params

    const analysisData = {
      analysis_id: analysisId,
      clinic_id: clinicId,
      customer_id: customerId,

      // Phase 2A: Lighting Simulation Results
      uv_simulation: enhancedResult.lightingSimulation?.images.uv || null,
      polarized_simulation: enhancedResult.lightingSimulation?.images.polarized || null,
      rbx_decomposition: enhancedResult.lightingSimulation?.images.red && enhancedResult.lightingSimulation?.images.brown
        ? { red: enhancedResult.lightingSimulation.images.red, brown: enhancedResult.lightingSimulation.images.brown }
        : null,

      // Phase 2B: Depth Estimation Results
      depth_map: enhancedResult.depth3DMetrics || null,
      wrinkle_depth_metrics: enhancedResult.depth3DMetrics ? {
        averageDepth: enhancedResult.depth3DMetrics.wrinkleDepth,
        count: enhancedResult.depth3DMetrics.wrinkleCount
      } : null,
      firmness_score: enhancedResult.depth3DMetrics?.firmness || 0,
      volume_metrics: enhancedResult.depth3DMetrics ? {
        faceVolume: enhancedResult.depth3DMetrics.faceVolume,
        skinSagging: enhancedResult.depth3DMetrics.skinSagging
      } : null,

      // Phase 2C-2D (future implementation)
      dermatology_model_version: null,
      specialized_metrics: null,
      sensor_data: null,
      calibration_data: null,

      // Accuracy tracking
      confidence_scores: enhancedResult.confidenceScores || enhancedResult.accuracyEstimate?.perMetric || null,
      accuracy_tier: tier,
      estimated_accuracy: enhancedResult.overallAccuracy || enhancedResult.accuracyEstimate?.overall || 0,

      // Processing metadata
      processing_time_ms: processingTimeMs,
      ai_model_versions: {
        lighting_simulator: "v1.0",
        depth_estimator: "v1.0",
        visia_pipeline: "v2.0",
      },
    }

    const { data, error } = await supabase.from("enhanced_skin_analyses").insert(analysisData).select("id").single()

    if (error) {
      console.error("[v0] Error saving enhanced analysis:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] Enhanced analysis saved successfully:", data.id)
    return { success: true, analysisId: data.id }
  } catch (error) {
    console.error("[v0] Exception saving enhanced analysis:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get enhanced analysis by ID
 */
export async function getEnhancedAnalysis(
  analysisId: string,
): Promise<{ success: boolean; data?: EnhancedAnalysisRecord; error?: string }> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("enhanced_skin_analyses").select("*").eq("id", analysisId).single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as EnhancedAnalysisRecord }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get customer's enhanced analysis history
 */
export async function getCustomerEnhancedAnalyses(
  customerId: string,
  limit = 10,
): Promise<{ success: boolean; data?: EnhancedAnalysisRecord[]; error?: string }> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("enhanced_skin_analyses")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as EnhancedAnalysisRecord[] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Log accuracy metrics for Phase tracking
 */
export async function logAccuracyMetrics(params: {
  clinicId: string
  phase: "baseline" | "2a" | "2b" | "2c" | "2d"
  averageAccuracy: number
  sampleSize: number
  avgProcessingTimeMs: number
  successRate: number
  periodStart: Date
  periodEnd: Date
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("analysis_accuracy_logs").insert({
      clinic_id: params.clinicId,
      phase: params.phase,
      average_accuracy: params.averageAccuracy,
      sample_size: params.sampleSize,
      avg_processing_time_ms: params.avgProcessingTimeMs,
      success_rate: params.successRate,
      period_start: params.periodStart.toISOString(),
      period_end: params.periodEnd.toISOString(),
    })

    if (error) {
      console.error("[v0] Error logging accuracy metrics:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Collect training data for future ML improvements
 */
export async function collectTrainingData(params: {
  enhancedAnalysisId: string
  expertReview: any
  expertReviewerId: string
  aiVsExpertDiff: any
  accuracyScore: number
  correctionNotes?: string
  flagForRetraining?: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("training_data_collection").insert({
      enhanced_analysis_id: params.enhancedAnalysisId,
      expert_review: params.expertReview,
      expert_reviewer_id: params.expertReviewerId,
      review_date: new Date().toISOString(),
      ai_vs_expert_diff: params.aiVsExpertDiff,
      accuracy_score: params.accuracyScore,
      correction_notes: params.correctionNotes || null,
      flagged_for_retraining: params.flagForRetraining || false,
    })

    if (error) {
      console.error("[v0] Error collecting training data:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
