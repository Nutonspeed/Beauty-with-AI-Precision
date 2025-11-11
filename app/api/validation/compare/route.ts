/**
 * Validation Compare API - Compare AI predictions with ground truth
 * 
 * POST /api/validation/compare
 * Compares predictions with expert annotations and calculates metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import type {
  GroundTruthAnnotation,
  AIPredictionComparison,
  SeverityLevel,
  ConcernType,
} from '@/types/calibration';
import {
  comparePredictionWithGroundTruth,
  generateValidationReport,
  type ModelType,
} from '@/lib/validation/calibration-validator';

interface CompareRequest {
  model: ModelType;
  predictions: Array<{
    annotationId: string;
    severityLevel: SeverityLevel;
    concerns: Array<{
      type: ConcernType;
      confidence: number;
      location: { x: number; y: number; width?: number; height?: number };
    }>;
  }>;
  threshold?: number; // Confidence threshold (default: model-specific)
}

export async function POST(request: NextRequest) {
  try {
    const body: CompareRequest = await request.json();
    const { model, predictions, threshold } = body;

    if (!model || !predictions || predictions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Required: model and predictions array',
        },
        { status: 400 }
      );
    }

    // Load ground truth annotations from API
    const groundTruthResponse = await fetch(
      new URL('/api/validation/ground-truth', request.url)
    );

    if (!groundTruthResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ground truth not available',
          message: 'Could not load ground truth annotations. Ensure calibration dataset exists.',
        },
        { status: 404 }
      );
    }

    const groundTruthData = await groundTruthResponse.json();
    const groundTruths: GroundTruthAnnotation[] = groundTruthData.annotations;

    if (!groundTruths || groundTruths.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No ground truth annotations found',
          message: 'Add expert annotations to calibration dataset first.',
        },
        { status: 404 }
      );
    }

    console.log(`Comparing ${predictions.length} predictions with ${groundTruths.length} ground truths...`);

    // Match predictions with ground truth and calculate metrics
    const comparisons: AIPredictionComparison[] = [];
    const unmatched: string[] = [];

    for (const prediction of predictions) {
      // Find matching ground truth by annotation ID
      const groundTruth = groundTruths.find(
        (gt) => gt.annotationId === prediction.annotationId
      );

      if (!groundTruth) {
        unmatched.push(prediction.annotationId);
        console.warn(`No ground truth found for ${prediction.annotationId}`);
        continue;
      }

      // Compare prediction with ground truth
      const comparison = comparePredictionWithGroundTruth(
        groundTruth,
        {
          severityLevel: prediction.severityLevel,
          concerns: prediction.concerns,
          model,
        },
        threshold
      );

      comparisons.push(comparison);

      console.log(
        `✓ ${prediction.annotationId}: ` +
        `Severity ${comparison.metrics.severityMatch ? '✓' : '✗'}, ` +
        `P=${comparison.metrics.precision.toFixed(2)}, ` +
        `R=${comparison.metrics.recall.toFixed(2)}, ` +
        `F1=${comparison.metrics.f1Score.toFixed(2)}`
      );
    }

    if (comparisons.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid comparisons',
          message: 'None of the predictions matched ground truth annotation IDs.',
          unmatched,
        },
        { status: 400 }
      );
    }

    // Generate validation report
    const report = generateValidationReport(comparisons, model);

    return NextResponse.json({
      success: true,
      model,
      threshold: threshold || report.thresholdSuggestions?.currentThreshold,
      comparisons,
      report,
      stats: {
        totalComparisons: comparisons.length,
        unmatchedPredictions: unmatched.length,
        avgPrecision: report.overallMetrics.avgPrecision,
        avgRecall: report.overallMetrics.avgRecall,
        avgF1Score: report.overallMetrics.avgF1Score,
        accuracy: report.overallMetrics.accuracy,
      },
      unmatched: unmatched.length > 0 ? unmatched : undefined,
    });
  } catch (error) {
    console.error('Validation compare error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Comparison failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/validation/compare
 * Get validation comparison history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');

    // For now, return empty array
    // In production, this would load from database
    return NextResponse.json({
      success: true,
      comparisons: [],
      message: 'No comparison history available. Run POST /api/validation/compare first.',
    });
  } catch (error) {
    console.error('Error fetching comparison history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch comparison history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
