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
    const remoteConsultOnly = searchParams.get("remote_consult_only") === "true"
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

    if (remoteConsultOnly) {
      query = query.contains('metadata', { remote_consult_request: true })
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

    const source = body.source || 'other'

    // Validation: name ต้องมีเสมอ, email บังคับเฉพาะกรณีทั่วไป (ไม่ใช่ quick_scan)
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // สำหรับ lead ที่มาจาก quick_scan อนุญาตให้ไม่มี email ได้ (ใช้โทรศัพท์เป็นหลัก)
    if (source !== 'quick_scan') {
      if (!body.email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

      // Email validation (เฉพาะกรณีที่ต้องมี email)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Phone validation (optional but if provided must be valid)
    if (body.phone && !/^[0-9-+() ]+$/.test(body.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone format' },
        { status: 400 }
      )
    }

    // Basic score จาก body หรือจะคำนวณจาก metadata ถ้าไม่มีส่งมา
    let computedScore: number = body.score || 0
    if (!computedScore && body.metadata) {
      try {
        const meta = body.metadata
        const estimatedValue = body.estimated_value || meta.estimated_value || 0
        const concerns = meta.concerns || []
        const maxSeverity = Array.isArray(concerns) && concerns.length
          ? Math.max(...concerns.map((c: any) => Number(c.severity) || 0))
          : 0

        // คำนวณ score แบบง่าย ๆ: severity (0-10) + มูลค่าโดยประมาณ
        let score = 0
        score += Math.min(maxSeverity * 8, 40)              // สูงสุด 40 คะแนนจากความรุนแรง
        score += Math.min(Math.floor(estimatedValue / 1000), 40) // สูงสุด 40 คะแนนจากมูลค่า (ต่อ 1k)
        score += 20                                         // base score 20

        computedScore = Math.max(0, Math.min(score, 100))
      } catch {
        computedScore = 0
      }
    }

    // Prepare lead data
    const leadData = {
      sales_user_id: user.id,
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      status: body.status || 'cold',
      source,
      concern: body.concern || null,
      budget_min: body.budget_min || null,
      budget_max: body.budget_max || null,
      preferred_date: body.preferred_date || null,
      score: computedScore,
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
