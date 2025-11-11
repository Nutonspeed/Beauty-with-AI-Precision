/**
 * POST /api/invitations/[token]/accept - Accept invitation and create account
 * 
 * Body:
 * - full_name: string (required)
 * - password: string (required, min 8 characters)
 * 
 * Flow:
 * 1. Validate invitation token
 * 2. Create auth user with email + password
 * 3. Create user record in users table
 * 4. Call accept_invitation() to assign clinic & role
 * 5. Return success with user data
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient()
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { full_name, password } = body

    // Validate required fields
    if (!full_name || !password) {
      return NextResponse.json(
        { error: 'full_name and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Step 1: Validate invitation token
    const { data: validationData, error: validationError } = await supabase
      .rpc('validate_invitation', { invitation_token: token })

    if (validationError) {
      console.error('Error validating invitation:', validationError)
      return NextResponse.json(
        { error: 'Failed to validate invitation' },
        { status: 500 }
      )
    }

    if (!validationData || validationData.length === 0) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    const invitation = validationData[0]

    // Check if invitation is valid
    if (!invitation.is_valid) {
      return NextResponse.json(
        { error: invitation.error_message || 'Invitation is not valid' },
        { status: 400 }
      )
    }

    // Step 2: Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: invitation.email,
      password: password,
      options: {
        data: {
          full_name: full_name
        }
      }
    })

    if (signUpError) {
      console.error('Error creating auth user:', signUpError)
      
      // Handle specific error cases
      if (signUpError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create account', details: signUpError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Step 3: Create user record in users table
    // Note: This might be handled by a trigger on auth.users insert
    // But we'll do it explicitly to ensure it's created with correct data
    const { error: userInsertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: invitation.email,
        full_name: full_name,
        role: invitation.invited_role,
        clinic_id: invitation.clinic_id,
        created_at: new Date().toISOString()
      })

    if (userInsertError) {
      // If user record already exists (from trigger), that's OK
      if (!userInsertError.message.includes('duplicate key')) {
        console.error('Error creating user record:', userInsertError)
        // Continue anyway - the accept_invitation function will update it
      }
    }

    // Step 4: Call accept_invitation function to mark invitation as accepted
    // and ensure user's clinic_id and role are set correctly
    const { data: acceptData, error: acceptError } = await supabase
      .rpc('accept_invitation', {
        invitation_token: token,
        user_id: authData.user.id
      })

    if (acceptError) {
      console.error('Error accepting invitation:', acceptError)
      // Don't fail the whole request - user is already created
      // But log the error for debugging
    }

    // Get clinic name if applicable
    let clinicName = null
    if (invitation.clinic_id) {
      const { data: clinic } = await supabase
        .from('clinics')
        .select('name')
        .eq('id', invitation.clinic_id)
        .single()
      
      if (clinic) {
        clinicName = clinic.name
      }
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: authData.user.id,
        email: invitation.email,
        full_name: full_name,
        role: invitation.invited_role,
        clinic_id: invitation.clinic_id,
        clinic_name: clinicName
      },
      // Include session data for auto-login
      session: authData.session
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/invitations/[token]/accept:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
