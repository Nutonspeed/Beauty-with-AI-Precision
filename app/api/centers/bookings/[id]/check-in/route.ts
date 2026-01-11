import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update booking to "arrived" status
    const { data: booking, error } = await supabase
      .from("clinic_bookings")
      .update({
        status: "arrived",
        checked_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        customer:clinic_customers(name, phone),
        staff:clinic_staff(name)
      `
      )
      .single();

    if (error) {
      console.error("Error checking in:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "customer_check_in",
      resource_type: "booking",
      resource_id: id,
      details: {
        customer_name: booking.customer?.name,
        appointment_time: booking.appointment_time,
        checked_in_by: user.email,
      },
    });

    // Send notification to assigned staff (via database + realtime)
    if (booking.staff_id) {
      await supabase.from("notifications").insert({
        user_id: booking.staff_id,
        type: "customer_arrived",
        title: "ลูกค้ามาถึงแล้ว",
        message: `${booking.customer?.name} เช็คอินแล้ว - นัด ${booking.appointment_time}`,
        data: {
          booking_id: booking.id,
          customer_name: booking.customer?.name,
        },
      });
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "เช็คอินสำเร็จ",
    });
  } catch (error) {
    console.error("Error in POST /api/clinic/bookings/[id]/check-in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
