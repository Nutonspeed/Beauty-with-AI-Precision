import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"

// GET - List all leads for current user
export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Role guard
    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()
    if (userErr || !userRow || !['sales_staff', 'admin'].includes(userRow.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const campaign = searchParams.get("campaign")
    const remoteConsultOnly = searchParams.get("remote_consult_only") === "true"
    const limitRaw = Number.parseInt(searchParams.get("limit") || "50")
    const offsetRaw = Number.parseInt(searchParams.get("offset") || "0")
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0

    const { listLeads } = await import("@/lib/sales/leads-service")
    const payload = await listLeads({
      userId: user.id,
      clinicId: userRow.clinic_id ?? null,
      status,
      search,
      campaign,
      remoteConsultOnly,
      limit,
      offset,
    })

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    const duration = Date.now() - startedAt
    console.info("[sales/leads][GET] done", { durationMs: duration })
  }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Role guard
    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()
    if (userErr || !userRow || !['sales_staff', 'admin'].includes(userRow.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let body: any = null
    try {
      body = await request.json()
    } catch {
      return new NextResponse(null, { status: 204 })
    }

    const { createLead } = await import("@/lib/sales/leads-service")
    const { logLeadSystemActivity } = await import("@/lib/sales/lead-activities-service")

    const newLead = await createLead(user.id, userRow.clinic_id ?? null, body)

    await logLeadSystemActivity(
      user.id,
      userRow.clinic_id ?? null,
      newLead.id,
      "Lead Created",
      `Lead \"${newLead.name}\" was created`,
      { source: body?.source },
    )

    return NextResponse.json({ data: newLead }, { status: 201 })
  } catch (error) {
    const status = (error as any)?.status
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: typeof status === 'number' ? status : 500 })
  } finally {
    const duration = Date.now() - startedAt
    console.info("[sales/leads][POST] done", { durationMs: duration })
  }
}
