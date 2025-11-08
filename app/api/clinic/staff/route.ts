import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/clinic/staff - List all staff with filters and search
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('clinic_staff')
      .select(`
        *,
        user:users(id, email, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (role) {
      query = query.eq('role', role)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,specialty.ilike.%${search}%`)
    }

    const { data: staff, error, count } = await query

    if (error) {
      console.error('Error fetching staff:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: staff,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Error in GET /api/clinic/staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/clinic/staff - Create new staff member
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      user_id,
      clinic_id,
      role,
      specialty,
      full_name,
      email,
      phone,
      working_hours,
      days_off,
      hired_date,
      bio,
      certifications,
      languages,
      license_number,
      license_expiry
    } = body

    // Validation
    if (!user_id || !full_name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, full_name, email, role' },
        { status: 400 }
      )
    }

    // Verify clinic exists (if provided)
    if (clinic_id) {
      const { data: clinic } = await supabase
        .from('clinics')
        .select('id')
        .eq('id', clinic_id)
        .single()

      if (!clinic) {
        return NextResponse.json(
          { error: 'Clinic not found' },
          { status: 404 }
        )
      }
    }

    // Create staff member
    const staffData: any = {
      user_id,
      clinic_id,
      role,
      full_name,
      email,
      status: 'active',
      rating: 0,
      total_customers: 0, // Changed from total_patients
      total_appointments: 0,
      customers_today: 0, // Changed from patients_today
      appointments_today: 0,
      working_hours: working_hours || {},
      languages: languages || ['th']
    }

    // Add optional fields
    if (specialty) staffData.specialty = specialty
    if (phone) staffData.phone = phone
    if (days_off) staffData.days_off = days_off
    if (hired_date) staffData.hired_date = hired_date
    if (bio) staffData.bio = bio
    if (certifications) staffData.certifications = certifications

    // Add license info to metadata
    if (license_number || license_expiry) {
      staffData.metadata = {
        license_number,
        license_expiry
      }
    }

    const { data: newStaff, error } = await supabase
      .from('clinic_staff')
      .insert(staffData)
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .single()

    if (error) {
      console.error('Error creating staff:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newStaff, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/clinic/staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
