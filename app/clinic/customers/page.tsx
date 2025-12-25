import { createServerClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/supabase/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CustomersClient } from "./customers-client"

export default async function CustomersPage() {
  // Authentication check - allow sales_staff, clinic_admin, clinic_owner, super_admin
  const user = await requireRole(['sales_staff', 'clinic_admin', 'clinic_owner', 'super_admin'])
  const supabase = await createServerClient()

  // Query customers data with their latest booking
  const { data: customersData, error: customersError } = await supabase
    .from('customers')
    .select(`
      *,
      latest_booking:bookings(
        id,
        booking_date,
        treatment_type,
        payment_amount,
        status
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (customersError) {
    console.error('Error fetching customers:', customersError)
  }

  // Calculate stats
  const { count: totalCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })

  const { count: hotLeads } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('lead_status', 'hot')

  const { count: warmLeads } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('lead_status', 'warm')

  const { count: newLeads } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('lead_status', 'new')

  // Get customers with bookings (converted)
  const { count: convertedCount } = await supabase
    .from('bookings')
    .select('customer_id', { count: 'exact', head: true })
    .not('customer_id', 'is', null)

  const stats = {
    total: totalCount || 0,
    hot: hotLeads || 0,
    warm: warmLeads || 0,
    new: newLeads || 0,
    converted: convertedCount || 0,
  }

  // Transform data
  const customers = (customersData || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    lead_status: c.lead_status,
    lead_score: c.lead_score,
    last_activity_at: c.last_activity_at,
    created_at: c.created_at,
    source: c.source,
    tags: c.tags,
    notes: c.notes,
    latest_booking: c.latest_booking?.[0] || null,
  }))

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <CustomersClient initialCustomers={customers} initialStats={stats} />
      <Footer />
    </div>
  )
}
