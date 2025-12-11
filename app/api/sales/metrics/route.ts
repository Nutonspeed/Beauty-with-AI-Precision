import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic' // Ensure fresh data on every request

function getRangeWindows(range: string) {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // default: 1d window (today vs yesterday)
  if (range === '7d' || range === '30d') {
    const days = range === '7d' ? 7 : 30
    const currentStart = new Date(now)
    currentStart.setDate(currentStart.getDate() - days)
    const previousStart = new Date(currentStart)
    previousStart.setDate(previousStart.getDate() - days)
    const previousEnd = currentStart

    return {
      currentStart: currentStart.toISOString(),
      previousStart: previousStart.toISOString(),
      previousEnd: previousEnd.toISOString(),
    }
  }

  return {
    currentStart: today.toISOString(),
    previousStart: yesterday.toISOString(),
    previousEnd: today.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '1d'
    const { currentStart, previousStart, previousEnd } = getRangeWindows(range)

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
      .gte('created_at', currentStart)

    // Query 3: New leads yesterday
    const { count: newLeadsYesterday } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('status', 'new')
      .gte('created_at', previousStart)
      .lt('created_at', previousEnd)

    // Query 4: Leads contacted today (last_contact_at updated today)
    const { count: leadsContactedToday } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .gte('last_contact_at', currentStart)

    // Query 5: Leads contacted yesterday
    const { count: leadsContactedYesterday } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .gte('last_contact_at', previousStart)
      .lt('last_contact_at', previousEnd)

    // Query 6: Qualified leads today
    const { count: qualifiedLeadsToday } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('status', 'qualified')
      .gte('updated_at', currentStart)

    // Query 7: Qualified leads yesterday
    const { count: qualifiedLeadsYesterday } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('status', 'qualified')
      .gte('updated_at', previousStart)
      .lt('updated_at', previousEnd)

    // Query 8: Total revenue from accepted proposals in current range
    const { data: acceptedProposals } = await supabase
      .from('sales_proposals')
      .select('total_value, accepted_at, sales_user_id, status')
      .eq('sales_user_id', user.id)
      .eq('status', 'accepted')
      .gte('accepted_at', currentStart)

    const totalAcceptedRevenue = acceptedProposals?.reduce(
      (sum, row) => sum + (Number((row as any).total_value) || 0),
      0
    ) || 0

    // Query 9: AI leads created from AI scan/source in current range
    const { count: aiLeadsCount } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', user.id)
      .eq('source', 'ai_scan')
      .gte('created_at', currentStart)

    // Query 10: AI proposals created from AI leads in current range
    const { count: aiProposalsCount } = await supabase
      .from('sales_proposals')
      .select('id, created_at, sales_user_id, lead:sales_leads!inner(source)')
      .eq('sales_user_id', user.id)
      .eq('lead.source', 'ai_scan')
      .gte('created_at', currentStart)

    // Query 11: AI bookings created from accepted proposals for this user (identified via internal_notes pattern)
    const { data: aiBookingsRows } = await supabase
      .from('bookings')
      .select('price, booking_date, internal_notes')
      .ilike('internal_notes', `Created from accepted proposal%by ${user.id}%`)
      .gte('booking_date', currentStart)

    const aiBookingsCount = aiBookingsRows?.length || 0
    const aiBookingsRevenue = aiBookingsRows?.reduce(
      (sum, row) => sum + (Number((row as any).price) || 0),
      0,
    ) || 0

    // Query 12: Remote consult requests created in current range (from analysis results)
    const { count: remoteConsultRequestsCount } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true})
      .eq('sales_user_id', user.id)
      .contains('metadata', { remote_consult_request: true })
      .gte('created_at', currentStart)

    // Query 13: Remote consult leads that converted in current range
    const { count: remoteConsultConvertedCount } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true})
      .eq('sales_user_id', user.id)
      .contains('metadata', { remote_consult_request: true })
      .eq('status', 'converted')
      .gte('updated_at', currentStart)

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
      // Map to Total Revenue from accepted proposals
      revenueGenerated: {
        today: totalAcceptedRevenue,
        yesterday: 0, // Simplified: no previous window comparison for now
        change: 0,
        target: targets.revenueGenerated
      },
      aiLeads: {
        today: aiLeadsCount || 0,
        yesterday: 0,
        change: 0,
        target: 20,
      },
      aiProposals: {
        today: aiProposalsCount || 0,
        yesterday: 0,
        change: 0,
        target: 10,
      },
      aiBookings: {
        today: aiBookingsCount,
        yesterday: 0,
        change: 0,
        target: 5,
      },
      aiBookingRevenue: {
        today: aiBookingsRevenue,
        yesterday: 0,
        change: 0,
        target: 50000,
      },
      remoteConsultRequests: {
        today: remoteConsultRequestsCount || 0,
        yesterday: 0,
        change: 0,
        target: 10,
      },
      remoteConsultConversion: {
        today: remoteConsultRequestsCount && remoteConsultRequestsCount > 0
          ? ((remoteConsultConvertedCount || 0) / remoteConsultRequestsCount) * 100
          : 0,
        yesterday: 0,
        change: 0,
        target: 30,
      },
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
