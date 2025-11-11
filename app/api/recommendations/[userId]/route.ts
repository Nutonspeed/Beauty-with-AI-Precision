/**
 * User-Specific Treatment Recommendations API
 * Week 8: Recommendation Engine Integration
 * 
 * GET /api/recommendations/[userId] - Get all recommendations for a user
 * DELETE /api/recommendations/[userId] - Clear all recommendations for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

/**
 * GET - Fetch all recommendations for a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Authorization check - users can only access their own data
    if (user.id !== userId) {
      // Check if user is admin/clinic staff
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAuthorized = profile?.role === 'admin' || 
                          profile?.role === 'super_admin' || 
                          profile?.role === 'clinic_admin';

      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Forbidden - Cannot access other users data' },
          { status: 403 }
        );
      }
    }

    // Fetch all recommendations for user with analysis details
    const { data: recommendations, error } = await supabase
      .from('treatment_recommendations')
      .select(`
        *,
        skin_analyses!treatment_recommendations_analysis_id_fkey (
          id,
          created_at,
          image_url,
          overall_score,
          ai_provider
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100); // Limit to last 100 recommendations

    if (error) {
      console.error('Failed to fetch user recommendations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recommendations' },
        { status: 500 }
      );
    }

    // Group recommendations by analysis
    const groupedByAnalysis = recommendations?.reduce((acc: any, rec: any) => {
      const analysisId = rec.analysis_id;
      if (!acc[analysisId]) {
        acc[analysisId] = {
          analysisId,
          analysisDate: rec.skin_analyses?.created_at,
          imageUrl: rec.skin_analyses?.image_url,
          overallScore: rec.skin_analyses?.overall_score,
          aiProvider: rec.skin_analyses?.ai_provider,
          recommendations: [],
        };
      }
      acc[analysisId].recommendations.push(rec);
      return acc;
    }, {});

    const groupedArray = Object.values(groupedByAnalysis || {});

    return NextResponse.json({
      success: true,
      userId,
      totalRecommendations: recommendations?.length || 0,
      totalAnalyses: groupedArray.length,
      data: groupedArray,
    });

  } catch (error) {
    console.error('GET /api/recommendations/[userId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Clear all recommendations for a user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin authorization check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || 
                   profile?.role === 'super_admin' || 
                   profile?.role === 'clinic_admin';

    // Users can delete their own data, admins can delete anyone's
    if (user.id !== userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete all recommendations for user
    const { error: deleteError, count } = await supabase
      .from('treatment_recommendations')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Failed to delete recommendations:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete recommendations' },
        { status: 500 }
      );
    }

    console.log(`✅ Deleted ${count} recommendations for user ${userId}`);

    return NextResponse.json({
      success: true,
      deletedCount: count || 0,
      message: `Deleted ${count} recommendations`,
    });

  } catch (error) {
    console.error('DELETE /api/recommendations/[userId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
