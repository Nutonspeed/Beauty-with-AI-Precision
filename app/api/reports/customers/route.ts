import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Generate customer analytics report
// IMPORTANT: This is for BEAUTY CLINIC customers (ลูกค้า), NOT patients
// Customers seek beauty enhancement services, not medical treatment
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

    // Call database function for customer analytics
    const { data: analytics, error: analyticsError } = await supabase
      .rpc('calculate_customer_analytics', {
        p_clinic_id: clinicId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

    if (analyticsError) {
      console.error('Error calculating customer analytics:', analyticsError);
      return NextResponse.json(
        { error: 'Failed to calculate customer analytics' },
        { status: 500 }
      );
    }

    // Get top customers by revenue
    const { data: topCustomers } = await supabase
      .from('bookings')
      .select('user_id, customer_name, customer_email, total_amount')
      .eq('clinic_id', clinicId)
      .eq('payment_status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Aggregate customer spending
    const customerSpending: Record<string, any> = {};
    if (topCustomers) {
      for (const booking of topCustomers) {
        const userId = booking.user_id || 'guest';
        if (!customerSpending[userId]) {
          customerSpending[userId] = {
            user_id: userId,
            name: booking.customer_name,
            email: booking.customer_email,
            total_spent: 0,
            booking_count: 0,
          };
        }
        customerSpending[userId].total_spent += Number.parseFloat(booking.total_amount);
        customerSpending[userId].booking_count += 1;
      }
    }

    // Sort by total spent
    const topCustomersList = Object.values(customerSpending)
      .sort((a: any, b: any) => b.total_spent - a.total_spent)
      .slice(0, 10);

    // Get customer retention metrics
    const { data: retentionData } = await supabase
      .from('bookings')
      .select('user_id, created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    // Calculate retention rate (customers with 2+ bookings)
    const customerBookings: Record<string, number> = {};
    if (retentionData) {
      for (const booking of retentionData) {
        const userId = booking.user_id || 'guest';
        customerBookings[userId] = (customerBookings[userId] || 0) + 1;
      }
    }

    const totalCustomers = Object.keys(customerBookings).length;
    const returningCustomers = Object.values(customerBookings).filter(count => count > 1).length;
    const retentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

    // Format response
    const response = {
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        ...analytics,
        retention_rate: Number.parseFloat(retentionRate.toFixed(2)),
      },
      top_customers: topCustomersList,
      demographics: analytics?.customer_demographics || {},
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating customer analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
