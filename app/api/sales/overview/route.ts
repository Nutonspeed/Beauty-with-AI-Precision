import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"

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
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()
    if (userErr || !userRow || !['sales_staff', 'admin'].includes(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Resolve clinic_id for this user (from public.users)
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[sales/overview] Failed to load user profile", profileError)
    }

    const clinicId = profile?.clinic_id ?? null

    const serviceClient = createServiceClient()

    const searchParams = _request.nextUrl.searchParams
    const range = searchParams.get("range") || "7d"
    const { from, to } = getRangeCutoff(range)

    // Helper to sum revenue from payment_transactions (real cashflow)
    async function getRevenueRange(from: string, to: string): Promise<number> {
      let query = serviceClient
        .from("payment_transactions")
        .select("amount, status, clinic_id")
        .eq("status", "succeeded")
        .gte("created_at", from)
        .lte("created_at", to)

      if (clinicId) {
        query = query.eq("clinic_id", clinicId)
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

      if (clinicId) {
        query = query.eq("clinic_id", clinicId)
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

    // Top packages from treatment_records (by treatment, last 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    let recordsQuery = serviceClient
      .from("treatment_records")
      .select("treatment_id, treatment_name, clinic_id")
      .gte("created_at", ninetyDaysAgo.toISOString())

    if (clinicId) {
      recordsQuery = recordsQuery.eq("clinic_id", clinicId)
    }

    const { data: records, error: recordsError } = await recordsQuery

    if (recordsError) {
      console.error("[sales/overview] Failed to fetch treatment records", recordsError)
    }

    const packageMap = new Map<string, { sold: number; treatmentId: string | null }>()

    for (const row of records ?? []) {
      const name = (row as any).treatment_name as string | null
      const treatmentId = ((row as any).treatment_id as string | null) ?? null
      if (!name) continue

      const current = packageMap.get(name) ?? { sold: 0, treatmentId }
      current.sold += 1
      // keep first non-null treatmentId we see
      if (!current.treatmentId && treatmentId) {
        current.treatmentId = treatmentId
      }
      packageMap.set(name, current)
    }

    let topPackages: TopPackage[] = []

    if (packageMap.size > 0) {
      const base = Array.from(packageMap.entries())
        .sort((a, b) => b[1].sold - a[1].sold)
        .slice(0, 5)

      const treatmentIds = base
        .map(([, v]) => v.treatmentId)
        .filter((id): id is string => !!id)

      let priceById = new Map<string, number>()

      if (treatmentIds.length > 0) {
        const { data: treatments, error: treatmentsError } = await serviceClient
          .from("treatments")
          .select("id, price_min, price_max")
          .in("id", treatmentIds)

        if (treatmentsError) {
          console.error("[sales/overview] Failed to fetch treatments", treatmentsError)
        } else {
          for (const t of treatments ?? []) {
            const id = (t as any).id as string
            const min = Number((t as any).price_min) || 0
            const max = Number((t as any).price_max) || min
            const avg = max > 0 ? (min + max) / 2 : min
            priceById.set(id, avg)
          }
        }
      }

      topPackages = base.map(([name, value]) => {
        const unitPrice = value.treatmentId ? priceById.get(value.treatmentId) ?? 0 : 0
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
