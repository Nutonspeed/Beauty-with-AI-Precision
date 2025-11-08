import { type NextRequest, NextResponse } from "next/server"
import { MultiAngleAnalyzer } from "@/lib/ai/multi-angle-analyzer"

export async function POST(request: NextRequest) {
  try {
    const { views } = await request.json()

    if (!views || views.length !== 3) {
      return NextResponse.json({ error: "Exactly 3 views required (front, left, right)" }, { status: 400 })
    }

    console.log("[v0] Processing multi-angle analysis...")

    const imageDataArray = await Promise.all(
      views.map(async (view: { angle: string; image: string }) => {
        const img = await loadImage(view.image)
        return { angle: view.angle, data: getImageData(img) }
      }),
    )

    const frontView = imageDataArray.find((v) => v.angle === "front")?.data
    const leftView = imageDataArray.find((v) => v.angle === "left")?.data
    const rightView = imageDataArray.find((v) => v.angle === "right")?.data

    if (!frontView || !leftView || !rightView) {
      return NextResponse.json({ error: "Missing required views" }, { status: 400 })
    }

    const analyzer = new MultiAngleAnalyzer()
    const result = analyzer.analyzeSkin(frontView, leftView, rightView)

    console.log("[v0] Multi-angle analysis complete:", result.combinedScore)

    // TODO: Save to database and return analysis ID
    const analysisId = `multi-${Date.now()}`

    return NextResponse.json({
      id: analysisId,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Multi-angle analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}

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
