import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/users/create
 * Create a new user (invitation-only system)
 * 
 * Permissions:
 * - super_admin: can create clinic_owner
 * - clinic_owner: can create sales_staff
 * - sales_staff: NOT IMPLEMENTED YET (will create customer in Phase 2)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email, role, full_name, clinic_id } = body

    // Validation
    if (!email || !role || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, role, full_name' },
        { status: 400 }
      )
    }

    // Permission checks
    if (profile.role === 'super_admin') {
      // Super Admin can only create clinic_admin
      if (role !== 'clinic_admin') {
        return NextResponse.json(
          { error: 'Super Admin can only create clinic_admin' },
          { status: 403 }
        )
      }
      if (!clinic_id) {
        return NextResponse.json(
          { error: 'clinic_id required when creating clinic_admin' },
          { status: 400 }
        )
      }
    } else if (profile.role === 'clinic_admin') {
      // Clinic Admin can only create sales_staff in their own clinic
      if (role !== 'sales_staff') {
        return NextResponse.json(
          { error: 'Clinic Admin can only create sales_staff' },
          { status: 403 }
        )
      }
      // Use clinic admin's clinic_id
      if (clinic_id && clinic_id !== profile.clinic_id) {
        return NextResponse.json(
          { error: 'Cannot create users in other clinics' },
          { status: 403 }
        )
      }
    } else {
      // Other roles cannot create users
      return NextResponse.json(
        { error: 'Insufficient permissions to create users' },
        { status: 403 }
      )
    }

    // Generate temporary password
    const tempPassword = generateTempPassword()

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: false, // Require email verification
      user_metadata: {
        full_name,
        role,
        clinic_id: clinic_id || profile.clinic_id,
        created_by: user.id,
      }
    })

    if (createError) {
      console.error('Failed to create user:', createError)
      return NextResponse.json(
        { error: 'Failed to create user', details: createError.message },
        { status: 500 }
      )
    }

    // Create user entry in users table
    const { error: userInsertError } = await supabase
      .from('users')
      .insert({
        id: newUser.user.id,
        email,
        full_name,
        role,
        clinic_id: clinic_id || profile.clinic_id,
      })

    if (userInsertError) {
      console.error('Failed to create user entry:', userInsertError)
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json(
        { error: 'Failed to create user entry', details: userInsertError.message },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('user_activity_log').insert({
      user_id: user.id,
      action: 'create_user',
      details: {
        created_user_id: newUser.user.id,
        created_user_email: email,
        created_user_role: role,
      }
    }).catch(err => console.warn('Failed to log activity:', err))

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email,
        full_name,
        role,
        clinic_id: clinic_id || profile.clinic_id,
        temp_password: tempPassword, // Only for initial setup
      },
      message: 'User created successfully. Send invitation email with temp password.',
    })

  } catch (error) {
    console.error('Error in /api/users/create:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate a temporary password (12 characters)
 * Format: Abc12345!xyz
 */
function generateTempPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%'
  
  const randomChar = (chars: string) => chars[Math.floor(Math.random() * chars.length)]
  
  // Ensure password meets complexity requirements
  let password = ''
  password += randomChar(uppercase) // At least 1 uppercase
  password += randomChar(lowercase) // At least 1 lowercase
  password += randomChar(numbers) // At least 1 number
  password += randomChar(special) // At least 1 special char
  
  // Fill remaining 8 characters
  const allChars = uppercase + lowercase + numbers + special
  for (let i = 0; i < 8; i++) {
    password += randomChar(allChars)
  }
  
  // Shuffle password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}
