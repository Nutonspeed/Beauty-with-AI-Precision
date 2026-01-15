import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * GET /api/credits/check
 * Check current user's (customer) available credits
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
    
    // Get credit type from query
    const { searchParams } = new URL(request.url)
    const creditType = searchParams.get('type') || 'analysis'
    
    // Check credits
    const { data: result, error } = await supabase.rpc('check_customer_credits', {
      p_customer_id: user.id,
      p_credit_type: creditType
    })
    
    if (error) {
      console.error('Error checking credits:', error)
      return NextResponse.json({ 
        error: 'Failed to check credits',
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      user_id: user.id,
      credit_type: creditType,
      ...result
    })
    
  } catch (error) {
    console.error('Check credits error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
