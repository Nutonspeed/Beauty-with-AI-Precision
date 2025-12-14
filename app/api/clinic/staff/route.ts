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

    // Role/clinic guard
    const { data: userData, error: userErr } = await supabase
      .from('users')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single()
    if (userErr) {
      console.error('[clinic/staff] Failed to fetch user profile:', userErr)
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }
    if (!userData || (userData.role !== 'clinic_owner' && userData.role !== 'clinic_staff')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const clinicId = userData.clinic_id
    if (!clinicId) {
      return NextResponse.json({ error: 'No clinic associated' }, { status: 400 })
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
      .eq('clinic_id', clinicId)
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

    const summary = {
      total: staff?.length || 0,
      available: staff?.filter((s) => s.status === 'available').length || 0,
      busy: staff?.filter((s) => s.status === 'busy' || s.status === 'active').length || 0,
      offline: staff?.filter((s) => s.status === 'offline' || s.status === 'on_leave').length || 0,
    }

    return NextResponse.json({
      data: staff,
      summary,
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
        .select('id, max_sales_users')
        .eq('id', clinic_id)
        .single()

      if (!clinic) {
        return NextResponse.json(
          { error: 'Clinic not found' },
          { status: 404 }
        )
      }

      // Enforce sales user limit per clinic when creating sales staff
      const normalizedRole = String(role).toLowerCase()
      const isSalesRole = normalizedRole === 'sales' || normalizedRole === 'sales_staff'

      if (isSalesRole) {
        const maxSalesUsers = (clinic as any).max_sales_users ?? 1

        const { count: existingSalesUsers, error: salesCountError } = await supabase
          .from('clinic_staff')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinic_id)
          .eq('status', 'active')
          .in('role', ['sales', 'sales_staff'])

        if (salesCountError) {
          console.error('Error checking existing sales users:', salesCountError)
        } else if ((existingSalesUsers || 0) >= maxSalesUsers) {
          return NextResponse.json(
            {
              error: 'Sales user limit reached for this clinic',
              details: {
                maxSalesUsers,
                message: 'Your current plan allows only a limited number of sales users for this clinic. Please upgrade your plan to add more sales staff.',
              },
            },
            { status: 403 }
          )
        }
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
