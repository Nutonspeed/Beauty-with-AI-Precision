import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

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

    const { data: proposal, error } = await supabase
      .from('sales_proposals')
      .select(`
        *,
        lead:sales_leads!lead_id (
          id,
          name,
          email,
          phone,
          status,
          primary_concern
        ),
        sales_user:users!sales_user_id (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .eq('sales_user_id', user.id)
      .single()

    if (error || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json(proposal)

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    // Verify proposal exists and belongs to user
    const { data: existing, error: checkError } = await supabase
      .from('sales_proposals')
      .select('id, status, lead_id')
      .eq('id', id)
      .eq('sales_user_id', user.id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Allowed fields to update
    const allowedFields = [
      'title',
      'treatments',
      'subtotal',
      'discount_percent',
      'discount_amount',
      'total_value',
      'valid_until',
      'payment_terms',
      'terms_and_conditions',
      'notes',
      'win_probability'
    ]

    const updates: any = {
      updated_at: new Date().toISOString()
    }

    // Only update fields that are present in the request
    allowedFields.forEach(field => {
      if (field in body) {
        updates[field] = body[field]
      }
    })

    // Validate treatments if provided
    if (updates.treatments && (!Array.isArray(updates.treatments) || updates.treatments.length === 0)) {
      return NextResponse.json(
        { error: 'Treatments must be a non-empty array' },
        { status: 400 }
      )
    }

    const { data: proposal, error: updateError } = await supabase
      .from('sales_proposals')
      .update(updates)
      .eq('id', id)
      .eq('sales_user_id', user.id)
      .select(`
        *,
        lead:sales_leads!lead_id (
          id,
          name,
          email,
          phone,
          status
        ),
        sales_user:users!sales_user_id (
          id,
          full_name,
          email
        )
      `)
      .single()

    if (updateError) {
      console.error('[API] Error updating proposal:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log activity if status changed
    if ('status' in body && body.status !== existing.status) {
      await supabase
        .from('sales_activities')
        .insert({
          lead_id: existing.lead_id,
          sales_user_id: user.id,
          proposal_id: id,
          type: 'status_change',
          subject: 'Proposal Status Updated',
          description: `Status changed from ${existing.status} to ${body.status}`,
          metadata: {
            old_status: existing.status,
            new_status: body.status
          }
        })
    }

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

    // Verify proposal exists and belongs to user
    const { data: existing, error: checkError } = await supabase
      .from('sales_proposals')
      .select('id, lead_id, status')
      .eq('id', id)
      .eq('sales_user_id', user.id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Only allow deletion of draft proposals
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft proposals can be deleted. Use status update instead.' },
        { status: 400 }
      )
    }

    // Delete the proposal
    const { error: deleteError } = await supabase
      .from('sales_proposals')
      .delete()
      .eq('id', id)
      .eq('sales_user_id', user.id)

    if (deleteError) {
      console.error('[API] Error deleting proposal:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('sales_activities')
      .insert({
        lead_id: existing.lead_id,
        sales_user_id: user.id,
        type: 'note',
        subject: 'Proposal Deleted',
        description: 'Deleted draft proposal'
      })

    return NextResponse.json({ message: 'Proposal deleted successfully' })

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
