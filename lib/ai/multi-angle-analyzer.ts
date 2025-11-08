export interface AngleAnalysis {
  score: number
  severity: number // 0-100
  details: string[]
}

export interface MultiAngleResult {
  wrinkles: AngleAnalysis
  pores: AngleAnalysis
  texture: AngleAnalysis
  combinedScore: number
  angleScores: {
    front: number
    left: number
    right: number
  }
}

export class MultiAngleAnalyzer {
  analyzeSkin(front: ImageData, left: ImageData, right: ImageData): MultiAngleResult {
    const frontScore = this.avgBrightness(front) / 255
    const leftScore = this.avgBrightness(left) / 255
    const rightScore = this.avgBrightness(right) / 255

    const weighted = frontScore * 0.5 + (leftScore + rightScore) * 0.25

    const mk = (s: number): AngleAnalysis => ({
      score: s,
      severity: Math.round((1 - s) * 100),
      details: [],
    })

    return {
      wrinkles: mk(weighted),
      pores: mk(weighted * 0.95),
  texture: mk(Math.min(1, weighted * 1.05)),
      combinedScore: weighted,
      angleScores: { front: frontScore, left: leftScore, right: rightScore },
    }
  }

  private avgBrightness(img: ImageData): number {
    let sum = 0
    for (let i = 0; i < img.data.length; i += 4) {
      sum += (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3
    }
    return sum / (img.width * img.height)
  }
}
