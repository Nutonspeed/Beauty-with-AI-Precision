'use client';

/**
 * Analytics Hooks
 * React hooks for analytics and reporting
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  analyticsEngine,
  MetricData,
  TimeSeriesData,
  ChartData,
  Report,
  ReportFilter,
  PredictionData,
  InsightData,
} from '@/lib/analytics/analytics-engine';

// Hook states
interface UseMetricsState {
  metrics: MetricData[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseReportState {
  report: Report | null;
  loading: boolean;
  error: string | null;
  generateReport: (type: Report['type'], filters?: ReportFilter) => Promise<void>;
  exportReport: (format: 'pdf' | 'excel' | 'csv' | 'json') => Promise<void>;
}

interface UseChartDataState {
  chartData: ChartData | null;
  loading: boolean;
  error: string | null;
  updateMetrics: (metrics: string[]) => Promise<void>;
  updateFilters: (filters: ReportFilter) => Promise<void>;
}

interface UsePredictionsState {
  predictions: PredictionData[];
  loading: boolean;
  error: string | null;
  predict: (metric: string, days?: number) => Promise<void>;
}

interface UseInsightsState {
  insights: InsightData[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  dismissInsight: (insightId: string) => void;
}

/**
 * Hook for real-time metrics
 */
export function useMetrics(category?: string, refreshInterval?: number): UseMetricsState {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsEngine.getRealTimeMetrics(category);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchMetrics();

    // Set up auto-refresh
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchMetrics, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMetrics, refreshInterval]);

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics,
  };
}

/**
 * Hook for report generation
 */
export function useReport(userId?: string): UseReportState {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (
    type: Report['type'],
    filters?: ReportFilter
  ) => {
    try {
      setLoading(true);
      setError(null);
      const newReport = await analyticsEngine.generateReport(type, filters, userId);
      setReport(newReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const exportReport = useCallback(async (
    format: 'pdf' | 'excel' | 'csv' | 'json'
  ) => {
    if (!report) {
      setError('No report to export');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const blob = await analyticsEngine.exportReport(report.id, format);
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setLoading(false);
    }
  }, [report]);

  return {
    report,
    loading,
    error,
    generateReport,
    exportReport,
  };
}

/**
 * Hook for chart data
 */
export function useChartData(
  initialMetrics: string[],
  initialFilters: ReportFilter
): UseChartDataState {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [filters, setFilters] = useState(initialFilters);

  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsEngine.generateChartData(metrics, filters);
      setChartData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
    } finally {
      setLoading(false);
    }
  }, [metrics, filters]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const updateMetrics = useCallback(async (newMetrics: string[]) => {
    setMetrics(newMetrics);
  }, []);

  const updateFilters = useCallback(async (newFilters: ReportFilter) => {
    setFilters(newFilters);
  }, []);

  return {
    chartData,
    loading,
    error,
    updateMetrics,
    updateFilters,
  };
}

/**
 * Hook for time series data
 */
export function useTimeSeries(
  metric: string,
  filters: ReportFilter
): {
  data: TimeSeriesData[];
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const timeSeries = await analyticsEngine.getTimeSeriesData(metric, filters);
        setData(timeSeries);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch time series data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [metric, filters]);

  return { data, loading, error };
}

/**
 * Hook for predictive analytics
 */
export function usePredictions(): UsePredictionsState {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (metric: string, days: number = 30) => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsEngine.generatePrediction(metric, days);
      setPredictions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate predictions');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    predictions,
    loading,
    error,
    predict,
  };
}

/**
 * Hook for automated insights
 */
export function useInsights(
  filters?: ReportFilter,
  refreshInterval?: number
): UseInsightsState {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsEngine.generateInsights(filters);
      // Filter out dismissed insights
      const filtered = data.filter(insight => !dismissedInsights.has(insight.id));
      setInsights(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }, [filters, dismissedInsights]);

  useEffect(() => {
    fetchInsights();

    // Set up auto-refresh
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchInsights, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchInsights, refreshInterval]);

  const dismissInsight = useCallback((insightId: string) => {
    setDismissedInsights(prev => new Set(prev).add(insightId));
    setInsights(prev => prev.filter(i => i.id !== insightId));
  }, []);

  return {
    insights,
    loading,
    error,
    refresh: fetchInsights,
    dismissInsight,
  };
}

/**
 * Hook for ROI calculation
 */
export function useROI() {
  const calculateROI = useCallback((
    investment: number,
    revenue: number,
    costs: number
  ): {
    roi: number;
    netProfit: number;
    formatted: string;
  } => {
    const netProfit = revenue - costs - investment;
    const roi = analyticsEngine.calculateROI(investment, revenue, costs);
    
    return {
      roi,
      netProfit,
      formatted: `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%`,
    };
  }, []);

  return { calculateROI };
}

/**
 * Hook for performance tracking
 */
export function usePerformanceTracking() {
  const track = useCallback(async (
    metric: string,
    value: number,
    metadata?: any
  ) => {
    await analyticsEngine.trackPerformance(metric, value, metadata);
  }, []);

  return { track };
}
