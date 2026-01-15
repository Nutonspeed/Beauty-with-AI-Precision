import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * GET /api/quota/check
 * Check if the current sales user has quota remaining
 * Query params: type=analysis|ar|proposal (default: analysis)
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
    
    // Get usage type from query params
    const { searchParams } = new URL(request.url)
    const usageType = searchParams.get('type') || 'analysis'
    
    // Call the check_sales_quota function
    const { data, error } = await supabase.rpc('check_sales_quota', {
      p_sales_user_id: user.id,
      p_usage_type: usageType
    })
    
    if (error) {
      console.error('Error checking quota:', error)
      return NextResponse.json({ 
        error: 'Failed to check quota',
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      quota: data,
      user_id: user.id,
      usage_type: usageType
    })
    
  } catch (error) {
    console.error('Quota check error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
