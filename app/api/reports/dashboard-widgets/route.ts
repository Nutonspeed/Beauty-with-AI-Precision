import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List dashboard widgets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinicId = searchParams.get('clinic_id');
    const isActive = searchParams.get('is_active');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Missing required parameter: clinic_id' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('position_y', { ascending: true })
      .order('position_x', { ascending: true });

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching dashboard widgets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard widgets' },
        { status: 500 }
      );
    }

    return NextResponse.json({ widgets: data });
  } catch (error) {
    console.error('Error in GET /api/reports/dashboard-widgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new dashboard widget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      name,
      description,
      widget_type,
      data_source,
      data_query,
      metric_type,
      aggregation,
      time_period,
      comparison_enabled,
      chart_type,
      chart_config,
      color_scheme,
      position_x,
      position_y,
      width,
      height,
      auto_refresh,
      refresh_interval_seconds,
      visibility,
      allowed_roles,
      created_by_user_id,
    } = body;

    // Validate required fields
    if (!clinic_id || !name || !widget_type || !data_source) {
      return NextResponse.json(
        { error: 'Missing required fields: clinic_id, name, widget_type, data_source' },
        { status: 400 }
      );
    }

    // Create widget
    const { data, error } = await supabase
      .from('dashboard_widgets')
      .insert({
        clinic_id,
        name,
        description,
        widget_type,
        data_source,
        data_query: data_query || {},
        metric_type,
        aggregation,
        time_period: time_period || 'today',
        comparison_enabled: comparison_enabled || false,
        chart_type,
        chart_config: chart_config || {},
        color_scheme: color_scheme || 'primary',
        position_x: position_x || 0,
        position_y: position_y || 0,
        width: width || 1,
        height: height || 1,
        auto_refresh: auto_refresh === undefined ? true : auto_refresh,
        refresh_interval_seconds: refresh_interval_seconds || 300,
        visibility: visibility || 'all',
        allowed_roles: allowed_roles || ['admin', 'manager', 'staff'],
        created_by_user_id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dashboard widget:', error);
      return NextResponse.json(
        { error: 'Failed to create dashboard widget' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reports/dashboard-widgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
