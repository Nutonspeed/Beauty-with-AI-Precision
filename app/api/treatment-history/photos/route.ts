import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/treatment-history/photos
 * List treatment photos for beauty clinic customers
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - customer_id (optional): Filter by customer
 * - treatment_record_id (optional): Filter by treatment record
 * - photo_type (optional): Filter by type (before, after, during, progress)
 * - comparison_group_id (optional): Filter by comparison group
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const customer_id = searchParams.get('customer_id');
    const treatment_record_id = searchParams.get('treatment_record_id');
    const photo_type = searchParams.get('photo_type');
    const comparison_group_id = searchParams.get('comparison_group_id');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('treatment_photos')
      .select(`
        *,
        customer:users!treatment_photos_customer_id_fkey(id, full_name),
        treatment_record:treatment_records(id, treatment_name, treatment_date),
        uploaded_by:users!treatment_photos_uploaded_by_user_id_fkey(id, full_name)
      `)
      .eq('clinic_id', clinic_id)
      .eq('is_deleted', false);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (treatment_record_id) {
      query = query.eq('treatment_record_id', treatment_record_id);
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
    console.error('Error fetching treatment photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment photos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/treatment-history/photos
 * Upload a new treatment photo for beauty clinic customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      customer_id,
      treatment_record_id,
      photo_type,
      photo_url,
      thumbnail_url,
      photo_taken_at,
      body_area,
      specific_area,
      view_angle,
      lighting_condition,
      days_after_treatment,
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

    if (!clinic_id || !customer_id || !photo_type || !photo_url || !photo_taken_at) {
      return NextResponse.json(
        { error: 'clinic_id, customer_id, photo_type, photo_url, and photo_taken_at are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('treatment_photos')
      .insert({
        clinic_id,
        customer_id,
        treatment_record_id,
        photo_type,
        photo_url,
        thumbnail_url,
        photo_taken_at,
        body_area,
        specific_area,
        view_angle,
        lighting_condition,
        days_after_treatment,
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
    console.error('Error creating treatment photo:', error);
    return NextResponse.json(
      { error: 'Failed to create treatment photo' },
      { status: 500 }
    );
  }
}
