/**
 * React hook for Progress Tracking
 */

import { useState, useCallback, useEffect } from 'react';
import {
  ProgressTracker,
  ProgressDataPoint,
  ProgressComparison,
  ProgressStats,
  TimelineData,
  Milestone,
} from '@/lib/progress/progress-tracker';
import { PDFReportGenerator, PDFReportOptions } from '@/lib/progress/pdf-generator';
import { treatmentHistoryManager } from '@/lib/supabase/treatment-history';
import { EnhancedMetricsResult } from '@/lib/ai/enhanced-skin-metrics';

export interface UseProgressTrackingState {
  dataPoints: ProgressDataPoint[];
  comparison: ProgressComparison | null;
  stats: ProgressStats | null;
  timeline: TimelineData | null;
  milestones: Milestone[];
  isLoading: boolean;
  error: string | null;
}

export interface UseProgressTrackingActions {
  loadProgress: () => Promise<void>;
  addDataPoint: (metrics: EnhancedMetricsResult, photoUrl?: string, notes?: string) => Promise<void>;
  comparePoints: (beforeId: string, afterId: string) => ProgressComparison | null;
  exportToPDF: (options?: PDFReportOptions) => Promise<void>;
  exportToJSON: () => string;
  generateMilestones: () => void;
  updateMilestones: () => void;
  getImprovementRates: () => Record<string, number> | null;
}

export type UseProgressTrackingResult = UseProgressTrackingState & UseProgressTrackingActions;

/**
 * Hook for managing progress tracking
 */
export function useProgressTracking(): UseProgressTrackingResult {
  const [state, setState] = useState<UseProgressTrackingState>({
    dataPoints: [],
    comparison: null,
    stats: null,
    timeline: null,
    milestones: [],
    isLoading: false,
    error: null,
  });

  const [tracker, setTracker] = useState<ProgressTracker>(new ProgressTracker());

  /**
   * Load progress data from database
   */
  const loadProgress = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get analysis history from database
      const history = await treatmentHistoryManager.getAnalysisHistory();

      // Convert to ProgressDataPoint format
      const dataPoints: ProgressDataPoint[] = history.map((item, index) => ({
        id: `dp_${index}_${item.date.getTime()}`,
        date: item.date,
        metrics: item.metrics,
        photoUrl: item.photoUrl,
        notes: undefined,
        treatmentsReceived: [],
      }));

      // Create new tracker with data
      const newTracker = new ProgressTracker(dataPoints);
      setTracker(newTracker);

      // Calculate statistics and comparison
      const stats = newTracker.getStatistics();
      const comparison = newTracker.compareOverall();
      const timeline = newTracker.getTimelineData();

      setState(prev => ({
        ...prev,
        dataPoints,
        stats,
        comparison,
        timeline,
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load progress',
        isLoading: false,
      }));
    }
  }, []);

  /**
   * Add new data point
   */
  const addDataPoint = useCallback(async (
    metrics: EnhancedMetricsResult,
    photoUrl?: string,
    notes?: string
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Save to database
      await treatmentHistoryManager.saveAnalysis(metrics, photoUrl, notes);

      // Create new data point
      const dataPoint: ProgressDataPoint = {
        id: `dp_${Date.now()}`,
        date: new Date(),
        metrics,
        photoUrl,
        notes,
        treatmentsReceived: [],
      };

      // Add to tracker
      tracker.addDataPoint(dataPoint);

      // Update state
      const dataPoints = tracker.getDataPoints();
      const stats = tracker.getStatistics();
      const comparison = tracker.compareOverall();
      const timeline = tracker.getTimelineData();

      setState(prev => ({
        ...prev,
        dataPoints,
        stats,
        comparison,
        timeline,
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to add data point',
        isLoading: false,
      }));
    }
  }, [tracker]);

  /**
   * Compare two data points
   */
  const comparePoints = useCallback((beforeId: string, afterId: string): ProgressComparison | null => {
    return tracker.compare(beforeId, afterId);
  }, [tracker]);

  /**
   * Export to PDF
   */
  const exportToPDF = useCallback(async (options: PDFReportOptions = {}) => {
    try {
      const generator = new PDFReportGenerator();
      const blob = await generator.generateReport(
        state.dataPoints,
        state.comparison,
        state.stats,
        options
      );

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `progress-report-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to export PDF',
      }));
    }
  }, [state.dataPoints, state.comparison, state.stats]);

  /**
   * Export to JSON
   */
  const exportToJSON = useCallback((): string => {
    return tracker.exportToJSON();
  }, [tracker]);

  /**
   * Generate milestones
   */
  const generateMilestones = useCallback(() => {
    const milestones = tracker.generateMilestones();
    setState(prev => ({ ...prev, milestones }));
  }, [tracker]);

  /**
   * Update milestones progress
   */
  const updateMilestones = useCallback(() => {
    const updated = tracker.updateMilestones(state.milestones);
    setState(prev => ({ ...prev, milestones: updated }));
  }, [tracker, state.milestones]);

  /**
   * Get improvement rates
   */
  const getImprovementRates = useCallback((): Record<string, number> | null => {
    return tracker.getImprovementRates();
  }, [tracker]);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Update milestones when data points change
  useEffect(() => {
    if (state.dataPoints.length > 0 && state.milestones.length > 0) {
      updateMilestones();
    }
  }, [state.dataPoints]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    loadProgress,
    addDataPoint,
    comparePoints,
    exportToPDF,
    exportToJSON,
    generateMilestones,
    updateMilestones,
    getImprovementRates,
  };
}
