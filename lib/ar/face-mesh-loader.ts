/**
 * MediaPipe Face Mesh Loader
 * Converts images to 478-point 3D landmarks for AR visualization
 */

import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from "@mediapipe/tasks-vision"

export interface FaceLandmark3D {
  x: number  // Normalized [0, 1]
  y: number  // Normalized [0, 1]
  z: number  // Depth (relative to face plane)
}

let faceLandmarker: FaceLandmarker | null = null

/**
 * Initialize MediaPipe Face Landmarker
 */
export async function initFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarker) return faceLandmarker

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  )

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    runningMode: "IMAGE",
    numFaces: 1
  })

  return faceLandmarker
}

/**
 * Extract 478-point 3D landmarks from image
 */
export async function extractFaceLandmarks(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceLandmark3D[] | null> {
  try {
    const landmarker = await initFaceLandmarker()
    const result: FaceLandmarkerResult = landmarker.detect(imageElement)

    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      console.warn("No face detected in image")
      return null
    }

    // Get first face's landmarks (478 points)
    const landmarks = result.faceLandmarks[0]

    return landmarks.map(landmark => ({
      x: landmark.x,
      y: landmark.y,
      z: landmark.z || 0
    }))
  } catch (error) {
    console.error("Error extracting face landmarks:", error)
    return null
  }
}

/**
 * Load image from URL and extract landmarks
 */
export async function loadImageAndExtractLandmarks(imageUrl: string): Promise<{
  landmarks: FaceLandmark3D[]
  image: HTMLImageElement
} | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    
    img.onload = async () => {
      const landmarks = await extractFaceLandmarks(img)
      if (landmarks) {
        resolve({ landmarks, image: img })
      } else {
        resolve(null)
      }
    }

    img.onerror = () => {
      console.error("Failed to load image:", imageUrl)
      resolve(null)
    }

    img.src = imageUrl
  })
}

/**
 * Get specific landmark regions for analysis
 */
export function getLandmarkRegions(landmarks: FaceLandmark3D[]) {
  // MediaPipe Face Mesh landmark indices
  return {
    // Face oval (0-16)
    faceOval: landmarks.slice(0, 17),
    
    // Left eye (33-133)
    leftEye: [
      ...landmarks.slice(33, 42),
      ...landmarks.slice(130, 134)
    ],
    
    // Right eye (362-263)
    rightEye: [
      ...landmarks.slice(362, 371),
      ...landmarks.slice(263, 267)
    ],
    
    // Nose (1, 2, 98, 327)
    nose: [landmarks[1], landmarks[2], landmarks[98], landmarks[327]],
    
    // Lips (61-291)
    lips: [
      ...landmarks.slice(61, 68),
      ...landmarks.slice(291, 298)
    ],
    
    // Forehead (10, 338, 297, 332, 284)
    forehead: [
      landmarks[10], landmarks[338], landmarks[297], 
      landmarks[332], landmarks[284]
    ],
    
    // Cheeks (50, 280)
    cheeks: [landmarks[50], landmarks[280]],
    
    // Chin (152)
    chin: [landmarks[152]]
  }
}

/**
 * Calculate bounding box of landmarks
 */
export function getLandmarksBoundingBox(landmarks: FaceLandmark3D[]) {
  const xs = landmarks.map(l => l.x)
  const ys = landmarks.map(l => l.y)
  const zs = landmarks.map(l => l.z)

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
    depth: Math.max(...zs) - Math.min(...zs)
  }
}

/**
 * Map skin analysis data to landmark coordinates
 */
export function mapAnalysisToLandmarks(
  analysisData: {
    spots?: Array<{ x: number; y: number; severity: number }>
    pores?: Array<{ x: number; y: number; size: number }>
    wrinkles?: Array<{ points: Array<{ x: number; y: number }> }>
  },
  landmarks: FaceLandmark3D[]
) {
  const bbox = getLandmarksBoundingBox(landmarks)

  // Map spots to nearest landmarks
  const mappedSpots = analysisData.spots?.map(spot => {
    // Find nearest landmark
    let minDist = Infinity
    let nearestIndex = 0

    landmarks.forEach((landmark, i) => {
      const dist = Math.sqrt(
        Math.pow(spot.x - landmark.x, 2) + 
        Math.pow(spot.y - landmark.y, 2)
      )
      if (dist < minDist) {
        minDist = dist
        nearestIndex = i
      }
    })

    return {
      ...spot,
      landmarkIndex: nearestIndex,
      landmark: landmarks[nearestIndex]
    }
  })

  return {
    spots: mappedSpots,
    pores: analysisData.pores,
    wrinkles: analysisData.wrinkles,
    boundingBox: bbox
  }
}
