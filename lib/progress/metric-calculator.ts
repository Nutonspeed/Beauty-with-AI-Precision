/**
 * Metric Calculator
 * 
 * Calculate improvement metrics between before/after photos
 */

import { ProgressPhoto, ProgressComparison } from '@/types/progress';

interface MetricDelta {
  absolute: number; // Raw change in count/score
  percentage: number; // % improvement
  trend: 'improving' | 'worsening' | 'stable';
}

interface ImprovementMetrics {
  spots: MetricDelta;
  pores: MetricDelta;
  wrinkles: MetricDelta;
  texture: MetricDelta;
  redness: MetricDelta;
  overall: MetricDelta;
}

/**
 * Calculate delta for a single metric
 */
function calculateDelta(before: number, after: number): MetricDelta {
  const absolute = after - before;
  const percentage = before !== 0 ? ((before - after) / before) * 100 : 0;
  
  let trend: 'improving' | 'worsening' | 'stable';
  if (Math.abs(percentage) < 5) {
    trend = 'stable';
  } else if (percentage > 0) {
    trend = 'improving'; // Lower is better for spots/pores/wrinkles/redness
  } else {
    trend = 'worsening';
  }

  return { absolute, percentage, trend };
}

/**
 * Calculate delta for texture (higher is better)
 */
function calculateTextureDelta(before: number, after: number): MetricDelta {
  const absolute = after - before;
  const percentage = before !== 0 ? ((after - before) / before) * 100 : 0;
  
  let trend: 'improving' | 'worsening' | 'stable';
  if (Math.abs(percentage) < 5) {
    trend = 'stable';
  } else if (percentage > 0) {
    trend = 'improving'; // Higher is better for texture
  } else {
    trend = 'worsening';
  }

  return { absolute, percentage, trend };
}

/**
 * Calculate improvement metrics between two photos
 */
export function calculateImprovementMetrics(
  beforePhoto: ProgressPhoto,
  afterPhoto: ProgressPhoto
): ImprovementMetrics {
  const beforeAnalysis = beforePhoto.analysis_results || {};
  const afterAnalysis = afterPhoto.analysis_results || {};

  return {
    spots: calculateDelta(
      beforeAnalysis.spots || 0,
      afterAnalysis.spots || 0
    ),
    pores: calculateDelta(
      beforeAnalysis.pores || 0,
      afterAnalysis.pores || 0
    ),
    wrinkles: calculateDelta(
      beforeAnalysis.wrinkles || 0,
      afterAnalysis.wrinkles || 0
    ),
    texture: calculateTextureDelta(
      beforeAnalysis.texture_score || 0,
      afterAnalysis.texture_score || 0
    ),
    redness: calculateDelta(
      beforeAnalysis.redness || 0,
      afterAnalysis.redness || 0
    ),
    overall: calculateDelta(
      100 - (beforeAnalysis.overall_score || 100),
      100 - (afterAnalysis.overall_score || 100)
    ),
  };
}

/**
 * Generate human-readable improvement summary
 */
export function generateImprovementSummary(metrics: ImprovementMetrics): string {
  const improvements: string[] = [];

  // Spots
  if (metrics.spots.trend === 'improving' && Math.abs(metrics.spots.percentage) >= 10) {
    improvements.push(
      `ฝ้า-กระลดลง ${Math.abs(metrics.spots.percentage).toFixed(1)}%`
    );
  }

  // Pores
  if (metrics.pores.trend === 'improving' && Math.abs(metrics.pores.percentage) >= 10) {
    improvements.push(
      `รูขุมขนกระชับขึ้น ${Math.abs(metrics.pores.percentage).toFixed(1)}%`
    );
  }

  // Wrinkles
  if (metrics.wrinkles.trend === 'improving' && Math.abs(metrics.wrinkles.percentage) >= 10) {
    improvements.push(
      `ริ้วรอยลดลง ${Math.abs(metrics.wrinkles.percentage).toFixed(1)}%`
    );
  }

  // Texture
  if (metrics.texture.trend === 'improving' && Math.abs(metrics.texture.percentage) >= 10) {
    improvements.push(
      `ผิวเรียบเนียนขึ้น ${Math.abs(metrics.texture.percentage).toFixed(1)}%`
    );
  }

  // Redness
  if (metrics.redness.trend === 'improving' && Math.abs(metrics.redness.percentage) >= 10) {
    improvements.push(
      `ความแดงลดลง ${Math.abs(metrics.redness.percentage).toFixed(1)}%`
    );
  }

  if (improvements.length === 0) {
    return 'ยังไม่มีการเปลี่ยนแปลงที่เห็นได้ชัด';
  }

  return improvements.join(', ');
}

/**
 * Calculate overall improvement percentage
 */
export function calculateOverallImprovement(metrics: ImprovementMetrics): number {
  // Weight different metrics
  const weights = {
    spots: 0.25,
    pores: 0.2,
    wrinkles: 0.25,
    texture: 0.15,
    redness: 0.15,
  };

  let totalImprovement = 0;
  let totalWeight = 0;

  for (const [metric, weight] of Object.entries(weights)) {
    const delta = metrics[metric as keyof ImprovementMetrics];
    if (delta.trend === 'improving') {
      totalImprovement += Math.abs(delta.percentage) * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? totalImprovement / totalWeight : 0;
}

/**
 * Generate recommendations based on progress
 */
export function generateRecommendations(
  metrics: ImprovementMetrics,
  daysSinceTreatment: number
): string[] {
  const recommendations: string[] = [];

  // Check if improvements are on track
  const expectedImprovement = Math.min(daysSinceTreatment / 30 * 50, 80); // 50% per month, cap at 80%
  const actualImprovement = calculateOverallImprovement(metrics);

  if (actualImprovement < expectedImprovement * 0.7) {
    recommendations.push(
      'ผลลัพธ์ยังไม่เป็นไปตามที่คาดหวัง แนะนำให้ปรึกษาคลินิก'
    );
  }

  // Specific recommendations
  if (metrics.spots.trend === 'stable' || metrics.spots.trend === 'worsening') {
    recommendations.push(
      'ใช้ครีมกันแดด SPF 50+ ทุกวัน เพื่อป้องกันฝ้า-กระ'
    );
  }

  if (metrics.pores.trend === 'stable' || metrics.pores.trend === 'worsening') {
    recommendations.push(
      'ทำความสะอาดผิวหน้าให้สะอาด 2 ครั้งต่อวัน'
    );
  }

  if (metrics.texture.trend === 'stable' || metrics.texture.trend === 'worsening') {
    recommendations.push(
      'ใช้ครีมบำรุงผิวที่มี Hyaluronic Acid เพิ่มความชุ่มชื้น'
    );
  }

  if (daysSinceTreatment >= 30 && actualImprovement >= 40) {
    recommendations.push(
      '✨ ผลลัพธ์ดีมาก! พิจารณาจองคิวเข้ารับบริการเพื่อรักษาผลลัพธ์'
    );
  }

  return recommendations;
}

/**
 * Create ProgressComparison object
 */
export function createComparison(
  beforePhoto: ProgressPhoto,
  afterPhoto: ProgressPhoto,
  userId: string,
  comparisonType: 'manual' | 'auto_weekly' | 'auto_monthly' = 'manual',
  alignmentScore?: number
): Omit<ProgressComparison, 'id' | 'created_at'> {
  const metrics = calculateImprovementMetrics(beforePhoto, afterPhoto);
  const overallImprovement = calculateOverallImprovement(metrics);

  return {
    user_id: userId,
    before_photo_id: beforePhoto.id,
    after_photo_id: afterPhoto.id,
    
    // Improvement percentages
    improvement_spots: metrics.spots.percentage,
    improvement_pores: metrics.pores.percentage,
    improvement_wrinkles: metrics.wrinkles.percentage,
    improvement_texture: metrics.texture.percentage,
    improvement_redness: metrics.redness.percentage,
    improvement_overall: overallImprovement,
    
    // Absolute deltas
    spots_delta: metrics.spots.absolute,
    pores_delta: metrics.pores.absolute,
    wrinkles_delta: metrics.wrinkles.absolute,
    
    comparison_type: comparisonType,
    alignment_score: alignmentScore,
    
    report_generated: false,
  };
}

/**
 * Calculate time elapsed between photos
 */
export function calculateTimeElapsed(
  beforePhoto: ProgressPhoto,
  afterPhoto: ProgressPhoto
): { days: number; weeks: number; months: number } {
  const beforeDate = new Date(beforePhoto.taken_at);
  const afterDate = new Date(afterPhoto.taken_at);
  
  const diffMs = afterDate.getTime() - beforeDate.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  return { days, weeks, months };
}

/**
 * Format time elapsed for display
 */
export function formatTimeElapsed(days: number): string {
  if (days < 7) {
    return `${days} วัน`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} สัปดาห์`;
  } else {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return `${months} เดือน`;
    }
    return `${months} เดือน ${remainingDays} วัน`;
  }
}
