/**
 * AI-Powered Program Recommendation System
 * Analyzes skin metrics and program history to suggest personalized programs
 */

import { EnhancedMetricsResult } from './enhanced-skin-metrics';

// Program types available in the system
export enum ProgramType {
  LASER = 'laser',
  CHEMICAL_PEEL = 'chemical_peel',
  MICRONEEDLING = 'microneedling',
  BOTOX = 'botox',
  FILLER = 'filler',
  HYDRAFACIAL = 'hydrafacial',
  IPL = 'ipl',
  RF_PROGRAM = 'rf_program',
  LED_THERAPY = 'led_therapy',
  DERMABRASION = 'dermabrasion',
  TOPICAL = 'topical',
  SKINCARE_ROUTINE = 'skincare_routine',
}

// Program categories for grouping
export enum ProgramCategory {
  RESURFACING = 'resurfacing',
  ANTI_AGING = 'anti_aging',
  PIGMENTATION = 'pigmentation',
  TEXTURE = 'texture',
  HYDRATION = 'hydration',
  PREVENTIVE = 'preventive',
}

// Severity levels for skin concerns
export enum SeverityLevel {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
}

// Program recommendation with detailed information
export interface ProgramRecommendation {
  id: string;
  type: ProgramType;
  category: ProgramCategory;
  name: string;
  description: string;
  targetMetrics: string[]; // Which metrics this program addresses
  priority: number; // 1-10, higher = more important
  confidence: number; // 0-1, AI confidence in this recommendation
  reasoning: string; // Why this program is recommended
  expectedResults: {
    metric: string;
    improvement: string;
    timeframe: string;
  }[];
  contraindications: string[];
  sideEffects: string[];
  cost: {
    min: number;
    max: number;
    currency: string;
  };
  sessions: {
    recommended: number;
    interval: string; // e.g., "2 weeks"
  };
  downtime: string;
  painLevel: number; // 1-10
}

// Program history from database
export interface ProgramHistory {
  programType: ProgramType;
  date: Date;
  effectiveness: number; // 0-1, how effective it was
  sideEffects: string[];
  notes?: string;
}

// User profile for personalized recommendations
export interface UserProfile {
  age: number;
  skinType: string; // oily, dry, combination, sensitive, normal
  allergies: string[];
  medications: string[];
  previousPrograms: ProgramHistory[];
  budget?: {
    min: number;
    max: number;
  };
  downtimePreference: 'none' | 'minimal' | 'flexible';
}

// Recommendation request
export interface RecommendationRequest {
  metrics: EnhancedMetricsResult;
  userProfile?: UserProfile;
  previousAnalysis?: EnhancedMetricsResult; // For progress tracking
  preferences?: {
    categories?: ProgramCategory[];
    maxCost?: number;
    maxDowntime?: string;
  };
}

// Recommendation response
export interface RecommendationResponse {
  recommendations: ProgramRecommendation[];
  summary: {
    primaryConcerns: string[];
    recommendedPlan: string;
    estimatedCost: { min: number; max: number };
    estimatedDuration: string;
  };
  timestamp: Date;
}

/**
 * AI-powered program recommendation engine
 */
export class ProgramRecommender {
  private programDatabase: Map<ProgramType, Partial<ProgramRecommendation>>;

  constructor() {
    this.programDatabase = this.initializeProgramDatabase();
  }

  /**
   * Initialize the program database with predefined programs
   */
  private initializeProgramDatabase(): Map<ProgramType, Partial<ProgramRecommendation>> {
    const db = new Map<ProgramType, Partial<ProgramRecommendation>>();

    db.set(ProgramType.LASER, {
      type: ProgramType.LASER,
      category: ProgramCategory.PIGMENTATION,
      name: 'Laser Program',
      description: 'Advanced laser therapy for pigmentation, spots, and skin resurfacing',
      targetMetrics: ['spots', 'pigmentation', 'texture'],
      contraindications: ['Active acne', 'Recent sun exposure', 'Pregnancy'],
      sideEffects: ['Temporary redness', 'Mild swelling', 'Sensitivity'],
      cost: { min: 5000, max: 15000, currency: 'THB' },
      sessions: { recommended: 3, interval: '4 weeks' },
      downtime: '3-5 days',
      painLevel: 4,
    });

    db.set(ProgramType.CHEMICAL_PEEL, {
      type: ProgramType.CHEMICAL_PEEL,
      category: ProgramCategory.RESURFACING,
      name: 'Chemical Peel',
      description: 'Exfoliation program to improve texture, tone, and reduce fine lines',
      targetMetrics: ['texture', 'spots', 'pores', 'wrinkles'],
      contraindications: ['Active infections', 'Isotretinoin use', 'Recent waxing'],
      sideEffects: ['Peeling', 'Redness', 'Temporary darkening'],
      cost: { min: 2000, max: 8000, currency: 'THB' },
      sessions: { recommended: 4, interval: '3 weeks' },
      downtime: '5-7 days',
      painLevel: 3,
    });

    db.set(ProgramType.MICRONEEDLING, {
      type: ProgramType.MICRONEEDLING,
      category: ProgramCategory.TEXTURE,
      name: 'Microneedling',
      description: 'Collagen induction therapy for scars, wrinkles, and texture improvement',
      targetMetrics: ['wrinkles', 'texture', 'elasticity', 'pores'],
      contraindications: ['Active acne', 'Keloid history', 'Blood disorders'],
      sideEffects: ['Redness', 'Minor bleeding', 'Sensitivity'],
      cost: { min: 3000, max: 10000, currency: 'THB' },
      sessions: { recommended: 4, interval: '4 weeks' },
      downtime: '2-3 days',
      painLevel: 5,
    });

    db.set(ProgramType.BOTOX, {
      type: ProgramType.BOTOX,
      category: ProgramCategory.ANTI_AGING,
      name: 'Botulinum Toxin (Botox)',
      description: 'Muscle relaxant to reduce dynamic wrinkles and prevent new lines',
      targetMetrics: ['wrinkles', 'elasticity'],
      contraindications: ['Pregnancy', 'Neuromuscular disorders', 'Allergies to albumin'],
      sideEffects: ['Bruising', 'Headache', 'Temporary drooping'],
      cost: { min: 4000, max: 12000, currency: 'THB' },
      sessions: { recommended: 1, interval: '4 months' },
      downtime: 'None',
      painLevel: 2,
    });

    db.set(ProgramType.FILLER, {
      type: ProgramType.FILLER,
      category: ProgramCategory.ANTI_AGING,
      name: 'Dermal Filler',
      description: 'Hyaluronic acid injection to restore volume and reduce deep wrinkles',
      targetMetrics: ['wrinkles', 'elasticity', 'hydration'],
      contraindications: ['Active infections', 'Autoimmune diseases', 'Bleeding disorders'],
      sideEffects: ['Swelling', 'Bruising', 'Lumps'],
      cost: { min: 8000, max: 25000, currency: 'THB' },
      sessions: { recommended: 1, interval: '9 months' },
      downtime: '1-2 days',
      painLevel: 3,
    });

    db.set(ProgramType.HYDRAFACIAL, {
      type: ProgramType.HYDRAFACIAL,
      category: ProgramCategory.HYDRATION,
      name: 'HydraFacial',
      description: 'Multi-step program for cleansing, exfoliation, and hydration',
      targetMetrics: ['hydration', 'texture', 'pores', 'redness'],
      contraindications: ['Active rash', 'Severe sunburn'],
      sideEffects: ['Minimal redness (temporary)'],
      cost: { min: 2500, max: 6000, currency: 'THB' },
      sessions: { recommended: 6, interval: '2 weeks' },
      downtime: 'None',
      painLevel: 1,
    });

    db.set(ProgramType.IPL, {
      type: ProgramType.IPL,
      category: ProgramCategory.PIGMENTATION,
      name: 'IPL (Intense Pulsed Light)',
      description: 'Light therapy for pigmentation, redness, and overall skin tone',
      targetMetrics: ['spots', 'redness', 'skinTone'],
      contraindications: ['Tanned skin', 'Photosensitivity', 'Dark skin types'],
      sideEffects: ['Temporary darkening', 'Swelling', 'Blistering (rare)'],
      cost: { min: 4000, max: 10000, currency: 'THB' },
      sessions: { recommended: 5, interval: '3 weeks' },
      downtime: '1-2 days',
      painLevel: 3,
    });

    db.set(ProgramType.RF_PROGRAM, {
      type: ProgramType.RF_PROGRAM,
      category: ProgramCategory.ANTI_AGING,
      name: 'Radiofrequency Program',
      description: 'RF energy to tighten skin and stimulate collagen production',
      targetMetrics: ['elasticity', 'wrinkles', 'texture'],
      contraindications: ['Pregnancy', 'Metal implants', 'Pacemaker'],
      sideEffects: ['Redness', 'Mild swelling'],
      cost: { min: 5000, max: 15000, currency: 'THB' },
      sessions: { recommended: 6, interval: '2 weeks' },
      downtime: 'None',
      painLevel: 2,
    });

    db.set(ProgramType.LED_THERAPY, {
      type: ProgramType.LED_THERAPY,
      category: ProgramCategory.PREVENTIVE,
      name: 'LED Light Therapy',
      description: 'Non-invasive light program for various skin concerns',
      targetMetrics: ['redness', 'hydration', 'texture'],
      contraindications: ['Photosensitivity', 'Epilepsy'],
      sideEffects: ['None'],
      cost: { min: 1000, max: 3000, currency: 'THB' },
      sessions: { recommended: 12, interval: '1 week' },
      downtime: 'None',
      painLevel: 1,
    });

    db.set(ProgramType.SKINCARE_ROUTINE, {
      type: ProgramType.SKINCARE_ROUTINE,
      category: ProgramCategory.PREVENTIVE,
      name: 'Medical-Grade Skincare',
      description: 'Customized topical program routine for daily use',
      targetMetrics: ['hydration', 'texture', 'spots', 'redness'],
      contraindications: ['Allergies to specific ingredients'],
      sideEffects: ['Initial purging', 'Dryness'],
      cost: { min: 2000, max: 8000, currency: 'THB' },
      sessions: { recommended: 1, interval: 'Daily' },
      downtime: 'None',
      painLevel: 0,
    });

    return db;
  }

  /**
   * Analyze skin metrics to determine severity of concerns
   */
  private analyzeConcernSeverity(metrics: EnhancedMetricsResult): Map<string, SeverityLevel> {
    const concerns = new Map<string, SeverityLevel>();

    // Analyze each metric (scores are 0-100, higher is better)
    if (metrics.spots.score < 50) {
      concerns.set('spots', metrics.spots.score < 30 ? SeverityLevel.SEVERE : SeverityLevel.MODERATE);
    } else if (metrics.spots.score < 70) {
      concerns.set('spots', SeverityLevel.MILD);
    }

    if (metrics.pores.score < 50) {
      concerns.set('pores', metrics.pores.score < 30 ? SeverityLevel.SEVERE : SeverityLevel.MODERATE);
    } else if (metrics.pores.score < 70) {
      concerns.set('pores', SeverityLevel.MILD);
    }

    if (metrics.wrinkles.score < 50) {
      concerns.set('wrinkles', metrics.wrinkles.score < 30 ? SeverityLevel.SEVERE : SeverityLevel.MODERATE);
    } else if (metrics.wrinkles.score < 70) {
      concerns.set('wrinkles', SeverityLevel.MILD);
    }

    if (metrics.texture.score < 50) {
      concerns.set('texture', metrics.texture.score < 30 ? SeverityLevel.SEVERE : SeverityLevel.MODERATE);
    } else if (metrics.texture.score < 70) {
      concerns.set('texture', SeverityLevel.MILD);
    }

    if (metrics.redness.score < 50) {
      concerns.set('redness', metrics.redness.score < 30 ? SeverityLevel.SEVERE : SeverityLevel.MODERATE);
    } else if (metrics.redness.score < 70) {
      concerns.set('redness', SeverityLevel.MILD);
    }

    if (metrics.hydration.score < 50) {
      concerns.set('hydration', metrics.hydration.score < 30 ? SeverityLevel.SEVERE : SeverityLevel.MODERATE);
    } else if (metrics.hydration.score < 70) {
      concerns.set('hydration', SeverityLevel.MILD);
    }

    if (metrics.elasticity.score < 50) {
      concerns.set('elasticity', metrics.elasticity.score < 30 ? SeverityLevel.SEVERE : SeverityLevel.MODERATE);
    } else if (metrics.elasticity.score < 70) {
      concerns.set('elasticity', SeverityLevel.MILD);
    }

    return concerns;
  }

  /**
   * Calculate priority score for a program based on metrics and concerns
   */
  private calculatePriority(
    program: Partial<ProgramRecommendation>,
    metrics: EnhancedMetricsResult,
    concerns: Map<string, SeverityLevel>
  ): number {
    let priority = 0;
    let matchCount = 0;

    // Check how well program targets the user's concerns
    program.targetMetrics?.forEach(metric => {
      const metricValue = (metrics as any)[metric]?.score || 0;
      const severity = concerns.get(metric);

      if (severity) {
        matchCount++;
        // Higher priority for severe concerns
        if (severity === SeverityLevel.SEVERE) {
          priority += 10 * (100 - metricValue) / 100;
        } else if (severity === SeverityLevel.MODERATE) {
          priority += 7 * (100 - metricValue) / 100;
        } else {
          priority += 4 * (100 - metricValue) / 100;
        }
      }
    });

    // Normalize by match count
    if (matchCount > 0) {
      priority = priority / matchCount;
    }

    return Math.min(10, Math.max(1, priority));
  }

  /**
   * Calculate confidence score for a recommendation
   */
  private calculateConfidence(
    program: Partial<ProgramRecommendation>,
    metrics: EnhancedMetricsResult,
    userProfile?: UserProfile
  ): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence if we have good metric confidence
    const avgMetricConfidence = program.targetMetrics?.reduce((sum, metric) => {
      return sum + ((metrics as any)[metric]?.confidence || 0);
    }, 0) || 0;
    const metricConfidenceBonus = (avgMetricConfidence / (program.targetMetrics?.length || 1)) * 0.2;
    confidence += metricConfidenceBonus;

    // Increase confidence if we have user history
    if (userProfile?.previousPrograms && userProfile.previousPrograms.length > 0) {
      const similarProgram = userProfile.previousPrograms.find(
        t => t.programType === program.type
      );
      if (similarProgram) {
        // If program was effective before, increase confidence
        confidence += similarProgram.effectiveness * 0.15;
      }
    }

    // Decrease confidence if contraindications match user profile
    if (userProfile?.medications && program.contraindications) {
      const hasContraindication = program.contraindications.some(contra =>
        userProfile.medications.some(med => 
          contra.toLowerCase().includes(med.toLowerCase())
        )
      );
      if (hasContraindication) {
        confidence -= 0.3;
      }
    }

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Generate reasoning for why program is recommended
   */
  private generateReasoning(
    program: Partial<ProgramRecommendation>,
    metrics: EnhancedMetricsResult,
    concerns: Map<string, SeverityLevel>
  ): string {
    const reasons: string[] = [];

    program.targetMetrics?.forEach(metric => {
      const severity = concerns.get(metric);
      const score = (metrics as any)[metric]?.score || 0;

      if (severity === SeverityLevel.SEVERE) {
        reasons.push(`คุณมีปัญหา${metric}ในระดับรุนแรง (คะแนน ${score.toFixed(1)})`);
      } else if (severity === SeverityLevel.MODERATE) {
        reasons.push(`คุณมีปัญหา${metric}ในระดับปานกลาง (คะแนน ${score.toFixed(1)})`);
      } else if (severity === SeverityLevel.MILD) {
        reasons.push(`การเข้าโปรแกรมจะช่วยป้องกันปัญหา${metric}ที่อาจเกิดขึ้น`);
      }
    });

    return reasons.join(', ');
  }

  /**
   * Generate expected results for program
   */
  private generateExpectedResults(
    program: Partial<ProgramRecommendation>,
    metrics: EnhancedMetricsResult
  ): { metric: string; improvement: string; timeframe: string }[] {
    const results: { metric: string; improvement: string; timeframe: string }[] = [];

    program.targetMetrics?.forEach(metric => {
      const currentScore = (metrics as any)[metric]?.score || 0;
      const potentialImprovement = Math.min(30, 100 - currentScore);
      
      results.push({
        metric,
        improvement: `+${potentialImprovement.toFixed(0)}%`,
        timeframe: `${program.sessions?.recommended || 1} sessions (${
          parseInt(program.sessions?.interval || '0') * (program.sessions?.recommended || 1)
        } weeks)`,
      });
    });

    return results;
  }

  /**
   * Filter programs based on user preferences and profile
   */
  private filterPrograms(
    programs: ProgramRecommendation[],
    request: RecommendationRequest
  ): ProgramRecommendation[] {
    let filtered = [...programs];

    // Filter by budget
    if (request.preferences?.maxCost) {
      filtered = filtered.filter(t => t.cost.min <= request.preferences!.maxCost!);
    }

    if (request.userProfile?.budget) {
      filtered = filtered.filter(
        t => t.cost.min >= request.userProfile!.budget!.min &&
           t.cost.max <= request.userProfile!.budget!.max
      );
    }

    // Filter by downtime preference
    if (request.userProfile?.downtimePreference === 'none') {
      filtered = filtered.filter(t => t.downtime.toLowerCase() === 'none');
    } else if (request.userProfile?.downtimePreference === 'minimal') {
      filtered = filtered.filter(t => 
        t.downtime.toLowerCase() === 'none' || 
        parseInt(t.downtime) <= 2
      );
    }

    // Filter by category preference
    if (request.preferences?.categories && request.preferences.categories.length > 0) {
      filtered = filtered.filter(t => 
        request.preferences!.categories!.includes(t.category)
      );
    }

    return filtered;
  }

  /**
   * Main method to generate program recommendations
   */
  public generateRecommendations(request: RecommendationRequest): RecommendationResponse {
    const { metrics, userProfile } = request;
    
    // Analyze concerns
    const concerns = this.analyzeConcernSeverity(metrics);
    
    // Generate recommendations for each program
    const recommendations: ProgramRecommendation[] = [];
    
    this.programDatabase.forEach((programData, type) => {
      const priority = this.calculatePriority(programData, metrics, concerns);
      const confidence = this.calculateConfidence(programData, metrics, userProfile);
      
      // Only recommend if priority is above threshold
      if (priority >= 3 && confidence >= 0.5) {
        const recommendation: ProgramRecommendation = {
          id: `rec_${type}_${Date.now()}`,
          type,
          category: programData.category!,
          name: programData.name!,
          description: programData.description!,
          targetMetrics: programData.targetMetrics!,
          priority,
          confidence,
          reasoning: this.generateReasoning(programData, metrics, concerns),
          expectedResults: this.generateExpectedResults(programData, metrics),
          contraindications: programData.contraindications!,
          sideEffects: programData.sideEffects!,
          cost: programData.cost!,
          sessions: programData.sessions!,
          downtime: programData.downtime!,
          painLevel: programData.painLevel!,
        };
        
        recommendations.push(recommendation);
      }
    });

    // Filter based on user preferences
    let filteredRecommendations = this.filterPrograms(recommendations, request);
    
    // Sort by priority (descending)
    filteredRecommendations.sort((a, b) => b.priority - a.priority);
    
    // Take top 5-8 recommendations
    filteredRecommendations = filteredRecommendations.slice(0, 8);
    
    // Generate summary
    const primaryConcerns = Array.from(concerns.entries())
      .filter(([_, severity]) => severity === SeverityLevel.SEVERE || severity === SeverityLevel.MODERATE)
      .map(([metric, _]) => metric);
    
    const totalCostMin = filteredRecommendations.reduce((sum, r) => sum + r.cost.min, 0);
    const totalCostMax = filteredRecommendations.reduce((sum, r) => sum + r.cost.max, 0);
    
    const maxDuration = Math.max(
      ...filteredRecommendations.map(r => 
        parseInt(r.sessions.interval) * r.sessions.recommended
      )
    );
    
    return {
      recommendations: filteredRecommendations,
      summary: {
        primaryConcerns,
        recommendedPlan: this.generateProgramPlan(filteredRecommendations),
        estimatedCost: { min: totalCostMin, max: totalCostMax },
        estimatedDuration: `${maxDuration} weeks`,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Generate a program plan summary
   */
  private generateProgramPlan(recommendations: ProgramRecommendation[]): string {
    if (recommendations.length === 0) {
      return 'ไม่พบคำแนะนำที่เหมาะสม';
    }

    const top3 = recommendations.slice(0, 3);
    const plan = top3.map((r, i) => 
      `${i + 1}. ${r.name} (${r.sessions.recommended} sessions)`
    ).join(', ');
    
    return `แผนงานที่แนะนำ: ${plan}`;
  }
}

// Export singleton instance
export const programRecommender = new ProgramRecommender();
