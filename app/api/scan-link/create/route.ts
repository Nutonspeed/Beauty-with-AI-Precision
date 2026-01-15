import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * POST /api/scan-link/create
 * Create a shareable scan link for customers
 * Quota will be charged to the sales user who created the link
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
        error: 'Only sales staff can create scan links' 
      }, { status: 403 })
    }
    
    // Get body params
    const body = await request.json()
    const {
      customer_name,
      customer_phone,
      customer_email,
      max_uses = 1,
      expires_hours = 24
    } = body
    
    // Create scan link
    const { data: linkData, error: linkError } = await supabase.rpc('create_scan_link', {
      p_sales_user_id: user.id,
      p_center_id: userData.center_id,
      p_customer_name: customer_name || null,
      p_customer_phone: customer_phone || null,
      p_customer_email: customer_email || null,
      p_max_uses: max_uses,
      p_expires_hours: expires_hours
    })
    
    if (linkError) {
      console.error('Error creating scan link:', linkError)
      return NextResponse.json({ 
        error: 'Failed to create scan link',
        details: linkError.message 
      }, { status: 500 })
    }
    
    const link = linkData?.[0]
    if (!link) {
      return NextResponse.json({ 
        error: 'Failed to generate link code' 
      }, { status: 500 })
    }
    
    // Build the full URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const scanUrl = `${baseUrl}/scan/${link.link_code}`
    
    return NextResponse.json({
      success: true,
      link: {
        id: link.link_id,
        code: link.link_code,
        url: scanUrl,
        expires_at: link.expires_at,
        max_uses,
        customer_name,
        customer_phone
      }
    })
    
  } catch (error) {
    console.error('Scan link create error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
