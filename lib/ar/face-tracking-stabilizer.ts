/**
 * Face Tracking Stabilizer (Task 4/7)
 * Reduces jitter and improves stability for real-time AR face tracking
 * Uses temporal smoothing, Kalman filtering, and adaptive quality
 */

import type { FaceDetectionResult, FaceLandmark } from '@/lib/ai/mediapipe-detector'

/**
 * Stabilized face tracking result
 */
export interface StabilizedFaceResult extends FaceDetectionResult {
  stabilityScore: number // 0-1 (1 = perfectly stable)
  isStable: boolean
  motionLevel: 'still' | 'slow' | 'medium' | 'fast'
  trackingQuality: 'excellent' | 'good' | 'fair' | 'poor'
}

/**
 * Kalman Filter for 1D value smoothing
 */
class KalmanFilter {
  private q: number // Process noise covariance
  private r: number // Measurement noise covariance
  private x: number // Estimated value
  private p: number // Estimation error covariance
  private k: number // Kalman gain

  constructor(processNoise = 0.01, measurementNoise = 0.1, initialValue = 0) {
    this.q = processNoise
    this.r = measurementNoise
    this.x = initialValue
    this.p = 1
    this.k = 0
  }

  filter(measurement: number): number {
    // Prediction
    this.p = this.p + this.q

    // Update
    this.k = this.p / (this.p + this.r)
    this.x = this.x + this.k * (measurement - this.x)
    this.p = (1 - this.k) * this.p

    return this.x
  }

  reset(value: number) {
    this.x = value
    this.p = 1
  }
}

/**
 * Exponential Moving Average for smooth transitions
 */
class ExponentialMovingAverage {
  private alpha: number
  private value: number | null = null

  constructor(alpha = 0.3) {
    this.alpha = alpha // 0-1 (lower = smoother but more lag)
  }

  update(newValue: number): number {
    if (this.value === null) {
      this.value = newValue
      return newValue
    }

    this.value = this.alpha * newValue + (1 - this.alpha) * this.value
    return this.value
  }

  reset() {
    this.value = null
  }

  getValue(): number | null {
    return this.value
  }
}

/**
 * Face Tracking Stabilizer
 */
export class FaceTrackingStabilizer {
  // Landmark history for temporal smoothing
  private landmarkHistory: FaceLandmark[][] = []
  private maxHistorySize = 5 // Keep last 5 frames
  
  // Kalman filters for bounding box (x, y, width, height)
  private bboxFilters = {
    xMin: new KalmanFilter(0.01, 0.1),
    yMin: new KalmanFilter(0.01, 0.1),
    width: new KalmanFilter(0.005, 0.05),
    height: new KalmanFilter(0.005, 0.05)
  }
  
  // EMA for confidence smoothing
  private confidenceEMA = new ExponentialMovingAverage(0.4)
  
  // Motion detection
  private previousBBox: { xMin: number; yMin: number; width: number; height: number } | null = null
  private motionHistory: number[] = []
  private maxMotionHistory = 10
  
  // Adaptive quality
  private failedFrames = 0
  private successFrames = 0
  private lastSuccessTime = Date.now()
  
  /**
   * Stabilize face detection result
   */
  stabilize(result: FaceDetectionResult | null): StabilizedFaceResult | null {
    // Handle detection failure
    if (!result) {
      this.failedFrames++
      
      // If too many failures, reset filters
      if (this.failedFrames > 10) {
        this.reset()
      }
      
      return null
    }
    
    // Detection success
    this.failedFrames = 0
    this.successFrames++
    this.lastSuccessTime = Date.now()
    
    // 1. Stabilize landmarks using temporal smoothing
    const stabilizedLandmarks = this.stabilizeLandmarks(result.landmarks)
    
    // 2. Stabilize bounding box using Kalman filtering
    const stabilizedBBox = this.stabilizeBoundingBox(result.boundingBox)
    
    // 3. Smooth confidence score
    const stabilizedConfidence = this.confidenceEMA.update(result.confidence)
    
    // 4. Calculate motion level
    const motionLevel = this.calculateMotionLevel(stabilizedBBox)
    
    // 5. Calculate stability score
    const stabilityScore = this.calculateStabilityScore(motionLevel)
    
    // 6. Determine tracking quality
    const trackingQuality = this.determineTrackingQuality(stabilityScore, stabilizedConfidence)
    
    return {
      landmarks: stabilizedLandmarks,
      boundingBox: stabilizedBBox,
      confidence: stabilizedConfidence,
      processingTime: result.processingTime,
      stabilityScore,
      isStable: stabilityScore > 0.7,
      motionLevel,
      trackingQuality
    }
  }
  
  /**
   * Stabilize landmarks using temporal smoothing (average of last N frames)
   */
  private stabilizeLandmarks(landmarks: FaceLandmark[]): FaceLandmark[] {
    // Add to history
    this.landmarkHistory.push(landmarks)
    if (this.landmarkHistory.length > this.maxHistorySize) {
      this.landmarkHistory.shift()
    }
    
    // If not enough history, return original
    if (this.landmarkHistory.length < 3) {
      return landmarks
    }
    
    // Average landmarks across history (temporal smoothing)
    const stabilized: FaceLandmark[] = []
    const historySize = this.landmarkHistory.length
    
    for (let i = 0; i < landmarks.length; i++) {
      let sumX = 0
      let sumY = 0
      let sumZ = 0
      
      // Weighted average (recent frames have more weight)
      for (let j = 0; j < historySize; j++) {
        const weight = (j + 1) / historySize // Linear weight: older = less weight
        const landmark = this.landmarkHistory[j][i]
        sumX += landmark.x * weight
        sumY += landmark.y * weight
        sumZ += landmark.z * weight
      }
      
      const totalWeight = (historySize * (historySize + 1)) / 2 // Sum of 1+2+3+...+N
      
      stabilized.push({
        x: sumX / totalWeight,
        y: sumY / totalWeight,
        z: sumZ / totalWeight
      })
    }
    
    return stabilized
  }
  
  /**
   * Stabilize bounding box using Kalman filtering
   */
  private stabilizeBoundingBox(bbox: {
    xMin: number
    yMin: number
    width: number
    height: number
  }): {
    xMin: number
    yMin: number
    width: number
    height: number
  } {
    return {
      xMin: this.bboxFilters.xMin.filter(bbox.xMin),
      yMin: this.bboxFilters.yMin.filter(bbox.yMin),
      width: this.bboxFilters.width.filter(bbox.width),
      height: this.bboxFilters.height.filter(bbox.height)
    }
  }
  
  /**
   * Calculate motion level based on bbox movement
   */
  private calculateMotionLevel(bbox: {
    xMin: number
    yMin: number
    width: number
    height: number
  }): 'still' | 'slow' | 'medium' | 'fast' {
    if (!this.previousBBox) {
      this.previousBBox = bbox
      return 'still'
    }
    
    // Calculate movement distance (normalized)
    const dx = Math.abs(bbox.xMin - this.previousBBox.xMin)
    const dy = Math.abs(bbox.yMin - this.previousBBox.yMin)
    const dw = Math.abs(bbox.width - this.previousBBox.width)
    const dh = Math.abs(bbox.height - this.previousBBox.height)
    
    const motion = Math.sqrt(dx * dx + dy * dy + dw * dw + dh * dh)
    
    // Add to history
    this.motionHistory.push(motion)
    if (this.motionHistory.length > this.maxMotionHistory) {
      this.motionHistory.shift()
    }
    
    // Calculate average motion
    const avgMotion = this.motionHistory.reduce((sum, m) => sum + m, 0) / this.motionHistory.length
    
    this.previousBBox = bbox
    
    // Classify motion level
    if (avgMotion < 0.005) return 'still'
    if (avgMotion < 0.02) return 'slow'
    if (avgMotion < 0.05) return 'medium'
    return 'fast'
  }
  
  /**
   * Calculate stability score (0-1, higher = more stable)
   */
  private calculateStabilityScore(motionLevel: 'still' | 'slow' | 'medium' | 'fast'): number {
    // Base score from motion
    let score = 1.0
    
    switch (motionLevel) {
      case 'still':
        score = 1.0
        break
      case 'slow':
        score = 0.85
        break
      case 'medium':
        score = 0.6
        break
      case 'fast':
        score = 0.3
        break
    }
    
    // Adjust based on history size (more history = more stable)
    const historyBonus = Math.min(this.landmarkHistory.length / this.maxHistorySize, 1.0) * 0.2
    score = Math.min(1.0, score + historyBonus)
    
    // Penalize if recent failures
    if (this.failedFrames > 0) {
      score *= Math.max(0.5, 1.0 - this.failedFrames * 0.1)
    }
    
    return score
  }
  
  /**
   * Determine tracking quality
   */
  private determineTrackingQuality(
    stabilityScore: number,
    confidence: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    const combinedScore = (stabilityScore + confidence) / 2
    
    if (combinedScore >= 0.85) return 'excellent'
    if (combinedScore >= 0.7) return 'good'
    if (combinedScore >= 0.5) return 'fair'
    return 'poor'
  }
  
  /**
   * Adaptive quality recommendations
   */
  getQualityRecommendations(): {
    shouldReduceQuality: boolean
    shouldIncreaseQuality: boolean
    recommendations: string[]
  } {
    const recommendations: string[] = []
    let shouldReduceQuality = false
    let shouldIncreaseQuality = false
    
    // Check failure rate
    const totalFrames = this.successFrames + this.failedFrames
    const failureRate = totalFrames > 0 ? this.failedFrames / totalFrames : 0
    
    if (failureRate > 0.3) {
      shouldReduceQuality = true
      recommendations.push('High failure rate - consider reducing quality or improving lighting')
    }
    
    // Check motion level
    const avgMotion = this.motionHistory.reduce((sum, m) => sum + m, 0) / this.motionHistory.length
    if (avgMotion > 0.1) {
      recommendations.push('High motion detected - hold face still for better tracking')
    }
    
    // Check stability
    const recentStability = this.landmarkHistory.length >= this.maxHistorySize
    if (!recentStability) {
      recommendations.push('Building tracking history - stability will improve')
    }
    
    // Check if can increase quality
    if (this.successFrames > 30 && failureRate < 0.1 && avgMotion < 0.02) {
      shouldIncreaseQuality = true
      recommendations.push('Excellent tracking conditions - can increase quality')
    }
    
    return {
      shouldReduceQuality,
      shouldIncreaseQuality,
      recommendations
    }
  }
  
  /**
   * Get performance metrics
   */
  getMetrics(): {
    successRate: number
    averageMotion: number
    historySize: number
    uptime: number
  } {
    const totalFrames = this.successFrames + this.failedFrames
    const successRate = totalFrames > 0 ? this.successFrames / totalFrames : 0
    const avgMotion = this.motionHistory.reduce((sum, m) => sum + m, 0) / this.motionHistory.length
    const uptime = Date.now() - this.lastSuccessTime
    
    return {
      successRate,
      averageMotion: avgMotion,
      historySize: this.landmarkHistory.length,
      uptime
    }
  }
  
  /**
   * Reset all filters and history
   */
  reset() {
    this.landmarkHistory = []
    this.motionHistory = []
    this.previousBBox = null
    this.failedFrames = 0
    this.successFrames = 0
    
    // Reset filters
    this.bboxFilters.xMin = new KalmanFilter(0.01, 0.1)
    this.bboxFilters.yMin = new KalmanFilter(0.01, 0.1)
    this.bboxFilters.width = new KalmanFilter(0.005, 0.05)
    this.bboxFilters.height = new KalmanFilter(0.005, 0.05)
    this.confidenceEMA.reset()
    
    console.log('🔄 Face tracking stabilizer reset')
  }
  
  /**
   * Adjust smoothing strength (for adaptive quality)
   */
  setSmoothingStrength(strength: 'low' | 'medium' | 'high') {
    switch (strength) {
      case 'low':
        // Fast response, less smoothing
        this.maxHistorySize = 3
        this.confidenceEMA = new ExponentialMovingAverage(0.5)
        break
      case 'medium':
        // Balanced
        this.maxHistorySize = 5
        this.confidenceEMA = new ExponentialMovingAverage(0.4)
        break
      case 'high':
        // Maximum smoothing
        this.maxHistorySize = 8
        this.confidenceEMA = new ExponentialMovingAverage(0.25)
        break
    }
    
    console.log(`⚙️ Smoothing strength set to: ${strength}`)
  }
}

/**
 * Singleton instance
 */
let stabilizerInstance: FaceTrackingStabilizer | null = null

/**
 * Get or create stabilizer instance
 */
export function getFaceTrackingStabilizer(): FaceTrackingStabilizer {
  if (!stabilizerInstance) {
    stabilizerInstance = new FaceTrackingStabilizer()
  }
  return stabilizerInstance
}

/**
 * Detect multi-angle face support
 */
export function estimateFaceAngle(landmarks: FaceLandmark[]): {
  yaw: number // -90 to 90 (left to right rotation)
  pitch: number // -90 to 90 (up to down rotation)
  roll: number // -90 to 90 (tilt)
  isFrontal: boolean
} {
  // Use key landmarks for angle estimation
  // MediaPipe landmarks: 33 (left eye), 263 (right eye), 1 (nose), 152 (chin)
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  const nose = landmarks[1]
  const chin = landmarks[152]
  const forehead = landmarks[10]
  
  // Calculate yaw (left-right rotation)
  const eyeDistance = Math.abs(rightEye.x - leftEye.x)
  const noseToCenterX = nose.x - (leftEye.x + rightEye.x) / 2
  const yaw = Math.atan2(noseToCenterX, eyeDistance) * (180 / Math.PI) * 2
  
  // Calculate pitch (up-down rotation)
  const noseToEyeY = nose.y - (leftEye.y + rightEye.y) / 2
  const noseToChinY = chin.y - nose.y
  const pitch = Math.atan2(noseToEyeY, noseToChinY) * (180 / Math.PI) - 90
  
  // Calculate roll (tilt)
  const eyeSlope = (rightEye.y - leftEye.y) / (rightEye.x - leftEye.x)
  const roll = Math.atan(eyeSlope) * (180 / Math.PI)
  
  // Check if roughly frontal (within 20 degrees)
  const isFrontal = Math.abs(yaw) < 20 && Math.abs(pitch) < 20 && Math.abs(roll) < 15
  
  return {
    yaw: Math.max(-90, Math.min(90, yaw)),
    pitch: Math.max(-90, Math.min(90, pitch)),
    roll: Math.max(-90, Math.min(90, roll)),
    isFrontal
  }
}
