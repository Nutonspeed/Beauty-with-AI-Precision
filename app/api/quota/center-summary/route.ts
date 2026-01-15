
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptions/plans'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if owner or admin
    const { data: roleData } = await supabase
      .from('users')
      .select('role, center_id')
      .eq('id', user.id)
      .single()

    if (!roleData || !['center_owner', 'center_admin', 'super_admin'].includes(roleData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const centerId = roleData.center_id
    if (!centerId) {
      return NextResponse.json({ error: 'No center associated' }, { status: 400 })
    }

    // 1. Get current plan
    const { data: center } = await supabase
      .from('centers')
      .select('subscription_plan, subscription_status')
      .eq('id', centerId)
      .single()

    const planKey = (center?.subscription_plan || 'starter') as keyof typeof SUBSCRIPTION_PLANS
    const planDetails = SUBSCRIPTION_PLANS[planKey]

    // 2. Get all sales users in this center
    const { data: salesUsers } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('center_id', centerId)
      .eq('role', 'sales_staff')

    if (!salesUsers) return NextResponse.json({ summary: [] })

    // 3. Get current month usage for all sales users
    const now = new Date()
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const { data: usageData } = await supabase
      .from('sales_usage_monthly')
      .select('*')
      .eq('center_id', centerId)
      .eq('year_month', currentYearMonth)

    // 4. Get add-ons for this month
    const { data: addons } = await supabase
      .from('sales_quota_addons')
      .select('*')
      .eq('center_id', centerId)
      .gte('valid_until', now.toISOString())

    // 5. Combine data
    const summary = salesUsers.map(staff => {
      const usage = usageData?.find(u => u.sales_user_id === staff.id)
      const staffAddons = addons?.filter(a => a.sales_user_id === staff.id || a.sales_user_id === null)
      
      const extraAnalyses = staffAddons
        ?.filter(a => a.addon_type === 'extra_analyses')
        .reduce((sum, a) => sum + (a.quantity * 100), 0) || 0

      const baseQuota = planDetails.quotaPerSales
      const totalQuota = baseQuota === -1 ? -1 : baseQuota + extraAnalyses
      const used = usage?.analysis_count || 0

      return {
        staff_id: staff.id,
        name: staff.full_name,
        email: staff.email,
        used,
        total: totalQuota,
        remaining: totalQuota === -1 ? -1 : totalQuota - used,
        percent: totalQuota === -1 ? 0 : Math.min(100, Math.round((used / totalQuota) * 100))
      }
    })

    return NextResponse.json({
      success: true,
      plan: planKey,
      year_month: currentYearMonth,
      summary
    })

  } catch (error) {
    console.error('Center Quota Summary API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
