import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * POST /api/auth/register
 * Register a new user with Supabase Auth + custom users table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone, role } = body

    console.log('[Register API] 📝 Registration attempt:', { email, role })

    // Validation
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['customer', 'sales_staff', 'clinic_owner', 'admin', 'super_admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for easier testing
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError) {
      console.error('[Register API] ❌ Auth signup error:', authError)
      
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    console.log('[Register API] ✅ Supabase Auth user created:', authData.user.id)

    // 2. Create user record in custom users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        phone: phone || null,
        role: role,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (userError) {
      console.error('[Register API] ❌ User table insert error:', userError)
      
      // Rollback: Delete the auth user if we failed to create the user record
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: `Failed to create user profile: ${userError.message}` },
        { status: 500 }
      )
    }

    console.log('[Register API] ✅ User profile created:', userData.id)

    // 3. If clinic_owner or sales_staff, assign to default clinic (optional)
    // TODO: Implement clinic assignment logic if needed

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
      },
    }, { status: 201 })

  } catch (error: any) {
    console.error('[Register API] ❌ Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
