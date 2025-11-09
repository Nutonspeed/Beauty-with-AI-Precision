/**
 * Analytics Types
 * Phase 2 Week 4 - Customer Analytics
 */

// =============================================
// Database Types
// =============================================

export interface CustomerAnalysisMetrics {
  id: string;
  customer_id: string;
  
  // Aggregated scores
  avg_overall_score: number | null;
  avg_spots_score: number | null;
  avg_wrinkles_score: number | null;
  avg_texture_score: number | null;
  avg_pores_score: number | null;
  avg_hydration_score: number | null;
  
  // Trend indicators
  trend_spots: number;
  trend_wrinkles: number;
  trend_texture: number;
  trend_pores: number;
  trend_hydration: number;
  trend_overall: number;
  
  // Analysis frequency
  total_analyses: number;
  first_analysis_at: string | null;
  last_analysis_at: string | null;
  analyses_last_30_days: number;
  analyses_last_90_days: number;
  
  // Treatment effectiveness
  treatment_adherence_score: number;
  improvement_rate: number;
  months_tracking: number;
  
  // Metadata
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisHistory {
  id: string;
  customer_id: string;
  analysis_id: string;
  
  // Score snapshot
  overall_score: number | null;
  spots_score: number | null;
  wrinkles_score: number | null;
  texture_score: number | null;
  pores_score: number | null;
  hydration_score: number | null;
  
  // Metadata
  analysis_date: string;
  is_baseline: boolean;
  treatment_plan_id: string | null;
  days_since_last_analysis: number | null;
  created_at: string;
}

// =============================================
// API Request/Response Types
// =============================================

export type TrendPeriod = '1m' | '3m' | '6m' | '1y' | 'all';

export interface TrendsRequest {
  customerId: string;
  period?: TrendPeriod;
}

export interface MetricTrend {
  name: string;
  current: number;
  change: number; // Change from previous period
  changePercent: number;
  trend: 'improving' | 'stable' | 'worsening';
  data: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TrendsResponse {
  period: TrendPeriod;
  startDate: string;
  endDate: string;
  metrics: {
    overall: MetricTrend;
    spots: MetricTrend;
    wrinkles: MetricTrend;
    texture: MetricTrend;
    pores: MetricTrend;
    hydration: MetricTrend;
  };
  summary: {
    totalAnalyses: number;
    averageScore: number;
    improvementRate: number;
    treatmentAdherence: number;
  };
  predictions?: {
    nextMonth: {
      overall: number;
      spots: number;
      wrinkles: number;
    };
  };
}

// =============================================
// Chart Data Types
// =============================================

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
  tension?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      display: boolean;
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display: boolean;
      text: string;
    };
    tooltip?: {
      enabled: boolean;
      mode: 'index' | 'point' | 'nearest';
    };
  };
  scales?: {
    x?: {
      display: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
    y?: {
      display: boolean;
      min?: number;
      max?: number;
      title?: {
        display: boolean;
        text: string;
      };
    };
  };
}

// =============================================
// Dashboard Types
// =============================================

export interface DashboardMetric {
  label: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

export interface DashboardInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface ComparisonData {
  customerValue: number;
  groupAverage: number;
  percentile: number; // 0-100
  betterThanPercent: number;
}

// =============================================
// Benchmark Types
// =============================================

export type AgeGroup = '20-29' | '30-39' | '40-49' | '50+';

export interface BenchmarkRequest {
  customerId: string;
  ageGroup: AgeGroup;
}

export interface BenchmarkResponse {
  customerScores: {
    overall: number;
    spots: number;
    wrinkles: number;
    texture: number;
    pores: number;
    hydration: number;
  };
  groupAverages: {
    overall: number;
    spots: number;
    wrinkles: number;
    texture: number;
    pores: number;
    hydration: number;
  };
  percentile: number;
  betterThan: number;
  ageGroup: AgeGroup;
}

// =============================================
// Treatment Plan Analytics
// =============================================

export interface TreatmentEffectiveness {
  treatmentPlanId: string;
  startDate: string;
  endDate: string | null;
  durationDays: number;
  
  // Before/After scores
  beforeScores: {
    overall: number;
    spots: number;
    wrinkles: number;
    texture: number;
  };
  afterScores: {
    overall: number;
    spots: number;
    wrinkles: number;
    texture: number;
  };
  
  // Improvement
  improvement: {
    overall: number;
    spots: number;
    wrinkles: number;
    texture: number;
  };
  improvementPercent: {
    overall: number;
    spots: number;
    wrinkles: number;
    texture: number;
  };
  
  // Adherence
  adherenceScore: number; // 0-1
  missedAnalyses: number;
  totalExpectedAnalyses: number;
}

// =============================================
// Export Data Types
// =============================================

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json';
  includeCharts: boolean;
  includeSummary: boolean;
  includeHistory: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportData {
  customer: {
    id: string;
    name: string;
    email: string;
  };
  metrics: CustomerAnalysisMetrics;
  trends: TrendsResponse;
  history: AnalysisHistory[];
  benchmark?: BenchmarkResponse;
  generatedAt: string;
}

// =============================================
// Utility Types
// =============================================

export type MetricType = 'overall' | 'spots' | 'wrinkles' | 'texture' | 'pores' | 'hydration';

export interface MetricConfig {
  key: MetricType;
  label: string;
  labelTh: string;
  color: string;
  icon: string;
  unit: string;
  min: number;
  max: number;
  reversed?: boolean; // If true, lower is better
}

export const METRIC_CONFIGS: Record<MetricType, MetricConfig> = {
  overall: {
    key: 'overall',
    label: 'Overall Score',
    labelTh: 'คะแนนรวม',
    color: '#8b5cf6',
    icon: 'star',
    unit: 'pts',
    min: 0,
    max: 100,
    reversed: false,
  },
  spots: {
    key: 'spots',
    label: 'Spots & Acne',
    labelTh: 'สิว-จุดด่างดำ',
    color: '#ef4444',
    icon: 'circle',
    unit: 'pts',
    min: 0,
    max: 100,
    reversed: false,
  },
  wrinkles: {
    key: 'wrinkles',
    label: 'Wrinkles',
    labelTh: 'ริ้วรอย',
    color: '#f97316',
    icon: 'waves',
    unit: 'pts',
    min: 0,
    max: 100,
    reversed: false,
  },
  texture: {
    key: 'texture',
    label: 'Texture',
    labelTh: 'พื้นผิว',
    color: '#06b6d4',
    icon: 'grid',
    unit: 'pts',
    min: 0,
    max: 100,
    reversed: false,
  },
  pores: {
    key: 'pores',
    label: 'Pores',
    labelTh: 'รูขุมขน',
    color: '#10b981',
    icon: 'droplet',
    unit: 'pts',
    min: 0,
    max: 100,
    reversed: false,
  },
  hydration: {
    key: 'hydration',
    label: 'Hydration',
    labelTh: 'ความชุ่มชื้น',
    color: '#3b82f6',
    icon: 'droplets',
    unit: 'pts',
    min: 0,
    max: 100,
    reversed: false,
  },
};
