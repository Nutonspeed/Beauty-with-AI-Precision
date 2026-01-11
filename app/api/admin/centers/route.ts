import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createCenterSchema = z.object({
  name: z.string().min(2, 'Center name must be at least 2 characters'),
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

    // Fetch centers with enhanced data
    const { data: centers, error: centersError } = await supabase
      .from('centers')
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

    if (centersError) {
      throw centersError;
    }

    // Get subscription data for each center
    const enrichedCenters = await Promise.all(
      (centers || []).map(async (center) => {
        // Get subscription info
        const { data: subscription } = await supabase
          .from('center_subscriptions')
          .select(`
            status,
            mrr,
            subscription_plans(name)
          `)
          .eq('center_id', center.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get user count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('center_id', center.id);

        // Get last activity (from users table)
        const { data: lastActivity } = await supabase
          .from('profiles')
          .select('last_seen_at')
          .eq('center_id', center.id)
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

        // Center is active +10
        if (center.is_active) {
          healthScore += 10;
        }

        // Determine status
        let status: 'active' | 'inactive' | 'suspended' | 'trial' = 'inactive';
        
        if (!center.is_active) {
          status = 'suspended';
        } else if (subscription?.status === 'trial') {
          status = 'trial';
        } else if (subscription?.status === 'active') {
          status = 'active';
        }

        return {
          id: center.id,
          name: center.name,
          slug: center.slug,
          email: center.email || '',
          status,
          subscription: {
            plan: (subscription?.subscription_plans as any)?.name || 'None',
            status: subscription?.status || 'none',
            mrr: Number(subscription?.mrr || 0),
          },
          users: userCount || 0,
          createdAt: center.created_at,
          lastActivity: lastActivity?.last_seen_at || center.created_at,
          healthScore: Math.min(100, Math.max(0, healthScore)),
        };
      })
    );

    return NextResponse.json({
      centers: enrichedCenters,
      total: enrichedCenters.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Centers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch centers' },
      { status: 500 }
    );
  }
}

// POST: Create new center with onboarding
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
    const validation = createCenterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, slug, email, phone, address, plan, ownerEmail, ownerName, startTrial, trialDays } = validation.data;

    // Check if slug is unique
    const { data: existingCenter } = await supabase
      .from('centers')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingCenter) {
      return NextResponse.json(
        { error: 'Center slug already exists' },
        { status: 409 }
      );
    }

    // Calculate trial end date
    const trialEndsAt = startTrial 
      ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create center
    const { data: center, error: centerError } = await supabase
      .from('centers')
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

    if (centerError) {
      console.error('Error creating center:', centerError);
      return NextResponse.json(
        { error: 'Failed to create center', details: centerError.message },
        { status: 500 }
      );
    }

    // Create invitation for center owner
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        email: ownerEmail,
        invited_role: 'center_owner',
        center_id: center.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        invited_by: user.id,
        metadata: {
          ownerName,
          centerName: name,
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
      action: 'center_created',
      resource_type: 'center',
      resource_id: center.id,
      metadata: {
        centerName: name,
        plan,
        ownerEmail,
        startTrial,
      },
    });

    return NextResponse.json({
      success: true,
      center: {
        id: center.id,
        name: center.name,
        slug: center.slug,
        email: center.email,
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
    console.error('Error in POST /api/admin/centers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
