/**
 * Real-Time Skin Condition Alert System
 * Monitors skin changes and triggers intelligent alerts based on severity and trends
 */

export type SkinConcern = 'acne' | 'wrinkles' | 'redness' | 'texture' | 'pores' | 'pigmentation';

export interface VISIAAnalysisResult {
  id: string;
  userId: string;
  timestamp: Date;
  overallScore: number;
  scores: Record<SkinConcern, number>;
  details: Record<SkinConcern, unknown>;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertCategory = 'improvement' | 'degradation' | 'anomaly' | 'threshold';
export type AlertType = 'trend' | 'milestone' | 'warning' | 'achievement';

export interface SkinAlert {
  id: string;
  timestamp: Date;
  severity: AlertSeverity;
  category: AlertCategory;
  type: AlertType;
  title: string;
  message: string;
  concern: SkinConcern;
  previousValue: number;
  currentValue: number;
  changePercentage: number;
  recommendedAction: string;
  isRead: boolean;
  shouldNotify: boolean;
  targetAudience: 'customer' | 'staff' | 'both';
}

export interface AlertRule {
  concern: SkinConcern;
  thresholdDegradeation: number;
  thresholdImprovement: number;
  triggerTrendDays: number;
  criticalThreshold: number;
  warningThreshold: number;
}

export interface AlertTriggerConfig {
  enableTrendAnalysis: boolean;
  enableAnomalyDetection: boolean;
  enableThresholdMonitoring: boolean;
  minTrendDataPoints: number;
  anomalyStandardDeviations: number;
}

export interface AnalysisHistory {
  date: Date;
  scores: Record<SkinConcern, number>;
}

export class SkinConditionAlertSystem {
  // Default alert rules for each skin concern
  static readonly DEFAULT_ALERT_RULES: Record<SkinConcern, AlertRule> = {
    acne: {
      concern: 'acne',
      thresholdDegradeation: 15,
      thresholdImprovement: 10,
      triggerTrendDays: 7,
      criticalThreshold: 80,
      warningThreshold: 65,
    },
    wrinkles: {
      concern: 'wrinkles',
      thresholdDegradeation: 10,
      thresholdImprovement: 8,
      triggerTrendDays: 14,
      criticalThreshold: 75,
      warningThreshold: 60,
    },
    redness: {
      concern: 'redness',
      thresholdDegradeation: 12,
      thresholdImprovement: 8,
      triggerTrendDays: 7,
      criticalThreshold: 70,
      warningThreshold: 55,
    },
    texture: {
      concern: 'texture',
      thresholdDegradeation: 12,
      thresholdImprovement: 10,
      triggerTrendDays: 14,
      criticalThreshold: 75,
      warningThreshold: 60,
    },
    pores: {
      concern: 'pores',
      thresholdDegradeation: 12,
      thresholdImprovement: 9,
      triggerTrendDays: 14,
      criticalThreshold: 70,
      warningThreshold: 55,
    },
    pigmentation: {
      concern: 'pigmentation',
      thresholdDegradeation: 10,
      thresholdImprovement: 8,
      triggerTrendDays: 21,
      criticalThreshold: 75,
      warningThreshold: 60,
    },
  };

  /**
   * Analyze current vs previous analysis and generate alerts
   */
  static analyzeChanges(
    currentAnalysis: VISIAAnalysisResult,
    previousAnalysis: VISIAAnalysisResult | null,
    history: AnalysisHistory[] = [],
    config?: AlertTriggerConfig
  ): SkinAlert[] {
    const defaultConfig: AlertTriggerConfig = {
      enableTrendAnalysis: true,
      enableAnomalyDetection: true,
      enableThresholdMonitoring: true,
      minTrendDataPoints: 3,
      anomalyStandardDeviations: 2,
    };
    const finalConfig = config ?? defaultConfig;
    const alerts: SkinAlert[] = [];

    if (!previousAnalysis) {
      return alerts;
    }

    const concerns: SkinConcern[] = ['acne', 'wrinkles', 'redness', 'texture', 'pores', 'pigmentation'];

    for (const concern of concerns) {
      const currentScore = currentAnalysis.scores[concern] ?? 50;
      const previousScore = previousAnalysis.scores[concern] ?? 50;
      const changePercentage = ((currentScore - previousScore) / previousScore) * 100;
      const rule = this.DEFAULT_ALERT_RULES[concern];

      // Check for threshold changes
      if (finalConfig.enableThresholdMonitoring) {
        const thresholdAlerts = this.checkThresholdAlerts(
          concern,
          currentScore,
          previousScore,
          changePercentage,
          rule
        );
        alerts.push(...thresholdAlerts);
      }

      // Check for trend anomalies
      if (finalConfig.enableTrendAnalysis && history.length >= finalConfig.minTrendDataPoints) {
        const trendAlerts = this.analyzeTrends(concern, currentScore, previousScore, history, rule);
        alerts.push(...trendAlerts);
      }

      // Check for anomalies
      if (finalConfig.enableAnomalyDetection && history.length >= finalConfig.minTrendDataPoints) {
        const anomalyAlerts = this.detectAnomalies(
          concern,
          currentScore,
          history,
          finalConfig.anomalyStandardDeviations,
          rule
        );
        alerts.push(...anomalyAlerts);
      }
    }

    return alerts.sort((a, b) => {
      const severityOrder: Record<AlertSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Check if score changes cross important thresholds
   */
  private static checkThresholdAlerts(
    concern: SkinConcern,
    currentScore: number,
    previousScore: number,
    changePercentage: number,
    rule: AlertRule
  ): SkinAlert[] {
    const alerts: SkinAlert[] = [];
    const changeAmount = Math.abs(currentScore - previousScore);

    // Check for significant degradation
    if (currentScore > previousScore && changeAmount >= rule.thresholdDegradeation) {
      const severity: AlertSeverity = currentScore >= rule.criticalThreshold ? 'critical' : 'high';
      alerts.push({
        id: `alert_degrade_${concern}_${Date.now()}`,
        timestamp: new Date(),
        severity,
        category: 'degradation',
        type: 'warning',
        title: `${concern} Condition Worsening`,
        message: `${concern} score has increased by ${changeAmount.toFixed(1)} points. Current: ${currentScore.toFixed(1)}, Previous: ${previousScore.toFixed(1)}`,
        concern,
        previousValue: previousScore,
        currentValue: currentScore,
        changePercentage,
        recommendedAction:
          severity === 'critical'
            ? 'Please schedule an urgent consultation with your skincare specialist'
            : 'Consider intensifying your current skincare routine or consulting a specialist',
        isRead: false,
        shouldNotify: severity === 'critical' || severity === 'high',
        targetAudience: severity === 'critical' ? 'both' : 'customer',
      });
    }

    // Check for significant improvement
    if (currentScore < previousScore && changeAmount >= rule.thresholdImprovement) {
      const isSignificantImprovement = changeAmount > rule.thresholdImprovement * 1.5;
      alerts.push({
        id: `alert_improve_${concern}_${Date.now()}`,
        timestamp: new Date(),
        severity: isSignificantImprovement ? 'high' : 'medium',
        category: 'improvement',
        type: 'achievement',
        title: `Great ${concern} Improvement!`,
        message: `${concern} score has improved by ${changeAmount.toFixed(1)} points. Current: ${currentScore.toFixed(1)}, Previous: ${previousScore.toFixed(1)}`,
        concern,
        previousValue: previousScore,
        currentValue: currentScore,
        changePercentage: Math.abs(changePercentage),
        recommendedAction: 'Continue your current treatment regimen to maintain these results',
        isRead: false,
        shouldNotify: isSignificantImprovement,
        targetAudience: 'customer',
      });
    }

    return alerts;
  }

  /**
   * Analyze trends to detect concerning patterns
   */
  private static analyzeTrends(
    concern: SkinConcern,
    currentScore: number,
    previousScore: number,
    history: AnalysisHistory[],
    rule: AlertRule
  ): SkinAlert[] {
    const alerts: SkinAlert[] = [];

    if (history.length < 2) return alerts;

    // Extract concern scores over time (last 6 data points)
    const recentHistory = history.slice(-6).map((h) => ({
      date: h.date,
      score: h.scores[concern] ?? 50,
    }));

    // Calculate trend direction
    const firstScore = recentHistory[0].score;
    const lastScore = recentHistory.at(-1)?.score ?? recentHistory[0].score;
    const trendDirection = lastScore > firstScore ? 'worsening' : 'improving';

    // Count consecutive improvements or degradations
    let consecutiveChanges = 0;
    for (let i = 1; i < recentHistory.length; i++) {
      if (trendDirection === 'worsening' && recentHistory[i].score >= recentHistory[i - 1].score) {
        consecutiveChanges++;
      }
      if (trendDirection === 'improving' && recentHistory[i].score <= recentHistory[i - 1].score) {
        consecutiveChanges++;
      }
    }

    const consistentTrend = consecutiveChanges >= recentHistory.length - 2;
    const trendMagnitude = Math.abs(lastScore - firstScore);

    if (consistentTrend && trendDirection === 'worsening' && trendMagnitude > rule.thresholdDegradeation) {
      alerts.push({
        id: `alert_trend_${concern}_${Date.now()}`,
        timestamp: new Date(),
        severity: 'high',
        category: 'degradation',
        type: 'trend',
        title: `Persistent ${concern.charAt(0).toUpperCase() + concern.slice(1)} Worsening Trend`,
        message: `${concern} has been consistently worsening over the past ${recentHistory.length} measurements with a total change of ${trendMagnitude.toFixed(1)} points`,
        concern,
        previousValue: firstScore,
        currentValue: lastScore,
        changePercentage: ((lastScore - firstScore) / firstScore) * 100,
        recommendedAction: 'We recommend scheduling a consultation to adjust your treatment plan',
        isRead: false,
        shouldNotify: true,
        targetAudience: 'both',
      });
    } else if (consistentTrend && trendDirection === 'improving' && trendMagnitude > rule.thresholdImprovement) {
      alerts.push({
        id: `alert_trend_improve_${concern}_${Date.now()}`,
        timestamp: new Date(),
        severity: 'medium',
        category: 'improvement',
        type: 'trend',
        title: `Excellent ${concern.charAt(0).toUpperCase() + concern.slice(1)} Improvement Trend`,
        message: `${concern} has been consistently improving over the past ${recentHistory.length} measurements with a total improvement of ${trendMagnitude.toFixed(1)} points`,
        concern,
        previousValue: firstScore,
        currentValue: lastScore,
        changePercentage: Math.abs(((lastScore - firstScore) / firstScore) * 100),
        recommendedAction: 'Your current treatment plan is working well! Keep up the routine',
        isRead: false,
        shouldNotify: false,
        targetAudience: 'customer',
      });
    }

    return alerts;
  }

  /**
   * Detect statistical anomalies in the data
   */
  private static detectAnomalies(
    concern: SkinConcern,
    currentScore: number,
    history: AnalysisHistory[],
    standardDeviations: number,
    _rule: AlertRule
  ): SkinAlert[] {
    const alerts: SkinAlert[] = [];

    const scores = history.map((h) => h.scores[concern] ?? 50);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    const zScore = Math.abs((currentScore - mean) / (stdDev || 1));

    if (zScore > standardDeviations) {
      const isPositiveAnomaly = currentScore < mean;
      alerts.push({
        id: `alert_anomaly_${concern}_${Date.now()}`,
        timestamp: new Date(),
        severity: 'medium',
        category: 'anomaly',
        type: 'warning',
        title: `Unusual ${concern.charAt(0).toUpperCase() + concern.slice(1)} Score Detected`,
        message: `Your current ${concern} score (${currentScore.toFixed(1)}) is unusually ${isPositiveAnomaly ? 'good' : 'poor'} compared to your historical average (${mean.toFixed(1)})`,
        concern,
        previousValue: mean,
        currentValue: currentScore,
        changePercentage: ((currentScore - mean) / mean) * 100,
        recommendedAction: isPositiveAnomaly
          ? 'Verify this result as it may be a measurement error'
          : 'Please consult with your specialist to ensure your treatment is still appropriate',
        isRead: false,
        shouldNotify: !isPositiveAnomaly,
        targetAudience: isPositiveAnomaly ? 'customer' : 'both',
      });
    }

    return alerts;
  }

  /**
   * Generate milestone alerts (reaching improvement targets)
   */
  static generateMilestoneAlerts(
    currentAnalysis: VISIAAnalysisResult,
    goals: Record<SkinConcern, number>
  ): SkinAlert[] {
    const alerts: SkinAlert[] = [];
    const concerns: SkinConcern[] = ['acne', 'wrinkles', 'redness', 'texture', 'pores', 'pigmentation'];

    for (const concern of concerns) {
      const currentScore = currentAnalysis.scores[concern] ?? 50;
      const goalScore = goals[concern];

      if (goalScore === undefined) continue;

      // Check if milestone is achieved (within 5 points)
      if (Math.abs(currentScore - goalScore) <= 5 && currentScore <= goalScore) {
        alerts.push({
          id: `alert_milestone_${concern}_${Date.now()}`,
          timestamp: new Date(),
          severity: 'high',
          category: 'improvement',
          type: 'milestone',
          title: `${concern.charAt(0).toUpperCase() + concern.slice(1)} Goal Achieved!`,
          message: `Congratulations! You've reached your ${concern} improvement goal! Current score: ${currentScore.toFixed(1)}`,
          concern,
          previousValue: goalScore,
          currentValue: currentScore,
          changePercentage: 100,
          recommendedAction: 'Set a new goal or maintain your current routine to sustain these results',
          isRead: false,
          shouldNotify: true,
          targetAudience: 'customer',
        });
      }
    }

    return alerts;
  }

  /**
   * Get severity level based on score value
   */
  static getSeverityFromScore(score: number, concern: SkinConcern): AlertSeverity {
    const rule = this.DEFAULT_ALERT_RULES[concern];
    if (score >= rule.criticalThreshold) return 'critical';
    if (score >= rule.warningThreshold) return 'high';
    return 'low';
  }

  /**
   * Generate human-readable alert summary
   */
  static generateAlertSummary(alerts: SkinAlert[]): string {
    const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
    const highCount = alerts.filter((a) => a.severity === 'high').length;
    const mediumCount = alerts.filter((a) => a.severity === 'medium').length;
    const lowCount = alerts.filter((a) => a.severity === 'low').length;

    const parts: string[] = [];
    if (criticalCount > 0) parts.push(`${criticalCount} critical`);
    if (highCount > 0) parts.push(`${highCount} high`);
    if (mediumCount > 0) parts.push(`${mediumCount} medium`);
    if (lowCount > 0) parts.push(`${lowCount} low`);

    return parts.length > 0 ? `You have ${parts.join(', ')} severity alerts` : 'No alerts';
  }

  /**
   * Filter alerts by criteria
   */
  static filterAlerts(
    alerts: SkinAlert[],
    filters: {
      severity?: AlertSeverity[];
      category?: AlertCategory[];
      type?: AlertType[];
      isRead?: boolean;
      shouldNotify?: boolean;
    }
  ): SkinAlert[] {
    return alerts.filter((alert) => {
      if (filters.severity && !filters.severity.includes(alert.severity)) return false;
      if (filters.category && !filters.category.includes(alert.category)) return false;
      if (filters.type && !filters.type.includes(alert.type)) return false;
      if (filters.isRead !== undefined && alert.isRead !== filters.isRead) return false;
      if (filters.shouldNotify !== undefined && alert.shouldNotify !== filters.shouldNotify) return false;
      return true;
    });
  }
}
