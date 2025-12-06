import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/branches/[id]/summary
 * Get comprehensive branch summary including inventory, staff, services, and revenue
 */
export const GET = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || '';
    // Get branch details
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select(`
        *,
        branch_manager:users!branches_branch_manager_id_fkey(id, email, full_name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (branchError) throw branchError;

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Get inventory summary
    const { data: inventorySummary } = await supabase.rpc('get_branch_inventory_summary', {
      p_branch_id: id,
    });

    // Get active staff count
    const { count: activeStaffCount } = await supabase
      .from('branch_staff_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', id)
      .eq('is_active', true);

    // Get available services count
    const { count: servicesCount } = await supabase
      .from('branch_services')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', id)
      .eq('is_available', true);

    // Get pending transfers
    const { count: pendingTransfersCount } = await supabase
      .from('branch_transfers')
      .select('*', { count: 'exact', head: true })
      .or(`from_branch_id.eq.${id},to_branch_id.eq.${id}`)
      .in('status', ['pending', 'approved', 'in_transit']);

    // Get today's revenue (if available)
    const today = new Date().toISOString().split('T')[0];
    const { data: todayRevenue } = await supabase
      .from('branch_revenue')
      .select('*')
      .eq('branch_id', id)
      .eq('period_date', today)
      .eq('period_type', 'daily')
      .single();

    // Get current month revenue
    const currentMonth = new Date().toISOString().substring(0, 7) + '-01';
    const { data: monthRevenue } = await supabase
      .from('branch_revenue')
      .select('*')
      .eq('branch_id', id)
      .eq('period_date', currentMonth)
      .eq('period_type', 'monthly')
      .single();

    return NextResponse.json({
      branch,
      inventory: inventorySummary?.[0] || {
        total_products: 0,
        low_stock_products: 0,
        out_of_stock_products: 0,
        total_inventory_value: 0,
      },
      staff: {
        active_count: activeStaffCount || 0,
        total_count: branch.total_staff_count || 0,
      },
      services: {
        available_count: servicesCount || 0,
      },
      transfers: {
        pending_count: pendingTransfersCount || 0,
      },
      revenue: {
        today: todayRevenue || null,
        current_month: monthRevenue || null,
      },
    });
  } catch (error) {
    console.error('Error fetching branch summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch summary' },
      { status: 500 }
    );
  }
})
