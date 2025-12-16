import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { canAccessSales } from "@/lib/auth/role-config"
import { sendEmail } from "@/lib/email/resend-service"

export const dynamic = 'force-dynamic'

/**
 * POST /api/sales/send-email
 * Send email to leads/customers
 * 
 * Body:
 * - to (required): Recipient email(s)
 * - subject (required): Email subject
 * - html (optional): Email HTML content (if not using template)
 * - template_id (optional): Email template ID from sales_email_templates
 * - variables (optional): Template variables for replacement
 * - lead_id (required): Lead ID for tracking
 * - cc (optional): CC email(s)
 * - bcc (optional): BCC email(s)
 * - reply_to (optional): Reply-to email
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

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()

    if (userErr || !userRow || !canAccessSales(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      to,
      subject,
      html,
      template_id,
      variables = {},
      lead_id,
      cc,
      bcc,
      reply_to
    } = body

    // Validate required fields
    if (!to || !subject || !lead_id) {
      return NextResponse.json(
        { error: "to, subject, and lead_id are required" },
        { status: 400 }
      )
    }

    if (!html && !template_id) {
      return NextResponse.json(
        { error: "Either html or template_id is required" },
        { status: 400 }
      )
    }

    let finalSubject = subject
    let finalHtml = html
    let templateData = null

    // If template_id provided, fetch template
    if (template_id) {
      const { data: template, error: templateError } = await supabase
        .from('sales_email_templates')
        .select('*')
        .eq('id', template_id)
        .eq('is_active', true)
        .single()

      if (templateError || !template) {
        return NextResponse.json(
          { error: "Template not found or inactive" },
          { status: 404 }
        )
      }

      templateData = template
      
      // Use template subject and content
      finalSubject = template.subject
      finalHtml = template.content
    }

    // Send email
    let result
    if (template_id && Object.keys(variables).length > 0) {
      // Send with template variables
      result = await sendEmail({
        to,
        subject: finalSubject,
        html: finalHtml,
        cc,
        bcc,
        replyTo: reply_to
      });
    } else {
      // Send plain email
      result = await sendEmail({
        to,
        subject: finalSubject,
        html: finalHtml,
        cc,
        bcc,
        replyTo: reply_to
      })
    }

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      )
    }

    // Track in database
    const trackingData = {
      lead_id,
      sender_id: user.id,
      template_id: template_id || null,
      subject: finalSubject,
      content: finalHtml,
      recipient_email: Array.isArray(to) ? to[0] : to,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : null,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : null,
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        email_id: result.id,
        variables
      }
    }

    const { data: tracking, error: trackingError } = await supabase
      .from('sales_email_tracking')
      .insert(trackingData)
      .select('id')
      .single()

    if (trackingError) {
      console.error('[send-email] Failed to track email:', trackingError)
      // Don't fail the request if tracking fails
    }

    // Log as sales activity
    await supabase.from('sales_activities').insert({
      lead_id,
      sales_user_id: user.id,
      type: 'email',
      subject: `Email: ${finalSubject}`,
      description: `Sent email to ${Array.isArray(to) ? to.join(', ') : to}`,
      metadata: {
        tracking_id: tracking?.id,
        email_id: result.id,
        template_id
      }
    })

    return NextResponse.json({
      success: true,
      email_id: result.id,
      tracking_id: tracking?.id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[send-email] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
