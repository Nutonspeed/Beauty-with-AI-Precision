import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * GET /api/scan-link/[code]
 * Validate and redirect to scan page or use the link
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const code = params.code
    
    // Get link info
    const { data: link, error } = await supabase
      .from('scan_links')
      .select(`
        id,
        code,
        sales_user_id,
        center_id,
        customer_name,
        customer_phone,
        customer_email,
        max_uses,
        uses_count,
        expires_at,
        status,
        created_at,
        centers (name, logo_url)
      `)
      .eq('code', code)
      .single()
    
    if (error || !link) {
      return NextResponse.json({ 
        error: 'Link not found' 
      }, { status: 404 })
    }
    
    // Check if link is still valid
    const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
    const isUsed = link.uses_count >= link.max_uses
    const isActive = link.status === 'active' && !isExpired && !isUsed
    
    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        code: link.code,
        customer_name: link.customer_name,
        customer_phone: link.customer_phone,
        status: isActive ? 'active' : (isExpired ? 'expired' : (isUsed ? 'used' : link.status)),
        uses_remaining: Math.max(0, link.max_uses - link.uses_count),
        expires_at: link.expires_at,
        center: link.centers
      },
      is_valid: isActive
    })
    
  } catch (error) {
    console.error('Scan link get error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

/**
 * POST /api/scan-link/[code]
 * Use scan link (perform analysis)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const code = params.code
    const body = await request.json()
    const { analysis_id } = body
    
    // Use the scan link
    const { data: result, error } = await supabase.rpc('use_scan_link', {
      p_code: code,
      p_analysis_id: analysis_id || null
    })
    
    if (error) {
      console.error('Error using scan link:', error)
      return NextResponse.json({ 
        error: 'Failed to use scan link',
        details: error.message 
      }, { status: 500 })
    }
    
    if (!result?.success) {
      return NextResponse.json({ 
        error: result?.error || 'Link validation failed',
        quota: result?.quota
      }, { status: 400 })
    }

    // 3. Notify the sales user who created the link
    if (result.sales_user_id) {
      await supabase.from('notifications').insert({
        user_id: result.sales_user_id,
        type: 'info',
        title: 'Scan Link Activity',
        message: `A scan link was used by a customer. Quota has been deducted from your account.`,
        data: { link_id: result.link_id, analysis_id: analysis_id }
      })
    }
    
    return NextResponse.json({
      success: true,
      result
    })
    
  } catch (error) {
    console.error('Scan link use error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
