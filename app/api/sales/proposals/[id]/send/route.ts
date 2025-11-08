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

    // Only allow sending draft proposals
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft proposals can be sent' },
        { status: 400 }
      )
    }

    // Update proposal status to sent
    const { data: proposal, error: updateError } = await supabase
      .from('sales_proposals')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
      console.error('[API] Error sending proposal:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('sales_activities')
      .insert({
        lead_id: existing.lead_id,
        sales_user_id: user.id,
        proposal_id: id,
        type: 'email',
        subject: 'Proposal Sent',
        description: `Sent proposal: ${existing.title}`,
        contact_method: 'email'
      })

    return NextResponse.json(proposal)

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
