import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addHours, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { sendEmail } from "@/lib/notifications/email-service";

interface AppointmentReminder {
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_line_id: string | null;
  appointment_date: string;
  appointment_time: string;
  program_type: string;
  staff_name: string;
  reminder_type: "24h" | "1h";
  channels: string[];
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ดึงการตั้งค่า
    const { data: settings } = await supabase
      .from("center_settings")
      .select("settings")
      .eq("setting_type", "automation")
      .maybeSingle();

    const reminderSettings = {
      enabled: settings?.settings?.appointment_reminders_enabled !== false,
      reminder_24h: settings?.settings?.reminder_24h_enabled !== false,
      reminder_1h: settings?.settings?.reminder_1h_enabled !== false,
      channels: settings?.settings?.reminder_channels || ["sms", "line"],
    };

    if (!reminderSettings.enabled) {
      return NextResponse.json({
        reminders: [],
        message: "Appointment reminders are disabled",
      });
    }

    // คำนวณช่วงเวลาสำหรับการแจ้งเตือน
    const now = new Date();
    const in24Hours = addHours(now, 24);
    const in1Hour = addHours(now, 1);

    // ดึงการนัดหมายที่ต้องแจ้งเตือน
    const { data: upcomingBookings, error } = await supabase
      .from("center_bookings")
      .select(
        `
        *,
        customer:center_customers(name, email, phone, line_id),
        staff:center_staff(name)
      `
      )
      .eq("status", "confirmed")
      .gte("appointment_date", startOfDay(now).toISOString())
      .lte("appointment_date", endOfDay(in24Hours).toISOString())
      .order("appointment_date", { ascending: true });

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const reminders: AppointmentReminder[] = [];

    (upcomingBookings || []).forEach((booking) => {
      const appointmentDateTime = new Date(
        `${booking.appointment_date}T${booking.appointment_time}`
      );

      // ตรวจสอบว่าต้องส่งการแจ้งเตือน 24 ชั่วโมงหรือไม่
      if (
        reminderSettings.reminder_24h &&
        isWithinInterval(appointmentDateTime, {
          start: addHours(now, 23.5),
          end: addHours(now, 24.5),
        })
      ) {
        reminders.push({
          booking_id: booking.id,
          customer_name: booking.customer?.name || "ลูกค้า",
          customer_phone: booking.customer?.phone || "",
          customer_email: booking.customer?.email || "",
          customer_line_id: booking.customer?.line_id || null,
          appointment_date: booking.appointment_date,
          appointment_time: booking.appointment_time,
          program_type: booking.program_type,
          staff_name: booking.staff?.name || "ทีมงาน",
          reminder_type: "24h",
          channels: reminderSettings.channels,
        });
      }

      // ตรวจสอบว่าต้องส่งการแจ้งเตือน 1 ชั่วโมงหรือไม่
      if (
        reminderSettings.reminder_1h &&
        isWithinInterval(appointmentDateTime, {
          start: addHours(now, 0.5),
          end: addHours(now, 1.5),
        })
      ) {
        reminders.push({
          booking_id: booking.id,
          customer_name: booking.customer?.name || "ลูกค้า",
          customer_phone: booking.customer?.phone || "",
          customer_email: booking.customer?.email || "",
          customer_line_id: booking.customer?.line_id || null,
          appointment_date: booking.appointment_date,
          appointment_time: booking.appointment_time,
          program_type: booking.program_type,
          staff_name: booking.staff?.name || "ทีมงาน",
          reminder_type: "1h",
          channels: reminderSettings.channels,
        });
      }
    });

    return NextResponse.json({
      reminders,
      total: reminders.length,
      reminder_24h: reminders.filter((r) => r.reminder_type === "24h").length,
      reminder_1h: reminders.filter((r) => r.reminder_type === "1h").length,
    });
  } catch (error) {
    console.error("Error in GET /api/center/automation/appointment-reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ฟังก์ชันสำหรับส่งการแจ้งเตือน (เรียกใช้โดย cron job)
export async function POST() {
  try {
    const supabase = await createClient();

    // ดึงการตั้งค่า
    const { data: settings } = await supabase
      .from("center_settings")
      .select("settings")
      .eq("setting_type", "automation")
      .maybeSingle();

    const reminderSettings = {
      enabled: settings?.settings?.appointment_reminders_enabled !== false,
      reminder_24h: settings?.settings?.reminder_24h_enabled !== false,
      reminder_1h: settings?.settings?.reminder_1h_enabled !== false,
      channels: settings?.settings?.reminder_channels || ["sms", "line"],
      template_24h:
        settings?.settings?.reminder_template_24h ||
        "สวัสดีค่ะ คุณ {{customer_name}} มีนัดที่คลินิกในวันพรุ่งนี้เวลา {{time}} สำหรับ {{program}}",
      template_1h:
        settings?.settings?.reminder_template_1h ||
        "สวัสดีค่ะ อีก 1 ชั่วโมงคุณมีนัดที่คลินิก สำหรับ {{program}} เวลา {{time}}",
    };

    if (!reminderSettings.enabled) {
      return NextResponse.json({
        success: false,
        message: "Reminders disabled",
      });
    }

    // คำนวณช่วงเวลา
    const now = new Date();
    const in24Hours = addHours(now, 24);
    const in1Hour = addHours(now, 1);

    // ดึงการนัดหมายที่ต้องแจ้งเตือน
    const { data: upcomingBookings } = await supabase
      .from("center_bookings")
      .select(
        `
        *,
        customer:center_customers(name, email, phone, line_id),
        staff:center_staff(name)
      `
      )
      .eq("status", "confirmed")
      .gte("appointment_date", startOfDay(now).toISOString())
      .lte("appointment_date", endOfDay(in24Hours).toISOString());

    let sent24h = 0;
    let sent1h = 0;

    for (const booking of upcomingBookings || []) {
      const appointmentDateTime = new Date(
        `${booking.appointment_date}T${booking.appointment_time}`
      );

      // ส่งการแจ้งเตือน 24 ชั่วโมง
      if (
        reminderSettings.reminder_24h &&
        isWithinInterval(appointmentDateTime, {
          start: addHours(now, 23.5),
          end: addHours(now, 24.5),
        })
      ) {
        const message = reminderSettings.template_24h
          .replace("{{customer_name}}", booking.customer?.name || "ลูกค้า")
          .replace("{{time}}", booking.appointment_time)
          .replace("{{program}}", booking.program_type)
          .replace("{{staff_name}}", booking.staff?.name || "ทีมงาน")
          .replace("{{center_phone}}", "02-XXX-XXXX");

        await sendReminder(
          booking,
          message,
          reminderSettings.channels,
          "24h",
          supabase
        );
        sent24h++;
      }

      // ส่งการแจ้งเตือน 1 ชั่วโมง
      if (
        reminderSettings.reminder_1h &&
        isWithinInterval(appointmentDateTime, {
          start: addHours(now, 0.5),
          end: addHours(now, 1.5),
        })
      ) {
        const message = reminderSettings.template_1h
          .replace("{{customer_name}}", booking.customer?.name || "ลูกค้า")
          .replace("{{time}}", booking.appointment_time)
          .replace("{{program}}", booking.program_type)
          .replace("{{staff_name}}", booking.staff?.name || "ทีมงาน");

        await sendReminder(
          booking,
          message,
          reminderSettings.channels,
          "1h",
          supabase
        );
        sent1h++;
      }
    }

    // บันทึก log
    await supabase.from("automation_logs").insert({
      automation_type: "appointment_reminder",
      status: "sent",
      data: {
        sent_24h: sent24h,
        sent_1h: sent1h,
        total: sent24h + sent1h,
      },
    });

    return NextResponse.json({
      success: true,
      sent_24h: sent24h,
      sent_1h: sent1h,
      total: sent24h + sent1h,
    });
  } catch (error) {
    console.error("Error sending appointment reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendReminder(
  booking: any,
  message: string,
  channels: string[],
  reminderType: "24h" | "1h",
  supabase: any
) {
  const sentChannels: string[] = [];
  
  // Send email if customer has email
  if (channels.includes("email") && booking.customer?.email) {
    const emailResult = await sendEmail({
      to: booking.customer.email,
      subject: `🔔 เตือนนัดหมาย - ${booking.program_type}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>เตือนนัดหมาย</h2>
          <p>สวัสดีคุณ ${booking.customer?.name || "ลูกค้า"},</p>
          <p>${message}</p>
          <p style="color: #666;">AI367 Beauty Center</p>
        </div>
      `,
    });
    if (emailResult.success) {
      sentChannels.push("email");
    }
    console.log(`Email reminder (${reminderType}):`, emailResult);
  }

  // LINE and SMS - log only (requires API keys)
  if (channels.includes("line") && booking.customer?.line_id) {
    console.log(`LINE reminder (${reminderType}):`, booking.customer.line_id);
    // sentChannels.push("line"); // Uncomment when LINE API is configured
  }
  
  if (channels.includes("sms") && booking.customer?.phone) {
    console.log(`SMS reminder (${reminderType}):`, booking.customer.phone);
    // sentChannels.push("sms"); // Uncomment when SMS API is configured
  }

  // บันทึก log การส่ง
  await supabase.from("notification_logs").insert({
    booking_id: booking.id,
    customer_id: booking.customer_id,
    notification_type: "appointment_reminder",
    channels: sentChannels.length > 0 ? sentChannels : channels,
    message,
    status: sentChannels.length > 0 ? "sent" : "logged",
    sent_at: new Date().toISOString(),
  });
}
