import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await cookies();
    const supabase = await createClient();

    // Verify user is beautician/staff
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile || !['clinic_staff', 'clinic_owner', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const status = searchParams.get('status') || 'all';

    // Build query
    let query = supabase
      .from('appointments')
      .select(`
        id,
        appointment_number,
        customer_id,
        appointment_date,
        start_time,
        end_time,
        status,
        customer_notes,
        staff_notes,
        created_at,
        users:customer_id (
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('clinic_id', profile.clinic_id)
      .order('start_time', { ascending: true });

    // Filter by date
    if (date) {
      query = query.eq('appointment_date', date);
    }

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: appointments, error: appointmentsError } = await query;

    if (appointmentsError) {
      throw appointmentsError;
    }

    // Transform data
    const transformedAppointments = (appointments || []).map(apt => {
      const user = Array.isArray(apt.users) ? apt.users[0] : apt.users;
      return {
        id: apt.id,
        patientName: user?.full_name || 'Unknown',
        treatment: 'Treatment', // TODO: Add treatment info
        time: apt.start_time?.substring(0, 5) || '00:00',
        status: apt.status as 'scheduled' | 'in-progress' | 'completed',
        customerNotes: apt.customer_notes,
        staffNotes: apt.staff_notes,
      };
    });

    return NextResponse.json({
      success: true,
      appointments: transformedAppointments,
      date,
      total: transformedAppointments.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Beautician appointments error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch appointments',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Update appointment status
export async function PATCH(request: NextRequest) {
  try {
    await cookies();
    const supabase = await createClient();

    // Verify user is beautician/staff
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile || !['clinic_staff', 'clinic_owner', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { appointmentId, status, staffNotes } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'appointmentId and status are required' },
        { status: 400 }
      );
    }

    // Update appointment
    const { data: appointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        status,
        staff_notes: staffNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .eq('clinic_id', profile.clinic_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'appointment_status_updated',
      resource_type: 'appointment',
      resource_id: appointmentId,
      metadata: {
        status,
        hasNotes: !!staffNotes,
      },
    });

    return NextResponse.json({
      success: true,
      appointment,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update appointment',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
