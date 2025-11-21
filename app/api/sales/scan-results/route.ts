import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/sales/scan-results - Create new scan result
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      lead_id,
      photo_front,
      photo_left,
      photo_right,
      skin_age,
      actual_age,
      concerns,
      recommendations,
      confidence_score,
      analysis_model,
      analysis_duration_ms,
      face_detected,
      face_landmarks,
      face_mesh_data,
      heatmap_data,
      problem_areas,
      notes
    } = body;

    // Validate required fields
    if (!customer_name || !customer_phone || !photo_front) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_name, customer_phone, photo_front' },
        { status: 400 }
      );
    }

    // Insert scan result
    const { data: scanResult, error: insertError } = await supabase
      .from('skin_scan_results')
      .insert({
        customer_name,
        customer_phone,
        customer_email,
        lead_id,
        sales_user_id: user.id,
        photo_front,
        photo_left,
        photo_right,
        skin_age,
        actual_age,
        concerns: concerns || [],
        recommendations: recommendations || [],
        confidence_score,
        analysis_model,
        analysis_duration_ms,
        face_detected,
        face_landmarks,
        face_mesh_data,
        heatmap_data,
        problem_areas: problem_areas || [],
        notes
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating scan result:', insertError);
      return NextResponse.json(
        { error: 'Failed to create scan result', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: scanResult }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/sales/scan-results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/sales/scan-results - List scan results
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const customer_phone = searchParams.get('customer_phone');
    const lead_id = searchParams.get('lead_id');

    // Build query
    let query = supabase
      .from('skin_scan_results')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (customer_phone) {
      query = query.eq('customer_phone', customer_phone);
    }
    if (lead_id) {
      query = query.eq('lead_id', lead_id);
    }

    const { data: scanResults, error: queryError, count } = await query;

    if (queryError) {
      console.error('Error fetching scan results:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch scan results', details: queryError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scanResults,
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit
      }
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/sales/scan-results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
