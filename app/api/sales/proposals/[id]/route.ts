import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()
    if (userErr || !userRow || !['sales_staff', 'admin'].includes(userRow.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { getProposalById } = await import('@/lib/sales/proposals-service')
    const proposal = await getProposalById(user.id, userRow.clinic_id ?? null, id)
    return NextResponse.json(proposal)

  } catch (error) {
    const status = (error as any)?.status
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: typeof status === 'number' ? status : 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()
    if (userErr || !userRow || !['sales_staff', 'admin'].includes(userRow.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { updateProposal } = await import('@/lib/sales/proposals-service')
    const proposal = await updateProposal(user.id, userRow.clinic_id ?? null, id, body)

    return NextResponse.json(proposal)

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()
    if (userErr || !userRow || !['sales_staff', 'admin'].includes(userRow.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { deleteDraftProposal } = await import('@/lib/sales/proposals-service')
    const result = await deleteDraftProposal(user.id, userRow.clinic_id ?? null, id)

    return NextResponse.json(result)

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
