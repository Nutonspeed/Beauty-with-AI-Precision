import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/treatment-history/timeline
 * Get chronological treatment timeline for beauty clinic customer
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - customer_id (required): Customer ID
 * - limit (optional): Limit results (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const customer_id = searchParams.get('customer_id');
    const limit = searchParams.get('limit');

    if (!clinic_id || !customer_id) {
      return NextResponse.json(
        { error: 'clinic_id and customer_id are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient.rpc('get_customer_treatment_timeline', {
      p_clinic_id: clinic_id,
      p_customer_id: customer_id,
      p_limit: limit ? Number.parseInt(limit) : 50,
    });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching treatment timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatment timeline' },
      { status: 500 }
    );
  }
}

