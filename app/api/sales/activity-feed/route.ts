import { NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const startedAt = Date.now()

  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from("users")
      .select("role, clinic_id")
      .eq("id", user.id)
      .single()

    if (userErr || !userRow || !["sales_staff", "admin"].includes(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "25", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)
    const leadId = searchParams.get("leadId") || searchParams.get("lead_id")
    const type = searchParams.get("type")
    const rangeInput = searchParams.get("range")

    const { fetchActivityFeed } = await import("@/lib/sales/activity-feed-service")
    const payload = await fetchActivityFeed({
      userId: user.id,
      clinicId: userRow.clinic_id ?? null,
      limit,
      offset,
      leadId,
      type,
      rangeInput,
    })

    return NextResponse.json(payload)
  } catch (error) {
    console.error("[sales/activity-feed] Unexpected error", error)
    return NextResponse.json({ error: "Failed to load activity feed" }, { status: 500 })
  } finally {
    const duration = Date.now() - startedAt
    console.info("[sales/activity-feed][GET] done", { durationMs: duration })
  }
}
