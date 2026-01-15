import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * POST /api/quota/use
 * Increment usage for the current sales user
 * Body: { type: 'analysis' | 'ar' | 'proposal' }
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's center_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('center_id, role')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData) {
      return NextResponse.json({ 
        error: 'User not found or not assigned to center' 
      }, { status: 400 })
    }
    
    // Check if user is sales staff
    const salesRoles = ['sales_staff', 'clinic_staff', 'clinic_admin', 'clinic_owner', 'super_admin']
    if (!salesRoles.includes(userData.role)) {
      return NextResponse.json({ 
        error: 'Only sales staff can use analysis quota' 
      }, { status: 403 })
    }
    
    // Get usage type from body
    const body = await request.json()
    const usageType = body.type || 'analysis'
    
    // First check if user has quota
    const { data: quotaCheck, error: checkError } = await supabase.rpc('check_sales_quota', {
      p_sales_user_id: user.id,
      p_usage_type: usageType
    })
    
    if (checkError) {
      console.error('Error checking quota:', checkError)
      return NextResponse.json({ 
        error: 'Failed to check quota',
        details: checkError.message 
      }, { status: 500 })
    }
    
    // If no quota remaining (and not unlimited)
    if (quotaCheck && !quotaCheck.has_quota && quotaCheck.limit !== -1) {
      return NextResponse.json({ 
        error: 'Quota exceeded',
        quota: quotaCheck,
        message: `You have used all ${quotaCheck.total_limit} ${usageType} quota for this month. Please purchase additional quota or upgrade your plan.`
      }, { status: 429 })
    }
    
    // Increment usage
    const { data: incrementResult, error: incrementError } = await supabase.rpc('increment_sales_usage', {
      p_sales_user_id: user.id,
      p_center_id: userData.center_id,
      p_usage_type: usageType
    })
    
    if (incrementError) {
      console.error('Error incrementing usage:', incrementError)
      return NextResponse.json({ 
        error: 'Failed to record usage',
        details: incrementError.message 
      }, { status: 500 })
    }
    
    // Get updated quota info
    const { data: updatedQuota } = await supabase.rpc('check_sales_quota', {
      p_sales_user_id: user.id,
      p_usage_type: usageType
    })

    // 5. Send low quota notification if needed
    if (updatedQuota && !updatedQuota.is_unlimited && updatedQuota.remaining <= 10 && updatedQuota.remaining > 0) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'warning',
        title: 'Quota Running Low',
        message: `Your ${usageType} quota is almost depleted. Only ${updatedQuota.remaining} cycles remaining.`,
        data: { quota: updatedQuota, type: usageType }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: `${usageType} usage recorded`,
      quota: updatedQuota,
      user_id: user.id
    })
    
  } catch (error) {
    console.error('Quota use error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
