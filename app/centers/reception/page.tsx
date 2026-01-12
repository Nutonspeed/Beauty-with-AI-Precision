import { requireRole } from "@/lib/supabase/auth";
import { createServerClient } from "@/lib/supabase/server";
import ReceptionClient from "./reception-client";
import { format } from "date-fns";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

async function getTodayBookings() {
  const supabase = await createServerClient();
  const today = format(new Date(), "yyyy-MM-dd");

  // ดึงการนัดหมายวันนี้ทั้งหมด
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      client:customers(id, name, phone, email, profile_image_url, date_of_birth),
      staff:center_staff(id, name, role)
    `
    )
    .eq("booking_date", today)
    .order("booking_time", { ascending: true });

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
  await requireRole(["center_staff", "center_owner", "center_admin", "super_admin"]);
  const data = await getTodayBookings();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <ReceptionClient {...data} />
      <Footer />
    </div>
  );
}
