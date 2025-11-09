/**
 * Outcome Prediction API
 * Phase 3 Week 8-9 Task 8.1
 * 
 * POST /api/predictions/outcome
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  createOutcomePredictor,
  type PredictionInput,
} from '@/lib/ml/outcome-predictor';

// =============================================
// Types
// =============================================

interface PredictionRequest {
  analysisId: string;
  treatmentPlanId?: string;
}

// =============================================
// POST Handler
// =============================================

export async function POST(request: NextRequest) {
  try {
    // Parse request
    const body = (await request.json()) as PredictionRequest;
    const { analysisId, treatmentPlanId } = body;

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify analysis ownership
    const { data: analysis, error: analysisError } = await supabase
      .from('skin_analyses')
      .select('id, user_id')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    if (analysis.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have access to this analysis' },
        { status: 403 }
      );
    }

    // Check cache for recent prediction
    const { data: cachedPrediction } = await supabase
      .from('outcome_predictions')
      .select('*')
      .eq('analysis_id', analysisId)
      .eq('customer_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 days
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cachedPrediction) {
      // Return cached prediction
      return NextResponse.json(
        {
          success: true,
          prediction: {
            ...cachedPrediction,
            cached: true,
          },
          message: 'Returning cached prediction',
        },
        { status: 200 }
      );
    }

    // Generate new prediction
    const predictor = createOutcomePredictor();
    const input: PredictionInput = {
      customerId: user.id,
      currentAnalysisId: analysisId,
      treatmentPlanId,
    };

    const prediction = await predictor.predict(input);

    // Save prediction to database
    const { data: savedPrediction, error: saveError } = await supabase
      .from('outcome_predictions')
      .insert({
        customer_id: user.id,
        analysis_id: analysisId,
        treatment_plan_id: treatmentPlanId,
        predicted_overall_score: prediction.predictedOverallScore,
        predicted_concerns: prediction.predictedConcerns,
        expected_improvement: prediction.expectedImprovement,
        expected_improvement_percent: prediction.expectedImprovementPercent,
        confidence: prediction.confidence,
        confidence_level: prediction.confidenceLevel,
        key_factors: prediction.keyFactors,
        recommendations: prediction.recommendations,
        recommendations_th: prediction.recommendationsTh,
        prediction_horizon: prediction.predictionHorizon,
        prediction_date: prediction.predictionDate,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save prediction:', saveError);
      // Continue anyway, return prediction
    }

    // Return response
    return NextResponse.json(
      {
        success: true,
        prediction: savedPrediction || prediction,
        message: 'Prediction generated successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Prediction error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate prediction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =============================================
// GET Handler - Retrieve Prediction
// =============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get('predictionId');
    const analysisId = searchParams.get('analysisId');

    if (!predictionId && !analysisId) {
      return NextResponse.json(
        { error: 'Prediction ID or Analysis ID is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build query
    let query = supabase
      .from('outcome_predictions')
      .select('*')
      .eq('customer_id', user.id);

    if (predictionId) {
      query = query.eq('id', predictionId);
    } else if (analysisId) {
      query = query.eq('analysis_id', analysisId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        prediction: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Prediction retrieval error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve prediction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
