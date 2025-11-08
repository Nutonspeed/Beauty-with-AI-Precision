import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(
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
    const { reason } = body

    // Verify proposal exists and belongs to user
    const { data: existing, error: checkError } = await supabase
      .from('sales_proposals')
      .select('id, status, lead_id, title')
      .eq('id', id)
      .eq('sales_user_id', user.id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Only allow rejecting sent proposals
    if (existing.status !== 'sent') {
      return NextResponse.json(
        { error: 'Only sent proposals can be rejected' },
        { status: 400 }
      )
    }

    // Update proposal status to rejected
    const { data: proposal, error: updateError } = await supabase
      .from('sales_proposals')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason || 'No reason provided',
        updated_at: new Date().toISOString(),
        win_probability: 0
      })
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
      console.error('[API] Error rejecting proposal:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('sales_activities')
      .insert({
        lead_id: existing.lead_id,
        sales_user_id: user.id,
        proposal_id: id,
        type: 'status_change',
        subject: 'Proposal Rejected',
        description: `Customer rejected proposal: ${existing.title}. Reason: ${reason || 'Not specified'}`,
        metadata: {
          old_status: existing.status,
          new_status: 'rejected',
          rejection_reason: reason
        }
      })

    return NextResponse.json(proposal)

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
