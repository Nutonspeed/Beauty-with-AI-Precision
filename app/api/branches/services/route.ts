import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/branches/services
 * List branch services
 * 
 * Query parameters:
 * - branch_id (optional): Filter by branch
 * - service_id (optional): Filter by service
 * - is_available (optional): Filter by availability
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get('branch_id');
    const service_id = searchParams.get('service_id');
    const is_available = searchParams.get('is_available');

    let query = supabase
      .from('branch_services')
      .select(`
        *,
        branch:branches(id, branch_code, branch_name, city),
        service:services(id, service_code, service_name, service_name_en, category_id, base_price, duration_minutes)
      `);

    if (branch_id) {
      query = query.eq('branch_id', branch_id);
    }

    if (service_id) {
      query = query.eq('service_id', service_id);
    }

    if (is_available !== null) {
      query = query.eq('is_available', is_available === 'true');
    }

    const { data, error } = await query.order('booking_count', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching branch services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch services' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/branches/services
 * Add service to a branch
 * 
 * Body:
 * - branch_id (required): Branch ID
 * - service_id (required): Service ID
 * - branch_price (optional): Branch-specific price (overrides clinic price)
 * - use_clinic_price (optional): Use clinic base price
 * - daily_capacity (optional): Daily capacity
 * - available_days (optional): Array of available days
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      branch_id,
      service_id,
      branch_price,
      use_clinic_price = true,
      daily_capacity,
      slots_per_day,
      requires_specialist = false,
      required_equipment,
      available_days,
      available_time_slots,
      available_from_date,
      available_until_date,
    } = body;

    if (!branch_id || !service_id) {
      return NextResponse.json(
        { error: 'branch_id and service_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('branch_services')
      .insert({
        branch_id,
        service_id,
        branch_price,
        use_clinic_price,
        daily_capacity,
        slots_per_day,
        requires_specialist,
        required_equipment,
        available_days,
        available_time_slots,
        available_from_date,
        available_until_date,
        is_available: true,
      })
      .select(`
        *,
        branch:branches(id, branch_code, branch_name),
        service:services(id, service_code, service_name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error adding branch service:', error);
    return NextResponse.json(
      { error: 'Failed to add branch service' },
      { status: 500 }
    );
  }
}
