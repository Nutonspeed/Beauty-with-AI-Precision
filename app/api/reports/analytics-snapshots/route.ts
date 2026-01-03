import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET: List analytics snapshots for trend analysis
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinicId = searchParams.get('clinic_id');
    const snapshotType = searchParams.get('snapshot_type'); // daily, weekly, monthly
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Missing required parameter: clinic_id' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('analytics_snapshots')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('snapshot_date', { ascending: false });

    if (snapshotType) {
      query = query.eq('snapshot_type', snapshotType);
    }

    if (startDate) {
      query = query.gte('snapshot_date', startDate);
    }

    if (endDate) {
      query = query.lte('snapshot_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching analytics snapshots:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics snapshots' },
        { status: 500 }
      );
    }

    return NextResponse.json({ snapshots: data });
  } catch (error) {
    console.error('Error in GET /api/reports/analytics-snapshots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create analytics snapshot (usually called by scheduled job)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      snapshot_date,
      snapshot_type,
    } = body;

    if (!clinic_id || !snapshot_date || !snapshot_type) {
      return NextResponse.json(
        { error: 'Missing required fields: clinic_id, snapshot_date, snapshot_type' },
        { status: 400 }
      );
    }

    // Calculate metrics for the snapshot
    const startOfDay = new Date(snapshot_date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(snapshot_date);
    endOfDay.setHours(23, 59, 59, 999);

    // Revenue metrics
    const supabaseClient = getSupabaseClient();

    const { data: revenue } = await supabaseClient
      .from('bookings')
      .select('total_amount')
      .eq('clinic_id', clinic_id)
      .eq('payment_status', 'paid')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    const totalRevenue = revenue?.reduce((sum, b) => sum + Number.parseFloat(b.total_amount), 0) || 0;
    const totalTransactions = revenue?.length || 0;
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Customer metrics (beauty clinic customers, NOT patients)
    const { data: customers } = await supabaseClient
      .from('bookings')
      .select('user_id')
      .eq('clinic_id', clinic_id)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    const uniqueCustomers = new Set(customers?.map(c => c.user_id)).size;

    // Appointment metrics
    const { data: appointments } = await supabaseClient
      .from('appointment_slots')
      .select('status')
      .eq('clinic_id', clinic_id)
      .eq('appointment_date', snapshot_date);

    const totalAppointments = appointments?.length || 0;
    const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
    const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
    const noShowAppointments = appointments?.filter(a => a.status === 'no_show').length || 0;
    const appointmentCompletionRate = totalAppointments > 0 
      ? (completedAppointments / totalAppointments) * 100 
      : 0;

    // Create or update snapshot
    const { data: snapshot, error: snapshotError } = await supabaseClient
      .from('analytics_snapshots')
      .upsert({
        clinic_id,
        snapshot_date,
        snapshot_type,
        total_revenue: totalRevenue,
        total_transactions: totalTransactions,
        avg_transaction_value: avgTransactionValue,
        total_customers: uniqueCustomers,
        total_appointments: totalAppointments,
        completed_appointments: completedAppointments,
        cancelled_appointments: cancelledAppointments,
        no_show_appointments: noShowAppointments,
        appointment_completion_rate: appointmentCompletionRate,
      }, {
        onConflict: 'clinic_id,snapshot_date,snapshot_type',
      })
      .select()
      .single();

    if (snapshotError) {
      console.error('Error creating analytics snapshot:', snapshotError);
      return NextResponse.json(
        { error: 'Failed to create analytics snapshot' },
        { status: 500 }
      );
    }

    return NextResponse.json(snapshot, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reports/analytics-snapshots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

