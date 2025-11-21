/**
 * AI-Powered Treatment Scheduling Engine
 * 
 * Suggests optimal treatment timing based on analysis results,
 * treatment history, recovery periods, and scheduling constraints.
 * Includes conflict detection, smart scheduling, and treatment sequencing.
 */

import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import type { TreatmentRecommendation } from '@/lib/ai/treatment-recommendations';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ScheduledTreatment {
  id: string;
  treatmentId: string;
  name: string;
  category: string;
  scheduledDate: Date;
  estimatedEndDate: Date;
  priority: 'high' | 'medium' | 'low';
  sessionNumber: number;
  totalSessions: number;
  downtime: number; // days
  recoveryEndDate: Date;
  recurring: boolean;
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  nextSessionDate?: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  confidence: number;
  notes?: string;
}

export interface TreatmentConflict {
  treatmentId1: string;
  treatmentId2: string;
  conflict: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
  minDaysBetween: number;
}

export interface SchedulingConstraint {
  unavailableDates: Date[];
  maxConcurrentTreatments: number;
  preferredDaysOfWeek: number[]; // 0-6, Sunday-Saturday
  minDaysBetweenSessions: number;
  maxRecoveryTimeAcceptable: number; // days
  budgetPerMonth: number;
  prioritizeDowntime: boolean;
}

export interface SchedulingRecommendation {
  schedule: ScheduledTreatment[];
  timeline: string; // e.g., "3 months"
  totalCost: number;
  expectedRecoveryPeriod: string;
  completionDate: Date;
  conflicts: TreatmentConflict[];
  highlights: string[];
  warnings: string[];
  optimizationScore: number; // 0-100
}

export interface TreatmentHistory {
  treatmentId: string;
  treatmentName: string;
  completedDate: Date;
  effectivenessRating: number; // 1-5
  downtimeExperienced: number; // days
  complications?: string;
  nextRecommendedDate?: Date;
}

// ============================================================================
// Treatment Conflict Matrix
// ============================================================================

const TREATMENT_CONFLICTS: Record<string, { conflicts: string[]; minDays: number }> = {
  'laser': {
    conflicts: ['ipl', 'microneedling', 'chemical_peel', 'microdermabrasion'],
    minDays: 14,
  },
  'chemical_peel': {
    conflicts: ['laser', 'microneedling', 'microdermabrasion', 'ipl'],
    minDays: 10,
  },
  'microneedling': {
    conflicts: ['laser', 'chemical_peel', 'microdermabrasion', 'ipl'],
    minDays: 14,
  },
  'hydrafacial': {
    conflicts: ['chemical_peel', 'microneedling'],
    minDays: 7,
  },
  'led_therapy': {
    conflicts: [],
    minDays: 0,
  },
  'radiofrequency': {
    conflicts: ['microneedling', 'laser'],
    minDays: 10,
  },
  'microdermabrasion': {
    conflicts: ['laser', 'chemical_peel', 'microneedling', 'ipl'],
    minDays: 7,
  },
  'ipl': {
    conflicts: ['laser', 'chemical_peel', 'microneedling', 'microdermabrasion'],
    minDays: 14,
  },
  'botox': {
    conflicts: [],
    minDays: 0,
  },
  'filler': {
    conflicts: ['botox'],
    minDays: 7,
  },
  'skincare': {
    conflicts: [],
    minDays: 0,
  },
  'lifestyle': {
    conflicts: [],
    minDays: 0,
  },
};

// ============================================================================
// Recovery Time & Characteristics
// ============================================================================

const TREATMENT_CHARACTERISTICS: Record<string, { downtime: number; weeks: number; costWeight: number }> = {
  'laser': { downtime: 5, weeks: 4, costWeight: 1 },
  'chemical_peel': { downtime: 3, weeks: 3, costWeight: 0.7 },
  'microneedling': { downtime: 3, weeks: 4, costWeight: 0.6 },
  'hydrafacial': { downtime: 1, weeks: 2, costWeight: 0.4 },
  'led_therapy': { downtime: 0, weeks: 6, costWeight: 0.3 },
  'radiofrequency': { downtime: 2, weeks: 5, costWeight: 0.8 },
  'microdermabrasion': { downtime: 2, weeks: 3, costWeight: 0.5 },
  'ipl': { downtime: 4, weeks: 4, costWeight: 0.9 },
  'botox': { downtime: 0, weeks: 2, costWeight: 0.6 },
  'filler': { downtime: 1, weeks: 2, costWeight: 0.7 },
  'skincare': { downtime: 0, weeks: 8, costWeight: 0.2 },
  'lifestyle': { downtime: 0, weeks: 12, costWeight: 0 },
};

// ============================================================================
// Treatment Scheduling Engine
// ============================================================================

export class TreatmentSchedulingEngine {
  /**
   * Generates optimal treatment schedule based on analysis and history
   */
  static generateOptimalSchedule(
    treatments: TreatmentRecommendation[],
    analysis: HybridSkinAnalysis,
    history: TreatmentHistory[] = [],
    constraints: SchedulingConstraint = this.getDefaultConstraints(),
    startDate: Date = new Date()
  ): SchedulingRecommendation {
    // Prioritize treatments by effectiveness and priority
    const prioritizedTreatments = this.prioritizeTreatments(treatments, analysis, history);

    // Detect potential conflicts
    const conflicts = this.detectConflicts(prioritizedTreatments);

    // Generate schedule respecting conflicts and recovery periods
    const schedule = this.sequenceTreatments(prioritizedTreatments, conflicts, constraints, startDate);

    // Calculate timeline and costs
    const { timeline, completionDate, totalCost } = this.calculateScheduleMetrics(
      schedule,
      prioritizedTreatments
    );

    // Calculate optimization score
    const optimizationScore = this.calculateOptimizationScore(schedule, conflicts, constraints);

    // Generate highlights and warnings
    const { highlights, warnings } = this.generateScheduleInsights(
      schedule,
      conflicts,
      analysis,
      history
    );

    return {
      schedule,
      timeline,
      totalCost,
      expectedRecoveryPeriod: this.calculateRecoveryPeriod(schedule),
      completionDate,
      conflicts,
      highlights,
      warnings,
      optimizationScore,
    };
  }

  /**
   * Prioritizes treatments based on effectiveness, priority, and analysis severity
   */
  private static prioritizeTreatments(
    treatments: TreatmentRecommendation[],
    analysis: HybridSkinAnalysis,
    history: TreatmentHistory[]
  ): TreatmentRecommendation[] {
    return treatments.sort((a, b) => {
      // Calculate priority score
      const scoreA = this.calculateTreatmentScore(a, analysis, history);
      const scoreB = this.calculateTreatmentScore(b, analysis, history);
      return scoreB - scoreA;
    });
  }

  /**
   * Calculates priority score for a treatment
   */
  private static calculateTreatmentScore(
    treatment: TreatmentRecommendation,
    analysis: HybridSkinAnalysis,
    history: TreatmentHistory[]
  ): number {
    let score = 0;

    // Priority weight (40%)
    const priorityWeights = { high: 40, medium: 25, low: 10 };
    score += priorityWeights[treatment.priority];

    // Confidence weight (30%)
    score += treatment.confidence * 30;

    // Effectiveness weight (20%)
    score += (treatment.effectiveness / 100) * 20;

    // Previous success weight (10%)
    const successfulHistory = history.find((h) => h.treatmentId === treatment.id);
    if (successfulHistory && successfulHistory.effectivenessRating >= 4) {
      score += 10;
    }

    // Concern match bonus
    const concernMatch = treatment.targetConcerns.filter((c) =>
      analysis.ai.concerns.includes(c as any)
    ).length;
    score += concernMatch * 5;

    return score;
  }

  /**
   * Detects conflicts between treatments
   */
  private static detectConflicts(treatments: TreatmentRecommendation[]): TreatmentConflict[] {
    const conflicts: TreatmentConflict[] = [];

    for (let i = 0; i < treatments.length; i++) {
      for (let j = i + 1; j < treatments.length; j++) {
        const treatment1 = treatments[i];
        const treatment2 = treatments[j];

        const conflict1Info = TREATMENT_CONFLICTS[treatment1.category];
        const conflict2Info = TREATMENT_CONFLICTS[treatment2.category];

        if (
          conflict1Info?.conflicts.includes(treatment2.category) ||
          conflict2Info?.conflicts.includes(treatment1.category)
        ) {
          const minDays = Math.max(
            conflict1Info?.minDays || 0,
            conflict2Info?.minDays || 0
          );

          let conflictSeverity: 'high' | 'medium' | 'low';
          if (minDays > 14) {
            conflictSeverity = 'high';
          } else if (minDays > 7) {
            conflictSeverity = 'medium';
          } else {
            conflictSeverity = 'low';
          }

          conflicts.push({
            treatmentId1: treatment1.id,
            treatmentId2: treatment2.id,
            conflict: `${treatment1.name} and ${treatment2.name} should not be performed close together`,
            severity: conflictSeverity,
            recommendation: `Space these treatments at least ${minDays} days apart to minimize skin irritation`,
            minDaysBetween: minDays,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Sequences treatments respecting conflicts and recovery periods
   */
  private static sequenceTreatments(
    treatments: TreatmentRecommendation[],
    conflicts: TreatmentConflict[],
    constraints: SchedulingConstraint,
    startDate: Date
  ): ScheduledTreatment[] {
    const schedule: ScheduledTreatment[] = [];
    let currentDate = new Date(startDate);
    let lastTreatmentDates: Record<string, Date> = {};

    for (let i = 0; i < treatments.length; i++) {
      const treatment = treatments[i];
      const characteristics = TREATMENT_CHARACTERISTICS[treatment.category] || {
        downtime: 2,
        weeks: 4,
        costWeight: 0.5,
      };

      // Find conflicts for this treatment
      const treatedConflicts = conflicts.filter(
        (c) => c.treatmentId1 === treatment.id || c.treatmentId2 === treatment.id
      );

      // Calculate earliest possible date
      let earliestDate = new Date(currentDate);

      // Check conflicts with other treatments
      for (const conflict of treatedConflicts) {
        const otherTreatmentId =
          conflict.treatmentId1 === treatment.id ? conflict.treatmentId2 : conflict.treatmentId1;
        const lastDate = lastTreatmentDates[otherTreatmentId];

        if (lastDate) {
          const conflictDate = new Date(lastDate);
          conflictDate.setDate(conflictDate.getDate() + conflict.minDaysBetween);
          if (conflictDate > earliestDate) {
            earliestDate = conflictDate;
          }
        }
      }

      // Apply constraints
      earliestDate = this.applySchedulingConstraints(earliestDate, constraints);

      // Create scheduled treatment
      const estimatedEndDate = new Date(earliestDate);
      estimatedEndDate.setDate(estimatedEndDate.getDate() + 1);

      const recoveryEndDate = new Date(estimatedEndDate);
      recoveryEndDate.setDate(recoveryEndDate.getDate() + characteristics.downtime);

      const scheduledTreatment: ScheduledTreatment = {
        id: `scheduled-${i}-${treatment.id}`,
        treatmentId: treatment.id,
        name: treatment.name,
        category: treatment.category,
        scheduledDate: earliestDate,
        estimatedEndDate,
        priority: treatment.priority,
        sessionNumber: 1,
        totalSessions: treatment.numberOfSessions,
        downtime: characteristics.downtime,
        recoveryEndDate,
        recurring: treatment.numberOfSessions > 1,
        frequency: this.getFrequencyFromDuration(treatment.duration),
        status: 'scheduled',
        confidence: treatment.confidence,
        notes: `${treatment.frequency} - ${treatment.duration}`,
      };

      schedule.push(scheduledTreatment);
      lastTreatmentDates[treatment.id] = recoveryEndDate;
      currentDate = recoveryEndDate;
    }

    return schedule;
  }

  /**
   * Applies scheduling constraints to a date
   */
  private static applySchedulingConstraints(date: Date, constraints: SchedulingConstraint): Date {
    let adjustedDate = new Date(date);

    // Skip unavailable dates
    while (constraints.unavailableDates.some((d) => this.isSameDay(adjustedDate, d))) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
    }

    // Apply preferred days of week
    if (constraints.preferredDaysOfWeek.length > 0) {
      while (!constraints.preferredDaysOfWeek.includes(adjustedDate.getDay())) {
        adjustedDate.setDate(adjustedDate.getDate() + 1);
      }
    }

    return adjustedDate;
  }

  /**
   * Helper to check if two dates are the same day
   */
  private static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Calculates schedule metrics (timeline, completion date, costs)
   */
  private static calculateScheduleMetrics(
    schedule: ScheduledTreatment[],
    treatments: TreatmentRecommendation[]
  ): { timeline: string; completionDate: Date; totalCost: number } {
    if (schedule.length === 0) {
      return {
        timeline: '0 weeks',
        completionDate: new Date(),
        totalCost: 0,
      };
    }

    const lastScheduled = schedule.at(-1);
    if (!lastScheduled) {
      return {
        timeline: '0 weeks',
        completionDate: new Date(),
        totalCost: 0,
      };
    }

    const completionDate = new Date(lastScheduled.recoveryEndDate);

    const timelineWeeks = Math.ceil(
      (completionDate.getTime() - schedule[0].scheduledDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const timelineMonths = Math.ceil(timelineWeeks / 4);

    let timeline = '';
    if (timelineWeeks < 4) {
      const weekLabel = timelineWeeks === 1 ? 'week' : 'weeks';
      timeline = `${timelineWeeks} ${weekLabel}`;
    } else {
      const monthLabel = timelineMonths === 1 ? 'month' : 'months';
      timeline = `${timelineMonths} ${monthLabel}`;
    }

    // Calculate total cost
    const totalCost = treatments.reduce((sum, treatment) => {
      return sum + (treatment.cost.min + treatment.cost.max) / 2 * treatment.numberOfSessions;
    }, 0);

    return { timeline, completionDate, totalCost };
  }

  /**
   * Calculates expected recovery period
   */
  private static calculateRecoveryPeriod(schedule: ScheduledTreatment[]): string {
    if (schedule.length === 0) return '0 days';

    const maxDowntime = Math.max(...schedule.map((s) => s.downtime || 0));

    if (maxDowntime === 0) return 'No downtime expected';
    if (maxDowntime <= 2) return 'Minimal downtime (1-2 days)';
    if (maxDowntime <= 5) return 'Moderate downtime (3-5 days)';
    if (maxDowntime <= 7) return 'Significant downtime (up to 1 week)';
    return `Extended downtime (${maxDowntime} days)`;
  }

  /**
   * Calculates optimization score (0-100)
   */
  private static calculateOptimizationScore(
    schedule: ScheduledTreatment[],
    conflicts: TreatmentConflict[],
    constraints: SchedulingConstraint
  ): number {
    let score = 100;

    // Penalize for high-severity conflicts
    const highSeverityConflicts = conflicts.filter((c) => c.severity === 'high').length;
    score -= highSeverityConflicts * 15;

    // Penalize for medium-severity conflicts
    const mediumSeverityConflicts = conflicts.filter((c) => c.severity === 'medium').length;
    score -= mediumSeverityConflicts * 8;

    // Penalize for high downtime requirements
    const maxDowntime = Math.max(...schedule.map((s) => s.downtime || 0));
    if (maxDowntime > 7 && constraints.prioritizeDowntime) {
      score -= 10;
    }

    // Bonus for staying within budget
    const totalCost = schedule.reduce((sum, _s) => sum + 1000, 0); // Placeholder cost
    if (totalCost <= constraints.budgetPerMonth * 3) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generates insights and warnings for the schedule
   */
  private static generateScheduleInsights(
    schedule: ScheduledTreatment[],
    conflicts: TreatmentConflict[],
    analysis: HybridSkinAnalysis,
    history: TreatmentHistory[]
  ): { highlights: string[]; warnings: string[] } {
    const highlights: string[] = [];
    const warnings: string[] = [];

    // Highlights
    if (schedule.length > 0) {
      highlights.push(`Personalized ${schedule.length}-step treatment plan`);
    }

    const maxDowntime = Math.max(...schedule.map((s) => s.downtime || 0));
    if (maxDowntime === 0) {
      highlights.push('No downtime required - ideal for busy schedules');
    } else if (maxDowntime <= 2) {
      highlights.push('Minimal recovery period - quick return to activities');
    }

    // Check for high-confidence treatments
    const highConfidenceTreatments = schedule.filter((s) => s.confidence >= 0.8);
    if (highConfidenceTreatments.length > 0) {
      const treatmentLabel = highConfidenceTreatments.length === 1 ? 'treatment' : 'treatments';
      highlights.push(
        `${highConfidenceTreatments.length} high-confidence ${treatmentLabel} recommended`
      );
    }

    // Warnings
    if (conflicts.length > 0) {
      const considerationLabel = conflicts.length === 1 ? 'consideration' : 'considerations';
      warnings.push(`${conflicts.length} treatment spacing ${considerationLabel} - see details`);
    }

    if (maxDowntime > 5) {
      warnings.push(`Significant downtime expected (${maxDowntime} days) - plan accordingly`);
    }

    // Check for contraindications based on history
    const complicationHistory = history.filter((h) => h.complications);
    if (complicationHistory.length > 0) {
      warnings.push('Previous treatment complications noted - consult with practitioner');
    }

    // Skin sensitivity warning
    if (analysis.ai.skinType === 'sensitive') {
      warnings.push('Sensitive skin detected - may require modified approach');
    }

    return { highlights, warnings };
  }

  /**
   * Gets frequency enum from duration string
   */
  private static getFrequencyFromDuration(duration: string): 'weekly' | 'biweekly' | 'monthly' | 'quarterly' {
    const lowerDuration = duration.toLowerCase();

    if (lowerDuration.includes('weekly') || lowerDuration.includes('week')) {
      return 'weekly';
    } else if (lowerDuration.includes('biweekly') || lowerDuration.includes('2 week')) {
      return 'biweekly';
    } else if (lowerDuration.includes('monthly') || lowerDuration.includes('month')) {
      return 'monthly';
    }

    return 'quarterly';
  }

  /**
   * Gets next recommended treatment date
   */
  static getNextTreatmentDate(
    treatmentHistory: TreatmentHistory,
    completedDate: Date
  ): Date {
    if (treatmentHistory.nextRecommendedDate) {
      return treatmentHistory.nextRecommendedDate;
    }

    // Default: 4 weeks after completion
    const nextDate = new Date(completedDate);
    nextDate.setDate(nextDate.getDate() + 28);
    return nextDate;
  }

  /**
   * Reschedules a treatment due to constraint changes
   */
  static rescheduleTreatment(
    treatment: ScheduledTreatment,
    newDate: Date,
    existingSchedule: ScheduledTreatment[]
  ): { success: boolean; error?: string } {
    // Check for conflicts with existing schedule
    for (const scheduled of existingSchedule) {
      if (scheduled.id !== treatment.id) {
        const daysBetween = Math.abs(
          (newDate.getTime() - scheduled.scheduledDate.getTime()) / (24 * 60 * 60 * 1000)
        );

        // Simple conflict check: treatments should be at least 3 days apart
        if (daysBetween < 3) {
          return {
            success: false,
            error: `Conflict with ${scheduled.name} - treatments must be 3 days apart`,
          };
        }
      }
    }

    return { success: true };
  }

  /**
   * Calculates skin recovery timeline
   */
  static calculateSkinRecovery(
    schedule: ScheduledTreatment[],
    _analysis: HybridSkinAnalysis
  ): { stage: string; duration: number; recommendations: string[] }[] {
    const stages: { stage: string; duration: number; recommendations: string[] }[] = [];
    const maxDowntime = Math.max(...schedule.map((s) => s.downtime || 0));

    // Immediate recovery (0-1 days)
    if (maxDowntime > 0) {
      stages.push({
        stage: 'Immediate Recovery (0-24 hours)',
        duration: 1,
        recommendations: [
          'Avoid water/cleansing for 6 hours',
          'Apply prescribed recovery serum',
          'Avoid makeup and strenuous activity',
          'Sleep elevated (2+ pillows)',
        ],
      });
    }

    // Initial healing (1-3 days)
    if (maxDowntime > 1) {
      stages.push({
        stage: 'Initial Healing (1-3 days)',
        duration: 2,
        recommendations: [
          'Use gentle, fragrance-free cleanser',
          'Apply hydrating moisturizer 2-3 times daily',
          'Use SPF 50+ sunscreen if any sun exposure',
          'Avoid exercise and heat exposure',
        ],
      });
    }

    // Main recovery (3-7 days)
    if (maxDowntime > 3) {
      stages.push({
        stage: 'Main Recovery (3-7 days)',
        duration: 4,
        recommendations: [
          'Continue moisturizing and SPF routine',
          'Introduce lightweight serums as skin allows',
          'Light exercises (walking, yoga) acceptable',
          'Avoid direct sun exposure',
        ],
      });
    }

    // Full recovery (7+ days)
    stages.push({
      stage: 'Full Recovery (7+ days)',
      duration: maxDowntime - 7,
      recommendations: [
        'Resume normal skincare routine gradually',
        'Continue SPF protection',
        'Normal activities and exercise allowed',
        'Schedule follow-up assessment',
      ],
    });

    return stages;
  }

  /**
   * Gets default scheduling constraints
   */
  private static getDefaultConstraints(): SchedulingConstraint {
    return {
      unavailableDates: [],
      maxConcurrentTreatments: 1,
      preferredDaysOfWeek: [2, 3, 4, 5], // Wed-Sat
      minDaysBetweenSessions: 7,
      maxRecoveryTimeAcceptable: 7,
      budgetPerMonth: 2000,
      prioritizeDowntime: true,
    };
  }
}
