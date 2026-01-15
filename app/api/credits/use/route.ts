import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * POST /api/credits/use
 * Customer uses a credit for analysis (deducts from sales quota)
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current user (customer)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get credit type from body
    const body = await request.json()
    const creditType = body.type || 'analysis'
    
    // Use credit
    const { data: result, error } = await supabase.rpc('use_customer_credit', {
      p_customer_id: user.id,
      p_credit_type: creditType
    })
    
    if (error) {
      console.error('Error using credit:', error)
      return NextResponse.json({ 
        error: 'Failed to use credit',
        details: error.message 
      }, { status: 500 })
    }
    
    if (!result?.success) {
      return NextResponse.json({ 
        error: result?.error || 'No credits available',
        message: result?.message || (body.locale === 'en' ? 'Please contact staff to request credits' : 'กรุณาติดต่อเจ้าหน้าที่เพื่อขอเครดิต')
      }, { status: 400 })
    }

    // 3. Notify the sales user who gave the credit (optional but helpful)
    if (result.sales_user_id) {
      await supabase.from('notifications').insert({
        user_id: result.sales_user_id,
        type: 'info',
        title: 'Customer Analysis Sync',
        message: `Your customer has performed an AI analysis using a granted credit.`,
        data: { customer_id: user.id, analysis_id: result.analysis_id }
      })
    }
    
    return NextResponse.json({
      success: true,
      ...result
    })
    
  } catch (error) {
    console.error('Use credit error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
