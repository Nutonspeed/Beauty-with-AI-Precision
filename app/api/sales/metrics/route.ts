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

    // ===== QUERY FROM SALES_LEADS TABLE (REAL DATA) =====
    
    // Query 1: Hot leads (high priority) - total active leads
    const { count: totalHotLeads } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .in('status', ['new', 'contacted', 'qualified'])
      .gte('score', 70) // High priority = score >= 70

    // Query 2: New leads today
    const { count: newLeadsToday } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('status', 'new')
      .gte('created_at', todayStart)

    // Query 3: New leads yesterday
    const { count: newLeadsYesterday } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('status', 'new')
      .gte('created_at', yesterdayStart)
      .lt('created_at', yesterdayEnd)

    // Query 4: Leads contacted today (last_contact_at updated today)
    const { count: leadsContactedToday } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .gte('last_contact_at', todayStart)

    // Query 5: Leads contacted yesterday
    const { count: leadsContactedYesterday } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .gte('last_contact_at', yesterdayStart)
      .lt('last_contact_at', yesterdayEnd)

    // Query 6: Qualified leads today
    const { count: qualifiedLeadsToday } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('status', 'qualified')
      .gte('updated_at', todayStart)

    // Query 7: Qualified leads yesterday
    const { count: qualifiedLeadsYesterday } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('status', 'qualified')
      .gte('updated_at', yesterdayStart)
      .lt('updated_at', yesterdayEnd)

    // Query 8: Total estimated revenue from active leads
    const { data: activeLeads } = await supabase
      .from('sales_leads')
      .select('estimated_value')
      .eq('sales_user_id', user.id)
      .in('status', ['qualified', 'proposal_sent'])

    const totalPotentialRevenue = activeLeads?.reduce(
      (sum, lead) => sum + (Number(lead.estimated_value) || 0), 
      0
    ) || 0

    // Calculate conversion rate (contacted → qualified)
    const conversionRateToday = leadsContactedToday && leadsContactedToday > 0
      ? ((qualifiedLeadsToday || 0) / leadsContactedToday) * 100
      : 0

    const conversionRateYesterday = leadsContactedYesterday && leadsContactedYesterday > 0
      ? ((qualifiedLeadsYesterday || 0) / leadsContactedYesterday) * 100
      : 0

    // Calculate percentage changes
    const calculateChange = (today: number, yesterday: number) => {
      if (yesterday === 0) return today > 0 ? 100 : 0
      return ((today - yesterday) / yesterday) * 100
    }

    // Set targets (can be customized or fetched from settings table)
    const targets = {
      callsMade: 20, // Target for hot leads
      leadsContacted: 15, // Target for contacted leads
      proposalsSent: 5, // Target for qualified leads
      conversionRate: 30, // Target conversion rate %
      revenueGenerated: 100000 // Target potential revenue
    }

    const metrics = {
      // Map to Hot Leads count
      callsMade: {
        today: totalHotLeads || 0,
        yesterday: 0, // Not applicable for total count
        change: 0,
        target: targets.callsMade
      },
      // Map to Leads Contacted
      leadsContacted: {
        today: leadsContactedToday || 0,
        yesterday: leadsContactedYesterday || 0,
        change: calculateChange(leadsContactedToday || 0, leadsContactedYesterday || 0),
        target: targets.leadsContacted
      },
      // Map to Qualified Leads
      proposalsSent: {
        today: qualifiedLeadsToday || 0,
        yesterday: qualifiedLeadsYesterday || 0,
        change: calculateChange(qualifiedLeadsToday || 0, qualifiedLeadsYesterday || 0),
        target: targets.proposalsSent
      },
      // Conversion Rate (contacted → qualified)
      conversionRate: {
        today: conversionRateToday,
        yesterday: conversionRateYesterday,
        change: calculateChange(conversionRateToday, conversionRateYesterday),
        target: targets.conversionRate
      },
      // Map to Total Potential Revenue
      revenueGenerated: {
        today: totalPotentialRevenue,
        yesterday: 0, // Not applicable for total potential
        change: 0,
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
