import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface CenterDetailParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: CenterDetailParams) {
  try {
    await cookies();
    const { id: centerId } = await params;
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

    // Fetch center basic info
    const { data: center, error: centerError } = await supabase
      .from('centers')
      .select(`
        id,
        name,
        slug,
        email,
        phone,
        address,
        is_active,
        created_at,
        updated_at,
        settings
      `)
      .eq('id', centerId)
      .single();

    if (centerError || !center) {
      return NextResponse.json({ error: 'Center not found' }, { status: 404 });
    }

    // Fetch subscription info
    const { data: subscription } = await supabase
      .from('center_subscriptions')
      .select(`
        id,
        status,
        mrr,
        current_period_start,
        current_period_end,
        created_at,
        subscription_plans(id, name, price, features)
      `)
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Fetch users in this center
    const { data: users, count: userCount } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active, last_seen_at, created_at', { count: 'exact' })
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch customers in this center
    const { data: customers, count: customerCount } = await supabase
      .from('customers')
      .select('id, full_name, email, phone, created_at, last_visit_at', { count: 'exact' })
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch recent skin analyses
    const { data: analyses, count: analysisCount } = await supabase
      .from('skin_analyses')
      .select('id, user_id, overall_score, created_at, skin_type', { count: 'exact' })
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch bookings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: bookings, count: bookingCount } = await supabase
      .from('bookings')
      .select('id, status, program_type, scheduled_at, created_at', { count: 'exact' })
      .eq('center_id', centerId)
      .gte('created_at', startOfMonth.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch revenue data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: invoices } = await supabase
      .from('billing_invoices')
      .select('amount_paid, paid_at, status')
      .eq('center_id', centerId)
      .eq('status', 'paid')
      .gte('paid_at', sixMonthsAgo.toISOString())
      .order('paid_at', { ascending: true });

    // Calculate monthly revenue
    const monthlyRevenue: Record<string, number> = {};
    invoices?.forEach((inv) => {
      if (inv.paid_at) {
        const monthKey = new Date(inv.paid_at).toISOString().slice(0, 7); // YYYY-MM
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + Number(inv.amount_paid || 0);
      }
    });

    // Calculate total revenue
    const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0) || 0;

    // Calculate activity stats
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeUsersLast7Days = users?.filter(u => 
      u.last_seen_at && new Date(u.last_seen_at) >= sevenDaysAgo
    ).length || 0;

    const activeUsersLast30Days = users?.filter(u => 
      u.last_seen_at && new Date(u.last_seen_at) >= thirtyDaysAgo
    ).length || 0;

    // Calculate health score
    let healthScore = 50;
    if (subscription?.status === 'active') healthScore += 20;
    if ((userCount || 0) > 0) healthScore += 10;
    if (activeUsersLast7Days > 0) healthScore += 15;
    if ((analysisCount || 0) > 0) healthScore += 10;
    if (center.is_active) healthScore += 5;
    healthScore = Math.min(100, healthScore);

    return NextResponse.json({
      center: {
        ...center,
        healthScore,
      },
      subscription: subscription ? {
        ...subscription,
        plan: (subscription.subscription_plans as any) || null,
      } : null,
      users: {
        list: users || [],
        total: userCount || 0,
        activeLastWeek: activeUsersLast7Days,
        activeLastMonth: activeUsersLast30Days,
      },
      customers: {
        list: customers || [],
        total: customerCount || 0,
      },
      analyses: {
        list: analyses || [],
        total: analysisCount || 0,
      },
      bookings: {
        list: bookings || [],
        totalThisMonth: bookingCount || 0,
      },
      revenue: {
        total: totalRevenue,
        monthly: Object.entries(monthlyRevenue).map(([month, amount]) => ({
          month,
          amount: Number(amount.toFixed(2)),
        })),
        mrr: Number(subscription?.mrr || 0),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Center detail fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch center details' },
      { status: 500 }
    );
  }
}
