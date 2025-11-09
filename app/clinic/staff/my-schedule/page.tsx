import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StaffScheduleClient from "@/app/clinic/staff/my-schedule/schedule-client";
import { format, startOfDay, endOfDay } from "date-fns";
import { th } from "date-fns/locale";

async function requireStaffRole() {
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

  if (!profile || !["clinic_staff", "clinic_owner", "super_admin"].includes(profile.role)) {
    redirect("/unauthorized");
  }

  return { user, profile };
}

async function getStaffSchedule(staffId: string) {
  const supabase = await createClient();
  const today = new Date();

  // ดึงข้อมูลทีมงาน
  const { data: staff } = await supabase
    .from("clinic_staff")
    .select("*")
    .eq("user_id", staffId)
    .single();

  if (!staff) {
    return null;
  }

  // ดึงการนัดหมายวันนี้
  const { data: appointments } = await supabase
    .from("clinic_bookings")
    .select(
      `
      *,
      customer:clinic_customers(id, name, phone, email, profile_image_url),
      treatment:clinic_treatments(name, duration, price)
    `
    )
    .eq("staff_id", staff.id)
    .eq("appointment_date", format(today, "yyyy-MM-dd"))
    .order("appointment_time", { ascending: true });

  // ดึงสถิติวันนี้
  const { data: todayStats } = await supabase
    .from("clinic_bookings")
    .select("id, status, total_price")
    .eq("staff_id", staff.id)
    .eq("appointment_date", format(today, "yyyy-MM-dd"));

  const stats = {
    total_appointments: todayStats?.length || 0,
    completed: todayStats?.filter((b) => b.status === "completed").length || 0,
    in_progress: todayStats?.filter((b) => b.status === "in_progress").length || 0,
    pending: todayStats?.filter((b) => b.status === "confirmed").length || 0,
    cancelled: todayStats?.filter((b) => b.status === "cancelled").length || 0,
    no_show: todayStats?.filter((b) => b.status === "no_show").length || 0,
    revenue: todayStats
      ?.filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
  };

  // ดึงประวัติผลงาน (30 วันล่าสุด)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: monthlyStats } = await supabase
    .from("clinic_bookings")
    .select("id, status, total_price")
    .eq("staff_id", staff.id)
    .gte("appointment_date", format(thirtyDaysAgo, "yyyy-MM-dd"))
    .lte("appointment_date", format(today, "yyyy-MM-dd"));

  const monthly = {
    total_appointments: monthlyStats?.length || 0,
    completed: monthlyStats?.filter((b) => b.status === "completed").length || 0,
    total_revenue: monthlyStats
      ?.filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
    completion_rate: monthlyStats?.length
      ? Math.round(
          (monthlyStats.filter((b) => b.status === "completed").length /
            monthlyStats.length) *
            100
        )
      : 0,
  };

  return {
    staff,
    appointments: appointments || [],
    todayStats: stats,
    monthlyStats: monthly,
  };
}

export default async function StaffSchedulePage() {
  const { user } = await requireStaffRole();
  const scheduleData = await getStaffSchedule(user.id);

  if (!scheduleData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">ไม่พบข้อมูลทีมงาน</h1>
          <p className="text-muted-foreground">
            กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มข้อมูลของคุณ
          </p>
        </div>
      </div>
    );
  }

  return <StaffScheduleClient {...scheduleData} />;
}
