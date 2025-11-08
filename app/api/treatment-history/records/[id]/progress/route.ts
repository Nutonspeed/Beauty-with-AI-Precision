import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/treatment-history/records/[id]/progress
 * Get treatment progress calculation for beauty clinic customer
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data, error } = await supabase.rpc('calculate_treatment_progress', {
      p_treatment_record_id: params.id,
    });

    if (error) throw error;

    return NextResponse.json(data || {});
  } catch (error) {
    console.error('Error calculating treatment progress:', error);
    return NextResponse.json(
      { error: 'Failed to calculate treatment progress' },
      { status: 500 }
    );
  }
}
