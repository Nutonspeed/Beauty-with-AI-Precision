/**
 * Age Estimation & Skin Age Analysis
 * Uses facial features and skin conditions to estimate biological age
 */

import * as tf from "@tensorflow/tfjs"
import type { FaceLandmark } from "./face-detection"
import type { DetectionResult } from "./models/skin-concern-detector"

export interface AgeEstimationResult {
  estimatedAge: number
  skinAge: number
  confidence: number
  ageRange: {
    min: number
    max: number
  }
  factors: {
    facialStructure: number
    skinCondition: number
    wrinkles: number
    pigmentation: number
    texture: number
  }
  recommendations: string[]
}

export class AgeEstimator {
  private model: tf.GraphModel | null = null
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await tf.ready()
      // Try to load age estimation model
      this.model = await tf.loadGraphModel("/models/age-estimator/model.json")
      console.log("✅ Age estimation model loaded")
    } catch (error) {
      console.warn("⚠️ Age model not found, using heuristic estimation", error)
      // Will use fallback heuristic method
    }

    this.isInitialized = true
  }

  /**
   * Estimate age from facial image and landmarks
   */
  async estimateAge(
    imageData: ImageData,
    landmarks: FaceLandmark[],
    skinConcerns: DetectionResult[],
  ): Promise<AgeEstimationResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Calculate facial structure age indicators
    const facialAge = this.calculateFacialStructureAge(landmarks, imageData.width, imageData.height)

    // Calculate skin condition age indicators
    const skinAge = this.calculateSkinAge(skinConcerns)

    // Combine factors for final estimate
    const estimatedAge = Math.round(facialAge * 0.4 + skinAge * 0.6)
    const confidence = this.calculateConfidence(landmarks, skinConcerns)

    // Generate age range
    const margin = Math.ceil(5 / confidence)
    const ageRange = {
      min: Math.max(18, estimatedAge - margin),
      max: Math.min(70, estimatedAge + margin),
    }

    // Calculate individual factor scores
    const factors = {
      facialStructure: facialAge,
      skinCondition: skinAge,
      wrinkles: this.getWrinkleSeverityScore(skinConcerns),
      pigmentation: this.getPigmentationScore(skinConcerns),
      texture: this.getTextureScore(skinConcerns),
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, estimatedAge, skinAge)

    return {
      estimatedAge,
      skinAge,
      confidence,
      ageRange,
      factors,
      recommendations,
    }
  }

  /**
   * Calculate age indicators from facial structure
   */
  private calculateFacialStructureAge(landmarks: FaceLandmark[], width: number, height: number): number {
    // Analyze facial proportions that change with age

    // 1. Face length to width ratio (increases with age)
    const faceWidth = this.calculateDistance(landmarks[234], landmarks[454])
    const faceLength = this.calculateDistance(landmarks[10], landmarks[152])
    const lengthWidthRatio = faceLength / faceWidth

    // 2. Eye size relative to face (decreases with age)
    const leftEyeSize = this.calculateEyeSize(landmarks, "left")
    const rightEyeSize = this.calculateEyeSize(landmarks, "right")
    const avgEyeSize = (leftEyeSize + rightEyeSize) / 2
    const eyeToFaceRatio = avgEyeSize / faceWidth

    // 3. Jawline definition (decreases with age)
    const jawlineSharpness = this.calculateJawlineSharpness(landmarks)

    // 4. Cheek fullness (decreases with age)
    const cheekFullness = this.calculateCheekFullness(landmarks)

    // Combine factors into age estimate
    let baseAge = 30

    // Length-width ratio increases with age
    if (lengthWidthRatio > 1.4) baseAge += 10
    else if (lengthWidthRatio > 1.3) baseAge += 5

    // Eye size decreases with age
    if (eyeToFaceRatio < 0.15) baseAge += 10
    else if (eyeToFaceRatio < 0.18) baseAge += 5

    // Jawline sharpness decreases with age
    if (jawlineSharpness < 0.6) baseAge += 15
    else if (jawlineSharpness < 0.75) baseAge += 8

    // Cheek fullness decreases with age
    if (cheekFullness < 0.5) baseAge += 12
    else if (cheekFullness < 0.7) baseAge += 6

    return Math.max(18, Math.min(70, baseAge))
  }

  /**
   * Calculate skin age from detected concerns
   */
  private calculateSkinAge(concerns: DetectionResult[]): number {
    let baseAge = 25

    for (const concern of concerns) {
      const severityMultiplier = {
        low: 1,
        medium: 2,
        high: 3,
      }[concern.severity]

      const concernAging = {
        wrinkle: 5,
        pigmentation: 3,
        pore: 2,
        redness: 1,
        acne: -2, // Acne typically indicates younger skin
      }[concern.type]

      baseAge += concernAging * severityMultiplier * concern.confidence
    }

    return Math.max(18, Math.min(70, Math.round(baseAge)))
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(landmarks: FaceLandmark[], concerns: DetectionResult[]): number {
    let confidence = 0.7

    // More landmarks = higher confidence
    if (landmarks.length >= 468) confidence += 0.1

    // More detected concerns = higher confidence
    if (concerns.length >= 3) confidence += 0.1
    if (concerns.length >= 5) confidence += 0.05

    // High confidence concerns boost overall confidence
    const avgConcernConfidence = concerns.reduce((sum, c) => sum + c.confidence, 0) / concerns.length
    confidence += avgConcernConfidence * 0.1

    return Math.min(0.95, confidence)
  }

  /**
   * Helper: Calculate distance between two landmarks
   */
  private calculateDistance(lm1: FaceLandmark, lm2: FaceLandmark): number {
    const dx = lm2.x - lm1.x
    const dy = lm2.y - lm1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Helper: Calculate eye size
   */
  private calculateEyeSize(landmarks: FaceLandmark[], eye: "left" | "right"): number {
    const indices =
      eye === "left"
        ? { outer: 33, inner: 133, top: 159, bottom: 145 }
        : { outer: 263, inner: 362, top: 386, bottom: 374 }

    const width = this.calculateDistance(landmarks[indices.outer], landmarks[indices.inner])
    const height = this.calculateDistance(landmarks[indices.top], landmarks[indices.bottom])

    return (width + height) / 2
  }

  /**
   * Helper: Calculate jawline sharpness
   */
  private calculateJawlineSharpness(landmarks: FaceLandmark[]): number {
    // Measure angle at chin point
    const leftJaw = landmarks[172]
    const chin = landmarks[152]
    const rightJaw = landmarks[397]

    const angle1 = Math.atan2(chin.y - leftJaw.y, chin.x - leftJaw.x)
    const angle2 = Math.atan2(rightJaw.y - chin.y, rightJaw.x - chin.x)
    const jawAngle = Math.abs(angle2 - angle1)

    // Sharper jawline = smaller angle
    return Math.max(0, 1 - jawAngle / Math.PI)
  }

  /**
   * Helper: Calculate cheek fullness
   */
  private calculateCheekFullness(landmarks: FaceLandmark[]): number {
    // Measure distance from cheekbone to jawline
    const leftCheek = landmarks[234]
    const leftJaw = landmarks[172]
    const rightCheek = landmarks[454]
    const rightJaw = landmarks[397]

    const leftFullness = this.calculateDistance(leftCheek, leftJaw)
    const rightFullness = this.calculateDistance(rightCheek, rightJaw)

    // Normalize to 0-1 range (higher = fuller cheeks)
    return Math.min(1, (leftFullness + rightFullness) / 200)
  }

  /**
   * Get wrinkle severity score
   */
  private getWrinkleSeverityScore(concerns: DetectionResult[]): number {
    const wrinkles = concerns.filter((c) => c.type === "wrinkle")
    if (wrinkles.length === 0) return 0

    const avgSeverity =
      wrinkles.reduce((sum, w) => {
        const score = { low: 1, medium: 2, high: 3 }[w.severity]
        return sum + score * w.confidence
      }, 0) / wrinkles.length

    return Math.round(avgSeverity * 10)
  }

  /**
   * Get pigmentation score
   */
  private getPigmentationScore(concerns: DetectionResult[]): number {
    const pigmentation = concerns.filter((c) => c.type === "pigmentation")
    if (pigmentation.length === 0) return 0

    const avgSeverity =
      pigmentation.reduce((sum, p) => {
        const score = { low: 1, medium: 2, high: 3 }[p.severity]
        return sum + score * p.confidence
      }, 0) / pigmentation.length

    return Math.round(avgSeverity * 10)
  }

  /**
   * Get texture score
   */
  private getTextureScore(concerns: DetectionResult[]): number {
    const pores = concerns.filter((c) => c.type === "pore")
    if (pores.length === 0) return 0

    const avgSeverity =
      pores.reduce((sum, p) => {
        const score = { low: 1, medium: 2, high: 3 }[p.severity]
        return sum + score * p.confidence
      }, 0) / pores.length

    return Math.round(avgSeverity * 10)
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    factors: AgeEstimationResult["factors"],
    estimatedAge: number,
    skinAge: number,
  ): string[] {
    const recommendations: string[] = []
    const ageDifference = skinAge - estimatedAge

    // General recommendations based on age difference
    if (ageDifference > 5) {
      recommendations.push("Your skin age is higher than your chronological age. Focus on anti-aging treatments.")
    } else if (ageDifference < -3) {
      recommendations.push(
        "Great news! Your skin age is younger than your chronological age. Maintain your current routine.",
      )
    }

    // Wrinkle-specific recommendations
    if (factors.wrinkles > 20) {
      recommendations.push("Consider retinol or peptide serums to reduce fine lines and wrinkles.")
      recommendations.push("Use a rich moisturizer with hyaluronic acid for better hydration.")
    } else if (factors.wrinkles > 10) {
      recommendations.push("Start using preventive anti-aging products with antioxidants.")
    }

    // Pigmentation recommendations
    if (factors.pigmentation > 20) {
      recommendations.push("Use vitamin C serum and niacinamide to reduce dark spots.")
      recommendations.push("Always apply SPF 50+ sunscreen to prevent further pigmentation.")
    } else if (factors.pigmentation > 10) {
      recommendations.push("Daily sunscreen is essential to prevent age spots.")
    }

    // Texture recommendations
    if (factors.texture > 15) {
      recommendations.push("Regular exfoliation with AHA/BHA can improve skin texture.")
      recommendations.push("Consider professional treatments like microdermabrasion.")
    }

    // Age-specific recommendations
    if (estimatedAge >= 40) {
      recommendations.push("Consider professional treatments like laser therapy or chemical peels.")
      recommendations.push("Use products with growth factors and stem cells for cellular renewal.")
    } else if (estimatedAge >= 30) {
      recommendations.push("Start incorporating retinol into your nighttime routine.")
      recommendations.push("Use eye cream to prevent crow's feet and under-eye aging.")
    } else {
      recommendations.push("Focus on prevention with antioxidants and daily SPF.")
      recommendations.push("Maintain a consistent skincare routine for long-term benefits.")
    }

    return recommendations.slice(0, 5) // Return top 5 recommendations
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
    }
    this.isInitialized = false
  }
}

// Singleton instance
let estimatorInstance: AgeEstimator | null = null

export async function getAgeEstimator(): Promise<AgeEstimator> {
  if (!estimatorInstance) {
    estimatorInstance = new AgeEstimator()
    await estimatorInstance.initialize()
  }
  return estimatorInstance
}
