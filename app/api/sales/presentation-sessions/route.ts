import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { PersistedPresentationData } from '@/lib/sales/presentation-storage'

function sanitizeCustomerSnapshot(payload: PersistedPresentationData, fallbackCustomerId: string) {
  const customer = payload?.customer ?? {}

  return {
    id: typeof customer.id === 'string' && customer.id.length > 0 ? customer.id : fallbackCustomerId,
    name: typeof customer.name === 'string' ? customer.name : '',
    phone: typeof customer.phone === 'string' ? customer.phone : '',
    email: typeof customer.email === 'string' ? customer.email : '',
  }
}

function buildProposalSummary(payload: PersistedPresentationData) {
  const proposal = payload?.proposal
  if (!proposal) {
    return null
  }

  const items = Array.isArray(proposal.items)
    ? proposal.items.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        total: item.total,
      }))
    : []

  return {
    subtotal: proposal.subtotal ?? 0,
    discountType: proposal.discountType ?? null,
    discountValue: proposal.discountValue ?? 0,
    discountAmount: proposal.discountAmount ?? 0,
    total: proposal.total ?? 0,
    paymentTerms: proposal.paymentTerms ?? '',
    notes: proposal.notes ?? '',
    itemCount: items.length,
    items,
  }
}

function isPersistedPresentationData(value: unknown): value is PersistedPresentationData {
  return Boolean(value && typeof value === 'object' && 'sessionId' in (value as Record<string, unknown>))
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const customerId = body?.customerId
    const payload = body?.payload

    if (typeof customerId !== 'string' || customerId.length === 0) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 })
    }

    if (!isPersistedPresentationData(payload)) {
      return NextResponse.json({ error: 'payload is invalid' }, { status: 400 })
    }

    if (typeof payload.sessionId !== 'string' || payload.sessionId.length === 0) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const customerSnapshot = sanitizeCustomerSnapshot(payload, customerId)
    const proposalSummary = buildProposalSummary(payload)
    const normalizedPayload = {
      ...payload,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('presentation_sessions')
      .upsert(
        {
          session_id: payload.sessionId,
          sales_user_id: user.id,
          customer_identifier: customerId,
          customer_snapshot: customerSnapshot,
          proposal_summary: proposalSummary,
          payload: normalizedPayload,
          status: 'synced',
          sync_attempts: 0,
          last_error: null,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('[presentation-sessions] Failed to upsert session', error)
      return NextResponse.json({ error: 'Failed to persist presentation session' }, { status: 500 })
    }

    return NextResponse.json({
      data,
      message: 'Presentation session synced successfully',
    })
  } catch (error) {
    console.error('[presentation-sessions] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
