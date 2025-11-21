/**
 * Goal Setting and Achievement Tracking Engine
 * AI-powered system for customers to set skin improvement goals
 * and track progress toward those goals with milestone tracking
 */

import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis';

// Types for goal management
export type GoalParameter = 'spots' | 'pores' | 'wrinkles' | 'texture' | 'redness' | 'overall';
export type GoalStatus = 'active' | 'achieved' | 'abandoned' | 'paused';
export type GoalFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type ProgressTrend = 'accelerating' | 'steady' | 'slowing' | 'declining';

export interface GoalMilestone {
  id: string;
  name: string;
  targetValue: number;
  achievedAt?: Date;
  achieved: boolean;
  progress: number; // 0-100%
}

export interface SkinGoal {
  id: string;
  userId: string;
  parameter: GoalParameter;
  startDate: Date;
  targetDate: Date;
  currentValue: number;
  targetValue: number;
  baselineValue: number;
  status: GoalStatus;
  priority: PriorityLevel;
  rationale: string;
  milestones: GoalMilestone[];
  createdAt: Date;
  updatedAt: Date;
  estimatedCompletionDate?: Date;
  motivationalNotes?: string;
  treatmentPlan?: string[];
  completionPercentage: number;
}

export interface GoalAchievementResult {
  goalId: string;
  achieved: boolean;
  currentProgress: number;
  milestonesAchieved: number;
  estimatedDaysToGoal: number;
  progressTrend: ProgressTrend;
  nextMilestone?: GoalMilestone;
  motivationalMessage: string;
}

export interface GoalSuggestion {
  parameter: GoalParameter;
  reason: string;
  suggestedTarget: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  estimatedTimeframe: string;
  priority: PriorityLevel;
}

/**
 * Goal Setting Engine
 * Analyzes current skin condition and suggests achievable goals
 */
export class GoalSettingEngine {
  /**
   * Suggest goals based on current skin analysis
   */
  static suggestGoals(
    currentAnalysis: HybridSkinAnalysis,
    previousAnalysis?: HybridSkinAnalysis
  ): GoalSuggestion[] {
    const suggestions: GoalSuggestion[] = [];
    const current = currentAnalysis.percentiles;
    const GOAL_TARGET_MIN = 75; // Minimum target percentile

    // Analyze each parameter
    const parameters: GoalParameter[] = ['spots', 'pores', 'wrinkles', 'texture', 'redness'];

    for (const param of parameters) {
      const currentValue = current[param];
      const previousValue = previousAnalysis?.percentiles[param] ?? currentValue;
      const trend = currentValue - previousValue;

      // Suggest goals for parameters below threshold
      if (currentValue < GOAL_TARGET_MIN) {
        const difficulty = this.calculateDifficulty(currentValue, previousValue);
        const estimatedTimeframe = this.estimateTimeframe(
          currentValue,
          GOAL_TARGET_MIN,
          trend
        );

        // Determine priority based on severity
        let priority: 'low' | 'medium' | 'high' = 'medium';
        if (currentValue < 40) priority = 'high'; // Severe issues
        if (currentValue >= 65) priority = 'low'; // Minor issues

        const reasonMap: Record<GoalParameter, string> = {
          spots:
            currentValue < 40
              ? 'Significant hyperpigmentation detected'
              : 'Noticeable spots that can be improved',
          pores:
            currentValue < 40
              ? 'Large pore size affecting skin appearance'
              : 'Pore size can be further refined',
          wrinkles:
            currentValue < 40
              ? 'Fine lines and wrinkles are prominent'
              : 'Wrinkle reduction would enhance appearance',
          texture:
            currentValue < 40
              ? 'Rough texture and uneven surface'
              : 'Skin texture refinement recommended',
          redness:
            currentValue < 40
              ? 'Significant inflammation or rosacea'
              : 'Minor redness that can be addressed',
          overall:
            'Overall skin quality improvement recommended'
        };

        suggestions.push({
          parameter: param,
          reason: reasonMap[param],
          suggestedTarget: Math.min(GOAL_TARGET_MIN + 5, 100),
          difficulty,
          estimatedTimeframe,
          priority,
        });
      }
    }

    // Always suggest overall improvement
    if (current.overall < 85) {
      suggestions.push({
        parameter: 'overall',
        reason: 'Comprehensive skin quality improvement',
        suggestedTarget: 85,
        difficulty: this.calculateDifficulty(current.overall, previousAnalysis?.percentiles.overall ?? current.overall),
        estimatedTimeframe: this.estimateTimeframe(
          current.overall,
          85,
          (current.overall - (previousAnalysis?.percentiles.overall ?? current.overall))
        ),
        priority: current.overall < 50 ? 'high' : 'medium',
      });
    }

    return suggestions.sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });
  }

  /**
   * Create a goal from a suggestion
   */
  static createGoal(
    userId: string,
    parameter: GoalParameter,
    targetValue: number,
    currentValue: number,
    timeframeWeeks: number = 12
  ): SkinGoal {
    const startDate = new Date();
    const targetDate = new Date(startDate.getTime() + timeframeWeeks * 7 * 24 * 60 * 60 * 1000);

    const milestones = this.generateMilestones(currentValue, targetValue, parameter);

    return {
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      userId,
      parameter,
      startDate,
      targetDate,
      currentValue,
      targetValue,
      baselineValue: currentValue,
      status: 'active',
      priority: this.determinePriority(currentValue),
      rationale: this.generateRationale(parameter, currentValue, targetValue),
      milestones,
      createdAt: startDate,
      updatedAt: startDate,
      completionPercentage: 0,
      motivationalNotes: this.generateMotivationalMessage(parameter, currentValue, targetValue),
    };
  }

  /**
   * Update goal progress based on latest analysis
   */
  static updateGoalProgress(
    goal: SkinGoal,
    latestAnalysis: HybridSkinAnalysis
  ): GoalAchievementResult {
    const current = latestAnalysis.percentiles[goal.parameter];
    const progress = ((current - goal.baselineValue) / (goal.targetValue - goal.baselineValue)) * 100;
    const cappedProgress = Math.max(0, Math.min(100, progress));

    // Check milestone achievements
    let milestonesAchieved = 0;
    const updatedMilestones = goal.milestones.map((milestone) => {
      if (!milestone.achieved && current >= milestone.targetValue) {
        return {
          ...milestone,
          achieved: true,
          achievedAt: new Date(),
          progress: 100,
        };
      }
      const milestoneProgress =
        ((current - goal.baselineValue) / (milestone.targetValue - goal.baselineValue)) * 100;
      return {
        ...milestone,
        progress: Math.max(0, Math.min(100, milestoneProgress)),
      };
    });

    milestonesAchieved = updatedMilestones.filter((m) => m.achieved).length;

    // Calculate trend
    const trend = this.calculateTrend(current, goal.currentValue, updatedMilestones.length);

    // Estimate days to goal
    const daysElapsed = Math.floor(
      (Date.now() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const improvementPerDay = daysElapsed > 0 ? (current - goal.baselineValue) / daysElapsed : 0;
    const remainingImprovement = goal.targetValue - current;
    const estimatedDaysToGoal =
      improvementPerDay > 0
        ? Math.ceil(remainingImprovement / improvementPerDay)
        : Math.floor((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // Goal achieved?
    const achieved = current >= goal.targetValue;

    // Next milestone
    const nextMilestone = updatedMilestones.find((m) => !m.achieved);

    return {
      goalId: goal.id,
      achieved,
      currentProgress: cappedProgress,
      milestonesAchieved,
      estimatedDaysToGoal: Math.max(0, estimatedDaysToGoal),
      progressTrend: trend,
      nextMilestone,
      motivationalMessage: this.generateProgressMessage(
        cappedProgress,
        achieved,
        trend,
        goal.parameter
      ),
    };
  }

  /**
   * Generate milestones for a goal
   */
  private static generateMilestones(
    currentValue: number,
    targetValue: number,
    parameter: GoalParameter
  ): GoalMilestone[] {
    const milestones: GoalMilestone[] = [];
    const range = targetValue - currentValue;

    // Create 3 milestones: 25%, 50%, 75% of target
    const milestoneSteps = [0.25, 0.5, 0.75];
    const milestoneNames: Record<GoalParameter, string[]> = {
      spots: ['Initial Improvement', 'Noticeable Clarity', 'Significant Improvement'],
      pores: ['Slight Refinement', 'Visible Shrinkage', 'Pore Minimization'],
      wrinkles: ['Fine Line Reduction', 'Moderate Improvement', 'Significant Smoothing'],
      texture: ['Surface Refinement', 'Visible Smoothness', 'Refined Texture'],
      redness: ['Initial Calming', 'Reduced Inflammation', 'Clear Complexion'],
      overall: ['Good Progress', 'Excellent Progress', 'Near Completion'],
    };

    milestoneSteps.forEach((step, index) => {
      const targetValue_milestone = currentValue + range * step;
      milestones.push({
        id: `milestone-${index + 1}`,
        name: milestoneNames[parameter][index] || `Milestone ${index + 1}`,
        targetValue: Math.round(targetValue_milestone),
        achieved: false,
        progress: 0,
      });
    });

    return milestones;
  }

  /**
   * Calculate goal difficulty
   */
  private static calculateDifficulty(
    currentValue: number,
    previousValue: number
  ): 'easy' | 'moderate' | 'challenging' {
    const trend = currentValue - previousValue;

    if (currentValue >= 70) return 'easy'; // Already good
    if (currentValue < 40) return 'challenging'; // Very low baseline
    if (trend > 5) return 'easy'; // Good momentum
    if (trend < -2) return 'challenging'; // Declining
    return 'moderate';
  }

  /**
   * Estimate timeframe for goal completion
   */
  private static estimateTimeframe(
    currentValue: number,
    targetValue: number,
    trend: number
  ): string {
    const improvement = targetValue - currentValue;

    if (trend <= 0) return '6+ months'; // No improvement
    if (trend > 10) return '4-6 weeks'; // Fast improvement
    if (trend > 5) return '2-3 months'; // Good pace
    if (trend > 2) return '3-4 months'; // Steady pace

    // Estimate based on trend
    const weeksToGoal = improvement / trend / 7;
    if (weeksToGoal < 4) return '2-4 weeks';
    if (weeksToGoal < 8) return '1-2 months';
    if (weeksToGoal < 16) return '3-4 months';
    return '4-6 months';
  }

  /**
   * Determine priority level
   */
  private static determinePriority(currentValue: number): 'low' | 'medium' | 'high' {
    if (currentValue < 40) return 'high';
    if (currentValue < 60) return 'medium';
    return 'low';
  }

  /**
   * Generate goal rationale
   */
  private static generateRationale(
    parameter: GoalParameter,
    current: number,
    target: number
  ): string {
    const rationales: Record<GoalParameter, string> = {
      spots: `Reducing visible spots from ${current} to ${target} percentile will significantly improve skin clarity and evenness.`,
      pores: `Minimizing pore size from ${current} to ${target} percentile will create a smoother, more refined appearance.`,
      wrinkles: `Reducing fine lines and wrinkles from ${current} to ${target} percentile will enhance skin smoothness and youthfulness.`,
      texture: `Improving skin texture from ${current} to ${target} percentile will result in a more polished, even complexion.`,
      redness: `Calming inflammation and redness from ${current} to ${target} percentile will create a more balanced skin tone.`,
      overall: `Improving overall skin quality from ${current} to ${target} percentile represents comprehensive skin health improvement.`,
    };
    return rationales[parameter];
  }

  /**
   * Generate motivational message
   */
  private static generateMotivationalMessage(
    parameter: GoalParameter,
    _current: number,
    _target: number
  ): string {
    const messages: Record<GoalParameter, string> = {
      spots: 'With consistent treatment, visible improvements can be seen within 6-8 weeks.',
      pores: 'Pore refinement is achievable through dedicated skincare and professional treatments.',
      wrinkles: 'Regular treatments and skincare can significantly reduce the appearance of fine lines.',
      texture: 'Texture improvement is one of the most rewarding outcomes of professional skin care.',
      redness: 'Anti-inflammatory treatments can dramatically reduce redness and improve skin tone.',
      overall: 'Your comprehensive skin improvement journey is about to begin!',
    };
    return messages[parameter];
  }

  /**
   * Generate progress message
   */
  private static generateProgressMessage(
    progress: number,
    achieved: boolean,
    trend: 'accelerating' | 'steady' | 'slowing' | 'declining',
    parameter: GoalParameter
  ): string {
    if (achieved) {
      return `🎉 Congratulations! You've achieved your ${parameter} goal!`;
    }

    if (progress < 25) {
      return `You're starting your ${parameter} improvement journey. Keep up the consistency!`;
    }

    if (progress < 50) {
      if (trend === 'accelerating') {
        return `Great momentum! Your ${parameter} is improving quickly.`;
      }
      if (trend === 'slowing') {
        return `Good progress on ${parameter}, but let's maintain consistency.`;
      }
      return `Steady progress on ${parameter}. You're halfway there!`;
    }

    if (progress < 75) {
      return `Excellent progress! Your ${parameter} goal is nearly in reach.`;
    }

    if (progress < 100) {
      if (trend === 'accelerating') {
        return `🌟 Final stretch! You're very close to your ${parameter} goal.`;
      }
      return `Almost there! Keep the momentum for your ${parameter} goal.`;
    }

    return `You're making great progress on ${parameter}!`;
  }

  /**
   * Calculate progress trend
   */
  private static calculateTrend(
    current: number,
    previous: number,
    _milestonesCount: number
  ): 'accelerating' | 'steady' | 'slowing' | 'declining' {
    const change = current - previous;

    if (change < -1) return 'declining';
    if (change < 1) return 'slowing';
    if (change > 3) return 'accelerating';
    return 'steady';
  }

  /**
   * Get goal recommendations for customer
   */
  static getGoalRecommendations(
    userId: string,
    goals: SkinGoal[],
    _latestAnalysis: HybridSkinAnalysis
  ): {
    summaryMessage: string;
    totalGoals: number;
    activeGoals: number;
    achievedGoals: number;
    recommendedNextStep: string;
  } {
    const activeGoals = goals.filter((g) => g.status === 'active').length;
    const achievedGoals = goals.filter((g) => g.status === 'achieved').length;
    // const abandonedGoals = goals.filter((g) => g.status === 'abandoned').length;

    let summaryMessage = '';
    if (achievedGoals === 0 && activeGoals === 0) {
      summaryMessage = 'Ready to set your first skin improvement goal? We can help!';
    } else if (achievedGoals > 0 && activeGoals === 0) {
      summaryMessage = `Great! You've achieved ${achievedGoals} goal(s). Ready to set a new one?`;
    } else if (achievedGoals > 0) {
      summaryMessage = `Impressive! ${achievedGoals} achieved goal(s) with ${activeGoals} in progress.`;
    } else {
      summaryMessage = `You're working on ${activeGoals} goal(s). Keep up the great work!`;
    }

    return {
      summaryMessage,
      totalGoals: goals.length,
      activeGoals,
      achievedGoals,
      recommendedNextStep:
        activeGoals === 0
          ? 'Consider setting new skin improvement goals based on your latest analysis.'
          : `Continue focused treatment to achieve your ${activeGoals} active goal(s).`,
    };
  }
}
