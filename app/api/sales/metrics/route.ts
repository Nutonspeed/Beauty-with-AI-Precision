import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { canAccessSales } from "@/lib/auth/role-config"

export const dynamic = 'force-dynamic' // Ensure fresh data on every request

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
    const range = searchParams.get('range') || '1d'

    const { fetchSalesMetricsForUser } = await import('@/lib/sales/metrics-service')
    const metrics = await fetchSalesMetricsForUser(user.id, userRow.clinic_id ?? null, range)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("[v0] Error fetching sales metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch metrics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    const duration = Date.now() - startedAt
    console.info("[sales/metrics] done", { durationMs: duration })
  }
}
