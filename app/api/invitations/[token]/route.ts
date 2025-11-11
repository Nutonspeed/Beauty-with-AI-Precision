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

    // Call validate_invitation function
    const { data, error } = await supabase
      .rpc('validate_invitation', { invitation_token: token })

    if (error) {
      console.error('Error validating invitation:', error)
      return NextResponse.json(
        { error: 'Failed to validate invitation' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    const invitation = data[0]

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
        is_valid: invitation.is_valid,
        error_message: invitation.error_message
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
