/**
 * Analysis Integration Page
 * Displays interactive concern markers on skin analysis results
 */

'use client';

import React, { useState, useEffect } from 'react';
import { InteractivePhotoMarkers } from '@/components/analysis/interactive-markers';
import { ConcernDetailModal } from '@/components/analysis/concern-detail-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type {
  HybridSkinAnalysis,
  SkinConcern,
} from '@/lib/types/skin-analysis';
import type {
  InteractiveConcern,
  ConcernLocation,
  ConcernType,
} from '@/lib/concerns/concern-education';
import {
  convertToInteractiveConcerns,
  getMultipleConcernEducation,
  calculateSkinHealthScore,
  getPriorityConcerns,
  formatConcernType,
  getSeverityColor,
} from '@/lib/concerns/concern-education';

interface AnalysisWithConcernsProps {
  analysis: HybridSkinAnalysis;
  imageUrl: string;
  language?: 'en' | 'th';
}

export function AnalysisWithConcerns({
  analysis,
  imageUrl,
  language = 'en',
}: AnalysisWithConcernsProps) {
  const [interactiveConcerns, setInteractiveConcerns] = useState<InteractiveConcern[]>([]);
  const [selectedConcern, setSelectedConcern] = useState<{
    concern: InteractiveConcern;
    location?: ConcernLocation;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<number>(0);

  // Load concern data
  useEffect(() => {
    const loadConcernData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert analysis results to interactive concerns
        const concerns = convertToInteractiveConcerns(
          analysis.cv,
          analysis.ai?.concerns
        );

        if (concerns.length === 0) {
          setError('No skin concerns detected in this analysis.');
          return;
        }

        // Load education data for all concerns
        const concernTypes = concerns.map(c => c.type);
        const educationMap = await getMultipleConcernEducation(concernTypes);

        // Merge education data with concerns
        const concernsWithEducation = concerns
          .map(concern => ({
            ...concern,
            education: educationMap.get(concern.type) || undefined,
          }))
          .filter(concern => concern.education !== undefined) as InteractiveConcern[];

        setInteractiveConcerns(concernsWithEducation);

        // Calculate health score
        const score = calculateSkinHealthScore(concernsWithEducation);
        setHealthScore(score);
      } catch (err) {
        console.error('Error loading concern data:', err);
        setError('Failed to load concern information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadConcernData();
  }, [analysis]);

  // Handle concern marker click
  const handleConcernClick = (
    concern: InteractiveConcern,
    location?: ConcernLocation
  ) => {
    setSelectedConcern({ concern, location });
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Delay clearing selection to allow modal close animation
    setTimeout(() => setSelectedConcern(null), 300);
  };

  // Get priority concerns
  const priorityConcerns = getPriorityConcerns(interactiveConcerns, 3);

  // Get health score color
  const getHealthScoreColor = () => {
    if (healthScore >= 80) return 'text-green-600';
    if (healthScore >= 60) return 'text-yellow-600';
    if (healthScore >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreIcon = () => {
    if (healthScore >= 80) return <TrendingUp className="h-6 w-6" />;
    if (healthScore >= 60) return <Info className="h-6 w-6" />;
    return <TrendingDown className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Skin Health Score</span>
            <div className={`flex items-center gap-2 ${getHealthScoreColor()}`}>
              {getHealthScoreIcon()}
              <span className="text-3xl font-bold">{healthScore}</span>
              <span className="text-sm text-gray-500">/100</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                healthScore >= 80
                  ? 'bg-green-600'
                  : healthScore >= 60
                  ? 'bg-yellow-600'
                  : healthScore >= 40
                  ? 'bg-orange-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {healthScore >= 80
              ? 'Excellent! Your skin is in great condition.'
              : healthScore >= 60
              ? 'Good! Minor concerns detected. Consistent care recommended.'
              : healthScore >= 40
              ? 'Fair. Several concerns need attention. Consider professional consultation.'
              : 'Attention needed. Multiple significant concerns detected. Dermatologist consultation recommended.'}
          </p>
        </CardContent>
      </Card>

      {/* Priority Concerns Summary */}
      {priorityConcerns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Priority Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {priorityConcerns.map((concern) => (
                <button
                  key={concern.type}
                  onClick={() => handleConcernClick(concern)}
                  className="flex flex-col items-start p-4 rounded-lg border bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{concern.education?.icon || '📍'}</span>
                    <span className="font-semibold">
                      {formatConcernType(concern.type)}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: getSeverityColor(
                        concern.averageSeverity > 7
                          ? 'high'
                          : concern.averageSeverity > 4
                          ? 'medium'
                          : 'low'
                      ),
                    }}
                    className="mb-2"
                  >
                    Severity: {concern.averageSeverity.toFixed(1)}/10
                  </Badge>
                  {concern.locations.length > 0 && (
                    <p className="text-sm text-gray-600">
                      {concern.locations.length} location{concern.locations.length > 1 ? 's' : ''}{' '}
                      detected
                    </p>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Photo with Markers */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Skin Analysis</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click on markers to view detailed information about each concern
          </p>
        </CardHeader>
        <CardContent>
          <InteractivePhotoMarkers
            imageUrl={imageUrl}
            concerns={interactiveConcerns}
            onConcernClick={handleConcernClick}
            enableZoom={true}
            enableLayerToggle={true}
            imageAlt="Skin analysis with interactive markers"
          />
        </CardContent>
      </Card>

      {/* All Concerns List */}
      <Card>
        <CardHeader>
          <CardTitle>All Detected Concerns ({interactiveConcerns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {interactiveConcerns.map((concern) => (
              <button
                key={concern.type}
                onClick={() => handleConcernClick(concern)}
                className="flex items-start gap-3 p-3 rounded-lg border bg-white dark:bg-gray-800 hover:shadow-md transition-all text-left"
              >
                <span className="text-xl flex-shrink-0">
                  {concern.education?.icon || '📍'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {formatConcernType(concern.type)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="h-2 w-16 rounded-full"
                      style={{
                        backgroundColor: getSeverityColor(
                          concern.averageSeverity > 7
                            ? 'high'
                            : concern.averageSeverity > 4
                            ? 'medium'
                            : 'low'
                        ),
                      }}
                    />
                    <span className="text-xs text-gray-500">
                      {concern.averageSeverity.toFixed(1)}/10
                    </span>
                  </div>
                  {concern.locations.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {concern.locations.length} area{concern.locations.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <ConcernDetailModal
        concern={selectedConcern?.concern || null}
        location={selectedConcern?.location}
        language={language}
        open={isModalOpen}
        onOpenChange={handleModalClose}
      />
    </div>
  );
}
