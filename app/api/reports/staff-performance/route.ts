import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Generate staff performance report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinicId = searchParams.get('clinic_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!clinicId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: clinic_id, start_date, end_date' },
        { status: 400 }
      );
    }

    // Call database function for staff performance
    const { data: performance, error: performanceError } = await supabase
      .rpc('calculate_staff_performance', {
        p_clinic_id: clinicId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

    if (performanceError) {
      console.error('Error calculating staff performance:', performanceError);
      return NextResponse.json(
        { error: 'Failed to calculate staff performance' },
        { status: 500 }
      );
    }

    // Get additional metrics from appointments
    const { data: appointments } = await supabase
      .from('appointment_slots')
      .select('doctor_id, status, appointment_date, duration_minutes')
      .eq('clinic_id', clinicId)
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate);

    // Calculate utilization rate per staff
    const staffUtilization: Record<string, any> = {};
    if (appointments) {
      for (const appt of appointments) {
        const doctorId = appt.doctor_id;
        if (!doctorId) continue;

        if (!staffUtilization[doctorId]) {
          staffUtilization[doctorId] = {
            total_minutes: 0,
            working_minutes: 0,
          };
        }

        if (appt.status === 'completed' || appt.status === 'scheduled') {
          staffUtilization[doctorId].working_minutes += appt.duration_minutes || 0;
        }
      }
    }

    // Assuming 8-hour workday (480 minutes)
    const workDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const totalAvailableMinutes = workDays * 480;

    for (const doctorId of Object.keys(staffUtilization)) {
      const utilization = staffUtilization[doctorId];
      utilization.utilization_rate = (utilization.working_minutes / totalAvailableMinutes) * 100;
    }

    // Format response
    const response = {
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        total_staff: performance?.total_staff || 0,
      },
      staff_performance: performance?.staff_performance || [],
      utilization: staffUtilization,
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating staff performance report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
