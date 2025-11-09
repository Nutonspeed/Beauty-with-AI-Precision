'use client';

/**
 * Analysis Detail Client Component
 * 
 * Interactive client-side component for displaying analysis results
 * Features:
 * - Tab navigation between modes
 * - Interactive visualizations
 * - Comparison view
 * - Export/share functionality
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Share2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Activity,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Analysis {
  id: string;
  user_id: string;
  analyzed_at: string;
  image_url: string;
  visualization_url?: string;
  overall_score: number;
  skin_health_grade: string;
  
  // Scores
  spots_score: number;
  wrinkles_score: number;
  texture_score: number;
  pores_score: number;
  uv_spots_score: number;
  brown_spots_score: number;
  red_areas_score: number;
  porphyrins_score: number;
  
  // Counts
  spots_count: number;
  wrinkles_count: number;
  pores_count: number;
  uv_spots_count: number;
  brown_spots_count: number;
  red_areas_percentage: number;
  porphyrins_count: number;
  
  // Severity
  spots_severity: string;
  wrinkles_severity: string;
  texture_severity: string;
  pores_severity: string;
  uv_spots_severity: string;
  brown_spots_severity: string;
  red_areas_severity: string;
  porphyrins_severity: string;
  
  // Metadata
  processing_time_ms: number;
  recommendations?: any;
  is_baseline: boolean;
}

interface AnalysisDetailClientProps {
  analysis: Analysis;
  comparisonAnalysis?: Analysis | null;
  availableAnalyses: Array<{
    id: string;
    analyzed_at: string;
    overall_score: number;
    is_baseline: boolean;
  }>;
  userProfile?: {
    full_name?: string;
    avatar_url?: string;
    skin_type?: string;
    skin_concerns?: string[];
  };
  userId: string;
}

const MODES = [
  { id: 'spots', label: 'Spots', icon: '🔴', color: 'text-red-600' },
  { id: 'wrinkles', label: 'Wrinkles', icon: '📏', color: 'text-orange-600' },
  { id: 'texture', label: 'Texture', icon: '✨', color: 'text-yellow-600' },
  { id: 'pores', label: 'Pores', icon: '⚪', color: 'text-gray-600' },
  { id: 'uv_spots', label: 'UV Spots', icon: '☀️', color: 'text-purple-600' },
  { id: 'brown_spots', label: 'Brown Spots', icon: '🟤', color: 'text-amber-700' },
  { id: 'red_areas', label: 'Red Areas', icon: '🔺', color: 'text-rose-600' },
  { id: 'porphyrins', label: 'Porphyrins', icon: '💧', color: 'text-blue-600' },
];

export default function AnalysisDetailClient({
  analysis,
  comparisonAnalysis,
  availableAnalyses,
  userProfile,
  userId,
}: AnalysisDetailClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [regenerating, setRegenerating] = useState(false);
  const [vizUrl, setVizUrl] = useState(analysis.visualization_url);
  const analyzedAtDisplay = useMemo(() => {
    try {
      const analysisDate = new Date(analysis.analyzed_at);
      if (Number.isNaN(analysisDate.getTime())) {
        return 'Analysis time unavailable';
      }
      return formatDistanceToNow(analysisDate, { addSuffix: true });
    } catch (error) {
      console.warn('[AnalysisDetailClient] Failed to format analysis date:', error);
      return 'Analysis time unavailable';
    }
  }, [analysis.analyzed_at]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getModeData = (mode: string) => {
    return {
      score: analysis[`${mode}_score` as keyof Analysis] as number,
      count: analysis[`${mode}_count` as keyof Analysis] as number || 
             (mode === 'red_areas' ? analysis.red_areas_percentage : 0),
      severity: analysis[`${mode}_severity` as keyof Analysis] as string,
    };
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPriorityBadgeVariant = (priority?: string) => {
    if (!priority) return 'secondary';
    if (priority === 'critical') return 'destructive';
    if (priority === 'high') return 'default';
    return 'secondary';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/analysis">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Analyses
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Skin Analysis Results
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                {analyzedAtDisplay}
                {analysis.is_baseline && (
                  <Badge variant="outline" className="ml-2">
                    Baseline
                  </Badge>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8 border-2 shadow-lg">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Score */}
              <div className="text-center">
                <div className="mb-2 text-slate-600 dark:text-slate-400">
                  Overall Skin Score
                </div>
                <div className={`text-6xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                  {analysis.overall_score.toFixed(1)}
                </div>
                <div className="mt-2">
                  <Badge className={`text-lg px-4 py-1 ${getSeverityColor('low')}`}>
                    {analysis.skin_health_grade}
                  </Badge>
                </div>
              </div>

              {/* Image Comparison */}
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Original Image
                    </div>
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                      <Image
                        src={analysis.image_url}
                        alt="Original"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Analysis Visualization
                    </div>
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                      {vizUrl ? (
                        <Image
                          src={vizUrl}
                          alt="Visualization"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-slate-100 dark:bg-slate-800 p-4 text-center gap-2">
                          <p className="text-slate-500 text-sm">Visualization not available</p>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={regenerating}
                            onClick={async () => {
                              setRegenerating(true);
                              try {
                                const resp = await fetch('/api/analysis/visualize', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: analysis.id }),
                                });
                                if (resp.ok) {
                                  const json = await resp.json();
                                  if (json.visualization_url) {
                                    setVizUrl(json.visualization_url);
                                  }
                                }
                              } finally {
                                setRegenerating(false);
                              }
                            }}
                          >
                            {regenerating ? 'Generating...' : 'Generate Visualization'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Info */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Processing: {analysis.processing_time_ms}ms
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  8-Mode Analysis
                </span>
              </div>
              <span className="text-xs">Analysis ID: {analysis.id.slice(0, 8)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Results</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {MODES.map((mode) => {
                const data = getModeData(mode.id);
                return (
                  <Card key={mode.id} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <span className="text-2xl">{mode.icon}</span>
                          {mode.label}
                        </span>
                        <Badge className={getSeverityColor(data.severity)}>
                          {data.severity}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Score
                          </span>
                          <span className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                            {data.score.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {mode.id === 'red_areas' ? 'Coverage' : 'Count'}
                          </span>
                          <span className="text-lg font-semibold">
                            {mode.id === 'red_areas' 
                              ? `${data.count.toFixed(1)}%` 
                              : data.count}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Analysis Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {MODES.map((mode) => {
                    const data = getModeData(mode.id);
                    return (
                      <div
                        key={mode.id}
                        className="pb-6 border-b border-slate-200 dark:border-slate-700 last:border-0"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{mode.icon}</span>
                            <div>
                              <h3 className="text-lg font-semibold">{mode.label}</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Detected: {mode.id === 'red_areas' 
                                  ? `${data.count.toFixed(1)}% coverage` 
                                  : `${data.count} ${mode.id}`}
                              </p>
                            </div>
                          </div>
                          <Badge className={getSeverityColor(data.severity)}>
                            {data.severity} severity
                          </Badge>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">
                              Health Score
                            </span>
                            <span className={`font-semibold ${getScoreColor(data.score)}`}>
                              {data.score.toFixed(1)}/100
                            </span>
                          </div>
                          <Progress
                            value={Math.round(data.score)}
                            className="h-2 bg-slate-200 dark:bg-slate-700"
                            indicatorClassName={getProgressBarColor(data.score)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {analysis.recommendations ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Treatments */}
                {analysis.recommendations.treatments?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recommended Treatments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.recommendations.treatments.map((treatment: any) => (
                        <div
                          key={treatment.name || treatment.description}
                          className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{treatment.name}</h4>
                            {treatment.priority && (
                              <Badge
                                variant={treatment.priority === 'high' ? 'destructive' : 'secondary'}
                              >
                                {treatment.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {treatment.description}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Products */}
                {analysis.recommendations.products?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Recommended Products
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.recommendations.products.map((product: any) => (
                        <div
                          key={product.name || product.category}
                          className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <h4 className="font-semibold mb-1">{product.name}</h4>
                          <p className="text-xs text-slate-500 mb-2">{product.category}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {product.description}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Lifestyle */}
                {analysis.recommendations.lifestyle?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Lifestyle Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.recommendations.lifestyle.map((tip: any) => (
                        <div
                          key={tip.category || tip.description}
                          className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold capitalize">{tip.category}</h4>
                            {tip.priority && (
                              <Badge
                                variant={getPriorityBadgeVariant(tip.priority)}
                              >
                                {tip.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {tip.description}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400">
                    No recommendations available for this analysis.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
