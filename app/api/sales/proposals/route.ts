import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'
import { canAccessSales } from '@/lib/auth/role-config'

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const supabase = await createServerClient()
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
    if (userErr || !userRow || !canAccessSales(userRow.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limitRaw = Number.parseInt(searchParams.get('limit') || '50')
    const offsetRaw = Number.parseInt(searchParams.get('offset') || '0')
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0

    const { listProposals } = await import('@/lib/sales/proposals-service')
    const payload = await listProposals({
      userId: user.id,
      clinicId: userRow.clinic_id ?? null,
      status,
      search,
      limit,
      offset,
    })

    return NextResponse.json(payload)

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    const duration = Date.now() - startedAt
    console.info("[sales/proposals][GET] done", { durationMs: duration })
  }
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const supabase = await createServerClient()
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
    if (userErr || !userRow || !canAccessSales(userRow.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { createProposal } = await import('@/lib/sales/proposals-service')
    const proposal = await createProposal(user.id, userRow.clinic_id ?? null, body)

    return NextResponse.json(proposal, { status: 201 })

  } catch (error) {
    const status = (error as any)?.status
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: typeof status === 'number' ? status : 500 })
  } finally {
    const duration = Date.now() - startedAt
    console.info("[sales/proposals][POST] done", { durationMs: duration })
  }
}
