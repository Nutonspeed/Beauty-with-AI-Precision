/**
 * AI Model Validation & Testing Utilities
 * Validates AI analysis results for accuracy and consistency
 */

import type { EnsembleAnalysisResult } from "./multi-model-analyzer"
import type { SkinAnalysisResult } from "./tensorflow-analyzer"

export interface ValidationResult {
  isValid: boolean
  confidence: number
  issues: string[]
  warnings: string[]
  recommendations: string[]
}

export interface ModelPerformanceMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  processingTime: number
  modelName: string
}

/**
 * Validates the structure and quality of AI ensemble analysis results
 */
export function validateAnalysisResult(
  result: EnsembleAnalysisResult
): { valid: boolean; issues: string[] } {
  const issues: string[] = []

  // Check if visiaScores exist and are valid
  if (result.visiaScores) {
    // Validate visiaScore values (0-100)
    const scores = Object.entries(result.visiaScores)
    for (const [key, value] of scores) {
      if (typeof value !== "number" || value < 0 || value > 100) {
        issues.push(`Invalid score for ${key}: ${value}`)
      }
    }
  } else {
    issues.push("Missing visiaScores")
  }

  // Check confidence levels
  if (result.confidence < 0.7) {
    issues.push("Low overall confidence - results may be less accurate")
  }

  // Check for model agreement in concerns
  if (result.concerns.length > 0) {
    const lowAgreement = result.concerns.filter(c => c.agreementScore < 2)
    if (lowAgreement.length > 0) {
      issues.push("Some concerns have low model agreement")
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Compare two TensorFlow analysis results for consistency
 */
export function compareAnalysisResults(
  result1: SkinAnalysisResult,
  result2: SkinAnalysisResult,
): {
  similarity: number
  differences: Array<{ metric: string; diff: number }>
} {
  const differences: Array<{ metric: string; diff: number }> = []
  let totalDiff = 0

  // Compare visiaMetrics
  const metrics1 = result1.visiaMetrics
  const metrics2 = result2.visiaMetrics

  for (const metric of Object.keys(metrics1)) {
    const score1 = metrics1[metric] || 0
    const score2 = metrics2[metric] || 0
    const diff = Math.abs(score1 - score2)

    differences.push({ metric, diff })
    totalDiff += diff
  }

  const avgDiff = totalDiff / differences.length
  const similarity = Math.max(0, 100 - avgDiff)

  return { similarity, differences }
}

/**
 * Test model performance with ground truth data
 */
export function calculateModelPerformance(
  predictions: number[],
  groundTruth: number[],
  modelName: string,
  processingTime: number,
): ModelPerformanceMetrics {
  if (predictions.length !== groundTruth.length) {
    throw new Error("Predictions and ground truth must have same length")
  }

  let truePositives = 0
  let falsePositives = 0
  let trueNegatives = 0
  let falseNegatives = 0

  // Binary classification (threshold at 50)
  for (let i = 0; i < predictions.length; i++) {
    const predicted = predictions[i] > 50
    const actual = groundTruth[i] > 50

    if (predicted && actual) truePositives++
    else if (predicted && !actual) falsePositives++
    else if (!predicted && !actual) trueNegatives++
    else falseNegatives++
  }

  const accuracy = (truePositives + trueNegatives) / predictions.length
  const precision = truePositives / (truePositives + falsePositives) || 0
  const recall = truePositives / (truePositives + falseNegatives) || 0
  const f1Score = (2 * (precision * recall)) / (precision + recall) || 0

  return {
    accuracy,
    precision,
    recall,
    f1Score,
    processingTime,
    modelName,
  }
}

/**
 * Generate validation report
 */
export function generateValidationReport(result: SkinAnalysisResult, validation: ValidationResult): string {
  const lines: string[] = [
    "=== AI Analysis Validation Report ===",
    "",
    `Status: ${validation.isValid ? "✅ VALID" : "❌ INVALID"}`,
    `Confidence: ${(validation.confidence * 100).toFixed(1)}%`,
    `Processing Time: ${result.processingTime.toFixed(0)}ms`,
    "",
  ]

  if (validation.issues.length > 0) {
    lines.push("Issues:")
    for (const issue of validation.issues) {
      lines.push(`  ❌ ${issue}`)
    }
    lines.push("")
  }

  if (validation.warnings.length > 0) {
    lines.push("Warnings:")
    for (const warning of validation.warnings) {
      lines.push(`  ⚠️ ${warning}`)
    }
    lines.push("")
  }

  if (validation.recommendations.length > 0) {
    lines.push("Recommendations:")
    for (const rec of validation.recommendations) {
      lines.push(`  💡 ${rec}`)
    }
    lines.push("")
  }

  lines.push("VISIA Metrics:")
  for (const [key, value] of Object.entries(result.visiaMetrics)) {
    lines.push(`  ${key}: ${value.toFixed(1)}`)
  }

  return lines.join("\n")
}
