'use client';

/**
 * Analysis Detail Page - [id]
 * Full VISIA report with AR viewer and export options
 */

import { useState, useEffect } from 'react';
import { VISIAReport } from '@/components/analysis/visia-report';
import AnalysisDetailClient from '@/components/analysis/AnalysisDetailClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Face3DViewer } from '@/components/ar/face-3d-viewer';
import { TreatmentSimulator } from '@/components/ar/treatment-simulator';
import PriorityRankingCard from '@/components/analysis/priority-ranking-card';
import TreatmentRecommendations from '@/components/analysis/treatment-recommendations';
import { Loader2, AlertCircle, ArrowLeft, Globe, Check, Presentation, LineChart } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { downloadAnalysisPDF } from '@/lib/utils/pdf-export';
import { exportToPNG, shareAnalysis, printReport } from '@/lib/utils/export-report';
import { rankSkinConcernPriorities } from '@/lib/ai/priority-ranking';
import { generateTreatmentRecommendations } from '@/lib/ai/treatment-recommendations';
import type { PriorityRankingResult } from '@/lib/ai/priority-ranking';
import type { RecommendationResult } from '@/lib/ai/treatment-recommendations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
  HybridSkinAnalysis,
  SkinConcern,
  SkinType,
  AIAnalysisResult,
  CVAnalysisResult,
  AIProvider,
} from '@/lib/types/skin-analysis';
import { useAuth } from '@/lib/auth/context';

const TRANSLATIONS = {
  en: {
    report: 'Report',
    '3dView': '3D View',
    simulator: 'Simulator',
    priorities: 'Priorities',
    recommendations: 'Recommendations',
    advanced: 'Advanced',
    backToHistory: 'Back to History',
    analyzeAnother: 'Analyze Another Photo',
    backToHome: 'Back to Home',
    notFound: 'Analysis not found',
    loading: 'Loading analysis...',
    language: 'Language',
    presentationMode: 'Sales Presentation',
    compareProgress: 'Compare Progress'
  },
  th: {
    report: 'รายงาน',
    '3dView': 'มุมมอง 3D',
    simulator: 'จำลองผล',
    priorities: 'ความสำคัญ',
    recommendations: 'คำแนะนำการรักษา',
    advanced: 'ขั้นสูง',
    backToHistory: 'กลับไปประวัติ',
    analyzeAnother: 'วิเคราะห์รูปใหม่',
    backToHome: 'กลับหน้าแรก',
    notFound: 'ไม่พบข้อมูลการวิเคราะห์',
    loading: 'กำลังโหลดข้อมูล...',
    language: 'ภาษา',
    presentationMode: 'โหมดนำเสนอขาย',
    compareProgress: 'เปรียบเทียบความคืบหน้า'
  }
};

const LANGUAGES = [
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

const SKIN_TYPES: SkinType[] = ['oily', 'dry', 'combination', 'normal', 'sensitive'];
const SKIN_CONCERNS: SkinConcern[] = [
  'acne',
  'wrinkles',
  'dark_spots',
  'large_pores',
  'redness',
  'dullness',
  'fine_lines',
  'blackheads',
  'hyperpigmentation',
];
type RecommendationCategory = AIAnalysisResult['recommendations'][number]['category'];
const RECOMMENDATION_CATEGORIES: RecommendationCategory[] = [
  'cleanser',
  'serum',
  'moisturizer',
  'treatment',
  'sunscreen',
];
const AI_PROVIDERS: AIProvider[] = ['huggingface', 'google-vision', 'gemini'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isSkinType = (value: unknown): value is SkinType =>
  typeof value === 'string' && SKIN_TYPES.includes(value as SkinType);

const isSkinConcern = (value: unknown): value is SkinConcern =>
  typeof value === 'string' && SKIN_CONCERNS.includes(value as SkinConcern);

const isAIProvider = (value: unknown): value is AIProvider =>
  typeof value === 'string' && AI_PROVIDERS.includes(value as AIProvider);

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const numeric = asNumber(value);
  return numeric ?? fallback;
};

const clamp = (value: number, min = 0, max = 10): number => Math.min(max, Math.max(min, value));

const normalizeSeverity = (raw: unknown): Record<SkinConcern, number> => {
  return SKIN_CONCERNS.reduce((acc, concern) => {
    const source = isRecord(raw) ? raw[concern] : undefined;
    acc[concern] = clamp(toNumber(source, 0));
    return acc;
  }, {} as Record<SkinConcern, number>);
};

const normalizeAIRecommendations = (raw: unknown): AIAnalysisResult['recommendations'] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const allowed = new Set<RecommendationCategory>(RECOMMENDATION_CATEGORIES);
  const recommendations: AIAnalysisResult['recommendations'] = [];

  for (const entry of raw) {
    if (typeof entry === 'string' && entry.trim() !== '') {
      recommendations.push({
        category: 'treatment',
        product: entry,
        reason: 'Provided by AI analysis',
      });
      continue;
    }

    if (!isRecord(entry)) {
      continue;
    }

    const entryRecord = entry as Record<string, unknown>;
    const productValue = entryRecord.product;
    if (typeof productValue !== 'string' || productValue.trim() === '') {
      continue;
    }

    const reasonValue = entryRecord.reason;
    const categoryValue = entryRecord.category;
    const category = typeof categoryValue === 'string' && allowed.has(categoryValue as RecommendationCategory)
      ? (categoryValue as RecommendationCategory)
      : 'treatment';
    const reason = typeof reasonValue === 'string' && reasonValue.trim() !== ''
      ? reasonValue
      : 'Provided by AI analysis';

    recommendations.push({ category, product: productValue, reason });
  }

  return recommendations;
};

const normalizeAIAnalysis = (raw: unknown): AIAnalysisResult => {
  const record = isRecord(raw) ? raw : {};
  const skinTypeCandidate = record.skinType;
  const concernsCandidate = record.concerns;
  const recommendationsCandidate = record.recommendations;
  const confidenceValue = record.confidence ?? record.confidenceLevel;

  const skinType = isSkinType(skinTypeCandidate) ? skinTypeCandidate : 'normal';
  const concerns = Array.isArray(concernsCandidate)
    ? concernsCandidate.filter(isSkinConcern)
    : [];
  const severity = normalizeSeverity(record.severity);
  const recommendations = normalizeAIRecommendations(recommendationsCandidate);
  const confidence = clamp(toNumber(confidenceValue, 0.8), 0, 1);

  const ai: AIAnalysisResult = {
    skinType,
    concerns,
    severity,
    recommendations,
    confidence,
  };

  if (typeof record.treatmentPlan === 'string') {
    ai.treatmentPlan = record.treatmentPlan;
  }

  return ai;
};

const normalizeCVAnalysis = (raw: unknown): CVAnalysisResult => {
  const record = isRecord(raw) ? raw : {};
  const spotsRaw = isRecord(record.spots) ? record.spots : {};
  const poresRaw = isRecord(record.pores) ? record.pores : {};
  const wrinklesRaw = isRecord(record.wrinkles) ? record.wrinkles : {};
  const textureRaw = isRecord(record.texture) ? record.texture : {};
  const rednessRaw = isRecord(record.redness) ? record.redness : {};

  const spotsLocations = Array.isArray((spotsRaw as Record<string, unknown>).locations)
    ? ((spotsRaw as Record<string, unknown>).locations as unknown[])
        .map((loc) => {
          if (!isRecord(loc)) return null;
          const x = asNumber(loc.x);
          const y = asNumber(loc.y);
          const radius = asNumber(loc.radius);
          if (x === undefined || y === undefined || radius === undefined) return null;
          return { x, y, radius };
        })
        .filter((loc): loc is { x: number; y: number; radius: number } => loc !== null)
    : [];

  const poresAverage =
    asNumber((poresRaw as Record<string, unknown>).averageSize) ??
    asNumber((poresRaw as Record<string, unknown>).average) ??
    asNumber((poresRaw as Record<string, unknown>).size) ??
    0;
  const poresCount =
    asNumber((poresRaw as Record<string, unknown>).enlargedCount) ??
    asNumber((poresRaw as Record<string, unknown>).count) ??
    0;

  const wrinklesLocations = Array.isArray((wrinklesRaw as Record<string, unknown>).locations)
    ? ((wrinklesRaw as Record<string, unknown>).locations as unknown[])
        .map((loc) => {
          if (!isRecord(loc)) return null;
          const x1 = asNumber(loc.x1);
          const y1 = asNumber(loc.y1);
          const x2 = asNumber(loc.x2);
          const y2 = asNumber(loc.y2);
          if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return null;
          return { x1, y1, x2, y2 };
        })
        .filter((loc): loc is { x1: number; y1: number; x2: number; y2: number } => loc !== null)
    : [];

  const rednessAreasSource = Array.isArray((rednessRaw as Record<string, unknown>).areas)
    ? ((rednessRaw as Record<string, unknown>).areas as unknown[])
    : Array.isArray((rednessRaw as Record<string, unknown>).locations)
    ? ((rednessRaw as Record<string, unknown>).locations as unknown[])
    : [];

  const rednessAreas = rednessAreasSource
    .map((area) => {
      if (!isRecord(area)) return null;
      const x = asNumber(area.x);
      const y = asNumber(area.y);
      const width = asNumber(area.width ?? area.size);
      const height = asNumber(area.height ?? area.size);
      if (x === undefined || y === undefined || width === undefined || height === undefined) return null;
      return { x, y, width, height };
    })
    .filter((area): area is { x: number; y: number; width: number; height: number } => area !== null);

  const textureSmoothness = clamp(
    toNumber((textureRaw as Record<string, unknown>).smoothness ?? (textureRaw as Record<string, unknown>).score, 0)
  );
  const textureScore = clamp(
    toNumber((textureRaw as Record<string, unknown>).score ?? textureSmoothness, textureSmoothness)
  );
  const textureRoughness = clamp(
    toNumber((textureRaw as Record<string, unknown>).roughness ?? 10 - textureSmoothness, 10 - textureSmoothness)
  );

  return {
    spots: {
      count: clamp(toNumber((spotsRaw as Record<string, unknown>).count, spotsLocations.length), 0, Number.MAX_SAFE_INTEGER),
      locations: spotsLocations,
      severity: clamp(toNumber((spotsRaw as Record<string, unknown>).severity, 0)),
    },
    pores: {
      averageSize: clamp(poresAverage, 0, Number.MAX_SAFE_INTEGER),
      enlargedCount: clamp(poresCount, 0, Number.MAX_SAFE_INTEGER),
      severity: clamp(toNumber((poresRaw as Record<string, unknown>).severity, 0)),
    },
    wrinkles: {
      count: clamp(toNumber((wrinklesRaw as Record<string, unknown>).count, wrinklesLocations.length), 0, Number.MAX_SAFE_INTEGER),
      locations: wrinklesLocations,
      severity: clamp(toNumber((wrinklesRaw as Record<string, unknown>).severity, 0)),
    },
    texture: {
      smoothness: textureSmoothness,
      roughness: textureRoughness,
      score: textureScore,
    },
    redness: {
      percentage: clamp(
        toNumber((rednessRaw as Record<string, unknown>).percentage ?? (rednessRaw as Record<string, unknown>).coverage, 0),
        0,
        100
      ),
      areas: rednessAreas,
      severity: clamp(toNumber((rednessRaw as Record<string, unknown>).severity, 0)),
    },
  };
};

const normalizeOverallScore = (
  raw: unknown,
  cv: CVAnalysisResult
): HybridSkinAnalysis['overallScore'] => {
  const record = isRecord(raw) ? raw : {};
  return {
    spots: clamp(toNumber(record.spots, cv.spots.severity)),
    pores: clamp(toNumber(record.pores, cv.pores.severity)),
    wrinkles: clamp(toNumber(record.wrinkles, cv.wrinkles.severity)),
    texture: clamp(toNumber(record.texture, cv.texture.score)),
    redness: clamp(toNumber(record.redness, cv.redness.severity)),
    pigmentation: clamp(toNumber(record.pigmentation, cv.spots.severity)),
  };
};

const normalizePercentiles = (raw: unknown): HybridSkinAnalysis['percentiles'] => {
  const record = isRecord(raw) ? raw : {};
  const percentiles = {
    spots: clamp(toNumber(record.spots, 0), 0, 100),
    pores: clamp(toNumber(record.pores, 0), 0, 100),
    wrinkles: clamp(toNumber(record.wrinkles, 0), 0, 100),
    texture: clamp(toNumber(record.texture, 0), 0, 100),
    redness: clamp(toNumber(record.redness, 0), 0, 100),
    overall: clamp(toNumber(record.overall, Number.NaN), 0, 100),
  };

  if (!Number.isFinite(percentiles.overall)) {
    const average =
      (percentiles.spots + percentiles.pores + percentiles.wrinkles + percentiles.texture + percentiles.redness) /
      5;
    percentiles.overall = clamp(Math.round(average), 0, 100);
  }

  return percentiles;
};

const normalizeAnnotatedImages = (raw: unknown): HybridSkinAnalysis['annotatedImages'] => {
  if (!isRecord(raw)) {
    return {};
  }

  const result: HybridSkinAnalysis['annotatedImages'] = {};
  const keys: Array<keyof HybridSkinAnalysis['annotatedImages']> = [
    'spots',
    'pores',
    'wrinkles',
    'redness',
    'combined',
  ];

  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim() !== '') {
      result[key] = value;
    }
  }

  return result;
};

const normalizeFaceMesh = (raw: unknown): HybridSkinAnalysis['faceMesh'] | undefined => {
  if (!isRecord(raw)) {
    return undefined;
  }

  const landmarksRaw = raw.landmarks;
  if (!Array.isArray(landmarksRaw) || landmarksRaw.length === 0) {
    return undefined;
  }

  const normalizedLandmarks = landmarksRaw
    .map((point) => {
      if (!isRecord(point)) return null;
      const x = asNumber(point.x);
      const y = asNumber(point.y);
      const z = asNumber(point.z);
      if (x === undefined || y === undefined || z === undefined) return null;
      return { x, y, z };
    })
    .filter((point): point is { x: number; y: number; z: number } => point !== null);

  if (normalizedLandmarks.length === 0) {
    return undefined;
  }

  const topologyRaw = raw.topology;
  const normalizedTopology = Array.isArray(topologyRaw)
    ? topologyRaw
        .map((row) => {
          if (!Array.isArray(row)) return null;
          const normalizedRow = row
            .map((value) => asNumber(value))
            .filter((value): value is number => value !== undefined);
          return normalizedRow.length > 0 ? normalizedRow : null;
        })
        .filter((row): row is number[] => row !== null)
    : [];

  return {
    landmarks: normalizedLandmarks,
    topology: normalizedTopology,
  };
};

const buildHybridAnalysis = (raw: unknown, fallbackId: string): HybridSkinAnalysis => {
  const record = isRecord(raw) ? raw : {};
  const ai = normalizeAIAnalysis(record.aiAnalysis ?? record.ai);
  const cv = normalizeCVAnalysis(record.cvAnalysis ?? record.cv);
  const overallScore = normalizeOverallScore(record.overallScore, cv);
  const percentiles = normalizePercentiles(record.percentiles);
  const annotatedImages = normalizeAnnotatedImages(record.annotatedImages);
  const faceMesh = normalizeFaceMesh(record.faceMesh);

  const createdAtSource = record.createdAt ?? record.created_at;
  const timestampSource = record.timestamp ?? createdAtSource;
  const createdAt = new Date(
    typeof createdAtSource === 'string' || typeof createdAtSource === 'number'
      ? createdAtSource
      : Date.now()
  );
  const timestamp = new Date(
    typeof timestampSource === 'string' || typeof timestampSource === 'number'
      ? timestampSource
      : Date.now()
  );

  const recommendationsSource = Array.isArray(record.recommendations)
    ? record.recommendations.filter((item): item is string => typeof item === 'string')
    : undefined;

  const confidenceValue = record.confidence ?? record.confidence_level ?? ai.confidence;
  const providerValue = record.aiProvider ?? record.ai_provider ?? record.provider;
  const aiProvider = isAIProvider(providerValue) ? providerValue : 'gemini';

  return {
    id: typeof record.id === 'string' && record.id ? record.id : fallbackId,
    userId: typeof record.userId === 'string' ? record.userId : '',
    createdAt,
    timestamp,
    imageUrl: typeof record.imageUrl === 'string' ? record.imageUrl : '',
    ai,
    aiProvider,
    cv,
    overallScore,
    percentiles,
    confidence: clamp(toNumber(confidenceValue, ai.confidence), 0, 1),
    recommendations:
      recommendationsSource && recommendationsSource.length > 0
        ? recommendationsSource
        : ai.recommendations.map((rec) => `${rec.product}: ${rec.reason}`),
    annotatedImages,
    faceMesh,
  };
};

interface AnalysisDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

/**
 * Transform database record to AnalysisDetailClient format
 */
function transformToAnalysisFormat(dbRecord: any) {
  const getHealthGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const parseDate = (value: unknown): string => {
    if (!value) {
      return new Date().toISOString();
    }

    const parsed = new Date(value as string);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  };

  const getSeverityFromScore = (score: number): string => {
    if (score >= 90) return 'low';
    if (score >= 75) return 'moderate';
    if (score >= 50) return 'high';
    return 'severe';
  };

  const normalizeSeverity = (value: unknown, scoreFallback?: number, countFallback?: number, maxGood: number = 0): string => {
    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      if (value <= 2) return 'mild';
      if (value <= 5) return 'moderate';
      if (value <= 8) return 'high';
      return 'severe';
    }

    if (typeof scoreFallback === 'number') {
      return getSeverityFromScore(scoreFallback);
    }

    if (typeof countFallback === 'number') {
      const scoreFromCount = Math.max(0, 100 - Math.max(0, countFallback - maxGood) * 2);
      return getSeverityFromScore(scoreFromCount);
    }

    return 'mild';
  };

  const parseOptionalNumber = (value: unknown): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const n = Number(value);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  const numberWithFallback = (value: unknown, fallback: number): number => {
    const parsed = parseOptionalNumber(value);
    return typeof parsed === 'number' ? parsed : fallback;
  };

  let parsedRecommendations: string[] | null = null;
  if (Array.isArray(dbRecord.recommendations)) {
    parsedRecommendations = dbRecord.recommendations;
  } else if (typeof dbRecord.recommendations === 'string' && dbRecord.recommendations.trim() !== '') {
    parsedRecommendations = [dbRecord.recommendations];
  }

  const analyzedAt = parseDate(dbRecord.analyzed_at || dbRecord.created_at || dbRecord.createdAt);
  const overallScore = numberWithFallback(dbRecord.overall_score, 0);
  const spotsCount = numberWithFallback(dbRecord.spots_count, 0);
  const wrinklesCount = numberWithFallback(dbRecord.wrinkles_count, 0);
  const poresCount = numberWithFallback(dbRecord.pores_count, 0);
  const uvSpotsCount = numberWithFallback(dbRecord.uv_spots_count, 0);
  const brownSpotsCount = numberWithFallback(dbRecord.brown_spots_count, 0);
  const redAreasPct = numberWithFallback(dbRecord.red_areas_percentage, 0);
  const porphyrinsCount = numberWithFallback(dbRecord.porphyrins_count, 0);

  const calcScoreFromCount = (count: number, maxGood: number) => Math.max(0, 100 - Math.max(0, count - maxGood) * 2);

  return {
    id: dbRecord.id,
    user_id: dbRecord.user_id,
    image_url: dbRecord.image_url,
    visualization_url: dbRecord.visualization_url,
    analyzed_at: analyzedAt,
    overall_score: overallScore,
    skin_health_grade: getHealthGrade(overallScore),

    spots_score: numberWithFallback(dbRecord.spots_score, calcScoreFromCount(spotsCount, 5)),
    spots_count: spotsCount,
    spots_severity: normalizeSeverity(dbRecord.spots_severity, parseOptionalNumber(dbRecord.spots_score), spotsCount, 5),

    wrinkles_score: numberWithFallback(dbRecord.wrinkles_score, calcScoreFromCount(wrinklesCount, 3)),
    wrinkles_count: wrinklesCount,
    wrinkles_severity: normalizeSeverity(dbRecord.wrinkles_severity, parseOptionalNumber(dbRecord.wrinkles_score), wrinklesCount, 3),

    texture_score: numberWithFallback(dbRecord.texture_score, numberWithFallback(dbRecord.texture_smoothness, 80)),
    texture_smoothness: numberWithFallback(dbRecord.texture_smoothness, 0),
    texture_roughness: numberWithFallback(dbRecord.texture_roughness, 0),
    texture_severity: normalizeSeverity(dbRecord.texture_severity, parseOptionalNumber(dbRecord.texture_score)),

    pores_score: numberWithFallback(dbRecord.pores_score, calcScoreFromCount(poresCount, 50)),
    pores_count: poresCount,
    pores_average_size: numberWithFallback(dbRecord.pores_average_size, 0),
    pores_severity: normalizeSeverity(dbRecord.pores_severity, parseOptionalNumber(dbRecord.pores_score), poresCount, 50),

    uv_spots_score: numberWithFallback(dbRecord.uv_spots_score, calcScoreFromCount(uvSpotsCount, 3)),
    uv_spots_count: uvSpotsCount,
    uv_spots_severity: normalizeSeverity(dbRecord.uv_spots_severity, parseOptionalNumber(dbRecord.uv_spots_score), uvSpotsCount, 3),

    brown_spots_score: numberWithFallback(dbRecord.brown_spots_score, calcScoreFromCount(brownSpotsCount, 3)),
    brown_spots_count: brownSpotsCount,
    brown_spots_severity: normalizeSeverity(dbRecord.brown_spots_severity, parseOptionalNumber(dbRecord.brown_spots_score), brownSpotsCount, 3),

    red_areas_score: numberWithFallback(dbRecord.red_areas_score, Math.max(0, 100 - redAreasPct)),
    red_areas_percentage: redAreasPct,
    red_areas_severity: normalizeSeverity(dbRecord.red_areas_severity, parseOptionalNumber(dbRecord.red_areas_score), redAreasPct, 0),

    porphyrins_score: numberWithFallback(dbRecord.porphyrins_score, calcScoreFromCount(porphyrinsCount, 2)),
    porphyrins_count: porphyrinsCount,
    porphyrins_severity: normalizeSeverity(dbRecord.porphyrins_severity, parseOptionalNumber(dbRecord.porphyrins_score), porphyrinsCount, 2),

    processing_time_ms: numberWithFallback(dbRecord.processing_time_ms ?? dbRecord.processing_time, 0),
    recommendations: parsedRecommendations,
    is_baseline: Boolean(dbRecord.is_baseline),
  };
}

/**
 * Advanced Analysis Tab Component
 * Fetches and displays 8-mode CV analysis data
 */
function AdvancedAnalysisTab({ analysisId, locale }: { analysisId: string; locale: string }) {
  const [cvData, setCvData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCVAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch 8-mode analysis from API
        const response = await fetch(`/api/analysis/multi-mode?id=${analysisId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to load advanced analysis');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform database format to component format
          const transformedData = transformToAnalysisFormat(data.data);
          setCvData(transformedData);
        } else {
          throw new Error(data.error || 'Failed to load analysis');
        }
      } catch (err) {
        console.error('Advanced analysis error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load advanced analysis');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVAnalysis();
  }, [analysisId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          {locale === 'th' ? 'กำลังโหลดการวิเคราะห์ขั้นสูง...' : 'Loading advanced analysis...'}
        </span>
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || (locale === 'th' ? 'ไม่พบข้อมูลการวิเคราะห์ขั้นสูง' : 'Advanced analysis not found')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <AnalysisDetailClient
      analysis={cvData}
      userId={cvData.user_id}
      comparisonAnalysis={null}
      availableAnalyses={[]}
      userProfile={null}
    />
  );
}

export default function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const [analysis, setAnalysis] = useState<HybridSkinAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [priorityRanking, setPriorityRanking] = useState<PriorityRankingResult | null>(null);
  const [treatmentRecs, setTreatmentRecs] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const urlParams = useParams();
  const locale = (urlParams.locale as string) || 'en';
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  
  // Get user role for permission checks
  const { user } = useAuth();
  const canAccessSalesPresentation = user?.role && ['sales_staff', 'clinic_owner', 'clinic_admin', 'super_admin'].includes(user.role);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setIsAuthenticated(!!data?.user);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    params.then((resolvedParams) => {
      setAnalysisId(resolvedParams.id);
      loadAnalysis(resolvedParams.id);
    });
  }, [params]);

  const loadAnalysis = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/skin-analysis/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Analysis not found');
        }
        throw new Error('Failed to load analysis');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Failed to load analysis');
      }

      const normalizedAnalysis = buildHybridAnalysis(data.data, id);
      setAnalysis(normalizedAnalysis);
      setImageUrl(normalizedAnalysis.imageUrl || null);
      
      // Calculate priority ranking
      const ranking = rankSkinConcernPriorities(normalizedAnalysis);
      setPriorityRanking(ranking);
      
      // Generate treatment recommendations
      const skinType = normalizedAnalysis.ai.skinType || 'normal';
      const recommendations = generateTreatmentRecommendations(
        normalizedAnalysis,
        skinType as 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'
      );
      setTreatmentRecs(recommendations);
      
      // Get patient info from API or create fallback
      const patientInfoValue = isRecord(data.data) && 'patientInfo' in data.data
        ? (data.data as Record<string, unknown>).patientInfo ?? null
        : null;
      
      // Create fallback patient info if not available
      const finalPatientInfo = patientInfoValue || {
        name: locale === 'th' ? 'ผู้รับบริการ' : 'Patient',
        skinType: normalizedAnalysis.ai.skinType || 'normal'
      };
      
      setPatientInfo(finalPatientInfo);
    } catch (err) {
      console.error('Load analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'png') => {
    try {
      if (!analysis) return;

      if (format === 'pdf') {
        // Use new professional PDF export
        await downloadAnalysisPDF(
          analysis,
          {
            locale: locale as 'th' | 'en',
            patientInfo: patientInfo ? {
              name: patientInfo.name,
              age: patientInfo.age,
              gender: patientInfo.gender,
              skinType: patientInfo.skinType || analysis.ai.skinType,
              customerId: analysisId || undefined,
            } : undefined,
            clinicInfo: {
              name: 'AI367 Skin Clinic',
              nameTh: 'คลินิก AI367',
              address: '123 Medical Plaza, Bangkok, Thailand',
              addressTh: '123 อาคารแมดิคัล พลาซ่า กรุงเทพฯ',
              phone: '+66 2 XXX XXXX',
              email: 'info@ai367clinic.com',
              website: 'www.ai367clinic.com',
            },
            includeCharts: true,
            includePhotos: !!imageUrl,
            includeRecommendations: !!treatmentRecs,
            includePriorityRanking: !!priorityRanking,
            photos: imageUrl ? {
              current: imageUrl,
            } : undefined,
          },
          `skin-analysis-${analysisId}-${Date.now()}.pdf`
        );
      } else if (format === 'png') {
        const blob = await exportToPNG('visia-report');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skin-analysis-${analysisId}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export report');
    }
  };

  const handleShare = async () => {
    try {
      if (!analysis) {
        return;
      }
      await shareAnalysis(analysis, {
        title: 'My Skin Analysis Report',
      });
    } catch (err) {
      console.error('Share error:', err);
      alert('Sharing not supported on this device');
    }
  };

  const handlePrint = () => {
    printReport('visia-report');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || t.notFound}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push(`/${urlParams.locale}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.backToHome}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <Button
          onClick={() => {
            if (isAuthenticated) {
              router.push(`/${urlParams.locale}/analysis/history`);
            } else {
              router.push(`/${urlParams.locale}`);
            }
          }}
          variant="ghost"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAuthenticated ? t.backToHistory : t.analyzeAnother}
        </Button>

        {canAccessSalesPresentation && (
          <Button
            onClick={() => router.push(`/${locale}/sales/presentation/${analysisId}`)}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <Presentation className="w-4 h-4" />
            <span className="hidden sm:inline">{t.presentationMode}</span>
          </Button>
        )}

        <Button
          onClick={() => {
            if (isAuthenticated && analysis) {
              router.push(`/${locale}/comparison/${analysis.userId}`);
            }
          }}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <LineChart className="w-4 h-4" />
          <span className="hidden sm:inline">{t.compareProgress}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">
                {LANGUAGES.find(l => l.code === locale)?.name || 'English'}
              </span>
              <span className="sm:hidden">
                {LANGUAGES.find(l => l.code === locale)?.flag || '🇬🇧'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {LANGUAGES.map(language => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => {
                  const currentPath = globalThis.location.pathname;
                  const newPath = currentPath.replace(`/${locale}/`, `/${language.code}/`);
                  router.push(newPath);
                }}
                className="gap-2 cursor-pointer"
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {locale === language.code && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="report" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-6">
          <TabsTrigger value="report">{t.report}</TabsTrigger>
          <TabsTrigger value="priorities">{t.priorities}</TabsTrigger>
          <TabsTrigger value="recommendations">{t.recommendations}</TabsTrigger>
          <TabsTrigger value="advanced">{t.advanced}</TabsTrigger>
          <TabsTrigger value="3d">{t['3dView']}</TabsTrigger>
          <TabsTrigger value="simulator">{t.simulator}</TabsTrigger>
        </TabsList>

        <TabsContent value="report">
          <VISIAReport
            analysis={analysis}
            patientInfo={patientInfo}
            locale={locale}
            onExport={handleExport}
            onPrint={handlePrint}
            onShare={handleShare}
          />
        </TabsContent>

        <TabsContent value="priorities">
          {priorityRanking && (
            <PriorityRankingCard
              rankingResult={priorityRanking}
              locale={locale as 'th' | 'en'}
              onBookAppointment={() => {
                router.push(`/${locale}/booking`);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {treatmentRecs && (
            <TreatmentRecommendations
              recommendations={treatmentRecs}
              locale={locale as 'th' | 'en'}
              onBookConsultation={(treatmentId) => {
                router.push(`/${locale}/booking?treatment=${treatmentId}`);
              }}
              onBuyProduct={(productId) => {
                const product = treatmentRecs?.products.find(p => p.id === productId);
                if (product?.purchaseUrl) {
                  globalThis.open(product.purchaseUrl, '_blank');
                }
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="advanced">
          {analysisId && (
            <AdvancedAnalysisTab analysisId={analysisId} locale={locale} />
          )}
        </TabsContent>

        <TabsContent value="3d">
          {imageUrl && (
            <Face3DViewer
              imageUrl={imageUrl}
              analysisData={{
                spots: analysis.cv.spots?.severity || 0,
                pores: analysis.cv.pores?.severity || 0,
                wrinkles: analysis.cv.wrinkles?.severity || 0,
                texture: analysis.cv.texture?.score || 0,
                redness: analysis.cv.redness?.severity || 0,
                overall: analysis.overallScore.spots || 0,
              }}
              locale={locale}
            />
          )}
        </TabsContent>

        <TabsContent value="simulator">
          {imageUrl && (
            <TreatmentSimulator
              beforeImage={imageUrl}
              locale={locale}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
