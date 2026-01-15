import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * GET /api/scan-link/my-links
 * Get all scan links created by the current sales user
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
    
    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active', 'used', 'expired', 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Build query
    let query = supabase
      .from('scan_links')
      .select(`
        id,
        code,
        customer_name,
        customer_phone,
        customer_email,
        max_uses,
        uses_count,
        expires_at,
        status,
        used_at,
        created_at,
        analysis_id
      `)
      .eq('sales_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    const { data: links, error } = await query
    
    if (error) {
      console.error('Error fetching links:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch links',
        details: error.message 
      }, { status: 500 })
    }
    
    // Build full URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const linksWithUrl = links?.map(link => ({
      ...link,
      url: `${baseUrl}/scan/${link.code}`,
      is_expired: link.expires_at && new Date(link.expires_at) < new Date(),
      uses_remaining: Math.max(0, link.max_uses - link.uses_count)
    }))
    
    return NextResponse.json({
      success: true,
      links: linksWithUrl || [],
      count: linksWithUrl?.length || 0
    })
    
  } catch (error) {
    console.error('My links error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
