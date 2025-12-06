import { type NextRequest, NextResponse } from "next/server"
import { analyzeWithVISIAEquivalent } from "@/lib/ai/phase2/visia-equivalent-pipeline"
import { randomUUID } from "crypto"
import { withClinicAuth } from "@/lib/auth/middleware"

export const POST = withClinicAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File
    const userId = formData.get("userId") as string
    const tier = (formData.get("tier") as "clinical") || "clinical"

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required for clinical analysis" }, { status: 400 })
    }

    // Generate unique analysis ID
    const analysisId = `ana_${randomUUID().replace(/-/g, '').slice(0, 16)}`

    console.log(`[v0] 🚀 Starting Phase 2 Clinical analysis for user ${userId} (${analysisId})...`)

    // Run VISIA-equivalent analysis
    const startTime = Date.now()
    const result = await analyzeWithVISIAEquivalent(imageFile)
    const processingTime = Date.now() - startTime

    console.log(`[v0] ✅ Phase 2 analysis complete: ${processingTime}ms, accuracy: ${result.accuracyEstimate.overall}%`)

    // Convert to API response format
    const response = {
      success: true,
      analysisId,
      tier: "clinical",
      accuracy: result.accuracyEstimate.overall,
      processingTime,

      // Enhanced metrics
      enhancedMetrics: result.accuracyEstimate.perMetric,
      confidenceScores: result.accuracyEstimate.perMetric,

      // Phase 2A: Lighting simulation
      lightingSimulation: result.lightingSimulation
        ? {
            images: {
              uv: result.lightingSimulation.images.uv ? "data:image/png;base64," + Buffer.from(result.lightingSimulation.images.uv.data as unknown as Uint8Array).toString('base64') : null,
              polarized: result.lightingSimulation.images.polarized ? "data:image/png;base64," + Buffer.from(result.lightingSimulation.images.polarized.data as unknown as Uint8Array).toString('base64') : null,
              red: result.lightingSimulation.images.red ? "data:image/png;base64," + Buffer.from(result.lightingSimulation.images.red.data as unknown as Uint8Array).toString('base64') : null,
              brown: result.lightingSimulation.images.brown ? "data:image/png;base64," + Buffer.from(result.lightingSimulation.images.brown.data as unknown as Uint8Array).toString('base64') : null,
            },
            confidence: result.lightingSimulation.confidence,
            processingTime: result.lightingSimulation.processingTime,
          }
        : null,

      // Phase 2B: Depth estimation
      depthEstimation: result.depth3DMetrics
        ? {
            wrinkleDepth: result.depth3DMetrics.wrinkleDepth,
            wrinkleCount: result.depth3DMetrics.wrinkleCount,
            skinSagging: result.depth3DMetrics.skinSagging,
            faceVolume: result.depth3DMetrics.faceVolume,
            firmness: result.depth3DMetrics.firmness,
          }
        : null,

      // Base analysis (for backward compatibility)
      baseAnalysis: result,

      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] ❌ Enhanced Analysis Error:", error)
    return NextResponse.json(
      {
        error: "Failed to perform enhanced analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
})
