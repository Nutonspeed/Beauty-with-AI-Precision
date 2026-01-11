import { createServerClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/supabase/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnalyticsClient } from "./analytics-client"
import { PageLayout } from "@/components/layouts/page-layout"

export default async function AnalyticsPage() {
  // Authentication check
  const user = await requireRole(['clinic_owner', 'super_admin'])
  const supabase = await createServerClient()

  // Get initial date range (last 30 days)
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  // Fetch initial overview stats
  const { data: bookings } = await supabase
    .from('bookings')
    .select('payment_amount, payment_status, booking_date, treatment_type')
    .gte('booking_date', startDate.toISOString())
    .lte('booking_date', endDate.toISOString())

  const { data: customers } = await supabase
    .from('customers')
    .select('id, created_at, lead_status')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const { data: staff } = await supabase
    .from('clinic_staff')
    .select('id, full_name, role, total_appointments, rating')
    .eq('status', 'active')

  // Calculate initial metrics
  const totalRevenue = (bookings || [])
    .filter((b: any) => b.payment_status === 'paid')
    .reduce((sum: number, b: any) => sum + (b.payment_amount || 0), 0)

  const totalBookings = bookings?.length || 0
  const newCustomers = customers?.length || 0
  const activeStaff = staff?.length || 0

  const initialData = {
    overview: {
      totalRevenue,
      totalBookings,
      newCustomers,
      activeStaff,
    },
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    }
  }

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col bg-muted/30">
        <Header />
        <AnalyticsClient initialData={initialData} />
        <Footer />
      </div>
    </PageLayout>
  )
}
