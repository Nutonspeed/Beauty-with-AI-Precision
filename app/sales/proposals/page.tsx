import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createServerClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/supabase-auth"
import { ProposalsClient } from "./proposals-client"

// Type for database proposal with lead JOIN
type DatabaseProposal = {
  id: string
  lead_id: string
  title: string
  status: string
  total_value: number
  sent_at: string | null
  valid_until: string | null
  treatments: any[] // JSONB array
  win_probability: number
  created_at: string
  sales_leads: {
    name: string
  } | null
}

async function getProposals() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  const { data: proposals, error } = await supabase
    .from('sales_proposals')
    .select(`
      *,
      sales_leads (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Proposals] Error fetching proposals:', error)
    return []
  }

  return proposals as DatabaseProposal[]
}

async function getProposalsStats() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { total: 0, draft: 0, sent: 0, viewed: 0, accepted: 0, rejected: 0, totalValue: 0 }
  }

  const { data: proposals } = await supabase
    .from('sales_proposals')
    .select('status, total_value')

  if (!proposals) {
    return { total: 0, draft: 0, sent: 0, viewed: 0, accepted: 0, rejected: 0, totalValue: 0 }
  }

  return {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === 'draft').length,
    sent: proposals.filter((p) => p.status === 'sent').length,
    viewed: proposals.filter((p) => p.status === 'viewed').length,
    accepted: proposals.filter((p) => p.status === 'accepted').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
    totalValue: proposals.reduce((sum, p) => sum + (Number(p.total_value) || 0), 0),
  }
}

export default async function ProposalsPage() {
  // Require sales or admin role
  await requireRole(['sales_staff', 'super_admin'])
  
  // Fetch data server-side
  const [initialProposals, stats] = await Promise.all([
    getProposals(),
    getProposalsStats()
  ])

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <ProposalsClient initialProposals={initialProposals} initialStats={stats} />
      <Footer />
    </div>
  )
}
