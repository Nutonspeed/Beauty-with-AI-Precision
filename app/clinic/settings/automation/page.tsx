import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AutomationSettingsClient from "./automation-client";

async function requireRole(allowedRoles: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect("/unauthorized");
  }

  return { user, profile };
}

async function getAutomationSettings() {
  const supabase = await createClient();

  // ดึงข้อมูลการตั้งค่า automation จากตาราง clinic_settings
  const { data: settings } = await supabase
    .from("clinic_settings")
    .select("*")
    .eq("setting_type", "automation")
    .maybeSingle();

  // ถ้ายังไม่มีการตั้งค่า ใช้ค่า default
  const defaultSettings = {
    // Inventory Alerts
    inventory_alerts_enabled: true,
    inventory_alert_threshold: 10,
    inventory_alert_emails: [],

    // Appointment Reminders
    appointment_reminders_enabled: true,
    reminder_24h_enabled: true,
    reminder_1h_enabled: true,
    reminder_channels: ["sms", "line"],
    reminder_template_24h: "สวัสดีค่ะ คุณ {{customer_name}} มีนัดที่คลินิกในวันพรุ่งนี้เวลา {{time}} สำหรับ {{treatment}} หากต้องการเปลี่ยนนัด กรุณาติดต่อ {{clinic_phone}}",
    reminder_template_1h: "สวัสดีค่ะ อีก 1 ชั่วโมงคุณมีนัดที่คลินิก สำหรับ {{treatment}} เวลา {{time}} รอพบคุณนะคะ 💕",

    // Booking Confirmations
    booking_confirmation_enabled: true,
    booking_confirmation_channels: ["line", "email"],
    booking_confirmation_template: "ยืนยันการจองสำเร็จ! 🎉\n\nเลขที่การจอง: {{booking_id}}\nวันที่: {{date}}\nเวลา: {{time}}\nการรักษา: {{treatment}}\nผู้ให้บริการ: {{staff_name}}\n\nขอบคุณที่ไว้วางใจค่ะ 💖",

    // Customer Follow-ups
    follow_up_enabled: true,
    follow_up_after_days: 3,
    follow_up_template: "สวัสดีค่ะคุณ {{customer_name}} 😊\n\nขอบคุณที่ใช้บริการ {{treatment}} เมื่อวันที่ {{date}} เป็นอย่างไรบ้างคะ? หากมีคำถามหรือต้องการคำแนะนำเพิ่มเติม ยินดีให้คำปรึกษาค่ะ 💕",

    // Inactive Customer Campaign
    inactive_campaign_enabled: true,
    inactive_after_days: 90,
    inactive_campaign_template: "คิดถึงคุณ {{customer_name}} ค่ะ 💕\n\nสังเกตว่าไม่ได้เจอกันนานแล้ว! มีโปรโมชั่นพิเศษสำหรับคุณโดยเฉพาะ ลด 20% สำหรับการจองครั้งต่อไป ✨\n\nใช้โค้ด: COMEBACK20",

    // Birthday Wishes
    birthday_wishes_enabled: true,
    birthday_template: "🎂 สุขสันต์วันเกิดค่ะคุณ {{customer_name}}! 🎉\n\nขอให้มีความสุขมากๆ และมีผิวสวยเปล่งปลั่งตลอดปีนี้นะคะ 💖\n\nรับส่วนลด 30% สำหรับ Treatment ที่ชอบในเดือนเกิด! 🎁",
    birthday_discount_percentage: 30,

    // Staff Schedule Notifications
    staff_schedule_notifications_enabled: true,
    schedule_notification_time: "08:00",
  };

  return settings?.settings || defaultSettings;
}

export default async function AutomationSettingsPage() {
  await requireRole(["clinic_owner", "super_admin"]);
  const settings = await getAutomationSettings();

  return <AutomationSettingsClient initialSettings={settings} />;
}
