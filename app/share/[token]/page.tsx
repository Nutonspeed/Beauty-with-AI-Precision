import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ShareReportView } from "@/components/share/share-report-view"
import { getRemainingDays, isShareExpired } from "@/lib/utils/report-sharing"

interface SharePageProps {
  params: {
    token: string
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = params

  // Validate token format
  if (!/^[A-Za-z0-9_-]{32}$/.test(token)) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch analysis data using share token
  // RLS policy allows public access when is_shared=true AND (share_expires_at IS NULL OR share_expires_at > NOW())
  const { data: analysis, error } = await supabase
    .from('skin_analyses')
    .select(`
      *,
      clinic:clinics!clinic_id (
        id,
        name,
        logo_url,
        brand_color,
        contact_phone,
        contact_email,
        address
      ),
      sales_staff:sales_staff!sales_staff_id (
        full_name,
        email
      )
    `)
    .eq('share_token', token)
    .eq('is_shared', true)
    .single()

  if (error || !analysis) {
    console.error('[SharePage] Error fetching analysis:', error)
    notFound()
  }

  // Check if link expired
  if (analysis.share_expires_at && isShareExpired(new Date(analysis.share_expires_at))) {
    notFound()
  }

  // Track view asynchronously (fire and forget)
  const trackView = async () => {
    try {
      // Get request headers for tracking
      const headers = new Headers()
      
      // In production, these would be passed from middleware or edge function
      // For now, we'll track the view client-side via API route
      await fetch(`/api/share/${token}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('[SharePage] Error tracking view:', error)
      // Don't fail page load if tracking fails
    }
  }

  // Track view (non-blocking)
  trackView()

  // Calculate remaining days if expiry is set
  const remainingDays = analysis.share_expires_at 
    ? getRemainingDays(new Date(analysis.share_expires_at))
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <ShareReportView
        analysis={analysis}
        clinic={analysis.clinic}
        salesStaff={analysis.sales_staff}
        remainingDays={remainingDays}
      />
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SharePageProps) {
  const { token } = params
  const supabase = await createClient()

  const { data: analysis } = await supabase
    .from('skin_analyses')
    .select('clinic:clinics!clinic_id(name)')
    .eq('share_token', token)
    .single()

  const clinicName = analysis?.clinic?.name || 'Clinic'

  return {
    title: `Skin Analysis Report - ${clinicName}`,
    description: `View your personalized skin analysis report from ${clinicName}`,
    robots: 'noindex, nofollow', // Don't index share links
  }
}
