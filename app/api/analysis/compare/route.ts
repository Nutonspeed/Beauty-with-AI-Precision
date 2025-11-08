/**
 * API Route: Compare Multiple Analyses
 * POST /api/analysis/compare
 * 
 * Compare multiple skin analyses to show improvement over time
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ComparisonRequest {
  analysisIds: string[];
  userId: string;
}

interface ComparisonMetric {
  parameter: string;
  parameterLabel: { en: string; th: string };
  values: number[];
  change: number;
  changePercent: number;
  trend: 'improving' | 'declining' | 'stable';
  timestamps: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body: ComparisonRequest = await request.json();
    const { analysisIds, userId } = body;

    if (!analysisIds || analysisIds.length < 2) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'At least 2 analysis IDs required' } },
        { status: 400 }
      );
    }

    // Fetch all requested analyses
    const { data: analyses, error } = await supabase
      .from('skin_analyses')
      .select('*')
      .in('id', analysisIds)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching analyses for comparison:', error);
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    if (!analyses || analyses.length < 2) {
      return NextResponse.json(
        { success: false, error: { code: 'INSUFFICIENT_DATA', message: 'Need at least 2 analyses to compare' } },
        { status: 400 }
      );
    }

    // Define parameters to compare
    const parameters = [
      { key: 'spots', label: { en: 'Dark Spots', th: 'จุดด่างดำ' } },
      { key: 'pores', label: { en: 'Pore Size', th: 'ขนาดรูขุมขน' } },
      { key: 'wrinkles', label: { en: 'Wrinkles', th: 'ริ้วรอย' } },
      { key: 'texture', label: { en: 'Skin Texture', th: 'พื้นผิวผิว' } },
      { key: 'redness', label: { en: 'Redness', th: 'ความแดง' } },
      { key: 'overall_score', label: { en: 'Overall Score', th: 'คะแนนรวม' } }
    ];

    // Calculate comparison metrics
    const comparisonMetrics: ComparisonMetric[] = [];

    parameters.forEach(param => {
      const values: number[] = [];
      const timestamps: string[] = [];

      analyses.forEach(analysis => {
        const metrics = analysis.metrics as any || {};
        values.push(metrics[param.key] || 0);
        timestamps.push(analysis.created_at);
      });

      // Calculate change from first to last
      const firstValue = values[0];
      const lastValue = values[values.length - 1];
      const change = lastValue - firstValue;
      const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;

      let trend: 'improving' | 'declining' | 'stable';
      if (Math.abs(changePercent) < 5) {
        trend = 'stable';
      } else {
        // For skin metrics, higher is usually better (except for concerns)
        // Adjust based on parameter type
        const concernParams = ['spots', 'pores', 'wrinkles', 'redness'];
        if (concernParams.includes(param.key)) {
          // Lower is better for concerns
          trend = change < 0 ? 'improving' : 'declining';
        } else {
          // Higher is better for texture and overall score
          trend = change > 0 ? 'improving' : 'declining';
        }
      }

      comparisonMetrics.push({
        parameter: param.key,
        parameterLabel: param.label,
        values,
        change,
        changePercent: Math.round(changePercent * 100) / 100,
        trend,
        timestamps
      });
    });

    // Calculate overall improvement score
    const improvingCount = comparisonMetrics.filter(m => m.trend === 'improving').length;
    const decliningCount = comparisonMetrics.filter(m => m.trend === 'declining').length;
    const overallImprovement = ((improvingCount - decliningCount) / comparisonMetrics.length) * 100;

    // Get time span
    const firstDate = new Date(analyses[0].created_at);
    const lastDate = new Date(analyses[analyses.length - 1].created_at);
    const timeSpanDays = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

    // Create comparison summary
    const summary = {
      analysisCount: analyses.length,
      timeSpanDays,
      firstAnalysisDate: firstDate.toISOString(),
      lastAnalysisDate: lastDate.toISOString(),
      overallImprovement: Math.round(overallImprovement * 100) / 100,
      improvingParameters: comparisonMetrics.filter(m => m.trend === 'improving').map(m => m.parameter),
      decliningParameters: comparisonMetrics.filter(m => m.trend === 'declining').map(m => m.parameter),
      stableParameters: comparisonMetrics.filter(m => m.trend === 'stable').map(m => m.parameter)
    };

    // Check if there's a comparison group for these analyses
    const { data: existingComparison } = await supabase
      .from('analysis_comparisons')
      .select('*')
      .eq('before_analysis_id', analyses[0].id)
      .eq('after_analysis_id', analyses[analyses.length - 1].id)
      .single();

    // If no existing comparison, create one
    if (!existingComparison) {
      const { data: comparisonGroup } = await supabase
        .from('comparison_groups')
        .select('id')
        .eq('user_id', userId)
        .eq('baseline_analysis_id', analyses[0].id)
        .single();

      if (comparisonGroup) {
        // Create comparison record
        await supabase
          .from('analysis_comparisons')
          .insert({
            comparison_group_id: comparisonGroup.id,
            before_analysis_id: analyses[0].id,
            after_analysis_id: analyses[analyses.length - 1].id,
            improvement_percentage: overallImprovement,
            key_improvements: comparisonMetrics
              .filter(m => m.trend === 'improving')
              .map(m => ({ parameter: m.parameter, change: m.changePercent }))
          });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        analyses: analyses.map(a => ({
          id: a.id,
          imageUrl: a.image_url,
          thumbnailUrl: a.thumbnail_url,
          createdAt: a.created_at,
          sessionNumber: a.session_number,
          metrics: a.metrics
        })),
        metrics: comparisonMetrics,
        summary
      }
    });

  } catch (error) {
    console.error('Error in compare API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        } 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analysis/compare?userId=xxx&limit=5
 * Get recent analyses for quick comparison
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'userId required' } },
        { status: 400 }
      );
    }

    // Get recent analyses
    const { data: analyses, error } = await supabase
      .from('skin_analyses')
      .select('id, image_url, thumbnail_url, created_at, session_number, metrics')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent analyses:', error);
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        analyses: analyses || []
      }
    });

  } catch (error) {
    console.error('Error in compare GET API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        } 
      },
      { status: 500 }
    );
  }
}
