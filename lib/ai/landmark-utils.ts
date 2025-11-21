/**
 * Facial Landmark Utilities
 * Helper functions for working with MediaPipe Face Mesh landmarks
 */

export interface FaceLandmark {
  x: number
  y: number
  z?: number
}

/**
 * MediaPipe Face Mesh landmark groups
 * Official indices for different facial regions
 */
export const LANDMARK_GROUPS = {
  // Silhouette (face oval)
  silhouette: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150,
    136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
  ],

  // Left eye
  leftEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],

  // Right eye
  rightEye: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],

  // Left eyebrow
  leftEyebrow: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],

  // Right eyebrow
  rightEyebrow: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],

  // Nose
  nose: [168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 164, 0, 11, 12, 13, 98, 97, 2, 326, 327],

  // Lips outer
  lipsOuter: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95],

  // Lips inner
  lipsInner: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],

  // Left cheek
  leftCheek: [117, 118, 119, 120, 121, 128, 245, 193, 168, 6, 197, 195, 5],

  // Right cheek
  rightCheek: [346, 347, 348, 349, 350, 357, 465, 417, 351, 419, 248, 281],

  // Forehead (estimated region)
  forehead: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 67, 109],
}

/**
 * Get landmarks for a specific facial region
 */
export function getLandmarksByRegion(landmarks: FaceLandmark[], region: keyof typeof LANDMARK_GROUPS): FaceLandmark[] {
  const indices = LANDMARK_GROUPS[region]
  return indices.map((i) => landmarks[i]).filter(Boolean)
}

/**
 * Calculate center point of a landmark group
 */
export function calculateCenter(landmarks: FaceLandmark[]): FaceLandmark {
  const sum = landmarks.reduce(
    (acc, lm) => ({
      x: acc.x + lm.x,
      y: acc.y + lm.y,
      z: (acc.z || 0) + (lm.z || 0),
    }),
    { x: 0, y: 0, z: 0 },
  )

  return {
    x: sum.x / landmarks.length,
    y: sum.y / landmarks.length,
    z: (sum.z || 0) / landmarks.length,
  }
}

/**
 * Calculate distance between two landmarks
 */
export function calculateDistance(lm1: FaceLandmark, lm2: FaceLandmark): number {
  const dx = lm2.x - lm1.x
  const dy = lm2.y - lm1.y
  const dz = (lm2.z || 0) - (lm1.z || 0)
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Calculate face orientation (yaw, pitch, roll) from landmarks
 */
export function calculateFaceOrientation(landmarks: FaceLandmark[]): {
  yaw: number
  pitch: number
  roll: number
} {
  // Use key points for orientation calculation
  const nose = landmarks[1]
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  const chin = landmarks[152]
  const forehead = landmarks[10]

  // Calculate yaw (left-right rotation)
  const eyeCenter = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
  }
  const yaw = Math.atan2(nose.x - eyeCenter.x, 1) * (180 / Math.PI)

  // Calculate pitch (up-down rotation)
  const faceHeight = calculateDistance(forehead, chin)
  const noseToEyeDistance = calculateDistance(nose, eyeCenter)
  const pitch = Math.asin(noseToEyeDistance / faceHeight - 0.5) * (180 / Math.PI)

  // Calculate roll (tilt)
  const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI)

  return { yaw, pitch, roll }
}

/**
 * Filter landmarks by confidence threshold
 */
export function filterLandmarksByConfidence(landmarks: FaceLandmark[], _threshold = 0.5): FaceLandmark[] {
  // MediaPipe doesn't provide per-landmark confidence, but we can filter by z-depth
  // Landmarks with extreme z values are likely less reliable
  return landmarks.filter((lm) => {
    const z = lm.z || 0
    return Math.abs(z) < 0.3 // Filter out landmarks too far from face plane
  })
}

/**
 * Smooth landmarks using simple moving average
 */
export function smoothLandmarks(
  currentLandmarks: FaceLandmark[],
  previousLandmarks: FaceLandmark[],
  alpha = 0.7,
): FaceLandmark[] {
  if (previousLandmarks.length !== currentLandmarks.length) {
    return currentLandmarks
  }

  return currentLandmarks.map((current, i) => {
    const previous = previousLandmarks[i]
    return {
      x: alpha * current.x + (1 - alpha) * previous.x,
      y: alpha * current.y + (1 - alpha) * previous.y,
      z: alpha * (current.z || 0) + (1 - alpha) * (previous.z || 0),
    }
  })
}
