import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

/**
 * GET /api/branches/revenue
 * Get revenue report for branches
 *
 * Query parameters:
 * - branch_id (optional): Filter by branch
 * - period_type (optional): Filter by period type (daily, weekly, monthly, yearly)
 * - start_date (optional): Start date for date range
 * - end_date (optional): End date for date range
 */
export const GET = withClinicAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get('branch_id');
    const period_type = searchParams.get('period_type');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    function getSupabaseClient() { return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('branch_revenue')
      .select(`
        *,
        branch:branches(id, branch_code, branch_name, city, province)
      `);

    if (branch_id) {
      query = query.eq('branch_id', branch_id);
    }

    if (period_type) {
      query = query.eq('period_type', period_type);
    }

    if (start_date) {
      query = query.gte('period_date', start_date);
    }

    if (end_date) {
      query = query.lte('period_date', end_date);
    }

    const { data, error } = await query.order('period_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching branch revenue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch revenue' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/branches/revenue
 * Record revenue for a branch
 * 
 * Body:
 * - branch_id (required): Branch ID
 * - period_date (required): Period date
 * - period_type (required): Period type
 * - revenue data fields
 */
export const POST = withClinicAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      branch_id,
      period_date,
      period_type,
      total_revenue,
      service_revenue = 0,
      product_revenue = 0,
      total_transactions = 0,
      service_transactions = 0,
      product_transactions = 0,
      total_customers = 0,
      new_customers = 0,
      returning_customers = 0,
      cash_revenue = 0,
      card_revenue = 0,
      transfer_revenue = 0,
      other_revenue = 0,
      total_expenses = 0,
      staff_expenses = 0,
      inventory_expenses = 0,
    } = body;

    if (!branch_id || !period_date || !period_type) {
      return NextResponse.json(
        { error: 'branch_id, period_date, and period_type are required' },
        { status: 400 }
      );
    }

    // Calculate net profit and profit margin
    const net_profit = total_revenue - total_expenses;
    const profit_margin = total_revenue > 0 ? (net_profit / total_revenue) * 100 : 0;

    function getSupabaseClient() { return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('branch_revenue')
      .upsert(
        {
          branch_id,
          period_date,
          period_type,
          total_revenue,
          service_revenue,
          product_revenue,
          total_transactions,
          service_transactions,
          product_transactions,
          total_customers,
          new_customers,
          returning_customers,
          cash_revenue,
          card_revenue,
          transfer_revenue,
          other_revenue,
          total_expenses,
          staff_expenses,
          inventory_expenses,
          net_profit,
          profit_margin,
        },
        {
          onConflict: 'branch_id,period_date,period_type',
        }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error recording branch revenue:', error);
    return NextResponse.json(
      { error: 'Failed to record branch revenue' },
      { status: 500 }
    );
  }
});

