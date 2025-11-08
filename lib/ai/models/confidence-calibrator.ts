/**
 * Confidence Calibration System
 * ปรับปรุง AI confidence scores ให้แม่นยำขึ้น
 */

export interface CalibrationConfig {
  modelType: 'wrinkle' | 'pigmentation' | 'pore' | 'redness' | 'acne'
  baseThreshold: number
  minConfidence: number
  maxConfidence: number
  // Adaptive thresholds based on severity
  severityThresholds: {
    low: number
    medium: number
    high: number
  }
}

export interface CalibrationResult {
  originalConfidence: number
  calibratedConfidence: number
  adjustedSeverity: 'low' | 'medium' | 'high'
  shouldDetect: boolean
  reason: string
}

/**
 * Confidence Calibrator สำหรับปรับ AI detection scores
 */
export class ConfidenceCalibrator {
  private configs: Map<string, CalibrationConfig> = new Map()
  private detectionHistory: Map<string, number[]> = new Map()

  constructor() {
    this.initializeConfigs()
  }

  private initializeConfigs(): void {
    // Wrinkle detection - ค่อนข้างแม่นยำ ใช้ threshold ปกติ
    this.configs.set('wrinkle', {
      modelType: 'wrinkle',
      baseThreshold: 0.65, // ลดจาก 0.7
      minConfidence: 0.4,
      maxConfidence: 0.95,
      severityThresholds: {
        low: 0.65,    // 65-74%
        medium: 0.75, // 75-84%
        high: 0.85,   // 85%+
      },
    })

    // Pigmentation detection - อาจ false positive ได้ ต้องการ confidence สูงกว่า
    this.configs.set('pigmentation', {
      modelType: 'pigmentation',
      baseThreshold: 0.70, // ลดจาก 0.75 เพื่อจับ edge cases
      minConfidence: 0.5,
      maxConfidence: 0.95,
      severityThresholds: {
        low: 0.70,
        medium: 0.80,
        high: 0.88,
      },
    })

    // Pore detection - ค่อนข้างยาก ใช้ threshold ต่ำกว่า
    this.configs.set('pore', {
      modelType: 'pore',
      baseThreshold: 0.60, // ลดจาก 0.7
      minConfidence: 0.45,
      maxConfidence: 0.92,
      severityThresholds: {
        low: 0.60,
        medium: 0.72,
        high: 0.82,
      },
    })

    // Redness detection - แยกแยะยาก ใช้ threshold ต่ำสุด
    this.configs.set('redness', {
      modelType: 'redness',
      baseThreshold: 0.58, // ลดจาก 0.65
      minConfidence: 0.40,
      maxConfidence: 0.90,
      severityThresholds: {
        low: 0.58,
        medium: 0.68,
        high: 0.78,
      },
    })

    // Acne detection - ต้องการความแม่นยำสูง
    this.configs.set('acne', {
      modelType: 'acne',
      baseThreshold: 0.72,
      minConfidence: 0.55,
      maxConfidence: 0.96,
      severityThresholds: {
        low: 0.72,
        medium: 0.82,
        high: 0.90,
      },
    })
  }

  /**
   * Calibrate confidence score
   */
  calibrate(
    modelType: string,
    rawConfidence: number,
    contextData?: {
      imageQuality?: number // 0-1, คุณภาพรูปภาพ
      lightingCondition?: 'good' | 'fair' | 'poor'
      faceArea?: number // pixel area ของใบหน้า
      previousDetections?: number // จำนวนครั้งที่เจอ concern นี้ก่อนหน้า
    }
  ): CalibrationResult {
    const config = this.configs.get(modelType)
    if (!config) {
      return {
        originalConfidence: rawConfidence,
        calibratedConfidence: rawConfidence,
        adjustedSeverity: this.getSeverity(rawConfidence, {
          low: 0.6,
          medium: 0.75,
          high: 0.85,
        }),
        shouldDetect: rawConfidence >= 0.7,
        reason: 'Unknown model type',
      }
    }

    let calibratedConfidence = rawConfidence
    let adjustmentReasons: string[] = []

    // 1. Image quality adjustment
    if (contextData?.imageQuality !== undefined) {
      const qualityFactor = this.calculateQualityFactor(contextData.imageQuality)
      calibratedConfidence *= qualityFactor
      if (qualityFactor !== 1.0) {
        adjustmentReasons.push(
          `Image quality: ${(contextData.imageQuality * 100).toFixed(0)}% (×${qualityFactor.toFixed(2)})`
        )
      }
    }

    // 2. Lighting condition adjustment
    if (contextData?.lightingCondition) {
      const lightingFactor = this.calculateLightingFactor(
        contextData.lightingCondition,
        modelType
      )
      calibratedConfidence *= lightingFactor
      if (lightingFactor !== 1.0) {
        adjustmentReasons.push(
          `Lighting: ${contextData.lightingCondition} (×${lightingFactor.toFixed(2)})`
        )
      }
    }

    // 3. Face area adjustment (larger face = more reliable)
    if (contextData?.faceArea !== undefined) {
      const areaFactor = this.calculateAreaFactor(contextData.faceArea)
      calibratedConfidence *= areaFactor
      if (areaFactor !== 1.0) {
        adjustmentReasons.push(`Face area: ${contextData.faceArea}px (×${areaFactor.toFixed(2)})`)
      }
    }

    // 4. Historical data adjustment
    if (contextData?.previousDetections !== undefined && contextData.previousDetections > 0) {
      const historyBoost = Math.min(0.05 * contextData.previousDetections, 0.15) // Max +15%
      calibratedConfidence += historyBoost
      adjustmentReasons.push(
        `Previous detections: ${contextData.previousDetections} (+${(historyBoost * 100).toFixed(1)}%)`
      )
    }

    // 5. Clamp to min/max
    calibratedConfidence = Math.max(
      config.minConfidence,
      Math.min(config.maxConfidence, calibratedConfidence)
    )

    // 6. Determine severity
    const adjustedSeverity = this.getSeverity(calibratedConfidence, config.severityThresholds)

    // 7. Should detect?
    const shouldDetect = calibratedConfidence >= config.baseThreshold

    return {
      originalConfidence: rawConfidence,
      calibratedConfidence,
      adjustedSeverity,
      shouldDetect,
      reason: adjustmentReasons.length > 0 
        ? adjustmentReasons.join(', ') 
        : 'No adjustments',
    }
  }

  /**
   * Calculate quality factor (0.8 - 1.2)
   */
  private calculateQualityFactor(quality: number): number {
    if (quality >= 0.8) return 1.1 // Good quality = boost confidence
    if (quality >= 0.6) return 1.0 // Fair quality = no change
    if (quality >= 0.4) return 0.95 // Poor quality = reduce confidence
    return 0.85 // Very poor quality = reduce significantly
  }

  /**
   * Calculate lighting factor
   */
  private calculateLightingFactor(
    lighting: 'good' | 'fair' | 'poor',
    modelType: string
  ): number {
    // Pigmentation and redness are more affected by lighting
    const lightingSensitive = ['pigmentation', 'redness'].includes(modelType)

    switch (lighting) {
      case 'good':
        return 1.05 // Slight boost
      case 'fair':
        return 1.0
      case 'poor':
        return lightingSensitive ? 0.85 : 0.92
      default:
        return 1.0
    }
  }

  /**
   * Calculate area factor based on face size
   */
  private calculateAreaFactor(faceArea: number): number {
    // Assume ideal face area is around 100,000-200,000 pixels
    if (faceArea >= 150000) return 1.05 // Large face = more reliable
    if (faceArea >= 80000) return 1.0 // Normal size
    if (faceArea >= 40000) return 0.95 // Small face
    return 0.90 // Very small face
  }

  /**
   * Get severity level from confidence
   */
  private getSeverity(
    confidence: number,
    thresholds: { low: number; medium: number; high: number }
  ): 'low' | 'medium' | 'high' {
    if (confidence >= thresholds.high) return 'high'
    if (confidence >= thresholds.medium) return 'medium'
    if (confidence >= thresholds.low) return 'low'
    return 'low'
  }

  /**
   * Batch calibrate multiple detections
   */
  calibrateBatch(
    detections: Array<{
      modelType: string
      confidence: number
    }>,
    contextData?: {
      imageQuality?: number
      lightingCondition?: 'good' | 'fair' | 'poor'
      faceArea?: number
    }
  ): CalibrationResult[] {
    return detections.map((detection) =>
      this.calibrate(detection.modelType, detection.confidence, contextData)
    )
  }

  /**
   * Record detection for historical analysis
   */
  recordDetection(modelType: string, confidence: number): void {
    const history = this.detectionHistory.get(modelType) || []
    history.push(confidence)

    // Keep only last 50 detections
    if (history.length > 50) {
      history.shift()
    }

    this.detectionHistory.set(modelType, history)
  }

  /**
   * Get average confidence for a model type
   */
  getAverageConfidence(modelType: string): number | null {
    const history = this.detectionHistory.get(modelType)
    if (!history || history.length === 0) return null

    const sum = history.reduce((a, b) => a + b, 0)
    return sum / history.length
  }

  /**
   * Get detection statistics
   */
  getStatistics(modelType: string): {
    count: number
    average: number
    min: number
    max: number
    stdDev: number
  } | null {
    const history = this.detectionHistory.get(modelType)
    if (!history || history.length === 0) return null

    const count = history.length
    const average = history.reduce((a, b) => a + b, 0) / count
    const min = Math.min(...history)
    const max = Math.max(...history)

    // Calculate standard deviation
    const variance =
      history.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / count
    const stdDev = Math.sqrt(variance)

    return { count, average, min, max, stdDev }
  }

  /**
   * Update threshold based on historical performance
   */
  adaptiveUpdateThreshold(modelType: string, targetAccuracy: number = 0.85): void {
    const stats = this.getStatistics(modelType)
    if (!stats || stats.count < 20) return // Need sufficient data

    const config = this.configs.get(modelType)
    if (!config) return

    // If average confidence is too high, increase threshold
    if (stats.average > 0.85 && config.baseThreshold < 0.8) {
      config.baseThreshold += 0.02
      console.log(
        `📈 Increased ${modelType} threshold to ${config.baseThreshold.toFixed(2)} (avg: ${stats.average.toFixed(2)})`
      )
    }

    // If average confidence is too low, decrease threshold
    if (stats.average < 0.65 && config.baseThreshold > 0.5) {
      config.baseThreshold -= 0.02
      console.log(
        `📉 Decreased ${modelType} threshold to ${config.baseThreshold.toFixed(2)} (avg: ${stats.average.toFixed(2)})`
      )
    }
  }

  /**
   * Reset calibration config to defaults
   */
  reset(): void {
    this.detectionHistory.clear()
    this.initializeConfigs()
  }

  /**
   * Export calibration data for analysis
   */
  exportData(): {
    configs: Record<string, CalibrationConfig>
    history: Record<string, number[]>
  } {
    const configs: Record<string, CalibrationConfig> = {}
    const history: Record<string, number[]> = {}

    this.configs.forEach((config, key) => {
      configs[key] = { ...config }
    })

    this.detectionHistory.forEach((data, key) => {
      history[key] = [...data]
    })

    return { configs, history }
  }
}

// Singleton instance
let calibratorInstance: ConfidenceCalibrator | null = null

/**
 * Get or create calibrator instance
 */
export function getConfidenceCalibrator(): ConfidenceCalibrator {
  if (!calibratorInstance) {
    calibratorInstance = new ConfidenceCalibrator()
  }
  return calibratorInstance
}
