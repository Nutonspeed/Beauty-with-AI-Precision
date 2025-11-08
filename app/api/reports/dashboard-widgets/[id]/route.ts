import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Get dashboard widget by ID with live data
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data: widget, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dashboard widget:', error);
      return NextResponse.json(
        { error: 'Dashboard widget not found' },
        { status: 404 }
      );
    }

    // Fetch live data based on widget configuration
    let liveData: any = null;

    if (widget.data_source === 'revenue') {
      const { data: revenue } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('clinic_id', widget.clinic_id)
        .eq('payment_status', 'paid')
        .gte('created_at', getTimePeriodStart(widget.time_period));

      const total = revenue?.reduce((sum, b) => sum + Number.parseFloat(b.total_amount), 0) || 0;
      liveData = { value: total, unit: 'THB' };
    }

    // Update last_refreshed_at
    await supabase
      .from('dashboard_widgets')
      .update({ last_refreshed_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({
      ...widget,
      live_data: liveData,
      refreshed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in GET /api/reports/dashboard-widgets/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update dashboard widget
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updateData: any = {};
    
    // Only update provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.position_x !== undefined) updateData.position_x = body.position_x;
    if (body.position_y !== undefined) updateData.position_y = body.position_y;
    if (body.width !== undefined) updateData.width = body.width;
    if (body.height !== undefined) updateData.height = body.height;
    if (body.time_period !== undefined) updateData.time_period = body.time_period;
    if (body.chart_config !== undefined) updateData.chart_config = body.chart_config;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dashboard widget:', error);
      return NextResponse.json(
        { error: 'Failed to update dashboard widget' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/reports/dashboard-widgets/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete dashboard widget
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dashboard widget:', error);
      return NextResponse.json(
        { error: 'Failed to delete dashboard widget' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/reports/dashboard-widgets/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get start date based on time period
function getTimePeriodStart(period: string): string {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return new Date(now.setHours(0, 0, 0, 0)).toISOString();
    case 'week': {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      return weekStart.toISOString();
    }
    case 'month': {
      const monthStart = new Date(now);
      monthStart.setMonth(now.getMonth() - 1);
      return monthStart.toISOString();
    }
    case 'quarter': {
      const quarterStart = new Date(now);
      quarterStart.setMonth(now.getMonth() - 3);
      return quarterStart.toISOString();
    }
    case 'year': {
      const yearStart = new Date(now);
      yearStart.setFullYear(now.getFullYear() - 1);
      return yearStart.toISOString();
    }
    default:
      return new Date(now.setHours(0, 0, 0, 0)).toISOString();
  }
}
