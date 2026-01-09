'use client';

/**
 * Sales Presentation Page
 * Full sales demo mode with treatment packages and pricing
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from "next-intl"
import { PresentationMode } from '@/components/presentation/presentation-mode';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import { exportPresentationToPDF } from '@/lib/presentation/pdf-exporter';
import { shareAnalysis } from '@/lib/utils/export-report';

// Same normalization functions from detail page
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const SKIN_TYPES = ['oily', 'dry', 'combination', 'normal', 'sensitive'] as const;
const SKIN_CONCERNS = [
  'acne',
  'wrinkles',
  'dark_spots',
  'large_pores',
  'redness',
  'dullness',
  'fine_lines',
  'blackheads',
  'hyperpigmentation',
] as const;
const AI_PROVIDERS = ['huggingface', 'google-vision', 'gemini'] as const;

type SkinType = (typeof SKIN_TYPES)[number];
type SkinConcern = (typeof SKIN_CONCERNS)[number];
type AIProvider = (typeof AI_PROVIDERS)[number];

const isSkinType = (value: unknown): value is SkinType =>
  typeof value === 'string' && SKIN_TYPES.includes(value as SkinType);

const isSkinConcern = (value: unknown): value is SkinConcern =>
  typeof value === 'string' && SKIN_CONCERNS.includes(value as SkinConcern);

const isAIProvider = (value: unknown): value is AIProvider =>
  typeof value === 'string' && AI_PROVIDERS.includes(value as AIProvider);

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const toNumber = (value: unknown, fallback = 0): number => asNumber(value) ?? fallback;
const clamp = (value: number, min = 0, max = 10): number => Math.min(max, Math.max(min, value));

const normalizeSeverity = (raw: unknown): Record<SkinConcern, number> => {
  return SKIN_CONCERNS.reduce((acc, concern) => {
    const source = isRecord(raw) ? raw[concern] : undefined;
    acc[concern] = clamp(toNumber(source, 0));
    return acc;
  }, {} as Record<SkinConcern, number>);
};

const normalizeAIAnalysis = (raw: unknown): any => {
  const record = isRecord(raw) ? raw : {};
  const skinTypeCandidate = record.skinType;
  const concernsCandidate = record.concerns;
  const recommendationsCandidate = record.recommendations;

  const skinType = isSkinType(skinTypeCandidate) ? skinTypeCandidate : 'normal';
  const concerns = Array.isArray(concernsCandidate)
    ? concernsCandidate.filter(isSkinConcern)
    : [];
  const severity = normalizeSeverity(record.severity);

  const recommendations = Array.isArray(recommendationsCandidate)
    ? recommendationsCandidate
    : [];

  const confidence = clamp(toNumber(record.confidence ?? 0.8, 0.8), 0, 1);

  return { skinType, concerns, severity, recommendations, confidence };
};

const normalizeCVAnalysis = (raw: unknown): any => {
  const record = isRecord(raw) ? raw : {};
  return {
    spots: { count: 0, locations: [], severity: 0 },
    pores: { averageSize: 0, enlargedCount: 0, severity: 0 },
    wrinkles: { count: 0, locations: [], severity: 0 },
    texture: { smoothness: 0, roughness: 0, score: 0 },
    redness: { percentage: 0, areas: [], severity: 0 },
  };
};

const normalizeOverallScore = (raw: unknown, cv: any): any => {
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

const normalizePercentiles = (raw: unknown): any => {
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
      (percentiles.spots +
        percentiles.pores +
        percentiles.wrinkles +
        percentiles.texture +
        percentiles.redness) /
      5;
    percentiles.overall = clamp(Math.round(average), 0, 100);
  }

  return percentiles;
};

const buildHybridAnalysis = (raw: unknown, fallbackId: string): HybridSkinAnalysis => {
  const record = isRecord(raw) ? raw : {};
  const ai = normalizeAIAnalysis(record.aiAnalysis ?? record.ai);
  const cv = normalizeCVAnalysis(record.cvAnalysis ?? record.cv);
  const overallScore = normalizeOverallScore(record.overallScore, cv);
  const percentiles = normalizePercentiles(record.percentiles);

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
    confidence: ai.confidence,
    recommendations: ai.recommendations,
    annotatedImages: {},
  };
};

export default function SalesPresentationPage() {
  const t = useTranslations()
  const currentLocale = useLocale()
  const params = useParams();
  const router = useRouter();
  const localeFromParams = (params.locale as string) || 'en';
  const analysisId = params.id as string;

  const [analysis, setAnalysis] = useState<HybridSkinAnalysis | null>(null);
  const [comparisonAnalysis, setComparisonAnalysis] = useState<HybridSkinAnalysis | null>(null);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/skin-analysis/${analysisId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t('analysis.notFound'));
        }
        throw new Error(t('analysis.error'));
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(t('analysis.error'));
      }

      const normalizedAnalysis = buildHybridAnalysis(data.data, analysisId);
      setAnalysis(normalizedAnalysis);

      // Get patient info
      const patientInfoValue =
        isRecord(data.data) && 'patientInfo' in data.data
          ? (data.data as Record<string, unknown>).patientInfo ?? null
          : null;

      const finalPatientInfo = patientInfoValue || {
        name: t('roles.customer'),
        skinType: normalizedAnalysis.ai.skinType || 'normal',
      };

      setPatientInfo(finalPatientInfo);

      // Try to load previous analysis for comparison
      // This would require an API endpoint that returns user's analysis history
      // For now, we'll leave it null
      // @ts-ignore
    } catch (err) {
      console.error('Load analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  }, [analysisId, t]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const handleExportPDF = async (format: 'pdf' | 'png') => {
    if (!analysis || format !== 'pdf') return;

    try {
      await exportPresentationToPDF(
        analysis,
        {
          locale: currentLocale as 'th' | 'en',
          patientInfo: patientInfo
            ? {
                name: patientInfo.name,
                age: patientInfo.age,
                gender: patientInfo.gender,
                skinType: patientInfo.skinType || analysis.ai.skinType,
                customerId: analysisId,
              }
            : undefined,
          clinicInfo: {
            name: currentLocale === 'th' ? t('common.clinic.name') : t('common.clinic.name'),
            address: currentLocale === 'th' ? t('common.clinic.address') : t('common.clinic.address'),
            phone: t('common.clinic.phone'),
            email: t('common.clinic.email'),
            website: t('common.clinic.website'),
            brandColor: '#6366f1',
          },
          includePricing: true,
          includeTimeline: true,
          showDiscounts: true,
        },
        `treatment-proposal-${analysisId}-${Date.now()}.pdf`
      );
    } catch (err) {
      console.error('Export error:', err);
      alert(t('common.error'));
    }
  };

  const handleShare = async () => {
    if (!analysis) return;
    try {
      await shareAnalysis(analysis, {
        title: t('salesPresentations.steps.proposal'),
      });
    } catch (err) {
      console.error('Share error:', err);
      alert(t('common.error'));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    router.push(`/${currentLocale}/analysis/detail/${analysisId}`);
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
          <AlertDescription>
            {error || t('analysis.notFound')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <PresentationMode
        analysis={analysis}
        comparisonAnalysis={comparisonAnalysis || undefined}
        patientInfo={patientInfo}
        clinicInfo={{
          name: t('common.clinic.name'),
          logo: '/logo.png',
          brandColor: '#6366f1',
        }}
        locale={currentLocale as 'th' | 'en'}
        onExport={handleExportPDF}
        onShare={handleShare}
        onPrint={handlePrint}
        onClose={handleClose}
      />
    </div>
  );
}
