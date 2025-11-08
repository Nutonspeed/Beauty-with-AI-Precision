import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateShareStats } from '@/lib/utils/report-sharing'

/**
 * GET /api/analysis/share/stats?analysis_id=xxx
 * Get share statistics for an analysis report
 * Requires authentication and permission (owner/sales_staff/admin)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const analysisId = searchParams.get('analysis_id')

    if (!analysisId) {
      return NextResponse.json(
        { success: false, message: 'analysis_id is required' },
        { status: 400 }
      )
    }

    // Fetch analysis with share info
    const { data: analysis, error: analysisError } = await supabase
      .from('skin_analyses')
      .select(`
        id,
        user_id,
        sales_staff_id,
        clinic_id,
        is_shared,
        share_token,
        share_expires_at,
        created_at,
        sales_staff:sales_staff!sales_staff_id (
          id,
          user_id,
          role,
          clinic_id
        )
      `)
      .eq('id', analysisId)
      .single()

    if (analysisError || !analysis) {
      console.error('[ShareStatsAPI] Analysis not found:', analysisId)
      return NextResponse.json(
        { success: false, message: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Check permission: owner, sales_staff who created it, super_admin, or clinic_admin with same clinic
    const canViewStats = 
      analysis.user_id === userId ||
      analysis.sales_staff?.user_id === userId ||
      (analysis.sales_staff?.role === 'super_admin') ||
      (analysis.sales_staff?.role === 'clinic_admin' && analysis.sales_staff?.clinic_id === analysis.clinic_id)

    if (!canViewStats) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to view statistics for this analysis' },
        { status: 403 }
      )
    }

    // If not shared, return empty stats
    if (!analysis.is_shared || !analysis.share_token) {
      return NextResponse.json({
        success: true,
        data: {
          is_shared: false,
          total_views: 0,
          unique_ips: 0,
          last_viewed_at: null,
          is_expired: false,
          days_remaining: null,
          views: [],
        },
      })
    }

    // Fetch view records
    // Try-catch in case share_views table doesn't exist yet
    let views: any[] = []
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('share_views')
        .select('*')
        .eq('share_token', analysis.share_token)
        .order('viewed_at', { ascending: false })

      if (viewError) {
        // If table doesn't exist, return stats without views
        if (viewError.code === '42P01') {
          console.warn('[ShareStatsAPI] share_views table does not exist yet')
          views = []
        } else {
          throw viewError
        }
      } else {
        views = viewData || []
      }
    } catch (viewError) {
      console.error('[ShareStatsAPI] Error fetching views:', viewError)
      views = []
    }

    // Calculate statistics
    const stats = calculateShareStats(
      views,
      new Date(analysis.created_at),
      analysis.share_expires_at ? new Date(analysis.share_expires_at) : null
    )

    return NextResponse.json({
      success: true,
      data: {
        is_shared: true,
        share_token: analysis.share_token,
        ...stats,
        views: views.slice(0, 10), // Return last 10 views for detailed breakdown
      },
    })
  } catch (error) {
    console.error('[ShareStatsAPI] Error fetching share statistics:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch share statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
