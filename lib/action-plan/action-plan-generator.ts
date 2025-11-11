/**
 * Action Plan Generator
 * Generates personalized skincare action plans based on analysis results
 */

import type {
  HybridSkinAnalysis,
  SkinConcern,
} from '@/lib/types/skin-analysis';
import type {
  InteractiveConcern,
  ConcernType,
  ConcernEducation,
} from '@/lib/concerns/concern-education';
import {
  getPriorityConcerns,
  getTreatmentRecommendations,
  getSeverityLevel,
} from '@/lib/concerns/concern-education';

export type ActionPriority = 'immediate' | 'short-term' | 'long-term';
export type ActionCategory = 'daily' | 'weekly' | 'monthly' | 'professional' | 'lifestyle';
export type ActionStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: ActionCategory;
  priority: ActionPriority;
  concernTypes: ConcernType[];
  estimatedDuration?: string; // e.g., "2 weeks", "3 months"
  frequency?: string; // e.g., "twice daily", "weekly"
  cost?: {
    min: number;
    max: number;
    currency: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  status: ActionStatus;
  startDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface ActionPlanSection {
  priority: ActionPriority;
  title: string;
  description: string;
  actions: ActionItem[];
  estimatedTimeframe: string;
}

export interface PersonalizedActionPlan {
  id: string;
  userId: string;
  analysisId: string;
  createdAt: string;
  updatedAt: string;
  skinHealthScore: number;
  primaryConcerns: ConcernType[];
  sections: ActionPlanSection[];
  totalActions: number;
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  progressPercentage: number;
}

export interface ActionPlanPreferences {
  budget?: 'low' | 'medium' | 'high';
  timeCommitment?: 'minimal' | 'moderate' | 'intensive';
  professionalTreatments?: boolean;
  naturalProducts?: boolean;
  skinType?: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  allergies?: string[];
  currentRoutine?: {
    morning: string[];
    evening: string[];
  };
}

export class ActionPlanGenerator {
  private concerns: InteractiveConcern[];
  private preferences: ActionPlanPreferences;
  private actionIdCounter = 0;

  constructor(concerns: InteractiveConcern[], preferences: ActionPlanPreferences = {}) {
    this.concerns = concerns;
    this.preferences = preferences;
  }

  /**
   * Generate complete personalized action plan
   */
  generatePlan(userId: string, analysisId: string, skinHealthScore: number): PersonalizedActionPlan {
    const priorityConcerns = getPriorityConcerns(this.concerns, 5);
    const primaryConcernTypes = priorityConcerns.map(c => c.type);

    // Generate sections for each priority level
    const immediateSection = this.generateImmediateActions(priorityConcerns);
    const shortTermSection = this.generateShortTermActions(priorityConcerns);
    const longTermSection = this.generateLongTermActions(priorityConcerns);

    const sections = [immediateSection, shortTermSection, longTermSection];
    const totalActions = sections.reduce((sum, section) => sum + section.actions.length, 0);
    const estimatedCost = this.calculateTotalCost(sections);

    return {
      id: `plan_${Date.now()}`,
      userId,
      analysisId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      skinHealthScore,
      primaryConcerns: primaryConcernTypes,
      sections,
      totalActions,
      estimatedCost,
      progressPercentage: 0,
    };
  }

  /**
   * Generate immediate actions (next 1-2 weeks)
   */
  private generateImmediateActions(concerns: InteractiveConcern[]): ActionPlanSection {
    const actions: ActionItem[] = [];

    // Add sun protection (always priority)
    actions.push(this.createAction({
      title: 'Start Daily Sunscreen',
      description: 'Apply broad-spectrum SPF 50 every morning as the final step in your routine. Reapply every 2 hours if outdoors.',
      category: 'daily',
      priority: 'immediate',
      concernTypes: ['dark_spots', 'wrinkles', 'fine_lines'],
      frequency: 'daily',
      cost: { min: 15, max: 40, currency: 'USD' },
      difficulty: 'easy',
    }));

    // Add basic cleansing routine
    actions.push(this.createAction({
      title: 'Establish Cleansing Routine',
      description: 'Cleanse face twice daily with a gentle cleanser suitable for your skin type. Remove makeup thoroughly before bed.',
      category: 'daily',
      priority: 'immediate',
      concernTypes: ['acne', 'blackheads', 'texture'],
      frequency: 'twice daily',
      cost: { min: 10, max: 30, currency: 'USD' },
      difficulty: 'easy',
    }));

    // Add moisturizer
    actions.push(this.createAction({
      title: 'Daily Moisturization',
      description: 'Apply moisturizer morning and evening to maintain skin barrier. Choose oil-free if oily, richer if dry.',
      category: 'daily',
      priority: 'immediate',
      concernTypes: ['dullness', 'texture', 'fine_lines'],
      frequency: 'twice daily',
      cost: { min: 15, max: 50, currency: 'USD' },
      difficulty: 'easy',
    }));

    // Add concern-specific immediate actions
    concerns.slice(0, 2).forEach(concern => {
      const concernActions = this.getImmediateActionsForConcern(concern);
      actions.push(...concernActions);
    });

    // Lifestyle actions
    actions.push(this.createAction({
      title: 'Hydration Boost',
      description: 'Drink 8-10 glasses of water daily. Keep a water bottle with you as a reminder.',
      category: 'lifestyle',
      priority: 'immediate',
      concernTypes: ['dullness', 'fine_lines', 'texture'],
      frequency: 'daily',
      cost: { min: 0, max: 5, currency: 'USD' },
      difficulty: 'easy',
    }));

    return {
      priority: 'immediate',
      title: 'Immediate Actions',
      description: 'Essential steps to start within the next 1-2 weeks. These form the foundation of your skincare routine.',
      actions,
      estimatedTimeframe: '1-2 weeks',
    };
  }

  /**
   * Generate short-term actions (1-3 months)
   */
  private generateShortTermActions(concerns: InteractiveConcern[]): ActionPlanSection {
    const actions: ActionItem[] = [];

    // Add active ingredients based on concerns
    concerns.slice(0, 3).forEach(concern => {
      const concernActions = this.getShortTermActionsForConcern(concern);
      actions.push(...concernActions);
    });

    // Add exfoliation
    if (this.hasConcernType(['texture', 'acne', 'blackheads', 'dullness'])) {
      actions.push(this.createAction({
        title: 'Introduce Chemical Exfoliation',
        description: 'Start using AHA or BHA 2-3 times per week. Gradually increase frequency based on skin tolerance.',
        category: 'weekly',
        priority: 'short-term',
        concernTypes: ['texture', 'acne', 'blackheads', 'dullness'],
        frequency: '2-3 times weekly',
        estimatedDuration: '2-3 months',
        cost: { min: 20, max: 60, currency: 'USD' },
        difficulty: 'medium',
      }));
    }

    // Add retinol/retinoid
    if (this.hasConcernType(['wrinkles', 'fine_lines', 'texture', 'acne'])) {
      actions.push(this.createAction({
        title: 'Start Retinol Treatment',
        description: 'Introduce retinol 0.25-0.5% 2-3 nights per week. Gradually increase frequency over 4-6 weeks.',
        category: 'daily',
        priority: 'short-term',
        concernTypes: ['wrinkles', 'fine_lines', 'texture', 'acne'],
        frequency: '2-3 times weekly initially',
        estimatedDuration: '3 months',
        cost: { min: 25, max: 80, currency: 'USD' },
        difficulty: 'medium',
      }));
    }

    // Add vitamin C
    if (this.hasConcernType(['dark_spots', 'dullness', 'wrinkles'])) {
      actions.push(this.createAction({
        title: 'Add Vitamin C Serum',
        description: 'Apply vitamin C serum in the morning before sunscreen. Look for 10-20% L-ascorbic acid or stable derivatives.',
        category: 'daily',
        priority: 'short-term',
        concernTypes: ['dark_spots', 'dullness', 'wrinkles'],
        frequency: 'daily morning',
        estimatedDuration: '2-3 months',
        cost: { min: 20, max: 70, currency: 'USD' },
        difficulty: 'easy',
      }));
    }

    // Professional consultation
    const severeConcerns = concerns.filter(c => c.averageSeverity >= 7);
    if (severeConcerns.length > 0) {
      actions.push(this.createAction({
        title: 'Schedule Dermatologist Consultation',
        description: 'Book appointment with board-certified dermatologist to discuss prescription options and professional treatments.',
        category: 'professional',
        priority: 'short-term',
        concernTypes: severeConcerns.map(c => c.type),
        frequency: 'one-time',
        cost: { min: 100, max: 300, currency: 'USD' },
        difficulty: 'easy',
      }));
    }

    return {
      priority: 'short-term',
      title: 'Short-Term Goals',
      description: 'Actions to implement over the next 1-3 months. These address specific concerns with active ingredients.',
      actions,
      estimatedTimeframe: '1-3 months',
    };
  }

  /**
   * Generate long-term actions (3-12 months)
   */
  private generateLongTermActions(concerns: InteractiveConcern[]): ActionPlanSection {
    const actions: ActionItem[] = [];

    // Professional treatments
    if (this.preferences.professionalTreatments !== false) {
      concerns.slice(0, 3).forEach(concern => {
        const professionalActions = this.getProfessionalTreatments(concern);
        actions.push(...professionalActions);
      });
    }

    // Advanced home care
    if (this.hasConcernType(['wrinkles', 'fine_lines'])) {
      actions.push(this.createAction({
        title: 'Upgrade to Prescription Retinoid',
        description: 'Transition to prescription tretinoin 0.025-0.05% for enhanced anti-aging results. Requires dermatologist consultation.',
        category: 'daily',
        priority: 'long-term',
        concernTypes: ['wrinkles', 'fine_lines', 'texture'],
        frequency: 'nightly',
        estimatedDuration: '6-12 months',
        cost: { min: 30, max: 100, currency: 'USD' },
        difficulty: 'medium',
      }));
    }

    // Maintenance treatments
    actions.push(this.createAction({
      title: 'Regular Professional Facials',
      description: 'Schedule monthly facials for deep cleansing, extractions, and professional-grade treatments.',
      category: 'monthly',
      priority: 'long-term',
      concernTypes: ['blackheads', 'texture', 'dullness'],
      frequency: 'monthly',
      estimatedDuration: 'ongoing',
      cost: { min: 75, max: 150, currency: 'USD' },
      difficulty: 'easy',
    }));

    // Lifestyle optimization
    actions.push(this.createAction({
      title: 'Optimize Sleep & Stress',
      description: 'Maintain 7-9 hours sleep nightly. Practice stress management (meditation, exercise) for skin health.',
      category: 'lifestyle',
      priority: 'long-term',
      concernTypes: ['dullness', 'acne', 'redness'],
      frequency: 'daily',
      estimatedDuration: 'ongoing',
      cost: { min: 0, max: 50, currency: 'USD' },
      difficulty: 'medium',
    }));

    // Diet optimization
    actions.push(this.createAction({
      title: 'Anti-Inflammatory Diet',
      description: 'Increase antioxidant-rich foods (berries, leafy greens). Limit sugar, dairy if problematic. Consider omega-3 supplements.',
      category: 'lifestyle',
      priority: 'long-term',
      concernTypes: ['acne', 'redness', 'dullness'],
      frequency: 'daily',
      estimatedDuration: 'ongoing',
      cost: { min: 20, max: 100, currency: 'USD' },
      difficulty: 'medium',
    }));

    return {
      priority: 'long-term',
      title: 'Long-Term Goals',
      description: 'Advanced treatments and lifestyle changes for sustained improvement over 3-12 months.',
      actions,
      estimatedTimeframe: '3-12 months',
    };
  }

  /**
   * Get immediate actions for specific concern
   */
  private getImmediateActionsForConcern(concern: InteractiveConcern): ActionItem[] {
    const actions: ActionItem[] = [];
    const severity = getSeverityLevel(concern.averageSeverity);

    switch (concern.type) {
      case 'acne':
        actions.push(this.createAction({
          title: 'Spot Treatment for Acne',
          description: 'Apply benzoyl peroxide 2.5-5% or salicylic acid spot treatment to active breakouts.',
          category: 'daily',
          priority: 'immediate',
          concernTypes: ['acne'],
          frequency: '1-2 times daily',
          cost: { min: 8, max: 20, currency: 'USD' },
          difficulty: 'easy',
        }));
        break;

      case 'redness':
        actions.push(this.createAction({
          title: 'Soothing Skincare',
          description: 'Use fragrance-free, gentle products with calming ingredients (centella, niacinamide). Avoid hot water.',
          category: 'daily',
          priority: 'immediate',
          concernTypes: ['redness'],
          frequency: 'twice daily',
          cost: { min: 15, max: 40, currency: 'USD' },
          difficulty: 'easy',
        }));
        break;

      case 'dark_spots':
        actions.push(this.createAction({
          title: 'Strict Sun Protection',
          description: 'Essential for preventing dark spots from worsening. Use SPF 50+, reapply every 2 hours, wear hat outdoors.',
          category: 'daily',
          priority: 'immediate',
          concernTypes: ['dark_spots'],
          frequency: 'daily',
          cost: { min: 15, max: 40, currency: 'USD' },
          difficulty: 'easy',
        }));
        break;
    }

    return actions;
  }

  /**
   * Get short-term actions for specific concern
   */
  private getShortTermActionsForConcern(concern: InteractiveConcern): ActionItem[] {
    const actions: ActionItem[] = [];

    switch (concern.type) {
      case 'dark_spots':
        actions.push(this.createAction({
          title: 'Brightening Serum',
          description: 'Use serum with niacinamide 5-10%, alpha arbutin, or kojic acid. Apply morning and evening.',
          category: 'daily',
          priority: 'short-term',
          concernTypes: ['dark_spots'],
          frequency: 'twice daily',
          estimatedDuration: '2-3 months',
          cost: { min: 20, max: 60, currency: 'USD' },
          difficulty: 'easy',
        }));
        break;

      case 'large_pores':
        actions.push(this.createAction({
          title: 'Niacinamide for Pores',
          description: 'Apply niacinamide 5-10% serum daily to regulate oil and minimize pore appearance.',
          category: 'daily',
          priority: 'short-term',
          concernTypes: ['large_pores'],
          frequency: 'twice daily',
          estimatedDuration: '2-3 months',
          cost: { min: 15, max: 45, currency: 'USD' },
          difficulty: 'easy',
        }));
        break;

      case 'blackheads':
        actions.push(this.createAction({
          title: 'BHA Exfoliation',
          description: 'Use salicylic acid 2% (BHA) serum or toner nightly to unclog pores and prevent blackheads.',
          category: 'daily',
          priority: 'short-term',
          concernTypes: ['blackheads'],
          frequency: 'nightly',
          estimatedDuration: '2-3 months',
          cost: { min: 15, max: 50, currency: 'USD' },
          difficulty: 'easy',
        }));
        break;
    }

    return actions;
  }

  /**
   * Get professional treatment recommendations
   */
  private getProfessionalTreatments(concern: InteractiveConcern): ActionItem[] {
    const actions: ActionItem[] = [];

    if (concern.averageSeverity < 6) return actions; // Only recommend for moderate-severe

    switch (concern.type) {
      case 'wrinkles':
      case 'fine_lines':
        if (this.preferences.budget !== 'low') {
          actions.push(this.createAction({
            title: 'Botox Treatment',
            description: 'Consider Botox for dynamic wrinkles in forehead, frown lines, and crow\'s feet. Results last 3-4 months.',
            category: 'professional',
            priority: 'long-term',
            concernTypes: ['wrinkles', 'fine_lines'],
            frequency: 'every 3-4 months',
            cost: { min: 300, max: 800, currency: 'USD' },
            difficulty: 'easy',
          }));
        }
        break;

      case 'dark_spots':
        actions.push(this.createAction({
          title: 'Chemical Peel Series',
          description: 'Series of 3-6 chemical peels (glycolic, TCA) every 2-4 weeks for significant pigmentation improvement.',
          category: 'professional',
          priority: 'long-term',
          concernTypes: ['dark_spots', 'texture'],
          frequency: 'series of 3-6',
          estimatedDuration: '3-6 months',
          cost: { min: 450, max: 1500, currency: 'USD' },
          difficulty: 'medium',
        }));
        break;

      case 'texture':
        actions.push(this.createAction({
          title: 'Microneedling Series',
          description: 'Professional microneedling 4-6 sessions to improve texture, scars, and boost collagen production.',
          category: 'professional',
          priority: 'long-term',
          concernTypes: ['texture', 'wrinkles'],
          frequency: 'series of 4-6',
          estimatedDuration: '4-6 months',
          cost: { min: 800, max: 2400, currency: 'USD' },
          difficulty: 'medium',
        }));
        break;

      case 'large_pores':
        actions.push(this.createAction({
          title: 'Laser Treatment',
          description: 'Fractional laser or IPL to reduce pore size and improve skin texture. Requires consultation.',
          category: 'professional',
          priority: 'long-term',
          concernTypes: ['large_pores', 'texture'],
          frequency: '3-5 sessions',
          estimatedDuration: '3-6 months',
          cost: { min: 1000, max: 3000, currency: 'USD' },
          difficulty: 'medium',
        }));
        break;

      case 'redness':
        actions.push(this.createAction({
          title: 'V-Beam Laser',
          description: 'Pulsed dye laser (V-Beam) for redness and broken capillaries. 3-5 sessions for best results.',
          category: 'professional',
          priority: 'long-term',
          concernTypes: ['redness'],
          frequency: '3-5 sessions',
          estimatedDuration: '4-6 months',
          cost: { min: 1200, max: 4000, currency: 'USD' },
          difficulty: 'medium',
        }));
        break;
    }

    return actions;
  }

  /**
   * Helper: Create action item
   */
  private createAction(params: Omit<ActionItem, 'id' | 'status'>): ActionItem {
    return {
      id: `action_${this.actionIdCounter++}`,
      status: 'not-started',
      ...params,
    };
  }

  /**
   * Helper: Check if any concern matches types
   */
  private hasConcernType(types: ConcernType[]): boolean {
    return this.concerns.some(c => types.includes(c.type));
  }

  /**
   * Calculate total estimated cost
   */
  private calculateTotalCost(sections: ActionPlanSection[]): { min: number; max: number; currency: string } {
    let minTotal = 0;
    let maxTotal = 0;

    sections.forEach(section => {
      section.actions.forEach(action => {
        if (action.cost) {
          minTotal += action.cost.min;
          maxTotal += action.cost.max;
        }
      });
    });

    return {
      min: minTotal,
      max: maxTotal,
      currency: 'USD',
    };
  }
}

/**
 * Update action plan progress
 */
export function updateActionProgress(
  plan: PersonalizedActionPlan,
  actionId: string,
  status: ActionStatus,
  notes?: string
): PersonalizedActionPlan {
  const updatedPlan = { ...plan };

  updatedPlan.sections = updatedPlan.sections.map(section => ({
    ...section,
    actions: section.actions.map(action => {
      if (action.id === actionId) {
        return {
          ...action,
          status,
          notes,
          completedDate: status === 'completed' ? new Date().toISOString() : action.completedDate,
        };
      }
      return action;
    }),
  }));

  // Recalculate progress
  const totalActions = updatedPlan.totalActions;
  const completedActions = updatedPlan.sections.reduce(
    (sum, section) => sum + section.actions.filter(a => a.status === 'completed').length,
    0
  );
  updatedPlan.progressPercentage = Math.round((completedActions / totalActions) * 100);
  updatedPlan.updatedAt = new Date().toISOString();

  return updatedPlan;
}

/**
 * Get actions by status
 */
export function getActionsByStatus(
  plan: PersonalizedActionPlan,
  status: ActionStatus
): ActionItem[] {
  const actions: ActionItem[] = [];
  plan.sections.forEach(section => {
    actions.push(...section.actions.filter(a => a.status === status));
  });
  return actions;
}

/**
 * Get next recommended action
 */
export function getNextRecommendedAction(plan: PersonalizedActionPlan): ActionItem | null {
  // First check immediate priority
  for (const section of plan.sections) {
    if (section.priority === 'immediate') {
      const nextAction = section.actions.find(a => a.status === 'not-started');
      if (nextAction) return nextAction;
    }
  }

  // Then short-term
  for (const section of plan.sections) {
    if (section.priority === 'short-term') {
      const nextAction = section.actions.find(a => a.status === 'not-started');
      if (nextAction) return nextAction;
    }
  }

  // Finally long-term
  for (const section of plan.sections) {
    if (section.priority === 'long-term') {
      const nextAction = section.actions.find(a => a.status === 'not-started');
      if (nextAction) return nextAction;
    }
  }

  return null;
}
