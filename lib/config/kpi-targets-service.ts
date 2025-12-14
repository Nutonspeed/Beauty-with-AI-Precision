import type { SupabaseClient } from '@supabase/supabase-js'

export type SalesKpiTargets = {
  callsMade: number
  leadsContacted: number
  proposalsSent: number
  conversionRate: number
  revenueGenerated: number
  aiLeads: number
  aiProposals: number
  aiBookings: number
  aiBookingRevenue: number
  remoteConsultRequests: number
  remoteConsultConversion: number
  avgResponseMinutes: number
  winRateOverall: number
}

export const DEFAULT_SALES_KPI_TARGETS: SalesKpiTargets = {
  callsMade: 20,
  leadsContacted: 15,
  proposalsSent: 5,
  conversionRate: 30,
  revenueGenerated: 100000,
  aiLeads: 20,
  aiProposals: 10,
  aiBookings: 5,
  aiBookingRevenue: 50000,
  remoteConsultRequests: 10,
  remoteConsultConversion: 30,
  avgResponseMinutes: 30,
  winRateOverall: 35,
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

export async function getClinicSalesKpiTargets(options: {
  supabase: SupabaseClient
  clinicId: string | null
}): Promise<SalesKpiTargets> {
  const { supabase, clinicId } = options

  if (!clinicId) {
    return DEFAULT_SALES_KPI_TARGETS
  }

  try {
    const { data, error } = await supabase
      .from('clinic_kpi_targets')
      .select('targets')
      .eq('clinic_id', clinicId)
      .maybeSingle()

    if (error || !data?.targets) {
      return DEFAULT_SALES_KPI_TARGETS
    }

    const raw = data.targets as Record<string, unknown>

    return {
      callsMade: toNumberOrUndefined(raw.callsMade) ?? DEFAULT_SALES_KPI_TARGETS.callsMade,
      leadsContacted: toNumberOrUndefined(raw.leadsContacted) ?? DEFAULT_SALES_KPI_TARGETS.leadsContacted,
      proposalsSent: toNumberOrUndefined(raw.proposalsSent) ?? DEFAULT_SALES_KPI_TARGETS.proposalsSent,
      conversionRate: toNumberOrUndefined(raw.conversionRate) ?? DEFAULT_SALES_KPI_TARGETS.conversionRate,
      revenueGenerated: toNumberOrUndefined(raw.revenueGenerated) ?? DEFAULT_SALES_KPI_TARGETS.revenueGenerated,
      aiLeads: toNumberOrUndefined(raw.aiLeads) ?? DEFAULT_SALES_KPI_TARGETS.aiLeads,
      aiProposals: toNumberOrUndefined(raw.aiProposals) ?? DEFAULT_SALES_KPI_TARGETS.aiProposals,
      aiBookings: toNumberOrUndefined(raw.aiBookings) ?? DEFAULT_SALES_KPI_TARGETS.aiBookings,
      aiBookingRevenue: toNumberOrUndefined(raw.aiBookingRevenue) ?? DEFAULT_SALES_KPI_TARGETS.aiBookingRevenue,
      remoteConsultRequests: toNumberOrUndefined(raw.remoteConsultRequests) ?? DEFAULT_SALES_KPI_TARGETS.remoteConsultRequests,
      remoteConsultConversion: toNumberOrUndefined(raw.remoteConsultConversion) ?? DEFAULT_SALES_KPI_TARGETS.remoteConsultConversion,
      avgResponseMinutes: toNumberOrUndefined(raw.avgResponseMinutes) ?? DEFAULT_SALES_KPI_TARGETS.avgResponseMinutes,
      winRateOverall: toNumberOrUndefined(raw.winRateOverall) ?? DEFAULT_SALES_KPI_TARGETS.winRateOverall,
    }
  } catch {
    return DEFAULT_SALES_KPI_TARGETS
  }
}
