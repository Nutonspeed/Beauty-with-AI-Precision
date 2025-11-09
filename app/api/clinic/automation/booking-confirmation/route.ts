import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { booking_id } = await request.json();

    if (!booking_id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // ดึงการตั้งค่า
    const { data: settings } = await supabase
      .from("clinic_settings")
      .select("settings")
      .eq("setting_type", "automation")
      .maybeSingle();

    const confirmationSettings = {
      enabled: settings?.settings?.booking_confirmation_enabled !== false,
      channels: settings?.settings?.booking_confirmation_channels || [
        "line",
        "email",
      ],
      template:
        settings?.settings?.booking_confirmation_template ||
        "ยืนยันการจองสำเร็จ! 🎉\n\nเลขที่การจอง: {{booking_id}}\nวันที่: {{date}}\nเวลา: {{time}}\nการรักษา: {{treatment}}\nผู้ให้บริการ: {{staff_name}}",
    };

    if (!confirmationSettings.enabled) {
      return NextResponse.json({
        success: false,
        message: "Booking confirmations are disabled",
      });
    }

    // ดึงข้อมูลการจอง
    const { data: booking, error } = await supabase
      .from("clinic_bookings")
      .select(
        `
        *,
        customer:clinic_customers(name, email, phone, line_id),
        staff:clinic_staff(name)
      `
      )
      .eq("id", booking_id)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // สร้างข้อความยืนยัน
    const appointmentDate = format(
      new Date(booking.appointment_date),
      "d MMMM yyyy",
      { locale: th }
    );

    const message = confirmationSettings.template
      .replace("{{booking_id}}", booking.id.substring(0, 8).toUpperCase())
      .replace("{{date}}", appointmentDate)
      .replace("{{time}}", booking.appointment_time)
      .replace("{{treatment}}", booking.treatment_type)
      .replace("{{staff_name}}", booking.staff?.name || "ทีมงาน")
      .replace("{{customer_name}}", booking.customer?.name || "ลูกค้า");

    // ส่งการยืนยันผ่านช่องทางที่เลือก
    const sentChannels: string[] = [];

    for (const channel of confirmationSettings.channels) {
      try {
        if (channel === "line" && booking.customer?.line_id) {
          // TODO: ต่อกับ LINE Messaging API
          console.log("Sending LINE confirmation:", {
            line_id: booking.customer.line_id,
            message,
          });
          sentChannels.push("line");
        }

        if (channel === "email" && booking.customer?.email) {
          // TODO: ต่อกับ Email Service (Resend, SendGrid)
          console.log("Sending Email confirmation:", {
            email: booking.customer.email,
            message,
          });
          sentChannels.push("email");
        }

        if (channel === "sms" && booking.customer?.phone) {
          // TODO: ต่อกับ SMS Service (Twilio, AWS SNS)
          console.log("Sending SMS confirmation:", {
            phone: booking.customer.phone,
            message,
          });
          sentChannels.push("sms");
        }
      } catch (channelError) {
        console.error(`Error sending via ${channel}:`, channelError);
      }
    }

    // บันทึก log
    await supabase.from("notification_logs").insert({
      booking_id: booking.id,
      customer_id: booking.customer_id,
      notification_type: "booking_confirmation",
      channels: sentChannels,
      message,
      status: sentChannels.length > 0 ? "sent" : "failed",
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      channels_sent: sentChannels,
      message,
    });
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: ดูประวัติการยืนยันที่ส่งไป
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const booking_id = searchParams.get("booking_id");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query = supabase
      .from("notification_logs")
      .select("*")
      .eq("notification_type", "booking_confirmation")
      .order("sent_at", { ascending: false });

    if (booking_id) {
      query = query.eq("booking_id", booking_id);
    }

    const { data: logs, error } = await query.limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching confirmation logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
