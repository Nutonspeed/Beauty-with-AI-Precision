'use strict';

export type Currency = 'USD' | 'THB' | 'EUR' | 'GBP';
export type TreatmentType = 'skincare' | 'professional' | 'procedure' | 'supplement' | 'consultation';
export type TimeUnit = 'week' | 'month' | 'quarter' | 'year';
export type CostTrend = 'increasing' | 'stable' | 'decreasing';

export interface TreatmentCost {
  id: string;
  name: string;
  type: TreatmentType;
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
  byType: Record<TreatmentType, number>;
  monthlyAverage: number;
  yearlyProjection: number;
  discountAmount: number;
  effectivePrice: number;
}

export interface TreatmentEffectiveness {
  treatmentId: string;
  treatmentName: string;
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
  effectiveness: TreatmentEffectiveness[];
  recommendations: string[];
  costTrend: CostTrend;
  summary: string;
}

export interface CostComparison {
  treatment1: TreatmentCost;
  treatment2: TreatmentCost;
  priceDifference: number;
  effectivenessDifference: number;
  recommendation: string;
}

export interface FinancialReport {
  reportDate: Date;
  treatments: TreatmentCost[];
  breakdown: CostBreakdown;
  roi: ROIAnalysis;
  comparisons: CostComparison[];
  budgetRemaining: number;
  alerts: string[];
}

export interface BudgetPlan {
  monthlyBudget: number;
  allocations: Record<TreatmentType, number>;
  currency: Currency;
  duration: TimeUnit;
  projectedOutcome: string;
}

export class CostROICalculator {
  static calculateTotalCost(treatments: TreatmentCost[]): CostBreakdown {
    let totalCost = 0;
    let discountAmount = 0;

    const byType: Record<TreatmentType, number> = {
      skincare: 0,
      professional: 0,
      procedure: 0,
      supplement: 0,
      consultation: 0,
    };

    for (const treatment of treatments) {
      const treatmentTotal = treatment.totalPrice - (treatment.discount ?? 0);
      totalCost += treatmentTotal;
      discountAmount += treatment.discount ?? 0;
      byType[treatment.type] += treatmentTotal;
    }

    const monthlyAverage = totalCost / Math.max(1, treatments.length);
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

  static calculateMonthlyAverage(treatments: TreatmentCost[]): number {
    if (treatments.length === 0) return 0;

    let totalCost = 0;
    let count = 0;

    for (const treatment of treatments) {
      const adjustedPrice = treatment.totalPrice - (treatment.discount ?? 0);
      totalCost += adjustedPrice;
      count += 1;
    }

    return totalCost / count;
  }

  static estimateROI(
    treatments: TreatmentCost[],
    effectivenessScores: Record<string, number>,
    benefitMultiplier: number = 1.5
  ): ROIAnalysis {
    const breakdown = this.calculateTotalCost(treatments);
    const totalInvestment = breakdown.totalCost;

    const effectiveness: TreatmentEffectiveness[] = [];

    for (const treatment of treatments) {
      const score = effectivenessScores[treatment.id] ?? 50;
      const costPerImprovement = treatment.totalPrice / Math.max(1, score);

      const effectivenessRating = Math.min(100, score * 1.2);

      const recommendationsList: string[] = [];
      if (costPerImprovement > 50) {
        recommendationsList.push('Consider more cost-effective alternatives');
      }
      if (effectivenessRating > 80) {
        recommendationsList.push('High-value treatment - continue');
      }
      if (effectivenessRating < 40) {
        recommendationsList.push('Low effectiveness - consider discontinuing');
      }

      effectiveness.push({
        treatmentId: treatment.id,
        treatmentName: treatment.name,
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

    const costTrend = this.calculateCostTrend(treatments);

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
      costPerUnit: totalInvestment / Math.max(1, treatments.length),
      effectiveness,
      recommendations,
      costTrend,
      summary,
    };
  }

  private static calculateCostTrend(treatments: TreatmentCost[]): CostTrend {
    if (treatments.length < 2) return 'stable';

    const sorted = [...treatments].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

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
      recommendations.push('Excellent ROI - continue current treatment plan');
    } else if (roi > 20) {
      recommendations.push('Good ROI - maintain current treatments');
    } else if (roi < 0) {
      recommendations.push('Negative ROI - review and optimize treatment selection');
    }

    if (effectiveness > 75) {
      recommendations.push('High effectiveness across treatments');
    } else if (effectiveness < 50) {
      recommendations.push('Consider switching to more effective treatments');
    }

    if (trend === 'increasing') {
      recommendations.push('Cost is increasing - monitor budget carefully');
    } else if (trend === 'decreasing') {
      recommendations.push('Costs decreasing - good budget management');
    }

    return recommendations;
  }

  static compareCostEffectiveness(
    treatment1: TreatmentCost,
    treatment2: TreatmentCost,
    effectiveness1: number,
    effectiveness2: number
  ): CostComparison {
    const price1 = treatment1.totalPrice - (treatment1.discount ?? 0);
    const price2 = treatment2.totalPrice - (treatment2.discount ?? 0);

    const priceDifference = price2 - price1;
    const effectivenessDifference = effectiveness2 - effectiveness1;

    let recommendation = '';

    if (priceDifference < 0 && effectivenessDifference > 0) {
      recommendation = `${treatment2.name} is cheaper AND more effective - recommended`;
    } else if (priceDifference < 0 && effectivenessDifference < 0) {
      recommendation = `${treatment2.name} is cheaper but less effective - weigh trade-offs`;
    } else if (priceDifference > 0 && effectivenessDifference > 0) {
      recommendation = `${treatment2.name} is more expensive but more effective - consider value`;
    } else {
      recommendation = `${treatment1.name} is more cost-effective overall`;
    }

    return {
      treatment1,
      treatment2,
      priceDifference,
      effectivenessDifference,
      recommendation,
    };
  }

  static generateFinancialReport(
    treatments: TreatmentCost[],
    effectivenessScores: Record<string, number>,
    monthlyBudget: number,
    benefitMultiplier?: number
  ): FinancialReport {
    const breakdown = this.calculateTotalCost(treatments);
    const roi = this.estimateROI(treatments, effectivenessScores, benefitMultiplier);
    const budgetRemaining = monthlyBudget - breakdown.monthlyAverage;

    const comparisons: CostComparison[] = [];

    for (let i = 0; i < treatments.length - 1; i++) {
      for (let j = i + 1; j < treatments.length; j++) {
        const comparison = this.compareCostEffectiveness(
          treatments[i],
          treatments[j],
          effectivenessScores[treatments[i].id] ?? 50,
          effectivenessScores[treatments[j].id] ?? 50
        );
        comparisons.push(comparison);
      }
    }

    const alerts: string[] = [];

    if (budgetRemaining < 0) {
      alerts.push(`Budget exceeded by ${Math.abs(budgetRemaining).toFixed(2)} per month`);
    }

    const lowEffectivenessTreatments = roi.effectiveness.filter((e) => e.effectivenessRating < 50);
    if (lowEffectivenessTreatments.length > 0) {
      alerts.push(`${lowEffectivenessTreatments.length} treatments showing low effectiveness`);
    }

    if (roi.costTrend === 'increasing') {
      alerts.push('Costs trending upward - monitor budget closely');
    }

    return {
      reportDate: new Date(),
      treatments,
      breakdown,
      roi,
      comparisons,
      budgetRemaining,
      alerts,
    };
  }

  static createBudgetPlan(
    monthlyBudget: number,
    treatmentTypes: TreatmentType[],
    currency: Currency = 'USD'
  ): BudgetPlan {
    const allocations: Record<TreatmentType, number> = {
      skincare: 0,
      professional: 0,
      procedure: 0,
      supplement: 0,
      consultation: 0,
    };

    const percentages: Record<TreatmentType, number> = {
      skincare: 0.35,
      professional: 0.25,
      procedure: 0.2,
      supplement: 0.15,
      consultation: 0.05,
    };

    let _totalAllocated = 0;
    for (const type of treatmentTypes) {
      allocations[type] = monthlyBudget * percentages[type];
      _totalAllocated += allocations[type];
    }

    for (const type of Object.keys(allocations)) {
      if (!treatmentTypes.includes(type as TreatmentType)) {
        allocations[type as TreatmentType] = 0;
      }
    }

    const projectedOutcome =
      `Monthly budget: ${monthlyBudget} ${currency} | ` +
      `Annual budget: ${(monthlyBudget * 12).toFixed(2)} ${currency} | ` +
      `Estimated 30% improvement in skin quality with consistent treatment`;

    return {
      monthlyBudget,
      allocations,
      currency,
      duration: 'month',
      projectedOutcome,
    };
  }

  static applyDiscount(treatment: TreatmentCost, discountPercentage: number): TreatmentCost {
    const discountAmount = treatment.totalPrice * (discountPercentage / 100);
    return {
      ...treatment,
      discount: discountAmount,
    };
  }

  static calculateBreakeven(monthlyROI: number, initialInvestment: number): number {
    if (monthlyROI <= 0) return Infinity;
    return initialInvestment / monthlyROI;
  }

  static projectCostTimeline(
    treatment: TreatmentCost,
    months: number
  ): Array<{ month: number; cumulativeCost: number; date: Date }> {
    const timeline: Array<{ month: number; cumulativeCost: number; date: Date }> = [];

    const monthlyRate = treatment.totalPrice / 12;

    for (let i = 1; i <= months; i++) {
      const date = new Date(treatment.startDate);
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
