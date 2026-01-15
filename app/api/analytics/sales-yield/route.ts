
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

    // 1. Get all sales staff for this center
    const { data: salesStaff } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('center_id', centerId)
      .eq('role', 'sales_staff')

    if (!salesStaff || salesStaff.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // 2. Get scan stats per sales person
    const { data: scans } = await supabase
      .from('skin_analyses')
      .select('sales_staff_id, user_id, created_at')
      .eq('center_id', centerId)
      .gte('created_at', startDate.toISOString())

    // 3. Get bookings/appointments per sales person
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, customer_id, price, status, created_at')
      .eq('center_id', centerId)
      .gte('created_at', startDate.toISOString())

    // 4. Get quota usage per sales person
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const { data: usage } = await supabase
      .from('sales_usage_monthly')
      .select('sales_user_id, analysis_count')
      .eq('center_id', centerId)
      .eq('year_month', currentYearMonth)

    // 5. Process Matrix Data
    const matrix = salesStaff.map(staff => {
      const staffScans = scans?.filter(s => s.sales_staff_id === staff.id) || []
      const staffUsage = usage?.find(u => u.sales_user_id === staff.id)?.analysis_count || 0
      
      // Calculate attribution (revenue from customers who scanned with this staff)
      const scannedCustomerIds = new Set(staffScans.map(s => s.user_id))
      const attributedBookings = appointments?.filter(appt => 
        scannedCustomerIds.has(appt.customer_id)
      ) || []
      
      const revenue = attributedBookings.reduce((sum, appt) => sum + Number(appt.price || 0), 0)
      const conversions = attributedBookings.length
      const conversionRate = staffScans.length > 0 ? (conversions / staffScans.length) * 100 : 0
      
      return {
        staff_id: staff.id,
        name: staff.full_name,
        email: staff.email,
        scans: staffScans.length,
        conversions,
        conversionRate: Math.round(conversionRate * 10) / 10,
        revenue,
        quotaEfficiency: staffUsage > 0 ? Math.round((revenue / staffUsage) * 100) / 100 : 0,
        avgTicket: conversions > 0 ? Math.round(revenue / conversions) : 0
      }
    })

    return NextResponse.json({
      success: true,
      data: matrix
    })

  } catch (error) {
    console.error('Sales Yield API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
