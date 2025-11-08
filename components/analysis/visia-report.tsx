'use client';

/**
 * VISIA-Style Analysis Report
 * Complete professional skin analysis report
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AnalysisCardsGrid } from './analysis-card';
import { Download, Printer, Share2, FileText } from 'lucide-react';
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

const REPORT_TRANSLATIONS = {
  en: {
    print: 'Print',
    pdf: 'PDF',
    share: 'Share',
    reportDate: 'Report Date',
    patient: 'Patient',
    age: 'Age',
    years: 'years',
    skinType: 'Skin Type',
    skinHealthScore: 'Skin Health Score',
    grade: 'Grade',
    confidence: 'Confidence',
    detailedAnalysis: 'Detailed Analysis',
    aiInsights: 'AI Insights',
    recommendations: 'Recommendations',
    skinConcerns: 'Detected Skin Concerns',
    overallCondition: 'Overall Skin Condition',
    summary: 'Summary'
  },
  th: {
    print: 'พิมพ์',
    pdf: 'PDF',
    share: 'แชร์',
    reportDate: 'วันที่รายงาน',
    patient: 'ผู้รับบริการ',
    age: 'อายุ',
    years: 'ปี',
    skinType: 'ประเภทผิว',
    skinHealthScore: 'คะแนนสุขภาพผิว',
    grade: 'เกรด',
    confidence: 'ความแม่นยำ',
    detailedAnalysis: 'วิเคราะห์เชิงลึก',
    aiInsights: 'การวิเคราะห์ AI',
    recommendations: 'คำแนะนำ',
    skinConcerns: 'ปัญหาผิวที่ตรวจพบ',
    overallCondition: 'สภาพผิวโดยรวม',
    summary: 'สรุป'
  }
};

export interface VISIAReportProps {
  analysis: HybridSkinAnalysis;
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    skinType?: string;
  };
  clinicInfo?: {
    name?: string;
    logo?: string;
    address?: string;
  };
  locale?: string;
  onExport?: (format: 'pdf' | 'png') => void;
  onPrint?: () => void;
  onShare?: () => void;
  className?: string;
}

export function VISIAReport({
  analysis,
  patientInfo,
  clinicInfo,
  locale = 'en',
  onExport,
  onPrint,
  onShare,
  className = '',
}: VISIAReportProps) {
  const t = REPORT_TRANSLATIONS[locale as keyof typeof REPORT_TRANSLATIONS] || REPORT_TRANSLATIONS.en;
  const reportDate = new Date(analysis.timestamp);

  // Calculate overall health score with fallback
  const overallScore = analysis.overallScore || {
    spots: 0,
    pores: 0,
    wrinkles: 0,
    texture: 0,
    redness: 0,
    pigmentation: 0
  };
  
  // Calculate average severity (lower is better in VISIA scale)
  const averageSeverity = 
    ((overallScore.spots || 0) +
     (overallScore.pores || 0) +
     (overallScore.wrinkles || 0) +
     (overallScore.texture || 0) +
     (overallScore.redness || 0) +
     (overallScore.pigmentation || 0)) / 6;
  
  // Convert to health score (100 - average = higher is better)
  const healthScore = Math.round(Math.max(0, Math.min(100, (10 - averageSeverity) * 10))) || 0;
  
  const healthGrade =
    healthScore >= 90
      ? 'A+'
      : healthScore >= 80
      ? 'A'
      : healthScore >= 70
      ? 'B'
      : healthScore >= 60
      ? 'C'
      : 'D';

  return (
    <div className={`space-y-6 ${className}`} id="visia-report">
      {/* Header */}
      <Card className="p-6 print:shadow-none">
        <div className="flex items-start justify-between">
          {/* Clinic Info */}
          <div className="flex items-center gap-4">
            {clinicInfo?.logo && (
              <img src={clinicInfo.logo} alt="Clinic Logo" className="h-16 w-auto" />
            )}
            <div>
              {clinicInfo?.name && (
                <h1 className="text-2xl font-bold">{clinicInfo.name}</h1>
              )}
              {clinicInfo?.address && (
                <p className="text-sm text-muted-foreground">{clinicInfo.address}</p>
              )}
            </div>
          </div>

          {/* Actions (hidden in print) */}
          <div className="flex gap-2 print:hidden">
            <Button onClick={onPrint} variant="outline" size="sm" className="gap-2">
              <Printer className="w-4 h-4" />
              {t.print}
            </Button>
            <Button
              onClick={() => onExport?.('pdf')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {t.pdf}
            </Button>
            <Button onClick={onShare} variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              {t.share}
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Report Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t.reportDate}</p>
            <p className="font-medium">{reportDate.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t.patient}</p>
            <p className="font-medium">{patientInfo?.name || (locale === 'th' ? 'ผู้รับบริการ' : 'Patient')}</p>
          </div>
          {patientInfo?.age && (
            <div>
              <p className="text-sm text-muted-foreground">{t.age}</p>
              <p className="font-medium">{patientInfo.age} {t.years}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">{t.skinType}</p>
            <p className="font-medium capitalize">{patientInfo?.skinType || analysis.ai?.skinType || 'Normal'}</p>
          </div>
        </div>
      </Card>

      {/* Overall Score */}
      <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10 print:shadow-none">
        <div className="inline-block">
          <div className="text-6xl font-bold text-primary mb-2">{healthScore}</div>
          <div className="text-2xl font-semibold mb-2">{t.skinHealthScore}</div>
          <Badge className="text-lg px-4 py-1">{t.grade}: {healthGrade}</Badge>
          <p className="text-sm text-muted-foreground mt-4">
            {t.confidence}: {(() => {
              const conf = analysis.confidence || 0;
              // Normalize: if value > 1, it's already in percentage (0-100)
              // if value <= 1, it's decimal (0-1) and needs *100
              return conf > 1 ? Math.round(conf) : Math.round(conf * 100);
            })()}%
          </p>
        </div>
      </Card>

      {/* Analysis Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          {t.detailedAnalysis}
        </h2>
        <AnalysisCardsGrid
          analysis={{
            spots: {
              severity: analysis.cv.spots.severity,
              count: analysis.cv.spots.count,
              percentile: analysis.percentiles.spots,
            },
            pores: {
              severity: analysis.cv.pores.severity,
              count: analysis.cv.pores.enlargedCount,
              percentile: analysis.percentiles.pores,
            },
            wrinkles: {
              severity: analysis.cv.wrinkles.severity,
              count: analysis.cv.wrinkles.count,
              percentile: analysis.percentiles.wrinkles,
            },
            texture: {
              severity: analysis.cv.texture.score,
              percentile: analysis.percentiles.texture,
            },
            redness: {
              severity: analysis.cv.redness.severity,
              count: analysis.cv.redness.areas.length,
              percentile: analysis.percentiles.redness,
            },
          }}
          locale={locale}
        />
      </div>

      {/* AI Insights */}
      {analysis.ai && (
        <Card className="p-6 print:shadow-none">
          <h3 className="text-xl font-semibold mb-4">{t.aiInsights}</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">{t.skinType}</p>
              <Badge variant="outline" className="text-base">
                {analysis.ai.skinType}
              </Badge>
            </div>

            {analysis.ai.concerns && analysis.ai.concerns.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t.skinConcerns}
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.ai.concerns.map((concern: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {concern.type || concern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t.overallCondition}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(analysis.ai.severity).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm capitalize">{key}</span>
                    <span className="font-semibold">{value}/10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-6 print:shadow-none print:break-before-page">
        <h3 className="text-xl font-semibold mb-4">{t.recommendations}</h3>
        <div className="space-y-3">
          {(analysis.recommendations && analysis.recommendations.length > 0) ? (
            analysis.recommendations.map((recommendation: any, index: number) => {
              // Parse JSON string if needed
              let parsedRec = recommendation;
              if (typeof recommendation === 'string' && recommendation.startsWith('{')) {
                try {
                  parsedRec = JSON.parse(recommendation);
                } catch {
                  // If parsing fails, treat as plain text
                  parsedRec = { reason: recommendation };
                }
              }
              
              const category = parsedRec.category || '';
              const product = parsedRec.product || '';
              const reason = parsedRec.reason || parsedRec.product || parsedRec;
              const uniqueKey = `rec-${index}-${category}-${Date.now()}`;
              
              return (
                <div key={uniqueKey} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    {category && (
                      <Badge variant="secondary" className="mb-2 capitalize">
                        {category}
                      </Badge>
                    )}
                    <p className="text-sm font-medium mb-1">{product}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{reason}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No recommendations available at this time.</p>
          )}
        </div>
      </Card>

      {/* Treatment Plan */}
      <Card className="p-6 print:shadow-none">
        <h3 className="text-xl font-semibold mb-4">Recommended Treatment Plan</h3>
        <div className="space-y-3">
          {(() => {
            // Generate treatment plan based on severity
            const treatments: Array<{
              id: string;
              name: string;
              description: string;
              duration: string;
              priority: 'high' | 'medium' | 'low';
            }> = [];
            const severity = analysis.ai?.severity || {};
            const cvData = analysis.cv || {};
            
            if (severity.acne >= 4) {
              treatments.push({
                id: 'acne-treatment',
                name: 'Acne Treatment',
                description: 'Professional acne treatment with laser or chemical peels',
                duration: '4-6 weeks',
                priority: 'high'
              });
            }
            
            const wrinklesSeverity = typeof cvData.wrinkles?.severity === 'number' 
              ? cvData.wrinkles.severity 
              : 0;
            if (severity.wrinkles >= 4 || wrinklesSeverity >= 4) {
              treatments.push({
                id: 'anti-aging-treatment',
                name: 'Anti-Aging Treatment',
                description: 'Botox, dermal fillers, or RF skin tightening',
                duration: '6-12 weeks',
                priority: 'medium'
              });
            }
            
            const spotsSeverity = typeof cvData.spots?.severity === 'number'
              ? cvData.spots.severity
              : 0;
            if (severity.dark_spots >= 4 || spotsSeverity >= 4) {
              treatments.push({
                id: 'pigmentation-treatment',
                name: 'Pigmentation Treatment',
                description: 'Laser treatment or intense chemical peels for dark spots',
                duration: '8-12 weeks',
                priority: 'high'
              });
            }
            
            const rednessSeverity = typeof cvData.redness?.severity === 'number'
              ? cvData.redness.severity
              : 0;
            if (severity.redness >= 4 || rednessSeverity >= 4) {
              treatments.push({
                id: 'redness-reduction',
                name: 'Redness Reduction',
                description: 'IPL therapy or gentle laser treatment',
                duration: '6-8 weeks',
                priority: 'medium'
              });
            }
            
            const poresSeverity = typeof cvData.pores?.severity === 'number'
              ? cvData.pores.severity
              : 0;
            if (poresSeverity >= 4) {
              treatments.push({
                id: 'pore-refinement',
                name: 'Pore Refinement',
                description: 'Microneedling or fractional laser for pore size reduction',
                duration: '4-8 weeks',
                priority: 'low'
              });
            }
            
            // Default general care
            if (treatments.length === 0) {
              treatments.push({
                id: 'preventive-skincare',
                name: 'Preventive Skincare',
                description: 'Maintain healthy skin with regular facials and proper skincare routine',
                duration: 'Ongoing',
                priority: 'low'
              });
            }
            
            return treatments.length > 0 ? (
              treatments.map((treatment, idx) => {
                const getBadgeVariant = (priority: 'high' | 'medium' | 'low') => {
                  if (priority === 'high') return 'destructive';
                  if (priority === 'medium') return 'default';
                  return 'secondary';
                };
                
                const getBadgeLabel = (priority: 'high' | 'medium' | 'low') => {
                  if (priority === 'high') return '⚡ Priority';
                  if (priority === 'medium') return '📌 Recommended';
                  return '✨ Optional';
                };
                
                return (
                  <div key={treatment.id} className="flex gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-base">{treatment.name}</p>
                        <Badge variant={getBadgeVariant(treatment.priority)} className="text-xs">
                          {getBadgeLabel(treatment.priority)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{treatment.description}</p>
                      <p className="text-xs text-muted-foreground">
                        ⏱️ Estimated duration: <span className="font-medium">{treatment.duration}</span>
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No treatment plan available</p>
            );
          })()}
        </div>
      </Card>

      {/* Technical Details */}
      <Card className="p-6 print:shadow-none bg-muted/50">
        <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Analysis Method</p>
            <p className="font-medium">Hybrid AI + CV</p>
          </div>
          <div>
            <p className="text-muted-foreground">AI Confidence</p>
            <p className="font-medium">{(() => {
              const conf = analysis.ai.confidence || 0;
              return conf > 1 ? Math.round(conf) : Math.round(conf * 100);
            })()}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Overall Percentile</p>
            <p className="font-medium">{Math.round((analysis.percentiles.spots + analysis.percentiles.pores + analysis.percentiles.wrinkles + analysis.percentiles.texture + analysis.percentiles.redness) / 5)}th</p>
          </div>
          <div>
            <p className="text-muted-foreground">Spots Detected</p>
            <p className="font-medium">{analysis.cv.spots.count}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pores Analyzed</p>
            <p className="font-medium">{analysis.cv.pores.enlargedCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Wrinkles Detected</p>
            <p className="font-medium">{analysis.cv.wrinkles.count}</p>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground print:mt-8">
        <p>
          This report was generated using AI-powered skin analysis technology.
          <br />
          Results should be reviewed by a qualified skincare professional.
        </p>
        <p className="mt-2">
          Report ID: {analysis.timestamp.getTime()} | Generated on{' '}
          {reportDate.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
