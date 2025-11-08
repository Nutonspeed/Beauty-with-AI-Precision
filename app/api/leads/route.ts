import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LeadStatus, LeadSource } from '@/types/multi-tenant'

/**
 * GET /api/leads
 * Fetch leads with filtering and pagination
 * Requires authentication (sales staff only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get sales staff info
    const { data: salesStaff, error: staffError } = await supabase
      .from('sales_staff')
      .select('id, role, clinic_id')
      .eq('user_id', userId)
      .single()

    if (staffError || !salesStaff) {
      return NextResponse.json(
        { success: false, message: 'Sales staff profile not found' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as LeadStatus | null
    const source = searchParams.get('source') as LeadSource | null
    const salesStaffId = searchParams.get('sales_staff_id')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('leads')
      .select(`
        *,
        clinic:clinics!clinic_id (
          id,
          name,
          logo_url
        ),
        sales_staff:users!sales_staff_id (
          id,
          full_name,
          email
        ),
        analysis:skin_analyses!analysis_id (
          id,
          overall_score,
          created_at
        )
      `, { count: 'exact' })

    // Filter by clinic (all roles see only their clinic's leads)
    query = query.eq('clinic_id', salesStaff.clinic_id)

    // Filter by sales staff (regular staff see only their leads, admins see all)
    if (salesStaff.role !== 'super_admin' && salesStaff.role !== 'clinic_admin') {
      if (salesStaffId) {
        // If specific staff requested, check permission
        if (salesStaffId !== salesStaff.id) {
          return NextResponse.json(
            { success: false, message: 'You can only view your own leads' },
            { status: 403 }
          )
        }
        query = query.eq('sales_staff_id', salesStaffId)
      } else {
        // Default to own leads for regular staff
        query = query.eq('sales_staff_id', salesStaff.id)
      }
    } else if (salesStaffId) {
      // Admins can filter by specific sales staff
      query = query.eq('sales_staff_id', salesStaffId)
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (source) {
      query = query.eq('source', source)
    }

    // Search by name, phone, or email
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Order by: hot leads first, then by follow_up_date, then by created_at
    query = query
      .order('status', { ascending: false }) // hot > warm > contacted > new > cold > lost
      .order('follow_up_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: leads, error: leadsError, count } = await query

    if (leadsError) {
      console.error('[LeadsAPI] Error fetching leads:', leadsError)
      throw leadsError
    }

    return NextResponse.json({
      success: true,
      data: leads || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('[LeadsAPI] Error in GET:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch leads',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/leads
 * Create a new lead
 * Requires authentication (sales staff only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get sales staff info
    const { data: salesStaff, error: staffError } = await supabase
      .from('sales_staff')
      .select('id, role, clinic_id, branch_id')
      .eq('user_id', userId)
      .single()

    if (staffError || !salesStaff) {
      return NextResponse.json(
        { success: false, message: 'Sales staff profile not found' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      full_name,
      phone,
      email,
      line_id,
      status = 'new',
      source,
      analysis_id,
      interested_treatments = [],
      budget_range,
      notes,
    } = body

    // Validate required fields
    if (!full_name) {
      return NextResponse.json(
        { success: false, message: 'Full name is required' },
        { status: 400 }
      )
    }

    // Calculate initial lead score
    let leadScore = 50 // Base score

    // Adjust based on contact info availability
    if (phone) leadScore += 10
    if (email) leadScore += 10
    if (line_id) leadScore += 5

    // Adjust based on status
    if (status === 'hot') leadScore += 20
    else if (status === 'warm') leadScore += 10
    else if (status === 'cold') leadScore -= 10

    // Adjust based on budget
    if (budget_range) {
      if (budget_range.includes('> ฿100,000')) leadScore += 15
      else if (budget_range.includes('฿50,000')) leadScore += 10
      else if (budget_range.includes('฿30,000')) leadScore += 5
    }

    // Adjust based on interested treatments
    leadScore += Math.min(interested_treatments.length * 3, 15)

    // Cap score between 0-100
    leadScore = Math.max(0, Math.min(100, leadScore))

    // Create lead
    const { data: lead, error: createError } = await supabase
      .from('leads')
      .insert({
        clinic_id: salesStaff.clinic_id,
        branch_id: salesStaff.branch_id,
        sales_staff_id: salesStaff.id,
        full_name,
        phone,
        email,
        line_id,
        status,
        source,
        analysis_id,
        interested_treatments,
        budget_range,
        notes,
        lead_score: leadScore,
        last_contact_date: new Date().toISOString().split('T')[0],
        interaction_history: [{
          date: new Date().toISOString(),
          type: 'lead_created',
          notes: notes || 'Lead created from capture form',
          sales_staff_id: salesStaff.id,
        }],
      })
      .select(`
        *,
        clinic:clinics!clinic_id (
          id,
          name
        ),
        sales_staff:users!sales_staff_id (
          id,
          full_name
        )
      `)
      .single()

    if (createError) {
      console.error('[LeadsAPI] Error creating lead:', createError)
      throw createError
    }

    return NextResponse.json({
      success: true,
      data: lead,
      message: 'Lead created successfully',
    })
  } catch (error) {
    console.error('[LeadsAPI] Error in POST:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create lead',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
