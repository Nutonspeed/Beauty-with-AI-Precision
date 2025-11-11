/**
 * Calibration Dataset Validator
 * 
 * Compares AI predictions against expert-annotated ground truth
 * Generates validation reports with accuracy metrics
 */

import {
  GroundTruthAnnotation,
  AIPredictionComparison,
  ValidationReport,
  SeverityLevel,
  ConcernType,
} from '@/types/calibration';

/**
 * Confidence thresholds for each model
 */
export const DEFAULT_THRESHOLDS = {
  mediapipe: 0.65,
  tensorflow: 0.60,
  huggingface: 0.70,
  ensemble: 0.65,
} as const;

export type ModelType = keyof typeof DEFAULT_THRESHOLDS;

/**
 * Calculate Intersection over Union (IoU) for location accuracy
 */
function calculateIoU(
  pred: { x: number; y: number; width?: number; height?: number },
  actual: { x: number; y: number; width?: number; height?: number }
): number {
  // For point predictions, use distance-based similarity
  if (!pred.width || !pred.height || !actual.width || !actual.height) {
    const distance = Math.sqrt(
      Math.pow(pred.x - actual.x, 2) + Math.pow(pred.y - actual.y, 2)
    );
    // Convert distance to similarity score (0-1)
    // Threshold: 0.05 distance = perfect match, 0.2+ = no match
    return Math.max(0, 1 - distance / 0.2);
  }

  // For bounding boxes, calculate actual IoU
  const x1 = Math.max(pred.x, actual.x);
  const y1 = Math.max(pred.y, actual.y);
  const x2 = Math.min(pred.x + pred.width, actual.x + actual.width);
  const y2 = Math.min(pred.y + pred.height, actual.y + actual.height);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const predArea = pred.width * pred.height;
  const actualArea = actual.width * actual.height;
  const union = predArea + actualArea - intersection;

  return union > 0 ? intersection / union : 0;
}

/**
 * Compare AI prediction with ground truth annotation
 */
export function comparePredictionWithGroundTruth(
  groundTruth: GroundTruthAnnotation,
  aiPrediction: {
    severityLevel: SeverityLevel;
    concerns: Array<{
      type: ConcernType;
      confidence: number;
      location: { x: number; y: number; width?: number; height?: number };
    }>;
    model: ModelType;
  },
  threshold: number = 0.65
): AIPredictionComparison {
  // Filter AI predictions by confidence threshold
  const filteredConcerns = aiPrediction.concerns.filter(
    (c) => c.confidence >= threshold
  );

  // Match predictions with ground truth
  const matched = new Set<number>();
  const truePositives: Array<{ type: ConcernType; iou: number }> = [];
  
  for (const pred of filteredConcerns) {
    let bestMatch = -1;
    let bestIoU = 0;
    
    // Find best matching ground truth concern
    for (let i = 0; i < groundTruth.concerns.length; i++) {
      if (matched.has(i)) continue;
      
      const gt = groundTruth.concerns[i];
      if (gt.type !== pred.type) continue;
      
      const iou = calculateIoU(pred.location, gt.location);
      
      // Require minimum IoU of 0.3 for a match
      if (iou > 0.3 && iou > bestIoU) {
        bestIoU = iou;
        bestMatch = i;
      }
    }
    
    if (bestMatch >= 0) {
      matched.add(bestMatch);
      truePositives.push({ type: pred.type, iou: bestIoU });
    }
  }

  const tp = truePositives.length;
  const fp = filteredConcerns.length - tp;
  const fn = groundTruth.concerns.length - tp;

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0 
    ? 2 * (precision * recall) / (precision + recall) 
    : 0;

  const averageIoU = truePositives.length > 0
    ? truePositives.reduce((sum, m) => sum + m.iou, 0) / truePositives.length
    : 0;

  return {
    annotationId: groundTruth.annotationId,
    aiPrediction: {
      severityLevel: aiPrediction.severityLevel,
      concerns: filteredConcerns,
      model: aiPrediction.model,
      predictedAt: new Date().toISOString(),
    },
    metrics: {
      severityMatch: aiPrediction.severityLevel === groundTruth.severityLevel,
      precision,
      recall,
      f1Score,
      truePositives: tp,
      falsePositives: fp,
      falseNegatives: fn,
      averageIoU,
    },
  };
}

/**
 * Generate validation report for entire calibration dataset
 */
export function generateValidationReport(
  comparisons: AIPredictionComparison[],
  model: ModelType,
  currentThreshold: number = 0.65
): ValidationReport {
  if (comparisons.length === 0) {
    throw new Error('No comparisons provided');
  }

  // Overall metrics
  const totalImages = comparisons.length;
  const correctSeverity = comparisons.filter((c) => c.metrics.severityMatch).length;
  const accuracy = correctSeverity / totalImages;

  const avgPrecision = comparisons.reduce((sum, c) => sum + c.metrics.precision, 0) / totalImages;
  const avgRecall = comparisons.reduce((sum, c) => sum + c.metrics.recall, 0) / totalImages;
  const avgF1Score = comparisons.reduce((sum, c) => sum + c.metrics.f1Score, 0) / totalImages;

  // Breakdown by severity level
  const severityBreakdown: ValidationReport['severityBreakdown'] = {
    clear: { accuracy: 0, precision: 0, recall: 0, f1Score: 0, sampleCount: 0 },
    mild: { accuracy: 0, precision: 0, recall: 0, f1Score: 0, sampleCount: 0 },
    moderate: { accuracy: 0, precision: 0, recall: 0, f1Score: 0, sampleCount: 0 },
    severe: { accuracy: 0, precision: 0, recall: 0, f1Score: 0, sampleCount: 0 },
  };

  // Group by actual severity level (from ground truth)
  const bySeverity: Record<SeverityLevel, AIPredictionComparison[]> = {
    [SeverityLevel.CLEAR]: [],
    [SeverityLevel.MILD]: [],
    [SeverityLevel.MODERATE]: [],
    [SeverityLevel.SEVERE]: [],
  };

  // Note: We need to load ground truth to get actual severity
  // For now, we'll infer from concern count in AI prediction
  for (const comp of comparisons) {
    const concernCount = comp.aiPrediction.concerns.length;
    let severity: SeverityLevel;
    if (concernCount <= 5) severity = SeverityLevel.CLEAR;
    else if (concernCount <= 15) severity = SeverityLevel.MILD;
    else if (concernCount <= 30) severity = SeverityLevel.MODERATE;
    else severity = SeverityLevel.SEVERE;
    
    bySeverity[severity].push(comp);
  }

  // Calculate metrics per severity
  for (const [severity, comps] of Object.entries(bySeverity) as [SeverityLevel, AIPredictionComparison[]][]) {
    if (comps.length === 0) continue;

    const correct = comps.filter((c) => c.metrics.severityMatch).length;
    const precision = comps.reduce((sum, c) => sum + c.metrics.precision, 0) / comps.length;
    const recall = comps.reduce((sum, c) => sum + c.metrics.recall, 0) / comps.length;
    const f1Score = comps.reduce((sum, c) => sum + c.metrics.f1Score, 0) / comps.length;

    severityBreakdown[severity] = {
      accuracy: correct / comps.length,
      precision,
      recall,
      f1Score,
      sampleCount: comps.length,
    };
  }

  // Confusion matrix
  const confusionMatrix: ValidationReport['confusionMatrix'] = [];
  const severityLevels: SeverityLevel[] = [SeverityLevel.CLEAR, SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE];

  for (const actual of severityLevels) {
    for (const predicted of severityLevels) {
      const count = comparisons.filter(
        (c) =>
          // This is simplified - need actual ground truth data
          c.aiPrediction.severityLevel === predicted
      ).length;

      if (count > 0) {
        confusionMatrix.push({ predicted, actual, count });
      }
    }
  }

  // Per-concern type metrics
  const concernTypeMetrics: ValidationReport['concernTypeMetrics'] = {};
  const concernTypes = new Set<ConcernType>();

  comparisons.forEach((c) => {
    c.aiPrediction.concerns.forEach((concern) => {
      concernTypes.add(concern.type);
    });
  });

  for (const type of concernTypes) {
    const relevantComps = comparisons.filter((c) =>
      c.aiPrediction.concerns.some((concern) => concern.type === type)
    );

    if (relevantComps.length === 0) continue;

    const precision = relevantComps.reduce((sum, c) => sum + c.metrics.precision, 0) / relevantComps.length;
    const recall = relevantComps.reduce((sum, c) => sum + c.metrics.recall, 0) / relevantComps.length;
    const f1Score = relevantComps.reduce((sum, c) => sum + c.metrics.f1Score, 0) / relevantComps.length;

    concernTypeMetrics[type] = {
      precision,
      recall,
      f1Score,
      sampleCount: relevantComps.length,
    };
  }

  // Recommendations
  const recommendations: string[] = [];

  if (accuracy < 0.85) {
    recommendations.push(
      `Overall accuracy (${(accuracy * 100).toFixed(1)}%) is below target (85%). Consider adjusting threshold or retraining model.`
    );
  }

  if (avgPrecision < 0.8) {
    recommendations.push(
      `Precision (${(avgPrecision * 100).toFixed(1)}%) is below target (80%). Model is detecting too many false positives. Increase confidence threshold.`
    );
  }

  if (avgRecall < 0.8) {
    recommendations.push(
      `Recall (${(avgRecall * 100).toFixed(1)}%) is below target (80%). Model is missing true concerns. Decrease confidence threshold or improve model sensitivity.`
    );
  }

  // Check for severe class-specific issues
  for (const [severity, metrics] of Object.entries(severityBreakdown)) {
    if (metrics.sampleCount > 0 && metrics.accuracy < 0.7) {
      recommendations.push(
        `Low accuracy (${(metrics.accuracy * 100).toFixed(1)}%) for ${severity} severity. Review ${severity} training data quality.`
      );
    }
  }

  // Threshold suggestions (optimize for best F1)
  const thresholdSuggestions: {
    currentThreshold: number;
    suggestedThreshold: number;
    expectedImprovement: number;
  } = {
    currentThreshold: currentThreshold,
    suggestedThreshold: currentThreshold,
    expectedImprovement: 0,
  };

  // Simple suggestion: if precision low, increase threshold
  // if recall low, decrease threshold
  if (avgPrecision < avgRecall - 0.1) {
    thresholdSuggestions.suggestedThreshold = Math.min(0.95, currentThreshold + 0.05);
    thresholdSuggestions.expectedImprovement = 0.05;
    recommendations.push(
      `Try increasing threshold to ${thresholdSuggestions.suggestedThreshold.toFixed(2)} to reduce false positives.`
    );
  } else if (avgRecall < avgPrecision - 0.1) {
    thresholdSuggestions.suggestedThreshold = Math.max(0.5, currentThreshold - 0.05);
    thresholdSuggestions.expectedImprovement = 0.05;
    recommendations.push(
      `Try decreasing threshold to ${thresholdSuggestions.suggestedThreshold.toFixed(2)} to catch more concerns.`
    );
  }

  return {
    reportId: `VAL-${Date.now()}-${model.toUpperCase()}`,
    model,
    generatedAt: new Date().toISOString(),
    overallMetrics: {
      accuracy,
      avgPrecision,
      avgRecall,
      avgF1Score,
      totalImages,
    },
    severityBreakdown,
    confusionMatrix,
    concernTypeMetrics,
    recommendations,
    thresholdSuggestions,
  };
}

/**
 * Default threshold range for optimization
 */
const DEFAULT_THRESHOLD_RANGE = {
  min: 0.5,
  max: 0.95,
  step: 0.05,
};

/**
 * Calculate optimal threshold for best F1 score
 */
export function findOptimalThreshold(
  groundTruths: GroundTruthAnnotation[],
  predictions: Array<{
    annotationId: string;
    concerns: Array<{
      type: ConcernType;
      confidence: number;
      location: { x: number; y: number; width?: number; height?: number };
    }>;
    severityLevel: SeverityLevel;
    model: ModelType;
  }>,
  thresholdRange: { min: number; max: number; step: number } = DEFAULT_THRESHOLD_RANGE
): { threshold: number; f1Score: number; precision: number; recall: number } {
  let bestThreshold = 0.65;
  let bestF1 = 0;
  let bestPrecision = 0;
  let bestRecall = 0;

  for (let threshold = thresholdRange.min; threshold <= thresholdRange.max; threshold += thresholdRange.step) {
    const comparisons = predictions.map((pred) => {
      const gt = groundTruths.find((g) => g.annotationId === pred.annotationId);
      if (!gt) throw new Error(`Ground truth not found for ${pred.annotationId}`);

      return comparePredictionWithGroundTruth(gt, pred, threshold);
    });

    const avgF1 = comparisons.reduce((sum, c) => sum + c.metrics.f1Score, 0) / comparisons.length;
    const avgPrecision = comparisons.reduce((sum, c) => sum + c.metrics.precision, 0) / comparisons.length;
    const avgRecall = comparisons.reduce((sum, c) => sum + c.metrics.recall, 0) / comparisons.length;

    if (avgF1 > bestF1) {
      bestF1 = avgF1;
      bestThreshold = threshold;
      bestPrecision = avgPrecision;
      bestRecall = avgRecall;
    }
  }

  return {
    threshold: bestThreshold,
    f1Score: bestF1,
    precision: bestPrecision,
    recall: bestRecall,
  };
}

/**
 * Load ground truth annotations from calibration dataset
 */
export async function loadGroundTruthAnnotations(
  directory: string = 'test-images/calibration/annotations'
): Promise<GroundTruthAnnotation[]> {
  // This would load from filesystem in Node.js environment
  // For browser, we'll need an API endpoint
  throw new Error('Not implemented - use API endpoint /api/validation/ground-truth');
}

/**
 * Format metrics for display
 */
export function formatMetrics(value: number, format: 'percentage' | 'decimal' = 'percentage'): string {
  if (format === 'percentage') {
    return `${(value * 100).toFixed(1)}%`;
  }
  return value.toFixed(3);
}

/**
 * Get color for metric based on thresholds
 */
export function getMetricColor(
  value: number,
  thresholds: { good: number; warning: number }
): 'success' | 'warning' | 'error' {
  if (value >= thresholds.good) return 'success';
  if (value >= thresholds.warning) return 'warning';
  return 'error';
}

/**
 * Get status badge for validation report
 */
export function getValidationStatus(accuracy: number): {
  label: string;
  color: 'success' | 'warning' | 'error';
  description: string;
} {
  if (accuracy >= 0.85) {
    return {
      label: 'Excellent',
      color: 'success',
      description: 'Model meets production quality standards (≥85% accuracy)',
    };
  } else if (accuracy >= 0.75) {
    return {
      label: 'Good',
      color: 'warning',
      description: 'Model is functional but below target (75-85% accuracy)',
    };
  } else {
    return {
      label: 'Needs Improvement',
      color: 'error',
      description: 'Model accuracy is too low for production (<75%)',
    };
  }
}
