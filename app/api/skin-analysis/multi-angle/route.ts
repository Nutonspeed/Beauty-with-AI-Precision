import { type NextRequest, NextResponse } from "next/server"
import { MultiAngleAnalyzer } from "@/lib/ai/multi-angle-analyzer"
import { saveAnalysisWithStorage } from "@/lib/api/analysis-storage"
import { createServerClient } from "@/lib/supabase/server"
import { withPublicAccess } from "@/lib/auth/middleware"

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for AI processing + image upload

export const POST = withPublicAccess(async (request: NextRequest) => {
  try {
    const { views } = await request.json()

    if (views?.length !== 3) {
      return NextResponse.json({ error: "Exactly 3 views required (front, left, right)" }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("[MultiAngle] Processing multi-angle analysis for user:", user.id)

    // Process images for AI analysis
    const imageDataArray = await Promise.all(
      views.map(async (view: { angle: string; image: string }) => {
        const img = await loadImage(view.image)
        return { angle: view.angle, data: getImageData(img), dataUrl: view.image }
      }),
    )

    const frontView = imageDataArray.find((v) => v.angle === "front")
    const leftView = imageDataArray.find((v) => v.angle === "left")
    const rightView = imageDataArray.find((v) => v.angle === "right")

    if (!frontView || !leftView || !rightView) {
      return NextResponse.json({ error: "Missing required views" }, { status: 400 })
    }

    // Run AI analysis on ORIGINAL full-resolution images (100% accuracy)
    console.log("[MultiAngle] Running AI analysis on full-resolution images...")
    const analyzer = new MultiAngleAnalyzer()
    const result = analyzer.analyzeSkin(frontView.data, leftView.data, rightView.data)

    console.log("[MultiAngle] AI analysis complete:", result.combinedScore)

    // Save analysis with multi-tier storage
    // Original tier = for re-analysis (full accuracy)
    // Display tier = for results page (fast loading)
    // Thumbnail tier = for history list (instant loading)
    console.log("[MultiAngle] Saving analysis with multi-tier storage...")
    
    const storageResult = await saveAnalysisWithStorage(
      user.id,
      {
        front: frontView.dataUrl,
        left: leftView.dataUrl,
        right: rightView.dataUrl,
      },
      result,
      {
        analysisType: 'multi-angle',
        metadata: {
          views: ['front', 'left', 'right'],
          timestamp: new Date().toISOString(),
        },
      }
    )

    console.log("[MultiAngle] Analysis saved successfully:", storageResult.id)
    console.log("[MultiAngle] Storage optimization:", {
      front: Object.keys(storageResult.imageUrls.front || {}).length + ' tiers',
      left: Object.keys(storageResult.imageUrls.left || {}).length + ' tiers',
      right: Object.keys(storageResult.imageUrls.right || {}).length + ' tiers',
    })

    return NextResponse.json({
      id: storageResult.id,
      result,
      imageUrls: {
        // Return display URLs for immediate viewing
        front: storageResult.imageUrls.front?.display,
        left: storageResult.imageUrls.left?.display,
        right: storageResult.imageUrls.right?.display,
      },
      timestamp: storageResult.createdAt,
    })
  } catch (error) {
    console.error("[MultiAngle] Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}, { rateLimitCategory: 'ai' })

// Helper functions
async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

function getImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement("canvas")
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(img, 0, 0)
  return ctx.getImageData(0, 0, img.width, img.height)
}
