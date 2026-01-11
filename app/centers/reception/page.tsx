import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReceptionClient from "./reception-client";
import { format } from "date-fns";
import { PageLayout } from "@/components/layouts/page-layout";

async function requireReceptionRole() {
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

  if (
    !profile ||
    !["clinic_staff", "clinic_owner", "super_admin"].includes(profile.role)
  ) {
    redirect("/unauthorized");
  }

  return { user, profile };
}

async function getTodayBookings() {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  // ดึงการนัดหมายวันนี้ทั้งหมด
  const { data: bookings } = await supabase
    .from("clinic_bookings")
    .select(
      `
      *,
      customer:clinic_customers(id, name, phone, email, profile_image_url, date_of_birth),
      staff:clinic_staff(id, name, role),
      treatment:clinic_treatments(name, duration)
    `
    )
    .eq("appointment_date", today)
    .order("appointment_time", { ascending: true });

  // ดึงสถิติ
  const stats = {
    total: bookings?.length || 0,
    checked_in:
      bookings?.filter((b) =>
        ["in_progress", "completed"].includes(b.status)
      ).length || 0,
    waiting:
      bookings?.filter((b) => b.status === "arrived").length || 0,
    pending: bookings?.filter((b) => b.status === "confirmed").length || 0,
    completed: bookings?.filter((b) => b.status === "completed").length || 0,
    no_show: bookings?.filter((b) => b.status === "no_show").length || 0,
  };

  return {
    bookings: bookings || [],
    stats,
  };
}

export default async function ReceptionPage() {
  await requireReceptionRole();
  const data = await getTodayBookings();

  return (
    <PageLayout>
      <ReceptionClient {...data} />
    </PageLayout>
  );
}
