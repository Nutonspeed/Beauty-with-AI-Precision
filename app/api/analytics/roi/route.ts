
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role, center_id')
      .eq('id', user.id)
      .single()

    if (!userData || !['center_owner', 'center_admin', 'super_admin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const centerId = userData.center_id
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const now = new Date()
    const startDate = new Date()
    startDate.setDate(now.getDate() - days)
    
    const prevStartDate = new Date()
    prevStartDate.setDate(now.getDate() - (days * 2))
    const prevEndDate = new Date(startDate)

    // 1. Get current period stats
    const { count: totalScans } = await supabase
      .from('skin_analyses')
      .select('id', { count: 'exact', head: true })
      .eq('center_id', centerId)
      .gte('created_at', startDate.toISOString())

    const { data: currentBookings } = await supabase
      .from('appointments')
      .select('id, customer_id, price, status, created_at')
      .eq('center_id', centerId)
      .gte('created_at', startDate.toISOString())

    // 2. Get previous period stats for PoP comparison
    const { count: prevScans } = await supabase
      .from('skin_analyses')
      .select('id', { count: 'exact', head: true })
      .eq('center_id', centerId)
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', prevEndDate.toISOString())

    const { data: prevBookings } = await supabase
      .from('appointments')
      .select('price')
      .eq('center_id', centerId)
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', prevEndDate.toISOString())

    const prevRevenue = prevBookings?.reduce((sum: number, b: any) => sum + Number(b.price || 0), 0) || 0

    // 3. Calculate conversion logic for current period
    const { data: scans } = await supabase
      .from('skin_analyses')
      .select('user_id, created_at')
      .eq('center_id', centerId)
      .gte('created_at', startDate.toISOString())

    let convertedScans = 0
    let aiDrivenRevenue = 0

    if (scans && currentBookings) {
      const customersWhoScanned = new Set(scans.map((s: any) => s.user_id))
      
      currentBookings.forEach((booking: any) => {
        if (customersWhoScanned.has(booking.customer_id)) {
          const scanTime = scans.find((s: any) => s.user_id === booking.customer_id)?.created_at
          if (scanTime && new Date(scanTime) <= new Date(booking.created_at)) {
            convertedScans++
            aiDrivenRevenue += Number(booking.price || 0)
          }
        }
      })
    }

    const totalBookings = currentBookings?.length || 0
    const finalTotalScans = totalScans || 0
    const conversionRate = finalTotalScans ? (convertedScans / finalTotalScans) * 100 : 0
    const totalRevenue = currentBookings?.reduce((sum: number, b: any) => sum + Number(b.price || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        totalScans: finalTotalScans,
        totalBookings,
        conversionRate: Math.round(conversionRate * 10) / 10,
        aiDrivenRevenue,
        totalRevenue,
        aiAttribution: totalRevenue ? Math.round((aiDrivenRevenue / totalRevenue) * 100) : 0,
        prevPeriodScans: prevScans || 0,
        prevPeriodRevenue: prevRevenue,
        funnel: [
          { stage: 'AI Scans', count: finalTotalScans, icon: 'Camera' },
          { stage: 'Engagement', count: Math.round(finalTotalScans * 0.6), icon: 'Zap' },
          { stage: 'Conversions', count: convertedScans, icon: 'Target' },
          { stage: 'Confirmed', count: currentBookings?.filter((b: any) => b.status === 'confirmed').length || 0, icon: 'CheckCircle' }
        ]
      }
    })

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
