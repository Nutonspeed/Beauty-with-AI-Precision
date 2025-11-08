import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET - List all leads for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Build query
    let query = supabase
      .from('sales_leads')
      .select(`
        *,
        sales_user:users!sales_leads_sales_user_id_fkey(full_name, email),
        customer:users!sales_leads_customer_user_id_fkey(full_name, email)
      `, { count: 'exact' })
      .eq('sales_user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status && status !== "all") {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: leads, error, count } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: leads || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Phone validation (optional but if provided must be valid)
    if (body.phone && !/^[0-9-+() ]+$/.test(body.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone format' },
        { status: 400 }
      )
    }

    // Prepare lead data
    const leadData = {
      sales_user_id: user.id,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      status: body.status || 'cold',
      source: body.source || 'other',
      concern: body.concern || null,
      budget_min: body.budget_min || null,
      budget_max: body.budget_max || null,
      preferred_date: body.preferred_date || null,
      score: body.score || 0,
      notes: body.notes || null,
      tags: body.tags || [],
      custom_fields: body.custom_fields || {},
    }

    // Insert lead
    const { data: newLead, error } = await supabase
      .from('sales_leads')
      .insert([leadData])
      .select(`
        *,
        sales_user:users!sales_leads_sales_user_id_fkey(full_name, email),
        customer:users!sales_leads_customer_user_id_fkey(full_name, email)
      `)
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await supabase.from('sales_activities').insert([{
      lead_id: newLead.id,
      user_id: user.id,
      type: 'note',
      title: 'Lead Created',
      description: `Lead "${body.name}" was created`,
      metadata: { source: body.source },
    }])

    return NextResponse.json({ data: newLead }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
