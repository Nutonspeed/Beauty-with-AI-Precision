import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withCenterAuth } from '@/lib/auth/middleware';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/program-history/photos
 * List program photos for beauty center customers
 * 
 * Query parameters:
 * - center_id (required): Center ID
 * - customer_id (optional): Filter by customer
 * - program_record_id (optional): Filter by program record
 * - photo_type (optional): Filter by type (before, after, during, progress)
 * - comparison_group_id (optional): Filter by comparison group
 */
export const GET = withCenterAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const center_id = searchParams.get('center_id');
    const customer_id = searchParams.get('customer_id');
    const program_record_id = searchParams.get('program_record_id');
    const photo_type = searchParams.get('photo_type');
    const comparison_group_id = searchParams.get('comparison_group_id');

    if (!center_id) {
      return NextResponse.json(
        { error: 'center_id is required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('program_photos')
      .select(`
        *,
        customer:users!program_photos_customer_id_fkey(id, full_name),
        program_record:program_records(id, program_name, program_date),
        uploaded_by:users!program_photos_uploaded_by_user_id_fkey(id, full_name)
      `)
      .eq('center_id', center_id)
      .eq('is_deleted', false);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (program_record_id) {
      query = query.eq('program_record_id', program_record_id);
    }

    if (photo_type) {
      query = query.eq('photo_type', photo_type);
    }

    if (comparison_group_id) {
      query = query.eq('comparison_group_id', comparison_group_id);
    }

    const { data, error } = await query.order('photo_taken_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching program photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program photos' },
      { status: 500 }
    );
  }
})

/**
 * POST /api/program-history/photos
 * Upload a new program photo for beauty center customer
 */
export const POST = withCenterAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      center_id,
      customer_id,
      program_record_id,
      photo_type,
      photo_url,
      thumbnail_url,
      photo_taken_at,
      body_area,
      specific_area,
      view_angle,
      lighting_condition,
      days_after_program,
      session_number,
      photo_tags,
      ai_analysis,
      consent_for_marketing,
      consent_for_case_study,
      is_public,
      watermark_applied,
      comparison_group_id,
      display_order,
      file_size_kb,
      image_width,
      image_height,
      uploaded_by_user_id,
      notes,
    } = body;

    if (!center_id || !customer_id || !photo_type || !photo_url || !photo_taken_at) {
      return NextResponse.json(
        { error: 'center_id, customer_id, photo_type, photo_url, and photo_taken_at are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('program_photos')
      .insert({
        center_id,
        customer_id,
        program_record_id,
        photo_type,
        photo_url,
        thumbnail_url,
        photo_taken_at,
        body_area,
        specific_area,
        view_angle,
        lighting_condition,
        days_after_program,
        session_number,
        photo_tags,
        ai_analysis,
        consent_for_marketing: consent_for_marketing ?? false,
        consent_for_case_study: consent_for_case_study ?? false,
        is_public: is_public ?? false,
        watermark_applied: watermark_applied ?? false,
        comparison_group_id,
        display_order: display_order ?? 0,
        file_size_kb,
        image_width,
        image_height,
        uploaded_by_user_id,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating program photo:', error);
    return NextResponse.json(
      { error: 'Failed to create program photo' },
      { status: 500 }
    );
  }
});

