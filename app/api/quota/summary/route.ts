import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * GET /api/quota/summary
 * Get quota summary for all sales users in the center (for clinic owners/admins)
 * Or just the current user's quota (for sales staff)
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('center_id, role')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 400 })
    }
    
    // Owners and admins can see all sales users in their center
    const canSeeAll = ['clinic_owner', 'clinic_admin', 'super_admin'].includes(userData.role)
    
    if (canSeeAll && userData.center_id) {
      // Get all sales users quota in the center
      const { data: summaryData, error: summaryError } = await supabase
        .from('sales_quota_summary')
        .select('*')
        .eq('center_id', userData.center_id)
      
      if (summaryError) {
        console.error('Error getting quota summary:', summaryError)
        return NextResponse.json({ 
          error: 'Failed to get quota summary',
          details: summaryError.message 
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        view: 'center',
        center_id: userData.center_id,
        sales_users: summaryData || []
      })
    } else {
      // Sales staff can only see their own quota
      const { data: myQuota } = await supabase
        .from('sales_quota_summary')
        .select('*')
        .eq('sales_user_id', user.id)
        .single()
      
      return NextResponse.json({
        success: true,
        view: 'personal',
        quota: myQuota || null
      })
    }
    
  } catch (error) {
    console.error('Quota summary error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
