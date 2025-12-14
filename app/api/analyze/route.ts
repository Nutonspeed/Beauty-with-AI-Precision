import { type NextRequest, NextResponse } from "next/server"
import { analyzeWithFallback } from "@/lib/ai/multi-model-analyzer"
import type { SkinAnalysisPrompt } from "@/lib/ai/gateway-client"
import {
  mapBrowserResultToAnalysis,
  mapCloudEnsembleToAnalysis,
} from "@/lib/ai/analysis-mapper"
import { withAuth } from "@/lib/auth/middleware"

// Accept pre-analyzed results from browser AI processing
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const contentType = request.headers.get("content-type")

    // Option 1: Accept pre-analyzed results from browser AI processing (existing flow)
    if (contentType?.includes("application/json")) {
      const body = await request.json()
      const { result, tier = "free" } = body

      if (!result) {
        return NextResponse.json({ error: "No analysis result provided" }, { status: 400 })
      }

      // Validate result has required fields
      if (!result.faceDetection || !result.skinAnalysis) {
        return NextResponse.json({ error: "Invalid analysis result format" }, { status: 400 })
      }

      console.log(`💾 Saving AI analysis for user ${user.id} (tier: ${tier}, time: ${result.totalProcessingTime.toFixed(0)}ms)...`)

      // Convert AI results to our analysis format (browser path)
      const analysis = mapBrowserResultToAnalysis(result, tier)

      return NextResponse.json({
        success: true,
        analysis,
        tier,
        timestamp: new Date().toISOString(),
      })
    }

    // Option 2: Server-side analysis using cloud ensemble (server-safe)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData()
      const imageFile = formData.get("image") as File
      const tier = (formData.get("tier") as "free" | "premium" | "clinical") || "free"

      if (!imageFile) {
        return NextResponse.json({ error: "No image file provided" }, { status: 400 })
      }

      console.log(`🚀 Starting server-side ${tier} analysis (cloud ensemble)...`)

      // Convert uploaded file (Blob) to base64 data URL (server-safe)
      const arrayBuffer = await imageFile.arrayBuffer()
      // Default to provided MIME type or jpeg
      const mime = (imageFile as any).type || "image/jpeg"
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      const imageBase64 = `data:${mime};base64,${base64}`

      // Pick analysis type by tier
      let analysisType: SkinAnalysisPrompt["analysisType"]
      if (tier === "clinical") {
        analysisType = "medical"
      } else if (tier === "premium") {
        analysisType = "detailed"
      } else {
        analysisType = "quick"
      }

      const prompt: SkinAnalysisPrompt = {
        imageBase64,
        language: "th",
        analysisType,
      }

      // Run cloud AI ensemble with fallback
      const cloud = await analyzeWithFallback(prompt)

      console.log(
        `✅ Cloud ensemble complete: ${cloud.totalProcessingTime.toFixed(0)}ms; models: ${cloud.modelsUsed.join(", ")}`,
      )

      // Convert cloud AI result to analysis format (server path)
      const analysis = mapCloudEnsembleToAnalysis(cloud, tier)

      return NextResponse.json({
        success: true,
        analysis,
        tier,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { error: "Invalid content type. Use application/json or multipart/form-data" },
      { status: 400 },
    )
  } catch (error) {
    console.error("Analysis Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze image", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}, { rateLimitCategory: 'ai' });
