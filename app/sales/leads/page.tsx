 import { redirect } from "next/navigation"
 import { defaultLocale } from "@/i18n/request"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createServerClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/supabase-auth"
import { LeadsClient } from "./leads-client"

// Type for database lead
type DatabaseLead = {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  score: number
  source: string
  last_contact_at: string | null
  estimated_value: number
  primary_concern: string | null
}

async function getLeads() {
  const supabase = await createServerClient()
  
  // Get current user to filter by sales_user_id
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  const { data: leads, error } = await supabase
    .from('sales_leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Leads] Error fetching leads:', error)
    return []
  }

  return leads as DatabaseLead[]
}

async function getLeadsStats() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { total: 0, hot: 0, warm: 0, cold: 0 }
  }

  const { data: leads } = await supabase
    .from('sales_leads')
    .select('status')

  if (!leads) {
    return { total: 0, hot: 0, warm: 0, cold: 0 }
  }

  return {
    total: leads.length,
    hot: leads.filter((l) => l.status === 'hot').length,
    warm: leads.filter((l) => l.status === 'warm').length,
    cold: leads.filter((l) => l.status === 'cold').length,
  }
}

export default async function LeadsPage() {
  redirect(`/${defaultLocale}/sales/leads`)
  // Require sales or admin role
  await requireRole(['sales_staff', 'super_admin'])
  
  // Fetch data server-side
  const [initialLeads, stats] = await Promise.all([
    getLeads(),
    getLeadsStats()
  ])

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <LeadsClient initialLeads={initialLeads} initialStats={stats} />
      <Footer />
    </div>
  )
}
