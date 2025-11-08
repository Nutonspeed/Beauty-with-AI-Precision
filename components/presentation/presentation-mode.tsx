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
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    skinType?: string;
  };
  clinicInfo?: {
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

const TRANSLATIONS = {
  en: {
    presentationMode: 'Presentation Mode',
    exitFullscreen: 'Exit Fullscreen',
    enterFullscreen: 'Enter Fullscreen',
    overview: 'Overview',
    comparison: 'Comparison',
    treatments: 'Treatments',
    pricing: 'Pricing',
    timeline: 'Timeline',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    exportPDF: 'Export PDF',
    share: 'Share',
    print: 'Print',
    skinHealthScore: 'Skin Health Score',
    concerns: 'Skin Concerns',
    recommendations: 'Recommendations',
    expectedResults: 'Expected Results',
    treatmentPlan: 'Treatment Plan',
    estimatedCost: 'Estimated Cost',
    duration: 'Duration',
    sessions: 'Sessions',
    improvement: 'Improvement',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    spots: 'Spots',
    pores: 'Pores',
    wrinkles: 'Wrinkles',
    texture: 'Texture',
    redness: 'Redness',
    overall: 'Overall',
    weeks: 'weeks',
    months: 'months',
    baht: 'THB',
    perSession: 'per session',
    total: 'Total',
    recommended: 'Recommended',
    package: 'Package',
    save: 'Save',
    popular: 'Popular',
    best: 'Best Value',
    comprehensive: 'Comprehensive',
    sideBySide: 'Side by Side Comparison',
    before: 'Before',
    after: 'After',
    current: 'Current',
    baseline: 'Baseline',
    progress: 'Progress',
  },
  th: {
    presentationMode: 'โหมดนำเสนอ',
    exitFullscreen: 'ออกจากเต็มหน้าจอ',
    enterFullscreen: 'เต็มหน้าจอ',
    overview: 'ภาพรวม',
    comparison: 'เปรียบเทียบ',
    treatments: 'การรักษา',
    pricing: 'ราคา',
    timeline: 'ระยะเวลา',
    close: 'ปิด',
    previous: 'ก่อนหน้า',
    next: 'ถัดไป',
    exportPDF: 'ส่งออก PDF',
    share: 'แชร์',
    print: 'พิมพ์',
    skinHealthScore: 'คะแนนสุขภาพผิว',
    concerns: 'ปัญหาผิว',
    recommendations: 'คำแนะนำ',
    expectedResults: 'ผลลัพธ์ที่คาดหวัง',
    treatmentPlan: 'แผนการรักษา',
    estimatedCost: 'ค่าใช้จ่ายโดยประมาณ',
    duration: 'ระยะเวลา',
    sessions: 'ครั้ง',
    improvement: 'การปรับปรุง',
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ',
    spots: 'จุดด่างดำ',
    pores: 'รูขุมขน',
    wrinkles: 'ริ้วรอย',
    texture: 'เนื้อผิว',
    redness: 'รอยแดง',
    overall: 'โดยรวม',
    weeks: 'สัปดาห์',
    months: 'เดือน',
    baht: '฿',
    perSession: 'ต่อครั้ง',
    total: 'รวม',
    recommended: 'แนะนำ',
    package: 'แพ็คเกจ',
    save: 'ประหยัด',
    popular: 'ยอดนิยม',
    best: 'คุ้มค่าที่สุด',
    comprehensive: 'ครบวงจร',
    sideBySide: 'เปรียบเทียบแบบเคียงข้าง',
    before: 'ก่อน',
    after: 'หลัง',
    current: 'ปัจจุบัน',
    baseline: 'พื้นฐาน',
    progress: 'ความคืบหน้า',
  },
};

// Treatment packages data
const TREATMENT_PACKAGES = [
  {
    id: 'basic',
    name: { en: 'Basic Care', th: 'ดูแลพื้นฐาน' },
    badge: { en: 'Popular', th: 'ยอดนิยม' },
    badgeColor: 'bg-blue-500',
    treatments: [
      { name: { en: 'Facial Cleansing', th: 'ทำความสะอาดผิวหน้า' }, sessions: 4 },
      { name: { en: 'Vitamin C Serum', th: 'เซรั่มวิตามินซี' }, sessions: 8 },
      { name: { en: 'Moisturizing Treatment', th: 'บำรุงความชุ่มชื้น' }, sessions: 4 },
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
    name: { en: 'Advanced Treatment', th: 'การรักษาขั้นสูง' },
    badge: { en: 'Best Value', th: 'คุ้มค่าที่สุด' },
    badgeColor: 'bg-green-500',
    treatments: [
      { name: { en: 'Laser Therapy', th: 'เลเซอร์บำบัด' }, sessions: 6 },
      { name: { en: 'Chemical Peel', th: 'ผลัดเซลล์ผิว' }, sessions: 4 },
      { name: { en: 'Hydrafacial', th: 'ไฮดร้าเฟเชียล' }, sessions: 6 },
      { name: { en: 'LED Light Therapy', th: 'บำบัดด้วยแสง LED' }, sessions: 8 },
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
    name: { en: 'Premium Package', th: 'แพ็คเกจพรีเมียม' },
    badge: { en: 'Comprehensive', th: 'ครบวงจร' },
    badgeColor: 'bg-purple-500',
    treatments: [
      { name: { en: 'Fraxel Laser', th: 'เลเซอร์ Fraxel' }, sessions: 4 },
      { name: { en: 'Botox Treatment', th: 'โบท็อกซ์' }, sessions: 2 },
      { name: { en: 'Dermal Fillers', th: 'ฟิลเลอร์' }, sessions: 2 },
      { name: { en: 'PRP Therapy', th: 'PRP บำบัด' }, sessions: 4 },
      { name: { en: 'Microneedling', th: 'ไมโครนีดเดิ้ล' }, sessions: 6 },
      { name: { en: 'Home Care Kit', th: 'ชุดดูแลที่บ้าน' }, sessions: 1 },
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
  patientInfo,
  clinicInfo,
  locale = 'en',
  onExport,
  onShare,
  onPrint,
  onClose,
}: PresentationModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');
  const t = TRANSLATIONS[locale];

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
    if (score >= 7) return { level: t.high, color: 'text-red-500' };
    if (score >= 4) return { level: t.medium, color: 'text-yellow-500' };
    return { level: t.low, color: 'text-green-500' };
  };

  const renderClinicBranding = () => (
    <div className="flex items-center gap-3">
      {clinicInfo?.logo && (
        <div className="relative w-12 h-12">
          <Image src={clinicInfo.logo} alt={clinicInfo.name} fill className="object-contain" />
        </div>
      )}
      <div>
        <h3 className="font-bold text-lg" style={{ color: clinicInfo?.brandColor }}>
          {clinicInfo?.name || 'AI367 Skin Clinic'}
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
          {renderClinicBranding()}
          <Badge variant="secondary" className="ml-4">
            {t.presentationMode}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              {t.exportPDF}
            </Button>
          )}
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              {t.share}
            </Button>
          )}
          {onPrint && (
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="w-4 h-4 mr-2" />
              {t.print}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 mr-2" />
                {t.exitFullscreen}
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" />
                {t.enterFullscreen}
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

      {/* Patient Info Bar */}
      {patientInfo && (
        <div
          className={`border-b ${
            isFullscreen ? 'px-8 py-3' : 'px-4 py-2'
          } bg-muted/30 flex items-center gap-6 text-sm`}
        >
          {patientInfo.name && (
            <div>
              <span className="text-muted-foreground">{locale === 'th' ? 'ชื่อ' : 'Name'}:</span>{' '}
              <span className="font-medium">{patientInfo.name}</span>
            </div>
          )}
          {patientInfo.age && (
            <div>
              <span className="text-muted-foreground">{locale === 'th' ? 'อายุ' : 'Age'}:</span>{' '}
              <span className="font-medium">
                {patientInfo.age} {locale === 'th' ? 'ปี' : 'years'}
              </span>
            </div>
          )}
          {patientInfo.skinType && (
            <div>
              <span className="text-muted-foreground">
                {locale === 'th' ? 'ประเภทผิว' : 'Skin Type'}:
              </span>{' '}
              <span className="font-medium capitalize">{patientInfo.skinType}</span>
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
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="comparison">{t.comparison}</TabsTrigger>
            <TabsTrigger value="treatments">{t.treatments}</TabsTrigger>
            <TabsTrigger value="pricing">{t.pricing}</TabsTrigger>
            <TabsTrigger value="timeline">{t.timeline}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Overall Score Card */}
              <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t.skinHealthScore}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">
                      {analysis.percentiles.overall}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {locale === 'th' ? 'จาก 100 คะแนน' : 'out of 100'}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">
                        {locale === 'th' ? 'ความมั่นใจ' : 'Confidence'}
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
                    {t.concerns}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analysis.overallScore).map(([key, value]) => {
                    const { level, color } = getConcernLevel(value);
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="capitalize">{t[key as keyof typeof t] || key}</span>
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
                  <CardTitle>{locale === 'th' ? 'ภาพถ่ายผิว' : 'Skin Photos'}</CardTitle>
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
                    <CardTitle>{t.sideBySide}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BeforeAfterSlider
                      beforeImage={comparisonAnalysis.imageUrl}
                      afterImage={analysis.imageUrl}
                      title={locale === 'th' ? 'เปรียบเทียบผลลัพธ์' : 'Results Comparison'}
                      description={
                        locale === 'th'
                          ? 'ลากแถบเพื่อเปรียบเทียบผล'
                          : 'Drag to compare results'
                      }
                    />
                  </CardContent>
                </Card>

                {/* Score Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t.progress}</CardTitle>
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
                              {t[key as keyof typeof t] || key}
                            </div>
                            <div className="flex items-end gap-4">
                              <div>
                                <div className="text-xs text-muted-foreground">{t.before}</div>
                                <div className="text-2xl font-bold">{previousValue.toFixed(1)}</div>
                              </div>
                              <div className="text-2xl text-muted-foreground">→</div>
                              <div>
                                <div className="text-xs text-muted-foreground">{t.current}</div>
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
                  {locale === 'th'
                    ? 'ไม่มีข้อมูลเปรียบเทียบ กรุณาทำการวิเคราะห์อีกครั้งเพื่อดูความคืบหน้า'
                    : 'No comparison data available. Perform another analysis to see progress.'}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Treatments Tab */}
          <TabsContent value="treatments" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {TREATMENT_PACKAGES.map((pkg) => (
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
                      {locale === 'th' ? '฿' : 'THB '}
                      {pkg.price.toLocaleString()}
                    </div>
                    {pkg.discount && (
                      <div className="text-sm text-muted-foreground line-through">
                        {locale === 'th' ? '฿' : 'THB '}
                        {pkg.originalPrice?.toLocaleString()}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {pkg.treatments.map((treatment, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{treatment.name[locale]}</span>
                          <span className="text-muted-foreground">
                            {treatment.sessions} {t.sessions}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {t.duration}
                        </span>
                        <span className="font-medium">
                          {pkg.duration.weeks} {t.weeks}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          {t.improvement}
                        </span>
                        <span className="font-medium text-green-600">+{pkg.improvement}%</span>
                      </div>
                      {pkg.discount && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            {t.save}
                          </span>
                          <span className="font-medium text-green-600">
                            {pkg.discount}% ({locale === 'th' ? '฿' : 'THB '}
                            {(pkg.originalPrice! - pkg.price).toLocaleString()})
                          </span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full">{t.recommended}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.estimatedCost}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {TREATMENT_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-4 rounded-lg border bg-gradient-to-r from-muted/30 to-muted/10 hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-lg">{pkg.name[locale]}</div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.sessions} {t.sessions} • {pkg.duration.weeks} {t.weeks}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {locale === 'th' ? '฿' : 'THB '}
                            {pkg.price.toLocaleString()}
                          </div>
                          {pkg.discount && (
                            <Badge variant="default" className="bg-green-500 mt-1">
                              {t.save} {pkg.discount}%
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 text-sm">
                        {Object.entries(pkg.effectiveness).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-xs text-muted-foreground mb-1 capitalize">
                              {t[key as keyof typeof t] || key}
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
                <CardTitle>{t.treatmentPlan}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {TREATMENT_PACKAGES.map((pkg, pkgIdx) => (
                    <div key={pkg.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {pkgIdx + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{pkg.name[locale]}</div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.duration.months} {t.months} {t.timeline}
                          </div>
                        </div>
                      </div>

                      <div className="ml-11 space-y-3">
                        {pkg.treatments.map((treatment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                          >
                            <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{treatment.name[locale]}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {treatment.sessions} {t.sessions}
                            </div>
                          </div>
                        ))}

                        <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {t.expectedResults}
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              +{pkg.improvement}% {t.improvement}
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
            const tabs = ['overview', 'comparison', 'treatments', 'pricing', 'timeline'];
            const currentIndex = tabs.indexOf(currentTab);
            if (currentIndex > 0) {
              setCurrentTab(tabs[currentIndex - 1]);
            }
          }}
          disabled={currentTab === 'overview'}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t.previous}
        </Button>

        <div className="text-sm text-muted-foreground">
          {locale === 'th'
            ? 'ใช้ลูกศรซ้าย/ขวา เพื่อนำทาง'
            : 'Use arrow keys to navigate'}
        </div>

        <Button
          variant="outline"
          onClick={() => {
            const tabs = ['overview', 'comparison', 'treatments', 'pricing', 'timeline'];
            const currentIndex = tabs.indexOf(currentTab);
            if (currentIndex < tabs.length - 1) {
              setCurrentTab(tabs[currentIndex + 1]);
            }
          }}
          disabled={currentTab === 'timeline'}
        >
          {t.next}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
