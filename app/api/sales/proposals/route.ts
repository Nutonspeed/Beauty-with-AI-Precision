import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('sales_proposals')
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
      `, { count: 'exact' })
      .eq('sales_user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`
        title.ilike.%${search}%,
        lead.name.ilike.%${search}%,
        lead.email.ilike.%${search}%
      `)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: proposals, error, count } = await query

    if (error) {
      console.error('[API] Error fetching proposals:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: proposals || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      lead_id,
      title,
      treatments,
      subtotal,
      discount_percent,
      discount_amount,
      total_value,
      valid_until,
      payment_terms,
      terms_and_conditions,
      notes
    } = body

    // Validation
    if (!lead_id || !title) {
      return NextResponse.json(
        { error: 'lead_id and title are required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(treatments) || treatments.length === 0) {
      return NextResponse.json(
        { error: 'At least one treatment is required' },
        { status: 400 }
      )
    }

    // Verify lead exists and belongs to user
    const { data: lead, error: leadError } = await supabase
      .from('sales_leads')
      .select('id, clinic_id')
      .eq('id', lead_id)
      .eq('sales_user_id', user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found or unauthorized' },
        { status: 404 }
      )
    }

    // Insert proposal
    const { data: proposal, error: insertError } = await supabase
      .from('sales_proposals')
      .insert({
        lead_id,
        sales_user_id: user.id,
        clinic_id: lead.clinic_id,
        title,
        status: 'draft',
        treatments,
        subtotal: subtotal || 0,
        discount_percent: discount_percent || 0,
        discount_amount: discount_amount || 0,
        total_value: total_value || 0,
        valid_until,
        payment_terms,
        terms_and_conditions,
        notes,
        win_probability: 0
      })
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

    if (insertError) {
      console.error('[API] Error creating proposal:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('sales_activities')
      .insert({
        lead_id,
        sales_user_id: user.id,
        proposal_id: proposal.id,
        type: 'note',
        subject: 'Proposal Created',
        description: `Created proposal: ${title}`
      })

    return NextResponse.json(proposal, { status: 201 })

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
