import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/users
 * List all users (super_admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only super_admin can list all users
    if (userData.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get search query parameter
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const clinicId = searchParams.get('clinic_id') || ''

    // Build query
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        clinic_id,
        created_at,
        full_name,
        clinics:clinic_id (
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (clinicId) {
      query = query.eq('clinic_id', clinicId)
    }

    const { data: users, error: usersError } = await query

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      )
    }

    // Get auth metadata for each user
    const usersWithAuth = await Promise.all(
      (users || []).map(async (user) => {
        const { data: authUser } = await supabase.auth.admin.getUserById(user.id)
        return {
          ...user,
          last_sign_in_at: authUser?.user?.last_sign_in_at || null,
          email_confirmed_at: authUser?.user?.email_confirmed_at || null,
        }
      })
    )

    return NextResponse.json({
      users: usersWithAuth,
      total: usersWithAuth.length,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/users:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
