import { createServerClient } from '@/lib/supabase/server'
import { getClinicSalesKpiTargets } from '@/lib/config/kpi-targets-service'

function getRangeWindows(range: string) {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

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

export async function fetchSalesMetricsForUser(userId: string, clinicId: string | null, range: string = '1d') {
  const supabase = await createServerClient()
  const { currentStart, previousStart, previousEnd } = getRangeWindows(range)

  // Helper for clinic filter
  const applyClinic = <_T extends { eq: any }>(q: any) => (clinicId ? q.eq('clinic_id', clinicId) : q)

  // Query 1: Hot leads (high priority)
  const q1 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .in('status', ['new', 'contacted', 'qualified'])
      .gte('score', 70),
  )
  const { count: totalHotLeads } = await q1

  // Query 2: New leads today
  const q2 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .eq('status', 'new')
      .gte('created_at', currentStart),
  )
  const { count: newLeadsToday } = await q2

  // Query 3: New leads yesterday
  const q3 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .eq('status', 'new')
      .gte('created_at', previousStart)
      .lt('created_at', previousEnd),
  )
  const { count: newLeadsYesterday } = await q3

  // Query 4: Leads contacted today
  const q4 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .gte('last_contact_at', currentStart),
  )
  const { count: leadsContactedToday } = await q4

  // Query 5: Leads contacted yesterday
  const q5 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .gte('last_contact_at', previousStart)
      .lt('last_contact_at', previousEnd),
  )
  const { count: leadsContactedYesterday } = await q5

  // Query 6: Qualified leads today
  const q6 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .eq('status', 'qualified')
      .gte('updated_at', currentStart),
  )
  const { count: qualifiedLeadsToday } = await q6

  // Query 7: Qualified leads yesterday
  const q7 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .eq('status', 'qualified')
      .gte('updated_at', previousStart)
      .lt('updated_at', previousEnd),
  )
  const { count: qualifiedLeadsYesterday } = await q7

  // Query 8: Total revenue from accepted proposals
  let proposalsQuery = supabase
    .from('sales_proposals')
    .select('total_value, accepted_at, sales_user_id, status')
    .eq('sales_user_id', userId)
    .eq('status', 'accepted')
    .gte('accepted_at', currentStart)
  if (clinicId) proposalsQuery = proposalsQuery.eq('clinic_id', clinicId)
  const { data: acceptedProposals } = await proposalsQuery

  const totalAcceptedRevenue =
    acceptedProposals?.reduce((sum, row) => sum + (Number((row as any).total_value) || 0), 0) || 0

  // Query 9: AI leads created
  const q9 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .eq('source', 'ai_scan')
      .gte('created_at', currentStart),
  )
  const { count: aiLeadsCount } = await q9

  // Query 10: AI proposals created
  let aiProposalsQuery = supabase
    .from('sales_proposals')
    .select('id, created_at, sales_user_id, lead:sales_leads!inner(source)')
    .eq('sales_user_id', userId)
    .eq('lead.source', 'ai_scan')
    .gte('created_at', currentStart)
  if (clinicId) aiProposalsQuery = aiProposalsQuery.eq('clinic_id', clinicId)
  const { count: aiProposalsCount } = await aiProposalsQuery

  // Query 11: AI bookings created
  let aiBookingsQuery = supabase
    .from('bookings')
    .select('price, booking_date, internal_notes')
    .ilike('internal_notes', `Created from accepted proposal%by ${userId}%`)
    .gte('booking_date', currentStart)
  if (clinicId) aiBookingsQuery = aiBookingsQuery.eq('clinic_id', clinicId)
  const { data: aiBookingsRows } = await aiBookingsQuery

  const aiBookingsCount = aiBookingsRows?.length || 0
  const aiBookingsRevenue =
    aiBookingsRows?.reduce((sum, row) => sum + (Number((row as any).price) || 0), 0) || 0

  // Query 12: Remote consult requests
  const q12 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .contains('metadata', { remote_consult_request: true })
      .gte('created_at', currentStart),
  )
  const { count: remoteConsultRequestsCount } = await q12

  // Query 13: Remote consult leads converted
  const q13 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .contains('metadata', { remote_consult_request: true })
      .eq('status', 'converted')
      .gte('updated_at', currentStart),
  )
  const { count: remoteConsultConvertedCount } = await q13

  // Query 14-17: Lead age buckets
  const ageCut = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const q14 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .gte('created_at', ageCut(1)),
  )
  const { count: ageLt1d } = await q14

  const q15 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .gte('created_at', ageCut(3))
      .lt('created_at', ageCut(1)),
  )
  const { count: age1to3 } = await q15

  const q16 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .gte('created_at', ageCut(7))
      .lt('created_at', ageCut(3)),
  )
  const { count: age3to7 } = await q16

  const q17 = applyClinic(
    supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('sales_user_id', userId)
      .lt('created_at', ageCut(7)),
  )
  const { count: ageGt7 } = await q17

  // Query 18: Avg response time
  let responseQuery = supabase
    .from('sales_leads')
    .select('created_at, last_contact_at')
    .eq('sales_user_id', userId)
    .not('last_contact_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500)
  if (clinicId) responseQuery = responseQuery.eq('clinic_id', clinicId)
  const { data: responseRows } = await responseQuery

  const responseMinutes = (responseRows || [])
    .map((row) => {
      const created = new Date((row as any).created_at).getTime()
      const responded = new Date((row as any).last_contact_at).getTime()
      const diff = (responded - created) / 60000
      return isFinite(diff) && diff >= 0 ? diff : null
    })
    .filter((v) => v !== null) as number[]
  const avgResponseMinutes = responseMinutes.length
    ? Number((responseMinutes.reduce((a, b) => a + b, 0) / responseMinutes.length).toFixed(1))
    : 0

  // Query 19: Win rate by source
  let winLeadsQuery = supabase
    .from('sales_leads')
    .select('source, status')
    .eq('sales_user_id', userId)
    .not('source', 'is', null)
  if (clinicId) winLeadsQuery = winLeadsQuery.eq('clinic_id', clinicId)
  const { data: winLeads } = await winLeadsQuery

  const sourceTotals: Record<string, { total: number; won: number }> = {}
  ;(winLeads || []).forEach((lead) => {
    const src = (lead as any).source || 'unknown'
    if (!sourceTotals[src]) sourceTotals[src] = { total: 0, won: 0 }
    sourceTotals[src].total += 1
    if ((lead as any).status === 'converted' || (lead as any).status === 'won') {
      sourceTotals[src].won += 1
    }
  })
  const winRateBySource = Object.entries(sourceTotals).map(([source, { total, won }]) => ({
    source,
    winRate: total > 0 ? Number(((won / total) * 100).toFixed(1)) : 0,
    total,
  }))
  const overallTotal = winRateBySource.reduce((sum, s) => sum + s.total, 0)
  const overallWon = winRateBySource.reduce((sum, s) => sum + Math.round((s.winRate / 100) * s.total), 0)
  const winRateOverall = overallTotal > 0 ? Number(((overallWon / overallTotal) * 100).toFixed(1)) : 0

  const conversionRateToday = leadsContactedToday && leadsContactedToday > 0
    ? ((qualifiedLeadsToday || 0) / leadsContactedToday) * 100
    : 0
  const conversionRateYesterday = leadsContactedYesterday && leadsContactedYesterday > 0
    ? ((qualifiedLeadsYesterday || 0) / leadsContactedYesterday) * 100
    : 0

  const calculateChange = (today: number, yesterday: number) => {
    if (yesterday === 0) return today > 0 ? 100 : 0
    return ((today - yesterday) / yesterday) * 100
  }

  const targets = await getClinicSalesKpiTargets({ supabase: supabase as any, clinicId })

  return {
    callsMade: {
      today: totalHotLeads || 0,
      yesterday: 0,
      change: 0,
      target: targets.callsMade,
    },
    leadsContacted: {
      today: leadsContactedToday || 0,
      yesterday: leadsContactedYesterday || 0,
      change: calculateChange(leadsContactedToday || 0, leadsContactedYesterday || 0),
      target: targets.leadsContacted,
    },
    proposalsSent: {
      today: qualifiedLeadsToday || 0,
      yesterday: qualifiedLeadsYesterday || 0,
      change: calculateChange(qualifiedLeadsToday || 0, qualifiedLeadsYesterday || 0),
      target: targets.proposalsSent,
    },
    conversionRate: {
      today: conversionRateToday,
      yesterday: conversionRateYesterday,
      change: calculateChange(conversionRateToday, conversionRateYesterday),
      target: targets.conversionRate,
    },
    revenueGenerated: {
      today: totalAcceptedRevenue,
      yesterday: 0,
      change: 0,
      target: targets.revenueGenerated,
    },
    aiLeads: { today: aiLeadsCount || 0, yesterday: 0, change: 0, target: targets.aiLeads },
    aiProposals: { today: aiProposalsCount || 0, yesterday: 0, change: 0, target: targets.aiProposals },
    aiBookings: { today: aiBookingsCount, yesterday: 0, change: 0, target: targets.aiBookings },
    aiBookingRevenue: { today: aiBookingsRevenue, yesterday: 0, change: 0, target: targets.aiBookingRevenue },
    remoteConsultRequests: { today: remoteConsultRequestsCount || 0, yesterday: 0, change: 0, target: targets.remoteConsultRequests },
    remoteConsultConversion: {
      today:
        remoteConsultRequestsCount && remoteConsultRequestsCount > 0
          ? ((remoteConsultConvertedCount || 0) / remoteConsultRequestsCount) * 100
          : 0,
      yesterday: 0,
      change: 0,
      target: targets.remoteConsultConversion,
    },
    avgResponseMinutes: { today: avgResponseMinutes, yesterday: 0, change: 0, target: targets.avgResponseMinutes },
    winRateOverall: { today: winRateOverall, yesterday: 0, change: 0, target: targets.winRateOverall },
    leadAges: {
      today: {
        lt1d: ageLt1d || 0,
        d1to3: age1to3 || 0,
        d3to7: age3to7 || 0,
        gt7: ageGt7 || 0,
      },
    },
    winRateBySource,
    // Extra metrics retained for compatibility
    newLeads: {
      today: newLeadsToday || 0,
      yesterday: newLeadsYesterday || 0,
      change: calculateChange(newLeadsToday || 0, newLeadsYesterday || 0),
      target: 0,
    },
  }
}
