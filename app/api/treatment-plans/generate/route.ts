/**
 * Treatment Plan Generation API
 * Phase 2 Week 6-7 Task 6.2
 * 
 * POST /api/treatment-plans/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  createTreatmentPlanner,
  type AnalysisData,
  type TreatmentPreferences,
} from '@/lib/ai/treatment-planner';

// =============================================
// Types
// =============================================

interface GenerateRequest {
  analysisId: string;
  preferences?: TreatmentPreferences;
}

// =============================================
// POST Handler
// =============================================

export async function POST(request: NextRequest) {
  try {
    // Parse request
    const body = (await request.json()) as GenerateRequest;
    const { analysisId, preferences } = body;

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

    // Fetch analysis data
    const { data: analysis, error: analysisError } = await supabase
      .from('skin_analyses')
      .select(
        `
        id,
        user_id,
        overall_score,
        ai_analysis,
        created_at
      `
      )
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (analysis.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have access to this analysis' },
        { status: 403 }
      );
    }

    // Check if plan already exists
    const { data: existingPlan } = await supabase
      .from('treatment_plans')
      .select('id, created_at')
      .eq('analysis_id', analysisId)
      .single();

    if (existingPlan) {
      // Return existing plan ID
      return NextResponse.json(
        {
          success: true,
          planId: existingPlan.id,
          message: 'Treatment plan already exists for this analysis',
          existing: true,
        },
        { status: 200 }
      );
    }

    // Fetch customer profile for age
    const { data: profile } = await supabase
      .from('profiles')
      .select('date_of_birth, skin_type')
      .eq('id', user.id)
      .single();

    let age: number | undefined;
    if (profile?.date_of_birth) {
      const birthDate = new Date(profile.date_of_birth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
    }

    // Extract concerns from AI analysis
    const concerns: AnalysisData['concerns'] = {};
    
    if (analysis.ai_analysis) {
      const aiAnalysis = analysis.ai_analysis as any;
      
      // Extract scores from various possible structures
      if (aiAnalysis.scores) {
        concerns.acne = aiAnalysis.scores.acne;
        concerns.wrinkles = aiAnalysis.scores.wrinkles || aiAnalysis.scores.aging;
        concerns.texture = aiAnalysis.scores.texture;
        concerns.pores = aiAnalysis.scores.pores;
        concerns.hydration = aiAnalysis.scores.hydration || aiAnalysis.scores.moisture;
      } else if (aiAnalysis.metrics) {
        concerns.acne = aiAnalysis.metrics.acne;
        concerns.wrinkles = aiAnalysis.metrics.wrinkles || aiAnalysis.metrics.aging;
        concerns.texture = aiAnalysis.metrics.texture;
        concerns.pores = aiAnalysis.metrics.pores;
        concerns.hydration = aiAnalysis.metrics.hydration || aiAnalysis.metrics.moisture;
      }
    }

    // Build analysis data
    const analysisData: AnalysisData = {
      id: analysis.id,
      overallScore: analysis.overall_score,
      concerns,
      skinType: profile?.skin_type,
      age,
    };

    // Generate treatment plan
    const planner = createTreatmentPlanner();
    const treatmentPlan = await planner.generatePlan(
      analysisData,
      preferences
    );

    // Set customer ID
    treatmentPlan.customerId = user.id;

    // Save to database
    const planId = await planner.savePlan(treatmentPlan);

    // Return response
    return NextResponse.json(
      {
        success: true,
        planId,
        message: 'Treatment plan generated successfully',
        plan: treatmentPlan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Treatment plan generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate treatment plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =============================================
// GET Handler - Retrieve Plan
// =============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const analysisId = searchParams.get('analysisId');

    if (!planId && !analysisId) {
      return NextResponse.json(
        { error: 'Plan ID or Analysis ID is required' },
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
      .from('treatment_plans')
      .select('*')
      .eq('user_id', user.id);

    if (planId) {
      query = query.eq('id', planId);
    } else if (analysisId) {
      query = query.eq('analysis_id', analysisId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Treatment plan not found' },
        { status: 404 }
      );
    }

    // Transform database format to response format
    const plan = {
      id: data.id,
      analysisId: data.analysis_id,
      customerId: data.user_id,
      title: data.title,
      titleTh: data.title_th,
      summary: data.summary,
      summaryTh: data.summary_th,
      duration: data.duration,
      durationTh: data.duration_th,
      reviewMilestones: data.review_milestones,
      morningRoutine: data.morning_routine,
      eveningRoutine: data.evening_routine,
      weeklyTreatments: data.weekly_treatments,
      expectedResults: data.expected_results,
      expectedResultsTh: data.expected_results_th,
      warnings: data.warnings,
      warningsTh: data.warnings_th,
      estimatedCost: data.estimated_cost,
      generatedAt: data.generated_at,
      generatedBy: data.generated_by,
      createdAt: data.created_at,
    };

    return NextResponse.json(
      {
        success: true,
        plan,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Treatment plan retrieval error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve treatment plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
