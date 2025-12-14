import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await cookies();
    const supabase = await createClient();

    // Verify super admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const clinicId = searchParams.get('clinicId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        clinic_id,
        avatar_url,
        phone,
        is_active,
        last_seen_at,
        created_at,
        updated_at,
        clinics(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }
    if (clinicId && clinicId !== 'all') {
      query = query.eq('clinic_id', clinicId);
    }
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) throw error;

    // Calculate stats
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('role, is_active, last_seen_at');

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total: allProfiles?.length || 0,
      active: allProfiles?.filter(p => p.is_active).length || 0,
      inactive: allProfiles?.filter(p => !p.is_active).length || 0,
      recentlyActive: allProfiles?.filter(p => p.last_seen_at && new Date(p.last_seen_at) >= oneWeekAgo).length || 0,
      byRole: {
        super_admin: allProfiles?.filter(p => p.role === 'super_admin').length || 0,
        clinic_owner: allProfiles?.filter(p => p.role === 'clinic_owner').length || 0,
        clinic_admin: allProfiles?.filter(p => p.role === 'clinic_admin').length || 0,
        staff: allProfiles?.filter(p => p.role === 'staff').length || 0,
        beautician: allProfiles?.filter(p => p.role === 'beautician').length || 0,
        customer: allProfiles?.filter(p => p.role === 'customer').length || 0,
      },
    };

    // Get clinics for filter
    const { data: clinics } = await supabase
      .from('clinics')
      .select('id, name')
      .order('name');

    return NextResponse.json({
      users: users || [],
      stats,
      clinics: clinics || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PATCH: Update user status/role
export async function PATCH(request: NextRequest) {
  try {
    await cookies();
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, value } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
    }

    let updateData: Record<string, any> = {};

    switch (action) {
      case 'toggle_active':
        updateData.is_active = value;
        break;
      case 'change_role':
        updateData.role = value;
        break;
      case 'change_clinic':
        updateData.clinic_id = value || null;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
