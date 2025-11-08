import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Get report template by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching report template:', error);
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/reports/templates/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update report template
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
    if (body.parameters !== undefined) updateData.parameters = body.parameters;
    if (body.metrics !== undefined) updateData.metrics = body.metrics;
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions;
    if (body.filters !== undefined) updateData.filters = body.filters;
    if (body.chart_type !== undefined) updateData.chart_type = body.chart_type;
    if (body.chart_config !== undefined) updateData.chart_config = body.chart_config;
    if (body.is_scheduled !== undefined) updateData.is_scheduled = body.is_scheduled;
    if (body.schedule_frequency !== undefined) updateData.schedule_frequency = body.schedule_frequency;
    if (body.schedule_time !== undefined) updateData.schedule_time = body.schedule_time;
    if (body.schedule_day_of_week !== undefined) updateData.schedule_day_of_week = body.schedule_day_of_week;
    if (body.schedule_day_of_month !== undefined) updateData.schedule_day_of_month = body.schedule_day_of_month;
    if (body.auto_email !== undefined) updateData.auto_email = body.auto_email;
    if (body.email_recipients !== undefined) updateData.email_recipients = body.email_recipients;
    if (body.email_subject !== undefined) updateData.email_subject = body.email_subject;
    if (body.email_message !== undefined) updateData.email_message = body.email_message;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data, error } = await supabase
      .from('report_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating report template:', error);
      return NextResponse.json(
        { error: 'Failed to update report template' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/reports/templates/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete report template
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await supabase
      .from('report_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting report template:', error);
      return NextResponse.json(
        { error: 'Failed to delete report template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/reports/templates/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
