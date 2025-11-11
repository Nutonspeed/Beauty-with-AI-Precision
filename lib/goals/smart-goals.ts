/**
 * Smart Goals System
 * SMART goal tracking for skincare improvements
 */

import type { ConcernType } from '@/lib/concerns/concern-education';

export type GoalType = 'improvement' | 'maintenance' | 'prevention' | 'habit';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';
export type TimeFrame = '2-weeks' | '1-month' | '3-months' | '6-months' | '1-year';

export interface SmartGoal {
  id: string;
  userId: string;
  type: GoalType;
  status: GoalStatus;

  // SMART criteria
  specific: {
    title: string;
    description: string;
    concernTypes: ConcernType[];
  };
  
  measurable: {
    metric: string; // e.g., "severity score", "count", "percentage"
    baseline: number;
    target: number;
    unit: string; // e.g., "points", "spots", "%"
    currentValue?: number;
  };
  
  achievable: {
    difficulty: 'easy' | 'moderate' | 'challenging';
    requiredActions: string[]; // References to action IDs
    prerequisites?: string[];
  };
  
  relevant: {
    importance: 1 | 2 | 3 | 4 | 5; // 1=low, 5=critical
    motivations: string[];
    relatedGoals?: string[]; // Other goal IDs
  };
  
  timeBound: {
    timeFrame: TimeFrame;
    startDate: string;
    endDate: string;
    checkInFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  };

  // Progress tracking
  progress: {
    percentage: number;
    milestones: Milestone[];
    checkIns: CheckIn[];
    photos?: {
      before?: string;
      progress: { url: string; date: string; notes?: string }[];
      after?: string;
    };
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  targetValue?: number;
  completed: boolean;
  completedDate?: string;
  reward?: string;
}

export interface CheckIn {
  id: string;
  date: string;
  currentValue: number;
  notes?: string;
  photoUrl?: string;
  mood?: 'great' | 'good' | 'okay' | 'struggling';
  adherence?: number; // 0-100 how well they followed the plan
}

export interface GoalRecommendation {
  concernType: ConcernType;
  severity: number;
  suggestedGoals: Partial<SmartGoal>[];
  reasoning: string;
}

/**
 * Smart Goal Generator
 */
export class SmartGoalGenerator {
  /**
   * Generate goal recommendations based on concerns
   */
  static generateRecommendations(
    concerns: { type: ConcernType; severity: number }[],
    userId: string
  ): GoalRecommendation[] {
    const recommendations: GoalRecommendation[] = [];

    // Sort by severity
    const sortedConcerns = [...concerns].sort((a, b) => b.severity - a.severity);

    sortedConcerns.slice(0, 3).forEach(concern => {
      const goals = this.generateGoalsForConcern(concern, userId);
      recommendations.push({
        concernType: concern.type,
        severity: concern.severity,
        suggestedGoals: goals,
        reasoning: this.getReasoningForConcern(concern),
      });
    });

    return recommendations;
  }

  /**
   * Generate specific goals for a concern
   */
  private static generateGoalsForConcern(
    concern: { type: ConcernType; severity: number },
    userId: string
  ): Partial<SmartGoal>[] {
    const goals: Partial<SmartGoal>[] = [];
    const severity = concern.severity;

    // Determine timeframe based on severity
    const timeFrame: TimeFrame = severity >= 8 ? '6-months' :
                                  severity >= 6 ? '3-months' : '1-month';

    // Calculate realistic target (aim for 30-50% improvement)
    const improvementRate = severity >= 8 ? 0.3 : severity >= 6 ? 0.4 : 0.5;
    const target = Math.max(1, severity * (1 - improvementRate));

    switch (concern.type) {
      case 'acne':
        goals.push(this.createGoalTemplate({
          userId,
          type: 'improvement',
          title: 'Reduce Active Breakouts',
          description: 'Decrease the number of active acne lesions through consistent skincare routine',
          concernTypes: ['acne'],
          metric: 'Active lesions',
          baseline: Math.round(severity * 3), // Estimate lesion count
          target: Math.round(target * 3),
          unit: 'spots',
          timeFrame,
          importance: severity >= 7 ? 5 : severity >= 5 ? 4 : 3,
          difficulty: severity >= 7 ? 'challenging' : 'moderate',
        }));
        break;

      case 'dark_spots':
        goals.push(this.createGoalTemplate({
          userId,
          type: 'improvement',
          title: 'Fade Dark Spots',
          description: 'Reduce visibility of hyperpigmentation through brightening treatments',
          concernTypes: ['dark_spots'],
          metric: 'Pigmentation severity',
          baseline: severity,
          target,
          unit: 'points',
          timeFrame: severity >= 7 ? '6-months' : '3-months',
          importance: 4,
          difficulty: severity >= 7 ? 'challenging' : 'moderate',
        }));
        break;

      case 'wrinkles':
      case 'fine_lines':
        goals.push(this.createGoalTemplate({
          userId,
          type: 'improvement',
          title: 'Minimize Fine Lines',
          description: 'Reduce appearance of wrinkles through retinoid use and anti-aging treatments',
          concernTypes: ['wrinkles', 'fine_lines'],
          metric: 'Wrinkle severity',
          baseline: severity,
          target,
          unit: 'points',
          timeFrame: '6-months',
          importance: 3,
          difficulty: 'challenging',
        }));
        break;

      case 'large_pores':
        goals.push(this.createGoalTemplate({
          userId,
          type: 'improvement',
          title: 'Refine Pore Appearance',
          description: 'Minimize visible pores through consistent exfoliation and niacinamide',
          concernTypes: ['large_pores'],
          metric: 'Pore visibility',
          baseline: severity,
          target,
          unit: 'points',
          timeFrame: '3-months',
          importance: 3,
          difficulty: 'moderate',
        }));
        break;

      case 'redness':
        goals.push(this.createGoalTemplate({
          userId,
          type: 'improvement',
          title: 'Calm Skin Redness',
          description: 'Reduce facial redness and sensitivity through gentle, soothing skincare',
          concernTypes: ['redness'],
          metric: 'Redness severity',
          baseline: severity,
          target,
          unit: 'points',
          timeFrame: '3-months',
          importance: 4,
          difficulty: severity >= 7 ? 'challenging' : 'moderate',
        }));
        break;

      case 'dullness':
        goals.push(this.createGoalTemplate({
          userId,
          type: 'improvement',
          title: 'Restore Skin Radiance',
          description: 'Boost skin glow through vitamin C, hydration, and exfoliation',
          concernTypes: ['dullness'],
          metric: 'Radiance score',
          baseline: severity,
          target,
          unit: 'points',
          timeFrame: '1-month',
          importance: 2,
          difficulty: 'easy',
        }));
        break;
    }

    // Add habit goal
    goals.push({
      id: `goal_${Date.now()}_habit`,
      userId,
      type: 'habit',
      status: 'active',
      specific: {
        title: 'Establish Consistent Skincare Routine',
        description: 'Maintain daily morning and evening skincare routine for 90 consecutive days',
        concernTypes: [concern.type],
      },
      measurable: {
        metric: 'Days completed',
        baseline: 0,
        target: 90,
        unit: 'days',
      },
      achievable: {
        difficulty: 'moderate',
        requiredActions: [],
      },
      relevant: {
        importance: 5,
        motivations: ['Consistency is key to seeing results', 'Build healthy habits'],
      },
      timeBound: {
        timeFrame: '3-months',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        checkInFrequency: 'daily',
      },
    });

    return goals;
  }

  /**
   * Create goal template
   */
  private static createGoalTemplate(params: {
    userId: string;
    type: GoalType;
    title: string;
    description: string;
    concernTypes: ConcernType[];
    metric: string;
    baseline: number;
    target: number;
    unit: string;
    timeFrame: TimeFrame;
    importance: 1 | 2 | 3 | 4 | 5;
    difficulty: 'easy' | 'moderate' | 'challenging';
  }): Partial<SmartGoal> {
    const startDate = new Date();
    const daysToAdd = this.getTimeFrameDays(params.timeFrame);
    const endDate = new Date(startDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    return {
      id: `goal_${Date.now()}_${params.concernTypes[0]}`,
      userId: params.userId,
      type: params.type,
      status: 'active',
      specific: {
        title: params.title,
        description: params.description,
        concernTypes: params.concernTypes,
      },
      measurable: {
        metric: params.metric,
        baseline: params.baseline,
        target: params.target,
        unit: params.unit,
        currentValue: params.baseline,
      },
      achievable: {
        difficulty: params.difficulty,
        requiredActions: [],
      },
      relevant: {
        importance: params.importance,
        motivations: this.getMotivationsForConcern(params.concernTypes[0]),
      },
      timeBound: {
        timeFrame: params.timeFrame,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        checkInFrequency: this.getCheckInFrequency(params.timeFrame),
      },
      progress: {
        percentage: 0,
        milestones: this.generateMilestones(params.baseline, params.target, params.timeFrame),
        checkIns: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate milestones for goal
   */
  private static generateMilestones(
    baseline: number,
    target: number,
    timeFrame: TimeFrame
  ): Milestone[] {
    const milestones: Milestone[] = [];
    const totalDays = this.getTimeFrameDays(timeFrame);
    const totalImprovement = baseline - target;
    const numMilestones = timeFrame === '1-month' ? 2 : timeFrame === '3-months' ? 3 : 4;

    for (let i = 1; i <= numMilestones; i++) {
      const daysToMilestone = Math.round((totalDays / (numMilestones + 1)) * i);
      const targetValue = baseline - (totalImprovement * (i / (numMilestones + 1)));
      const targetDate = new Date(Date.now() + daysToMilestone * 24 * 60 * 60 * 1000);

      milestones.push({
        id: `milestone_${i}`,
        title: `${Math.round((i / (numMilestones + 1)) * 100)}% Improvement`,
        description: `Reach ${targetValue.toFixed(1)} by this milestone`,
        targetDate: targetDate.toISOString(),
        targetValue,
        completed: false,
      });
    }

    return milestones;
  }

  /**
   * Helper methods
   */
  private static getTimeFrameDays(timeFrame: TimeFrame): number {
    switch (timeFrame) {
      case '2-weeks': return 14;
      case '1-month': return 30;
      case '3-months': return 90;
      case '6-months': return 180;
      case '1-year': return 365;
    }
  }

  private static getCheckInFrequency(timeFrame: TimeFrame): 'daily' | 'weekly' | 'bi-weekly' | 'monthly' {
    switch (timeFrame) {
      case '2-weeks': return 'daily';
      case '1-month': return 'weekly';
      case '3-months': return 'weekly';
      case '6-months': return 'bi-weekly';
      case '1-year': return 'monthly';
    }
  }

  private static getMotivationsForConcern(concernType: ConcernType): string[] {
    const motivations: Record<ConcernType, string[]> = {
      acne: ['Clear, smooth skin', 'Boost confidence', 'Prevent scarring'],
      wrinkles: ['Youthful appearance', 'Prevent further aging', 'Feel confident'],
      fine_lines: ['Smooth, youthful skin', 'Early prevention', 'Maintain skin health'],
      dark_spots: ['Even skin tone', 'Radiant complexion', 'Fade hyperpigmentation'],
      large_pores: ['Refined skin texture', 'Smooth appearance', 'Better makeup application'],
      redness: ['Calm, comfortable skin', 'Even skin tone', 'Reduce sensitivity'],
      texture: ['Smooth skin surface', 'Better product absorption', 'Confident appearance'],
      dullness: ['Radiant glow', 'Healthy-looking skin', 'Feel refreshed'],
      blackheads: ['Clear pores', 'Smooth nose and chin', 'Clean appearance'],
      hyperpigmentation: ['Even skin tone', 'Fade dark patches', 'Confident complexion'],
      spots: ['Clear complexion', 'Even skin tone', 'Radiant skin'],
      pores: ['Refined texture', 'Smooth appearance', 'Clear skin'],
    };
    return motivations[concernType] || ['Improve skin health', 'Boost confidence'];
  }

  private static getReasoningForConcern(concern: { type: ConcernType; severity: number }): string {
    const severity = concern.severity;
    if (severity >= 8) {
      return `This is a significant concern that requires dedicated attention. With consistent effort and possibly professional help, you can see substantial improvement.`;
    } else if (severity >= 6) {
      return `This concern is moderate and very responsive to proper skincare. With the right routine, you should see noticeable improvement.`;
    } else {
      return `This is a mild concern that can be effectively addressed with over-the-counter products and good habits.`;
    }
  }
}

/**
 * Goal progress tracking utilities
 */
export function addCheckIn(goal: SmartGoal, checkIn: Omit<CheckIn, 'id'>): SmartGoal {
  const newCheckIn: CheckIn = {
    ...checkIn,
    id: `checkin_${Date.now()}`,
  };

  const updatedGoal = {
    ...goal,
    progress: {
      ...goal.progress,
      checkIns: [...goal.progress.checkIns, newCheckIn],
    },
    updatedAt: new Date().toISOString(),
  };

  // Update current value and progress percentage
  updatedGoal.measurable.currentValue = checkIn.currentValue;
  updatedGoal.progress.percentage = calculateGoalProgress(updatedGoal);

  // Check milestone completion
  updatedGoal.progress.milestones = updatedGoal.progress.milestones.map(milestone => {
    if (!milestone.completed && milestone.targetValue) {
      const isImprovement = updatedGoal.measurable.target < updatedGoal.measurable.baseline;
      const achieved = isImprovement
        ? checkIn.currentValue <= milestone.targetValue
        : checkIn.currentValue >= milestone.targetValue;

      if (achieved) {
        return {
          ...milestone,
          completed: true,
          completedDate: new Date().toISOString(),
        };
      }
    }
    return milestone;
  });

  // Check goal completion
  const isCompleted = checkGoalCompletion(updatedGoal);
  if (isCompleted && updatedGoal.status === 'active') {
    updatedGoal.status = 'completed';
    updatedGoal.completedAt = new Date().toISOString();
  }

  return updatedGoal;
}

export function calculateGoalProgress(goal: SmartGoal): number {
  const { baseline, target, currentValue } = goal.measurable;
  if (currentValue === undefined) return 0;

  const totalChange = Math.abs(target - baseline);
  const currentChange = Math.abs(currentValue - baseline);
  const progress = Math.min(100, (currentChange / totalChange) * 100);

  return Math.round(progress);
}

export function checkGoalCompletion(goal: SmartGoal): boolean {
  const { baseline, target, currentValue } = goal.measurable;
  if (currentValue === undefined) return false;

  const isImprovement = target < baseline;
  return isImprovement ? currentValue <= target : currentValue >= target;
}

export function getGoalStreak(goal: SmartGoal): number {
  if (goal.timeBound.checkInFrequency !== 'daily') return 0;

  const sortedCheckIns = [...goal.progress.checkIns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  let expectedDate = new Date();
  expectedDate.setHours(0, 0, 0, 0);

  for (const checkIn of sortedCheckIns) {
    const checkInDate = new Date(checkIn.date);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate.getTime() === expectedDate.getTime()) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getNextCheckInDate(goal: SmartGoal): Date {
  const lastCheckIn = goal.progress.checkIns[goal.progress.checkIns.length - 1];
  const lastDate = lastCheckIn ? new Date(lastCheckIn.date) : new Date(goal.timeBound.startDate);

  const nextDate = new Date(lastDate);
  switch (goal.timeBound.checkInFrequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'bi-weekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  return nextDate;
}
