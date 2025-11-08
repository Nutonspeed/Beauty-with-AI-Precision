import { checkUserRole } from "@/lib/auth/check-role"
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client"

export default async function AdminDashboard() {
  await checkUserRole(["admin"])

  const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/stats`, {
    cache: "no-store",
  })
  const statsData = await statsResponse.json()
  const stats = statsData.success ? statsData.stats : null

  const bookingsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/bookings`,
    {
      cache: "no-store",
    },
  )
  const bookingsData = await bookingsResponse.json()
  const bookings = bookingsData.success ? bookingsData.bookings : []

  return <AdminDashboardClient stats={stats} bookings={bookings} />
}
