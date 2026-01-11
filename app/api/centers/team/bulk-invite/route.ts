import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface BulkInviteData {
  email: string;
  name: string;
  role: 'sales_staff' | 'clinic_staff' | 'clinic_manager';
}

export async function POST(request: NextRequest) {
  try {
    await cookies();
    const supabase = await createClient();

    // Verify user is clinic owner or admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile || !['clinic_owner', 'clinic_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden - Only clinic owners can invite team members' }, { status: 403 });
    }

    const clinicId = profile.clinic_id;
    if (!clinicId) {
      return NextResponse.json({ error: 'No clinic associated with user' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { invitations } = body as { invitations: BulkInviteData[] };

    if (!invitations || !Array.isArray(invitations) || invitations.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Provide invitations array.' },
        { status: 400 }
      );
    }

    // Validate max bulk size
    if (invitations.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 invitations per bulk request' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      failed: [] as { email: string; reason: string }[],
      duplicate: [] as string[],
    };

    // Process each invitation
    for (const invite of invitations) {
      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(invite.email)) {
          results.failed.push({ 
            email: invite.email, 
            reason: 'Invalid email format' 
          });
          continue;
        }

        // Validate role
        if (!['sales_staff', 'clinic_staff', 'clinic_manager'].includes(invite.role)) {
          results.failed.push({ 
            email: invite.email, 
            reason: 'Invalid role' 
          });
          continue;
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', invite.email.toLowerCase())
          .single();

        if (existingUser) {
          results.duplicate.push(invite.email);
          continue;
        }

        // Check if invitation already exists
        const { data: existingInvite } = await supabase
          .from('invitations')
          .select('id, email, status')
          .eq('email', invite.email.toLowerCase())
          .eq('clinic_id', clinicId)
          .eq('status', 'pending')
          .single();

        if (existingInvite) {
          results.duplicate.push(invite.email);
          continue;
        }

        // Create invitation
        const { data: invitation, error: inviteError } = await supabase
          .from('invitations')
          .insert({
            email: invite.email.toLowerCase(),
            invited_role: invite.role,
            clinic_id: clinicId,
            invited_by: user.id,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            metadata: {
              name: invite.name,
              bulkInvite: true,
              invitedAt: new Date().toISOString(),
            },
          })
          .select()
          .single();

        if (inviteError) {
          results.failed.push({ 
            email: invite.email, 
            reason: inviteError.message 
          });
          continue;
        }

        // TODO: Send invitation email
        // await sendInvitationEmail(invitation);

        results.success.push(invite.email);
      } catch (error: any) {
        results.failed.push({ 
          email: invite.email, 
          reason: error.message || 'Unknown error' 
        });
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'bulk_team_invite',
      resource_type: 'invitation',
      resource_id: clinicId,
      metadata: {
        total: invitations.length,
        success: results.success.length,
        failed: results.failed.length,
        duplicate: results.duplicate.length,
      },
    });

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: invitations.length,
        successful: results.success.length,
        failed: results.failed.length,
        duplicate: results.duplicate.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Bulk invite error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
