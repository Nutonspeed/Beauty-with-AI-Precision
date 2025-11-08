/**
 * GET /api/skin-analysis/[id]
 * Retrieve single skin analysis by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    // Get authenticated user (optional for demo mode)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get analysis ID from params
  const { id } = await context.params;

    console.log('Fetching analysis:', id);
    console.log('User:', user ? user.id : 'No user (demo mode)');

    // Query single analysis
    // For demo mode: if no user, skip RLS by not adding user_id filter
    // Note: In production, RLS policies should handle this, but for demo we query without user_id
    const { data: analysis, error: queryError } = await supabase
      .from('skin_analyses')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Query result:', { analysis: analysis ? 'Found' : 'Not found', error: queryError });

    if (queryError) {
      console.error('Query error:', queryError);
      
      if (queryError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Analysis not found' },
          { status: 404 }
        );
      }
      
      throw new Error('Failed to fetch analysis');
    }

    // If user is authenticated, verify ownership
    if (user && analysis.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Format complete analysis
    const formattedAnalysis = {
      id: analysis.id,
      timestamp: new Date(analysis.created_at),
      imageUrl: analysis.image_url,
      overallScore: {
        spots: analysis.spots_severity || 0,
        pores: analysis.pores_severity || 0,
        wrinkles: analysis.wrinkles_severity || 0,
        texture: analysis.texture_severity || 0,
        redness: analysis.redness_severity || 0,
        pigmentation: analysis.spots_severity || 0, // Using spots as pigmentation fallback
      },
      confidence: analysis.confidence,
      
      percentiles: {
        spots: analysis.spots_percentile,
        pores: analysis.pores_percentile,
        wrinkles: analysis.wrinkles_percentile,
        texture: analysis.texture_percentile,
        redness: analysis.redness_percentile,
        overall: analysis.overall_percentile,
      },
      
      cvAnalysis: {
        spots: {
          severity: analysis.spots_severity,
          count: analysis.spots_count,
        },
        pores: {
          severity: analysis.pores_severity,
          count: analysis.pores_count,
        },
        wrinkles: {
          severity: analysis.wrinkles_severity,
          count: analysis.wrinkles_count,
        },
        texture: {
          severity: analysis.texture_severity,
        },
        redness: {
          severity: analysis.redness_severity,
          count: analysis.redness_count,
        },
      },
      
      aiAnalysis: {
        skinType: analysis.ai_skin_type,
        concerns: analysis.ai_concerns,
        severity: analysis.ai_severity,
        treatmentPlan: analysis.ai_treatment_plan,
      },
      
      recommendations: analysis.recommendations,
      
      patientInfo: {
        name: analysis.patient_name,
        age: analysis.patient_age,
        gender: analysis.patient_gender,
        skinType: analysis.patient_skin_type,
      },
      
      notes: analysis.notes,
      analysisTime: analysis.analysis_time_ms,
    };

    return NextResponse.json({
      success: true,
      data: formattedAnalysis,
    });
  } catch (error) {
    console.error('Fetch error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
