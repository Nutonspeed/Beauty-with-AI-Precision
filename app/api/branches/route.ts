import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/branches
 * List branches for a clinic
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - is_active (optional): Filter by active status
 * - province (optional): Filter by province
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const is_active = searchParams.get('is_active');
    const province = searchParams.get('province');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('branches')
      .select(`
        *,
        branch_manager:users!branches_branch_manager_id_fkey(id, email, full_name)
      `)
      .eq('clinic_id', clinic_id);

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    if (province) {
      query = query.eq('province', province);
    }

    const { data, error } = await query.order('is_main_branch', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/branches
 * Create a new branch
 * 
 * Body:
 * - clinic_id (required): Clinic ID
 * - branch_code (required): Unique branch code
 * - branch_name (required): Branch name
 * - address (required): Branch address
 * - city (required): City
 * - province (required): Province
 * - phone (optional): Phone number
 * - email (optional): Email
 * - is_main_branch (optional): Is main branch
 * - business_hours (optional): Operating hours
 * - facilities (optional): Available facilities
 * - branch_manager_id (optional): Manager user ID
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      branch_code,
      branch_name,
      branch_name_en,
      address,
      district,
      city,
      province,
      postal_code,
      country = 'Thailand',
      phone,
      email,
      line_id,
      latitude,
      longitude,
      business_hours,
      is_main_branch = false,
      is_active = true,
      accepts_appointments = true,
      accepts_walk_ins = true,
      max_daily_customers,
      max_concurrent_appointments,
      branch_manager_id,
      facilities,
      available_services,
      manages_own_inventory = true,
      separate_accounting = false,
      description,
      opening_date,
    } = body;

    if (!clinic_id || !branch_code || !branch_name || !address || !city || !province) {
      return NextResponse.json(
        { error: 'clinic_id, branch_code, branch_name, address, city, and province are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('branches')
      .insert({
        clinic_id,
        branch_code,
        branch_name,
        branch_name_en,
        address,
        district,
        city,
        province,
        postal_code,
        country,
        phone,
        email,
        line_id,
        latitude,
        longitude,
        business_hours,
        is_main_branch,
        is_active,
        accepts_appointments,
        accepts_walk_ins,
        max_daily_customers,
        max_concurrent_appointments,
        branch_manager_id,
        facilities,
        available_services,
        manages_own_inventory,
        separate_accounting,
        description,
        opening_date,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json(
      { error: 'Failed to create branch' },
      { status: 500 }
    );
  }
}
