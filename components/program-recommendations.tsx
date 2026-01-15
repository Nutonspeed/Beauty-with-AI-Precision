/**
 * Program Recommendations Display Component
 * Shows AI-generated personalized program recommendations
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ProgramRecommendation,
  ProgramCategory,
  RecommendationResponse,
} from '@/lib/ai/program-recommender';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProgramRecommendationsProps {
  recommendations: ProgramRecommendation[];
  summary?: RecommendationResponse['summary'];
  onSelectProgram?: (program: ProgramRecommendation) => void;
  onBookConsultation?: (program: ProgramRecommendation) => void;
}

/**
 * Get color for category badge
 */
const getCategoryColor = (category: ProgramCategory): string => {
  switch (category) {
    case ProgramCategory.RESURFACING:
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case ProgramCategory.ANTI_AGING:
      return 'bg-pink-100 text-pink-800 border-pink-300';
    case ProgramCategory.PIGMENTATION:
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case ProgramCategory.TEXTURE:
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case ProgramCategory.HYDRATION:
      return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    case ProgramCategory.PREVENTIVE:
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * Get priority badge color
 */
const getPriorityColor = (priority: number): string => {
  if (priority >= 8) return 'bg-red-100 text-red-800 border-red-300';
  if (priority >= 6) return 'bg-orange-100 text-orange-800 border-orange-300';
  if (priority >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-blue-100 text-blue-800 border-blue-300';
};

/**
 * Get pain level indicator
 */
const getPainLevelText = (level: number, t: any): string => {
  if (level === 0) return t('painLevel.none');
  if (level <= 2) return t('painLevel.veryLow');
  if (level <= 4) return t('painLevel.low');
  if (level <= 6) return t('painLevel.moderate');
  if (level <= 8) return t('painLevel.high');
  return t('painLevel.veryHigh');
};

/**
 * Program card component
 */
const ProgramCard: React.FC<{
  program: ProgramRecommendation;
  onSelect?: () => void;
  onBook?: () => void;
  t: any;
}> = ({ program, onSelect, onBook, t }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{program.name}</h3>
            <Badge className={getCategoryColor(program.category)}>
              {program.category}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{program.description}</p>
        </div>
        <div className="ml-4">
          <Badge className={getPriorityColor(program.priority)}>
            {t('priorityLabel')} {program.priority.toFixed(1)}
          </Badge>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{t('confidenceLabel')}</span>
          <span className="text-sm font-bold text-gray-900">
            {(program.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <Progress value={program.confidence * 100} className="h-2" />
      </div>

      {/* Reasoning */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{t('reasoningLabel')}:</span> {program.reasoning}
        </p>
      </div>

      {/* Key Information Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">{t('sessionsLabel')}</p>
          <p className="text-sm font-semibold text-gray-900">
            {program.sessions.recommended} {t('sessionsUnit')}
          </p>
          <p className="text-xs text-gray-500">
            {t('intervalLabel')} {program.sessions.interval}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">{t('costLabel')}</p>
          <p className="text-sm font-semibold text-gray-900">
            ฿{program.cost.min.toLocaleString()} - ฿{program.cost.max.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">{t('downtimeLabel')}</p>
          <p className="text-sm font-semibold text-gray-900">{program.downtime}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">{t('painLabel')}</p>
          <p className="text-sm font-semibold text-gray-900">
            {getPainLevelText(program.painLevel, t)} ({program.painLevel}/10)
          </p>
        </div>
      </div>

      {/* Expected Results */}
      {program.expectedResults.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('resultsLabel')}:</h4>
          <div className="space-y-2">
            {program.expectedResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{result.metric}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">{result.improvement}</span>
                  <span className="text-xs text-gray-500">({result.timeframe})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {/* Target Metrics */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('concernsLabel')}:</h4>
            <div className="flex flex-wrap gap-1">
              {program.targetMetrics.map((metric, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {metric}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contraindications */}
          {program.contraindications.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-800 mb-2">{t('contraindicationsLabel')}:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {program.contraindications.map((contra, index) => (
                  <li key={index}>{contra}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Side Effects */}
          {program.sideEffects.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-orange-800 mb-2">{t('sideEffectsLabel')}:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {program.sideEffects.map((effect, index) => (
                  <li key={index}>{effect}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="flex-1"
        >
          {expanded ? t('hideDetails') : t('showDetails')}
        </Button>
        {onSelect && (
          <Button
            variant="default"
            size="sm"
            onClick={onSelect}
            className="flex-1"
          >
            {t('selectProgram')}
          </Button>
        )}
        {onBook && (
          <Button
            variant="default"
            size="sm"
            onClick={onBook}
            className="flex-1 bg-pink-600 hover:bg-pink-700"
          >
            {t('bookConsultation')}
          </Button>
        )}
      </div>
    </Card>
  );
};

/**
 * Main Program Recommendations Component
 */
export const ProgramRecommendations: React.FC<ProgramRecommendationsProps> = ({
  recommendations,
  summary,
  onSelectProgram,
  onBookConsultation,
}) => {
  const t = useTranslations('programRecommendations');
  const _commonT = useTranslations('common');
  const [filter, setFilter] = useState<ProgramCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'cost' | 'pain'>('priority');

  // Filter and sort recommendations
  const filteredRecommendations = React.useMemo(() => {
    let filtered = [...recommendations];

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(r => r.category === filter);
    }

    // Apply sort
    switch (sortBy) {
      case 'priority':
        filtered.sort((a, b) => b.priority - a.priority);
        break;
      case 'cost':
        filtered.sort((a, b) => a.cost.min - b.cost.min);
        break;
      case 'pain':
        filtered.sort((a, b) => a.painLevel - b.painLevel);
        break;
    }

    return filtered;
  }, [recommendations, filter, sortBy]);

  if (recommendations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">{t('emptyState')}</p>
        <p className="text-sm text-gray-400 mt-2">
          {t('emptyStateDesc')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('summaryTitle')}</h2>
          
          {/* Primary Concerns */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('primaryConcernsLabel')}:</h3>
            <div className="flex flex-wrap gap-2">
              {summary.primaryConcerns.map((concern, index) => (
                <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-300">
                  {concern}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recommended Plan */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('recommendedPlanLabel')}:</h3>
            <p className="text-gray-900">{summary.recommendedPlan}</p>
          </div>

          {/* Estimates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">{t('estimatedCostLabel')}</p>
              <p className="text-lg font-bold text-gray-900">
                ฿{summary.estimatedCost.min.toLocaleString()} - ฿{summary.estimatedCost.max.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">{t('estimatedDurationLabel')}</p>
              <p className="text-lg font-bold text-gray-900">{summary.estimatedDuration}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters and Sort */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              {t('allFilter')} ({recommendations.length})
            </Button>
            {Object.values(ProgramCategory).map(category => {
              const count = recommendations.filter(r => r.category === category).length;
              if (count === 0) return null;
              return (
                <Button
                  key={category}
                  variant={filter === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(category)}
                >
                  {category} ({count})
                </Button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'priority' | 'cost' | 'pain')}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md"
            >
              <option value="priority">{t('sortOptions.priority')}</option>
              <option value="cost">{t('sortOptions.cost')}</option>
              <option value="pain">{t('sortOptions.pain')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Recommendations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecommendations.map(program => (
          <ProgramCard
            key={program.id}
            program={program}
            onSelect={onSelectProgram ? () => onSelectProgram(program) : undefined}
            onBook={onBookConsultation ? () => onBookConsultation(program) : undefined}
            t={t}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredRecommendations.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">{t('noResults')}</p>
        </Card>
      )}
    </div>
  );
};

export default ProgramRecommendations;
