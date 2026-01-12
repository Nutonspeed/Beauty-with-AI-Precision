import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { canAccessSales } from "@/lib/auth/role-config"

export const dynamic = "force-dynamic"

interface PeriodStats {
  scans: number
  revenue: number
}

interface TopPackage {
  name: string
  sold: number
  revenue: number
}

interface SalesOverviewResponse {
  today: PeriodStats
  thisWeek: PeriodStats
  thisMonth: PeriodStats
  topPackages: TopPackage[]
}

function getRangeCutoff(range: string) {
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
      // 1 day window
      start.setDate(start.getDate() - 1)
      break
  }

  return {
    from: start.toISOString(),
    to: now.toISOString(),
  }
}

export async function GET(_request: NextRequest) {
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
      .select('role, center_id')
      .eq('id', user.id)
      .single()
    if (userErr || !userRow || !canAccessSales(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Resolve center_id for this user (from public.users)
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("center_id")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[sales/overview] Failed to load user profile", profileError)
    }

    const centerId = profile?.center_id ?? null

    const serviceClient = createServiceClient()

    const searchParams = _request.nextUrl.searchParams
    const range = searchParams.get("range") || "7d"
    const { from, to } = getRangeCutoff(range)

    // Helper to sum revenue from payment_transactions (real cashflow)
    async function getRevenueRange(from: string, to: string): Promise<number> {
      let query = serviceClient
        .from("payment_transactions")
        .select("amount, status, center_id")
        .eq("status", "succeeded")
        .gte("created_at", from)
        .lte("created_at", to)

      if (centerId) {
        query = query.eq("center_id", centerId)
      }

      const { data, error } = await query

      if (error) {
        console.error("[sales/overview] Failed to fetch payments", error)
        return 0
      }

      return (
        data?.reduce((sum, row) => sum + (Number((row as any).amount) || 0), 0) ?? 0
      )
    }

    // Helper to count skin analyses (actual AI scans)
    async function getScansRange(from: string, to: string): Promise<number> {
      let query = serviceClient
        .from("skin_analyses")
        .select("id", { count: "exact", head: true })
        .gte("created_at", from)
        .lte("created_at", to)

      if (centerId) {
        query = query.eq("center_id", centerId)
      }

      const { count, error } = await query

      if (error) {
        console.error("[sales/overview] Failed to fetch skin analyses", error)
        return 0
      }

      return count ?? 0
    }

    // Compute period stats in parallel
    const [scans, revenue] = await Promise.all([
      getScansRange(from, to),
      getRevenueRange(from, to),
    ])

    // Top packages from program_records (by program, last 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    let recordsQuery = serviceClient
      .from("program_records")
      .select("program_id, program_name, center_id")
      .gte("created_at", ninetyDaysAgo.toISOString())

    if (centerId) {
      recordsQuery = recordsQuery.eq("center_id", centerId)
    }

    const { data: records, error: recordsError } = await recordsQuery

    if (recordsError) {
      console.error("[sales/overview] Failed to fetch program records", recordsError)
    }

    const packageMap = new Map<string, { sold: number; programId: string | null }>()

    for (const row of records ?? []) {
      const name = (row as any).program_name as string | null
      const programId = ((row as any).program_id as string | null) ?? null
      if (!name) continue

      const current = packageMap.get(name) ?? { sold: 0, programId }
      current.sold += 1
      // keep first non-null programId we see
      if (!current.programId && programId) {
        current.programId = programId
      }
      packageMap.set(name, current)
    }

    let topPackages: TopPackage[] = []

    if (packageMap.size > 0) {
      const base = Array.from(packageMap.entries())
        .sort((a, b) => b[1].sold - a[1].sold)
        .slice(0, 5)

      const programIds = base
        .map(([, v]) => v.programId)
        .filter((id): id is string => !!id)

      let priceById = new Map<string, number>()

      if (programIds.length > 0) {
        const { data: programs, error: programsError } = await serviceClient
          .from("programs")
          .select("id, price_min, price_max")
          .in("id", programIds)

        if (programsError) {
          console.error("[sales/overview] Failed to fetch programs", programsError)
        } else {
          for (const t of programs ?? []) {
            const id = (t as any).id as string
            const min = Number((t as any).price_min) || 0
            const max = Number((t as any).price_max) || min
            const avg = max > 0 ? (min + max) / 2 : min
            priceById.set(id, avg)
          }
        }
      }

      topPackages = base.map(([name, value]) => {
        const unitPrice = value.programId ? priceById.get(value.programId) ?? 0 : 0
        return {
          name,
          sold: value.sold,
          revenue: unitPrice * value.sold,
        }
      }).slice(0, 3)
    }

    const payload: SalesOverviewResponse = {
      today: { scans, revenue },
      thisWeek: { scans, revenue },
      thisMonth: { scans, revenue },
      topPackages,
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error("[sales/overview] Failed to fetch overview", error)
    return NextResponse.json(
      { error: "Failed to fetch overview", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    const duration = Date.now() - startedAt
    console.info("[sales/overview] done", { durationMs: duration })
  }
}
