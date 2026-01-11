"use client";

/**
 * Sales Presentation Mode Component
 * Full-screen presentation for showcasing analysis to customers
 * Features: full-screen toggle, side-by-side comparison, treatment packages, pricing
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Printer,
  X,
  Eye,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
} from 'lucide-react';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import { BeforeAfterSlider } from '@/components/ar/before-after-slider';
import Image from 'next/image';

interface PresentationModeProps {
  analysis: HybridSkinAnalysis;
  comparisonAnalysis?: HybridSkinAnalysis;
  customerInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    skinType?: string;
  };
  centerInfo?: {
    name: string;
    logo?: string;
    brandColor?: string;
  };
  locale?: 'th' | 'en';
  onExport?: (format: 'pdf' | 'png') => void;
  onShare?: () => void;
  onPrint?: () => void;
  onClose?: () => void;
}

const PROGRAM_PACKAGES = [
  {
    id: 'basic',
    name: { en: 'Basic Care', th: 'ดูแลพื้นฐาน' },
    badge: { en: 'Popular', th: 'ยอดนิยม' },
    badgeColor: 'bg-blue-500',
    programs: [
      { name: { en: 'Aesthetic Cleansing', th: 'ทำความสะอาดผิวอัจฉริยะ' }, sessions: 4 },
      { name: { en: 'AI-Guided Serum', th: 'เซรั่มสูตร AI' }, sessions: 8 },
      { name: { en: 'Hydration Protocol', th: 'โปรโตคอลเติมความชุ่มชื้น' }, sessions: 4 },
    ],
    duration: { weeks: 8, months: 2 },
    price: 12000,
    perSession: 1500,
    sessions: 8,
    improvement: 25,
    effectiveness: { spots: 40, pores: 30, wrinkles: 20, texture: 50, redness: 35 },
  },
  {
    id: 'advanced',
    name: { en: 'Advanced Aesthetic', th: 'การดูแลขั้นสูง' },
    badge: { en: 'Best Value', th: 'คุ้มค่าที่สุด' },
    badgeColor: 'bg-green-500',
    programs: [
      { name: { en: 'Precision Laser', th: 'เลเซอร์ความแม่นยำสูง' }, sessions: 6 },
      { name: { en: 'Smart Skin Resurfacing', th: 'ผลัดเซลล์ผิวอัจฉริยะ' }, sessions: 4 },
      { name: { en: 'Acoustic Wave Therapy', th: 'คลื่นเสียงบำบัด' }, sessions: 6 },
      { name: { en: 'Bio-Light Therapy', th: 'บำบัดด้วยแสงชีวภาพ' }, sessions: 8 },
    ],
    duration: { weeks: 12, months: 3 },
    price: 35000,
    perSession: 2917,
    sessions: 12,
    improvement: 60,
    effectiveness: { spots: 75, pores: 65, wrinkles: 55, texture: 80, redness: 70 },
    discount: 15,
    originalPrice: 41200,
  },
  {
    id: 'premium',
    name: { en: 'Aesthetic Intelligence', th: 'โปรแกรมอัจฉริยะสูงสุด' },
    badge: { en: 'Comprehensive', th: 'ครบวงจร' },
    badgeColor: 'bg-purple-500',
    programs: [
      { name: { en: 'Neural Skin Repair', th: 'ซ่อมแซมผิวระดับเซลล์' }, sessions: 4 },
      { name: { en: 'Dynamic Muscle Modulation', th: 'ปรับกล้ามเนื้อใบหน้า' }, sessions: 2 },
      { name: { en: 'Volume Orchestration', th: 'ปรับรูปหน้าอัจฉริยะ' }, sessions: 2 },
      { name: { en: 'Regenerative Complex', th: 'รีเจนเนอเรทีฟคอมเพล็กซ์' }, sessions: 4 },
      { name: { en: 'Digital Micro-needling', th: 'ไมโครนีดเดิ้ลระบบดิจิทัล' }, sessions: 6 },
      { name: { en: 'AI Bio-Homecare Kit', th: 'ชุดดูแลต่อเนื่องที่บ้าน' }, sessions: 1 },
    ],
    duration: { weeks: 16, months: 4 },
    price: 85000,
    perSession: 4473,
    sessions: 19,
    improvement: 85,
    effectiveness: { spots: 90, pores: 85, wrinkles: 80, texture: 95, redness: 85 },
    discount: 20,
    originalPrice: 106250,
  },
];

export function PresentationMode({
  analysis,
  comparisonAnalysis,
  customerInfo,
  centerInfo,
  locale = 'en',
  onExport,
  onShare,
  onPrint,
  onClose,
}: PresentationModeProps) {
  const t = useTranslations();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
      if (e.key === 'ArrowRight') {
        // Navigate to next tab
        const tabs = ['overview', 'comparison', 'treatments', 'pricing', 'timeline'];
        const currentIndex = tabs.indexOf(currentTab);
        if (currentIndex < tabs.length - 1) {
          setCurrentTab(tabs[currentIndex + 1]);
        }
      }
      if (e.key === 'ArrowLeft') {
        // Navigate to previous tab
        const tabs = ['overview', 'comparison', 'treatments', 'pricing', 'timeline'];
        const currentIndex = tabs.indexOf(currentTab);
        if (currentIndex > 0) {
          setCurrentTab(tabs[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, currentTab, toggleFullscreen]);

  // Concern severity mapping
  const getConcernLevel = (score: number): { level: string; color: string } => {
    if (score >= 7) return { level: t('presentationMode.high'), color: 'text-red-500' };
    if (score >= 4) return { level: t('presentationMode.medium'), color: 'text-yellow-500' };
    return { level: t('presentationMode.low'), color: 'text-green-500' };
  };

  const renderCenterBranding = () => (
    <div className="flex items-center gap-3">
      {centerInfo?.logo && (
        <div className="relative w-12 h-12">
          <Image src={centerInfo.logo} alt={centerInfo.name} fill className="object-contain" />
        </div>
      )}
      <div>
        <h3 className="font-bold text-lg" style={{ color: centerInfo?.brandColor }}>
          {centerInfo?.name || 'Aesthetic Intelligence Hub'}
        </h3>
      </div>
    </div>
  );

  return (
    <div
      className={`${
        isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'relative'
      } flex flex-col h-full`}
    >
      {/* Header */}
      <div
        className={`border-b ${
          isFullscreen ? 'px-8 py-4' : 'px-4 py-3'
        } flex items-center justify-between bg-gradient-to-r from-primary/10 to-purple-500/10`}
      >
        <div className="flex items-center gap-4">
          {renderCenterBranding()}
          <Badge variant="secondary" className="ml-4">
            {t('presentationMode.title')}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              {t('presentationMode.exportPDF')}
            </Button>
          )}
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              {t('presentationMode.share')}
            </Button>
          )}
          {onPrint && (
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="w-4 h-4 mr-2" />
              {t('presentationMode.print')}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 mr-2" />
                {t('presentationMode.exitFullscreen')}
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" />
                {t('presentationMode.enterFullscreen')}
              </>
            )}
          </Button>
          {onClose && !isFullscreen && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Customer Info Bar */}
      {customerInfo && (
        <div
          className={`border-b ${
            isFullscreen ? 'px-8 py-3' : 'px-4 py-2'
          } bg-muted/30 flex items-center gap-6 text-sm`}
        >
          {customerInfo.name && (
            <div>
              <span className="text-muted-foreground">{t('common.name')}:</span>{' '}
              <span className="font-medium">{customerInfo.name}</span>
            </div>
          )}
          {customerInfo.age && (
            <div>
              <span className="text-muted-foreground">{t('customer.age')}:</span>{' '}
              <span className="font-medium">
                {customerInfo.age} {t('common.years')}
              </span>
            </div>
          )}
          {customerInfo.skinType && (
            <div>
              <span className="text-muted-foreground">
                {t('customer.skinType.label')}:
              </span>{' '}
              <span className="font-medium capitalize">{customerInfo.skinType}</span>
            </div>
          )}
          <div className="ml-auto text-muted-foreground">
            {new Date(analysis.createdAt).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 overflow-auto ${isFullscreen ? 'px-8 py-6' : 'p-4'}`}>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full">
          <TabsList className={`grid w-full ${isFullscreen ? 'max-w-3xl' : 'max-w-2xl'} mx-auto grid-cols-5 mb-6`}>
            <TabsTrigger value="overview">{t('presentationMode.overview')}</TabsTrigger>
            <TabsTrigger value="comparison">{t('presentationMode.comparison')}</TabsTrigger>
            <TabsTrigger value="programs">{t('presentationMode.programs')}</TabsTrigger>
            <TabsTrigger value="pricing">{t('presentationMode.pricing')}</TabsTrigger>
            <TabsTrigger value="timeline">{t('presentationMode.timeline')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Overall Score Card */}
              <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t('presentationMode.skinHealthScore')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">
                      {analysis.percentiles.overall}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('analysis.rawCount')}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">
                        {t('analysis.metrics.confidence')}
                      </div>
                      <div className="text-2xl font-semibold">
                        {Math.round(analysis.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skin Concerns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {t('presentationMode.concerns')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analysis.overallScore).map(([key, value]) => {
                    const { level, color } = getConcernLevel(value);
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="capitalize">{t(`common.${key}`)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-red-500"
                              style={{ width: `${(value / 10) * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${color} w-16`}>{level}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Photos */}
            {analysis.imageUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('analysis.inputAsset')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    <Image
                      src={analysis.imageUrl}
                      alt="Skin analysis"
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            {comparisonAnalysis ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('presentationMode.sideBySide')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BeforeAfterSlider
                      beforeImage={comparisonAnalysis.imageUrl}
                      afterImage={analysis.imageUrl}
                      title={t('presentationMode.comparison')}
                      description={t('presentationMode.progress')}
                    />
                  </CardContent>
                </Card>

                {/* Score Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('presentationMode.progress')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(analysis.overallScore).map(([key, currentValue]) => {
                        const previousValue =
                          comparisonAnalysis.overallScore[
                            key as keyof typeof comparisonAnalysis.overallScore
                          ];
                        const improvement = previousValue - currentValue; // Lower is better
                        const improvementPercent = Math.round(
                          (improvement / previousValue) * 100
                        );

                        return (
                          <div
                            key={key}
                            className="p-4 rounded-lg border bg-gradient-to-r from-muted/30 to-muted/10"
                          >
                            <div className="text-sm font-medium mb-2 capitalize">
                              {t(`common.${key}`)}
                            </div>
                            <div className="flex items-end gap-4">
                              <div>
                                <div className="text-xs text-muted-foreground">{t('presentationMode.before')}</div>
                                <div className="text-2xl font-bold">{previousValue.toFixed(1)}</div>
                              </div>
                              <div className="text-2xl text-muted-foreground">→</div>
                              <div>
                                <div className="text-xs text-muted-foreground">{t('presentationMode.current')}</div>
                                <div className="text-2xl font-bold text-primary">
                                  {currentValue.toFixed(1)}
                                </div>
                              </div>
                              {improvement > 0 && (
                                <div className="ml-auto">
                                  <Badge variant="default" className="bg-green-500">
                                    +{improvementPercent}%
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t('analysis.noData')}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {PROGRAM_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="relative overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {pkg.badge && (
                    <div
                      className={`absolute top-4 right-4 ${pkg.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold`}
                    >
                      {pkg.badge[locale]}
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{pkg.name[locale]}</CardTitle>
                    <div className="text-3xl font-bold text-primary">
                      {t('presentationMode.baht')}
                      {pkg.price.toLocaleString()}
                    </div>
                    {pkg.discount && (
                      <div className="text-sm text-muted-foreground line-through">
                        {t('presentationMode.baht')}
                        {pkg.originalPrice?.toLocaleString()}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {pkg.programs.map((program, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{program.name[locale]}</span>
                          <span className="text-muted-foreground">
                            {program.sessions} {t('presentationMode.sessions')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {t('presentationMode.duration')}
                        </span>
                        <span className="font-medium">
                          {pkg.duration.weeks} {t('presentationMode.weeks')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          {t('presentationMode.improvement')}
                        </span>
                        <span className="font-medium text-green-600">+{pkg.improvement}%</span>
                      </div>
                      {pkg.discount && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            {t('presentationMode.save')}
                          </span>
                          <span className="font-medium text-green-600">
                            {pkg.discount}% ({t('presentationMode.baht')}
                            {(pkg.originalPrice! - pkg.price).toLocaleString()})
                          </span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full">{t('presentationMode.recommended')}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('presentationMode.estimatedCost')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PROGRAM_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-4 rounded-lg border bg-gradient-to-r from-muted/30 to-muted/10 hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-lg">{pkg.name[locale]}</div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.sessions} {t('presentationMode.sessions')} • {pkg.duration.weeks} {t('presentationMode.weeks')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {t('presentationMode.baht')}
                            {pkg.price.toLocaleString()}
                          </div>
                          {pkg.discount && (
                            <Badge variant="default" className="bg-green-500 mt-1">
                              {t('presentationMode.save')} {pkg.discount}%
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 text-sm">
                        {Object.entries(pkg.effectiveness).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-xs text-muted-foreground mb-1 capitalize">
                              {t(`common.${key}`)}
                            </div>
                            <div className="font-semibold text-green-600">{value}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('presentationMode.programPlan')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {PROGRAM_PACKAGES.map((pkg, pkgIdx) => (
                    <div key={pkg.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {pkgIdx + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{pkg.name[locale]}</div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.duration.months} {t('presentationMode.months')} {t('presentationMode.timeline')}
                          </div>
                        </div>
                      </div>

                      <div className="ml-11 space-y-3">
                        {pkg.programs.map((program, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                          >
                            <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{program.name[locale]}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {program.sessions} {t('presentationMode.sessions')}
                            </div>
                          </div>
                        ))}

                        <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {t('presentationMode.expectedResults')}
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              +{pkg.improvement}% {t('presentationMode.improvement')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Navigation */}
      <div
        className={`border-t ${
          isFullscreen ? 'px-8 py-4' : 'px-4 py-3'
        } flex items-center justify-between bg-muted/30`}
      >
        <Button
          variant="outline"
          onClick={() => {
            const tabs = ['overview', 'comparison', 'programs', 'pricing', 'timeline'];
            const currentIndex = tabs.indexOf(currentTab);
            if (currentIndex > 0) {
              setCurrentTab(tabs[currentIndex - 1]);
            }
          }}
          disabled={currentTab === 'overview'}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('presentationMode.previous')}
        </Button>

        <div className="text-sm text-muted-foreground">
          {t('presentationMode.navigationHint')}
        </div>

        <Button
          variant="outline"
          onClick={() => {
            const tabs = ['overview', 'comparison', 'programs', 'pricing', 'timeline'];
            const currentIndex = tabs.indexOf(currentTab);
            if (currentIndex < tabs.length - 1) {
              setCurrentTab(tabs[currentIndex + 1]);
            }
          }}
          disabled={currentTab === 'timeline'}
        >
          {t('presentationMode.next')}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
