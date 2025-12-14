import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createClinicSchema = z.object({
  name: z.string().min(2, 'Clinic name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  plan: z.enum(['starter', 'professional', 'enterprise']).default('starter'),
  ownerEmail: z.string().email('Invalid owner email'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  startTrial: z.boolean().default(true),
  trialDays: z.number().min(7).max(90).default(14),
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await cookies();
    const supabase = await createClient();

    // Verify user is super admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch clinics with enhanced data
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select(`
        id,
        name,
        slug,
        email,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (clinicsError) {
      throw clinicsError;
    }

    // Get subscription data for each clinic
    const enrichedClinics = await Promise.all(
      (clinics || []).map(async (clinic) => {
        // Get subscription info
        const { data: subscription } = await supabase
          .from('clinic_subscriptions')
          .select(`
            status,
            mrr,
            subscription_plans(name)
          `)
          .eq('clinic_id', clinic.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get user count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinic.id);

        // Get last activity (from users table)
        const { data: lastActivity } = await supabase
          .from('profiles')
          .select('last_seen_at')
          .eq('clinic_id', clinic.id)
          .order('last_seen_at', { ascending: false })
          .limit(1)
          .single();

        // Calculate health score (0-100)
        let healthScore = 50; // Base score

        // Active subscription +20
        if (subscription?.status === 'active') {
          healthScore += 20;
        }

        // Has users +15
        if ((userCount || 0) > 0) {
          healthScore += 15;
        }

        // Recent activity +15
        const daysSinceActivity = lastActivity?.last_seen_at
          ? Math.floor((Date.now() - new Date(lastActivity.last_seen_at).getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        
        if (daysSinceActivity < 7) {
          healthScore += 15;
        } else if (daysSinceActivity < 30) {
          healthScore += 10;
        }

        // Clinic is active +10
        if (clinic.is_active) {
          healthScore += 10;
        }

        // Determine status
        let status: 'active' | 'inactive' | 'suspended' | 'trial' = 'inactive';
        
        if (!clinic.is_active) {
          status = 'suspended';
        } else if (subscription?.status === 'trial') {
          status = 'trial';
        } else if (subscription?.status === 'active') {
          status = 'active';
        }

        return {
          id: clinic.id,
          name: clinic.name,
          slug: clinic.slug,
          email: clinic.email || '',
          status,
          subscription: {
            plan: (subscription?.subscription_plans as any)?.name || 'None',
            status: subscription?.status || 'none',
            mrr: Number(subscription?.mrr || 0),
          },
          users: userCount || 0,
          createdAt: clinic.created_at,
          lastActivity: lastActivity?.last_seen_at || clinic.created_at,
          healthScore: Math.min(100, Math.max(0, healthScore)),
        };
      })
    );

    return NextResponse.json({
      clinics: enrichedClinics,
      total: enrichedClinics.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Clinics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    );
  }
}

// POST: Create new clinic with onboarding
export async function POST(request: NextRequest) {
  try {
    await cookies();
    const supabase = await createClient();

    // Verify user is super admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const validation = createClinicSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, slug, email, phone, address, plan, ownerEmail, ownerName, startTrial, trialDays } = validation.data;

    // Check if slug is unique
    const { data: existingClinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingClinic) {
      return NextResponse.json(
        { error: 'Clinic slug already exists' },
        { status: 409 }
      );
    }

    // Calculate trial end date
    const trialEndsAt = startTrial 
      ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create clinic
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .insert({
        name,
        slug,
        email,
        phone: phone || null,
        address: address || null,
        is_active: true,
        subscription_plan: plan,
        subscription_status: startTrial ? 'trial' : 'active',
        is_trial: startTrial,
        trial_ends_at: trialEndsAt,
        subscription_started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (clinicError) {
      console.error('Error creating clinic:', clinicError);
      return NextResponse.json(
        { error: 'Failed to create clinic', details: clinicError.message },
        { status: 500 }
      );
    }

    // Create invitation for clinic owner
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        email: ownerEmail,
        invited_role: 'clinic_owner',
        clinic_id: clinic.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        invited_by: user.id,
        metadata: {
          ownerName,
          clinicName: name,
        },
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'clinic_created',
      resource_type: 'clinic',
      resource_id: clinic.id,
      metadata: {
        clinicName: name,
        plan,
        ownerEmail,
        startTrial,
      },
    });

    return NextResponse.json({
      success: true,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        slug: clinic.slug,
        email: clinic.email,
        plan,
        status: startTrial ? 'trial' : 'active',
        trialEndsAt,
      },
      invitation: invitation ? {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
      } : null,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/clinics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
