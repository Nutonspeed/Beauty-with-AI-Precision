import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
