export interface LightingQualityResult {
  score: number // 0-1
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  brightness: number
  evenness: number // 0-100
  shadows: number
  contrast: number // 0-100
  sharpness: number // 0-100 (blur detection)
  colorCast: { r: number; g: number; b: number }
  recommendations: string[]
  canProceed: boolean // Whether quality is sufficient for accurate analysis
}

export class LightingQualityChecker {
  /**
   * Enhanced image quality analysis for accurate skin analysis
   * Uses multiple metrics: brightness, contrast, sharpness, evenness
   */
  analyzeLighting(image: ImageData): LightingQualityResult {
    const pixels = image.width * image.height
    
    // Calculate brightness and color channels
    let totalBrightness = 0
    let totalR = 0, totalG = 0, totalB = 0
    const brightnessValues: number[] = []
    
    for (let i = 0; i < image.data.length; i += 4) {
      const r = image.data[i]
      const g = image.data[i + 1]
      const b = image.data[i + 2]
      const brightness = (r + g + b) / 3
      
      totalBrightness += brightness
      totalR += r
      totalG += g
      totalB += b
      brightnessValues.push(brightness)
    }
    
    const avgBrightness = totalBrightness / pixels
    const avgR = totalR / pixels
    const avgG = totalG / pixels
    const avgB = totalB / pixels
    
    // Calculate contrast (standard deviation of brightness)
    let varianceSum = 0
    for (const b of brightnessValues) {
      varianceSum += Math.pow(b - avgBrightness, 2)
    }
    const stdDev = Math.sqrt(varianceSum / pixels)
    const contrast = Math.min(100, (stdDev / 128) * 100)
    
    // Calculate evenness (how uniform is the lighting)
    // High evenness = low variance in quadrants
    const quadrantBrightness = this.getQuadrantBrightness(image)
    const quadrantVariance = this.calculateVariance(quadrantBrightness)
    const evenness = Math.max(0, 100 - quadrantVariance)
    
    // Calculate sharpness using Laplacian variance
    const sharpness = this.calculateSharpness(image)
    
    // Detect color cast
    const colorCast = {
      r: Math.round(avgR - avgBrightness),
      g: Math.round(avgG - avgBrightness),
      b: Math.round(avgB - avgBrightness)
    }
    
    // Calculate shadow areas (dark regions)
    const darkPixels = brightnessValues.filter(b => b < 50).length
    const shadows = (darkPixels / pixels) * 100
    
    // Calculate overall score (weighted combination)
    const brightnessScore = this.scoreBrightness(avgBrightness)
    const contrastScore = Math.min(1, contrast / 50) // Good contrast around 50
    const sharpnessScore = sharpness / 100
    const evennessScore = evenness / 100
    
    const score = (
      brightnessScore * 0.3 +
      contrastScore * 0.2 +
      sharpnessScore * 0.3 +
      evennessScore * 0.2
    )
    
    // Determine quality level
    let quality: 'excellent' | 'good' | 'fair' | 'poor'
    if (score > 0.8) quality = 'excellent'
    else if (score > 0.65) quality = 'good'
    else if (score > 0.45) quality = 'fair'
    else quality = 'poor'
    
    // Generate recommendations
    const recommendations: string[] = []
    
    if (avgBrightness < 100) {
      recommendations.push('เพิ่มแสงสว่าง - ภาพค่อนข้างมืด')
    } else if (avgBrightness > 220) {
      recommendations.push('ลดแสง - ภาพสว่างเกินไป')
    }
    
    if (sharpness < 40) {
      recommendations.push('ภาพไม่คมชัด - ถือกล้องให้นิ่งหรือโฟกัสใหม่')
    }
    
    if (evenness < 50) {
      recommendations.push('แสงไม่สม่ำเสมอ - หลีกเลี่ยงเงาบนใบหน้า')
    }
    
    if (Math.abs(colorCast.r) > 30 || Math.abs(colorCast.b) > 30) {
      recommendations.push('สีภาพไม่เป็นธรรมชาติ - ใช้แสงธรรมชาติหรือ white balance')
    }
    
    // Can proceed with analysis if quality is at least "fair"
    const canProceed = quality !== 'poor'
    
    return {
      score,
      quality,
      brightness: avgBrightness,
      evenness,
      shadows,
      contrast,
      sharpness,
      colorCast,
      recommendations,
      canProceed
    }
  }
  
  private scoreBrightness(brightness: number): number {
    // Optimal brightness is around 140-180
    if (brightness >= 140 && brightness <= 180) return 1
    if (brightness >= 100 && brightness <= 220) return 0.8
    if (brightness >= 60 && brightness <= 240) return 0.5
    return 0.2
  }
  
  private getQuadrantBrightness(image: ImageData): number[] {
    const { width, height, data } = image
    const midX = Math.floor(width / 2)
    const midY = Math.floor(height / 2)
    const quadrants = [0, 0, 0, 0]
    const counts = [0, 0, 0, 0]
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
        const quadrant = (y < midY ? 0 : 2) + (x < midX ? 0 : 1)
        quadrants[quadrant] += brightness
        counts[quadrant]++
      }
    }
    
    return quadrants.map((sum, i) => sum / counts[i])
  }
  
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }
  
  private calculateSharpness(image: ImageData): number {
    // Laplacian variance for sharpness detection
    const { width, height, data } = image
    let laplacianSum = 0
    let count = 0
    
    // Sample every 4th pixel for performance
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const getGray = (px: number, py: number) => {
          const i = (py * width + px) * 4
          return (data[i] + data[i + 1] + data[i + 2]) / 3
        }
        
        // Laplacian kernel
        const center = getGray(x, y)
        const laplacian = Math.abs(
          -4 * center +
          getGray(x - 1, y) +
          getGray(x + 1, y) +
          getGray(x, y - 1) +
          getGray(x, y + 1)
        )
        
        laplacianSum += laplacian
        count++
      }
    }
    
    const avgLaplacian = laplacianSum / count
    // Normalize to 0-100 scale
    return Math.min(100, avgLaplacian * 2)
  }
}
