import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: Generate report from template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      template_id,
      period_start,
      period_end,
      parameters,
      filters,
      generated_by_user_id,
    } = body;

    if (!clinic_id || !period_start || !period_end) {
      return NextResponse.json(
        { error: 'Missing required fields: clinic_id, period_start, period_end' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Fetch template if template_id provided
    let template = null;
    if (template_id) {
      const { data: templateData, error: templateError } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', template_id)
        .single();

      if (templateError) {
        console.error('Error fetching template:', templateError);
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      template = templateData;
    }

    // Generate report data based on template type or provided parameters
    const reportType = template?.report_type || parameters?.report_type || 'revenue';
    
    let summaryData: any = {};
    let detailedData: any = {};

    // Generate different reports based on type
    switch (reportType) {
      case 'revenue': {
        const { data: revenueMetrics } = await supabase
          .rpc('calculate_revenue_metrics', {
            p_clinic_id: clinic_id,
            p_start_date: period_start,
            p_end_date: period_end,
          });
        summaryData = revenueMetrics || {};
        break;
      }

      case 'customer_analytics': {
        const { data: customerMetrics } = await supabase
          .rpc('calculate_customer_analytics', {
            p_clinic_id: clinic_id,
            p_start_date: period_start,
            p_end_date: period_end,
          });
        summaryData = customerMetrics || {};
        break;
      }

      case 'staff_performance': {
        const { data: staffMetrics } = await supabase
          .rpc('calculate_staff_performance', {
            p_clinic_id: clinic_id,
            p_start_date: period_start,
            p_end_date: period_end,
          });
        summaryData = staffMetrics || {};
        break;
      }

      default:
        summaryData = { message: 'Report type not implemented yet' };
    }

    const generationTime = Date.now() - startTime;

    // Save generated report
    const { data: generatedReport, error: saveError } = await supabase
      .from('generated_reports')
      .insert({
        clinic_id,
        template_id,
        report_name: template?.name || `${reportType} Report`,
        report_type: reportType,
        report_category: template?.report_category || 'general',
        generated_by_user_id,
        generation_type: 'manual',
        period_start,
        period_end,
        parameters: parameters || template?.parameters || {},
        filters: filters || template?.filters || {},
        summary_data: summaryData,
        detailed_data: detailedData,
        chart_data: {},
        generation_time_ms: generationTime,
        status: 'completed',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving generated report:', saveError);
      return NextResponse.json(
        { error: 'Failed to save generated report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      report: generatedReport,
      message: 'Report generated successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
