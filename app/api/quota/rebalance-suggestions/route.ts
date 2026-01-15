
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

    // 1. Fetch current quota summary
    const summaryRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/quota/center-summary`, {
      headers: { cookie: req.headers.get('cookie') || '' }
    })
    const summaryData = await summaryRes.json()

    // 2. Fetch sales yield matrix
    const yieldRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics/sales-yield`, {
      headers: { cookie: req.headers.get('cookie') || '' }
    })
    const yieldData = await yieldRes.json()

    if (!summaryData.success || !yieldData.success) {
      return NextResponse.json({ error: 'Failed to fetch base data' }, { status: 500 })
    }

    const staffSummary = summaryData.summary
    const staffYield = yieldData.data

    // 3. AI Rebalancing Logic
    // - Identify "High Performers" (High conversion rate/revenue) with low remaining quota
    // - Identify "Low Performers" (Low conversion rate) with high remaining quota
    // - Suggest transfer from Low -> High
    
    const suggestions: any[] = []
    
    // Sort by conversion rate to find top and bottom performers
    const sortedYield = [...staffYield].sort((a, b) => b.conversionRate - a.conversionRate)
    const topPerformers = sortedYield.filter(s => s.conversionRate > 15)
    const lowPerformers = sortedYield.filter(s => s.conversionRate < 8)

    topPerformers.forEach(high => {
      const summary = staffSummary.find((s: any) => s.staff_id === high.staff_id)
      if (summary && summary.percent > 80 && summary.total !== -1) {
        // High performer running out of quota
        const source = lowPerformers.find(low => {
          const lowSummary = staffSummary.find((s: any) => s.staff_id === low.staff_id)
          return lowSummary && lowSummary.remaining > 50
        })

        if (source) {
          const sourceSummary = staffSummary.find((s: any) => s.staff_id === source.staff_id)
          suggestions.push({
            type: 'rebalance',
            priority: 'high',
            from_staff_id: source.staff_id,
            from_name: source.name,
            to_staff_id: high.staff_id,
            to_name: high.name,
            amount: 20,
            reason: `High conversion node (${high.conversionRate}%) is at ${summary.percent}% capacity while low yield node (${source.conversionRate}%) has surplus.`
          })
        }
      }
    })

    // General "Top Up" suggestion if anyone is >90% and center has surplus (not implemented here but possible)

    return NextResponse.json({
      success: true,
      suggestions
    })

  } catch (error) {
    console.error('Quota Rebalancing API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
