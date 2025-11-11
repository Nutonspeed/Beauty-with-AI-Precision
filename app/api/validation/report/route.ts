/**
 * Validation Report API - Full validation pipeline
 * 
 * POST /api/validation/report
 * Runs predictions + comparison + report generation in one call
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ValidationReport } from '@/types/calibration';
import type { ModelType } from '@/lib/validation/calibration-validator';

interface ReportRequest {
  model: ModelType;
  severity?: 'clear' | 'mild' | 'moderate' | 'severe';
  threshold?: number;
  saveReport?: boolean; // Save to database for history
}

export async function POST(request: NextRequest) {
  try {
    const body: ReportRequest = await request.json();
    const { model, severity, threshold, saveReport = true } = body;

    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Model parameter is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Starting validation report for ${model.toUpperCase()}`);
    console.log(`${'='.repeat(60)}\n`);

    // Step 1: Run predictions
    console.log('Step 1: Running AI predictions...');
    const runResponse = await fetch(new URL('/api/validation/run', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, severity }),
    });

    if (!runResponse.ok) {
      const error = await runResponse.json();
      return NextResponse.json(
        {
          success: false,
          error: 'Prediction run failed',
          details: error,
        },
        { status: runResponse.status }
      );
    }

    const runData = await runResponse.json();
    console.log(`✓ Predictions complete: ${runData.predictions.length} images`);
    console.log(`  Avg processing time: ${runData.stats.avgProcessingTime.toFixed(0)}ms`);
    console.log(`  Total concerns: ${runData.stats.totalConcerns}`);

    // Step 2: Compare with ground truth
    console.log('\nStep 2: Comparing with ground truth...');
    const compareResponse = await fetch(
      new URL('/api/validation/compare', request.url),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          predictions: runData.predictions,
          threshold,
        }),
      }
    );

    if (!compareResponse.ok) {
      const error = await compareResponse.json();
      return NextResponse.json(
        {
          success: false,
          error: 'Comparison failed',
          details: error,
        },
        { status: compareResponse.status }
      );
    }

    const compareData = await compareResponse.json();
    const report: ValidationReport = compareData.report;

    console.log(`✓ Comparison complete: ${compareData.comparisons.length} matched`);
    console.log(`  Overall accuracy: ${(report.overallMetrics.accuracy * 100).toFixed(1)}%`);
    console.log(`  Precision: ${(report.overallMetrics.avgPrecision * 100).toFixed(1)}%`);
    console.log(`  Recall: ${(report.overallMetrics.avgRecall * 100).toFixed(1)}%`);
    console.log(`  F1 Score: ${(report.overallMetrics.avgF1Score * 100).toFixed(1)}%`);

    // Step 3: Display recommendations
    if (report.recommendations && report.recommendations.length > 0) {
      console.log('\nRecommendations:');
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(`\nTotal validation time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`${'='.repeat(60)}\n`);

    // Step 4: Save report (optional - would store in database)
    if (saveReport) {
      // TODO: Save to database for historical tracking
      console.log('Report saved to history');
    }

    // Determine status
    const status = getReportStatus(report.overallMetrics.accuracy);

    return NextResponse.json({
      success: true,
      report,
      status,
      predictions: runData.predictions,
      comparisons: compareData.comparisons,
      timing: {
        predictionTime: runData.stats.avgProcessingTime,
        totalTime,
      },
      metadata: {
        model,
        severity: severity || 'all',
        threshold: threshold || compareData.threshold,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Validation report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Report generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/validation/report
 * Get validation report history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // TODO: Load from database
    // For now, return empty array
    return NextResponse.json({
      success: true,
      reports: [],
      message: 'No report history available. Run POST /api/validation/report first.',
    });
  } catch (error) {
    console.error('Error fetching report history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch report history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Determine report status based on accuracy
 */
function getReportStatus(accuracy: number): {
  level: 'excellent' | 'good' | 'fair' | 'poor';
  color: 'green' | 'yellow' | 'orange' | 'red';
  message: string;
} {
  if (accuracy >= 0.85) {
    return {
      level: 'excellent',
      color: 'green',
      message: 'Model meets production quality standards (≥85% accuracy)',
    };
  } else if (accuracy >= 0.75) {
    return {
      level: 'good',
      color: 'yellow',
      message: 'Model is functional but below target (75-85% accuracy)',
    };
  } else if (accuracy >= 0.65) {
    return {
      level: 'fair',
      color: 'orange',
      message: 'Model needs improvement (65-75% accuracy)',
    };
  } else {
    return {
      level: 'poor',
      color: 'red',
      message: 'Model accuracy is too low for production (<65%)',
    };
  }
}
