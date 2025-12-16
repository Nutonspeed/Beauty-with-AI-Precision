import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { canAccessSales } from "@/lib/auth/role-config"

export const dynamic = 'force-dynamic'

/**
 * GET /api/sales/email-templates - Get email templates
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

    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()

    if (userErr || !userRow || !canAccessSales(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const templateId = searchParams.get('template_id')
    const category = searchParams.get('category')

    if (templateId) {
      const { data, error } = await supabase
        .from('sales_email_templates')
        .select('*')
        .eq('id', templateId)
        .single()
      
      if (error) {
        console.error('[email-templates] Error fetching template:', error)
        return NextResponse.json(
          { error: "Failed to fetch email template" },
          { status: 500 }
        )
      }
      return NextResponse.json({
        templates: data,
        timestamp: new Date().toISOString()
      })
    }

    let query = supabase
      .from('sales_email_templates')
      .select('*')
      .order('name', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('[email-templates] Error fetching templates:', error)
      return NextResponse.json(
        { error: "Failed to fetch email templates" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      templates: templateId ? data : (data || []),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[email-templates] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sales/email-templates - Create new email template
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
      name,
      subject,
      content,
      category = 'general',
      variables = [],
      is_active = true
    } = body

    if (!name || !subject || !content) {
      return NextResponse.json(
        { error: "name, subject, and content are required" },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabase
      .from('sales_email_templates')
      .insert({
        name,
        subject,
        content,
        category,
        variables,
        is_active,
        created_by: user.id
      })
      .select()
      .single()

    if (error || !template) {
      console.error('[email-templates] Error creating template:', error)
      return NextResponse.json(
        { error: "Failed to create email template" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      template,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[email-templates] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sales/email-templates - Update email template
 */
export async function PUT(request: NextRequest) {
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
    const { template_id, ...updates } = body

    if (!template_id) {
      return NextResponse.json(
        { error: "template_id is required" },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabase
      .from('sales_email_templates')
      .update(updates)
      .eq('id', template_id)
      .select()
      .single()

    if (error) {
      console.error('[email-templates] Error updating template:', error)
      return NextResponse.json(
        { error: "Failed to update email template" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      template,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[email-templates] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sales/email-templates - Delete email template
 */
export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const templateId = searchParams.get('template_id')

    if (!templateId) {
      return NextResponse.json(
        { error: "template_id is required" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('sales_email_templates')
      .delete()
      .eq('id', templateId)

    if (error) {
      console.error('[email-templates] Error deleting template:', error)
      return NextResponse.json(
        { error: "Failed to delete email template" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[email-templates] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
