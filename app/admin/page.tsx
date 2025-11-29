import { checkUserRole } from "@/lib/auth/check-role"
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client"

export default async function AdminDashboard() {
  try {
    // Skip role check for build time
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      // Build-time fallback
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p>Loading admin dashboard...</p>
        </div>
      )
    }

    await checkUserRole(["admin"])

    let stats = null
    let bookings = []

    try {
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/stats`, {
        cache: "no-store",
      })
      const statsData = await statsResponse.json()
      stats = statsData.success ? statsData.stats : null
    } catch (statsError) {
      console.error('[AdminDashboard] Stats fetch error:', statsError)
      stats = null
    }

    try {
      const bookingsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/bookings`,
        {
          cache: "no-store",
        },
      )
      const bookingsData = await bookingsResponse.json()
      bookings = bookingsData.success ? bookingsData.bookings : []
    } catch (bookingsError) {
      console.error('[AdminDashboard] Bookings fetch error:', bookingsError)
      bookings = []
    }

    return <AdminDashboardClient stats={stats} bookings={bookings} />
  } catch (error) {
    console.error('[AdminDashboard] Critical error:', error)
    // Build-time fallback instead of throwing error
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p>Admin dashboard is loading...</p>
        </div>
      )
    }
    // Redirect to login or show error page for runtime
    throw new Error('Admin dashboard failed to load')
  }
}
