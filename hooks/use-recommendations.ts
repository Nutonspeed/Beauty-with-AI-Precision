/**
 * Custom Hook: useRecommendations
 * Manages treatment recommendations for a skin analysis
 */

'use client';

import { useEffect, useState } from 'react';
import type { TreatmentRecommendation } from '@/lib/ai/treatment-recommender';

interface UseRecommendationsOptions {
  analysisId?: string;
  userId?: string;
  autoGenerate?: boolean;
  userProfile?: {
    age: number;
    skinType: string;
    allergies?: string[];
    medications?: string[];
    budget?: { min: number; max: number };
  };
}

interface UseRecommendationsResult {
  recommendations: TreatmentRecommendation[];
  loading: boolean;
  error: string | null;
  generating: boolean;
  refresh: () => Promise<void>;
  generate: () => Promise<void>;
  clear: () => Promise<void>;
}

export function useRecommendations(
  options: UseRecommendationsOptions = {}
): UseRecommendationsResult {
  const { analysisId, userId, autoGenerate = false, userProfile } = options;

  const [recommendations, setRecommendations] = useState<TreatmentRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load recommendations from API
   */
  const loadRecommendations = async () => {
    if (!analysisId && !userId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let url: string;
      if (analysisId) {
        url = `/api/recommendations?analysisId=${analysisId}`;
      } else if (userId) {
        url = `/api/recommendations/${userId}`;
      } else {
        return;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load recommendations');
      }

      if (data.success) {
        // Handle both single analysis and grouped responses
        if (Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
        } else if (data.groups && Array.isArray(data.groups)) {
          // Flatten grouped recommendations
          const allRecs = data.groups.flatMap((g: any) => g.recommendations);
          setRecommendations(allRecs);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(message);
      console.error('Load recommendations error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate new recommendations
   */
  const generateRecommendations = async () => {
    if (!analysisId) {
      setError('Analysis ID is required to generate recommendations');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          metrics: {}, // Will be fetched from analysis
          userProfile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recommendations');
      }

      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate recommendations';
      setError(message);
      console.error('Generate recommendations error:', err);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Clear all recommendations for user
   */
  const clearRecommendations = async () => {
    if (!userId) {
      setError('User ID is required to clear recommendations');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/recommendations/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear recommendations');
      }

      setRecommendations([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear recommendations';
      setError(message);
      console.error('Clear recommendations error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Auto-load on mount
   */
  useEffect(() => {
    if (analysisId || userId) {
      loadRecommendations();
    }
  }, [analysisId, userId]);

  /**
   * Auto-generate if enabled and no recommendations exist
   */
  useEffect(() => {
    if (autoGenerate && analysisId && !loading && recommendations.length === 0 && !error) {
      generateRecommendations();
    }
  }, [autoGenerate, analysisId, loading, recommendations.length, error]);

  return {
    recommendations,
    loading,
    error,
    generating,
    refresh: loadRecommendations,
    generate: generateRecommendations,
    clear: clearRecommendations,
  };
}
