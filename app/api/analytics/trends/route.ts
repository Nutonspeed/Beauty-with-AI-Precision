/**
 * Trends API Endpoint
 * Phase 2 Week 4 Task 4.2
 * 
 * GET /api/analytics/trends?customerId=xxx&period=3m
 * 
 * Returns trend analysis for a customer's skin analysis history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  calculateAllTrends,
  calculateSummary,
  getPeriodDateRange,
  predictNextMonth,
} from '@/lib/analytics/trend-calculator';
import { TrendPeriod, TrendsResponse } from '@/types/analytics';

// =============================================
// GET Handler
// =============================================

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const period = (searchParams.get('period') || '3m') as TrendPeriod;

    // Validate parameters
    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing required parameter: customerId' },
        { status: 400 }
      );
    }

    const validPeriods: TrendPeriod[] = ['1m', '3m', '6m', '1y', 'all'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be one of: 1m, 3m, 6m, 1y, all' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user can only access their own data (or admin can access any)
    if (user.id !== customerId) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Get date range for period
    const { start, end } = getPeriodDateRange(period);

    // Fetch analyses within period
    const { data: analyses, error: queryError } = await supabase
      .from('skin_analyses')
      .select(
        `
        id,
        created_at,
        overall_score,
        ai_analysis
      `
      )
      .eq('user_id', customerId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: true });

    if (queryError) {
      console.error('Error fetching analyses:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch analysis data' },
        { status: 500 }
      );
    }

    // Check if we have data
    if (!analyses || analyses.length === 0) {
      return NextResponse.json<TrendsResponse>({
        period,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        metrics: {
          overall: {
            name: 'Overall Score',
            current: 0,
            change: 0,
            changePercent: 0,
            trend: 'stable',
            data: [],
          },
          spots: {
            name: 'Spots & Acne',
            current: 0,
            change: 0,
            changePercent: 0,
            trend: 'stable',
            data: [],
          },
          wrinkles: {
            name: 'Wrinkles',
            current: 0,
            change: 0,
            changePercent: 0,
            trend: 'stable',
            data: [],
          },
          texture: {
            name: 'Texture',
            current: 0,
            change: 0,
            changePercent: 0,
            trend: 'stable',
            data: [],
          },
          pores: {
            name: 'Pores',
            current: 0,
            change: 0,
            changePercent: 0,
            trend: 'stable',
            data: [],
          },
          hydration: {
            name: 'Hydration',
            current: 0,
            change: 0,
            changePercent: 0,
            trend: 'stable',
            data: [],
          },
        },
        summary: {
          totalAnalyses: 0,
          averageScore: 0,
          improvementRate: 0,
          treatmentAdherence: 0,
        },
      });
    }

    // Transform data for calculations
    const dataPoints = analyses.map((analysis) => ({
      date: analysis.created_at,
      overall_score: analysis.overall_score || 0,
      spots_score: analysis.ai_analysis?.acne_score || 0,
      wrinkles_score: analysis.ai_analysis?.wrinkles_score || 0,
      texture_score: analysis.ai_analysis?.texture_score || 0,
      pores_score: analysis.ai_analysis?.pores_score || 0,
      hydration_score: analysis.ai_analysis?.hydration_score || 0,
    }));

    // Calculate trends
    const metrics = calculateAllTrends(dataPoints, period);

    // Calculate summary
    const summary = calculateSummary(dataPoints);

    // Generate predictions (optional - only if enough data)
    let predictions;
    if (analyses.length >= 3) {
      predictions = {
        nextMonth: predictNextMonth(dataPoints),
      };
    }

    // Build response
    const response: TrendsResponse = {
      period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      metrics,
      summary,
      predictions,
    };

    // Return response with caching headers
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Unexpected error in trends API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// OPTIONS Handler (CORS)
// =============================================

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
