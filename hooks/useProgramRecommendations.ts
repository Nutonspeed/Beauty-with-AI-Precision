/**
 * React hook for AI-powered program recommendations
 */

import { useState, useCallback, useEffect } from 'react';
import {
  ProgramRecommendation,
  RecommendationResponse,
  UserProfile,
  ProgramCategory,
  programRecommender,
} from '@/lib/ai/program-recommender';
import { EnhancedMetricsResult } from '@/lib/ai/enhanced-skin-metrics';
import { programHistoryManager } from '@/lib/supabase/program-history';

export interface UseProgramRecommendationsState {
  recommendations: ProgramRecommendation[];
  summary: RecommendationResponse['summary'] | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isLoadingProfile: boolean;
}

export interface UseProgramRecommendationsActions {
  generateRecommendations: (
    metrics: EnhancedMetricsResult,
    preferences?: {
      categories?: ProgramCategory[];
      maxCost?: number;
      maxDowntime?: string;
    }
  ) => Promise<void>;
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  filterRecommendations: (criteria: {
    category?: ProgramCategory;
    maxCost?: number;
    minPriority?: number;
    maxPainLevel?: number;
  }) => ProgramRecommendation[];
  sortRecommendations: (by: 'priority' | 'cost' | 'pain' | 'confidence') => void;
  getRecommendationById: (id: string) => ProgramRecommendation | undefined;
  clearRecommendations: () => void;
}

export type UseProgramRecommendationsResult = UseProgramRecommendationsState & UseProgramRecommendationsActions;

/**
 * Hook for managing AI-powered program recommendations
 */
export function useProgramRecommendations(): UseProgramRecommendationsResult {
  const [state, setState] = useState<UseProgramRecommendationsState>({
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
      const profile = await programHistoryManager.getUserProfile();
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
      await programHistoryManager.saveUserProfile(profile);
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
   * Generate program recommendations
   */
  const generateRecommendations = useCallback(async (
    metrics: EnhancedMetricsResult,
    preferences?: {
      categories?: ProgramCategory[];
      maxCost?: number;
      maxDowntime?: string;
    }
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get previous analysis for comparison
      const history = await programHistoryManager.getAnalysisHistory(2);
      const previousAnalysis = history.length > 1 ? history[1].metrics : undefined;

      // Generate recommendations
      const response = programRecommender.generateRecommendations({
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
      await programHistoryManager.saveAnalysis(metrics);
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
    category?: ProgramCategory;
    maxCost?: number;
    minPriority?: number;
    maxPainLevel?: number;
  }): ProgramRecommendation[] => {
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
  const getRecommendationById = useCallback((id: string): ProgramRecommendation | undefined => {
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
