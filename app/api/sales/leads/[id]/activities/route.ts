import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET - Get all activities for a lead
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify lead ownership
    const { data: lead, error: leadError } = await supabase
      .from('sales_leads')
      .select('id')
  .eq('id', params.id)
      .eq('sales_user_id', user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 })
    }

    // Get activities
    const { data: activities, error } = await supabase
      .from('sales_activities')
      .select(`
        *,
        user:users!sales_activities_user_id_fkey(full_name, email)
      `)
  .eq('lead_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching activities:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: activities })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add new activity to lead
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validation
    if (!body.type || !body.title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      )
    }

    const validTypes = ['call', 'email', 'meeting', 'note', 'status_change', 'other']
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      )
    }

    // Verify lead ownership
    const { data: lead, error: leadError } = await supabase
      .from('sales_leads')
      .select('id')
  .eq('id', params.id)
      .eq('sales_user_id', user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 })
    }

    // Create activity
    const { data: activity, error } = await supabase
      .from('sales_activities')
      .insert([{
  lead_id: params.id,
        user_id: user.id,
        type: body.type,
        title: body.title,
        description: body.description || null,
        metadata: body.metadata || {},
        scheduled_at: body.scheduled_at || null,
      }])
      .select(`
        *,
        user:users!sales_activities_user_id_fkey(full_name, email)
      `)
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update lead's last_contact_date if it's a contact activity
    if (['call', 'email', 'meeting'].includes(body.type)) {
      await supabase
        .from('sales_leads')
        .update({ last_contact_date: new Date().toISOString() })
  .eq('id', params.id)
    }

    return NextResponse.json({ data: activity }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
