'use client';

/**
 * Priority Ranking Card Component
 * 
 * Displays AI-powered skin concern priority rankings with treatment recommendations
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  type PriorityRankingResult,
  type SkinConcernPriority,
  type PriorityLevel,
  getPriorityColor,
  getPriorityIcon,
  formatPriorityRankingForCustomer,
} from '@/lib/ai/priority-ranking';

// ============================================================================
// Translation Constants
// ============================================================================

const TRANSLATIONS = {
  en: {
    title: 'AI Priority Ranking',
    description: 'Automated analysis of your skin concerns ranked by urgency and treatment priority',
    overallCondition: 'Overall Condition',
    topPriorities: 'Top Priorities',
    quickWins: 'Quick Wins',
    treatmentPlan: 'Treatment Plan',
    allConcerns: 'All Concerns',
    priority: 'Priority',
    urgency: 'Urgency',
    severity: 'Severity',
    percentile: 'Percentile',
    parameter: 'Parameter',
    treatmentTime: 'Treatment Time',
    improvementPotential: 'Improvement Potential',
    weeks: 'weeks',
    reasons: 'Why This Priority',
    recommendations: 'Recommended Treatments',
    bookNow: 'Book Appointment',
    viewDetails: 'View Details',
    phase: 'Phase',
    concerns: 'concerns',
    estimatedDuration: 'Estimated Duration',
    immediate: 'Immediate',
    urgent: 'Urgent',
    moderate: 'Moderate',
    low: 'Low',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    minimal: 'Minimal',
    simple: 'Simple',
    complex: 'Complex',
    noQuickWins: 'No quick wins identified. Focus on top priorities first.',
    summary: 'Summary',
  },
  th: {
    title: 'การจัดอันดับความสำคัญด้วย AI',
    description: 'วิเคราะห์ปัญหาผิวอัตโนมัติ จัดเรียงตามความเร่งด่วนและลำดับการรักษา',
    overallCondition: 'สภาพผิวโดยรวม',
    topPriorities: 'ปัญหาสำคัญ',
    quickWins: 'แก้ไขง่าย ผลชัดเร็ว',
    treatmentPlan: 'แผนการรักษา',
    allConcerns: 'ปัญหาทั้งหมด',
    priority: 'ระดับความสำคัญ',
    urgency: 'ความเร่งด่วน',
    severity: 'ความรุนแรง',
    percentile: 'เปอร์เซ็นไทล์',
    parameter: 'พารามิเตอร์',
    treatmentTime: 'ระยะเวลารักษา',
    improvementPotential: 'โอกาสปรับปรุง',
    weeks: 'สัปดาห์',
    reasons: 'เหตุผลที่สำคัญ',
    recommendations: 'ทรีตเมนต์ที่แนะนำ',
    bookNow: 'จองคิว',
    viewDetails: 'ดูรายละเอียด',
    phase: 'ระยะที่',
    concerns: 'ปัญหา',
    estimatedDuration: 'ระยะเวลาโดยประมาณ',
    immediate: 'ฉุกเฉิน',
    urgent: 'เร่งด่วน',
    moderate: 'ปานกลาง',
    low: 'น้อย',
    critical: 'วิกฤต',
    high: 'สูง',
    medium: 'กลาง',
    minimal: 'น้อยมาก',
    simple: 'ง่าย',
    complex: 'ซับซ้อน',
    noQuickWins: 'ไม่พบปัญหาที่แก้ง่าย ควรให้ความสำคัญกับปัญหาหลักก่อน',
    summary: 'สรุป',
  },
};

// ============================================================================
// Component Props
// ============================================================================

interface PriorityRankingCardProps {
  rankingResult: PriorityRankingResult;
  locale?: 'th' | 'en';
  onBookAppointment?: () => void;
  onViewConcernDetails?: (concern: SkinConcernPriority) => void;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Priority Badge Component
 */
function PriorityBadge({
  priority,
  locale = 'th',
}: {
  priority: PriorityLevel;
  locale?: 'th' | 'en';
}) {
  const t = TRANSLATIONS[locale];
  const color = getPriorityColor(priority);
  const icon = getPriorityIcon(priority);

  const labels: Record<PriorityLevel, string> = {
    critical: t.critical,
    high: t.high,
    medium: t.medium,
    low: t.low,
    minimal: t.minimal,
  };

  return (
    <Badge
      style={{ backgroundColor: color }}
      className="text-white font-medium"
    >
      {icon} {labels[priority]}
    </Badge>
  );
}

/**
 * Concern Card Component
 */
function ConcernCard({
  concern,
  locale = 'th',
  onViewDetails,
  showFullDetails = false,
}: {
  concern: SkinConcernPriority;
  locale?: 'th' | 'en';
  onViewDetails?: () => void;
  showFullDetails?: boolean;
}) {
  const t = TRANSLATIONS[locale];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg capitalize">
              {concern.concern.replaceAll('_', ' ')}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {concern.parameter}
            </CardDescription>
          </div>
          <PriorityBadge priority={concern.priority} locale={locale} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{t.severity}</div>
            <div className="flex items-center gap-2">
              <Progress value={concern.severity * 10} className="h-2 flex-1" />
              <span className="text-sm font-medium">{concern.severity.toFixed(1)}/10</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{t.percentile}</div>
            <div className="flex items-center gap-2">
              <Progress value={concern.percentile} className="h-2 flex-1" />
              <span className="text-sm font-medium">{concern.percentile}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">{t.treatmentTime}</div>
              <div className="text-sm font-medium">
                {concern.estimatedTreatmentWeeks} {t.weeks}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">{t.improvementPotential}</div>
              <div className="text-sm font-medium">{concern.improvementPotential}%</div>
            </div>
          </div>
        </div>

        {/* Urgency Badge */}
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            {t.urgency}: <strong>{t[concern.urgency as keyof typeof t] as string}</strong>
          </span>
        </div>

        {showFullDetails && (
          <>
            {/* Reasons */}
            {concern.reasons.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {t.reasons}
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {concern.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {concern.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {t.recommendations}
                </h4>
                <ul className="space-y-1 text-sm">
                  {concern.recommendations.map((rec) => (
                    <li key={rec} className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* View Details Button */}
        {!showFullDetails && onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onViewDetails}
          >
            {t.viewDetails}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function PriorityRankingCard({
  rankingResult,
  locale = 'th',
  onBookAppointment,
  onViewConcernDetails,
}: PriorityRankingCardProps) {
  const t = TRANSLATIONS[locale];

  // Format summary for display
  const formatted = formatPriorityRankingForCustomer(rankingResult, locale);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t.title}
            </CardTitle>
            <CardDescription className="mt-2">{t.description}</CardDescription>
          </div>
          {onBookAppointment && (
            <Button onClick={onBookAppointment} size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              {t.bookNow}
            </Button>
          )}
        </div>

        {/* Overall Condition Alert */}
        <Alert
          className="mt-4"
          variant={
            rankingResult.overallSeverity === 'critical' ||
            rankingResult.overallSeverity === 'high'
              ? 'destructive'
              : 'default'
          }
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t.overallCondition}</AlertTitle>
          <AlertDescription>{formatted.summary}</AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="top" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="top">
              {t.topPriorities}
              <Badge variant="secondary" className="ml-2">
                {rankingResult.topPriorities.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="quick">
              <Zap className="h-4 w-4 mr-1" />
              {t.quickWins}
            </TabsTrigger>
            <TabsTrigger value="plan">
              <Target className="h-4 w-4 mr-1" />
              {t.treatmentPlan}
            </TabsTrigger>
            <TabsTrigger value="all">
              {t.allConcerns}
              <Badge variant="secondary" className="ml-2">
                {rankingResult.ranked.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Top Priorities Tab */}
          <TabsContent value="top" className="space-y-4 mt-4">
            {rankingResult.topPriorities.map((concern) => (
              <ConcernCard
                key={`${concern.concern}-${concern.parameter}-top`}
                concern={concern}
                locale={locale}
                onViewDetails={
                  onViewConcernDetails
                    ? () => onViewConcernDetails(concern)
                    : undefined
                }
                showFullDetails={true}
              />
            ))}
          </TabsContent>

          {/* Quick Wins Tab */}
          <TabsContent value="quick" className="space-y-4 mt-4">
            {rankingResult.quickWins.length > 0 ? (
              <>
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertTitle>{t.quickWins}</AlertTitle>
                  <AlertDescription>
                    {locale === 'th'
                      ? 'ปัญหาเหล่านี้สามารถแก้ไขได้ง่ายและให้ผลลัพธ์ที่เห็นได้ชัดภายในเวลาอันสั้น'
                      : 'These concerns can be easily improved with visible results in a short time'}
                  </AlertDescription>
                </Alert>
                {rankingResult.quickWins.map((concern) => (
                  <ConcernCard
                    key={`${concern.concern}-${concern.parameter}-quick`}
                    concern={concern}
                    locale={locale}
                    onViewDetails={
                      onViewConcernDetails
                        ? () => onViewConcernDetails(concern)
                        : undefined
                    }
                    showFullDetails={true}
                  />
                ))}
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t.noQuickWins}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Treatment Plan Tab */}
          <TabsContent value="plan" className="space-y-4 mt-4">
            {rankingResult.treatmentPhases.map((phase) => (
              <Card key={phase.phase}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t.phase} {phase.phase}
                  </CardTitle>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {phase.concerns.length} {t.concerns}
                    </span>
                    <span className="font-medium">
                      {t.estimatedDuration}: {phase.estimatedWeeks} {t.weeks}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {phase.concerns.map((concern) => (
                      <div
                        key={`${concern.concern}-${concern.parameter}-phase${phase.phase}`}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <span className="capitalize text-sm">
                          {concern.concern.replaceAll('_', ' ')}
                        </span>
                        <PriorityBadge priority={concern.priority} locale={locale} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* All Concerns Tab */}
          <TabsContent value="all" className="space-y-4 mt-4">
            {rankingResult.ranked.map((concern) => (
              <ConcernCard
                key={`${concern.concern}-${concern.parameter}`}
                concern={concern}
                locale={locale}
                onViewDetails={
                  onViewConcernDetails
                    ? () => onViewConcernDetails(concern)
                    : undefined
                }
                showFullDetails={false}
              />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Export Component and Types
// ============================================================================

export { PriorityBadge, ConcernCard };
export type { PriorityRankingCardProps };
