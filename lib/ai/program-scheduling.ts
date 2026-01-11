/**
 * AI-Powered Program Scheduling Engine
 * 
 * Suggests optimal program timing based on analysis results,
 * program history, recovery periods, and scheduling constraints.
 * Includes conflict detection, smart scheduling, and program sequencing.
 */

import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';
import type { ProgramRecommendation } from '@/lib/ai/program-recommendations';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ScheduledProgram {
  id: string;
  programId: string;
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

export interface ProgramConflict {
  programId1: string;
  programId2: string;
  conflict: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
  minDaysBetween: number;
}

export interface SchedulingConstraint {
  unavailableDates: Date[];
  maxConcurrentPrograms: number;
  preferredDaysOfWeek: number[]; // 0-6, Sunday-Saturday
  minDaysBetweenSessions: number;
  maxRecoveryTimeAcceptable: number; // days
  budgetPerMonth: number;
  prioritizeDowntime: boolean;
}

export interface SchedulingRecommendation {
  schedule: ScheduledProgram[];
  timeline: string; // e.g., "3 months"
  totalCost: number;
  expectedRecoveryPeriod: string;
  completionDate: Date;
  conflicts: ProgramConflict[];
  highlights: string[];
  warnings: string[];
  optimizationScore: number; // 0-100
}

export interface ProgramHistory {
  programId: string;
  programName: string;
  completedDate: Date;
  effectivenessRating: number; // 1-5
  downtimeExperienced: number; // days
  complications?: string;
  nextRecommendedDate?: Date;
}

// ============================================================================
// Program Conflict Matrix
// ============================================================================

const PROGRAM_CONFLICTS: Record<string, { conflicts: string[]; minDays: number }> = {
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

const PROGRAM_CHARACTERISTICS: Record<string, { downtime: number; weeks: number; costWeight: number }> = {
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
// ============================================================================
// Program Scheduling Engine
// ============================================================================

export class ProgramSchedulingEngine {
  /**
   * Generates optimal program schedule based on analysis and history
   */
  static generateOptimalSchedule(
    programs: ProgramRecommendation[],
    analysis: HybridSkinAnalysis,
    history: ProgramHistory[] = [],
    constraints: SchedulingConstraint = this.getDefaultConstraints(),
    startDate: Date = new Date()
  ): SchedulingRecommendation {
    // Prioritize programs by effectiveness and priority
    const prioritizedPrograms = this.prioritizePrograms(programs, analysis, history);

    // Detect potential conflicts
    const conflicts = this.detectConflicts(prioritizedPrograms);

    // Generate schedule respecting conflicts and recovery periods
    const schedule = this.sequencePrograms(prioritizedPrograms, conflicts, constraints, startDate);

    // Calculate timeline and costs
    const { timeline, completionDate, totalCost } = this.calculateScheduleMetrics(
      schedule,
      prioritizedPrograms
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
   * Prioritizes programs based on effectiveness, priority, and analysis severity
   */
  private static prioritizePrograms(
    programs: ProgramRecommendation[],
    analysis: HybridSkinAnalysis,
    history: ProgramHistory[]
  ): ProgramRecommendation[] {
    return programs.sort((a, b) => {
      // Calculate priority score
      const scoreA = this.calculateProgramScore(a, analysis, history);
      const scoreB = this.calculateProgramScore(b, analysis, history);
      return scoreB - scoreA;
    });
  }

  /**
   * Calculates priority score for a program
   */
  private static calculateProgramScore(
    program: ProgramRecommendation,
    analysis: HybridSkinAnalysis,
    history: ProgramHistory[]
  ): number {
    let score = 0;

    // Priority weight (40%)
    const priorityWeights = { high: 40, medium: 25, low: 10 };
    score += priorityWeights[program.priority];

    // Confidence weight (30%)
    score += program.confidence * 30;

    // Effectiveness weight (20%)
    score += (program.effectiveness / 100) * 20;

    // Previous success weight (10%)
    const successfulHistory = history.find((h) => h.programId === program.id);
    if (successfulHistory && successfulHistory.effectivenessRating >= 4) {
      score += 10;
    }

    // Concern match bonus
    const concernMatch = program.targetConcerns.filter((c) =>
      analysis.ai.concerns.includes(c as any)
    ).length;
    score += concernMatch * 5;

    return score;
  }

  /**
   * Detects conflicts between programs
   */
  private static detectConflicts(programs: ProgramRecommendation[]): ProgramConflict[] {
    const conflicts: ProgramConflict[] = [];

    for (let i = 0; i < programs.length; i++) {
      for (let j = i + 1; j < programs.length; j++) {
        const program1 = programs[i];
        const program2 = programs[j];

        const conflict1Info = PROGRAM_CONFLICTS[program1.category];
        const conflict2Info = PROGRAM_CONFLICTS[program2.category];

        if (
          conflict1Info?.conflicts.includes(program2.category) ||
          conflict2Info?.conflicts.includes(program1.category)
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
            programId1: program1.id,
            programId2: program2.id,
            conflict: `${program1.name} and ${program2.name} should not be performed close together`,
            severity: conflictSeverity,
            recommendation: `Space these programs at least ${minDays} days apart to minimize skin irritation`,
            minDaysBetween: minDays,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Sequences programs respecting conflicts and recovery periods
   */
  private static sequencePrograms(
    programs: ProgramRecommendation[],
    conflicts: ProgramConflict[],
    constraints: SchedulingConstraint,
    startDate: Date
  ): ScheduledProgram[] {
    const schedule: ScheduledProgram[] = [];
    let currentDate = new Date(startDate);
    let lastProgramDates: Record<string, Date> = {};

    for (let i = 0; i < programs.length; i++) {
      const program = programs[i];
      const characteristics = PROGRAM_CHARACTERISTICS[program.category] || {
        downtime: 2,
        weeks: 4,
        costWeight: 0.5,
      };

      // Find conflicts for this program
      const treatedConflicts = conflicts.filter(
        (c) => c.programId1 === program.id || c.programId2 === program.id
      );

      // Calculate earliest possible date
      let earliestDate = new Date(currentDate);

      // Check conflicts with other programs
      for (const conflict of treatedConflicts) {
        const otherProgramId =
          conflict.programId1 === program.id ? conflict.programId2 : conflict.programId1;
        const lastDate = lastProgramDates[otherProgramId];

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

      // Create scheduled program
      const estimatedEndDate = new Date(earliestDate);
      estimatedEndDate.setDate(estimatedEndDate.getDate() + 1);

      const recoveryEndDate = new Date(estimatedEndDate);
      recoveryEndDate.setDate(recoveryEndDate.getDate() + characteristics.downtime);

      const scheduledProgram: ScheduledProgram = {
        id: `scheduled-${i}-${program.id}`,
        programId: program.id,
        name: program.name,
        category: program.category,
        scheduledDate: earliestDate,
        estimatedEndDate,
        priority: program.priority,
        sessionNumber: 1,
        totalSessions: program.numberOfSessions,
        downtime: characteristics.downtime,
        recoveryEndDate,
        recurring: program.numberOfSessions > 1,
        frequency: this.getFrequencyFromDuration(program.duration),
        status: 'scheduled',
        confidence: program.confidence,
        notes: `${program.frequency} - ${program.duration}`,
      };

      schedule.push(scheduledProgram);
      lastProgramDates[program.id] = recoveryEndDate;
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
    schedule: ScheduledProgram[],
    programs: ProgramRecommendation[]
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
    const totalCost = programs.reduce((sum, program) => {
      return sum + (program.cost.min + program.cost.max) / 2 * program.numberOfSessions;
    }, 0);

    return { timeline, completionDate, totalCost };
  }

  /**
   * Calculates expected recovery period
   */
  private static calculateRecoveryPeriod(schedule: ScheduledProgram[]): string {
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
    schedule: ScheduledProgram[],
    conflicts: ProgramConflict[],
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
    schedule: ScheduledProgram[],
    conflicts: ProgramConflict[],
    analysis: HybridSkinAnalysis,
    history: ProgramHistory[]
  ): { highlights: string[]; warnings: string[] } {
    const highlights: string[] = [];
    const warnings: string[] = [];

    // Highlights
    if (schedule.length > 0) {
      highlights.push(`Personalized ${schedule.length}-step program plan`);
    }

    const maxDowntime = Math.max(...schedule.map((s) => s.downtime || 0));
    if (maxDowntime === 0) {
      highlights.push('No downtime required - ideal for busy schedules');
    } else if (maxDowntime <= 2) {
      highlights.push('Minimal recovery period - quick return to activities');
    }

    // Check for high-confidence programs
    const highConfidencePrograms = schedule.filter((s) => s.confidence >= 0.8);
    if (highConfidencePrograms.length > 0) {
      const programLabel = highConfidencePrograms.length === 1 ? 'program' : 'programs';
      highlights.push(
        `${highConfidencePrograms.length} high-confidence ${programLabel} recommended`
      );
    }

    // Warnings
    if (conflicts.length > 0) {
      const considerationLabel = conflicts.length === 1 ? 'consideration' : 'considerations';
      warnings.push(`${conflicts.length} program spacing ${considerationLabel} - see details`);
    }

    if (maxDowntime > 5) {
      warnings.push(`Significant downtime expected (${maxDowntime} days) - plan accordingly`);
    }

    // Check for contraindications based on history
    const complicationHistory = history.filter((h) => h.complications);
    if (complicationHistory.length > 0) {
      warnings.push('Previous program complications noted - consult with practitioner');
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
   * Gets next recommended program date
   */
  static getNextProgramDate(
    programHistory: ProgramHistory,
    completedDate: Date
  ): Date {
    if (programHistory.nextRecommendedDate) {
      return programHistory.nextRecommendedDate;
    }

    // Default: 4 weeks after completion
    const nextDate = new Date(completedDate);
    nextDate.setDate(nextDate.getDate() + 28);
    return nextDate;
  }

  /**
   * Reschedules a program due to constraint changes
   */
  static rescheduleProgram(
    program: ScheduledProgram,
    newDate: Date,
    existingSchedule: ScheduledProgram[]
  ): { success: boolean; error?: string } {
    // Check for conflicts with existing schedule
    for (const scheduled of existingSchedule) {
      if (scheduled.id !== program.id) {
        const daysBetween = Math.abs(
          (newDate.getTime() - scheduled.scheduledDate.getTime()) / (24 * 60 * 60 * 1000)
        );

        // Simple conflict check: programs should be at least 3 days apart
        if (daysBetween < 3) {
          return {
            success: false,
            error: `Conflict with ${scheduled.name} - programs must be 3 days apart`,
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
    schedule: ScheduledProgram[],
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
      maxConcurrentPrograms: 1,
      preferredDaysOfWeek: [2, 3, 4, 5], // Wed-Sat
      minDaysBetweenSessions: 7,
      maxRecoveryTimeAcceptable: 7,
      budgetPerMonth: 2000,
      prioritizeDowntime: true,
    };
  }
}
