/**
 * Enhanced Metrics Display Component
 * แสดงผลลัพธ์จาก Enhanced AI Analysis อย่างสวยงามและครบถ้วน
 */

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { EnhancedMetricsResult } from '@/lib/ai/enhanced-skin-metrics'

interface EnhancedMetricsDisplayProps {
  metrics: EnhancedMetricsResult
  showDetailed?: boolean
}

export function EnhancedMetricsDisplay({ metrics, showDetailed = false }: EnhancedMetricsDisplayProps) {
  const t = useTranslations('enhanced_metrics')
  
  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade: string): string => {
    if (grade === 'A') return 'bg-green-100 text-green-800'
    if (grade === 'B') return 'bg-blue-100 text-blue-800'
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800'
    if (grade === 'D') return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">{t('overallHealth.title')}</h3>
          <Badge className={getGradeColor(metrics.overallHealth.grade)}>
            {t('overallHealth.grade')} {metrics.overallHealth.grade}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold">{metrics.overallHealth.score} {t('overallHealth.score')}</span>
            <span className="text-sm text-gray-500">
              {t('overallHealth.confidence')}: {(metrics.overallHealth.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <Progress value={metrics.overallHealth.score} className="h-3" />
        </div>
      </Card>

      {/* Skin Age */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">{t('skinAge.title')}</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>{t('skinAge.estimated')}:</span>
            <span className="font-bold text-xl">{metrics.skinAge.estimated} {t('skinAge.years')}</span>
          </div>
          {metrics.skinAge.chronological && (
            <>
              <div className="flex justify-between">
                <span>{t('skinAge.chronological')}:</span>
                <span className="font-semibold">{metrics.skinAge.chronological} {t('skinAge.years')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('skinAge.difference')}:</span>
                <span className={metrics.skinAge.difference > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                  {metrics.skinAge.difference > 0 ? '+' : ''}{metrics.skinAge.difference} {t('skinAge.years')}
                </span>
              </div>
            </>
          )}
          <div className="text-sm text-gray-500 mt-2">
            {t('overallHealth.confidence')}: {(metrics.skinAge.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </Card>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spots */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">{t('metrics.spots')}</h4>
            <Badge variant={metrics.spots.severity === 'low' ? 'default' : 'destructive'}>
              {metrics.spots.severity === 'low' ? t('severity.low') : metrics.spots.severity === 'medium' ? t('severity.medium') : t('severity.high')}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.spots.score)}`}>
            {metrics.spots.score} {t('overallHealth.score')}
          </div>
          <Progress value={metrics.spots.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>{t('details.count')}: {metrics.spots.count}</div>
              <div>{t('details.avgSize')}: {metrics.spots.averageSize.toFixed(1)} px</div>
              <div>{t('details.distribution')}: {
                metrics.spots.distribution === 'clustered' ? t('details.clustered') :
                metrics.spots.distribution === 'scattered' ? t('details.scattered') : t('details.uniform')
              }</div>
            </div>
          )}
        </Card>

        {/* Pores */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">{t('metrics.pores')}</h4>
            <Badge variant={metrics.pores.visibility === 'minimal' ? 'default' : 'secondary'}>
              {metrics.pores.visibility === 'minimal' ? t('severity.minimal') : metrics.pores.visibility === 'moderate' ? t('severity.moderate') : t('severity.visible')}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.pores.score)}`}>
            {metrics.pores.score} {t('overallHealth.score')}
          </div>
          <Progress value={metrics.pores.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>{t('details.count')}: {metrics.pores.count}</div>
              <div>{t('details.avgSize')}: {metrics.pores.averageSize.toFixed(1)} px</div>
            </div>
          )}
        </Card>

        {/* Wrinkles */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">{t('metrics.wrinkles')}</h4>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">{t('details.fine')}: {metrics.wrinkles.types.fine}</Badge>
              <Badge variant="outline" className="text-xs">{t('details.deep')}: {metrics.wrinkles.types.deep}</Badge>
            </div>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.wrinkles.score)}`}>
            {metrics.wrinkles.score} {t('overallHealth.score')}
          </div>
          <Progress value={metrics.wrinkles.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>{t('details.count')}: {metrics.wrinkles.count}</div>
              <div>{t('details.avgSize')}: {metrics.wrinkles.averageDepth.toFixed(2)}</div>
              <div>{t('details.areas.cheeks')}: {metrics.wrinkles.areas.map(a => 
                a === 'forehead' ? t('details.areas.forehead') :
                a === 'eyes' ? t('details.areas.eyes') :
                a === 'mouth' ? t('details.areas.mouth') : t('details.areas.cheeks')
              ).join(', ')}</div>
            </div>
          )}
        </Card>

        {/* Texture */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">{t('metrics.texture')}</h4>
            <Badge className={
              metrics.texture.quality === 'excellent' ? 'bg-green-100 text-green-800' :
              metrics.texture.quality === 'good' ? 'bg-blue-100 text-blue-800' :
              metrics.texture.quality === 'fair' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }>
              {metrics.texture.quality === 'excellent' ? t('details.quality.excellent') :
               metrics.texture.quality === 'good' ? t('details.quality.good') :
               metrics.texture.quality === 'fair' ? t('details.quality.fair') : t('details.quality.improve')}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.texture.score)}`}>
            {metrics.texture.score} {t('overallHealth.score')}
          </div>
          <Progress value={metrics.texture.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>{t('details.uniform')}: {(metrics.texture.smoothness * 100).toFixed(0)}%</div>
              <div>{t('details.avgSize')}: {(metrics.texture.roughness * 100).toFixed(0)}%</div>
            </div>
          )}
        </Card>

        {/* Redness */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">{t('metrics.redness')}</h4>
            <Badge variant={metrics.redness.pattern === 'localized' ? 'default' : 'destructive'}>
              {metrics.redness.pattern === 'localized' ? t('details.patterns.localized') :
               metrics.redness.pattern === 'diffuse' ? t('details.patterns.diffuse') : t('details.patterns.patchy')}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.redness.score)}`}>
            {metrics.redness.score} {t('overallHealth.score')}
          </div>
          <Progress value={metrics.redness.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>{t('overallHealth.confidence')}: {(metrics.redness.intensity * 100).toFixed(0)}%</div>
              <div>{t('details.distribution')}: {metrics.redness.coverage.toFixed(1)}%</div>
              {metrics.redness.causes.length > 0 && (
                <div>{t('details.causes.rosacea')}: {metrics.redness.causes.map(c =>
                  c === 'rosacea' ? t('details.causes.rosacea') :
                  c === 'inflammation' ? t('details.causes.inflammation') :
                  c === 'sun_damage' ? t('details.causes.sun_damage') : t('details.causes.sensitive')
                ).join(', ')}</div>
              )}
            </div>
          )}
        </Card>

        {/* Hydration */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">{t('metrics.hydration')}</h4>
            <Badge>
              {metrics.hydration.level === 'very_dry' ? t('details.hydrationLevels.very_dry') :
               metrics.hydration.level === 'dry' ? t('details.hydrationLevels.dry') :
               metrics.hydration.level === 'normal' ? t('details.hydrationLevels.normal') : t('details.hydrationLevels.oily')}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.hydration.score)}`}>
            {metrics.hydration.score} {t('overallHealth.score')}
          </div>
          <Progress value={metrics.hydration.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>{t('details.areas.tZone')}: {metrics.hydration.areas.tZone} {t('overallHealth.score')}</div>
              <div>{t('details.areas.cheeks')}: {metrics.hydration.areas.cheeks} {t('overallHealth.score')}</div>
            </div>
          )}
        </Card>

        {/* Skin Tone */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">{t('metrics.skinTone')}</h4>
            <Badge>
              {metrics.skinTone.undertone === 'cool' ? t('details.undertones.cool') :
               metrics.skinTone.undertone === 'warm' ? t('details.undertones.warm') : t('details.undertones.neutral')}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.skinTone.score)}`}>
            {metrics.skinTone.score} {t('overallHealth.score')}
          </div>
          <Progress value={metrics.skinTone.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>{t('details.uniform')}: {(metrics.skinTone.uniformity * 100).toFixed(0)}%</div>
              <div>Fitzpatrick Type: {metrics.skinTone.fitzpatrickType}</div>
            </div>
          )}
        </Card>

        {/* Elasticity */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">{t('metrics.elasticity')}</h4>
            <Badge variant="outline">
              {t('metrics.elasticity')}: {(metrics.elasticity.firmness * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.elasticity.score)}`}>
            {metrics.elasticity.score} {t('overallHealth.score')}
          </div>
          <Progress value={metrics.elasticity.score} className="mb-2" />
          {showDetailed && metrics.elasticity.areas.length > 0 && (
            <div className="text-sm text-gray-600">
              {t('details.areas.cheeks')}: {metrics.elasticity.areas.map(a =>
                a === 'jawline' ? t('details.areas.jawline') :
                a === 'cheeks' ? t('details.areas.cheeks') : t('details.areas.neck')
              ).join(', ')}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default EnhancedMetricsDisplay
