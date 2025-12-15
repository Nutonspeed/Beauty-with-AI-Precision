import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { canAccessSales } from "@/lib/auth/role-config"

export const dynamic = "force-dynamic"

interface FunnelStage {
  name: string
  count: number
  value: number
}

interface ConversionRates {
  leadsToQualified: number
  qualifiedToProposals: number
  proposalsToWon: number
}

interface SalesFunnelResponse {
  range: string
  stages: FunnelStage[]
  conversionRates: ConversionRates
}

function getRangeCutoff(range: string): string {
  const now = new Date()
  const start = new Date(now)
  switch (range) {
    case "7d":
      start.setDate(start.getDate() - 7)
      break
    case "30d":
      start.setDate(start.getDate() - 30)
      break
    default:
      start.setDate(start.getDate() - 1)
      break
  }
  return start.toISOString()
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Role guard
    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()
    if (userErr || !userRow || !canAccessSales(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get("range") || "7d"

    const { data: profile } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .maybeSingle()

    const clinicId = profile?.clinic_id ?? null

    const serviceClient = createServiceClient()
    const cutoff = getRangeCutoff(range)
    const nowIso = new Date().toISOString()

    let leadsQuery = serviceClient
      .from("sales_leads")
      .select("status, estimated_value, clinic_id")
      .gte("created_at", cutoff)
      .lte("created_at", nowIso)

    if (clinicId) {
      leadsQuery = leadsQuery.eq("clinic_id", clinicId)
    }

    const { data: leadsData, error: leadsError } = await leadsQuery
    if (leadsError) {
      console.error("[sales/funnel] Failed to fetch leads", leadsError)
      return NextResponse.json({ error: "Failed to load funnel" }, { status: 500 })
    }

    const stagesMap: Record<string, { count: number; value: number }> = {
      leads: { count: 0, value: 0 },
      qualified: { count: 0, value: 0 },
      proposals: { count: 0, value: 0 },
      won: { count: 0, value: 0 },
    }

    for (const row of leadsData ?? []) {
      const status = (row as any).status as string
      const value = Number((row as any).estimated_value) || 0
      stagesMap.leads.count += 1
      stagesMap.leads.value += value
      if (status === "qualified") {
        stagesMap.qualified.count += 1
        stagesMap.qualified.value += value
      }
    }

    let proposalsQuery = serviceClient
      .from("sales_proposals")
      .select("status, total_value, clinic_id")
      .gte("created_at", cutoff)
      .lte("created_at", nowIso)

    if (clinicId) {
      proposalsQuery = proposalsQuery.eq("clinic_id", clinicId)
    }

    const { data: proposalsData, error: proposalsError } = await proposalsQuery
    if (proposalsError) {
      console.error("[sales/funnel] Failed to fetch proposals", proposalsError)
    }

    for (const row of proposalsData ?? []) {
      const status = (row as any).status as string
      const value = Number((row as any).total_value) || 0
      stagesMap.proposals.count += 1
      stagesMap.proposals.value += value
      if (status === "accepted") {
        stagesMap.won.count += 1
        stagesMap.won.value += value
      }
    }

    const leadsCount = stagesMap.leads.count
    const qualifiedCount = stagesMap.qualified.count
    const proposalsCount = stagesMap.proposals.count
    const wonCount = stagesMap.won.count

    const conversionRates: ConversionRates = {
      leadsToQualified: leadsCount > 0 ? (qualifiedCount / leadsCount) * 100 : 0,
      qualifiedToProposals: qualifiedCount > 0 ? (proposalsCount / qualifiedCount) * 100 : 0,
      proposalsToWon: proposalsCount > 0 ? (wonCount / proposalsCount) * 100 : 0,
    }

    const stages: FunnelStage[] = [
      { name: "Leads", count: leadsCount, value: stagesMap.leads.value },
      { name: "Qualified", count: qualifiedCount, value: stagesMap.qualified.value },
      { name: "Proposals", count: proposalsCount, value: stagesMap.proposals.value },
      { name: "Won", count: wonCount, value: stagesMap.won.value },
    ]

    const payload: SalesFunnelResponse = {
      range,
      stages,
      conversionRates,
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error("[v0] Error fetching sales funnel:", error)
    return NextResponse.json(
      { error: "Failed to fetch sales funnel", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    const duration = Date.now() - startedAt
    console.info("[sales/funnel][GET] done", { durationMs: duration })
  }
}
