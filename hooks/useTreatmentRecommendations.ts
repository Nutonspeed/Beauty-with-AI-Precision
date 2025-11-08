/**
 * React hook for AI-powered treatment recommendations
 */

import { useState, useCallback, useEffect } from 'react';
import {
  TreatmentRecommendation,
  RecommendationResponse,
  UserProfile,
  TreatmentCategory,
  treatmentRecommender,
} from '@/lib/ai/treatment-recommender';
import { EnhancedMetricsResult } from '@/lib/ai/enhanced-skin-metrics';
import { treatmentHistoryManager } from '@/lib/supabase/treatment-history';

export interface UseTreatmentRecommendationsState {
  recommendations: TreatmentRecommendation[];
  summary: RecommendationResponse['summary'] | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isLoadingProfile: boolean;
}

export interface UseTreatmentRecommendationsActions {
  generateRecommendations: (
    metrics: EnhancedMetricsResult,
    preferences?: {
      categories?: TreatmentCategory[];
      maxCost?: number;
      maxDowntime?: string;
    }
  ) => Promise<void>;
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  filterRecommendations: (criteria: {
    category?: TreatmentCategory;
    maxCost?: number;
    minPriority?: number;
    maxPainLevel?: number;
  }) => TreatmentRecommendation[];
  sortRecommendations: (by: 'priority' | 'cost' | 'pain' | 'confidence') => void;
  getRecommendationById: (id: string) => TreatmentRecommendation | undefined;
  clearRecommendations: () => void;
}

export type UseTreatmentRecommendationsResult = UseTreatmentRecommendationsState & UseTreatmentRecommendationsActions;

/**
 * Hook for managing AI-powered treatment recommendations
 */
export function useTreatmentRecommendations(): UseTreatmentRecommendationsResult {
  const [state, setState] = useState<UseTreatmentRecommendationsState>({
    recommendations: [],
    summary: null,
    userProfile: null,
    isLoading: false,
    error: null,
    isLoadingProfile: false,
  });

  /**
   * Load user profile from database
   */
  const loadUserProfile = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingProfile: true, error: null }));

    try {
      const profile = await treatmentHistoryManager.getUserProfile();
      setState(prev => ({
        ...prev,
        userProfile: profile,
        isLoadingProfile: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load profile',
        isLoadingProfile: false,
      }));
    }
  }, []);

  /**
   * Update user profile
   */
  const updateUserProfile = useCallback(async (profile: Partial<UserProfile>) => {
    setState(prev => ({ ...prev, isLoadingProfile: true, error: null }));

    try {
      await treatmentHistoryManager.saveUserProfile(profile);
      await loadUserProfile();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update profile',
        isLoadingProfile: false,
      }));
    }
  }, [loadUserProfile]);

  /**
   * Generate treatment recommendations
   */
  const generateRecommendations = useCallback(async (
    metrics: EnhancedMetricsResult,
    preferences?: {
      categories?: TreatmentCategory[];
      maxCost?: number;
      maxDowntime?: string;
    }
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get previous analysis for comparison
      const history = await treatmentHistoryManager.getAnalysisHistory(2);
      const previousAnalysis = history.length > 1 ? history[1].metrics : undefined;

      // Generate recommendations
      const response = treatmentRecommender.generateRecommendations({
        metrics,
        userProfile: state.userProfile || undefined,
        previousAnalysis,
        preferences,
      });

      setState(prev => ({
        ...prev,
        recommendations: response.recommendations,
        summary: response.summary,
        isLoading: false,
      }));

      // Save analysis to history
      await treatmentHistoryManager.saveAnalysis(metrics);
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to generate recommendations',
        isLoading: false,
      }));
    }
  }, [state.userProfile]);

  /**
   * Filter recommendations by criteria
   */
  const filterRecommendations = useCallback((criteria: {
    category?: TreatmentCategory;
    maxCost?: number;
    minPriority?: number;
    maxPainLevel?: number;
  }): TreatmentRecommendation[] => {
    let filtered = [...state.recommendations];

    if (criteria.category) {
      filtered = filtered.filter(r => r.category === criteria.category);
    }

    if (criteria.maxCost !== undefined) {
      filtered = filtered.filter(r => r.cost.min <= criteria.maxCost!);
    }

    if (criteria.minPriority !== undefined) {
      filtered = filtered.filter(r => r.priority >= criteria.minPriority!);
    }

    if (criteria.maxPainLevel !== undefined) {
      filtered = filtered.filter(r => r.painLevel <= criteria.maxPainLevel!);
    }

    return filtered;
  }, [state.recommendations]);

  /**
   * Sort recommendations
   */
  const sortRecommendations = useCallback((by: 'priority' | 'cost' | 'pain' | 'confidence') => {
    setState(prev => {
      const sorted = [...prev.recommendations];

      switch (by) {
        case 'priority':
          sorted.sort((a, b) => b.priority - a.priority);
          break;
        case 'cost':
          sorted.sort((a, b) => a.cost.min - b.cost.min);
          break;
        case 'pain':
          sorted.sort((a, b) => a.painLevel - b.painLevel);
          break;
        case 'confidence':
          sorted.sort((a, b) => b.confidence - a.confidence);
          break;
      }

      return { ...prev, recommendations: sorted };
    });
  }, []);

  /**
   * Get recommendation by ID
   */
  const getRecommendationById = useCallback((id: string): TreatmentRecommendation | undefined => {
    return state.recommendations.find(r => r.id === id);
  }, [state.recommendations]);

  /**
   * Clear recommendations
   */
  const clearRecommendations = useCallback(() => {
    setState(prev => ({
      ...prev,
      recommendations: [],
      summary: null,
    }));
  }, []);

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  return {
    ...state,
    generateRecommendations,
    loadUserProfile,
    updateUserProfile,
    filterRecommendations,
    sortRecommendations,
    getRecommendationById,
    clearRecommendations,
  };
}
