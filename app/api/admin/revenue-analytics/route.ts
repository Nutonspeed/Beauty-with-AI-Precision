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

    // Get current date for calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate MRR (Monthly Recurring Revenue)
    const { data: activeSubscriptions } = await supabase
      .from('clinic_subscriptions')
      .select('mrr')
      .eq('status', 'active');

    const totalMRR = activeSubscriptions?.reduce((sum, sub) => sum + Number(sub.mrr || 0), 0) || 0;
    const totalARR = totalMRR * 12;

    // Get subscription distribution by status
    const { data: subscriptionsByStatus } = await supabase
      .from('clinic_subscriptions')
      .select('status');

    const statusDistribution = {
      active: 0,
      trial: 0,
      past_due: 0,
      cancelled: 0,
      paused: 0,
    };

    if (subscriptionsByStatus) {
      for (const sub of subscriptionsByStatus) {
        if (sub.status in statusDistribution) {
          statusDistribution[sub.status as keyof typeof statusDistribution]++;
        }
      }
    }

    // Get revenue by plan
    const { data: revenueByPlan } = await supabase
      .from('clinic_subscriptions')
      .select(`
        plan_id,
        mrr,
        subscription_plans!inner(name)
      `)
      .eq('status', 'active');

    const planRevenue: Record<string, number> = {};
    if (revenueByPlan) {
      for (const item of revenueByPlan) {
        const planName = (item.subscription_plans as any)?.name || 'Unknown';
        planRevenue[planName] = (planRevenue[planName] || 0) + Number(item.mrr || 0);
      }
    }

    // Get monthly revenue trend (last 12 months)
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthStart = monthDate.toISOString();
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0).toISOString();

      const { data: monthInvoices } = await supabase
        .from('billing_invoices')
        .select('amount_paid')
        .eq('status', 'paid')
        .gte('paid_at', monthStart)
        .lte('paid_at', monthEnd);

      const revenue = monthInvoices?.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0) || 0;

      monthlyRevenue.push({
        month: monthDate.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }),
        revenue: Number(revenue.toFixed(2)),
      });
    }

    // Calculate payment success rate (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { count: totalTransactions } = await supabase
      .from('payment_transactions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    const { count: successfulTransactions } = await supabase
      .from('payment_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'succeeded')
      .gte('created_at', thirtyDaysAgo);

    const paymentSuccessRate = totalTransactions && totalTransactions > 0
      ? Number(((successfulTransactions || 0) / totalTransactions * 100).toFixed(1))
      : 0;

    // Calculate churn rate (cancelled subscriptions in last 30 days / total active at start)
    const { count: cancelledLast30Days } = await supabase
      .from('clinic_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('cancelled_at', thirtyDaysAgo);

    const { count: totalActiveSubscriptions } = await supabase
      .from('clinic_subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trial', 'past_due']);

    const churnRate = totalActiveSubscriptions && totalActiveSubscriptions > 0
      ? Number(((cancelledLast30Days || 0) / totalActiveSubscriptions * 100).toFixed(1))
      : 0;

    // Get outstanding invoices
    const { data: outstandingInvoices } = await supabase
      .from('billing_invoices')
      .select('amount_due, amount_paid')
      .in('status', ['open', 'past_due']);

    const totalOutstanding = outstandingInvoices?.reduce(
      (sum, inv) => sum + Number(inv.amount_due || 0) - Number(inv.amount_paid || 0),
      0
    ) || 0;

    // Get average revenue per clinic
    const activeClinicCount = statusDistribution.active + statusDistribution.trial;
    const averageRevenuePerClinic = activeClinicCount > 0
      ? Number((totalMRR / activeClinicCount).toFixed(2))
      : 0;

    // Get payment method distribution (last 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: paymentMethods } = await supabase
      .from('payment_transactions')
      .select('payment_method')
      .eq('status', 'succeeded')
      .gte('created_at', ninetyDaysAgo);

    const methodDistribution: Record<string, number> = {};
    if (paymentMethods) {
      for (const pm of paymentMethods) {
        const method = pm.payment_method || 'unknown';
        methodDistribution[method] = (methodDistribution[method] || 0) + 1;
      }
    }

    return NextResponse.json({
      overview: {
        mrr: Number(totalMRR.toFixed(2)),
        arr: Number(totalARR.toFixed(2)),
        totalClinics: activeClinicCount,
        averageRevenuePerClinic,
        churnRate,
        paymentSuccessRate,
        outstandingAmount: Number(totalOutstanding.toFixed(2)),
      },
      subscriptionDistribution: statusDistribution,
      revenueByPlan: Object.entries(planRevenue).map(([plan, revenue]) => ({
        plan,
        revenue: Number(revenue.toFixed(2)),
      })),
      monthlyTrend: monthlyRevenue,
      paymentMethods: Object.entries(methodDistribution).map(([method, count]) => ({
        method,
        count,
        percentage: Number((count / (paymentMethods?.length || 1) * 100).toFixed(1)),
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}
