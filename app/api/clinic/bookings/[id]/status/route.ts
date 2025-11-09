import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    const { status } = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate status
    const validStatuses = [
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update booking status
    const { data: booking, error } = await supabase
      .from("clinic_bookings")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating booking:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update_booking_status",
      resource_type: "booking",
      resource_id: id,
      details: {
        old_status: booking.status,
        new_status: status,
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Error in PATCH /api/clinic/bookings/[id]/status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
