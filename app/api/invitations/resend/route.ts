import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendInvitationEmail } from '@/lib/email/resend'

/**
 * POST /api/invitations/resend
 * Resend an invitation email
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

    // Get user's role and center
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, center_id')
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
      .select(`
        *,
        centers!invitations_center_id_fkey(name)
      `)
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
    const isSameCenter = userData.center_id === invitation.center_id

    if (!isSuperAdmin && !isInviter && !isSameCenter) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Check invitation status - only resend if pending or expired
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Invitation already accepted' },
        { status: 400 }
      )
    }

    if (invitation.status === 'revoked') {
      return NextResponse.json(
        { error: 'Invitation was revoked' },
        { status: 400 }
      )
    }

    // Extend expiry by 7 days from now
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 7)

    // Update invitation status to pending and extend expiry
    const { data: updatedInvitation, error: updateError } = await supabase
      .from('invitations')
      .update({
        status: 'pending',
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update invitation:', updateError)
      return NextResponse.json(
        { error: 'Failed to update invitation' },
        { status: 500 }
      )
    }

    // Get inviter details for email
    const { data: inviter } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', invitation.invited_by)
      .single()

    const inviterName = inviter?.full_name || 'Beauty Center Admin'
    const inviterEmail = inviter?.email || ''

    // Resend invitation email
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`
    const centerName = invitation.centers?.name || null

    try {
      await sendInvitationEmail({
        to: invitation.email,
        inviterName,
        inviterEmail,
        role: invitation.invited_role,
        centerName,
        invitationLink,
        expiresAt: newExpiresAt.toISOString()
      })
      console.log('✅ Invitation email resent to:', invitation.email)
    } catch (emailError) {
      console.error('Failed to resend invitation email:', emailError)
      // Don't fail the request if email fails
      return NextResponse.json({
        invitation: updatedInvitation,
        warning: 'Invitation updated but email failed to send'
      })
    }

    return NextResponse.json({
      invitation: updatedInvitation,
      message: 'Invitation resent successfully'
    })

  } catch (error) {
    console.error('Resend invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
