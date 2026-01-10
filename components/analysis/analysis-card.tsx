'use client';

/**
 * Analysis Parameter Card
 * VISIA-style analysis card for individual skin parameters
 */

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Sparkles,
  Droplets,
  Circle,
  Sun,
  Layout,
  Scan,
} from 'lucide-react';

export interface AnalysisCardProps {
  parameter: keyof typeof PARAMETER_CONFIG;
  severity: number;
  percentile: number;
  count?: number;
  trend?: 'improving' | 'stable' | 'worsening';
  locale?: string;
  className?: string;
}

const PARAMETER_CONFIG = {
  spots: {
    icon: Scan,
    color: 'text-red-500',
  },
  pores: {
    icon: Circle,
    color: 'text-gray-500',
  },
  wrinkles: {
    icon: Layout,
    color: 'text-orange-500',
  },
  texture: {
    icon: Sparkles,
    color: 'text-yellow-500',
  },
  redness: {
    icon: AlertCircle,
    color: 'text-rose-500',
  },
  uv_spots: {
    icon: Sun,
    color: 'text-purple-500',
  },
  brown_spots: {
    icon: Droplets,
    color: 'text-amber-700',
  },
  porphyrins: {
    icon: Droplets,
    color: 'text-blue-500',
  },
};

/**
 * Get severity level
 */
function getSeverityLevel(severity: number, t: any): {
  label: string;
  color: string;
} {
  if (severity <= 3) {
    return { label: t('excellent'), color: 'bg-green-500' };
  } else if (severity <= 5) {
    return { label: t('good'), color: 'bg-blue-500' };
  } else if (severity <= 7) {
    return { label: t('moderate'), color: 'bg-yellow-500' };
  } else {
    return { label: t('needsAttention'), color: 'bg-red-500' };
  }
}

/**
 * Get percentile description
 */
function getPercentileDescription(percentile: number, t: any): string {
  if (percentile <= 25) {
    return `${t('betterThan')} 75% ${t('ofUsers')}`;
  } else if (percentile <= 50) {
    return `${t('betterThan')} 50% ${t('ofUsers')}`;
  } else if (percentile <= 75) {
    return `${t('betterThan')} 25% ${t('ofUsers')}`;
  } else {
    return `${t('betterThan')} 0% ${t('ofUsers')}`;
  }
}

export function AnalysisCard({
  parameter,
  severity,
  percentile,
  count,
  trend,
  locale: _locale = 'en',
  className = '',
}: AnalysisCardProps) {
  const t = useTranslations('analysisCard');
  const config = PARAMETER_CONFIG[parameter];
  const severityLevel = getSeverityLevel(severity, t);
  const Icon = config.icon;
  const TrendIcon = trend === 'improving' ? TrendingDown : trend === 'worsening' ? TrendingUp : Minus;
  
  const trendLabel = trend === 'improving' ? t('improving') : trend === 'worsening' ? t('worsening') : t('stable');

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{t(`${parameter}.label`)}</h3>
            <p className="text-sm text-muted-foreground">{t(`${parameter}.description`)}</p>
          </div>
        </div>

        {/* Trend Badge */}
        {trend && (
          <Badge
            variant={
              trend === 'improving' ? 'default' : trend === 'worsening' ? 'destructive' : 'secondary'
            }
            className="gap-1"
          >
            <TrendIcon className="w-3 h-3" />
            {trendLabel}
          </Badge>
        )}
      </div>

      {/* Severity Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{t(`${parameter}.label`)}</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{severity}</span>
            <span className="text-muted-foreground">/10</span>
          </div>
        </div>
        <Progress value={(10 - severity) * 10} className="h-2" />
        <div className="flex items-center justify-between mt-2">
          <Badge className={severityLevel.color}>{severityLevel.label}</Badge>
          {count !== undefined && (
            <span className="text-sm text-muted-foreground">{count} {t('detected')}</span>
          )}
        </div>
      </div>

      {/* Percentile Ranking */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{t('percentile')}</span>
          <span className="text-lg font-semibold">{percentile}th</span>
        </div>
        <Progress value={100 - percentile} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {getPercentileDescription(percentile, t)}
        </p>
      </div>

      {/* Visual Indicator */}
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full ${
              i < severity
                ? severity <= 3
                  ? 'bg-green-500'
                  : severity <= 5
                  ? 'bg-blue-500'
                  : severity <= 7
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </Card>
  );
}

/**
 * Analysis Cards Grid
 */
export interface AnalysisCardsGridProps {
  analysis: {
    spots: { severity: number; count: number; percentile: number };
    pores: { severity: number; count: number; percentile: number };
    wrinkles: { severity: number; count: number; percentile: number };
    texture: { severity: number; percentile: number };
    redness: { severity: number; count: number; percentile: number };
  };
  previousAnalysis?: AnalysisCardsGridProps['analysis'];
  locale?: string;
  className?: string;
}

export function AnalysisCardsGrid({
  analysis,
  previousAnalysis,
  locale = 'en',
  className = '',
}: AnalysisCardsGridProps) {
  const getTrend = (
    current: number,
    previous?: number
  ): 'improving' | 'stable' | 'worsening' | undefined => {
    if (previous === undefined) return undefined;
    if (current < previous - 1) return 'improving';
    if (current > previous + 1) return 'worsening';
    return 'stable';
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      <AnalysisCard
        parameter="spots"
        severity={analysis.spots.severity}
        percentile={analysis.spots.percentile}
        count={analysis.spots.count}
        locale={locale}
        trend={getTrend(analysis.spots.severity, previousAnalysis?.spots.severity)}
      />
      <AnalysisCard
        parameter="pores"
        severity={analysis.pores.severity}
        percentile={analysis.pores.percentile}
        count={analysis.pores.count}
        locale={locale}
        trend={getTrend(analysis.pores.severity, previousAnalysis?.pores.severity)}
      />
      <AnalysisCard
        parameter="wrinkles"
        severity={analysis.wrinkles.severity}
        percentile={analysis.wrinkles.percentile}
        count={analysis.wrinkles.count}
        locale={locale}
        trend={getTrend(analysis.wrinkles.severity, previousAnalysis?.wrinkles.severity)}
      />
      <AnalysisCard
        parameter="texture"
        severity={analysis.texture.severity}
        percentile={analysis.texture.percentile}
        locale={locale}
        trend={getTrend(analysis.texture.severity, previousAnalysis?.texture.severity)}
      />
      <AnalysisCard
        parameter="redness"
        severity={analysis.redness.severity}
        percentile={analysis.redness.percentile}
        count={analysis.redness.count}
        locale={locale}
        trend={getTrend(analysis.redness.severity, previousAnalysis?.redness.severity)}
      />
    </div>
  );
}
