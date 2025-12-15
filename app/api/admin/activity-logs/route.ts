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

    const { data: appUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (appUser?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const clinicId = searchParams.get('clinicId');
    const userId = searchParams.get('userId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build activity logs from multiple sources
    const activities: any[] = [];

    // 1. Get skin analyses as activities
    let analysesQuery = supabase
      .from('skin_analyses')
      .select(`
        id,
        created_at,
        overall_score,
        clinic_id,
        user_id,
        clinics(name),
        user:users!skin_analyses_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (clinicId) analysesQuery = analysesQuery.eq('clinic_id', clinicId);
    if (dateFrom) analysesQuery = analysesQuery.gte('created_at', dateFrom);
    if (dateTo) analysesQuery = analysesQuery.lte('created_at', dateTo);

    const { data: analyses } = await analysesQuery;

    analyses?.forEach((a: any) => {
      activities.push({
        id: `analysis-${a.id}`,
        type: 'ai_analysis',
        action: 'skin_analysis_completed',
        description: `AI Skin Analysis completed (Score: ${a.overall_score || 'N/A'})`,
        userId: a.user_id,
        userName: a.user?.full_name || 'Unknown',
        userEmail: a.user?.email,
        clinicId: a.clinic_id,
        clinicName: a.clinics?.name || 'Unknown',
        metadata: { overallScore: a.overall_score },
        createdAt: a.created_at,
      });
    });

    // 2. Get bookings as activities
    let bookingsQuery = supabase
      .from('bookings')
      .select(`
        id,
        created_at,
        status,
        clinic_id,
        customer_id,
        clinics(name),
        customers(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (clinicId) bookingsQuery = bookingsQuery.eq('clinic_id', clinicId);
    if (dateFrom) bookingsQuery = bookingsQuery.gte('created_at', dateFrom);
    if (dateTo) bookingsQuery = bookingsQuery.lte('created_at', dateTo);

    const { data: bookings } = await bookingsQuery;

    bookings?.forEach((b: any) => {
      activities.push({
        id: `booking-${b.id}`,
        type: 'booking',
        action: 'booking_created',
        description: `Booking ${b.status || 'created'}`,
        userId: b.customer_id,
        userName: b.customers?.name || 'Customer',
        userEmail: b.customers?.email,
        clinicId: b.clinic_id,
        clinicName: b.clinics?.name || 'Unknown',
        metadata: { status: b.status },
        createdAt: b.created_at,
      });
    });

    // 3. Get user registrations
    let usersQuery = supabase
      .from('profiles')
      .select(`
        id,
        created_at,
        full_name,
        email,
        role,
        clinic_id,
        clinics(name)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (clinicId) usersQuery = usersQuery.eq('clinic_id', clinicId);
    if (dateFrom) usersQuery = usersQuery.gte('created_at', dateFrom);
    if (dateTo) usersQuery = usersQuery.lte('created_at', dateTo);

    const { data: users } = await usersQuery;

    users?.forEach((u: any) => {
      activities.push({
        id: `user-${u.id}`,
        type: 'user',
        action: 'user_registered',
        description: `New ${u.role || 'user'} registered`,
        userId: u.id,
        userName: u.full_name || 'Unknown',
        userEmail: u.email,
        clinicId: u.clinic_id,
        clinicName: u.clinics?.name || 'System',
        metadata: { role: u.role },
        createdAt: u.created_at,
      });
    });

    // 4. Get clinic creations
    let clinicsQuery = supabase
      .from('clinics')
      .select('id, name, created_at, email')
      .order('created_at', { ascending: false })
      .limit(20);

    if (dateFrom) clinicsQuery = clinicsQuery.gte('created_at', dateFrom);
    if (dateTo) clinicsQuery = clinicsQuery.lte('created_at', dateTo);

    const { data: clinics } = await clinicsQuery;

    clinics?.forEach((c: any) => {
      activities.push({
        id: `clinic-${c.id}`,
        type: 'clinic',
        action: 'clinic_created',
        description: `Clinic "${c.name}" created`,
        userId: null,
        userName: 'System',
        userEmail: c.email,
        clinicId: c.id,
        clinicName: c.name,
        metadata: {},
        createdAt: c.created_at,
      });
    });

    // Sort all activities by date
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Filter by action type if specified
    let filteredActivities = activities;
    if (action && action !== 'all') {
      filteredActivities = activities.filter(a => a.action === action || a.type === action);
    }

    // Paginate
    const paginatedActivities = filteredActivities.slice(offset, offset + limit);

    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      totalActivities: filteredActivities.length,
      todayActivities: activities.filter(a => new Date(a.createdAt) >= today).length,
      weekActivities: activities.filter(a => new Date(a.createdAt) >= thisWeek).length,
      byType: {
        ai_analysis: activities.filter(a => a.type === 'ai_analysis').length,
        booking: activities.filter(a => a.type === 'booking').length,
        user: activities.filter(a => a.type === 'user').length,
        clinic: activities.filter(a => a.type === 'clinic').length,
      },
    };

    // Get unique clinics for filter
    const { data: allClinics } = await supabase
      .from('clinics')
      .select('id, name')
      .order('name');

    return NextResponse.json({
      activities: paginatedActivities,
      stats,
      clinics: allClinics || [],
      pagination: {
        total: filteredActivities.length,
        limit,
        offset,
        hasMore: offset + limit < filteredActivities.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Activity logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}
