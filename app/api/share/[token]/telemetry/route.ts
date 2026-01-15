
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

interface RouteContext {
  params: Promise<{
    token: string
  }>
}

/**
 * POST /api/share/[token]/telemetry
 * Record engagement metrics for a shared analysis report
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { duration_seconds, scroll_depth, interactions } = body

    if (!duration_seconds) {
      return NextResponse.json({ error: 'duration_seconds is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Find the analysis and lead associated with this token
    const { data: analysis, error: analysisError } = await supabase
      .from('skin_analyses')
      .select('id, user_id, sales_staff_id, center_id')
      .eq('share_token', token)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json({ error: 'Share token not found' }, { status: 404 })
    }

    // 2. Find the lead associated with this customer
    const { data: lead } = await supabase
      .from('sales_leads')
      .select('id, score, status, metadata')
      .eq('customer_user_id', analysis.user_id)
      .single()

    if (lead) {
      // 3. Update lead score based on engagement
      // Engagement multiplier: 
      // - 30+ seconds: +5
      // - 60+ seconds: +10
      // - 120+ seconds: +25 (Hot Lead Threshold)
      let scoreBoost = 0
      let isHot = false
      if (duration_seconds >= 120) {
        scoreBoost = 25
        isHot = true
      }
      else if (duration_seconds >= 60) scoreBoost = 10
      else if (duration_seconds >= 30) scoreBoost = 5

      if (scoreBoost > 0) {
        const newScore = Math.min(100, (lead.score || 0) + scoreBoost)
        const updateData: any = {
          score: newScore,
          last_contact_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            ...lead.metadata,
            last_engagement_duration: duration_seconds,
            last_engagement_type: 'report_view'
          }
        }

        // Auto-upgrade status if high engagement
        if (isHot && (!lead.status || lead.status === 'new')) {
          updateData.status = 'active'
        }

        await supabase
          .from('sales_leads')
          .update(updateData)
          .eq('id', lead.id)

        // 4. Create notification for sales staff if lead becomes "Hot"
        if (isHot && analysis.sales_staff_id) {
          // Add to sales activities for the feed
          await supabase.from('sales_activities').insert({
            sales_user_id: analysis.sales_staff_id,
            lead_id: lead.id,
            type: 'status_change',
            subject: 'Lead Synchronized to HOT',
            description: `High engagement detected: ${duration_seconds}s viewing time.`,
            metadata: {
              duration_seconds,
              scroll_depth,
              interactions,
              engagement_type: 'report_view'
            }
          })

          await supabase.from('notifications').insert({
            user_id: analysis.sales_staff_id,
            title: 'High Engagement Alert',
            content: `Customer associated with analysis node ${analysis.id.slice(0,8)} has spent over 2 minutes viewing the report. Lead score optimized to ${newScore}.`,
            type: 'lead_alert',
            metadata: {
              lead_id: lead.id,
              analysis_id: analysis.id,
              urgency: 'high'
            }
          })
        } else if (duration_seconds >= 30 && analysis.sales_staff_id) {
          // Log general report viewing activity
          await supabase.from('sales_activities').insert({
            sales_user_id: analysis.sales_staff_id,
            lead_id: lead.id,
            type: 'other',
            subject: 'Aesthetic Report Viewed',
            description: `Customer is analyzing report (Duration: ${duration_seconds}s).`,
            metadata: {
              duration_seconds,
              scroll_depth,
              interactions,
              engagement_type: 'report_view'
            }
          })
        }
      }
    }

    // 4. Record the telemetry event
    await supabase.from('share_engagement_logs').insert({
      share_token: token,
      analysis_id: analysis.id,
      duration_seconds,
      scroll_depth,
      interactions,
      recorded_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true, message: 'Telemetry recorded' })

  } catch (error) {
    console.error('Engagement Telemetry API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
