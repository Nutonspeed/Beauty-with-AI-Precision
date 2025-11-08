/**
 * Image Quality Validator
 * Phase 1 enhancement for VISIA-parity accuracy improvement
 * Validates image quality before AI analysis to prevent poor results
 */

export interface ImageQualityScore {
  lighting: number // 0-100, higher is better
  lightingStatus: "too-dark" | "too-bright" | "good"
  blur: number // 0-100, lower is blurrier
  blurStatus: "blurry" | "acceptable" | "sharp"
  faceDetected: boolean
  faceSize: number // 0-1, percentage of frame
  faceSizeStatus: "too-small" | "too-large" | "optimal"
  overall: "rejected" | "warning" | "excellent"
  score: number // 0-100 composite score
  issues: string[]
}

/**
 * Validates image quality for skin analysis
 * @param imageElement - HTMLImageElement or HTMLVideoElement
 * @returns Quality score and validation result
 */
export async function validateImageQuality(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<ImageQualityScore> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Cannot create canvas context")
  }

  // Set canvas size
  if (imageElement instanceof HTMLCanvasElement) {
    canvas.width = imageElement.width
    canvas.height = imageElement.height
  } else if (imageElement instanceof HTMLVideoElement) {
    canvas.width = imageElement.videoWidth
    canvas.height = imageElement.videoHeight
  } else {
    canvas.width = imageElement.width
    canvas.height = imageElement.height
  }

  // Draw image
  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  // Check lighting
  const lighting = checkLighting(imageData)

  // Check blur
  const blur = checkBlur(imageData)

  // Check face detection and size
  const faceAnalysis = checkFaceDetection(imageData)

  // Calculate overall score
  const issues: string[] = []
  let score = 100

  if (lighting.status !== "good") {
    issues.push(
      lighting.status === "too-dark"
        ? "Image is too dark. Use better lighting."
        : "Image is too bright. Reduce direct light."
    )
    score -= 30
  }

  if (blur.status === "blurry") {
    issues.push("Image is blurry. Hold camera steady.")
    score -= 40
  } else if (blur.status === "acceptable") {
    score -= 15
  }

  if (!faceAnalysis.detected) {
    issues.push("No face detected. Ensure face is visible and centered.")
    score -= 50
  } else if (faceAnalysis.sizeStatus !== "optimal") {
    if (faceAnalysis.sizeStatus === "too-small") {
      issues.push("Face is too small. Move closer to camera.")
      score -= 25
    } else {
      issues.push("Face is too large. Move further from camera.")
      score -= 25
    }
  }

  let overall: "rejected" | "warning" | "excellent"
  if (score < 30 || (!faceAnalysis.detected && score < 50)) {
    // More lenient: only reject if score < 30, or no face AND score < 50
    overall = "rejected"
  } else if (score < 60) {
    overall = "warning"
  } else {
    overall = "excellent"
  }

  return {
    lighting: lighting.score,
    lightingStatus: lighting.status,
    blur: blur.score,
    blurStatus: blur.status,
    faceDetected: faceAnalysis.detected,
    faceSize: faceAnalysis.size,
    faceSizeStatus: faceAnalysis.sizeStatus,
    overall,
    score: Math.max(0, score),
    issues,
  }
}

function checkLighting(imageData: ImageData): {
  score: number
  status: "too-dark" | "too-bright" | "good"
} {
  const data = imageData.data
  let sum = 0
  const sampleSize = Math.min(10000, data.length / 4)

  for (let i = 0; i < sampleSize; i++) {
    const idx = Math.floor(Math.random() * (data.length / 4)) * 4
    const brightness = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
    sum += brightness
  }

  const avgBrightness = sum / sampleSize
  let score = 0
  let status: "too-dark" | "too-bright" | "good"

  if (avgBrightness < 40) {
    // More lenient: accept darker images (was 60, now 40)
    score = (avgBrightness / 40) * 40 // 0-40
    status = "too-dark"
  } else if (avgBrightness > 230) {
    // More lenient for bright images too (was 220)
    score = ((255 - avgBrightness) / 25) * 40 // 40-0
    status = "too-bright"
  } else {
    // Optimal range now 80-200 (was 100-180)
    const optimalCenter = 130
    const distanceFromOptimal = Math.abs(avgBrightness - optimalCenter)
    score = Math.max(60, 100 - distanceFromOptimal * 0.4)
    status = "good"
  }

  return { score, status }
}

function checkBlur(imageData: ImageData): {
  score: number
  status: "blurry" | "acceptable" | "sharp"
} {
  // Laplacian variance method for blur detection
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height

  // Convert to grayscale and calculate Laplacian
  let variance = 0
  const sampleRate = 4 // Check every 4th pixel for performance

  for (let y = sampleRate; y < height - sampleRate; y += sampleRate) {
    for (let x = sampleRate; x < width - sampleRate; x += sampleRate) {
      const idx = (y * width + x) * 4
      const center = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]

      const top = 0.299 * data[idx - width * 4] + 0.587 * data[idx - width * 4 + 1] + 0.114 * data[idx - width * 4 + 2]
      const bottom = 0.299 * data[idx + width * 4] + 0.587 * data[idx + width * 4 + 1] + 0.114 * data[idx + width * 4 + 2]
      const left = 0.299 * data[idx - 4] + 0.587 * data[idx - 3] + 0.114 * data[idx - 2]
      const right = 0.299 * data[idx + 4] + 0.587 * data[idx + 5] + 0.114 * data[idx + 6]

      const laplacian = Math.abs(4 * center - top - bottom - left - right)
      variance += laplacian * laplacian
    }
  }

  const pixelsSampled = ((width / sampleRate) * (height / sampleRate))
  variance = variance / pixelsSampled

  // Normalize variance to 0-100 score
  // Typical values: sharp > 100, acceptable 50-100, blurry < 50
  let score = Math.min(100, variance / 2)
  let status: "blurry" | "acceptable" | "sharp"

  if (variance < 30) {
    status = "blurry"
  } else if (variance < 80) {
    status = "acceptable"
  } else {
    status = "sharp"
  }

  return { score, status }
}

function checkFaceDetection(imageData: ImageData): {
  detected: boolean
  size: number
  sizeStatus: "too-small" | "too-large" | "optimal"
} {
  // Simple skin tone detection as proxy for face detection
  // In production, this would use MediaPipe Face Detection
  const data = imageData.data
  let skinPixels = 0
  const totalPixels = data.length / 4
  const sampleRate = 4

  for (let i = 0; i < data.length; i += sampleRate * 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Skin tone detection (various skin tones)
    const isSkin =
      r > 95 &&
      g > 40 &&
      b > 20 &&
      r > g &&
      r > b &&
      Math.abs(r - g) > 15 &&
      // Additional checks for various skin tones
      (r - g) < 50 &&
      (r - b) < 80

    if (isSkin) {
      skinPixels++
    }
  }

  const sampledPixels = totalPixels / sampleRate
  const skinRatio = skinPixels / sampledPixels

  // Estimate face bounding box (skin pixels typically 15-40% for optimal positioning)
  const detected = skinRatio > 0.05 // More lenient: at least 5% skin tone (was 8%)
  const size = skinRatio

  let sizeStatus: "too-small" | "too-large" | "optimal"
  if (size < 0.1) {
    // More lenient: accept smaller faces (was 0.15)
    sizeStatus = "too-small"
  } else if (size > 0.6) {
    // More lenient: accept larger faces (was 0.50)
    sizeStatus = "too-large"
  } else {
    sizeStatus = "optimal"
  }

  return {
    detected,
    size,
    sizeStatus,
  }
}

/**
 * Get user-friendly message based on quality score
 */
export function getQualityFeedback(quality: ImageQualityScore): string {
  if (quality.overall === "rejected") {
    return `Image quality too low for analysis. ${quality.issues.join(" ")}`
  }

  if (quality.overall === "warning") {
    return `Image quality could be better. ${quality.issues.join(" ")} Analysis may be less accurate.`
  }

  return "Image quality is excellent! Ready for accurate analysis."
}
