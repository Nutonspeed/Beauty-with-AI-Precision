import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

/**
 * GET /api/sales/email-tracking - Get email tracking data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const emailId = searchParams.get('email_id')
    const leadId = searchParams.get('lead_id')

    if (!emailId && !leadId) {
      return NextResponse.json(
        { error: "Either email_id or lead_id is required" },
        { status: 400 }
      )
    }

    if (emailId) {
      const { data, error } = await supabase
        .from('sales_email_tracking')
        .select(`
          *,
          lead:sales_leads(id, name, email, phone),
          sender:users!sales_email_tracking_sender_id_fkey(id, email, full_name)
        `)
        .eq('id', emailId)
        .single()
      
      if (error) {
        console.error('[email-tracking] Error fetching email:', error)
        return NextResponse.json(
          { error: "Failed to fetch email tracking data" },
          { status: 500 }
        )
      }
      return NextResponse.json(data)
    }

    const { data, error } = await supabase
      .from('sales_email_tracking')
      .select(`
        *,
        lead:sales_leads(id, name, email, phone),
        sender:users!sales_email_tracking_sender_id_fkey(id, email, full_name)
      `)
      .eq('lead_id', leadId!)
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('[email-tracking] Error fetching emails:', error)
      return NextResponse.json(
        { error: "Failed to fetch email tracking data" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      emails: emailId ? data : (data || []),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[email-tracking] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sales/email-tracking - Track sent email
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      lead_id,
      template_id,
      subject,
      content,
      recipient_email,
      cc = [],
      bcc = []
    } = body

    if (!lead_id || !subject || !content || !recipient_email) {
      return NextResponse.json(
        { error: "lead_id, subject, content, and recipient_email are required" },
        { status: 400 }
      )
    }

    // Verify lead exists
    const { data: lead, error: leadError } = await supabase
      .from('sales_leads')
      .select('id, sales_user_id')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      )
    }

    // Create tracking record
    const { data: tracking, error: trackingError } = await supabase
      .from('sales_email_tracking')
      .insert({
        lead_id,
        sender_id: user.id,
        template_id,
        subject,
        content,
        recipient_email,
        cc: cc.length > 0 ? cc : null,
        bcc: bcc.length > 0 ? bcc : null,
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .select()
      .single()

    if (trackingError || !tracking) {
      console.error('[email-tracking] Error creating tracking:', trackingError)
      return NextResponse.json(
        { error: "Failed to create email tracking record" },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('sales_activities').insert({
      lead_id,
      sales_user_id: user.id,
      type: 'email',
      subject: `Email Sent: ${subject}`,
      description: `Email sent to ${recipient_email}`,
      metadata: {
        email_id: tracking.id,
        recipient: recipient_email
      }
    })

    return NextResponse.json({
      success: true,
      tracking,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[email-tracking] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/sales/email-tracking - Update email tracking (open, click, bounce)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const body = await request.json()
    const { email_id, event_type, link_url } = body

    if (!email_id || !event_type) {
      return NextResponse.json(
        { error: "email_id and event_type are required" },
        { status: 400 }
      )
    }

    const updates: any = {}
    const now = new Date().toISOString()

    switch (event_type) {
      case 'opened':
        updates.opened_at = now
        updates.open_count = supabase.rpc('increment', { x: 1 })
        updates.status = 'opened'
        break
      case 'clicked':
        updates.clicked_at = now
        updates.click_count = supabase.rpc('increment', { x: 1 })
        updates.status = 'clicked'
        if (link_url) {
          updates.clicked_links = supabase.rpc('array_append', {
            arr: 'clicked_links',
            elem: { url: link_url, clicked_at: now }
          })
        }
        break
      case 'bounced':
        updates.bounced_at = now
        updates.status = 'bounced'
        break
      case 'replied':
        updates.replied_at = now
        updates.status = 'replied'
        break
      default:
        return NextResponse.json(
          { error: "Invalid event_type" },
          { status: 400 }
        )
    }

    const { error } = await supabase
      .from('sales_email_tracking')
      .update(updates)
      .eq('id', email_id)

    if (error) {
      console.error('[email-tracking] Error updating:', error)
      return NextResponse.json(
        { error: "Failed to update email tracking" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      event_type,
      timestamp: now
    })

  } catch (error) {
    console.error('[email-tracking] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
