import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/program-history/timeline
 * Get chronological program timeline for beauty center customer
 * 
 * Query parameters:
 * - center_id (required): Center ID
 * - customer_id (required): Customer ID
 * - limit (optional): Limit results (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const center_id = searchParams.get('center_id');
    const customer_id = searchParams.get('customer_id');
    const limit = searchParams.get('limit');

    if (!center_id || !customer_id) {
      return NextResponse.json(
        { error: 'center_id and customer_id are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient.rpc('get_customer_program_timeline', {
      p_center_id: center_id,
      p_customer_id: customer_id,
      p_limit: limit ? Number.parseInt(limit) : 50,
    });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching program timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program timeline' },
      { status: 500 }
    );
  }
}

