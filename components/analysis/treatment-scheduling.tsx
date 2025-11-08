/**
 * Treatment Scheduling Component
 * 
 * Displays AI-generated treatment schedule with timeline,
 * conflicts, recovery stages, and interactive scheduling.
 */

'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
} from 'lucide-react';
import type { SchedulingRecommendation, ScheduledTreatment, TreatmentConflict } from '@/lib/ai/treatment-scheduling';

// ============================================================================
// Types
// ============================================================================

interface TreatmentSchedulingComponentProps {
  readonly recommendations: SchedulingRecommendation;
  readonly locale: 'th' | 'en';
  readonly onScheduleConfirm?: (schedule: ScheduledTreatment[]) => void;
  readonly onReschedule?: (treatmentId: string) => void;
}

// ============================================================================
// Translations
// ============================================================================

const TRANSLATIONS = {
  en: {
    title: 'Treatment Schedule',
    description: 'AI-optimized treatment plan with timeline and recovery periods',
    schedule: 'Your Schedule',
    timeline: 'Timeline',
    totalCost: 'Estimated Total Cost',
    recoveryPeriod: 'Recovery Period',
    completionDate: 'Completion Date',
    highlights: 'Key Highlights',
    warnings: 'Important Notes',
    conflicts: 'Treatment Spacing',
    noConflicts: 'No spacing conflicts detected',
    conflictDetected: 'Spacing consideration detected',
    recovery: 'Recovery Stages',
    stage: 'Stage',
    duration: 'Duration',
    recommendations: 'Recommendations',
    viewDetails: 'View Details',
    confirmSchedule: 'Confirm Schedule',
    downloadSchedule: 'Download Schedule',
    shareSchedule: 'Share Schedule',
    reschedule: 'Reschedule',
    session: 'Session',
    of: 'of',
    downtime: 'Downtime',
    days: 'days',
    confidence: 'Confidence',
    priority: 'Priority',
    status: 'Status',
    scheduledFor: 'Scheduled for',
    recoveryUntil: 'Recovery until',
    notes: 'Notes',
    frequency: 'Frequency',
    optimizationScore: 'Schedule Optimization Score',
  },
  th: {
    title: 'ตารางการรักษา',
    description: 'แผนการรักษาที่เหมาะสมที่สุดโดย AI พร้อมไทม์ไลน์และระยะเวลาการฟื้นตัว',
    schedule: 'ตารางการรักษาของคุณ',
    timeline: 'ไทม์ไลน์',
    totalCost: 'ต้นทุนโดยประมาณทั้งหมด',
    recoveryPeriod: 'ระยะเวลาการฟื้นตัว',
    completionDate: 'วันที่เสร็จสิ้น',
    highlights: 'ประเด็นสำคัญ',
    warnings: 'บันทึกสำคัญ',
    conflicts: 'ระยะห่างของการรักษา',
    noConflicts: 'ไม่พบความขัดแย้งในระยะห่าง',
    conflictDetected: 'ตรวจพบการพิจารณาระยะห่าง',
    recovery: 'ขั้นตอนการฟื้นตัว',
    stage: 'ขั้นตอน',
    duration: 'ระยะเวลา',
    recommendations: 'คำแนะนำ',
    viewDetails: 'ดูรายละเอียด',
    confirmSchedule: 'ยืนยันตารางการรักษา',
    downloadSchedule: 'ดาวน์โหลดตารางการรักษา',
    shareSchedule: 'แบ่งปันตารางการรักษา',
    reschedule: 'เปลี่ยนตารางการรักษา',
    session: 'ครั้งที่',
    of: 'จาก',
    downtime: 'ระยะเวลาพักตัว',
    days: 'วัน',
    confidence: 'ความมั่นใจ',
    priority: 'ลำดับความสำคัญ',
    status: 'สถานะ',
    scheduledFor: 'กำหนดการรักษาสำหรับ',
    recoveryUntil: 'พักตัวถึง',
    notes: 'บันทึก',
    frequency: 'ความถี่',
    optimizationScore: 'คะแนนการเพิ่มประสิทธิภาพตารางการรักษา',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

function getPriorityColor(priority: string): string {
  if (priority === 'high') return 'bg-red-100 text-red-800';
  if (priority === 'medium') return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}

function getStatusColor(status: string): string {
  if (status === 'scheduled') return 'bg-blue-100 text-blue-800';
  if (status === 'completed') return 'bg-green-100 text-green-800';
  if (status === 'cancelled') return 'bg-gray-100 text-gray-800';
  return 'bg-orange-100 text-orange-800';
}

function renderStars(count: number, total: number = 5): React.ReactNode[] {
  return Array.from({ length: total }).map((_, i) => (
    <div
      key={`star-${i}-${count}`}
      className={`h-1.5 w-1.5 rounded-full ${i < count ? 'bg-yellow-400' : 'bg-gray-300'}`}
    />
  ));
}

// ============================================================================
// Sub-Components
// ============================================================================

function ConflictCard({ conflict }: { readonly conflict: TreatmentConflict }): React.ReactNode {
  const severityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-blue-200 bg-blue-50',
  };

  return (
    <div key={`${conflict.treatmentId1}-${conflict.treatmentId2}`} className={`rounded-lg border p-3 ${severityColors[conflict.severity]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold">{conflict.conflict}</p>
          <p className="text-xs text-muted-foreground mt-1">{conflict.recommendation}</p>
          <p className="text-xs font-medium mt-2">
            Minimum spacing: {conflict.minDaysBetween} days
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {conflict.severity}
        </Badge>
      </div>
    </div>
  );
}

function RecoveryStageCard({
  stage,
  index,
  locale,
  t,
}: {
  readonly stage: { stage: string; duration: number; recommendations: string[] };
  readonly index: number;
  readonly locale: 'th' | 'en';
  readonly t: any;
}): React.ReactNode {
  return (
    <div key={index} className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-sm">{stage.stage}</p>
          <p className="text-xs text-muted-foreground">
            {stage.duration} {t.days}
          </p>
        </div>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        {stage.recommendations.map((rec) => (
          <div key={rec} className="flex items-start gap-2 text-xs">
            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleItemCard({
  treatment,
  index,
  locale,
  t,
  onReschedule,
}: {
  readonly treatment: ScheduledTreatment;
  readonly index: number;
  readonly locale: 'th' | 'en';
  readonly t: any;
  readonly onReschedule?: (treatmentId: string) => void;
}): React.ReactNode {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div key={treatment.id} className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-colors text-left rounded-t-lg border-0 bg-none"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-primary">
              {index + 1}. {treatment.name}
            </span>
            <Badge variant="secondary" className="shrink-0">
              {treatment.sessionNumber}/{treatment.totalSessions}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(treatment.scheduledDate)}</span>
            {treatment.downtime > 0 && (
              <>
                <span>•</span>
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {treatment.downtime} {t.days} downtime
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 justify-end">
            {renderStars(Math.round(treatment.confidence * 5), 5)}
          </div>
          {showDetails ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Details */}
      {showDetails && (
        <div className="border-t p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.priority}</p>
              <Badge className={getPriorityColor(treatment.priority)}>
                {treatment.priority}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.status}</p>
              <Badge className={getStatusColor(treatment.status)}>
                {treatment.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.scheduledFor}</p>
              <p className="text-sm font-semibold">{formatDate(treatment.scheduledDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.recoveryUntil}</p>
              <p className="text-sm font-semibold">{formatDate(treatment.recoveryEndDate)}</p>
            </div>
          </div>

          {treatment.notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.notes}</p>
              <p className="text-sm">{treatment.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {onReschedule && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReschedule(treatment.id)}
              >
                {t.reschedule}
              </Button>
            )}
            <Button size="sm" variant="ghost">
              {t.viewDetails}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TreatmentSchedulingComponent({
  recommendations,
  locale,
  onScheduleConfirm,
  onReschedule,
}: TreatmentSchedulingComponentProps): React.ReactNode {
  const t = TRANSLATIONS[locale];
  const [expandedSections, setExpandedSections] = useState<string[]>(['schedule']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const hasConflicts = recommendations.conflicts.length > 0;
  const hasWarnings = recommendations.warnings.length > 0;

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Timeline</p>
            <p className="text-2xl font-bold">{recommendations.timeline}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">{t.totalCost}</p>
            <p className="text-2xl font-bold">฿{recommendations.totalCost.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">{t.completionDate}</p>
            <p className="text-lg font-bold">{formatDate(recommendations.completionDate)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">{t.optimizationScore}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{recommendations.optimizationScore}%</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Highlights */}
      {recommendations.highlights.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            <div className="space-y-1">
              {recommendations.highlights.map((highlight) => (
                <p key={highlight} className="text-sm">
                  ✓ {highlight}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {hasWarnings && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <div className="space-y-1">
              {recommendations.warnings.map((warning) => (
                <p key={warning} className="text-sm">
                  ⚠ {warning}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Schedule */}
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('schedule')}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.schedule}</CardTitle>
              <CardDescription>
                {recommendations.schedule.length} treatment{recommendations.schedule.length === 1 ? '' : 's'} planned
              </CardDescription>
            </div>
            {expandedSections.includes('schedule') ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        {expandedSections.includes('schedule') && (
          <CardContent className="space-y-3">
            {recommendations.schedule.map((treatment, idx) => (
              <ScheduleItemCard
                key={treatment.id}
                treatment={treatment}
                index={idx}
                locale={locale}
                t={t}
                onReschedule={onReschedule}
              />
            ))}
          </CardContent>
        )}
      </Card>

      {/* Treatment Spacing Conflicts */}
      {hasConflicts && (
        <Card className="border-orange-200">
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors bg-orange-50/50"
            onClick={() => toggleSection('conflicts')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <div>
                  <CardTitle>{t.conflicts}</CardTitle>
                  <CardDescription>
                    {recommendations.conflicts.length} spacing consideration{recommendations.conflicts.length === 1 ? '' : 's'}
                  </CardDescription>
                </div>
              </div>
              {expandedSections.includes('conflicts') ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>

          {expandedSections.includes('conflicts') && (
            <CardContent className="space-y-3">
              {recommendations.conflicts.map((conflict) => (
                <ConflictCard key={`${conflict.treatmentId1}-${conflict.treatmentId2}`} conflict={conflict} />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Recovery Stages */}
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('recovery')}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.recovery}</CardTitle>
              <CardDescription>{recommendations.expectedRecoveryPeriod}</CardDescription>
            </div>
            {expandedSections.includes('recovery') ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        {expandedSections.includes('recovery') && (
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Recovery stages would be generated and displayed here */}
            <div className="text-sm text-muted-foreground col-span-full">
              Recovery timeline and recommendations will appear here based on selected treatments.
            </div>
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-3">
        <Button size="lg" onClick={() => onScheduleConfirm?.(recommendations.schedule)}>
          <CheckCircle className="h-4 w-4 mr-2" />
          {t.confirmSchedule}
        </Button>
        <Button size="lg" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t.downloadSchedule}
        </Button>
        <Button size="lg" variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          {t.shareSchedule}
        </Button>
      </div>
    </div>
  );
}
