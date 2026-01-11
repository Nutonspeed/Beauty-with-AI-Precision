'use strict';

export type Currency = 'USD' | 'THB' | 'EUR' | 'GBP';
export type ProgramType = 'skincare' | 'professional' | 'procedure' | 'supplement' | 'consultation';
export type TimeUnit = 'week' | 'month' | 'quarter' | 'year';
export type CostTrend = 'increasing' | 'stable' | 'decreasing';

export interface ProgramCost {
  id: string;
  name: string;
  type: ProgramType;
  basePrice: number;
  quantity: number;
  totalPrice: number;
  currency: Currency;
  frequency: TimeUnit;
  startDate: Date;
  endDate?: Date;
  discount?: number;
  notes?: string;
}

export interface CostBreakdown {
  totalCost: number;
  byType: Record<ProgramType, number>;
  monthlyAverage: number;
  yearlyProjection: number;
  discountAmount: number;
  effectivePrice: number;
}

export interface ProgramEffectiveness {
  programId: string;
  programName: string;
  improvementScore: number;
  costPerImprovement: number;
  effectivenessRating: number;
  recommendations: string[];
}

export interface ROIAnalysis {
  totalInvestment: number;
  projectedBenefit: number;
  roi: number;
  paybackPeriodMonths: number;
  costPerUnit: number;
  effectiveness: ProgramEffectiveness[];
  recommendations: string[];
  costTrend: CostTrend;
  summary: string;
}

export interface CostComparison {
  program1: ProgramCost;
  program2: ProgramCost;
  priceDifference: number;
  effectivenessDifference: number;
  recommendation: string;
}

export interface FinancialReport {
  reportDate: Date;
  programs: ProgramCost[];
  breakdown: CostBreakdown;
  roi: ROIAnalysis;
  comparisons: CostComparison[];
  budgetRemaining: number;
  alerts: string[];
}

export interface BudgetPlan {
  monthlyBudget: number;
  allocations: Record<ProgramType, number>;
  currency: Currency;
  duration: TimeUnit;
  projectedOutcome: string;
}

export class CostROICalculator {
  static calculateTotalCost(programs: ProgramCost[]): CostBreakdown {
    let totalCost = 0;
    let discountAmount = 0;

    const byType: Record<ProgramType, number> = {
      skincare: 0,
      professional: 0,
      procedure: 0,
      supplement: 0,
      consultation: 0,
    };

    for (const program of programs) {
      const programTotal = program.totalPrice - (program.discount ?? 0);
      totalCost += programTotal;
      discountAmount += program.discount ?? 0;
      byType[program.type] += programTotal;
    }

    const monthlyAverage = totalCost / Math.max(1, programs.length);
    const yearlyProjection = monthlyAverage * 12;

    return {
      totalCost,
      byType,
      monthlyAverage,
      yearlyProjection,
      discountAmount,
      effectivePrice: totalCost,
    };
  }

  static calculateMonthlyAverage(programs: ProgramCost[]): number {
    if (programs.length === 0) return 0;

    let totalCost = 0;
    let count = 0;

    for (const program of programs) {
      const adjustedPrice = program.totalPrice - (program.discount ?? 0);
      totalCost += adjustedPrice;
      count += 1;
    }

    return totalCost / count;
  }

  static estimateROI(
    programs: ProgramCost[],
    effectivenessScores: Record<string, number>,
    benefitMultiplier: number = 1.5
  ): ROIAnalysis {
    const breakdown = this.calculateTotalCost(programs);
    const totalInvestment = breakdown.totalCost;

    const effectiveness: ProgramEffectiveness[] = [];

    for (const program of programs) {
      const score = effectivenessScores[program.id] ?? 50;
      const costPerImprovement = program.totalPrice / Math.max(1, score);

      const effectivenessRating = Math.min(100, score * 1.2);

      const recommendationsList: string[] = [];
      if (costPerImprovement > 50) {
        recommendationsList.push('Consider more cost-effective alternatives');
      }
      if (effectivenessRating > 80) {
        recommendationsList.push('High-value program - continue');
      }
      if (effectivenessRating < 40) {
        recommendationsList.push('Low effectiveness - consider discontinuing');
      }

      effectiveness.push({
        programId: program.id,
        programName: program.name,
        improvementScore: score,
        costPerImprovement,
        effectivenessRating,
        recommendations: recommendationsList,
      });
    }

    const totalEffectiveness = effectiveness.reduce((sum, e) => sum + e.effectivenessRating, 0);
    const averageEffectiveness = totalEffectiveness / Math.max(1, effectiveness.length);

    const projectedBenefit = totalInvestment * benefitMultiplier;
    const roi = ((projectedBenefit - totalInvestment) / totalInvestment) * 100;
    const paybackPeriodMonths = totalInvestment / Math.max(1, breakdown.monthlyAverage);

    const costTrend = this.calculateCostTrend(programs);

    const recommendations = this.generateROIRecommendations(
      roi,
      averageEffectiveness,
      costTrend
    );

    const summary = `ROI: ${roi.toFixed(1)}% | Average Effectiveness: ${averageEffectiveness.toFixed(0)}% | Payback: ${paybackPeriodMonths.toFixed(1)} months`;

    return {
      totalInvestment,
      projectedBenefit,
      roi,
      paybackPeriodMonths,
      costPerUnit: totalInvestment / Math.max(1, programs.length),
      effectiveness,
      recommendations,
      costTrend,
      summary,
    };
  }

  private static calculateCostTrend(programs: ProgramCost[]): CostTrend {
    if (programs.length < 2) return 'stable';

    const sorted = [...programs].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const avgFirst = firstHalf.reduce((sum, t) => sum + t.totalPrice, 0) / Math.max(1, firstHalf.length);
    const avgSecond = secondHalf.reduce((sum, t) => sum + t.totalPrice, 0) / Math.max(1, secondHalf.length);

    const difference = avgSecond - avgFirst;

    if (difference > avgFirst * 0.1) return 'increasing';
    if (difference < avgFirst * -0.1) return 'decreasing';
    return 'stable';
  }

  private static generateROIRecommendations(
    roi: number,
    effectiveness: number,
    trend: CostTrend
  ): string[] {
    const recommendations: string[] = [];

    if (roi > 50) {
      recommendations.push('Excellent ROI - continue current program plan');
    } else if (roi > 20) {
      recommendations.push('Good ROI - maintain current programs');
    } else if (roi < 0) {
      recommendations.push('Negative ROI - review and optimize program selection');
    }

    if (effectiveness > 75) {
      recommendations.push('High effectiveness across programs');
    } else if (effectiveness < 50) {
      recommendations.push('Consider switching to more effective programs');
    }

    if (trend === 'increasing') {
      recommendations.push('Cost is increasing - monitor budget carefully');
    } else if (trend === 'decreasing') {
      recommendations.push('Costs decreasing - good budget management');
    }

    return recommendations;
  }

  static compareCostEffectiveness(
    program1: ProgramCost,
    program2: ProgramCost,
    effectiveness1: number,
    effectiveness2: number
  ): CostComparison {
    const price1 = program1.totalPrice - (program1.discount ?? 0);
    const price2 = program2.totalPrice - (program2.discount ?? 0);

    const priceDifference = price2 - price1;
    const effectivenessDifference = effectiveness2 - effectiveness1;

    let recommendation = '';

    if (priceDifference < 0 && effectivenessDifference > 0) {
      recommendation = `${program2.name} is cheaper AND more effective - recommended`;
    } else if (priceDifference < 0 && effectivenessDifference < 0) {
      recommendation = `${program2.name} is cheaper but less effective - weigh trade-offs`;
    } else if (priceDifference > 0 && effectivenessDifference > 0) {
      recommendation = `${program2.name} is more expensive but more effective - consider value`;
    } else {
      recommendation = `${program1.name} is more cost-effective overall`;
    }

    return {
      program1,
      program2,
      priceDifference,
      effectivenessDifference,
      recommendation,
    };
  }

  static generateFinancialReport(
    programs: ProgramCost[],
    effectivenessScores: Record<string, number>,
    monthlyBudget: number,
    benefitMultiplier?: number
  ): FinancialReport {
    const breakdown = this.calculateTotalCost(programs);
    const roi = this.estimateROI(programs, effectivenessScores, benefitMultiplier);
    const budgetRemaining = monthlyBudget - breakdown.monthlyAverage;

    const comparisons: CostComparison[] = [];

    for (let i = 0; i < programs.length - 1; i++) {
      for (let j = i + 1; j < programs.length; j++) {
        const comparison = this.compareCostEffectiveness(
          programs[i],
          programs[j],
          effectivenessScores[programs[i].id] ?? 50,
          effectivenessScores[programs[j].id] ?? 50
        );
        comparisons.push(comparison);
      }
    }

    const alerts: string[] = [];

    if (budgetRemaining < 0) {
      alerts.push(`Budget exceeded by ${Math.abs(budgetRemaining).toFixed(2)} per month`);
    }

    const lowEffectivenessPrograms = roi.effectiveness.filter((e) => e.effectivenessRating < 50);
    if (lowEffectivenessPrograms.length > 0) {
      alerts.push(`${lowEffectivenessPrograms.length} programs showing low effectiveness`);
    }

    if (roi.costTrend === 'increasing') {
      alerts.push('Costs trending upward - monitor budget closely');
    }

    return {
      reportDate: new Date(),
      programs,
      breakdown,
      roi,
      comparisons,
      budgetRemaining,
      alerts,
    };
  }

  static createBudgetPlan(
    monthlyBudget: number,
    programTypes: ProgramType[],
    currency: Currency = 'USD'
  ): BudgetPlan {
    const allocations: Record<ProgramType, number> = {
      skincare: 0,
      professional: 0,
      procedure: 0,
      supplement: 0,
      consultation: 0,
    };

    const percentages: Record<ProgramType, number> = {
      skincare: 0.35,
      professional: 0.25,
      procedure: 0.2,
      supplement: 0.15,
      consultation: 0.05,
    };

    let _totalAllocated = 0;
    for (const type of programTypes) {
      allocations[type] = monthlyBudget * percentages[type];
      _totalAllocated += allocations[type];
    }

    for (const type of Object.keys(allocations)) {
      if (!programTypes.includes(type as ProgramType)) {
        allocations[type as ProgramType] = 0;
      }
    }

    const projectedOutcome =
      `Monthly budget: ${monthlyBudget} ${currency} | ` +
      `Annual budget: ${(monthlyBudget * 12).toFixed(2)} ${currency} | ` +
      `Estimated 30% improvement in skin quality with consistent program`;

    return {
      monthlyBudget,
      allocations,
      currency,
      duration: 'month',
      projectedOutcome,
    };
  }

  static applyDiscount(program: ProgramCost, discountPercentage: number): ProgramCost {
    const discountAmount = program.totalPrice * (discountPercentage / 100);
    return {
      ...program,
      discount: discountAmount,
    };
  }

  static calculateBreakeven(monthlyROI: number, initialInvestment: number): number {
    if (monthlyROI <= 0) return Infinity;
    return initialInvestment / monthlyROI;
  }

  static projectCostTimeline(
    program: ProgramCost,
    months: number
  ): Array<{ month: number; cumulativeCost: number; date: Date }> {
    const timeline: Array<{ month: number; cumulativeCost: number; date: Date }> = [];

    const monthlyRate = program.totalPrice / 12;

    for (let i = 1; i <= months; i++) {
      const date = new Date(program.startDate);
      date.setMonth(date.getMonth() + i);

      timeline.push({
        month: i,
        cumulativeCost: monthlyRate * i,
        date,
      });
    }

    return timeline;
  }

  static calculateCostSavings(originalPrice: number, discountedPrice: number): {
    savings: number;
    savingsPercentage: number;
  } {
    const savings = originalPrice - discountedPrice;
    const savingsPercentage = (savings / originalPrice) * 100;

    return {
      savings,
      savingsPercentage,
    };
  }
}
