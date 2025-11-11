/**
 * GET /api/invitations/[token] - Validate invitation token
 * 
 * Returns invitation details if token is valid
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
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

    // Query invitation directly instead of using RPC function
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select(`
        id,
        email,
        invited_role,
        clinic_id,
        status,
        expires_at,
        invited_by,
        metadata
      `)
      .eq('token', token)
      .single()

    if (error || !invitation) {
      console.error('Error validating invitation:', error)
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Validate invitation status and expiry
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    const isExpired = expiresAt < now
    const isValid = invitation.status === 'pending' && !isExpired

    let errorMessage = null
    if (invitation.status === 'accepted') {
      errorMessage = 'Invitation already accepted'
    } else if (invitation.status === 'revoked') {
      errorMessage = 'Invitation has been revoked'
    } else if (invitation.status === 'expired' || isExpired) {
      errorMessage = 'Invitation has expired'
    }

    // Get clinic name if clinic_id exists
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

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        invited_role: invitation.invited_role,
        clinic_id: invitation.clinic_id,
        clinic_name: clinicName,
        status: invitation.status,
        is_valid: isValid,
        error_message: errorMessage
      }
    })

  } catch (error) {
    console.error('Error in GET /api/invitations/[token]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
