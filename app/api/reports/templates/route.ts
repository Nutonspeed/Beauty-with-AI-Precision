import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List report templates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinicId = searchParams.get('clinic_id');
    const reportType = searchParams.get('report_type');
    const category = searchParams.get('category');
    const isActive = searchParams.get('is_active');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Missing required parameter: clinic_id' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('report_templates')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (reportType) {
      query = query.eq('report_type', reportType);
    }

    if (category) {
      query = query.eq('report_category', category);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching report templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch report templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({ templates: data });
  } catch (error) {
    console.error('Error in GET /api/reports/templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new report template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      name,
      description,
      report_type,
      report_category,
      parameters,
      metrics,
      dimensions,
      filters,
      chart_type,
      chart_config,
      is_scheduled,
      schedule_frequency,
      schedule_time,
      schedule_day_of_week,
      schedule_day_of_month,
      auto_email,
      email_recipients,
      email_subject,
      email_message,
      allowed_roles,
      created_by_user_id,
    } = body;

    // Validate required fields
    if (!clinic_id || !name || !report_type) {
      return NextResponse.json(
        { error: 'Missing required fields: clinic_id, name, report_type' },
        { status: 400 }
      );
    }

    // Create template
    const { data, error } = await supabase
      .from('report_templates')
      .insert({
        clinic_id,
        name,
        description,
        report_type,
        report_category,
        parameters: parameters || {},
        metrics: metrics || [],
        dimensions: dimensions || [],
        filters: filters || {},
        chart_type,
        chart_config: chart_config || {},
        is_scheduled: is_scheduled || false,
        schedule_frequency,
        schedule_time,
        schedule_day_of_week,
        schedule_day_of_month,
        auto_email: auto_email || false,
        email_recipients: email_recipients || [],
        email_subject,
        email_message,
        allowed_roles: allowed_roles || ['admin', 'manager'],
        created_by_user_id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating report template:', error);
      return NextResponse.json(
        { error: 'Failed to create report template' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reports/templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
