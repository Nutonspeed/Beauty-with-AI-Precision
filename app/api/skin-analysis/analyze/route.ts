/**
 * POST /api/skin-analysis/analyze
 * Upload and analyze skin image with Hybrid AI system
 */

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeSkin } from "@/lib/ai/hybrid-skin-analyzer"
import type { AnalysisMode } from "@/types"
import { parseAnalysisMode } from "@/types"

export const runtime = "nodejs"
export const maxDuration = 60 // 60 seconds timeout

interface AnalyzeRequest {
  image: string // base64 encoded image
  userId?: string
  mode?: AnalysisMode
  patientInfo?: {
    name?: string
    age?: number
    gender?: string
    skinType?: string
  }
  notes?: string
  // Phase 1: Image quality metrics
  qualityMetrics?: {
    lighting: number
    blur: number
    faceSize: number
    overallQuality: number
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 🚀 === ANALYSIS API STARTED ===")

    // Parse request body
    const body: AnalyzeRequest = await request.json()
    console.log("[v0] 📦 Request body parsed successfully")

    if (!body.image) {
      console.log("[v0] ❌ No image provided in request")
      return NextResponse.json({ error: "Image is required", success: false }, { status: 400 })
    }

    // Get authenticated user (optional for demo/testing)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Use demo user ID if not authenticated (for testing)
    const userId = user?.id || "demo-user-" + Date.now()
    console.log("[v0] 👤 User ID:", userId)

    // Decode base64 image
    console.log("[v0] 🖼️ Decoding base64 image...")
    const base64Data = body.image.replace(/^data:image\/\w+;base64,/, "")
    const imageBuffer = Buffer.from(base64Data, "base64")
    console.log("[v0] ✅ Image decoded, size:", imageBuffer.length, "bytes")

    // Validate and process image
    console.log("[v0] 🔍 Processing image...")
    const processedImage = await processImage(imageBuffer)
    console.log("[v0] ✅ Image processed successfully")

    const envMode = parseAnalysisMode(process.env.ANALYSIS_MODE, "auto")
    const requestMode = parseAnalysisMode(body.mode, envMode)

    // Run hybrid analysis
    console.log("[v0] 🤖 Starting hybrid skin analysis...")
    const startTime = Date.now()

    const analysis = await analyzeSkin(processedImage, {
      mode: requestMode,
      qualityMetrics: body.qualityMetrics, // Phase 1: Pass quality metrics to analyzer
    })

    const analysisTime = Date.now() - startTime
    console.log(`[v0] ✅ Analysis completed in ${analysisTime}ms`)

    // Upload image to Supabase Storage
    console.log("[v0] 📤 Uploading image to storage...")
    const imageUrl = await uploadImage(supabase, userId, imageBuffer)
    console.log("[v0] ✅ Image uploaded:", imageUrl)

    // Save analysis to database
    console.log("[v0] 💾 Saving analysis to database...")
    const { data: savedAnalysis, error: dbError } = await supabase
      .from("skin_analyses")
      .insert({
        user_id: userId,
        image_url: imageUrl,
        overall_score: Math.round(
          ((analysis.overallScore?.spots || 0) +
            (analysis.overallScore?.pores || 0) +
            (analysis.overallScore?.wrinkles || 0) +
            (analysis.overallScore?.texture || 0) +
            (analysis.overallScore?.redness || 0)) /
            5,
        ),
        confidence: Math.round((analysis.ai?.confidence || 0.85) * 100), // Convert to percentage (0-100)

        // CV Analysis - spots (ensure 1-10 range)
        spots_severity: Math.max(1, Math.min(10, Math.round(analysis.overallScore?.spots || 5))),
        spots_count: analysis.cv?.spots?.count || 0,
        spots_percentile: Math.max(0, Math.min(100, analysis.percentiles?.spots || 50)),

        // CV Analysis - pores (ensure 1-10 range)
        pores_severity: Math.max(1, Math.min(10, Math.round(analysis.overallScore?.pores || 5))),
        pores_count: analysis.cv?.pores?.enlargedCount || 0,
        pores_percentile: Math.max(0, Math.min(100, analysis.percentiles?.pores || 50)),

        // CV Analysis - wrinkles (ensure 1-10 range)
        wrinkles_severity: Math.max(1, Math.min(10, Math.round(analysis.overallScore?.wrinkles || 5))),
        wrinkles_count: analysis.cv?.wrinkles?.count || 0,
        wrinkles_percentile: Math.max(0, Math.min(100, analysis.percentiles?.wrinkles || 50)),

        // CV Analysis - texture (ensure 1-10 range)
        texture_severity: Math.max(1, Math.min(10, Math.round(analysis.overallScore?.texture || 5))),
        texture_percentile: Math.max(0, Math.min(100, analysis.percentiles?.texture || 50)),

        // CV Analysis - redness (ensure 1-10 range)
        redness_severity: Math.max(1, Math.min(10, Math.round(analysis.overallScore?.redness || 5))),
        redness_count: analysis.cv?.redness?.areas?.length || 0,
        redness_percentile: Math.max(0, Math.min(100, analysis.percentiles?.redness || 50)),

        // Overall percentile (average)
        overall_percentile: Math.round(
          ((analysis.percentiles?.spots || 50) +
            (analysis.percentiles?.pores || 50) +
            (analysis.percentiles?.wrinkles || 50) +
            (analysis.percentiles?.texture || 50) +
            (analysis.percentiles?.redness || 50)) /
            5,
        ),

        // AI Analysis
        ai_skin_type: analysis.ai?.skinType || "normal",
        ai_concerns: analysis.ai?.concerns || [],
        ai_severity: (analysis.ai?.severity as Record<string, number>) || {},
        ai_treatment_plan: analysis.ai?.treatmentPlan || "No treatment plan available",

        // Recommendations (convert to JSON)
        recommendations: (analysis.ai?.recommendations as any) || [],

        // Metadata
        patient_name: body.patientInfo?.name,
        patient_age: body.patientInfo?.age,
        patient_gender: body.patientInfo?.gender,
        patient_skin_type: body.patientInfo?.skinType,
        notes: body.notes,
        analysis_time_ms: analysisTime,

        // Phase 1: Quality Metrics
        quality_lighting: body.qualityMetrics?.lighting,
        quality_blur: body.qualityMetrics?.blur,
        quality_face_size: body.qualityMetrics?.faceSize,
        quality_overall: body.qualityMetrics?.overallQuality,
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] ❌ Database error:", dbError)
      throw new Error("Failed to save analysis: " + dbError.message)
    }

    console.log("[v0] ✅ Analysis saved to database:", savedAnalysis.id)
    console.log("[v0] 🎉 === ANALYSIS COMPLETE ===")

    // Return complete analysis with database ID
    return NextResponse.json({
      success: true,
      ...analysis,
      id: savedAnalysis.id, // Override with database ID
      imageUrl: savedAnalysis.image_url, // Override with storage URL
      overall_score: savedAnalysis.overall_score,
      timestamp: savedAnalysis.created_at,
      analysisTime,
    })
  } catch (error) {
    console.error("[v0] ❌ === ANALYSIS ERROR ===")
    console.error("[v0] ❌ Error:", error)
    console.error("[v0] ❌ Stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        success: false,
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    )
  }
}

/**
 * Process and validate image
 */
async function processImage(buffer: Buffer): Promise<Buffer> {
  try {
    // TEMPORARY FIX: Skip sharp processing in development
    // Sharp has issues with dynamic import in Next.js 16 + Turbopack
    if (process.env.NODE_ENV === 'development') {
      console.log('[processImage] Skipping sharp processing in development mode')
      return buffer
    }

    // Dynamic import of sharp to avoid build-time errors
    const sharp = (await import("sharp")).default
    
    const metadata = await sharp(buffer).metadata()

    // Validate image
    if (!metadata.width || !metadata.height) {
      throw new Error("Invalid image")
    }

    if (metadata.width < 200 || metadata.height < 200) {
      throw new Error("Image too small (minimum 200x200)")
    }

    // Resize if too large (max 2048x2048)
    let processedBuffer = buffer
    if (metadata.width > 2048 || metadata.height > 2048) {
      processedBuffer = await sharp(buffer)
        .resize(2048, 2048, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 90 })
        .toBuffer()
    }

    return processedBuffer
  } catch (error) {
    console.error("Image processing error:", error)
    throw new Error("Failed to process image")
  }
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  imageBuffer: Buffer,
): Promise<string> {
  const timestamp = Date.now()
  const filename = `${userId}/${timestamp}.jpg`

  const { data, error } = await supabase.storage.from("skin-analysis-images").upload(filename, imageBuffer, {
    contentType: "image/jpeg",
    upsert: false,
  })

  if (error) {
    console.error("Upload error:", error)
    throw new Error("Failed to upload image")
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("skin-analysis-images").getPublicUrl(data.path)

  return publicUrl
}
