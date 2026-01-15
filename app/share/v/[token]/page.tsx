import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MilestoneShareView } from "@/components/share/milestone-share-view"
import { ComparisonShareView } from "@/components/share/comparison-share-view"
import { ShareReportView } from "@/components/share/share-report-view"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EngagementTelemetry } from "@/components/share/engagement-telemetry"

interface VerifiedSharePageProps {
  params: Promise<{
    token: string
  }>
}

export default async function VerifiedSharePage({ params }: VerifiedSharePageProps) {
  const { token } = await params

  const supabase = await createClient()

  // 1. Try to find in progress_milestones
  const { data: milestone } = await supabase
    .from('progress_milestones')
    .select(`
      *,
      center:centers!center_id (id, name, logo_url, brand_color, contact_phone, contact_email, address),
      customer:users!customer_id (id, full_name)
    `)
    .eq('share_token', token)
    .eq('is_shared', true)
    .single()

  if (milestone) {
    const centerRecord = milestone.center as any;
    const customerRecord = milestone.customer as any;
    const brandColor = centerRecord?.brand_color || "#2563eb";

    return (
      <MilestoneShareView 
        token={token}
        milestone={milestone}
        customerRecord={customerRecord}
        centerRecord={centerRecord}
        brandColor={brandColor}
      />
    )
  }

  // 2. Try to find in progress_comparisons
  const { data: comparison } = await supabase
    .from('progress_comparisons')
    .select(`
      *,
      center:centers!center_id (id, name, logo_url, brand_color, contact_phone),
      customer:users!customer_id (id, full_name),
      before_photo:progress_photos!before_photo_id (image_url, created_at),
      after_photo:progress_photos!after_photo_id (image_url, created_at)
    `)
    .eq('share_token', token)
    .eq('is_shared', true)
    .single()

  if (comparison) {
    const centerRecord = comparison.center as any;
    const customerRecord = milestone?.customer as any || comparison.customer as any;
    const brandColor = centerRecord?.brand_color || "#10b981";

    return (
      <ComparisonShareView 
        token={token}
        comparison={comparison}
        customerRecord={customerRecord}
        centerRecord={centerRecord}
        brandColor={brandColor}
      />
    )
  }

  // 3. Try to find in skin_analyses
  const { data: analysis } = await supabase
    .from('skin_analyses')
    .select(`
      *,
      center:centers!center_id (id, name, logo_url, brand_color, contact_phone, contact_email, address),
      sales_staff:users!sales_staff_id (id, full_name, email)
    `)
    .eq('share_token', token)
    .eq('is_shared', true)
    .single()

  if (!analysis) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <EngagementTelemetry shareToken={token} analysisId={analysis.id} />
      <Header />
      <main className="flex-1">
        <ShareReportView
          analysis={analysis}
          center={analysis.center}
          salesStaff={analysis.sales_staff}
          remainingDays={null}
        />
      </main>
      <Footer />
    </div>
  )
}

export async function generateMetadata({ params }: VerifiedSharePageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Check milestones first
  const { data: milestone } = await supabase
    .from('progress_milestones')
    .select('title, customer:users!customer_id(full_name)')
    .eq('share_token', token)
    .single()

  if (milestone) {
    const customerRecord = milestone.customer as any;
    return {
      title: `${customerRecord?.full_name || 'Explorer'}'s Aesthetic Achievement - CenterIQ`,
      description: `View achievement: ${milestone.title}`,
      robots: 'noindex, nofollow'
    }
  }

  // Check comparisons
  const { data: comparison } = await supabase
    .from('progress_comparisons')
    .select('improvement_overall, customer:users!customer_id(full_name)')
    .eq('share_token', token)
    .single()

  if (comparison) {
    const customerRecord = (comparison as any).customer;
    return {
      title: `${customerRecord?.full_name || 'Explorer'}'s Aesthetic Progress - CenterIQ`,
      description: `Skin improved by ${comparison.improvement_overall}%`,
      robots: 'noindex, nofollow'
    }
  }

  // Check analyses
  const { data: analysis } = await supabase
    .from('skin_analyses')
    .select('id, center:centers!center_id(name)')
    .eq('share_token', token)
    .single()

  if (analysis) {
    const centerRecord = (analysis as any).center;
    return {
      title: `Skin Analysis Report - ${centerRecord?.name || 'Center'}`,
      description: `View personalized skin analysis report`,
      robots: 'noindex, nofollow'
    }
  }

  return {
    title: 'Shared Achievement - CenterIQ',
    robots: 'noindex, nofollow'
  }
}

