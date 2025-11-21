/**
 * AI-Powered Skin Concern Priority Ranking System
 * 
 * Automatically ranks detected skin concerns by severity, urgency, and treatment priority
 * Uses VISIA parameter scores, percentiles, trends, and medical urgency factors
 */

import { HybridSkinAnalysis, SkinConcern } from '@/lib/types/skin-analysis';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';
export type UrgencyLevel = 'immediate' | 'urgent' | 'moderate' | 'low';
export type TreatmentComplexity = 'simple' | 'moderate' | 'complex';

export interface SkinConcernPriority {
  concern: SkinConcern;
  parameter: string; // VISIA parameter name
  priority: PriorityLevel;
  urgency: UrgencyLevel;
  severity: number; // 1-10 normalized score
  percentile: number; // 0-100 (how bad compared to others)
  score: number; // Overall priority score (0-100)
  treatmentComplexity: TreatmentComplexity;
  estimatedTreatmentWeeks: number;
  improvementPotential: number; // 0-100 (how much improvement possible)
  reasons: string[]; // Why this priority level
  recommendations: string[];
}

export interface PriorityRankingResult {
  ranked: SkinConcernPriority[];
  topPriorities: SkinConcernPriority[]; // Top 3 concerns
  quickWins: SkinConcernPriority[]; // Easy improvements
  longTermGoals: SkinConcernPriority[]; // Complex treatments
  overallSeverity: PriorityLevel;
  treatmentPhases: {
    phase: number;
    concerns: SkinConcernPriority[];
    estimatedWeeks: number;
    description: string;
  }[];
}

export interface TrendData {
  parameter: string;
  previousScore?: number;
  currentScore: number;
  change?: number; // Positive = getting worse, Negative = improving
  trend: 'improving' | 'stable' | 'worsening' | 'unknown';
}

// ============================================================================
// Constants & Weights
// ============================================================================

// Medical urgency weights (higher = more urgent)
const MEDICAL_URGENCY_WEIGHTS: Record<string, number> = {
  redness: 1.3, // Inflammation can worsen quickly
  acne: 1.2, // Can cause scarring
  hyperpigmentation: 0.9,
  dark_spots: 0.9,
  wrinkles: 0.7, // Aging is gradual
  fine_lines: 0.7,
  large_pores: 0.6,
  dullness: 0.5,
  blackheads: 0.8,
};

// Treatment complexity mapping
const TREATMENT_COMPLEXITY: Record<string, TreatmentComplexity> = {
  dullness: 'simple',
  blackheads: 'simple',
  large_pores: 'moderate',
  fine_lines: 'moderate',
  dark_spots: 'moderate',
  hyperpigmentation: 'moderate',
  redness: 'moderate',
  acne: 'moderate',
  wrinkles: 'complex',
};

// Estimated treatment duration (weeks)
const TREATMENT_DURATION: Record<string, number> = {
  dullness: 4,
  blackheads: 6,
  large_pores: 8,
  redness: 8,
  fine_lines: 12,
  dark_spots: 12,
  hyperpigmentation: 16,
  acne: 12,
  wrinkles: 24,
};

// Improvement potential (how much improvement is realistic)
const IMPROVEMENT_POTENTIAL: Record<string, number> = {
  dullness: 90,
  blackheads: 85,
  redness: 80,
  acne: 75,
  large_pores: 70,
  fine_lines: 70,
  dark_spots: 75,
  hyperpigmentation: 70,
  wrinkles: 50,
};

// ============================================================================
// Core Priority Ranking Algorithm
// ============================================================================

/**
 * Main function to rank skin concerns by priority
 */
export function rankSkinConcernPriorities(
  analysis: HybridSkinAnalysis,
  previousAnalysis?: HybridSkinAnalysis
): PriorityRankingResult {
  // Extract concerns from analysis
  const concerns = extractConcerns(analysis);
  
  // Calculate trends if previous analysis available
  const trends = previousAnalysis
    ? calculateTrends(analysis, previousAnalysis)
    : [];

  // Rank each concern
  const ranked = concerns.map((concern) => {
    const trend = trends.find((t) => t.parameter === concern.parameter);
    return calculateConcernPriority(concern, analysis, trend);
  });

  // Sort by priority score (highest first)
  ranked.sort((a, b) => b.score - a.score);

  // Extract top priorities (top 3)
  const topPriorities = ranked.slice(0, 3);

  // Find quick wins (simple treatments with high improvement potential)
  const quickWins = ranked
    .filter(
      (r) =>
        r.treatmentComplexity === 'simple' &&
        r.improvementPotential >= 80 &&
        r.estimatedTreatmentWeeks <= 8
    )
    .slice(0, 3);

  // Find long-term goals (complex treatments)
  const longTermGoals = ranked
    .filter((r) => r.treatmentComplexity === 'complex')
    .slice(0, 2);

  // Calculate overall severity
  const avgScore = ranked.reduce((sum, r) => sum + r.score, 0) / ranked.length;
  const overallSeverity = scoreToSeverity(avgScore);

  // Generate treatment phases
  const treatmentPhases = generateTreatmentPhases(ranked);

  return {
    ranked,
    topPriorities,
    quickWins,
    longTermGoals,
    overallSeverity,
    treatmentPhases,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract concerns from analysis with normalized scores
 */
function extractConcerns(
  analysis: HybridSkinAnalysis
): Array<{
  concern: SkinConcern;
  parameter: string;
  severity: number;
  percentile: number;
}> {
  const concerns: Array<{
    concern: SkinConcern;
    parameter: string;
    severity: number;
    percentile: number;
  }> = [];

  // Map VISIA parameters to concerns
  const parameterMap: Record<
    string,
    { concern: SkinConcern; score: number; percentile: number }
  > = {
    spots: {
      concern: 'dark_spots',
      score: analysis.overallScore.spots,
      percentile: analysis.percentiles.spots,
    },
    pores: {
      concern: 'large_pores',
      score: analysis.overallScore.pores,
      percentile: analysis.percentiles.pores,
    },
    wrinkles: {
      concern: 'wrinkles',
      score: analysis.overallScore.wrinkles,
      percentile: analysis.percentiles.wrinkles,
    },
    texture: {
      concern: 'dullness',
      score: analysis.overallScore.texture,
      percentile: analysis.percentiles.texture,
    },
    redness: {
      concern: 'redness',
      score: analysis.overallScore.redness,
      percentile: analysis.percentiles.redness,
    },
    pigmentation: {
      concern: 'hyperpigmentation',
      score: analysis.overallScore.pigmentation,
      percentile: 50, // Default if not available
    },
  };

  // Add concerns with severity > 3 (significant issues)
  for (const [param, data] of Object.entries(parameterMap)) {
    if (data.score >= 3) {
      concerns.push({
        concern: data.concern,
        parameter: param,
        severity: data.score,
        percentile: data.percentile,
      });
    }
  }

  // Add AI-detected concerns
  if (analysis.ai?.concerns) {
    for (const concern of analysis.ai.concerns) {
      // Check if not already added
      if (!concerns.some((c) => c.concern === concern)) {
        const severity = analysis.ai.severity?.[concern] || 5;
        concerns.push({
          concern,
          parameter: concernToParameter(concern),
          severity,
          percentile: 50, // Default percentile
        });
      }
    }
  }

  return concerns;
}

/**
 * Map concern back to VISIA parameter
 */
function concernToParameter(concern: SkinConcern): string {
  const map: Record<SkinConcern, string> = {
    dark_spots: 'spots',
    large_pores: 'pores',
    wrinkles: 'wrinkles',
    fine_lines: 'wrinkles',
    dullness: 'texture',
    redness: 'redness',
    hyperpigmentation: 'pigmentation',
    acne: 'redness',
    blackheads: 'pores',
    spots: 'spots',
    pores: 'pores',
    texture: 'texture',
  };
  return map[concern] || 'unknown';
}

/**
 * Calculate trends between current and previous analysis
 */
function calculateTrends(
  current: HybridSkinAnalysis,
  previous: HybridSkinAnalysis
): TrendData[] {
  const trends: TrendData[] = [];

  const parameters = ['spots', 'pores', 'wrinkles', 'texture', 'redness'] as const;

  for (const param of parameters) {
    const currentScore = current.overallScore[param];
    const previousScore = previous.overallScore[param];
    const change = currentScore - previousScore;

    let trend: TrendData['trend'] = 'stable';
    if (change > 0.5) trend = 'worsening';
    else if (change < -0.5) trend = 'improving';

    trends.push({
      parameter: param,
      previousScore,
      currentScore,
      change,
      trend,
    });
  }

  return trends;
}

/**
 * Calculate priority for a single concern
 */
function calculateConcernPriority(
  concern: {
    concern: SkinConcern;
    parameter: string;
    severity: number;
    percentile: number;
  },
  analysis: HybridSkinAnalysis,
  trend?: TrendData
): SkinConcernPriority {
  // Base score from severity (0-10 normalized to 0-40)
  let score = (concern.severity / 10) * 40;

  // Add percentile factor (0-100 normalized to 0-30)
  score += (concern.percentile / 100) * 30;

  // Add medical urgency weight (0-20 points)
  const urgencyWeight = MEDICAL_URGENCY_WEIGHTS[concern.concern] || 1;
  score += urgencyWeight * 20;

  // Trend factor (0-10 points)
  if (trend) {
    if (trend.trend === 'worsening') {
      score += 10;
    } else if (trend.trend === 'improving') {
      score -= 5;
    }
  }

  // Normalize to 0-100
  score = Math.min(Math.max(score, 0), 100);

  // Determine priority level
  const priority = scoreToSeverity(score);

  // Determine urgency
  const urgency = calculateUrgency(score, trend);

  // Get treatment metadata
  const treatmentComplexity = TREATMENT_COMPLEXITY[concern.concern] || 'moderate';
  const estimatedTreatmentWeeks = TREATMENT_DURATION[concern.concern] || 12;
  const improvementPotential = IMPROVEMENT_POTENTIAL[concern.concern] || 70;

  // Generate reasons
  const reasons = generateReasons(concern, score, trend);

  // Generate recommendations
  const recommendations = generateRecommendations(concern, priority, analysis);

  return {
    concern: concern.concern,
    parameter: concern.parameter,
    priority,
    urgency,
    severity: concern.severity,
    percentile: concern.percentile,
    score,
    treatmentComplexity,
    estimatedTreatmentWeeks,
    improvementPotential,
    reasons,
    recommendations,
  };
}

/**
 * Convert numeric score to severity level
 */
function scoreToSeverity(score: number): PriorityLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'minimal';
}

/**
 * Calculate urgency level
 */
function calculateUrgency(score: number, trend?: TrendData): UrgencyLevel {
  if (score >= 80 && trend?.trend === 'worsening') return 'immediate';
  if (score >= 70) return 'urgent';
  if (score >= 50) return 'moderate';
  return 'low';
}

/**
 * Generate human-readable reasons for priority
 */
function generateReasons(
  concern: {
    concern: SkinConcern;
    parameter: string;
    severity: number;
    percentile: number;
  },
  score: number,
  trend?: TrendData
): string[] {
  const reasons: string[] = [];

  if (concern.severity >= 7) {
    reasons.push('มีความรุนแรงสูง (Severe condition detected)');
  }

  if (concern.percentile >= 75) {
    reasons.push(
      `อยู่ใน ${Math.round(100 - concern.percentile)}% แรกที่มีปัญหามากที่สุด (Top ${Math.round(100 - concern.percentile)}% worst cases)`
    );
  }

  if (trend?.trend === 'worsening') {
    reasons.push('มีแนวโน้มแย่ลงอย่างต่อเนื่อง (Worsening trend detected)');
  }

  if (
    concern.concern === 'acne' ||
    concern.concern === 'redness'
  ) {
    reasons.push('สามารถก่อให้เกิดรอยแผลเป็นถ้าไม่รักษา (Can cause permanent scarring)');
  }

  if (concern.concern === 'hyperpigmentation' || concern.concern === 'dark_spots') {
    reasons.push('จะทวีความรุนแรงมากขึ้นหากโดนแสงแดด (Worsens with sun exposure)');
  }

  if (reasons.length === 0) {
    reasons.push('ควรดูแลเพื่อป้องกันปัญหาในอนาคต (Preventive care recommended)');
  }

  return reasons;
}

/**
 * Generate treatment recommendations
 */
function generateRecommendations(
  concern: {
    concern: SkinConcern;
    parameter: string;
    severity: number;
    percentile: number;
  },
  priority: PriorityLevel,
  _analysis: HybridSkinAnalysis
): string[] {
  const recs: string[] = [];

  const recommendationMap: Record<SkinConcern, string[]> = {
    acne: [
      'Acne Treatment (Salicylic Acid, Benzoyl Peroxide)',
      'Professional Extraction',
      'Light Therapy (Blue/Red LED)',
      'Chemical Peel (BHA)',
    ],
    wrinkles: [
      'Botox/Filler Consultation',
      'Retinol Serum (nightly)',
      'RF Microneedling',
      'HIFU (High-Intensity Focused Ultrasound)',
    ],
    dark_spots: [
      'Vitamin C Serum',
      'Laser Treatment (Q-Switch)',
      'Chemical Peel (AHA)',
      'Hydroquinone Cream',
    ],
    large_pores: [
      'BHA Exfoliation',
      'Niacinamide Serum',
      'Micro-dermabrasion',
      'RF Fractional',
    ],
    redness: [
      'Soothing Cream (Centella)',
      'IPL Treatment',
      'Laser (V-Beam)',
      'Anti-inflammatory Serum',
    ],
    dullness: [
      'Vitamin C Serum',
      'AHA Exfoliation',
      'Hydrating Mask',
      'Glow Peel',
    ],
    fine_lines: [
      'Retinol Serum',
      'Peptide Cream',
      'Mesotherapy',
      'Micro-needling',
    ],
    blackheads: [
      'BHA Cleanser',
      'Clay Mask',
      'Professional Extraction',
      'Pore Vacuum Treatment',
    ],
    hyperpigmentation: [
      'Melasma Treatment Protocol',
      'Tranexamic Acid',
      'Laser Toning',
      'Brightening Serum',
    ],
    spots: [
      'Spot Corrector Serum',
      'Targeted Laser Treatment',
      'Brightening Peel',
      'Broad-Spectrum Sunscreen (SPF 50+)',
    ],
    pores: [
      'Deep Pore Cleansing Facial',
      'Niacinamide Booster',
      'Fractional Laser Resurfacing',
      'Clay & Charcoal Mask',
    ],
    texture: [
      'Microdermabrasion',
      'Retexturizing Serum (AHA/BHA)',
      'Dermaplaning Treatment',
      'LED Phototherapy',
    ],
  };

  const treatments = recommendationMap[concern.concern] || [];

  if (priority === 'critical' || priority === 'high') {
    recs.push(
      ...treatments.slice(0, 3),
      'นัดหมายให้เร็วที่สุด (Book appointment ASAP)'
    );
  } else if (priority === 'medium') {
    recs.push(
      ...treatments.slice(0, 2),
      'เริ่มใช้ผลิตภัณฑ์บำรุงผิวที่เหมาะสม (Start appropriate skincare)'
    );
  } else {
    recs.push(
      treatments[0] || 'General skincare routine',
      'ติดตามอาการเป็นประจำ (Monitor regularly)'
    );
  }

  return recs;
}

/**
 * Generate treatment phases (step-by-step plan)
 */
function generateTreatmentPhases(
  ranked: SkinConcernPriority[]
): Array<{
  phase: number;
  concerns: SkinConcernPriority[];
  estimatedWeeks: number;
  description: string;
}> {
  const phases: Array<{
    phase: number;
    concerns: SkinConcernPriority[];
    estimatedWeeks: number;
    description: string;
  }> = [];

  // Phase 1: Critical & High Priority (immediate action)
  const phase1 = ranked.filter(
    (r) => r.priority === 'critical' || r.priority === 'high'
  );
  if (phase1.length > 0) {
    phases.push({
      phase: 1,
      concerns: phase1,
      estimatedWeeks: Math.max(...phase1.map((c) => c.estimatedTreatmentWeeks)),
      description: 'ฉุกเฉิน: ดูแลปัญหาที่มีความรุนแรงสูงก่อน (Critical: Address severe issues first)',
    });
  }

  // Phase 2: Medium Priority (follow-up treatment)
  const phase2 = ranked.filter((r) => r.priority === 'medium');
  if (phase2.length > 0) {
    phases.push({
      phase: 2,
      concerns: phase2,
      estimatedWeeks: Math.max(...phase2.map((c) => c.estimatedTreatmentWeeks)),
      description: 'ติดตาม: ดูแลปัญหารองหลังจากแก้ไขปัญหาหลัก (Follow-up: Address secondary concerns)',
    });
  }

  // Phase 3: Low Priority (maintenance)
  const phase3 = ranked.filter(
    (r) => r.priority === 'low' || r.priority === 'minimal'
  );
  if (phase3.length > 0) {
    phases.push({
      phase: 3,
      concerns: phase3,
      estimatedWeeks: 8,
      description: 'บำรุงรักษา: ดูแลเพื่อป้องกันและรักษาผลลัพธ์ (Maintenance: Prevent and maintain results)',
    });
  }

  return phases;
}

// ============================================================================
// Utility Functions for UI
// ============================================================================

/**
 * Get color for priority level (for UI display)
 */
export function getPriorityColor(priority: PriorityLevel): string {
  const colors: Record<PriorityLevel, string> = {
    critical: '#DC2626', // red-600
    high: '#EA580C', // orange-600
    medium: '#CA8A04', // yellow-600
    low: '#16A34A', // green-600
    minimal: '#059669', // emerald-600
  };
  return colors[priority];
}

/**
 * Get icon for priority level (for UI display)
 */
export function getPriorityIcon(priority: PriorityLevel): string {
  const icons: Record<PriorityLevel, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
    minimal: '✅',
  };
  return icons[priority];
}

/**
 * Format priority ranking for customer display
 */
export function formatPriorityRankingForCustomer(
  result: PriorityRankingResult,
  locale: 'th' | 'en' = 'th'
): {
  summary: string;
  topConcerns: string[];
  quickWins: string[];
  treatmentPlan: string[];
} {
  const isEn = locale === 'en';

  const summary = isEn
    ? `Your skin analysis shows ${result.overallSeverity} overall condition with ${result.ranked.length} concerns detected.`
    : `ผลการวิเคราะห์ผิวพบสภาพผิวโดยรวมอยู่ในระดับ ${result.overallSeverity} มีปัญหาทั้งหมด ${result.ranked.length} ประการ`;

  const topConcerns = result.topPriorities.map((p, i) =>
    isEn
      ? `${i + 1}. ${p.concern} (${p.priority} priority, ${p.estimatedTreatmentWeeks} weeks treatment)`
      : `${i + 1}. ${p.concern} (ระดับ ${p.priority}, ใช้เวลารักษา ${p.estimatedTreatmentWeeks} สัปดาห์)`
  );

  const quickWins = result.quickWins.map((p) =>
    isEn
      ? `${p.concern}: ${p.improvementPotential}% improvement potential in ${p.estimatedTreatmentWeeks} weeks`
      : `${p.concern}: โอกาสปรับปรุง ${p.improvementPotential}% ภายใน ${p.estimatedTreatmentWeeks} สัปดาห์`
  );

  const treatmentPlan = result.treatmentPhases.map((phase) =>
    isEn
      ? `Phase ${phase.phase} (${phase.estimatedWeeks} weeks): ${phase.description}`
      : `ระยะที่ ${phase.phase} (${phase.estimatedWeeks} สัปดาห์): ${phase.description}`
  );

  return {
    summary,
    topConcerns,
    quickWins,
    treatmentPlan,
  };
}
