/**
 * Outcome Prediction Model
 * Phase 3 Week 8-9 Task 8.1
 * 
 * Predicts treatment outcomes based on customer data and historical patterns
 */

import { createServerClient } from '@/lib/supabase/server';

// =============================================
// Types
// =============================================

export interface PredictionInput {
  customerId: string;
  currentAnalysisId: string;
  treatmentPlanId?: string;
}

export interface CustomerFeatures {
  // Demographics
  age: number;
  gender: 'male' | 'female' | 'other';
  skinType: string;
  
  // Current condition
  currentOverallScore: number;
  currentConcerns: {
    acne?: number;
    wrinkles?: number;
    texture?: number;
    pores?: number;
    hydration?: number;
  };
  
  // Historical patterns
  analysisCount: number;
  averageScore: number;
  scoreVariance: number;
  improvementRate: number; // % change per month
  
  // Treatment factors
  hasActiveTreatment: boolean;
  treatmentAdherence?: number; // 0-1
  monthsSinceTreatmentStart?: number;
  
  // Lifestyle factors (from profile)
  lifestyle?: {
    sleepHours?: number;
    stressLevel?: number; // 1-10
    sunExposure?: number; // 1-10
    skinCareRoutine?: 'none' | 'basic' | 'advanced';
  };
}

export interface PredictionResult {
  // Predicted scores (3 months ahead)
  predictedOverallScore: number;
  predictedConcerns: {
    acne?: number;
    wrinkles?: number;
    texture?: number;
    pores?: number;
    hydration?: number;
  };
  
  // Improvement metrics
  expectedImprovement: number; // Points
  expectedImprovementPercent: number; // %
  
  // Confidence
  confidence: number; // 0-1
  confidenceLevel: 'low' | 'medium' | 'high';
  
  // Factors influencing prediction
  keyFactors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  
  // Recommendations
  recommendations: string[];
  recommendationsTh: string[];
  
  // Timeframe
  predictionHorizon: '1 month' | '3 months' | '6 months';
  predictionDate: string;
}

// =============================================
// Feature Extraction
// =============================================

export class FeatureExtractor {
  private readonly supabase: Awaited<ReturnType<typeof createServerClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createServerClient>>) {
    this.supabase = supabase;
  }

  /**
   * Extract features from customer data
   */
  async extractFeatures(customerId: string, analysisId: string): Promise<CustomerFeatures> {
    // Get customer profile
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('date_of_birth, gender, skin_type, lifestyle_data')
      .eq('id', customerId)
      .single();

    // Calculate age
    let age = 30; // Default
    if (profile?.date_of_birth) {
      const birthDate = new Date(profile.date_of_birth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
    }

    // Get current analysis
    const { data: currentAnalysis } = await this.supabase
      .from('skin_analyses')
      .select('overall_score, ai_analysis')
      .eq('id', analysisId)
      .single();

    // Get historical analyses
    const { data: historicalAnalyses } = await this.supabase
      .from('skin_analyses')
      .select('overall_score, created_at, ai_analysis')
      .eq('user_id', customerId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Calculate historical metrics
    const analysisCount = historicalAnalyses?.length || 0;
    const scores = historicalAnalyses?.map((a: any) => a.overall_score) || [];
    const averageScore = scores.length > 0 
      ? scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length 
      : 0;
    
    // Calculate variance
    const scoreVariance = scores.length > 1
      ? this.calculateVariance(scores)
      : 0;

    // Calculate improvement rate
    const improvementRate = this.calculateImprovementRate(historicalAnalyses || []);

    // Extract current concerns
    const currentConcerns = this.extractConcerns(currentAnalysis?.ai_analysis);

    // Check for active treatment
    const { data: activeTreatment } = await this.supabase
      .from('treatment_plans')
      .select('id, created_at')
      .eq('user_id', customerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const hasActiveTreatment = !!activeTreatment;
    const monthsSinceTreatmentStart = activeTreatment
      ? this.calculateMonthsDiff(new Date(activeTreatment.created_at), new Date())
      : undefined;

    return {
      age,
      gender: profile?.gender || 'other',
      skinType: profile?.skin_type || 'normal',
      currentOverallScore: currentAnalysis?.overall_score || 0,
      currentConcerns,
      analysisCount,
      averageScore,
      scoreVariance,
      improvementRate,
      hasActiveTreatment,
      monthsSinceTreatmentStart,
      lifestyle: profile?.lifestyle_data as CustomerFeatures['lifestyle'],
    };
  }

  /**
   * Extract concerns from AI analysis
   */
  private extractConcerns(aiAnalysis: any): CustomerFeatures['currentConcerns'] {
    if (!aiAnalysis) return {};

    const concerns: CustomerFeatures['currentConcerns'] = {};
    
    if (aiAnalysis.scores) {
      concerns.acne = aiAnalysis.scores.acne;
      concerns.wrinkles = aiAnalysis.scores.wrinkles || aiAnalysis.scores.aging;
      concerns.texture = aiAnalysis.scores.texture;
      concerns.pores = aiAnalysis.scores.pores;
      concerns.hydration = aiAnalysis.scores.hydration || aiAnalysis.scores.moisture;
    } else if (aiAnalysis.metrics) {
      concerns.acne = aiAnalysis.metrics.acne;
      concerns.wrinkles = aiAnalysis.metrics.wrinkles || aiAnalysis.metrics.aging;
      concerns.texture = aiAnalysis.metrics.texture;
      concerns.pores = aiAnalysis.metrics.pores;
      concerns.hydration = aiAnalysis.metrics.hydration || aiAnalysis.metrics.moisture;
    }

    return concerns;
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
  }

  /**
   * Calculate improvement rate
   */
  private calculateImprovementRate(analyses: any[]): number {
    if (analyses.length < 2) return 0;

    const first = analyses[0];
    const last = analyses.at(-1);
    
    const scoreDiff = last.overall_score - first.overall_score;
    const monthsDiff = this.calculateMonthsDiff(
      new Date(first.created_at),
      new Date(last.created_at)
    );

    if (monthsDiff === 0) return 0;
    return scoreDiff / monthsDiff;
  }

  /**
   * Calculate months difference
   */
  private calculateMonthsDiff(start: Date, end: Date): number {
    const yearsDiff = end.getFullYear() - start.getFullYear();
    const monthsDiff = end.getMonth() - start.getMonth();
    return yearsDiff * 12 + monthsDiff;
  }
}

// =============================================
// Prediction Model
// =============================================

export class OutcomePredictor {
  /**
   * Predict treatment outcomes
   */
  async predict(input: PredictionInput): Promise<PredictionResult> {
    const supabase = await createServerClient();
    
    // Extract features
    const extractor = new FeatureExtractor(supabase);
    const features = await extractor.extractFeatures(
      input.customerId,
      input.currentAnalysisId
    );

    // Use rule-based model (can be replaced with ML model later)
    const prediction = this.predictWithRules(features);

    return prediction;
  }

  /**
   * Rule-based prediction
   * TODO: Replace with trained ML model
   */
  private predictWithRules(features: CustomerFeatures): PredictionResult {
    const baseScore = features.currentOverallScore;
    
    // Calculate expected improvement based on factors
    let improvementPoints = 0;
    let confidence = 0.7; // Base confidence
    const keyFactors: PredictionResult['keyFactors'] = [];

    // Factor 1: Active treatment (+5 to +15 points)
    if (features.hasActiveTreatment) {
      const treatmentBonus = 10;
      improvementPoints += treatmentBonus;
      confidence += 0.1;
      keyFactors.push({
        factor: 'Active treatment plan',
        impact: 'positive',
        weight: 0.3,
      });
    }

    // Factor 2: Historical improvement rate
    if (features.improvementRate > 0) {
      const projectedImprovement = features.improvementRate * 3; // 3 months
      improvementPoints += projectedImprovement;
      confidence += 0.1;
      keyFactors.push({
        factor: 'Positive improvement trend',
        impact: 'positive',
        weight: 0.25,
      });
    } else if (features.improvementRate < 0) {
      improvementPoints += features.improvementRate * 3;
      keyFactors.push({
        factor: 'Declining skin condition',
        impact: 'negative',
        weight: 0.25,
      });
    }

    // Factor 3: Age (younger = better improvement potential)
    if (features.age < 30) {
      improvementPoints += 3;
      keyFactors.push({
        factor: 'Young age (better healing)',
        impact: 'positive',
        weight: 0.15,
      });
    } else if (features.age > 50) {
      improvementPoints -= 2;
      keyFactors.push({
        factor: 'Mature skin (slower improvement)',
        impact: 'negative',
        weight: 0.15,
      });
    }

    // Factor 4: Consistency (low variance = better)
    if (features.scoreVariance < 50) {
      improvementPoints += 2;
      confidence += 0.05;
      keyFactors.push({
        factor: 'Consistent skin condition',
        impact: 'positive',
        weight: 0.1,
      });
    }

    // Factor 5: Lifestyle factors
    if (features.lifestyle) {
      if (features.lifestyle.sleepHours && features.lifestyle.sleepHours >= 7) {
        improvementPoints += 2;
        keyFactors.push({
          factor: 'Good sleep habits',
          impact: 'positive',
          weight: 0.1,
        });
      }
      
      if (features.lifestyle.stressLevel && features.lifestyle.stressLevel > 7) {
        improvementPoints -= 3;
        keyFactors.push({
          factor: 'High stress level',
          impact: 'negative',
          weight: 0.15,
        });
      }
    }

    // Calculate predicted score
    const predictedOverallScore = Math.max(0, Math.min(100, baseScore + improvementPoints));
    const expectedImprovement = predictedOverallScore - baseScore;
    const expectedImprovementPercent = baseScore > 0 
      ? (expectedImprovement / baseScore) * 100 
      : 0;

    // Predict individual concerns
    const predictedConcerns: PredictionResult['predictedConcerns'] = {};
    for (const key of Object.keys(features.currentConcerns)) {
      const concernKey = key as keyof typeof features.currentConcerns;
      const currentValue = features.currentConcerns[concernKey] || 0;
      const improvement = improvementPoints * 0.8; // Slightly less improvement per concern
      predictedConcerns[concernKey] = Math.max(0, Math.min(100, currentValue + improvement));
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(features, improvementPoints);

    // Determine confidence level
    let confidenceLevel: 'low' | 'medium' | 'high' = 'low';
    if (confidence >= 0.8) {
      confidenceLevel = 'high';
    } else if (confidence >= 0.6) {
      confidenceLevel = 'medium';
    }

    return {
      predictedOverallScore,
      predictedConcerns,
      expectedImprovement,
      expectedImprovementPercent,
      confidence,
      confidenceLevel,
      keyFactors,
      recommendations: recommendations.en,
      recommendationsTh: recommendations.th,
      predictionHorizon: '3 months',
      predictionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    features: CustomerFeatures,
    expectedImprovement: number
  ): { en: string[]; th: string[] } {
    const en: string[] = [];
    const th: string[] = [];

    // Treatment recommendations
    if (!features.hasActiveTreatment) {
      en.push('Start a personalized treatment plan to see faster results');
      th.push('เริ่มแผนการรักษาเฉพาะบุคคลเพื่อเห็นผลเร็วขึ้น');
    }

    // Consistency recommendations
    if (features.analysisCount < 3) {
      en.push('Track your progress regularly with monthly analyses');
      th.push('ติดตามความคืบหน้าอย่างสม่ำเสมอด้วยการวิเคราะห์รายเดือน');
    }

    // Lifestyle recommendations
    if (features.lifestyle?.sleepHours && features.lifestyle.sleepHours < 7) {
      en.push('Improve sleep quality to 7-8 hours per night for better skin health');
      th.push('พักผ่อนให้เพียงพอ 7-8 ชั่วโมงต่อคืนเพื่อสุขภาพผิวที่ดีขึ้น');
    }

    if (features.lifestyle?.stressLevel && features.lifestyle.stressLevel > 7) {
      en.push('Practice stress management techniques for improved skin condition');
      th.push('ฝึกการจัดการความเครียดเพื่อสภาพผิวที่ดีขึ้น');
    }

    // Age-specific recommendations
    if (features.age > 35 && features.currentConcerns.wrinkles && features.currentConcerns.wrinkles < 70) {
      en.push('Consider anti-aging treatments like retinol or peptides');
      th.push('พิจารณาการรักษาต้านริ้วรอยเช่น retinol หรือ peptides');
    }

    // Concern-specific recommendations
    if (features.currentConcerns.acne && features.currentConcerns.acne < 70) {
      en.push('Focus on acne-targeted treatments and consistent cleansing routine');
      th.push('เน้นการรักษาสิวและทำความสะอาดผิวอย่างสม่ำเสมอ');
    }

    if (features.currentConcerns.hydration && features.currentConcerns.hydration < 70) {
      en.push('Increase water intake and use hydrating serums');
      th.push('ดื่มน้ำให้เพียงพอและใช้เซรั่มเพิ่มความชุ่มชื้น');
    }

    // Default recommendation
    if (en.length === 0) {
      en.push('Continue your current routine and track progress monthly');
      th.push('ดำเนินกิจวัตรปัจจุบันต่อและติดตามความคืบหน้าทุกเดือน');
    }

    return { en, th };
  }
}

// =============================================
// Factory Function
// =============================================

export function createOutcomePredictor(): OutcomePredictor {
  return new OutcomePredictor();
}
