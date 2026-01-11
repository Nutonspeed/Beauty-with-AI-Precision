/**
 * Enhanced Program Simulator
 * Provides realistic skin program simulations with effects, combinations, and timeline preview
 */

export type ProgramType =
  | 'laser'
  | 'chemical_peel'
  | 'microdermabrasion'
  | 'microneedling'
  | 'filler'
  | 'botox'
  | 'thread_lift'
  | 'prp'
  | 'acne_program'
  | 'hydration_program'
  | 'radiofrequency'
  | 'ipl'
  | 'led_therapy';

export type SkinConcern = 'acne' | 'wrinkles' | 'redness' | 'texture' | 'pores' | 'pigmentation' | 'dryness' | 'oiliness' | 'sensitivity' | 'sagging';

export interface ProgramEffect {
  concern: SkinConcern;
  improvement: number; // 0-100
  duration: number; // days
  visibility: number; // 0-100 (how visible the effect is in AR)
  delayedResult: boolean;
  delayDays: number;
}

export interface ProgramDefinition {
  id: string;
  name: string;
  type: ProgramType;
  description: string;
  effects: ProgramEffect[];
  downtime: number; // days
  recovery: number; // days
  costRange: { min: number; max: number };
  suitableForConcerns: SkinConcern[];
  risks: string[];
  sessionDuration: number; // minutes
  numberOfSessions: number;
  sessionSpacing: number; // days
  animation: {
    type: 'fade' | 'smooth' | 'texture_shift';
    intensity: number;
  };
}

export interface CombinedProgramPlan {
  programs: ProgramDefinition[];
  startDate: Date;
  duration: number; // days
  totalCost: number;
  expectedImprovement: { [key in SkinConcern]?: number };
  timeline: TimelineEvent[];
  synergies: string[]; // How programs work together
  risks: string[];
}

export interface TimelineEvent {
  date: Date;
  event: string;
  type: 'session' | 'recovery' | 'results' | 'maintenance';
  importance: 'high' | 'medium' | 'low';
  details: string;
}

export interface SimulationFrame {
  timestamp: number; // milliseconds from start
  progress: number; // 0-100
  effects: {
    [key in SkinConcern]?: {
      improvement: number;
      visibility: number;
      effectIntensity: number;
    };
  };
  overlay: {
    texture: number;
    smoothness: number;
    radiance: number;
    uniformity: number;
  };
}

export interface BeforeAfterTimeline {
  before: FrameData;
  after: FrameData;
  timeline: TimelineFrame[];
}

export interface FrameData {
  date: Date;
  concerns: { [key in SkinConcern]?: number };
  overallScore: number;
  texture: number;
  smoothness: number;
  radiance: number;
}

export interface TimelineFrame {
  daysFromStart: number;
  improvement: number;
  concerns: { [key in SkinConcern]?: number };
  phase: 'initiation' | 'active' | 'recovery' | 'results' | 'maintenance';
}

export class EnhancedProgramSimulator {
  private static readonly PROGRAM_LIBRARY: { [key: string]: ProgramDefinition } = {
    laser_resurfacing: {
      id: 'laser_resurfacing',
      name: 'Laser Resurfacing',
      type: 'laser',
      description: 'Advanced fractional laser for skin resurfacing',
      effects: [
        { concern: 'wrinkles', improvement: 85, duration: 180, visibility: 80, delayedResult: true, delayDays: 7 },
        { concern: 'texture', improvement: 80, duration: 180, visibility: 80, delayedResult: true, delayDays: 7 },
        { concern: 'pigmentation', improvement: 75, duration: 180, visibility: 70, delayedResult: true, delayDays: 7 },
        { concern: 'redness', improvement: -10, duration: 30, visibility: 50, delayedResult: false, delayDays: 0 }, // Initial redness
      ],
      downtime: 7,
      recovery: 21,
      costRange: { min: 3000, max: 8000 },
      suitableForConcerns: ['wrinkles', 'texture', 'pigmentation'],
      risks: ['temporary redness', 'hyperpigmentation', 'infection risk'],
      sessionDuration: 30,
      numberOfSessions: 3,
      sessionSpacing: 30,
      animation: { type: 'fade', intensity: 85 },
    },
    chemical_peel_medium: {
      id: 'chemical_peel_medium',
      name: 'Medium Chemical Peel',
      type: 'chemical_peel',
      description: 'TCA or glycolic acid medium depth peel',
      effects: [
        { concern: 'acne', improvement: 60, duration: 120, visibility: 60, delayedResult: true, delayDays: 3 },
        { concern: 'texture', improvement: 70, duration: 120, visibility: 70, delayedResult: true, delayDays: 3 },
        { concern: 'redness', improvement: -20, duration: 14, visibility: 50, delayedResult: false, delayDays: 0 },
        { concern: 'pigmentation', improvement: 55, duration: 120, visibility: 60, delayedResult: true, delayDays: 5 },
      ],
      downtime: 5,
      recovery: 14,
      costRange: { min: 1500, max: 4000 },
      suitableForConcerns: ['acne', 'texture', 'pigmentation'],
      risks: ['peeling', 'sensitivity', 'temporary darkness'],
      sessionDuration: 20,
      numberOfSessions: 4,
      sessionSpacing: 21,
      animation: { type: 'smooth', intensity: 70 },
    },
    microneedling: {
      id: 'microneedling',
      name: 'Microneedling',
      type: 'microneedling',
      description: 'Collagen-inducing microneedling therapy',
      effects: [
        { concern: 'wrinkles', improvement: 65, duration: 90, visibility: 60, delayedResult: true, delayDays: 14 },
        { concern: 'texture', improvement: 70, duration: 90, visibility: 70, delayedResult: true, delayDays: 14 },
        { concern: 'pores', improvement: 60, duration: 90, visibility: 60, delayedResult: true, delayDays: 14 },
        { concern: 'redness', improvement: -15, duration: 7, visibility: 50, delayedResult: false, delayDays: 0 },
      ],
      downtime: 3,
      recovery: 7,
      costRange: { min: 1000, max: 3000 },
      suitableForConcerns: ['wrinkles', 'texture', 'pores'],
      risks: ['minor bleeding', 'mild redness', 'sensitivity'],
      sessionDuration: 25,
      numberOfSessions: 6,
      sessionSpacing: 14,
      animation: { type: 'texture_shift', intensity: 65 },
    },
    hydrafacial: {
      id: 'hydrafacial',
      name: 'HydraFacial',
      type: 'hydration_program',
      description: 'Vortex fusion hydradermabrasion and hydration',
      effects: [
        { concern: 'texture', improvement: 50, duration: 21, visibility: 50, delayedResult: false, delayDays: 0 },
        { concern: 'pores', improvement: 45, duration: 21, visibility: 50, delayedResult: false, delayDays: 0 },
        { concern: 'dryness', improvement: 70, duration: 21, visibility: 70, delayedResult: false, delayDays: 0 },
        { concern: 'redness', improvement: 30, duration: 21, visibility: 50, delayedResult: false, delayDays: 0 },
      ],
      downtime: 0,
      recovery: 0,
      costRange: { min: 2500, max: 4000 },
      suitableForConcerns: ['texture', 'pores', 'dryness'],
      risks: ['none'],
      sessionDuration: 30,
      numberOfSessions: 6,
      sessionSpacing: 14,
      animation: { type: 'fade', intensity: 60 },
    },
    radiofrequency: {
      id: 'radiofrequency',
      name: 'Radiofrequency Therapy',
      type: 'radiofrequency',
      description: 'Non-invasive collagen remodeling',
      effects: [
        { concern: 'wrinkles', improvement: 55, duration: 120, visibility: 60, delayedResult: true, delayDays: 21 },
        { concern: 'sagging', improvement: 60, duration: 120, visibility: 60, delayedResult: true, delayDays: 21 },
        { concern: 'texture', improvement: 50, duration: 120, visibility: 50, delayedResult: true, delayDays: 21 },
      ],
      downtime: 0,
      recovery: 2,
      costRange: { min: 2000, max: 6000 },
      suitableForConcerns: ['wrinkles', 'sagging', 'texture'],
      risks: ['temporary warmth', 'minor redness'],
      sessionDuration: 40,
      numberOfSessions: 6,
      sessionSpacing: 14,
      animation: { type: 'smooth', intensity: 70 },
    },
    ipl_photofacial: {
      id: 'ipl_photofacial',
      name: 'IPL Photofacial',
      type: 'ipl',
      description: 'Intense pulsed light for pigmentation and redness',
      effects: [
        { concern: 'pigmentation', improvement: 80, duration: 90, visibility: 80, delayedResult: true, delayDays: 7 },
        { concern: 'redness', improvement: 70, duration: 90, visibility: 70, delayedResult: true, delayDays: 7 },
        { concern: 'acne', improvement: 50, duration: 90, visibility: 50, delayedResult: true, delayDays: 7 },
      ],
      downtime: 2,
      recovery: 7,
      costRange: { min: 1500, max: 3500 },
      suitableForConcerns: ['pigmentation', 'redness', 'acne'],
      risks: ['temporary darkening', 'mild blistering'],
      sessionDuration: 20,
      numberOfSessions: 4,
      sessionSpacing: 21,
      animation: { type: 'texture_shift', intensity: 75 },
    },
    led_therapy: {
      id: 'led_therapy',
      name: 'LED Light Therapy',
      type: 'led_therapy',
      description: 'Non-invasive light-based skin rejuvenation',
      effects: [
        { concern: 'acne', improvement: 55, duration: 60, visibility: 50, delayedResult: true, delayDays: 10 },
        { concern: 'redness', improvement: 60, duration: 60, visibility: 60, delayedResult: true, delayDays: 10 },
        { concern: 'texture', improvement: 40, duration: 60, visibility: 40, delayedResult: true, delayDays: 10 },
      ],
      downtime: 0,
      recovery: 0,
      costRange: { min: 500, max: 2000 },
      suitableForConcerns: ['acne', 'redness', 'texture'],
      risks: ['none'],
      sessionDuration: 20,
      numberOfSessions: 10,
      sessionSpacing: 7,
      animation: { type: 'fade', intensity: 50 },
    },
  };

  /**
   * Simulate single program effect on skin
   */
  static simulateProgramEffect(
    program: ProgramDefinition,
    durationMs: number = 5000
  ): SimulationFrame[] {
    const frames: SimulationFrame[] = [];
    const frameCount = 60; // 60 frames for smooth animation
    const frameDuration = durationMs / frameCount;

    for (let i = 0; i < frameCount; i++) {
      const progress = (i / frameCount) * 100;
      const timestamp = i * frameDuration;

      const effects: SimulationFrame['effects'] = {};
      for (const effect of program.effects) {
        const effectProgress = Math.min(100, progress * (100 / 80)); // Peak at 80%
        const easeOut = 1 - Math.pow(1 - effectProgress / 100, 3);

        effects[effect.concern] = {
          improvement: effect.improvement * easeOut,
          visibility: easeOut * effect.visibility,
          effectIntensity: easeOut * program.animation.intensity,
        };
      }

      // Calculate overlay changes
      const avgImprovement = Object.values(effects).reduce((sum, e) => sum + (e?.improvement || 0), 0) / program.effects.length;

      frames.push({
        timestamp,
        progress,
        effects,
        overlay: {
          texture: avgImprovement * 0.8,
          smoothness: avgImprovement * 0.9,
          radiance: avgImprovement * 0.7,
          uniformity: avgImprovement * 0.8,
        },
      });
    }

    return frames;
  }

  /**
   * Build program sessions timeline
   */
  private static buildProgramTimeline(
    program: ProgramDefinition,
    startDate: Date
  ): { timeline: TimelineEvent[]; totalDays: number; endDate: Date } {
    const timeline: TimelineEvent[] = [];
    let totalDays = 0;
    let currentDate = new Date(startDate);

    const sessionSpacing = program.sessionSpacing;
    const totalSessionDays = (program.numberOfSessions - 1) * sessionSpacing + program.sessionDuration / 1440;
    const recoveryPeriod = program.recovery;

    for (let i = 0; i < program.numberOfSessions; i++) {
      const sessionDate = new Date(currentDate);
      sessionDate.setDate(sessionDate.getDate() + i * sessionSpacing);

      timeline.push({
        date: sessionDate,
        event: `${program.name} - Session ${i + 1}`,
        type: 'session',
        importance: i === 0 ? 'high' : 'medium',
        details: `Duration: ${program.sessionDuration} minutes`,
      });

      if (i === 0) {
        timeline.push({
          date: new Date(sessionDate),
          event: `Recovery period starts for ${program.name}`,
          type: 'recovery',
          importance: 'high',
          details: `Expected downtime: ${program.downtime} days`,
        });
      }
    }

    const sessionsEnd = new Date(currentDate);
    sessionsEnd.setDate(sessionsEnd.getDate() + (program.numberOfSessions - 1) * sessionSpacing);

    // Add results timeline
    for (const effect of program.effects) {
      if (effect.delayedResult) {
        const resultDate = new Date(sessionsEnd);
        resultDate.setDate(resultDate.getDate() + effect.delayDays);

        timeline.push({
          date: resultDate,
          event: `Optimal results for ${effect.concern} visible`,
          type: 'results',
          importance: 'medium',
          details: `${Math.round(effect.improvement)}% improvement reached`,
        });
      }
    }

    totalDays = Math.max(totalSessionDays, recoveryPeriod) + 30; // 30 days maintenance
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalDays);

    return { timeline, totalDays, endDate };
  }

  /**
   * Calculate expected improvements from programs
   */
  private static calculateExpectedImprovements(
    programs: ProgramDefinition[]
  ): { [key in SkinConcern]?: number } {
    const expectedImprovement: { [key in SkinConcern]?: number } = {};
    for (const program of programs) {
      for (const effect of program.effects) {
        if (!expectedImprovement[effect.concern]) {
          expectedImprovement[effect.concern] = 0;
        }
        // Simplified synergy: highest improvement + 20% of others
        expectedImprovement[effect.concern] = Math.min(
          100,
          Math.max(expectedImprovement[effect.concern] || 0, effect.improvement) +
            (expectedImprovement[effect.concern] ? effect.improvement * 0.2 : 0)
        );
      }
    }
    return expectedImprovement;
  }

  /**
   * Create combined program plan
   */
  static createCombinedPlan(
    programIds: string[],
    startDate: Date = new Date()
  ): CombinedProgramPlan {
    const programs = programIds
      .map((id) => this.PROGRAM_LIBRARY[id])
      .filter((t) => t !== undefined);

    if (programs.length === 0) {
      throw new Error('No valid programs found');
    }

    let totalDays = 0;
    const timeline: TimelineEvent[] = [];
    let currentDate = new Date(startDate);

    for (const program of programs) {
      const { timeline: programTimeline, totalDays: days, endDate } = this.buildProgramTimeline(program, currentDate);
      timeline.push(...programTimeline);
      totalDays += days;
      currentDate = new Date(endDate);
    }

    const totalCost = programs.reduce((sum, t) => sum + (t.costRange.max + t.costRange.min) / 2, 0);
    const expectedImprovement = this.calculateExpectedImprovements(programs);
    const synergies = this.calculateSynergies(programs);
    const risks = [...new Set(programs.flatMap((t) => t.risks))];

    timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      programs,
      startDate,
      duration: totalDays,
      totalCost,
      expectedImprovement,
      timeline,
      synergies,
      risks,
    };
  }

  /**
   * Generate before/after timeline
   */
  static generateBeforeAfterTimeline(
    plan: CombinedProgramPlan,
    beforeBaseline: { [key in SkinConcern]?: number }
  ): BeforeAfterTimeline {
    const after: FrameData = {
      date: new Date(plan.startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000),
      concerns: {},
      overallScore: 0,
      texture: 0,
      smoothness: 0,
      radiance: 0,
    };

    // Calculate after state based on expected improvements
    let totalImprovement = 0;
    let concernCount = 0;

    for (const [concern, improvement] of Object.entries(plan.expectedImprovement)) {
      const before = beforeBaseline[concern as SkinConcern] || 50;
      after.concerns[concern as SkinConcern] = Math.max(0, Math.min(100, before - improvement));
      totalImprovement += improvement;
      concernCount++;
    }

    after.overallScore = 100 - (totalImprovement / concernCount) * 0.5;
    after.texture = 85 - totalImprovement * 0.2;
    after.smoothness = 80 - totalImprovement * 0.2;
    after.radiance = 70 - totalImprovement * 0.15;

    // Generate timeline frames
    const timeline: TimelineFrame[] = [];
    const totalDays = plan.duration;

    for (let day = 0; day <= totalDays; day += Math.ceil(totalDays / 20)) {
      const progress = (day / totalDays) * 100;
      let phase: TimelineFrame['phase'];

      if (progress < 15) {
        phase = 'initiation';
      } else if (progress < 40) {
        phase = 'active';
      } else if (progress < 70) {
        phase = 'recovery';
      } else if (progress < 90) {
        phase = 'results';
      } else {
        phase = 'maintenance';
      }

      const frameDate = new Date(plan.startDate);
      frameDate.setDate(frameDate.getDate() + day);

      const concerns: { [key in SkinConcern]?: number } = {};
      for (const [concern, before] of Object.entries(beforeBaseline)) {
        const expected = plan.expectedImprovement[concern as SkinConcern] || 0;
        const interpolated = before - expected * (progress / 100);
        concerns[concern as SkinConcern] = Math.max(0, Math.min(100, interpolated));
      }

      timeline.push({
        daysFromStart: day,
        improvement: progress,
        concerns,
        phase,
      });
    }

    return {
      before: {
        date: plan.startDate,
        concerns: beforeBaseline,
        overallScore: 50,
        texture: 70,
        smoothness: 65,
        radiance: 60,
      },
      after,
      timeline,
    };
  }

  /**
   * Get available programs
   */
  static getProgramLibrary(): ProgramDefinition[] {
    return Object.values(this.PROGRAM_LIBRARY);
  }

  /**
   * Get program by ID
   */
  static getProgram(id: string): ProgramDefinition | null {
    return this.PROGRAM_LIBRARY[id] || null;
  }

  /**
   * Find programs for specific concerns
   */
  static findProgramsForConcerns(concerns: SkinConcern[]): ProgramDefinition[] {
    return Object.values(this.PROGRAM_LIBRARY).filter((program) =>
      concerns.some((concern) => program.suitableForConcerns.includes(concern))
    );
  }

  /**
   * Calculate synergies between programs
   */
  private static calculateSynergies(programs: ProgramDefinition[]): string[] {
    const synergies: string[] = [];

    // Laser + Microneedling: Enhanced collagen induction
    if (
      programs.some((p) => p.type === 'laser') &&
      programs.some((p) => p.type === 'microneedling')
    ) {
      synergies.push('Laser + Microneedling synergy enhances collagen production');
    }

    // Chemical Peel + LED: Faster recovery and enhanced results
    if (
      programs.some((p) => p.type === 'chemical_peel') &&
      programs.some((p) => p.type === 'led_therapy')
    ) {
      synergies.push('Chemical Peel + LED therapy accelerates healing');
    }

    // Radiofrequency + Microneedling: Comprehensive skin remodeling
    if (
      programs.some((p) => p.type === 'radiofrequency') &&
      programs.some((p) => p.type === 'microneedling')
    ) {
      synergies.push('Radiofrequency + Microneedling provides comprehensive skin remodeling');
    }

    // HydraFacial as maintenance between aggressive programs
    if (
      programs.some((p) => p.type === 'hydration_program') &&
      programs.some((p) => ['laser', 'chemical_peel'].includes(p.type))
    ) {
      synergies.push('HydraFacial maintenance enhances results of aggressive programs');
    }

    // IPL + LED: Combined light therapy benefits
    if (
      programs.some((p) => p.type === 'ipl') &&
      programs.some((p) => p.type === 'led_therapy')
    ) {
      synergies.push('IPL + LED therapy provides comprehensive light-based program');
    }

    return synergies;
  }

  /**
   * Calculate particle effects based on program type
   */
  static getParticleEffect(programType: ProgramType): {
    particleSize: number;
    particleCount: number;
    particleColor: string;
    emissionRate: number;
  } {
    const effects: Record<string, any> = {
      laser: { particleSize: 2, particleCount: 50, particleColor: '#ff6b6b', emissionRate: 100 },
      chemical_peel: { particleSize: 1.5, particleCount: 40, particleColor: '#ffd93d', emissionRate: 80 },
      microdermabrasion: { particleSize: 1, particleCount: 30, particleColor: '#a8d8ea', emissionRate: 60 },
      microneedling: { particleSize: 0.8, particleCount: 25, particleColor: '#06ffa5', emissionRate: 50 },
      filler: { particleSize: 1.5, particleCount: 15, particleColor: '#f4a261', emissionRate: 40 },
      botox: { particleSize: 1.2, particleCount: 10, particleColor: '#eae2b7', emissionRate: 20 },
      thread_lift: { particleSize: 2, particleCount: 25, particleColor: '#d62828', emissionRate: 50 },
      prp: { particleSize: 1.5, particleCount: 20, particleColor: '#8B5CF6', emissionRate: 40 },
      acne_program: { particleSize: 1.2, particleCount: 25, particleColor: '#10B981', emissionRate: 50 },
      hydration_program: { particleSize: 1.2, particleCount: 35, particleColor: '#00b4d8', emissionRate: 70 },
      radiofrequency: { particleSize: 1.8, particleCount: 20, particleColor: '#ff006e', emissionRate: 40 },
      ipl: { particleSize: 2, particleCount: 45, particleColor: '#f77f00', emissionRate: 90 },
      led_therapy: { particleSize: 1.5, particleCount: 20, particleColor: '#fcbf49', emissionRate: 60 },
    };

    return effects[programType] || { particleSize: 1, particleCount: 10, particleColor: '#ffffff', emissionRate: 10 };
  }

  /**
   * Generate realistic skin texture changes
   */
  static generateSkinTextureChanges(
    improvement: number,
    concern: SkinConcern
  ): {
    roughness: number;
    smoothness: number;
    poreVisibility: number;
    radiance: number;
  } {
    return {
      roughness: Math.max(10, 70 - improvement * 0.6),
      smoothness: Math.min(95, 30 + improvement * 0.65),
      poreVisibility: Math.max(5, concern === 'pores' ? 70 - improvement * 0.7 : 40 - improvement * 0.3),
      radiance: 40 + improvement * 0.5,
    };
  }

  /**
   * Estimate recovery timeline
   */
  static estimateRecoveryTimeline(program: ProgramDefinition): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const startDate = new Date();

    // Immediate effects
    events.push({
      date: startDate,
      event: 'Program session completed',
      type: 'session',
      importance: 'high',
      details: `Downtime: ${program.downtime} days expected`,
    });

    // Downtime period
    if (program.downtime > 0) {
      const downtimeEnd = new Date(startDate);
      downtimeEnd.setDate(downtimeEnd.getDate() + program.downtime);
      events.push({
        date: downtimeEnd,
        event: 'Downtime period ends',
        type: 'recovery',
        importance: 'high',
        details: 'Can resume normal activities',
      });
    }

    // Recovery period
    if (program.recovery > 0) {
      const recoveryEnd = new Date(startDate);
      recoveryEnd.setDate(recoveryEnd.getDate() + program.recovery);
      events.push({
        date: recoveryEnd,
        event: 'Full recovery',
        type: 'recovery',
        importance: 'medium',
        details: 'Skin barrier fully restored',
      });
    }

    // Delayed results
    for (const effect of program.effects) {
      if (effect.delayedResult) {
        const resultDate = new Date(startDate);
        resultDate.setDate(resultDate.getDate() + effect.delayDays);
        events.push({
          date: resultDate,
          event: `Visible improvement in ${effect.concern}`,
          type: 'results',
          importance: 'high',
          details: `Expected improvement: ${effect.improvement}%`,
        });
      }
    }

    // Peak results
    const peakDate = new Date(startDate);
    peakDate.setDate(peakDate.getDate() + program.recovery + 14);
    events.push({
      date: peakDate,
      event: 'Peak results achieved',
      type: 'results',
      importance: 'high',
      details: 'Maximum skin improvement visible',
    });

    // Maintenance recommendation
    const maintenanceDate = new Date(startDate);
    maintenanceDate.setDate(maintenanceDate.getDate() + program.recovery + 90);
    events.push({
      date: maintenanceDate,
      event: 'Maintenance session recommended',
      type: 'maintenance',
      importance: 'medium',
      details: 'Consider follow-up program for sustained results',
    });

    return events;
  }
}
