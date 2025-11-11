/**
 * POST /api/invitations - Create new invitation
 * 
 * Permissions:
 * - Super Admin: Can invite clinic_owner (clinic_id = NULL)
 * - Clinic Owner/Manager: Can invite clinic_manager, clinic_staff, sales_staff, customer
 * - Sales Staff: Can invite customer only
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendInvitationEmail } from '@/lib/email/resend'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current user's role and clinic
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email, invited_role, clinic_id, metadata } = body

    // Validate required fields
    if (!email || !invited_role) {
      return NextResponse.json(
        { error: 'Email and invited_role are required' },
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

    // Validate invited_role
    const validRoles = ['clinic_owner', 'clinic_manager', 'clinic_staff', 'sales_staff', 'customer']
    if (!validRoles.includes(invited_role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if user already exists with this email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('id, status, expires_at')
      .eq('email', email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An active invitation already exists for this email' },
        { status: 409 }
      )
    }

    // Permission checks based on role
    let invitationData: any = {
      email,
      invited_role,
      invited_by: user.id,
      metadata: metadata || {}
    }

    if (currentUser.role === 'super_admin') {
      // Super Admin can invite anyone
      // For clinic_owner, clinic_id should be NULL (will be assigned when they create clinic)
      if (invited_role === 'clinic_owner') {
        invitationData.clinic_id = null
      } else {
        // For other roles, clinic_id is required
        if (!clinic_id) {
          return NextResponse.json(
            { error: 'clinic_id is required for non-clinic_owner invitations' },
            { status: 400 }
          )
        }
        invitationData.clinic_id = clinic_id
      }
    } else if (currentUser.role === 'clinic_owner' || currentUser.role === 'clinic_manager') {
      // Clinic Owner/Manager can invite to their own clinic only
      if (invited_role === 'clinic_owner') {
        return NextResponse.json(
          { error: 'Only Super Admin can invite clinic owners' },
          { status: 403 }
        )
      }
      
      if (!currentUser.clinic_id) {
        return NextResponse.json(
          { error: 'Your account is not associated with a clinic' },
          { status: 400 }
        )
      }

      // Can invite: clinic_manager, clinic_staff, sales_staff, customer
      const allowedRoles = ['clinic_manager', 'clinic_staff', 'sales_staff', 'customer']
      if (!allowedRoles.includes(invited_role)) {
        return NextResponse.json(
          { error: `You can only invite: ${allowedRoles.join(', ')}` },
          { status: 403 }
        )
      }

      invitationData.clinic_id = currentUser.clinic_id
    } else if (currentUser.role === 'sales_staff') {
      // Sales Staff can only invite customers to their clinic
      if (invited_role !== 'customer') {
        return NextResponse.json(
          { error: 'Sales staff can only invite customers' },
          { status: 403 }
        )
      }

      if (!currentUser.clinic_id) {
        return NextResponse.json(
          { error: 'Your account is not associated with a clinic' },
          { status: 400 }
        )
      }

      invitationData.clinic_id = currentUser.clinic_id
    } else {
      return NextResponse.json(
        { error: 'You do not have permission to create invitations' },
        { status: 403 }
      )
    }

    // Create invitation (token will be auto-generated by trigger)
    const { data: invitation, error: insertError } = await supabase
      .from('invitations')
      .insert(invitationData)
      .select(`
        id,
        email,
        invited_role,
        clinic_id,
        token,
        status,
        expires_at,
        created_at,
        clinics:clinic_id (
          id,
          name
        )
      `)
      .single()

    if (insertError) {
      console.error('Error creating invitation:', insertError)
      return NextResponse.json(
        { error: 'Failed to create invitation', details: insertError.message },
        { status: 500 }
      )
    }

    // Generate invitation link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const invitationLink = `${baseUrl}/invite/${invitation.token}`

    // Get inviter's full name
    const { data: inviterData } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Type cast for clinic relationship
    const invitationWithClinic = invitation as any
    const clinicData = invitationWithClinic.clinics

    // Send invitation email
    try {
      await sendInvitationEmail({
        to: invitation.email,
        inviterName: inviterData?.full_name || 'Admin',
        inviterEmail: inviterData?.email || user.email || '',
        role: invitation.invited_role,
        clinicName: clinicData?.name || null,
        invitationLink,
        expiresAt: invitation.expires_at
      })
      console.log('✅ Invitation email sent to:', invitation.email)
    } catch (emailError: any) {
      // Log error but don't fail the request
      console.error('⚠️ Failed to send invitation email:', emailError.message)
      // Continue - invitation is created, email can be resent later
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        invited_role: invitation.invited_role,
        clinic_id: invitation.clinic_id,
        clinic_name: clinicData?.name || null,
        token: invitation.token,
        invitation_link: invitationLink,
        expires_at: invitation.expires_at,
        created_at: invitation.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/invitations - List invitations
 * 
 * Query params:
 * - status: pending|accepted|expired|revoked (optional)
 * - clinic_id: filter by clinic (optional)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clinicId = searchParams.get('clinic_id')

    // Build query
    let query = supabase
      .from('invitations')
      .select(`
        id,
        email,
        invited_role,
        clinic_id,
        status,
        expires_at,
        accepted_at,
        created_at,
        invited_by,
        inviter:users!invitations_invited_by_fkey (
          id,
          email,
          full_name
        ),
        clinics:clinics!invitations_clinic_id_fkey (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (clinicId) {
      query = query.eq('clinic_id', clinicId)
    }

    const { data: invitations, error: queryError } = await query

    if (queryError) {
      console.error('Error fetching invitations:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      invitations: invitations || []
    })

  } catch (error) {
    console.error('Error in GET /api/invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
