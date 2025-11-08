import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic' // Ensure fresh data on every request

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get today's date range (midnight to now)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStart = today.toISOString()
    
    // Get yesterday's date range
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStart = yesterday.toISOString()
    const yesterdayEnd = today.toISOString()

    // Query 1: Calls made today (activity_type = 'call')
    const { count: callsMadeToday } = await supabase
      .from('sales_activities')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('activity_type', 'call')
      .gte('created_at', todayStart)

    // Query 2: Calls made yesterday
    const { count: callsMadeYesterday } = await supabase
      .from('sales_activities')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('activity_type', 'call')
      .gte('created_at', yesterdayStart)
      .lt('created_at', yesterdayEnd)

    // Query 3: Unique leads contacted today
    const { data: activitiesToday } = await supabase
      .from('sales_activities')
      .select('lead_id')
      .eq('sales_user_id', user.id)
      .gte('created_at', todayStart)
      .not('lead_id', 'is', null)

    const uniqueLeadsToday = new Set(activitiesToday?.map(a => a.lead_id)).size

    // Query 4: Unique leads contacted yesterday
    const { data: activitiesYesterday } = await supabase
      .from('sales_activities')
      .select('lead_id')
      .eq('sales_user_id', user.id)
      .gte('created_at', yesterdayStart)
      .lt('created_at', yesterdayEnd)
      .not('lead_id', 'is', null)

    const uniqueLeadsYesterday = new Set(activitiesYesterday?.map(a => a.lead_id)).size

    // Query 5: Proposals sent today (status != 'draft')
    const { count: proposalsSentToday } = await supabase
      .from('sales_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .neq('status', 'draft')
      .gte('sent_at', todayStart)

    // Query 6: Proposals sent yesterday
    const { count: proposalsSentYesterday } = await supabase
      .from('sales_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .neq('status', 'draft')
      .gte('sent_at', yesterdayStart)
      .lt('sent_at', yesterdayEnd)

    // Query 7: Proposals accepted today
    const { count: proposalsAcceptedToday } = await supabase
      .from('sales_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('status', 'accepted')
      .gte('accepted_at', todayStart)

    // Query 8: Proposals accepted yesterday
    const { count: proposalsAcceptedYesterday } = await supabase
      .from('sales_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('status', 'accepted')
      .gte('accepted_at', yesterdayStart)
      .lt('accepted_at', yesterdayEnd)

    // Query 9: Revenue today (sum of accepted proposals)
    const { data: revenueToday } = await supabase
      .from('sales_proposals')
      .select('total_value')
      .eq('sales_user_id', user.id)
      .eq('status', 'accepted')
      .gte('accepted_at', todayStart)

    // Query 10: Revenue yesterday
    const { data: revenueYesterday } = await supabase
      .from('sales_proposals')
      .select('total_value')
      .eq('sales_user_id', user.id)
      .eq('status', 'accepted')
      .gte('accepted_at', yesterdayStart)
      .lt('accepted_at', yesterdayEnd)

    // Calculate totals
    const revenueTodayTotal = revenueToday?.reduce((sum, p) => sum + (Number(p.total_value) || 0), 0) || 0
    const revenueYesterdayTotal = revenueYesterday?.reduce((sum, p) => sum + (Number(p.total_value) || 0), 0) || 0

    // Calculate conversion rates
    const conversionRateToday = proposalsSentToday && proposalsSentToday > 0
      ? ((proposalsAcceptedToday || 0) / proposalsSentToday) * 100
      : 0

    const conversionRateYesterday = proposalsSentYesterday && proposalsSentYesterday > 0
      ? ((proposalsAcceptedYesterday || 0) / proposalsSentYesterday) * 100
      : 0

    // Calculate percentage changes
    const calculateChange = (today: number, yesterday: number) => {
      if (yesterday === 0) return today > 0 ? 100 : 0
      return ((today - yesterday) / yesterday) * 100
    }

    // Set targets (can be customized or fetched from settings table)
    const targets = {
      callsMade: 20,
      leadsContacted: 15,
      proposalsSent: 5,
      conversionRate: 30,
      revenueGenerated: 100000
    }

    const metrics = {
      callsMade: {
        today: callsMadeToday || 0,
        yesterday: callsMadeYesterday || 0,
        change: calculateChange(callsMadeToday || 0, callsMadeYesterday || 0),
        target: targets.callsMade
      },
      leadsContacted: {
        today: uniqueLeadsToday,
        yesterday: uniqueLeadsYesterday,
        change: calculateChange(uniqueLeadsToday, uniqueLeadsYesterday),
        target: targets.leadsContacted
      },
      proposalsSent: {
        today: proposalsSentToday || 0,
        yesterday: proposalsSentYesterday || 0,
        change: calculateChange(proposalsSentToday || 0, proposalsSentYesterday || 0),
        target: targets.proposalsSent
      },
      conversionRate: {
        today: conversionRateToday,
        yesterday: conversionRateYesterday,
        change: calculateChange(conversionRateToday, conversionRateYesterday),
        target: targets.conversionRate
      },
      revenueGenerated: {
        today: revenueTodayTotal,
        yesterday: revenueYesterdayTotal,
        change: calculateChange(revenueTodayTotal, revenueYesterdayTotal),
        target: targets.revenueGenerated
      }
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("[v0] Error fetching sales metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch metrics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
