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

    // Only allow accepting sent proposals
    if (existing.status !== 'sent') {
      return NextResponse.json(
        { error: 'Only sent proposals can be accepted' },
        { status: 400 }
      )
    }

    // Update proposal status to accepted
    const { data: proposal, error: updateError } = await supabase
      .from('sales_proposals')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        win_probability: 100
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
      console.error('[API] Error accepting proposal:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Update lead status to qualified
    await supabase
      .from('sales_leads')
      .update({
        status: 'qualified',
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.lead_id)

    // Log activity
    await supabase
      .from('sales_activities')
      .insert({
        lead_id: existing.lead_id,
        sales_user_id: user.id,
        proposal_id: id,
        type: 'status_change',
        subject: 'Proposal Accepted',
        description: `Customer accepted proposal: ${existing.title}`,
        metadata: {
          old_status: existing.status,
          new_status: 'accepted'
        }
      })

    return NextResponse.json(proposal)

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
