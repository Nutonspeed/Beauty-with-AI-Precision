/**
 * Treatment Recommendations Display Component
 * Shows AI-generated personalized treatment recommendations
 */

'use client';

import React, { useState } from 'react';
import {
  TreatmentRecommendation,
  TreatmentCategory,
  RecommendationResponse,
} from '@/lib/ai/treatment-recommender';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface TreatmentRecommendationsProps {
  recommendations: TreatmentRecommendation[];
  summary?: RecommendationResponse['summary'];
  onSelectTreatment?: (treatment: TreatmentRecommendation) => void;
  onBookConsultation?: (treatment: TreatmentRecommendation) => void;
}

/**
 * Get color for category badge
 */
const getCategoryColor = (category: TreatmentCategory): string => {
  switch (category) {
    case TreatmentCategory.RESURFACING:
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case TreatmentCategory.ANTI_AGING:
      return 'bg-pink-100 text-pink-800 border-pink-300';
    case TreatmentCategory.PIGMENTATION:
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case TreatmentCategory.TEXTURE:
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case TreatmentCategory.HYDRATION:
      return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    case TreatmentCategory.PREVENTIVE:
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
const getPainLevelText = (level: number): string => {
  if (level === 0) return 'ไม่มี';
  if (level <= 2) return 'น้อยมาก';
  if (level <= 4) return 'น้อย';
  if (level <= 6) return 'ปานกลาง';
  if (level <= 8) return 'มาก';
  return 'มากที่สุด';
};

/**
 * Treatment card component
 */
const TreatmentCard: React.FC<{
  treatment: TreatmentRecommendation;
  onSelect?: () => void;
  onBook?: () => void;
}> = ({ treatment, onSelect, onBook }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{treatment.name}</h3>
            <Badge className={getCategoryColor(treatment.category)}>
              {treatment.category}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{treatment.description}</p>
        </div>
        <div className="ml-4">
          <Badge className={getPriorityColor(treatment.priority)}>
            Priority {treatment.priority.toFixed(1)}
          </Badge>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">AI Confidence</span>
          <span className="text-sm font-bold text-gray-900">
            {(treatment.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <Progress value={treatment.confidence * 100} className="h-2" />
      </div>

      {/* Reasoning */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">เหตุผลที่แนะนำ:</span> {treatment.reasoning}
        </p>
      </div>

      {/* Key Information Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">จำนวนครั้ง</p>
          <p className="text-sm font-semibold text-gray-900">
            {treatment.sessions.recommended} sessions
          </p>
          <p className="text-xs text-gray-500">
            ทุก {treatment.sessions.interval}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">ค่าใช้จ่าย</p>
          <p className="text-sm font-semibold text-gray-900">
            ฿{treatment.cost.min.toLocaleString()} - ฿{treatment.cost.max.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">ระยะพักฟื้น</p>
          <p className="text-sm font-semibold text-gray-900">{treatment.downtime}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">ระดับความเจ็บ</p>
          <p className="text-sm font-semibold text-gray-900">
            {getPainLevelText(treatment.painLevel)} ({treatment.painLevel}/10)
          </p>
        </div>
      </div>

      {/* Expected Results */}
      {treatment.expectedResults.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">ผลลัพธ์ที่คาดหวัง:</h4>
          <div className="space-y-2">
            {treatment.expectedResults.map((result, index) => (
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
            <h4 className="text-sm font-semibold text-gray-900 mb-2">ปัญหาที่รักษา:</h4>
            <div className="flex flex-wrap gap-1">
              {treatment.targetMetrics.map((metric, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {metric}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contraindications */}
          {treatment.contraindications.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-800 mb-2">ข้อห้าม:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {treatment.contraindications.map((contra, index) => (
                  <li key={index}>{contra}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Side Effects */}
          {treatment.sideEffects.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-orange-800 mb-2">ผลข้างเคียง:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {treatment.sideEffects.map((effect, index) => (
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
          {expanded ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
        </Button>
        {onSelect && (
          <Button
            variant="default"
            size="sm"
            onClick={onSelect}
            className="flex-1"
          >
            เลือกรายการนี้
          </Button>
        )}
        {onBook && (
          <Button
            variant="default"
            size="sm"
            onClick={onBook}
            className="flex-1 bg-pink-600 hover:bg-pink-700"
          >
            จองคิว
          </Button>
        )}
      </div>
    </Card>
  );
};

/**
 * Main Treatment Recommendations Component
 */
export const TreatmentRecommendations: React.FC<TreatmentRecommendationsProps> = ({
  recommendations,
  summary,
  onSelectTreatment,
  onBookConsultation,
}) => {
  const [filter, setFilter] = useState<TreatmentCategory | 'all'>('all');
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
        <p className="text-gray-500">ยังไม่มีคำแนะนำการรักษา</p>
        <p className="text-sm text-gray-400 mt-2">
          กรุณาทำการวิเคราะห์ผิวเพื่อรับคำแนะนำที่เหมาะสม
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">สรุปคำแนะนำ</h2>
          
          {/* Primary Concerns */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">ปัญหาหลัก:</h3>
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
            <h3 className="text-sm font-semibold text-gray-700 mb-2">แผนการรักษาที่แนะนำ:</h3>
            <p className="text-gray-900">{summary.recommendedPlan}</p>
          </div>

          {/* Estimates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">ค่าใช้จ่ายโดยประมาณ</p>
              <p className="text-lg font-bold text-gray-900">
                ฿{summary.estimatedCost.min.toLocaleString()} - ฿{summary.estimatedCost.max.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">ระยะเวลาโดยประมาณ</p>
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
              ทั้งหมด ({recommendations.length})
            </Button>
            {Object.values(TreatmentCategory).map(category => {
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
              <option value="priority">เรียงตามความสำคัญ</option>
              <option value="cost">เรียงตามราคา</option>
              <option value="pain">เรียงตามความเจ็บ</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Recommendations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecommendations.map(treatment => (
          <TreatmentCard
            key={treatment.id}
            treatment={treatment}
            onSelect={onSelectTreatment ? () => onSelectTreatment(treatment) : undefined}
            onBook={onBookConsultation ? () => onBookConsultation(treatment) : undefined}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredRecommendations.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">ไม่พบคำแนะนำตามเงื่อนไขที่เลือก</p>
        </Card>
      )}
    </div>
  );
};

export default TreatmentRecommendations;
