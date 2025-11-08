import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: Create export job for a report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      report_id,
      export_format,
      requested_by_user_id,
    } = body;

    if (!clinic_id || !report_id || !export_format) {
      return NextResponse.json(
        { error: 'Missing required fields: clinic_id, report_id, export_format' },
        { status: 400 }
      );
    }

    // Validate export format
    const validFormats = ['pdf', 'excel', 'csv', 'json'];
    if (!validFormats.includes(export_format)) {
      return NextResponse.json(
        { error: `Invalid export format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch report data
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('id', report_id)
      .single();

    if (reportError) {
      console.error('Error fetching report:', reportError);
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Create export job
    const fileName = `${report.report_name.replaceAll(/\s+/g, '_')}_${Date.now()}.${export_format}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expire after 30 days

    const { data: exportJob, error: exportError } = await supabase
      .from('export_jobs')
      .insert({
        clinic_id,
        report_id,
        export_format,
        file_name: fileName,
        status: 'pending',
        requested_by_user_id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (exportError) {
      console.error('Error creating export job:', exportError);
      return NextResponse.json(
        { error: 'Failed to create export job' },
        { status: 500 }
      );
    }

    // In a real implementation, you would trigger an async job here to generate the file
    // For now, we'll immediately update status to processing
    await supabase
      .from('export_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        progress_percentage: 0,
      })
      .eq('id', exportJob.id);

    // Simulate export generation (in production, this would be async)
    const exportData = generateExportData(report, export_format);
    
    // Update job as completed
    const completedAt = new Date().toISOString();
    const processingTime = Date.now() - new Date(exportJob.created_at).getTime();

    await supabase
      .from('export_jobs')
      .update({
        status: 'completed',
        completed_at: completedAt,
        processing_time_ms: processingTime,
        progress_percentage: 100,
        file_size_bytes: JSON.stringify(exportData).length,
        // In production, you would upload to storage and set file_path and file_url
        file_path: `/exports/${fileName}`,
        file_url: `/api/reports/export-jobs/${exportJob.id}/download`,
      })
      .eq('id', exportJob.id);

    return NextResponse.json({
      export_job: {
        ...exportJob,
        status: 'completed',
        file_url: `/api/reports/export-jobs/${exportJob.id}/download`,
      },
      message: 'Export job created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating export job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate export data
function generateExportData(report: any, format: string): any {
  switch (format) {
    case 'json':
      return report;
    
    case 'csv':
      // In production, convert data to CSV format
      return {
        headers: Object.keys(report.summary_data || {}),
        rows: [Object.values(report.summary_data || {})],
      };
    
    case 'excel':
    case 'pdf':
      // In production, use libraries like ExcelJS or PDFKit
      return {
        format,
        data: report,
        message: 'Export generation would happen here in production',
      };
    
    default:
      return report;
  }
}

// GET: List export jobs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinicId = searchParams.get('clinic_id');
    const reportId = searchParams.get('report_id');
    const status = searchParams.get('status');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Missing required parameter: clinic_id' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('export_jobs')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (reportId) {
      query = query.eq('report_id', reportId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching export jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch export jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ export_jobs: data });
  } catch (error) {
    console.error('Error in GET /api/reports/export-jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
