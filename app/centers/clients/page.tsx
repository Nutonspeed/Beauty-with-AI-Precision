import { createServerClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/supabase/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ClientsClient } from "./clients-client"

export default async function ClientsPage() {
  // Authentication check
  const user = await requireRole(['center_owner', 'super_admin'])
  const supabase = await createServerClient()

  // Query clients data with their latest booking
  const { data: clientsData, error: clientsError } = await supabase
    .from('customers')
    .select(`
      *,
      latest_booking:bookings(
        id,
        booking_date,
        program_type,
        payment_amount,
        status
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (clientsError) {
    console.error('Error fetching clients:', clientsError)
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

  // Get clients with bookings (converted)
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
  const clients = (clientsData || []).map((c: any) => ({
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
    latest_booking: c.latest_booking?.[0] ? {
      ...c.latest_booking[0],
      program_type: c.latest_booking[0].program_type
    } : null,
  }))

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <ClientsClient initialClients={clients} initialStats={stats} />
      <Footer />
    </div>
  )
}
