import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, subDays, format } from "date-fns";
import { th } from "date-fns/locale";

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
      .from("clinic_settings")
      .select("settings")
      .eq("setting_type", "automation")
      .maybeSingle();

    const followUpSettings = {
      enabled: settings?.settings?.follow_up_enabled !== false,
      after_days: settings?.settings?.follow_up_after_days || 3,
    };

    const inactiveSettings = {
      enabled: settings?.settings?.inactive_campaign_enabled !== false,
      after_days: settings?.settings?.inactive_after_days || 90,
    };

    if (!followUpSettings.enabled && !inactiveSettings.enabled) {
      return NextResponse.json({
        follow_ups: [],
        inactive_customers: [],
        message: "Customer follow-ups are disabled",
      });
    }

    const now = new Date();
    const followUpDate = subDays(now, followUpSettings.after_days);
    const inactiveDate = subDays(now, inactiveSettings.after_days);

    // ดึงลูกค้าที่ต้องติดตามหลังการรักษา
    let followUps: any[] = [];
    if (followUpSettings.enabled) {
      const { data: recentBookings } = await supabase
        .from("clinic_bookings")
        .select(
          `
          *,
          customer:clinic_customers(name, email, phone, line_id)
        `
        )
        .eq("status", "completed")
        .gte(
          "appointment_date",
          format(followUpDate, "yyyy-MM-dd")
        )
        .lte(
          "appointment_date",
          format(followUpDate, "yyyy-MM-dd")
        );

      followUps = recentBookings || [];
    }

    // ดึงลูกค้าที่ไม่ได้ใช้บริการนาน
    let inactiveCustomers: any[] = [];
    if (inactiveSettings.enabled) {
      const { data: customers } = await supabase
        .from("clinic_customers")
        .select(
          `
          *,
          bookings:clinic_bookings(
            id,
            appointment_date,
            status
          )
        `
        )
        .order("created_at", { ascending: false });

      // กรองลูกค้าที่ไม่มีการจองในช่วง inactive_after_days
      inactiveCustomers = (customers || []).filter((customer) => {
        const lastBooking = customer.bookings
          ?.filter((b: any) => b.status === "completed")
          .sort(
            (a: any, b: any) =>
              new Date(b.appointment_date).getTime() -
              new Date(a.appointment_date).getTime()
          )[0];

        if (!lastBooking) return false;

        const daysSinceLastBooking = Math.floor(
          (now.getTime() - new Date(lastBooking.appointment_date).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return daysSinceLastBooking >= inactiveSettings.after_days;
      });
    }

    return NextResponse.json({
      follow_ups: followUps.map((booking) => ({
        booking_id: booking.id,
        customer_id: booking.customer_id,
        customer_name: booking.customer?.name,
        customer_phone: booking.customer?.phone,
        customer_email: booking.customer?.email,
        customer_line_id: booking.customer?.line_id,
        treatment: booking.treatment_type,
        appointment_date: booking.appointment_date,
        days_since: followUpSettings.after_days,
      })),
      inactive_customers: inactiveCustomers.map((customer) => {
        const lastBooking = customer.bookings
          ?.filter((b: any) => b.status === "completed")
          .sort(
            (a: any, b: any) =>
              new Date(b.appointment_date).getTime() -
              new Date(a.appointment_date).getTime()
          )[0];

        const daysSinceLastBooking = lastBooking
          ? Math.floor(
              (now.getTime() -
                new Date(lastBooking.appointment_date).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

        return {
          customer_id: customer.id,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: customer.email,
          customer_line_id: customer.line_id,
          last_booking_date: lastBooking?.appointment_date,
          days_since_last_booking: daysSinceLastBooking,
        };
      }),
      summary: {
        follow_ups_pending: followUps.length,
        inactive_customers_count: inactiveCustomers.length,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/clinic/automation/customer-followup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: ส่งข้อความติดตาม (เรียกโดย cron job)
export async function POST() {
  try {
    const supabase = await createClient();

    // ดึงการตั้งค่า
    const { data: settings } = await supabase
      .from("clinic_settings")
      .select("settings")
      .eq("setting_type", "automation")
      .maybeSingle();

    const followUpSettings = {
      enabled: settings?.settings?.follow_up_enabled !== false,
      after_days: settings?.settings?.follow_up_after_days || 3,
      template:
        settings?.settings?.follow_up_template ||
        "สวัสดีค่ะคุณ {{customer_name}} ขอบคุณที่ใช้บริการ {{treatment}}",
    };

    const inactiveSettings = {
      enabled: settings?.settings?.inactive_campaign_enabled !== false,
      after_days: settings?.settings?.inactive_after_days || 90,
      template:
        settings?.settings?.inactive_campaign_template ||
        "คิดถึงคุณ {{customer_name}} ค่ะ มีโปรโมชั่นพิเศษรอคุณอยู่!",
    };

    let followUpsSent = 0;
    let inactiveCampaignsSent = 0;

    const now = new Date();

    // ส่งข้อความติดตามหลังการรักษา
    if (followUpSettings.enabled) {
      const followUpDate = subDays(now, followUpSettings.after_days);

      const { data: recentBookings } = await supabase
        .from("clinic_bookings")
        .select(
          `
          *,
          customer:clinic_customers(name, email, phone, line_id)
        `
        )
        .eq("status", "completed")
        .gte("appointment_date", format(followUpDate, "yyyy-MM-dd"))
        .lte("appointment_date", format(followUpDate, "yyyy-MM-dd"));

      for (const booking of recentBookings || []) {
        const message = followUpSettings.template
          .replace("{{customer_name}}", booking.customer?.name || "ลูกค้า")
          .replace("{{treatment}}", booking.treatment_type)
          .replace(
            "{{date}}",
            format(new Date(booking.appointment_date), "d MMMM yyyy", {
              locale: th,
            })
          );

        // TODO: ส่งข้อความจริงผ่าน LINE/SMS/Email
        console.log("Sending follow-up:", {
          customer: booking.customer?.name,
          message,
        });

        await supabase.from("notification_logs").insert({
          booking_id: booking.id,
          customer_id: booking.customer_id,
          notification_type: "follow_up",
          channels: ["line"],
          message,
          status: "sent",
          sent_at: new Date().toISOString(),
        });

        followUpsSent++;
      }
    }

    // ส่งแคมเปญลูกค้าหายไป
    if (inactiveSettings.enabled) {
      const inactiveDate = subDays(now, inactiveSettings.after_days);

      const { data: customers } = await supabase
        .from("clinic_customers")
        .select(
          `
          *,
          bookings:clinic_bookings(
            id,
            appointment_date,
            status
          )
        `
        );

      const inactiveCustomers = (customers || []).filter((customer) => {
        const lastBooking = customer.bookings
          ?.filter((b: any) => b.status === "completed")
          .sort(
            (a: any, b: any) =>
              new Date(b.appointment_date).getTime() -
              new Date(a.appointment_date).getTime()
          )[0];

        if (!lastBooking) return false;

        const daysSince = Math.floor(
          (now.getTime() - new Date(lastBooking.appointment_date).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return daysSince >= inactiveSettings.after_days;
      });

      for (const customer of inactiveCustomers) {
        const message = inactiveSettings.template.replace(
          "{{customer_name}}",
          customer.name || "ลูกค้า"
        );

        // TODO: ส่งข้อความจริง
        console.log("Sending inactive campaign:", {
          customer: customer.name,
          message,
        });

        await supabase.from("notification_logs").insert({
          customer_id: customer.id,
          notification_type: "inactive_campaign",
          channels: ["line"],
          message,
          status: "sent",
          sent_at: new Date().toISOString(),
        });

        inactiveCampaignsSent++;
      }
    }

    // บันทึก log
    await supabase.from("automation_logs").insert({
      automation_type: "customer_followup",
      status: "sent",
      data: {
        follow_ups_sent: followUpsSent,
        inactive_campaigns_sent: inactiveCampaignsSent,
        total: followUpsSent + inactiveCampaignsSent,
      },
    });

    return NextResponse.json({
      success: true,
      follow_ups_sent: followUpsSent,
      inactive_campaigns_sent: inactiveCampaignsSent,
      total: followUpsSent + inactiveCampaignsSent,
    });
  } catch (error) {
    console.error("Error sending customer follow-ups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
