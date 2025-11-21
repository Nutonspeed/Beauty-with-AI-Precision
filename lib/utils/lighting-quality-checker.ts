/**
 * Lighting Quality Checker
 * Analyzes image lighting conditions and provides feedback
 */

export interface LightingQualityResult {
  overall: "excellent" | "good" | "fair" | "poor"
  brightness: number // 0-255
  contrast: number // 0-100
  evenness: number // 0-100
  colorTemperature: "warm" | "neutral" | "cool"
  issues: string[]
  recommendations: string[]
  score: number // 0-100
}

export class LightingQualityChecker {
  /**
   * Analyze lighting quality from image data
   */
  static analyze(imageData: ImageData): LightingQualityResult {
    const brightness = this.calculateBrightness(imageData)
    const contrast = this.calculateContrast(imageData)
    const evenness = this.calculateEvenness(imageData)
    const colorTemperature = this.detectColorTemperature(imageData)

    const issues: string[] = []
    const recommendations: string[] = []

    // Check brightness
    if (brightness < 80) {
      issues.push("Image is too dark")
      recommendations.push("Increase lighting or move to a brighter area")
    } else if (brightness > 200) {
      issues.push("Image is too bright")
      recommendations.push("Reduce lighting or move away from direct light")
    }

    // Check contrast
    if (contrast < 30) {
      issues.push("Low contrast")
      recommendations.push("Improve lighting to create better definition")
    } else if (contrast > 80) {
      issues.push("High contrast (harsh shadows)")
      recommendations.push("Use diffused lighting to reduce shadows")
    }

    // Check evenness
    if (evenness < 60) {
      issues.push("Uneven lighting")
      recommendations.push("Use multiple light sources or diffused lighting")
    }

    // Check color temperature
    if (colorTemperature === "warm") {
      recommendations.push("Consider using cooler (daylight) lighting for more accurate analysis")
    } else if (colorTemperature === "cool") {
      recommendations.push("Lighting is good for skin analysis")
    }

    // Calculate overall score
    const score = this.calculateScore(brightness, contrast, evenness)

    // Determine overall quality
    let overall: LightingQualityResult["overall"]
    if (score >= 90) overall = "excellent"
    else if (score >= 75) overall = "good"
    else if (score >= 60) overall = "fair"
    else overall = "poor"

    return {
      overall,
      brightness,
      contrast,
      evenness,
      colorTemperature,
      issues,
      recommendations,
      score,
    }
  }

  private static calculateBrightness(imageData: ImageData): number {
    const data = imageData.data
    let sum = 0

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      sum += brightness
    }

    return sum / (data.length / 4)
  }

  private static calculateContrast(imageData: ImageData): number {
    const data = imageData.data
    const brightnesses: number[] = []

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      brightnesses.push(brightness)
    }

    const min = Math.min(...brightnesses)
    const max = Math.max(...brightnesses)

    return ((max - min) / 255) * 100
  }

  private static calculateEvenness(imageData: ImageData): number {
    const { width, height } = imageData
    const data = imageData.data

    // Divide image into 9 regions (3x3 grid)
    const regions = 9
    const regionWidth = Math.floor(width / 3)
    const regionHeight = Math.floor(height / 3)
    const regionBrightnesses: number[] = []

    for (let ry = 0; ry < 3; ry++) {
      for (let rx = 0; rx < 3; rx++) {
        let sum = 0
        let count = 0

        for (let y = ry * regionHeight; y < (ry + 1) * regionHeight; y++) {
          for (let x = rx * regionWidth; x < (rx + 1) * regionWidth; x++) {
            const idx = (y * width + x) * 4
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
            sum += brightness
            count++
          }
        }

        regionBrightnesses.push(sum / count)
      }
    }

    // Calculate standard deviation
    const mean = regionBrightnesses.reduce((a, b) => a + b) / regions
    const variance = regionBrightnesses.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / regions
    const stdDev = Math.sqrt(variance)

    // Convert to evenness score (lower stdDev = more even)
    return Math.max(0, 100 - (stdDev / mean) * 100)
  }

  private static detectColorTemperature(imageData: ImageData): "warm" | "neutral" | "cool" {
    const data = imageData.data
    let rSum = 0
    let bSum = 0

    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i]
      bSum += data[i + 2]
    }

    const rAvg = rSum / (data.length / 4)
    const bAvg = bSum / (data.length / 4)

    const ratio = rAvg / bAvg

    if (ratio > 1.1) return "warm"
    if (ratio < 0.9) return "cool"
    return "neutral"
  }

  private static calculateScore(brightness: number, contrast: number, evenness: number): number {
    // Ideal ranges
    const idealBrightness = 140
    const idealContrast = 50
    const _idealEvenness = 85

    // Calculate deviations
    const brightnessScore = Math.max(0, 100 - Math.abs(brightness - idealBrightness) / 1.4)
    const contrastScore = Math.max(0, 100 - Math.abs(contrast - idealContrast) / 0.5)
    const evennessScore = evenness

    // Weighted average
    return brightnessScore * 0.4 + contrastScore * 0.3 + evennessScore * 0.3
  }
}
