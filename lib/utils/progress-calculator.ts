/**
 * Progress Calculation Utilities
 * Calculate improvements, trends, and predictions
 */

import type { HybridSkinAnalysis } from "@/lib/types/skin-analysis"

export interface ProgressMetrics {
  overallImprovement: number
  parameterImprovements: {
    spots: number
    pores: number
    wrinkles: number
    texture: number
    redness: number
  }
  trend: "improving" | "stable" | "declining"
  velocity: number // Rate of improvement per week
  projectedScore: number // Projected score in 4 weeks
}

export interface GoalProgress {
  goalId: string
  parameter: string
  targetValue: number
  currentValue: number
  startValue: number
  progress: number // 0-100%
  estimatedWeeksToGoal: number
  onTrack: boolean
}

export class ProgressCalculator {
  /**
   * Calculate progress between two analyses
   */
  static calculateProgress(before: HybridSkinAnalysis, after: HybridSkinAnalysis): ProgressMetrics {
    // Calculate overall improvement
    const beforeScore = this.calculateOverallScore(before)
    const afterScore = this.calculateOverallScore(after)
    const overallImprovement = afterScore - beforeScore

    // Calculate parameter improvements
    const parameterImprovements = {
      spots: after.overallScore.spots - before.overallScore.spots,
      pores: after.overallScore.pores - before.overallScore.pores,
      wrinkles: after.overallScore.wrinkles - before.overallScore.wrinkles,
      texture: after.overallScore.texture - before.overallScore.texture,
      redness: after.overallScore.redness - before.overallScore.redness,
    }

    // Determine trend
    const trend = overallImprovement > 1 ? "improving" : overallImprovement < -1 ? "declining" : "stable"

    // Calculate velocity (improvement per week)
    const daysDiff = Math.max(1, (after.timestamp.getTime() - before.timestamp.getTime()) / (1000 * 60 * 60 * 24))
    const weeksDiff = daysDiff / 7
    const velocity = overallImprovement / weeksDiff

    // Project score in 4 weeks
    const projectedScore = Math.min(100, Math.max(0, afterScore + velocity * 4))

    return {
      overallImprovement,
      parameterImprovements,
      trend,
      velocity,
      projectedScore,
    }
  }

  /**
   * Calculate overall score from analysis
   */
  static calculateOverallScore(analysis: HybridSkinAnalysis): number {
    const scores = analysis.overallScore
    return (scores.spots + scores.pores + scores.wrinkles + scores.texture + scores.redness + scores.pigmentation) / 6
  }

  /**
   * Calculate goal progress
   */
  static calculateGoalProgress(
    goal: { parameter: string; targetValue: number },
    analyses: HybridSkinAnalysis[],
  ): GoalProgress | null {
    if (analyses.length === 0) return null

    const sortedAnalyses = [...analyses].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    const firstAnalysis = sortedAnalyses[0]
    const latestAnalysis = sortedAnalyses[sortedAnalyses.length - 1]

    const startValue = this.getParameterValue(firstAnalysis, goal.parameter)
    const currentValue = this.getParameterValue(latestAnalysis, goal.parameter)
    const targetValue = goal.targetValue

    // Calculate progress percentage
    const totalImprovement = targetValue - startValue
    const currentImprovement = currentValue - startValue
    const progress = Math.min(100, Math.max(0, (currentImprovement / totalImprovement) * 100))

    // Calculate velocity and estimate time to goal
    const daysDiff = Math.max(
      1,
      (latestAnalysis.timestamp.getTime() - firstAnalysis.timestamp.getTime()) / (1000 * 60 * 60 * 24),
    )
    const improvementRate = currentImprovement / daysDiff
    const remainingImprovement = targetValue - currentValue
    const estimatedDaysToGoal = improvementRate > 0 ? remainingImprovement / improvementRate : Number.POSITIVE_INFINITY
    const estimatedWeeksToGoal = Math.ceil(estimatedDaysToGoal / 7)

    // Determine if on track (should reach goal in reasonable time)
    const onTrack = estimatedWeeksToGoal <= 12 && improvementRate > 0

    return {
      goalId: `goal-${goal.parameter}`,
      parameter: goal.parameter,
      targetValue,
      currentValue,
      startValue,
      progress,
      estimatedWeeksToGoal,
      onTrack,
    }
  }

  /**
   * Get parameter value from analysis
   */
  private static getParameterValue(analysis: HybridSkinAnalysis, parameter: string): number {
    const scores = analysis.overallScore
    switch (parameter) {
      case "spots":
        return scores.spots
      case "pores":
        return scores.pores
      case "wrinkles":
        return scores.wrinkles
      case "texture":
        return scores.texture
      case "redness":
        return scores.redness
      case "pigmentation":
        return scores.pigmentation
      case "overall":
        return this.calculateOverallScore(analysis)
      default:
        return 0
    }
  }

  /**
   * Generate progress insights
   */
  static generateInsights(analyses: HybridSkinAnalysis[]): string[] {
    if (analyses.length < 2) {
      return ["Upload more analyses to track your progress over time."]
    }

    const insights: string[] = []
    const sortedAnalyses = [...analyses].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    const first = sortedAnalyses[0]
    const latest = sortedAnalyses[sortedAnalyses.length - 1]
    const progress = this.calculateProgress(first, latest)

    // Overall trend insight
    if (progress.trend === "improving") {
      insights.push(
        `Great progress! Your skin health has improved by ${Math.abs(progress.overallImprovement).toFixed(1)} points.`,
      )
    } else if (progress.trend === "declining") {
      insights.push(
        `Your skin health has declined by ${Math.abs(progress.overallImprovement).toFixed(1)} points. Consider adjusting your skincare routine.`,
      )
    } else {
      insights.push("Your skin health is stable. Keep up your current routine.")
    }

    // Best improvement
    const improvements = Object.entries(progress.parameterImprovements)
    const bestImprovement = improvements.reduce((best, current) => (current[1] > best[1] ? current : best))
    if (bestImprovement[1] > 1) {
      insights.push(
        `Your ${bestImprovement[0]} has shown the most improvement (+${bestImprovement[1].toFixed(1)} points).`,
      )
    }

    // Area needing attention
    const worstImprovement = improvements.reduce((worst, current) => (current[1] < worst[1] ? current : worst))
    if (worstImprovement[1] < -1) {
      insights.push(
        `Focus on improving your ${worstImprovement[0]}, which has declined by ${Math.abs(worstImprovement[1]).toFixed(1)} points.`,
      )
    }

    // Projection
    if (progress.velocity > 0.5) {
      insights.push(`At your current rate, you could reach ${progress.projectedScore.toFixed(0)} points in 4 weeks.`)
    }

    return insights
  }
}
