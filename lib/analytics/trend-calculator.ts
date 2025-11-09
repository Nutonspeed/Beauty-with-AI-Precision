/**
 * Trend Calculator
 * Phase 2 Week 4 Task 4.2
 * 
 * Calculates trends, predictions, and insights from analysis history
 */

import { TrendPeriod, MetricTrend, TrendDataPoint } from '@/types/analytics';

// =============================================
// Types
// =============================================

interface AnalysisDataPoint {
  date: string;
  overall_score: number;
  spots_score?: number;
  wrinkles_score?: number;
  texture_score?: number;
  pores_score?: number;
  hydration_score?: number;
}

interface TrendCalculationResult {
  current: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'stable' | 'worsening';
  data: TrendDataPoint[];
}

// =============================================
// Period Utilities
// =============================================

/**
 * Get date range for a given period
 */
export function getPeriodDateRange(period: TrendPeriod): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case '1m':
      start.setMonth(start.getMonth() - 1);
      break;
    case '3m':
      start.setMonth(start.getMonth() - 3);
      break;
    case '6m':
      start.setMonth(start.getMonth() - 6);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case 'all':
      start.setFullYear(2020); // Arbitrary far back date
      break;
  }

  return { start, end };
}

/**
 * Format date for display based on period
 */
export function formatDateForPeriod(date: Date, period: TrendPeriod): string {
  switch (period) {
    case '1m':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case '3m':
    case '6m':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case '1y':
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    case 'all':
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}

// =============================================
// Trend Calculation
// =============================================

/**
 * Calculate trend for a single metric
 */
export function calculateMetricTrend(
  data: AnalysisDataPoint[],
  metricKey: keyof AnalysisDataPoint,
  period: TrendPeriod
): TrendCalculationResult {
  // Sort by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Extract metric values
  const values = sortedData
    .map((d) => d[metricKey])
    .filter((v): v is number => typeof v === 'number');

  if (values.length === 0) {
    return {
      current: 0,
      change: 0,
      changePercent: 0,
      trend: 'stable',
      data: [],
    };
  }

  // Calculate current (average of last 3 or all if less)
  const recentCount = Math.min(3, values.length);
  const current =
    values.slice(-recentCount).reduce((sum, v) => sum + v, 0) / recentCount;

  // Calculate change (compare first 3 vs last 3, or first vs last if less)
  let change = 0;
  let changePercent = 0;

  if (values.length >= 6) {
    const firstThree = values.slice(0, 3).reduce((sum, v) => sum + v, 0) / 3;
    const lastThree = values.slice(-3).reduce((sum, v) => sum + v, 0) / 3;
    change = lastThree - firstThree;
    changePercent = firstThree > 0 ? (change / firstThree) * 100 : 0;
  } else if (values.length >= 2) {
    change = values[values.length - 1] - values[0];
    changePercent = values[0] > 0 ? (change / values[0]) * 100 : 0;
  }

  // Determine trend direction
  let trend: 'improving' | 'stable' | 'worsening';
  if (Math.abs(changePercent) < 2) {
    trend = 'stable';
  } else if (change > 0) {
    trend = 'improving'; // Higher score = better
  } else {
    trend = 'worsening';
  }

  // Format data points
  const dataPoints: TrendDataPoint[] = sortedData.map((d) => ({
    date: d.date,
    value: (d[metricKey] as number) || 0,
    label: formatDateForPeriod(new Date(d.date), period),
  }));

  return {
    current: Math.round(current * 10) / 10,
    change: Math.round(change * 10) / 10,
    changePercent: Math.round(changePercent * 10) / 10,
    trend,
    data: dataPoints,
  };
}

/**
 * Calculate all metric trends
 */
export function calculateAllTrends(
  data: AnalysisDataPoint[],
  period: TrendPeriod
): {
  overall: MetricTrend;
  spots: MetricTrend;
  wrinkles: MetricTrend;
  texture: MetricTrend;
  pores: MetricTrend;
  hydration: MetricTrend;
} {
  const overall = calculateMetricTrend(data, 'overall_score', period);
  const spots = calculateMetricTrend(data, 'spots_score', period);
  const wrinkles = calculateMetricTrend(data, 'wrinkles_score', period);
  const texture = calculateMetricTrend(data, 'texture_score', period);
  const pores = calculateMetricTrend(data, 'pores_score', period);
  const hydration = calculateMetricTrend(data, 'hydration_score', period);

  return {
    overall: { name: 'Overall Score', ...overall },
    spots: { name: 'Spots & Acne', ...spots },
    wrinkles: { name: 'Wrinkles', ...wrinkles },
    texture: { name: 'Texture', ...texture },
    pores: { name: 'Pores', ...pores },
    hydration: { name: 'Hydration', ...hydration },
  };
}

// =============================================
// Predictions
// =============================================

/**
 * Simple linear regression for prediction
 */
function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Predict next month's values
 */
export function predictNextMonth(data: AnalysisDataPoint[]): {
  overall: number;
  spots: number;
  wrinkles: number;
} {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sortedData.length < 2) {
    const last = sortedData[sortedData.length - 1];
    return {
      overall: last?.overall_score || 0,
      spots: last?.spots_score || 0,
      wrinkles: last?.wrinkles_score || 0,
    };
  }

  // Use last 6 data points for prediction
  const recentData = sortedData.slice(-6);

  const overallValues = recentData.map((d) => d.overall_score);
  const spotsValues = recentData.map((d) => d.spots_score || 0);
  const wrinklesValues = recentData.map((d) => d.wrinkles_score || 0);

  const overallRegression = linearRegression(overallValues);
  const spotsRegression = linearRegression(spotsValues);
  const wrinklesRegression = linearRegression(wrinklesValues);

  // Predict for next point (index = length)
  const nextOverall = overallRegression.slope * recentData.length + overallRegression.intercept;
  const nextSpots = spotsRegression.slope * recentData.length + spotsRegression.intercept;
  const nextWrinkles =
    wrinklesRegression.slope * recentData.length + wrinklesRegression.intercept;

  // Clamp values between 0 and 100
  return {
    overall: Math.max(0, Math.min(100, Math.round(nextOverall * 10) / 10)),
    spots: Math.max(0, Math.min(100, Math.round(nextSpots * 10) / 10)),
    wrinkles: Math.max(0, Math.min(100, Math.round(nextWrinkles * 10) / 10)),
  };
}

// =============================================
// Summary Calculations
// =============================================

/**
 * Calculate summary statistics
 */
export function calculateSummary(data: AnalysisDataPoint[]): {
  totalAnalyses: number;
  averageScore: number;
  improvementRate: number;
  treatmentAdherence: number;
} {
  if (data.length === 0) {
    return {
      totalAnalyses: 0,
      averageScore: 0,
      improvementRate: 0,
      treatmentAdherence: 0,
    };
  }

  // Total analyses
  const totalAnalyses = data.length;

  // Average score
  const averageScore =
    data.reduce((sum, d) => sum + d.overall_score, 0) / data.length;

  // Improvement rate (change per month)
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let improvementRate = 0;
  if (sortedData.length >= 2) {
    const firstDate = new Date(sortedData[0].date);
    const lastDate = new Date(sortedData[sortedData.length - 1].date);
    const monthsDiff =
      (lastDate.getTime() - firstDate.getTime()) / (30 * 24 * 60 * 60 * 1000);

    if (monthsDiff > 0) {
      const scoreChange =
        sortedData[sortedData.length - 1].overall_score - sortedData[0].overall_score;
      improvementRate = scoreChange / monthsDiff;
    }
  }

  // Treatment adherence (simplified - based on analysis frequency)
  // Expected: 1 analysis per month = 100% adherence
  const monthsSpan =
    sortedData.length >= 2
      ? (new Date(sortedData[sortedData.length - 1].date).getTime() -
          new Date(sortedData[0].date).getTime()) /
        (30 * 24 * 60 * 60 * 1000)
      : 0;

  const treatmentAdherence =
    monthsSpan > 0 ? Math.min(1, totalAnalyses / monthsSpan) : 0;

  return {
    totalAnalyses,
    averageScore: Math.round(averageScore * 10) / 10,
    improvementRate: Math.round(improvementRate * 10) / 10,
    treatmentAdherence: Math.round(treatmentAdherence * 100) / 100,
  };
}

// =============================================
// Insights Generation
// =============================================

/**
 * Generate personalized insights based on trends
 */
export function generateInsights(
  trends: ReturnType<typeof calculateAllTrends>,
  summary: ReturnType<typeof calculateSummary>
): Array<{
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
}> {
  const insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    message: string;
  }> = [];

  // Overall improvement
  if (trends.overall.trend === 'improving' && trends.overall.changePercent > 5) {
    insights.push({
      type: 'success',
      title: 'Great Progress!',
      message: `Your overall skin score has improved by ${trends.overall.changePercent}%. Keep up the great work!`,
    });
  }

  // Spots improvement
  if (trends.spots.trend === 'improving' && trends.spots.changePercent > 10) {
    insights.push({
      type: 'success',
      title: 'Clearer Skin',
      message: `Your acne and spots have improved significantly by ${trends.spots.changePercent}%.`,
    });
  }

  // Wrinkles warning
  if (trends.wrinkles.trend === 'worsening' && trends.wrinkles.changePercent < -5) {
    insights.push({
      type: 'warning',
      title: 'Wrinkles Increasing',
      message: `Wrinkles have increased by ${Math.abs(trends.wrinkles.changePercent)}%. Consider adding anti-aging treatments.`,
    });
  }

  // Low adherence warning
  if (summary.treatmentAdherence < 0.5) {
    insights.push({
      type: 'warning',
      title: 'Low Analysis Frequency',
      message: 'Regular analysis helps track your progress. Try to analyze your skin at least once a month.',
    });
  }

  // Steady improvement
  if (summary.improvementRate > 2) {
    insights.push({
      type: 'success',
      title: 'Consistent Results',
      message: `You're improving at ${summary.improvementRate.toFixed(1)} points per month. Excellent consistency!`,
    });
  }

  return insights;
}
