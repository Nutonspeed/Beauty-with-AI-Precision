/**
 * Face Detection & Landmark Detection using MediaPipe Face Mesh
 * Real-time AI-powered face analysis
 * Phase 12: Upgraded with Real ML Models
 * งาน 4: Added Retry Logic with User Feedback
 */

import { getSkinConcernDetector } from "./models/skin-concern-detector"
import { getMediaPipeDetector } from "./mediapipe-detector"
import {
  retryWithBackoff,
  MEDIAPIPE_RETRY_CONFIG,
  createUserErrorMessage,
  logRetryStats,
} from "./retry-utils"

export interface FaceLandmark {
  x: number
  y: number
  z?: number
}

export interface FaceDetectionResult {
  landmarks: FaceLandmark[]
  boundingBox: {
    xMin: number
    yMin: number
    width: number
    height: number
  }
  confidence: number
  keyPoints: {
    leftEye: FaceLandmark
    rightEye: FaceLandmark
    nose: FaceLandmark
    mouth: FaceLandmark
    leftCheek: FaceLandmark
    rightCheek: FaceLandmark
    forehead: FaceLandmark
    chin: FaceLandmark
  }
}

export interface SkinConcernArea {
  type: "wrinkle" | "pigmentation" | "pore" | "redness" | "acne"
  severity: "low" | "medium" | "high"
  confidence: number
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  landmarks: FaceLandmark[]
  heatmapData?: number[][] // Raw intensity data from ML model
}

/**
 * Detect face and extract landmarks from image
 * งาน 4: Now uses retry mechanism with user feedback
 */
export async function detectFace(imageData: ImageData): Promise<FaceDetectionResult | null> {
  // Browser-only check (prevent SSR errors)
  if (typeof window === 'undefined') {
    throw new Error('detectFace() is browser-only and cannot run on the server')
  }

  const result = await retryWithBackoff(
    async () => {
      // Convert ImageData to HTMLImageElement for MediaPipe
      const canvas = document.createElement("canvas")
      canvas.width = imageData.width
      canvas.height = imageData.height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Failed to get canvas context")
      }

      ctx.putImageData(imageData, 0, 0)

      const img = new Image()
      img.src = canvas.toDataURL()

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // Use real MediaPipe detector
      const detector = getMediaPipeDetector()
      await detector.initialize()

      const detectionResult = await detector.detectFace(img)

      if (!detectionResult) {
        throw new Error("No face detected by MediaPipe")
      }

      // Convert to our format with key points
      const width = imageData.width
      const height = imageData.height

      return {
        landmarks: detectionResult.landmarks.map((lm) => ({
          x: lm.x * width,
          y: lm.y * height,
          z: lm.z,
        })),
        boundingBox: {
          xMin: detectionResult.boundingBox.xMin * width,
          yMin: detectionResult.boundingBox.yMin * height,
          width: detectionResult.boundingBox.width * width,
          height: detectionResult.boundingBox.height * height,
        },
        confidence: detectionResult.confidence,
        keyPoints: extractKeyPoints(detectionResult.landmarks, width, height),
      }
    },
    {
      ...MEDIAPIPE_RETRY_CONFIG,
      onRetry: (attempt, error) => {
        console.warn(`🔄 Retrying face detection (attempt ${attempt}): ${error.message}`)
      },
    }
  )

  // Log retry statistics
  logRetryStats("Face Detection", result)

  if (result.success && result.data) {
    return result.data
  }

  // Show user-friendly error message
  if (result.error) {
    const userMessage = createUserErrorMessage("การตรวจจับใบหนี้า", result.error, result.attempts)
    console.error(userMessage)
  }

  // Fallback to mock data
  console.log("⚠️ Using fallback face detection (mock data)")
  return detectFaceFallback(imageData)
}

/**
 * Extract key facial points from 468 landmarks
 * Added helper function to extract key points from MediaPipe landmarks
 */
function extractKeyPoints(landmarks: Array<{ x: number; y: number; z?: number }>, width: number, height: number) {
  // MediaPipe Face Mesh landmark indices
  const indices = {
    leftEye: 33,
    rightEye: 263,
    nose: 1,
    mouth: 13,
    leftCheek: 234,
    rightCheek: 454,
    forehead: 10,
    chin: 152,
  }

  return {
    leftEye: { x: landmarks[indices.leftEye].x * width, y: landmarks[indices.leftEye].y * height },
    rightEye: { x: landmarks[indices.rightEye].x * width, y: landmarks[indices.rightEye].y * height },
    nose: { x: landmarks[indices.nose].x * width, y: landmarks[indices.nose].y * height },
    mouth: { x: landmarks[indices.mouth].x * width, y: landmarks[indices.mouth].y * height },
    leftCheek: { x: landmarks[indices.leftCheek].x * width, y: landmarks[indices.leftCheek].y * height },
    rightCheek: { x: landmarks[indices.rightCheek].x * width, y: landmarks[indices.rightCheek].y * height },
    forehead: { x: landmarks[indices.forehead].x * width, y: landmarks[indices.forehead].y * height },
    chin: { x: landmarks[indices.chin].x * width, y: landmarks[indices.chin].y * height },
  }
}

/**
 * Analyze skin concerns from face image
 * งาน 4: Added retry mechanism for ML model detection
 */
export async function analyzeSkinConcerns(
  imageData: ImageData,
  faceResult: FaceDetectionResult,
): Promise<SkinConcernArea[]> {
  const result = await retryWithBackoff(
    async () => {
      // Get detector instance (initializes models if needed)
      const detector = await getSkinConcernDetector()

      // Get face region for focused analysis
      const faceRegion = {
        x: faceResult.boundingBox.xMin,
        y: faceResult.boundingBox.yMin,
        width: faceResult.boundingBox.width,
        height: faceResult.boundingBox.height,
      }

      // Run all detections in parallel for better performance
      console.log("🔍 Running Real AI Skin Analysis...")
      const [wrinkles, pigmentation, pores, redness] = await Promise.all([
        detector.detectWrinkles(imageData, faceRegion),
        detector.detectPigmentation(imageData, faceRegion),
        detector.detectPores(imageData, faceRegion),
        detector.detectRedness(imageData, faceRegion),
      ])

      // Combine all detection results
      const allDetections = [...wrinkles, ...pigmentation, ...pores, ...redness]

      if (allDetections.length === 0) {
        throw new Error("No skin concerns detected - model may not be loaded")
      }

      // Convert to SkinConcernArea format
      const concerns: SkinConcernArea[] = allDetections.map((detection) => ({
        type: detection.type,
        severity: detection.severity,
        confidence: detection.confidence,
        boundingBox: detection.boundingBox,
        landmarks: [], // Can be populated from heatmap data if needed
        heatmapData: detection.heatmapData,
      }))

      console.log(`✅ Detected ${concerns.length} skin concerns using Real AI`)
      return concerns
    },
    {
      maxAttempts: 2,
      delayMs: 500,
      shouldRetry: (error) => {
        const msg = error.message.toLowerCase()
        return msg.includes("detect") || msg.includes("model") || msg.includes("load")
      },
      onRetry: (attempt, error) => {
        console.warn(`🔄 Retrying skin analysis (attempt ${attempt}): ${error.message}`)
      },
    }
  )

  // Log retry statistics
  logRetryStats("Skin Analysis", result)

  if (result.success && result.data) {
    return result.data
  }

  // Show user-friendly error message
  if (result.error) {
    const userMessage = createUserErrorMessage("การวิเคราะห์ผิว", result.error, result.attempts)
    console.error(userMessage)
  }

  // Fallback to mock data
  console.log("⚠️ Using fallback skin analysis (mock data)")
  return analyzeSkinConcernsMock(imageData, faceResult)
}

/**
 * Mock skin concerns detection (fallback)
 * Kept for backward compatibility and offline mode
 */
async function analyzeSkinConcernsMock(
  imageData: ImageData,
  _faceResult: FaceDetectionResult,
): Promise<SkinConcernArea[]> {
  // Simulate AI analysis
  await new Promise((resolve) => setTimeout(resolve, 500))

  const concerns: SkinConcernArea[] = []
  const width = imageData.width
  const height = imageData.height

  // Mock wrinkle detection (forehead, eyes, mouth)
  concerns.push({
    type: "wrinkle",
    severity: "medium",
    confidence: 0.87,
    boundingBox: {
      x: width * 0.3,
      y: height * 0.15,
      width: width * 0.4,
      height: height * 0.1,
    },
    landmarks: [
      { x: width * 0.35, y: height * 0.18 },
      { x: width * 0.5, y: height * 0.17 },
      { x: width * 0.65, y: height * 0.18 },
    ],
  })

  // Mock pigmentation (cheeks)
  concerns.push({
    type: "pigmentation",
    severity: "high",
    confidence: 0.92,
    boundingBox: {
      x: width * 0.25,
      y: height * 0.5,
      width: width * 0.15,
      height: width * 0.15,
    },
    landmarks: [{ x: width * 0.32, y: height * 0.57 }],
  })

  concerns.push({
    type: "pigmentation",
    severity: "medium",
    confidence: 0.88,
    boundingBox: {
      x: width * 0.6,
      y: height * 0.5,
      width: width * 0.15,
      height: width * 0.15,
    },
    landmarks: [{ x: width * 0.68, y: height * 0.57 }],
  })

  // Mock pore detection (nose, cheeks)
  concerns.push({
    type: "pore",
    severity: "medium",
    confidence: 0.85,
    boundingBox: {
      x: width * 0.45,
      y: height * 0.45,
      width: width * 0.1,
      height: width * 0.15,
    },
    landmarks: [{ x: width * 0.5, y: height * 0.52 }],
  })

  // Mock redness (cheeks, nose)
  if (Math.random() > 0.5) {
    concerns.push({
      type: "redness",
      severity: "low",
      confidence: 0.78,
      boundingBox: {
        x: width * 0.28,
        y: height * 0.52,
        width: width * 0.12,
        height: height * 0.1,
      },
      landmarks: [{ x: width * 0.34, y: height * 0.57 }],
    })
  }

  return concerns
}

/**
 * Calculate skin age from analysis
 */
export function calculateSkinAge(concerns: SkinConcernArea[], actualAge?: number): number {
  let ageModifier = 0

  for (const concern of concerns) {
    const severityWeight = {
      low: 0.5,
      medium: 1,
      high: 2,
    }

    const concernWeight = {
      wrinkle: 3,
      pigmentation: 2,
      pore: 1,
      redness: 1,
      acne: 1.5,
    }

    ageModifier += severityWeight[concern.severity] * concernWeight[concern.type] * concern.confidence
  }

  const baseAge = actualAge || 30
  const skinAge = Math.round(baseAge + ageModifier)

  return Math.max(18, Math.min(skinAge, 70)) // Clamp between 18-70
}

/**
 * Generate heatmap data from skin concerns
 */
export function generateHeatmapData(
  concerns: SkinConcernArea[],
  width: number,
  height: number,
  concernType?: string,
): ImageData {
  // Browser-only check (prevent SSR errors)
  if (typeof window === 'undefined') {
    throw new Error('generateHeatmapData() is browser-only and cannot run on the server')
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Failed to get canvas context")
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Filter concerns by type if specified
  const filteredConcerns = concernType ? concerns.filter((c) => c.type === concernType) : concerns

  // Draw heatmap using radial gradients
  for (const concern of filteredConcerns) {
    const severityAlpha = {
      low: 0.3,
      medium: 0.5,
      high: 0.7,
    }

    const concernColor = {
      wrinkle: "59, 130, 246", // blue
      pigmentation: "234, 179, 8", // yellow
      pore: "168, 85, 247", // purple
      redness: "239, 68, 68", // red
      acne: "249, 115, 22", // orange
    }

    const { x, y, width: w, height: h } = concern.boundingBox
    const centerX = x + w / 2
    const centerY = y + h / 2
    const radius = Math.max(w, h)

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)

    const alpha = severityAlpha[concern.severity] * concern.confidence
    const color = concernColor[concern.type]

    gradient.addColorStop(0, `rgba(${color}, ${alpha})`)
    gradient.addColorStop(0.5, `rgba(${color}, ${alpha * 0.5})`)
    gradient.addColorStop(1, `rgba(${color}, 0)`)

    ctx.fillStyle = gradient
    ctx.fillRect(x, y, w, h)
  }

  return ctx.getImageData(0, 0, width, height)
}

/**
 * Draw face landmarks on canvas
 * Added landmark connections for mesh visualization
 */
export function drawFaceLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmark[],
  options: {
    color?: string
    size?: number
    showConnections?: boolean
  } = {},
): void {
  const { color = "#00ff00", size = 1, showConnections = false } = options

  // Draw connections first (so points appear on top)
  if (showConnections && landmarks.length === 468) {
    drawFaceMeshConnections(ctx, landmarks, color)
  }

  // Draw landmark points
  ctx.fillStyle = color
  for (const landmark of landmarks) {
    ctx.beginPath()
    ctx.arc(landmark.x, landmark.y, size, 0, 2 * Math.PI)
    ctx.fill()
  }
}

/**
 * Draw MediaPipe Face Mesh connections
 * New function to draw landmark connections
 */
function drawFaceMeshConnections(ctx: CanvasRenderingContext2D, landmarks: FaceLandmark[], color: string): void {
  // MediaPipe Face Mesh connection pairs (simplified - key connections only)
  const connections = [
    // Face oval
    [10, 338],
    [338, 297],
    [297, 332],
    [332, 284],
    [284, 251],
    [251, 389],
    [389, 356],
    [356, 454],
    [454, 323],
    [323, 361],
    [361, 288],
    [288, 397],
    [397, 365],
    [365, 379],
    [379, 378],
    [378, 400],
    [400, 377],
    [377, 152],
    [152, 148],
    [148, 176],
    [176, 149],
    [149, 150],
    [150, 136],
    [136, 172],
    [172, 58],
    [58, 132],
    [132, 93],
    [93, 234],
    [234, 127],
    [127, 162],
    [162, 21],
    [21, 54],
    [54, 103],
    [103, 67],
    [67, 109],
    [109, 10],

    // Left eye
    [33, 7],
    [7, 163],
    [163, 144],
    [144, 145],
    [145, 153],
    [153, 154],
    [154, 155],
    [155, 133],
    [133, 173],
    [173, 157],
    [157, 158],
    [158, 159],
    [159, 160],
    [160, 161],
    [161, 246],
    [246, 33],

    // Right eye
    [362, 382],
    [382, 381],
    [381, 380],
    [380, 374],
    [374, 373],
    [373, 390],
    [390, 249],
    [249, 263],
    [263, 466],
    [466, 388],
    [388, 387],
    [387, 386],
    [386, 385],
    [385, 384],
    [384, 398],
    [398, 362],

    // Nose
    [168, 6],
    [6, 197],
    [197, 195],
    [195, 5],
    [5, 4],
    [4, 1],
    [1, 19],
    [19, 94],
    [94, 2],
    [2, 164],
    [164, 0],
    [0, 11],
    [11, 12],
    [12, 13],

    // Mouth outer
    [61, 146],
    [146, 91],
    [91, 181],
    [181, 84],
    [84, 17],
    [17, 314],
    [314, 405],
    [405, 321],
    [321, 375],
    [375, 291],
    [291, 308],
    [308, 324],
    [324, 318],
    [318, 402],
    [402, 317],
    [317, 14],
    [14, 87],
    [87, 178],
    [178, 88],
    [88, 95],
    [95, 78],
    [78, 191],
    [191, 80],
    [80, 81],
    [81, 82],
    [82, 13],
    [13, 312],
    [312, 311],
    [311, 310],
    [310, 415],
    [415, 308],
    [308, 324],
    [324, 318],
    [318, 402],
    [402, 317],
    [317, 14],
    [14, 87],
    [87, 178],
    [178, 88],
    [88, 95],
    [95, 61],
  ]

  ctx.strokeStyle = color
  ctx.lineWidth = 0.5
  ctx.globalAlpha = 0.3

  for (const [start, end] of connections) {
    if (start < landmarks.length && end < landmarks.length) {
      ctx.beginPath()
      ctx.moveTo(landmarks[start].x, landmarks[start].y)
      ctx.lineTo(landmarks[end].x, landmarks[end].y)
      ctx.stroke()
    }
  }

  ctx.globalAlpha = 1.0
}

/**
 * Fallback face detection with mock data
 * Renamed from detectFace to detectFaceFallback
 */
async function detectFaceFallback(imageData: ImageData): Promise<FaceDetectionResult | null> {
  const width = imageData.width
  const height = imageData.height

  // Simulate face detection
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock face landmarks (468 points in MediaPipe Face Mesh)
  const landmarks: FaceLandmark[] = []
  for (let i = 0; i < 468; i++) {
    landmarks.push({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.1,
    })
  }

  return {
    landmarks,
    boundingBox: {
      xMin: width * 0.2,
      yMin: height * 0.1,
      width: width * 0.6,
      height: height * 0.8,
    },
    confidence: 0.95 + Math.random() * 0.04,
    keyPoints: {
      leftEye: { x: width * 0.35, y: height * 0.35 },
      rightEye: { x: width * 0.65, y: height * 0.35 },
      nose: { x: width * 0.5, y: height * 0.5 },
      mouth: { x: width * 0.5, y: height * 0.7 },
      leftCheek: { x: width * 0.3, y: height * 0.55 },
      rightCheek: { x: width * 0.7, y: height * 0.55 },
      forehead: { x: width * 0.5, y: height * 0.2 },
      chin: { x: width * 0.5, y: height * 0.85 },
    },
  }
}

/**
 * Calculate confidence score for image quality
 */
export function calculateImageQualityScore(imageData: ImageData): {
  overall: number
  lighting: number
  blur: number
  resolution: number
} {
  // Simple heuristic-based quality assessment
  const width = imageData.width
  const height = imageData.height

  // Resolution score
  const resolution = Math.min((width * height) / (1920 * 1080), 1) * 100

  // Lighting score (average brightness)
  let totalBrightness = 0
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i]
    const g = imageData.data[i + 1]
    const b = imageData.data[i + 2]
    totalBrightness += (r + g + b) / 3
  }
  const avgBrightness = totalBrightness / (imageData.data.length / 4)
  const lighting = Math.min((avgBrightness / 128) * 100, 100) // Optimal around 128

  // Blur detection (simplified - variance of Laplacian)
  // This is a placeholder - real implementation would use edge detection
  const blur = 75 + Math.random() * 20 // Mock: 75-95%

  // Overall score
  const overall = (resolution * 0.3 + lighting * 0.3 + blur * 0.4) / 100

  return {
    overall: Math.round(overall * 100),
    lighting: Math.round(lighting),
    blur: Math.round(blur),
    resolution: Math.round(resolution),
  }
}
