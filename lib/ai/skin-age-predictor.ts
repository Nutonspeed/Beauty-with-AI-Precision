/**
 * Skin Age Predictor & Future Skin Condition
 * 
 * Predicts skin aging and future condition 3-5 years ahead
 * Based on current skin analysis, lifestyle factors, and environmental data
 */

export interface SkinAgePrediction {
  currentSkinAge: number
  biologicalAge: number
  skinAgeGap: number // positive = skin older than actual age
  futureCondition: FutureSkinCondition
  agingFactors: AgingFactor[]
  recommendations: string[]
}

export interface FutureSkinCondition {
  year1: YearlyPrediction
  year3: YearlyPrediction
  year5: YearlyPrediction
}

export interface YearlyPrediction {
  year: number
  estimatedSkinAge: number
  predictedConcerns: {
    wrinkles: number // 0-100 severity
    spots: number
    pores: number
    elasticity: number
    hydration: number
    uvDamage: number
  }
  riskLevel: 'low' | 'moderate' | 'high'
  preventionTips: string[]
}

export interface AgingFactor {
  factor: string
  impact: 'high' | 'medium' | 'low'
  contribution: number // percentage
  description: string
  mitigation: string
}

export interface LifestyleFactors {
  sunExposure: 'low' | 'moderate' | 'high'
  smoking: boolean
  sleepHours: number
  stressLevel: 'low' | 'moderate' | 'high'
  hydrationLevel: 'poor' | 'adequate' | 'good'
  diet: 'poor' | 'average' | 'healthy'
  skinCareRoutine: 'none' | 'basic' | 'comprehensive'
}

// Aging rate multipliers based on research
const AGING_FACTORS = {
  sunExposure: { high: 1.8, moderate: 1.3, low: 1.0 },
  smoking: { yes: 1.5, no: 1.0 },
  sleep: { poor: 1.3, adequate: 1.0, good: 0.9 }, // <6h, 6-8h, >8h
  stress: { high: 1.4, moderate: 1.15, low: 1.0 },
  hydration: { poor: 1.25, adequate: 1.0, good: 0.95 },
  diet: { poor: 1.2, average: 1.0, healthy: 0.9 },
  skincare: { none: 1.3, basic: 1.0, comprehensive: 0.85 }
}

export class SkinAgePredictor {
  /**
   * Calculate current skin age based on analysis results
   */
  calculateSkinAge(analysisResults: {
    wrinkles: number
    spots: number
    pores: number
    elasticity: number
    uvDamage: number
    texture: number
  }, actualAge: number): number {
    // Weighted scoring for skin age calculation
    const weights = {
      wrinkles: 0.25,
      spots: 0.15,
      pores: 0.10,
      elasticity: 0.20,
      uvDamage: 0.20,
      texture: 0.10
    }

    // Base age deviation calculation
    // Higher scores = worse condition = older skin age
    const weightedScore = 
      (analysisResults.wrinkles * weights.wrinkles) +
      (analysisResults.spots * weights.spots) +
      (analysisResults.pores * weights.pores) +
      ((100 - analysisResults.elasticity) * weights.elasticity) + // inverse: lower elasticity = older
      (analysisResults.uvDamage * weights.uvDamage) +
      ((100 - analysisResults.texture) * weights.texture) // inverse: lower texture = older

    // Convert score to age deviation (-10 to +15 years from actual age)
    const ageDeviation = (weightedScore - 50) * 0.5

    return Math.round(actualAge + ageDeviation)
  }

  /**
   * Predict future skin condition
   */
  predictFutureSkin(
    currentAnalysis: {
      wrinkles: number
      spots: number
      pores: number
      elasticity: number
      uvDamage: number
      texture: number
    },
    actualAge: number,
    lifestyle: LifestyleFactors
  ): SkinAgePrediction {
    const currentSkinAge = this.calculateSkinAge(currentAnalysis, actualAge)
    const skinAgeGap = currentSkinAge - actualAge

    // Calculate total aging multiplier from lifestyle
    const agingMultiplier = this.calculateAgingMultiplier(lifestyle)

    // Generate predictions for 1, 3, 5 years
    const futureCondition: FutureSkinCondition = {
      year1: this.predictYear(currentAnalysis, 1, agingMultiplier, actualAge),
      year3: this.predictYear(currentAnalysis, 3, agingMultiplier, actualAge),
      year5: this.predictYear(currentAnalysis, 5, agingMultiplier, actualAge)
    }

    // Identify top aging factors
    const agingFactors = this.identifyAgingFactors(lifestyle, currentAnalysis)

    // Generate personalized recommendations
    const recommendations = this.generateRecommendations(agingFactors, currentAnalysis)

    return {
      currentSkinAge,
      biologicalAge: actualAge,
      skinAgeGap,
      futureCondition,
      agingFactors,
      recommendations
    }
  }

  private calculateAgingMultiplier(lifestyle: LifestyleFactors): number {
    let multiplier = 1.0

    multiplier *= AGING_FACTORS.sunExposure[lifestyle.sunExposure]
    multiplier *= lifestyle.smoking ? AGING_FACTORS.smoking.yes : AGING_FACTORS.smoking.no
    
    const sleepCategory = lifestyle.sleepHours < 6 ? 'poor' : lifestyle.sleepHours > 8 ? 'good' : 'adequate'
    multiplier *= AGING_FACTORS.sleep[sleepCategory]
    
    multiplier *= AGING_FACTORS.stress[lifestyle.stressLevel]
    multiplier *= AGING_FACTORS.hydration[lifestyle.hydrationLevel]
    multiplier *= AGING_FACTORS.diet[lifestyle.diet]
    multiplier *= AGING_FACTORS.skincare[lifestyle.skinCareRoutine]

    return multiplier
  }

  private predictYear(
    current: { wrinkles: number; spots: number; pores: number; elasticity: number; uvDamage: number; texture: number },
    years: number,
    multiplier: number,
    actualAge: number
  ): YearlyPrediction {
    // Natural aging rates per year (without lifestyle factors)
    const naturalRates = {
      wrinkles: 2.5,  // increases 2.5% per year naturally
      spots: 1.5,
      pores: 1.0,
      elasticity: -2.0, // decreases
      uvDamage: 1.8,
      texture: -1.5 // decreases
    }

    const predicted = {
      wrinkles: Math.min(100, current.wrinkles + (naturalRates.wrinkles * years * multiplier)),
      spots: Math.min(100, current.spots + (naturalRates.spots * years * multiplier)),
      pores: Math.min(100, current.pores + (naturalRates.pores * years * multiplier)),
      elasticity: Math.max(0, current.elasticity + (naturalRates.elasticity * years * multiplier)),
      uvDamage: Math.min(100, current.uvDamage + (naturalRates.uvDamage * years * multiplier)),
      hydration: Math.max(0, 70 - (years * 2 * multiplier)) // rough estimate
    }

    const avgSeverity = (predicted.wrinkles + predicted.spots + predicted.pores + predicted.uvDamage) / 4
    const riskLevel: 'low' | 'moderate' | 'high' = avgSeverity < 30 ? 'low' : avgSeverity < 60 ? 'moderate' : 'high'

    const preventionTips = this.getPreventionTips(predicted, years)

    return {
      year: years,
      estimatedSkinAge: Math.round(actualAge + years + (multiplier - 1) * years * 2),
      predictedConcerns: predicted,
      riskLevel,
      preventionTips
    }
  }

  private identifyAgingFactors(
    lifestyle: LifestyleFactors,
    analysis: { wrinkles: number; spots: number; uvDamage: number }
  ): AgingFactor[] {
    const factors: AgingFactor[] = []

    if (lifestyle.sunExposure === 'high' || analysis.uvDamage > 50) {
      factors.push({
        factor: 'UV Exposure',
        impact: 'high',
        contribution: 35,
        description: 'Sun damage is the #1 cause of premature aging',
        mitigation: 'Use SPF 50+ daily, wear protective clothing'
      })
    }

    if (lifestyle.smoking) {
      factors.push({
        factor: 'Smoking',
        impact: 'high',
        contribution: 25,
        description: 'Reduces blood flow and collagen production',
        mitigation: 'Quit smoking to slow skin aging significantly'
      })
    }

    if (lifestyle.stressLevel === 'high') {
      factors.push({
        factor: 'Chronic Stress',
        impact: 'medium',
        contribution: 15,
        description: 'Cortisol breaks down collagen and elastin',
        mitigation: 'Practice meditation, exercise, adequate sleep'
      })
    }

    if (lifestyle.sleepHours < 6) {
      factors.push({
        factor: 'Sleep Deprivation',
        impact: 'medium',
        contribution: 15,
        description: 'Skin repairs itself during sleep',
        mitigation: 'Aim for 7-9 hours of quality sleep'
      })
    }

    if (lifestyle.hydrationLevel === 'poor') {
      factors.push({
        factor: 'Dehydration',
        impact: 'medium',
        contribution: 10,
        description: 'Dry skin ages faster and shows more wrinkles',
        mitigation: 'Drink 8+ glasses of water daily'
      })
    }

    return factors.sort((a, b) => b.contribution - a.contribution)
  }

  private generateRecommendations(
    factors: AgingFactor[],
    analysis: { wrinkles: number; spots: number; pores: number; elasticity: number }
  ): string[] {
    const recommendations: string[] = []

    // Based on top aging factors
    factors.slice(0, 3).forEach(f => {
      recommendations.push(f.mitigation)
    })

    // Based on current analysis
    if (analysis.wrinkles > 40) {
      recommendations.push('Consider retinol products to reduce fine lines')
    }
    if (analysis.spots > 40) {
      recommendations.push('Use Vitamin C serum for pigmentation')
    }
    if (analysis.elasticity < 60) {
      recommendations.push('Add peptides and collagen-boosting treatments')
    }
    if (analysis.pores > 50) {
      recommendations.push('Use niacinamide to minimize pore appearance')
    }

    return [...new Set(recommendations)].slice(0, 6)
  }

  private getPreventionTips(predicted: Record<string, number>, years: number): string[] {
    const tips: string[] = []

    if (predicted.wrinkles > 50) {
      tips.push(`Start anti-aging routine now to prevent ${Math.round(predicted.wrinkles)}% wrinkle severity in ${years} years`)
    }
    if (predicted.uvDamage > 40) {
      tips.push('Daily SPF is critical - UV damage accumulates over time')
    }
    if (predicted.elasticity < 50) {
      tips.push('Consider professional treatments like microneedling for collagen stimulation')
    }

    return tips
  }
}

// Singleton instance
let predictor: SkinAgePredictor | null = null

export function getSkinAgePredictor(): SkinAgePredictor {
  if (!predictor) {
    predictor = new SkinAgePredictor()
  }
  return predictor
}

// Export utility function for quick prediction
export async function predictSkinFuture(
  analysisResults: {
    wrinkles: number
    spots: number
    pores: number
    elasticity: number
    uvDamage: number
    texture: number
  },
  actualAge: number,
  lifestyle?: Partial<LifestyleFactors>
): Promise<SkinAgePrediction> {
  const predictor = getSkinAgePredictor()
  
  // Default lifestyle if not provided
  const defaultLifestyle: LifestyleFactors = {
    sunExposure: 'moderate',
    smoking: false,
    sleepHours: 7,
    stressLevel: 'moderate',
    hydrationLevel: 'adequate',
    diet: 'average',
    skinCareRoutine: 'basic',
    ...lifestyle
  }

  return predictor.predictFutureSkin(analysisResults, actualAge, defaultLifestyle)
}
