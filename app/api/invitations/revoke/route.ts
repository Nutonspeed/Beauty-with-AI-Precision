import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/invitations/revoke
 * Revoke an invitation
 * Body: { id: string } - invitation ID
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

    // Get user's role and clinic
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get invitation ID from body
    const body = await request.json()
    const invitationId = body.id

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      )
    }

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Permission check
    const isSuperAdmin = userData.role === 'super_admin'
    const isInviter = invitation.invited_by === user.id
    const isSameClinic = userData.clinic_id === invitation.clinic_id

    if (!isSuperAdmin && !isInviter && !isSameClinic) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Check invitation status - can't revoke accepted invitations
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Cannot revoke accepted invitation' },
        { status: 400 }
      )
    }

    if (invitation.status === 'revoked') {
      return NextResponse.json(
        { error: 'Invitation already revoked' },
        { status: 400 }
      )
    }

    // Update invitation status to revoked
    const { data: revokedInvitation, error: updateError } = await supabase
      .from('invitations')
      .update({
        status: 'revoked',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to revoke invitation:', updateError)
      return NextResponse.json(
        { error: 'Failed to revoke invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      invitation: revokedInvitation,
      message: 'Invitation revoked successfully'
    })

  } catch (error) {
    console.error('Revoke invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
