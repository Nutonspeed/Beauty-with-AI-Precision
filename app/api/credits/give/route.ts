import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * POST /api/credits/give
 * Sales gives credits to customer for follow-up analyses
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current user (sales)
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
    
    if (userError || !userData?.center_id) {
      return NextResponse.json({ 
        error: 'User not assigned to a center' 
      }, { status: 400 })
    }
    
    // Check if user is sales staff
    const salesRoles = ['sales_staff', 'clinic_staff', 'clinic_admin', 'clinic_owner', 'super_admin']
    if (!salesRoles.includes(userData.role)) {
      return NextResponse.json({ 
        error: 'Only sales staff can give credits' 
      }, { status: 403 })
    }
    
    // Get body params
    const body = await request.json()
    const {
      customer_id,
      credit_type = 'analysis',
      credits = 5,
      reason,
      expires_days
    } = body
    
    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id is required' }, { status: 400 })
    }
    
    // Give credits
    const { data: result, error } = await supabase.rpc('give_customer_credits', {
      p_sales_user_id: user.id,
      p_customer_id: customer_id,
      p_center_id: userData.center_id,
      p_credit_type: credit_type,
      p_credits: credits,
      p_reason: reason || null,
      p_expires_days: expires_days || null
    })
    
    if (error) {
      console.error('Error giving credits:', error)
      return NextResponse.json({ 
        error: 'Failed to give credits',
        details: error.message 
      }, { status: 500 })
    }
    
    if (!result?.success) {
      return NextResponse.json({ 
        error: result?.error || 'Failed to give credits',
        details: result
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      ...result
    })
    
  } catch (error) {
    console.error('Give credits error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
