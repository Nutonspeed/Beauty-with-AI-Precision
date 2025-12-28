/**
 * GET /api/skin-analysis/history
 * Retrieve user's skin analysis history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSkinAnalysesHistory } from '@/lib/api/skin-analyses-history';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate pagination
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;

    const safeSortBy = sortBy === 'updated_at' ? 'updated_at' : 'created_at'
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc'

    const { rows: analyses, total: count } = await getSkinAnalysesHistory(supabase, {
      userId: user.id,
      limit: validatedLimit,
      offset,
      sortBy: safeSortBy,
      sortOrder: safeSortOrder,
    })

    // Format response
    const formattedAnalyses = analyses?.map((analysis) => ({
      id: analysis.id,
      timestamp: new Date(analysis.created_at),
      imageUrl: analysis.image_url,
      overallScore: analysis.overall_score,
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
      patientInfo: {
        name: analysis.patient_name,
        age: analysis.patient_age,
        gender: analysis.patient_gender,
        skinType: analysis.patient_skin_type,
      },
      notes: analysis.notes,
    }));

    return NextResponse.json({
      success: true,
      data: formattedAnalyses,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validatedLimit),
      },
    }, {
      headers: {
        Deprecation: 'true',
        'X-Deprecated': 'true',
        Link: '</api/analysis/history>; rel="successor-version"',
      },
    });
  } catch (error) {
    console.error('History error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
