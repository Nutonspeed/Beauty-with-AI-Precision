/**
 * Progress Tracking System
 * Track and analyze skin improvement over time
 */

import { EnhancedMetricsResult } from '../ai/enhanced-skin-metrics';

// Progress data point for timeline
export interface ProgressDataPoint {
  id: string;
  date: Date;
  metrics: EnhancedMetricsResult;
  photoUrl?: string;
  notes?: string;
  treatmentsReceived?: string[];
}

// Comparison result between two time points
export interface ProgressComparison {
  before: ProgressDataPoint;
  after: ProgressDataPoint;
  improvements: {
    spots: number;
    pores: number;
    wrinkles: number;
    texture: number;
    redness: number;
    hydration: number;
    skinTone: number;
    elasticity: number;
    overallHealth: number;
  };
  durationDays: number;
  percentageChange: number;
  trend: 'improving' | 'stable' | 'declining';
}

// Timeline data for charts
export interface TimelineData {
  dates: Date[];
  metrics: {
    spots: number[];
    pores: number[];
    wrinkles: number[];
    texture: number[];
    redness: number[];
    hydration: number[];
    skinTone: number[];
    elasticity: number[];
    overallHealth: number[];
  };
}

// Statistics for progress analysis
export interface ProgressStats {
  totalDataPoints: number;
  timeSpanDays: number;
  averageImprovement: number;
  bestMetric: string;
  worstMetric: string;
  consistencyScore: number; // 0-100, how consistent the improvement is
  projectedImprovement: number; // Projected improvement for next 30 days
}

// Milestone tracking
export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  progress: number; // 0-100
  achieved: boolean;
  achievedDate?: Date;
}

/**
 * Progress Tracker for skin improvement monitoring
 */
export class ProgressTracker {
  private dataPoints: ProgressDataPoint[];

  constructor(dataPoints: ProgressDataPoint[] = []) {
    this.dataPoints = [...dataPoints].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }

  /**
   * Add new progress data point
   */
  addDataPoint(dataPoint: ProgressDataPoint): void {
    this.dataPoints.push(dataPoint);
    this.dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get all data points
   */
  getDataPoints(): ProgressDataPoint[] {
    return [...this.dataPoints];
  }

  /**
   * Get latest data point
   */
  getLatest(): ProgressDataPoint | null {
    return this.dataPoints.length > 0
      ? this.dataPoints[this.dataPoints.length - 1]
      : null;
  }

  /**
   * Get oldest data point
   */
  getOldest(): ProgressDataPoint | null {
    return this.dataPoints.length > 0 ? this.dataPoints[0] : null;
  }

  /**
   * Compare two data points
   */
  compare(beforeId: string, afterId: string): ProgressComparison | null {
    const before = this.dataPoints.find(dp => dp.id === beforeId);
    const after = this.dataPoints.find(dp => dp.id === afterId);

    if (!before || !after) return null;

    const improvements = {
      spots: after.metrics.spots.score - before.metrics.spots.score,
      pores: after.metrics.pores.score - before.metrics.pores.score,
      wrinkles: after.metrics.wrinkles.score - before.metrics.wrinkles.score,
      texture: after.metrics.texture.score - before.metrics.texture.score,
      redness: after.metrics.redness.score - before.metrics.redness.score,
      hydration: after.metrics.hydration.score - before.metrics.hydration.score,
      skinTone: after.metrics.skinTone.score - before.metrics.skinTone.score,
      elasticity: after.metrics.elasticity.score - before.metrics.elasticity.score,
      overallHealth:
        after.metrics.overallHealth.score - before.metrics.overallHealth.score,
    };

    const durationDays = Math.floor(
      (after.date.getTime() - before.date.getTime()) / (1000 * 60 * 60 * 24)
    );

    const avgImprovement =
      Object.values(improvements).reduce((sum, val) => sum + val, 0) / 9;

    const percentageChange =
      (avgImprovement / before.metrics.overallHealth.score) * 100;

    let trend: 'improving' | 'stable' | 'declining';
    if (avgImprovement > 2) trend = 'improving';
    else if (avgImprovement < -2) trend = 'declining';
    else trend = 'stable';

    return {
      before,
      after,
      improvements,
      durationDays,
      percentageChange,
      trend,
    };
  }

  /**
   * Compare latest with oldest (overall progress)
   */
  compareOverall(): ProgressComparison | null {
    const oldest = this.getOldest();
    const latest = this.getLatest();

    if (!oldest || !latest || oldest.id === latest.id) return null;

    return this.compare(oldest.id, latest.id);
  }

  /**
   * Get timeline data for charting
   */
  getTimelineData(): TimelineData {
    return {
      dates: this.dataPoints.map(dp => dp.date),
      metrics: {
        spots: this.dataPoints.map(dp => dp.metrics.spots.score),
        pores: this.dataPoints.map(dp => dp.metrics.pores.score),
        wrinkles: this.dataPoints.map(dp => dp.metrics.wrinkles.score),
        texture: this.dataPoints.map(dp => dp.metrics.texture.score),
        redness: this.dataPoints.map(dp => dp.metrics.redness.score),
        hydration: this.dataPoints.map(dp => dp.metrics.hydration.score),
        skinTone: this.dataPoints.map(dp => dp.metrics.skinTone.score),
        elasticity: this.dataPoints.map(dp => dp.metrics.elasticity.score),
        overallHealth: this.dataPoints.map(dp => dp.metrics.overallHealth.score),
      },
    };
  }

  /**
   * Calculate progress statistics
   */
  getStatistics(): ProgressStats | null {
    if (this.dataPoints.length < 2) return null;

    const oldest = this.getOldest()!;
    const latest = this.getLatest()!;

    const timeSpanDays = Math.floor(
      (latest.date.getTime() - oldest.date.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate improvements for each metric
    const improvements = {
      spots: latest.metrics.spots.score - oldest.metrics.spots.score,
      pores: latest.metrics.pores.score - oldest.metrics.pores.score,
      wrinkles: latest.metrics.wrinkles.score - oldest.metrics.wrinkles.score,
      texture: latest.metrics.texture.score - oldest.metrics.texture.score,
      redness: latest.metrics.redness.score - oldest.metrics.redness.score,
      hydration: latest.metrics.hydration.score - oldest.metrics.hydration.score,
      skinTone: latest.metrics.skinTone.score - oldest.metrics.skinTone.score,
      elasticity: latest.metrics.elasticity.score - oldest.metrics.elasticity.score,
    };

    const averageImprovement =
      Object.values(improvements).reduce((sum, val) => sum + val, 0) / 8;

    // Find best and worst metrics
    let bestMetric = 'spots';
    let worstMetric = 'spots';
    let maxImprovement = improvements.spots;
    let minImprovement = improvements.spots;

    Object.entries(improvements).forEach(([metric, improvement]) => {
      if (improvement > maxImprovement) {
        maxImprovement = improvement;
        bestMetric = metric;
      }
      if (improvement < minImprovement) {
        minImprovement = improvement;
        worstMetric = metric;
      }
    });

    // Calculate consistency (how consistent the improvement trend is)
    const consistencyScore = this.calculateConsistency();

    // Project improvement for next 30 days based on current trend
    const dailyRate = averageImprovement / timeSpanDays;
    const projectedImprovement = dailyRate * 30;

    return {
      totalDataPoints: this.dataPoints.length,
      timeSpanDays,
      averageImprovement,
      bestMetric,
      worstMetric,
      consistencyScore,
      projectedImprovement,
    };
  }

  /**
   * Calculate consistency score (0-100)
   */
  private calculateConsistency(): number {
    if (this.dataPoints.length < 3) return 100;

    const overallScores = this.dataPoints.map(
      dp => dp.metrics.overallHealth.score
    );

    // Calculate variance
    const mean =
      overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length;
    const variance =
      overallScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      overallScores.length;

    // Convert variance to consistency score (lower variance = higher consistency)
    // Assuming max variance of 100 (worst case)
    const consistencyScore = Math.max(0, 100 - variance);

    return consistencyScore;
  }

  /**
   * Get data points within date range
   */
  getDataPointsInRange(startDate: Date, endDate: Date): ProgressDataPoint[] {
    return this.dataPoints.filter(
      dp => dp.date >= startDate && dp.date <= endDate
    );
  }

  /**
   * Get improvement rate per day for each metric
   */
  getImprovementRates(): Record<string, number> | null {
    if (this.dataPoints.length < 2) return null;

    const oldest = this.getOldest()!;
    const latest = this.getLatest()!;

    const timeSpanDays = Math.floor(
      (latest.date.getTime() - oldest.date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (timeSpanDays === 0) return null;

    return {
      spots:
        (latest.metrics.spots.score - oldest.metrics.spots.score) / timeSpanDays,
      pores:
        (latest.metrics.pores.score - oldest.metrics.pores.score) / timeSpanDays,
      wrinkles:
        (latest.metrics.wrinkles.score - oldest.metrics.wrinkles.score) /
        timeSpanDays,
      texture:
        (latest.metrics.texture.score - oldest.metrics.texture.score) /
        timeSpanDays,
      redness:
        (latest.metrics.redness.score - oldest.metrics.redness.score) /
        timeSpanDays,
      hydration:
        (latest.metrics.hydration.score - oldest.metrics.hydration.score) /
        timeSpanDays,
      skinTone:
        (latest.metrics.skinTone.score - oldest.metrics.skinTone.score) /
        timeSpanDays,
      elasticity:
        (latest.metrics.elasticity.score - oldest.metrics.elasticity.score) /
        timeSpanDays,
      overallHealth:
        (latest.metrics.overallHealth.score - oldest.metrics.overallHealth.score) /
        timeSpanDays,
    };
  }

  /**
   * Create milestones based on current progress
   */
  generateMilestones(): Milestone[] {
    const latest = this.getLatest();
    if (!latest) return [];

    const milestones: Milestone[] = [];
    const metrics = latest.metrics;

    // Generate milestone for each metric below 80
    const metricTargets: Record<string, { current: number; name: string }> = {
      spots: { current: metrics.spots.score, name: 'ลดจุดด่างดำ' },
      pores: { current: metrics.pores.score, name: 'ลดรูขุมขน' },
      wrinkles: { current: metrics.wrinkles.score, name: 'ลดริ้วรอย' },
      texture: { current: metrics.texture.score, name: 'ปรับปรุงผิว' },
      redness: { current: metrics.redness.score, name: 'ลดความแดง' },
      hydration: { current: metrics.hydration.score, name: 'เพิ่มความชุ่มชื้น' },
      skinTone: { current: metrics.skinTone.score, name: 'ปรับสีผิว' },
      elasticity: { current: metrics.elasticity.score, name: 'เพิ่มความยืดหยุ่น' },
    };

    Object.entries(metricTargets).forEach(([key, { current, name }]) => {
      if (current < 80) {
        const targetValue = Math.min(100, current + 20);
        milestones.push({
          id: `milestone_${key}_${Date.now()}`,
          title: name,
          description: `เป้าหมาย: เพิ่มคะแนนจาก ${current.toFixed(1)} เป็น ${targetValue.toFixed(1)}`,
          targetMetric: key,
          targetValue,
          currentValue: current,
          progress: 0,
          achieved: false,
        });
      }
    });

    return milestones;
  }

  /**
   * Update milestone progress based on latest data
   */
  updateMilestones(milestones: Milestone[]): Milestone[] {
    const latest = this.getLatest();
    if (!latest) return milestones;

    return milestones.map(milestone => {
      const currentValue = (latest.metrics as any)[milestone.targetMetric]?.score || 0;
      const progress = Math.min(
        100,
        ((currentValue - milestone.currentValue) /
          (milestone.targetValue - milestone.currentValue)) *
          100
      );

      const achieved = currentValue >= milestone.targetValue;

      return {
        ...milestone,
        currentValue,
        progress: Math.max(0, progress),
        achieved,
        achievedDate: achieved && !milestone.achieved ? new Date() : milestone.achievedDate,
      };
    });
  }

  /**
   * Export progress data to JSON
   */
  exportToJSON(): string {
    return JSON.stringify(
      {
        dataPoints: this.dataPoints,
        statistics: this.getStatistics(),
        comparison: this.compareOverall(),
        timeline: this.getTimelineData(),
        exportDate: new Date(),
      },
      null,
      2
    );
  }
}
