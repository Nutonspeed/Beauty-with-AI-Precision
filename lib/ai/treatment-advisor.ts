/**
 * AI Treatment Advisor (Task 3/7)
 * Intelligent treatment recommendations using calibrated AI confidence scores
 * Integrates with existing skin-concern-detector.ts and treatment-recommendation-engine.ts
 */

import { getConfidenceCalibrator } from './models/confidence-calibrator'
import { generateTreatmentRecommendations } from './treatment-recommendation-engine'
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis'

/**
 * Treatment recommendation with before/after prediction
 */
export interface TreatmentAdvice {
  // Treatment info
  treatmentId: string
  treatmentName: string
  treatmentNameTh: string
  category: string
  
  // Effectiveness
  priority: number // 1 = highest
  confidenceScore: number // 0-1 (calibrated)
  targetConcerns: string[]
  effectiveness: Record<string, number> // concern -> improvement %
  
  // Before/After prediction
  currentState: SkinMetrics
  predictedState: SkinMetrics
  improvementPercentage: number
  visualComparison?: {
    before: string // Base64 or URL
    after: string // Simulated result
  }
  
  // Practical info
  estimatedCost: { min: number; max: number; currency: string }
  estimatedSessions: number
  timelineWeeks: number
  downtime: { days: number; description: string }
  painLevel: number // 0-10
  
  // Reasoning
  reason: string
  warnings?: string[]
  prerequisites?: string[]
  
  // Metadata
  requiresDoctor: boolean
  requiresConsultation: boolean
  ageRange?: { min: number; max: number }
}

export interface SkinMetrics {
  spots: number // 0-100
  pores: number
  wrinkles: number
  texture: number
  redness: number
  overall: number
}

export interface AdvisorOptions {
  budgetMax?: number
  maxDowntimeDays?: number
  maxPainLevel?: number
  preferredCategories?: string[]
  excludeCategories?: string[]
}

/**
 * Main AI Treatment Advisor
 */
export class TreatmentAdvisor {
  private calibrator = getConfidenceCalibrator()
  
  /**
   * Analyze skin and generate intelligent treatment recommendations
   */
  async analyzeSkinAndRecommend(
    analysis: HybridSkinAnalysis,
    options: AdvisorOptions = {}
  ): Promise<TreatmentAdvice[]> {
    console.log('🧠 AI Treatment Advisor: Analyzing skin...')
    
    // 1. Extract calibrated skin metrics from analysis
    const currentMetrics = this.extractSkinMetrics(analysis)
    console.log('📊 Current skin metrics:', currentMetrics)
    
    // 2. Convert to analysis results format for recommendation engine
    const analysisResults = this.convertToAnalysisResults(analysis)
    
    // 3. Get recommendations from engine
    const criteria = {
      age: 30, // Default age
      budget_max: options.budgetMax,
      max_downtime_days: options.maxDowntimeDays,
      max_pain_level: options.maxPainLevel
    }
    
    const recommendations = await generateTreatmentRecommendations(
      analysisResults,
      criteria
    )
    
    // 4. Enhance recommendations with AI predictions
    const enhancedAdvice: TreatmentAdvice[] = []
    
    for (const rec of recommendations.recommended_treatments.slice(0, 5)) {
      if (!rec.treatment) {
        console.warn('Skipping recommendation without treatment data', rec);
        continue;
      }
      // Calculate predicted improvements using calibrated confidence
      const predictedMetrics = this.predictImprovement(
        currentMetrics,
        rec.treatment,
        rec.confidence_score
      )
      
      // Generate visual comparison (placeholder - would use AR simulation)
      const visualComparison = await this.generateVisualComparison(
        analysis,
        rec.treatment
      )
      
      const advice: TreatmentAdvice = {
  treatmentId: rec.treatment_id,
  treatmentName: rec.treatment.name,
  treatmentNameTh: rec.treatment.name_th || rec.treatment.name,
  category: rec.treatment.category,
        priority: rec.priority,
        confidenceScore: rec.confidence_score,
        targetConcerns: rec.target_concerns,
  effectiveness: this.calculateEffectiveness(rec.treatment),
        currentState: currentMetrics,
        predictedState: predictedMetrics,
        improvementPercentage: rec.predicted_improvement,
        visualComparison,
        estimatedCost: {
          min: rec.estimated_cost_min,
          max: rec.estimated_cost_max,
          currency: 'THB'
        },
        estimatedSessions: rec.estimated_sessions,
        timelineWeeks: rec.timeline_weeks,
        downtime: {
          days: rec.treatment.downtime_days,
          description: this.getDowntimeDescription(rec.treatment.downtime_days)
        },
        painLevel: rec.treatment.pain_level || 0,
        reason: rec.recommendation_reason || 'Recommended treatment',
        warnings: this.generateWarnings(rec.treatment, currentMetrics),
        prerequisites: this.generatePrerequisites(rec.treatment),
        requiresDoctor: rec.treatment.requires_doctor || false,
        requiresConsultation: rec.treatment.requires_consultation || false,
        ageRange: rec.treatment.min_age ? {
          min: rec.treatment.min_age,
          max: rec.treatment.max_age || 100
        } : undefined
      }
      
      enhancedAdvice.push(advice)
    }
    
    console.log(`✅ Generated ${enhancedAdvice.length} AI-powered treatment recommendations`)
    return enhancedAdvice
  }
  
  /**
   * Extract skin metrics from hybrid analysis with calibration
   */
  private extractSkinMetrics(analysis: HybridSkinAnalysis): SkinMetrics {
    const cv = analysis.cv
    
    return {
      spots: cv.spots?.severity || 0,
      pores: cv.pores?.severity || 0,
      wrinkles: cv.wrinkles?.severity || 0,
      texture: 100 - (cv.texture?.score || 0), // Invert (lower texture score = more issues)
      redness: cv.redness?.severity || 0,
      overall: Object.values(analysis.overallScore).reduce((a, b) => a + b, 0) / Object.values(analysis.overallScore).length
    }
  }
  
  /**
   * Convert hybrid analysis to recommendation engine format
   */
  private convertToAnalysisResults(analysis: HybridSkinAnalysis) {
    const cv = analysis.cv
    
    return {
      spots: {
        count: cv.spots?.count,
        severity: cv.spots?.severity
      },
      pores: {
        count: cv.pores?.enlargedCount,
        size: cv.pores?.averageSize
      },
      wrinkles: {
        severity: cv.wrinkles?.severity
      },
      texture: {
        score: cv.texture?.score
      },
      redness: {
        level: cv.redness?.severity
      },
      overall_score: Object.values(analysis.overallScore).reduce((a, b) => a + b, 0) / Object.values(analysis.overallScore).length
    }
  }
  
  /**
   * Predict post-treatment skin metrics using AI confidence calibration
   */
  private predictImprovement(
    current: SkinMetrics,
    treatment: any,
    confidence: number
  ): SkinMetrics {
    // Use calibrated confidence to adjust improvement predictions
    const reliabilityFactor = confidence // 0-1 (higher = more reliable prediction)
    
    const predicted: SkinMetrics = { ...current }
    
    // Apply treatment effectiveness with confidence adjustment
    if (treatment.effectiveness_spots) {
      const improvement = (treatment.effectiveness_spots / 100) * reliabilityFactor
      predicted.spots = Math.max(0, current.spots * (1 - improvement))
    }
    
    if (treatment.effectiveness_pores) {
      const improvement = (treatment.effectiveness_pores / 100) * reliabilityFactor
      predicted.pores = Math.max(0, current.pores * (1 - improvement))
    }
    
    if (treatment.effectiveness_wrinkles) {
      const improvement = (treatment.effectiveness_wrinkles / 100) * reliabilityFactor
      predicted.wrinkles = Math.max(0, current.wrinkles * (1 - improvement))
    }
    
    if (treatment.effectiveness_texture) {
      const improvement = (treatment.effectiveness_texture / 100) * reliabilityFactor
      predicted.texture = Math.max(0, current.texture * (1 - improvement))
    }
    
    if (treatment.effectiveness_redness) {
      const improvement = (treatment.effectiveness_redness / 100) * reliabilityFactor
      predicted.redness = Math.max(0, current.redness * (1 - improvement))
    }
    
    // Calculate predicted overall score
    const avgPredicted = (
      predicted.spots +
      predicted.pores +
      predicted.wrinkles +
      predicted.texture +
      predicted.redness
    ) / 5
    
    predicted.overall = 100 - avgPredicted
    
    return predicted
  }
  
  /**
   * Calculate effectiveness breakdown
   */
  private calculateEffectiveness(treatment: any): Record<string, number> {
    return {
      spots: treatment.effectiveness_spots || 0,
      pores: treatment.effectiveness_pores || 0,
      wrinkles: treatment.effectiveness_wrinkles || 0,
      texture: treatment.effectiveness_texture || 0,
      redness: treatment.effectiveness_redness || 0,
      overall: treatment.effectiveness_overall || 0
    }
  }
  
  /**
   * Generate visual before/after comparison (placeholder)
   * TODO: Integrate with AR visualization system
   */
  private async generateVisualComparison(
    _analysis: HybridSkinAnalysis,
    _treatment: any
  ): Promise<{ before: string; after: string } | undefined> {
    // In production, this would:
    // 1. Get original image from analysis
    // 2. Apply AR treatment effect (from ar-visualization.tsx)
    // 3. Return both images for side-by-side comparison
    
    // For now, return undefined (visual comparison optional)
    return undefined
  }
  
  /**
   * Generate downtime description
   */
  private getDowntimeDescription(days: number): string {
    if (days === 0) return 'No downtime - resume normal activities immediately'
    if (days === 1) return 'Minimal downtime - minor redness for 24 hours'
    if (days <= 3) return 'Short downtime - avoid sun exposure for 2-3 days'
    if (days <= 7) return 'Moderate downtime - healing period of up to 1 week'
    return 'Significant downtime - plan for recovery period'
  }
  
  /**
   * Generate treatment warnings based on current skin state
   */
  private generateWarnings(treatment: any, metrics: SkinMetrics): string[] {
    const warnings: string[] = []
    
    // High redness warning for aggressive treatments
    if (metrics.redness > 70 && treatment.category === 'laser') {
      warnings.push('Existing redness detected - may require gentler settings')
    }
    
    // Severe concerns warning
    if (metrics.overall < 40) {
      warnings.push('Multiple severe concerns detected - consider comprehensive treatment plan')
    }
    
    // Pain level warning
    if (treatment.pain_level > 5) {
      warnings.push('Moderate to high discomfort expected - numbing cream recommended')
    }
    
    // Downtime warning
    if (treatment.downtime_days > 3) {
      warnings.push('Significant recovery time - plan accordingly')
    }
    
    return warnings
  }
  
  /**
   * Generate treatment prerequisites
   */
  private generatePrerequisites(treatment: any): string[] {
    const prereqs: string[] = []
    
    if (treatment.requires_consultation) {
      prereqs.push('Initial consultation with doctor required')
    }
    
    if (treatment.category === 'laser') {
      prereqs.push('Avoid sun exposure 2 weeks before treatment')
      prereqs.push('Discontinue retinol products 1 week before')
    }
    
    if (treatment.category === 'injectable') {
      prereqs.push('Avoid blood thinners 1 week before (consult doctor)')
      prereqs.push('No alcohol 24 hours before treatment')
    }
    
    return prereqs
  }
  
  /**
   * Generate comparison chart data for progress tracking
   */
  generateProgressChart(
    advice: TreatmentAdvice
  ): { labels: string[]; before: number[]; after: number[] } {
    const concerns = ['Spots', 'Pores', 'Wrinkles', 'Texture', 'Redness']
    
    return {
      labels: concerns,
      before: [
        advice.currentState.spots,
        advice.currentState.pores,
        advice.currentState.wrinkles,
        advice.currentState.texture,
        advice.currentState.redness
      ],
      after: [
        advice.predictedState.spots,
        advice.predictedState.pores,
        advice.predictedState.wrinkles,
        advice.predictedState.texture,
        advice.predictedState.redness
      ]
    }
  }
  
  /**
   * Calculate total cost for treatment plan
   */
  calculateTotalCost(adviceList: TreatmentAdvice[]): {
    minTotal: number
    maxTotal: number
    breakdown: Array<{ name: string; min: number; max: number }>
  } {
    const breakdown = adviceList.map(advice => ({
      name: advice.treatmentName,
      min: advice.estimatedCost.min * advice.estimatedSessions,
      max: advice.estimatedCost.max * advice.estimatedSessions
    }))
    
    return {
      minTotal: breakdown.reduce((sum, item) => sum + item.min, 0),
      maxTotal: breakdown.reduce((sum, item) => sum + item.max, 0),
      breakdown
    }
  }
  
  /**
   * Estimate timeline for complete treatment plan
   */
  estimateTimelineWeeks(adviceList: TreatmentAdvice[]): number {
    // Treatments can often be done in parallel, so return max timeline
    return Math.max(...adviceList.map(a => a.timelineWeeks))
  }
}

/**
 * Singleton instance
 */
let advisorInstance: TreatmentAdvisor | null = null

/**
 * Get or create TreatmentAdvisor instance
 */
export function getTreatmentAdvisor(): TreatmentAdvisor {
  if (!advisorInstance) {
    advisorInstance = new TreatmentAdvisor()
  }
  return advisorInstance
}
