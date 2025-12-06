import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/branches/staff
 * List staff assignments for branches
 * 
 * Query parameters:
 * - branch_id (optional): Filter by branch
 * - user_id (optional): Filter by user
 * - is_active (optional): Filter by active status
 */
export const GET = withClinicAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const branch_id = searchParams.get('branch_id');
    const user_id = searchParams.get('user_id');
    const is_active = searchParams.get('is_active');

    let query = supabase
      .from('branch_staff_assignments')
      .select(`
        *,
        branch:branches(id, branch_code, branch_name, city, province),
        user:users(id, email, full_name, avatar_url)
      `);

    if (branch_id) {
      query = query.eq('branch_id', branch_id);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query.order('assignment_start_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching staff assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff assignments' },
      { status: 500 }
    );
  }
})

/**
 * POST /api/branches/staff
 * Assign staff to a branch
 * 
 * Body:
 * - branch_id (required): Branch ID
 * - user_id (required): User ID
 * - role (required): Role at branch
 * - is_primary_branch (optional): Is primary branch
 * - working_days (optional): Array of working days
 * - working_hours (optional): Working hours object
 * - assignment_start_date (required): Start date
 */
export const POST = withClinicAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      branch_id,
      user_id,
      role,
      is_primary_branch = true,
      working_days,
      working_hours,
      assignment_start_date,
      permissions,
    } = body;

    if (!branch_id || !user_id || !role || !assignment_start_date) {
      return NextResponse.json(
        { error: 'branch_id, user_id, role, and assignment_start_date are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('branch_staff_assignments')
      .insert({
        branch_id,
        user_id,
        role,
        is_primary_branch,
        working_days,
        working_hours,
        assignment_start_date,
        permissions,
        is_active: true,
      })
      .select(`
        *,
        branch:branches(id, branch_code, branch_name),
        user:users(id, email, full_name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error assigning staff:', error);
    return NextResponse.json(
      { error: 'Failed to assign staff' },
      { status: 500 }
    );
  }
})
