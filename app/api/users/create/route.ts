import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeRole } from '@/lib/auth/role-normalize'

/**
 * POST /api/users/create
 * Create a new user (invitation-only system)
 *
 * Canonical Roles & Permissions (normalized via normalizeRole):
 * - super_admin: can create clinic_owner OR clinic_admin (staff management at top-level)
 * - clinic_admin: can create sales_staff (within same clinic)
 * - sales_staff: can create customer (within same clinic)
 * - other roles: no creation rights
 */

type ParsedRequest = {
  email: string
  full_name: string
  rawRole: string
  clinic_id?: string
}

function parseBody(body: any): ParsedRequest | { error: NextResponse } {
  const email = body?.email
  const role = body?.role
  const full_name = body?.full_name
  const clinic_id = body?.clinic_id as string | undefined

  if (!email || !role || !full_name) {
    return {
      error: NextResponse.json(
        { error: 'Missing required fields: email, role, full_name' },
        { status: 400 }
      ),
    }
  }
  return { email, full_name, rawRole: role, clinic_id }
}

function validatePermissions(
  actorRole: string,
  targetRole: string,
  clinic_id: string | undefined,
  actorClinicId: string | null
): { ok: true } | { ok: false; status: number; message: string } {
  if (actorRole === 'super_admin') {
    if (!(targetRole === 'clinic_admin' || targetRole === 'clinic_owner')) {
      return { ok: false, status: 403, message: 'super_admin can only create clinic_admin or clinic_owner' }
    }
    if (!clinic_id) {
      return { ok: false, status: 400, message: 'clinic_id required when creating clinic_admin or clinic_owner' }
    }
    return { ok: true }
  }

  if (actorRole === 'clinic_admin' || actorRole === 'clinic_owner') {
    if (targetRole !== 'sales_staff') {
      return { ok: false, status: 403, message: `${actorRole} can only create sales_staff` }
    }
    if (clinic_id && clinic_id !== (actorClinicId ?? undefined)) {
      return { ok: false, status: 403, message: 'Cannot create users in other clinics' }
    }
    return { ok: true }
  }

  if (actorRole === 'sales_staff') {
    if (targetRole !== 'customer') {
      return { ok: false, status: 403, message: 'sales_staff can only create customer' }
    }
    if (clinic_id && clinic_id !== (actorClinicId ?? undefined)) {
      return { ok: false, status: 403, message: 'Cannot create users in other clinics' }
    }
    return { ok: true }
  }

  return { ok: false, status: 403, message: 'Insufficient permissions to create users' }
}

async function createAuthUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    email: string
    full_name: string
    tempPassword: string
    targetRole: string
    clinic_id?: string | null
    creatorId: string
    originalRequestedRole: string
  }
) {
  const { email, full_name, tempPassword, targetRole, clinic_id, creatorId, originalRequestedRole } = params
  return supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: false,
    user_metadata: {
      full_name,
      role: targetRole,
      clinic_id,
      created_by: creatorId,
      original_requested_role: originalRequestedRole,
    },
  })
}

async function insertUserRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: { id: string; email: string; full_name: string; role: string; clinic_id?: string | null }
) {
  const { id, email, full_name, role, clinic_id } = params
  return supabase.from('users').insert({ id, email, full_name, role, clinic_id })
}

async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  details: Record<string, unknown>
) {
  try {
    await supabase.from('user_activity_log').insert({
      user_id: actorId,
      action: 'create_user',
      details,
    })
  } catch (logError) {
    console.warn('Failed to log activity:', logError)
  }
}
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

    // Get user profile with role (raw string from DB)
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
  const parsed = parseBody(body)
  if ('error' in parsed) return parsed.error
  const { email, rawRole, full_name, clinic_id } = parsed
  const actorRole = normalizeRole(profile.role)
  const targetRole = normalizeRole(rawRole)

    // Validation
    // Permission checks based on normalized canonical roles
    const perm = validatePermissions(actorRole, targetRole, clinic_id, profile.clinic_id)
    if (!perm.ok) {
      return NextResponse.json({ error: perm.message }, { status: perm.status })
    }

    // Generate temporary password
    const tempPassword = generateTempPassword()

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await createAuthUser(supabase, {
      email,
      full_name,
      tempPassword,
      targetRole,
      clinic_id: clinic_id || profile.clinic_id,
      creatorId: user.id,
      originalRequestedRole: rawRole,
    })

    if (createError) {
      console.error('Failed to create user:', createError)
      return NextResponse.json(
        { error: 'Failed to create user', details: createError instanceof Error ? createError.message : 'Unknown error' },
        { status: 500 }
      )
    }

    // Create user entry in users table
    const { error: userInsertError } = await insertUserRow(supabase, {
      id: newUser.user.id,
      email,
      full_name,
      role: targetRole,
      clinic_id: clinic_id || profile.clinic_id,
    })

    if (userInsertError) {
      console.error('Failed to create user entry:', userInsertError)
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json(
        { error: 'Failed to create user entry', details: userInsertError instanceof Error ? userInsertError.message : 'Unknown error' },
        { status: 500 }
      )
    }

    // Log activity
    await logActivity(supabase, user.id, {
      created_user_id: newUser.user.id,
      created_user_email: email,
      created_user_role: targetRole,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email,
        full_name,
        role: targetRole,
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
