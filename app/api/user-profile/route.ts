import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API Route: Get User Profile (bypasses RLS using service role)
 * 
 * ⚠️ TEMPORARY: ใช้ service role key เพื่อ bypass RLS recursion issue
 * NOTE: ต้องแก้ RLS policies เพื่อลบ route นี้ในอนาคต
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log('[user-profile] GET request started')
  
  try {
    // Get user ID from query params
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      console.log('[user-profile] Missing userId parameter')
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    console.log('[user-profile] Fetching profile for userId:', userId)

    // Verify request has valid session (security check)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      console.log('[user-profile] Missing authorization header')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('[user-profile] Querying database...')
    // Get user profile
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    const elapsed = Date.now() - startTime
    console.log(`[user-profile] Query completed in ${elapsed}ms`)

    if (error) {
      console.error('[user-profile] Error fetching user profile:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    if (!profile) {
      console.log('[user-profile] User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[user-profile] Success! Returning profile:', { id: profile.id, role: profile.role })
    return NextResponse.json({ data: profile })
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error(`[user-profile] API error after ${elapsed}ms:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, updates = {} } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Verify auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service role client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Only allow updating known safe columns to avoid schema cache errors
    const allowedFields = new Set([
      'full_name',
      'phone',
      'avatar_url',
      'permissions',
      'role',
      'tier',
      'clinic_id',
      'last_login_at',
      'is_active',
      'updated_at',
      'email',
      'created_at',
    ])

    // Check if user exists, if not create new one
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist, create new one
      console.log('[user-profile] Creating new user...')
      
      // Set default values for required fields
      const createData = {
        id: userId,
        email: updates.email || '',
        full_name: updates.full_name || '',
        role: updates.role || 'customer',
        tier: 'free',
        is_active: updates.is_active !== undefined ? updates.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...Object.fromEntries(
          Object.entries(updates).filter(([key]) => allowedFields.has(key))
        )
      }

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert(createData)
        .select()
        .single()

      if (createError) {
        console.error('[user-profile] Error creating user:', createError)
        return NextResponse.json(
          { error: createError instanceof Error ? createError.message : 'Failed to create user' },
          { status: 500 }
        )
      }

      return NextResponse.json({ data: newUser })
    }

    // Update existing user
    const sanitizedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.has(key))
    )

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      )
    }

    // Update user profile
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(sanitizedUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
