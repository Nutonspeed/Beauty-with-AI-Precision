import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Generate revenue report
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

    // Call database function for revenue metrics
    const { data: metrics, error: metricsError } = await supabase
      .rpc('calculate_revenue_metrics', {
        p_clinic_id: clinicId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

    if (metricsError) {
      console.error('Error calculating revenue metrics:', metricsError);
      return NextResponse.json(
        { error: 'Failed to calculate revenue metrics' },
        { status: 500 }
      );
    }

    // Get detailed revenue breakdown by service
    const { data: serviceRevenue, error: serviceError } = await supabase
      .from('bookings')
      .select('service_id, service_name, total_amount')
      .eq('clinic_id', clinicId)
      .eq('payment_status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (serviceError) {
      console.error('Error fetching service revenue:', serviceError);
    }

    // Aggregate service revenue
    const revenueByService = serviceRevenue?.reduce((acc: any, booking: any) => {
      const key = booking.service_name || 'Unknown Service';
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += Number.parseFloat(booking.total_amount);
      return acc;
    }, {});

    // Get revenue by doctor (if appointments table exists)
    const { data: doctorRevenue, error: doctorError } = await supabase
      .from('appointment_slots')
      .select('doctor_id, service_price')
      .eq('clinic_id', clinicId)
      .eq('payment_status', 'paid')
      .eq('status', 'completed')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate);

    const revenueByDoctor: Record<string, number> = {};
    if (!doctorError && doctorRevenue) {
      for (const appt of doctorRevenue) {
        const doctorId = appt.doctor_id || 'walk_in';
        if (!revenueByDoctor[doctorId]) {
          revenueByDoctor[doctorId] = 0;
        }
        revenueByDoctor[doctorId] += Number.parseFloat(appt.service_price || 0);
      }
    }

    // Format response
    const response = {
      period: {
        start: startDate,
        end: endDate,
      },
      summary: metrics || {},
      breakdown: {
        by_service: revenueByService || {},
        by_doctor: revenueByDoctor,
        by_payment_method: metrics?.revenue_by_payment_method || {},
        by_date: metrics?.revenue_by_date || {},
      },
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating revenue report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
