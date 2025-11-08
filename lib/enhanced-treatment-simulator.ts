/**
 * Enhanced Treatment Simulator
 * Provides realistic skin treatment simulations with effects, combinations, and timeline preview
 */

export type TreatmentType =
  | 'laser'
  | 'chemical_peel'
  | 'microdermabrasion'
  | 'hydrafacial'
  | 'radiofrequency'
  | 'microneedling'
  | 'topical'
  | 'ipl'
  | 'led_therapy'
  | 'thread_lift'
  | 'botox'
  | 'filler';

export type SkinConcern = 'acne' | 'wrinkles' | 'redness' | 'texture' | 'pores' | 'pigmentation' | 'dryness' | 'oiliness' | 'sensitivity' | 'sagging';

export interface TreatmentEffect {
  concern: SkinConcern;
  improvement: number; // 0-100
  duration: number; // days
  immediateResult: boolean;
  delayedResult: boolean;
  delayDays: number;
}

export interface TreatmentDefinition {
  id: string;
  name: string;
  type: TreatmentType;
  description: string;
  effects: TreatmentEffect[];
  downtime: number; // days
  recovery: number; // days
  costRange: { min: number; max: number };
  suitableFor: string[]; // skin types
  risks: string[];
  sessionDuration: number; // minutes
  numberOfSessions: number;
  sessionSpacing: number; // days between sessions
  suitableForConcerns: SkinConcern[];
  realism: number; // 0-100, how realistic the visual effect is
  animation: {
    duration: number; // milliseconds
    intensity: number; // 0-100
    particles: boolean;
  };
}

export interface CombinedTreatmentPlan {
  treatments: TreatmentDefinition[];
  startDate: Date;
  duration: number; // days
  totalCost: number;
  expectedImprovement: { [key in SkinConcern]?: number };
  timeline: TimelineEvent[];
  synergies: string[]; // How treatments work together
  risks: string[];
}

export interface TimelineEvent {
  date: Date;
  event: string;
  type: 'session' | 'recovery' | 'result' | 'maintenance';
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

export class EnhancedTreatmentSimulator {
  private static readonly TREATMENT_LIBRARY: { [key: string]: TreatmentDefinition } = {
    laser_resurfacing: {
      id: 'laser_resurfacing',
      name: 'Laser Resurfacing',
      type: 'laser',
      description: 'Advanced fractional laser for skin resurfacing',
      effects: [
        { concern: 'wrinkles', improvement: 85, duration: 180, immediateResult: false, delayedResult: true, delayDays: 7 },
        { concern: 'texture', improvement: 80, duration: 180, immediateResult: false, delayedResult: true, delayDays: 7 },
        { concern: 'pigmentation', improvement: 75, duration: 180, immediateResult: false, delayedResult: true, delayDays: 7 },
        { concern: 'redness', improvement: -10, duration: 30, immediateResult: true, delayedResult: false, delayDays: 0 }, // Initial redness
      ],
      downtime: 7,
      recovery: 21,
      costRange: { min: 3000, max: 8000 },
      suitableFor: ['combination', 'oily', 'mature'],
      risks: ['temporary redness', 'hyperpigmentation', 'infection risk'],
      sessionDuration: 30,
      numberOfSessions: 3,
      sessionSpacing: 30,
      suitableForConcerns: ['wrinkles', 'texture', 'pigmentation'],
      realism: 95,
      animation: { duration: 3000, intensity: 85, particles: true },
    },
    chemical_peel_medium: {
      id: 'chemical_peel_medium',
      name: 'Medium Chemical Peel',
      type: 'chemical_peel',
      description: 'TCA or glycolic acid medium depth peel',
      effects: [
        { concern: 'acne', improvement: 60, duration: 120, immediateResult: false, delayedResult: true, delayDays: 3 },
        { concern: 'texture', improvement: 70, duration: 120, immediateResult: false, delayedResult: true, delayDays: 3 },
        { concern: 'redness', improvement: -20, duration: 14, immediateResult: true, delayedResult: false, delayDays: 0 },
        { concern: 'pigmentation', improvement: 55, duration: 120, immediateResult: false, delayedResult: true, delayDays: 5 },
      ],
      downtime: 5,
      recovery: 14,
      costRange: { min: 1500, max: 4000 },
      suitableFor: ['all'],
      risks: ['peeling', 'sensitivity', 'temporary darkness'],
      sessionDuration: 20,
      numberOfSessions: 4,
      sessionSpacing: 21,
      suitableForConcerns: ['acne', 'texture', 'pigmentation'],
      realism: 88,
      animation: { duration: 2500, intensity: 70, particles: true },
    },
    microneedling: {
      id: 'microneedling',
      name: 'Microneedling',
      type: 'microneedling',
      description: 'Collagen-inducing microneedling therapy',
      effects: [
        { concern: 'wrinkles', improvement: 65, duration: 90, immediateResult: false, delayedResult: true, delayDays: 14 },
        { concern: 'texture', improvement: 70, duration: 90, immediateResult: false, delayedResult: true, delayDays: 14 },
        { concern: 'pores', improvement: 60, duration: 90, immediateResult: false, delayedResult: true, delayDays: 14 },
        { concern: 'redness', improvement: -15, duration: 7, immediateResult: true, delayedResult: false, delayDays: 0 },
      ],
      downtime: 3,
      recovery: 7,
      costRange: { min: 1000, max: 3000 },
      suitableFor: ['all'],
      risks: ['minor bleeding', 'mild redness', 'sensitivity'],
      sessionDuration: 25,
      numberOfSessions: 6,
      sessionSpacing: 14,
      suitableForConcerns: ['wrinkles', 'texture', 'pores'],
      realism: 85,
      animation: { duration: 2000, intensity: 65, particles: true },
    },
    hydrafacial: {
      id: 'hydrafacial',
      name: 'HydraFacial',
      type: 'hydrafacial',
      description: 'Vortex fusion hydradermabrasion and hydration',
      effects: [
        { concern: 'texture', improvement: 50, duration: 21, immediateResult: true, delayedResult: false, delayDays: 0 },
        { concern: 'pores', improvement: 45, duration: 21, immediateResult: true, delayedResult: false, delayDays: 0 },
        { concern: 'dryness', improvement: 70, duration: 21, immediateResult: true, delayedResult: false, delayDays: 0 },
        { concern: 'redness', improvement: 30, duration: 21, immediateResult: true, delayedResult: false, delayDays: 0 },
      ],
      downtime: 0,
      recovery: 0,
      costRange: { min: 2500, max: 4000 },
      suitableFor: ['all'],
      risks: ['none'],
      sessionDuration: 30,
      numberOfSessions: 6,
      sessionSpacing: 14,
      suitableForConcerns: ['texture', 'pores', 'dryness'],
      realism: 80,
      animation: { duration: 1500, intensity: 60, particles: true },
    },
    radiofrequency: {
      id: 'radiofrequency',
      name: 'Radiofrequency Therapy',
      type: 'radiofrequency',
      description: 'Non-invasive collagen remodeling',
      effects: [
        { concern: 'wrinkles', improvement: 55, duration: 120, immediateResult: false, delayedResult: true, delayDays: 21 },
        { concern: 'sagging', improvement: 60, duration: 120, immediateResult: false, delayedResult: true, delayDays: 21 },
        { concern: 'texture', improvement: 50, duration: 120, immediateResult: false, delayedResult: true, delayDays: 21 },
      ],
      downtime: 0,
      recovery: 2,
      costRange: { min: 2000, max: 6000 },
      suitableFor: ['all'],
      risks: ['temporary warmth', 'minor redness'],
      sessionDuration: 40,
      numberOfSessions: 6,
      sessionSpacing: 14,
      suitableForConcerns: ['wrinkles', 'sagging', 'texture'],
      realism: 82,
      animation: { duration: 2500, intensity: 70, particles: false },
    },
    ipl_photofacial: {
      id: 'ipl_photofacial',
      name: 'IPL Photofacial',
      type: 'ipl',
      description: 'Intense pulsed light for pigmentation and redness',
      effects: [
        { concern: 'pigmentation', improvement: 80, duration: 90, immediateResult: false, delayedResult: true, delayDays: 7 },
        { concern: 'redness', improvement: 70, duration: 90, immediateResult: false, delayedResult: true, delayDays: 7 },
        { concern: 'acne', improvement: 50, duration: 90, immediateResult: false, delayedResult: true, delayDays: 7 },
      ],
      downtime: 2,
      recovery: 7,
      costRange: { min: 1500, max: 3500 },
      suitableFor: ['fair', 'medium'],
      risks: ['temporary darkening', 'mild blistering'],
      sessionDuration: 20,
      numberOfSessions: 4,
      sessionSpacing: 21,
      suitableForConcerns: ['pigmentation', 'redness', 'acne'],
      realism: 87,
      animation: { duration: 1800, intensity: 75, particles: true },
    },
    led_therapy: {
      id: 'led_therapy',
      name: 'LED Light Therapy',
      type: 'led_therapy',
      description: 'Non-invasive light-based skin rejuvenation',
      effects: [
        { concern: 'acne', improvement: 55, duration: 60, immediateResult: false, delayedResult: true, delayDays: 10 },
        { concern: 'redness', improvement: 60, duration: 60, immediateResult: false, delayedResult: true, delayDays: 10 },
        { concern: 'texture', improvement: 40, duration: 60, immediateResult: false, delayedResult: true, delayDays: 10 },
      ],
      downtime: 0,
      recovery: 0,
      costRange: { min: 500, max: 2000 },
      suitableFor: ['all'],
      risks: ['none'],
      sessionDuration: 20,
      numberOfSessions: 10,
      sessionSpacing: 7,
      suitableForConcerns: ['acne', 'redness', 'texture'],
      realism: 75,
      animation: { duration: 1000, intensity: 50, particles: true },
    },
  };

  /**
   * Simulate single treatment effect on skin
   */
  static simulateTreatmentEffect(
    treatment: TreatmentDefinition,
    durationMs: number = 5000
  ): SimulationFrame[] {
    const frames: SimulationFrame[] = [];
    const frameCount = 60; // 60 frames for smooth animation
    const frameDuration = durationMs / frameCount;

    for (let i = 0; i < frameCount; i++) {
      const progress = (i / frameCount) * 100;
      const timestamp = i * frameDuration;

      const effects: SimulationFrame['effects'] = {};
      for (const effect of treatment.effects) {
        const effectProgress = Math.min(100, progress * (100 / 80)); // Peak at 80%
        const easeOut = 1 - Math.pow(1 - effectProgress / 100, 3);

        effects[effect.concern] = {
          improvement: effect.improvement * easeOut,
          visibility: easeOut * 100,
          effectIntensity: easeOut * treatment.animation.intensity,
        };
      }

      // Calculate overlay changes
      const avgImprovement = Object.values(effects).reduce((sum, e) => sum + (e?.improvement || 0), 0) / treatment.effects.length;

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
   * Build treatment sessions timeline
   */
  private static buildTreatmentTimeline(
    treatment: TreatmentDefinition,
    startDate: Date
  ): { timeline: TimelineEvent[]; totalDays: number; endDate: Date } {
    const timeline: TimelineEvent[] = [];
    let totalDays = 0;
    let currentDate = new Date(startDate);

    const sessionSpacing = treatment.sessionSpacing;
    const totalSessionDays = (treatment.numberOfSessions - 1) * sessionSpacing + treatment.sessionDuration / 1440;
    const recoveryPeriod = treatment.recovery;

    for (let i = 0; i < treatment.numberOfSessions; i++) {
      const sessionDate = new Date(currentDate);
      sessionDate.setDate(sessionDate.getDate() + i * sessionSpacing);

      timeline.push({
        date: sessionDate,
        event: `${treatment.name} - Session ${i + 1}`,
        type: 'session',
        importance: i === 0 ? 'high' : 'medium',
        details: `Duration: ${treatment.sessionDuration} minutes`,
      });

      if (i === 0) {
        timeline.push({
          date: new Date(sessionDate),
          event: `Recovery period starts for ${treatment.name}`,
          type: 'recovery',
          importance: 'high',
          details: `Expected downtime: ${treatment.downtime} days`,
        });
      }
    }

    const sessionsEnd = new Date(currentDate);
    sessionsEnd.setDate(sessionsEnd.getDate() + (treatment.numberOfSessions - 1) * sessionSpacing);

    // Add results timeline
    for (const effect of treatment.effects) {
      if (effect.delayedResult) {
        const resultDate = new Date(sessionsEnd);
        resultDate.setDate(resultDate.getDate() + effect.delayDays);
        timeline.push({
          date: resultDate,
          event: `Visible improvement in ${effect.concern}`,
          type: 'result',
          importance: 'high',
          details: `Expected improvement: ${effect.improvement}%`,
        });
      }
    }

    totalDays = totalSessionDays + recoveryPeriod;
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + totalSessionDays + recoveryPeriod + 7);

    return { timeline, totalDays, endDate };
  }

  /**
   * Calculate expected improvements from treatments
   */
  private static calculateExpectedImprovements(
    treatments: TreatmentDefinition[]
  ): { [key in SkinConcern]?: number } {
    const expectedImprovement: { [key in SkinConcern]?: number } = {};
    for (const treatment of treatments) {
      for (const effect of treatment.effects) {
        if (!expectedImprovement[effect.concern]) {
          expectedImprovement[effect.concern] = 0;
        }
        expectedImprovement[effect.concern]! += effect.improvement * 0.3;
      }
    }
    return expectedImprovement;
  }

  /**
   * Create combined treatment plan
   */
  static createCombinedPlan(
    treatmentIds: string[],
    startDate: Date = new Date()
  ): CombinedTreatmentPlan {
    const treatments = treatmentIds
      .map((id) => this.TREATMENT_LIBRARY[id])
      .filter((t) => t !== undefined);

    if (treatments.length === 0) {
      throw new Error('No valid treatments found');
    }

    let totalDays = 0;
    const timeline: TimelineEvent[] = [];
    let currentDate = new Date(startDate);

    for (const treatment of treatments) {
      const { timeline: treatmentTimeline, totalDays: days, endDate } = this.buildTreatmentTimeline(treatment, currentDate);
      timeline.push(...treatmentTimeline);
      totalDays += days;
      currentDate = new Date(endDate);
    }

    const totalCost = treatments.reduce((sum, t) => sum + (t.costRange.max + t.costRange.min) / 2, 0);
    const expectedImprovement = this.calculateExpectedImprovements(treatments);
    const synergies = this.calculateSynergies(treatments);
    const risks = [...new Set(treatments.flatMap((t) => t.risks))];

    timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      treatments,
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
    plan: CombinedTreatmentPlan,
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
   * Get available treatments
   */
  static getTreatmentLibrary(): TreatmentDefinition[] {
    return Object.values(this.TREATMENT_LIBRARY);
  }

  /**
   * Get treatment by ID
   */
  static getTreatment(id: string): TreatmentDefinition | null {
    return this.TREATMENT_LIBRARY[id] || null;
  }

  /**
   * Find treatments for specific concerns
   */
  static findTreatmentsForConcerns(concerns: SkinConcern[]): TreatmentDefinition[] {
    return Object.values(this.TREATMENT_LIBRARY).filter((treatment) =>
      concerns.some((concern) => treatment.suitableForConcerns.includes(concern))
    );
  }

  /**
   * Calculate synergies between treatments
   */
  private static calculateSynergies(treatments: TreatmentDefinition[]): string[] {
    const synergies: string[] = [];

    // Laser + Microneedling: Enhanced collagen induction
    if (
      treatments.some((t) => t.type === 'laser') &&
      treatments.some((t) => t.type === 'microneedling')
    ) {
      synergies.push('Laser + Microneedling synergy enhances collagen production');
    }

    // Chemical Peel + LED: Faster recovery and enhanced results
    if (
      treatments.some((t) => t.type === 'chemical_peel') &&
      treatments.some((t) => t.type === 'led_therapy')
    ) {
      synergies.push('Chemical Peel + LED therapy accelerates healing');
    }

    // Radiofrequency + Microneedling: Comprehensive skin remodeling
    if (
      treatments.some((t) => t.type === 'radiofrequency') &&
      treatments.some((t) => t.type === 'microneedling')
    ) {
      synergies.push('Radiofrequency + Microneedling provides comprehensive skin remodeling');
    }

    // HydraFacial as maintenance between aggressive treatments
    if (
      treatments.some((t) => t.type === 'hydrafacial') &&
      treatments.some((t) => ['laser', 'chemical_peel'].includes(t.type))
    ) {
      synergies.push('HydraFacial maintenance enhances results of aggressive treatments');
    }

    // IPL + LED: Combined light therapy benefits
    if (
      treatments.some((t) => t.type === 'ipl') &&
      treatments.some((t) => t.type === 'led_therapy')
    ) {
      synergies.push('IPL + LED therapy provides comprehensive light-based treatment');
    }

    return synergies;
  }

  /**
   * Calculate particle effects based on treatment type
   */
  static getParticleEffect(treatmentType: TreatmentType): {
    particleSize: number;
    particleCount: number;
    particleColor: string;
    emissionRate: number;
  } {
    const effects: { [key in TreatmentType]: any } = {
      laser: { particleSize: 2, particleCount: 50, particleColor: '#ff6b6b', emissionRate: 100 },
      chemical_peel: { particleSize: 1.5, particleCount: 40, particleColor: '#ffd93d', emissionRate: 80 },
      microdermabrasion: { particleSize: 1, particleCount: 30, particleColor: '#a8d8ea', emissionRate: 60 },
      hydrafacial: { particleSize: 1.2, particleCount: 35, particleColor: '#00b4d8', emissionRate: 70 },
      radiofrequency: { particleSize: 1.8, particleCount: 20, particleColor: '#ff006e', emissionRate: 40 },
      microneedling: { particleSize: 0.8, particleCount: 25, particleColor: '#06ffa5', emissionRate: 50 },
      topical: { particleSize: 1, particleCount: 15, particleColor: '#88d8f6', emissionRate: 30 },
      ipl: { particleSize: 2, particleCount: 45, particleColor: '#f77f00', emissionRate: 90 },
      led_therapy: { particleSize: 1.5, particleCount: 20, particleColor: '#fcbf49', emissionRate: 60 },
      thread_lift: { particleSize: 2, particleCount: 25, particleColor: '#d62828', emissionRate: 50 },
      botox: { particleSize: 1.2, particleCount: 10, particleColor: '#eae2b7', emissionRate: 20 },
      filler: { particleSize: 1.5, particleCount: 15, particleColor: '#f4a261', emissionRate: 40 },
    };

    return effects[treatmentType];
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
  static estimateRecoveryTimeline(treatment: TreatmentDefinition): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const startDate = new Date();

    // Immediate effects
    events.push({
      date: startDate,
      event: 'Treatment session completed',
      type: 'session',
      importance: 'high',
      details: `Downtime: ${treatment.downtime} days expected`,
    });

    // Downtime period
    if (treatment.downtime > 0) {
      const downtimeEnd = new Date(startDate);
      downtimeEnd.setDate(downtimeEnd.getDate() + treatment.downtime);
      events.push({
        date: downtimeEnd,
        event: 'Downtime period ends',
        type: 'recovery',
        importance: 'high',
        details: 'Can resume normal activities',
      });
    }

    // Recovery period
    if (treatment.recovery > 0) {
      const recoveryEnd = new Date(startDate);
      recoveryEnd.setDate(recoveryEnd.getDate() + treatment.recovery);
      events.push({
        date: recoveryEnd,
        event: 'Full recovery',
        type: 'recovery',
        importance: 'medium',
        details: 'Skin barrier fully restored',
      });
    }

    // Delayed results
    for (const effect of treatment.effects) {
      if (effect.delayedResult) {
        const resultDate = new Date(startDate);
        resultDate.setDate(resultDate.getDate() + effect.delayDays);
        events.push({
          date: resultDate,
          event: `Visible improvement in ${effect.concern}`,
          type: 'result',
          importance: 'high',
          details: `Expected improvement: ${effect.improvement}%`,
        });
      }
    }

    // Peak results
    const peakDate = new Date(startDate);
    peakDate.setDate(peakDate.getDate() + treatment.recovery + 14);
    events.push({
      date: peakDate,
      event: 'Peak results achieved',
      type: 'result',
      importance: 'high',
      details: 'Maximum skin improvement visible',
    });

    // Maintenance recommendation
    const maintenanceDate = new Date(startDate);
    maintenanceDate.setDate(maintenanceDate.getDate() + treatment.recovery + 90);
    events.push({
      date: maintenanceDate,
      event: 'Maintenance session recommended',
      type: 'maintenance',
      importance: 'medium',
      details: 'Consider follow-up treatment for sustained results',
    });

    return events;
  }
}
