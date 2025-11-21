/**
 * API Route: Create Share Link for Analysis
 * POST /api/analysis/share
 * 
 * Generates a shareable link with optional expiry and tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { 
  generateShareToken, 
  generateShareUrl, 
  calculateExpiryDate 
} from '@/lib/utils/report-sharing'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to share analyses' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { 
      analysis_id,
      expiry_days = 7,
      include_recommendations = true,
      include_patient_info = false,
    } = body

    // Validate analysis_id
    if (!analysis_id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'analysis_id is required' },
        { status: 400 }
      )
    }

    // Check if user owns this analysis or has permission
    const { data: analysis, error: analysisError } = await supabase
      .from('skin_analyses')
      .select('id, user_id, clinic_id, sales_staff_id, patient_name')
      .eq('id', analysis_id)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Check permission (owner, sales staff who created it, or admin)
    const userId = session.user.id
    const { data: profile } = await supabase
      .from('multi_tenant_users')
      .select('role, clinic_id')
      .eq('id', userId)
      .single()

    const canShare = 
      analysis.user_id === userId ||
      analysis.sales_staff_id === userId ||
      profile?.role === 'super_admin' ||
      (profile?.role === 'clinic_admin' && profile.clinic_id === analysis.clinic_id)

    if (!canShare) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to share this analysis' },
        { status: 403 }
      )
    }

    // Generate share token
    const shareToken = generateShareToken()
    
    // Calculate expiry date
    const expiresAt = expiry_days === null ? null : calculateExpiryDate(expiry_days)

    // Update analysis with share information
    const { error: updateError } = await supabase
      .from('skin_analyses')
      .update({
        is_shared: true,
        share_token: shareToken,
        share_expires_at: expiresAt?.toISOString() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', analysis_id)

    if (updateError) {
      console.error('[Share API] Error updating analysis:', updateError)
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to create share link' },
        { status: 500 }
      )
    }

    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const shareUrl = generateShareUrl(shareToken, baseUrl)

    // Log share creation (optional analytics)
    console.log(`[Share API] Created share link for analysis ${analysis_id} by user ${userId}`)

    return NextResponse.json({
      success: true,
      data: {
        share_token: shareToken,
        share_url: shareUrl,
        expires_at: expiresAt?.toISOString() || null,
        analysis_id,
      },
    })

  } catch (error) {
    console.error('[Share API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/analysis/share?analysis_id=xxx
 * 
 * Get existing share information for an analysis
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get analysis_id from query params
    const searchParams = request.nextUrl.searchParams
    const analysisId = searchParams.get('analysis_id')

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'analysis_id is required' },
        { status: 400 }
      )
    }

    // Get analysis with share info
    const { data: analysis, error } = await supabase
      .from('skin_analyses')
      .select('id, is_shared, share_token, share_expires_at, user_id, sales_staff_id, clinic_id')
      .eq('id', analysisId)
      .single()

    if (error || !analysis) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Check permission
    const userId = session.user.id
    const { data: profile } = await supabase
      .from('multi_tenant_users')
      .select('role, clinic_id')
      .eq('id', userId)
      .single()

    const canView = 
      analysis.user_id === userId ||
      analysis.sales_staff_id === userId ||
      profile?.role === 'super_admin' ||
      (profile?.role === 'clinic_admin' && profile.clinic_id === analysis.clinic_id)

    if (!canView) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Return share info
    if (!analysis.is_shared || !analysis.share_token) {
      return NextResponse.json({
        success: true,
        data: {
          is_shared: false,
          share_token: null,
          share_url: null,
          expires_at: null,
        },
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const shareUrl = generateShareUrl(analysis.share_token, baseUrl)

    return NextResponse.json({
      success: true,
      data: {
        is_shared: analysis.is_shared,
        share_token: analysis.share_token,
        share_url: shareUrl,
        expires_at: analysis.share_expires_at,
      },
    })

  } catch (error) {
    console.error('[Share API GET] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/analysis/share
 * 
 * Revoke share link for an analysis
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { analysis_id } = body

    if (!analysis_id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'analysis_id is required' },
        { status: 400 }
      )
    }

    // Get analysis
    const { data: analysis, error } = await supabase
      .from('skin_analyses')
      .select('id, user_id, sales_staff_id, clinic_id')
      .eq('id', analysis_id)
      .single()

    if (error || !analysis) {
      return NextResponse.json(
        { error: 'Not Found' },
        { status: 404 }
      )
    }

    // Check permission
    const userId = session.user.id
    const { data: profile } = await supabase
      .from('multi_tenant_users')
      .select('role, clinic_id')
      .eq('id', userId)
      .single()

    const canRevoke = 
      analysis.user_id === userId ||
      analysis.sales_staff_id === userId ||
      profile?.role === 'super_admin' ||
      (profile?.role === 'clinic_admin' && profile.clinic_id === analysis.clinic_id)

    if (!canRevoke) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Revoke share link
    const { error: updateError } = await supabase
      .from('skin_analyses')
      .update({
        is_shared: false,
        share_token: null,
        share_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', analysis_id)

    if (updateError) {
      console.error('[Share API DELETE] Error revoking share:', updateError)
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Share link revoked successfully',
    })

  } catch (error) {
    console.error('[Share API DELETE] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
