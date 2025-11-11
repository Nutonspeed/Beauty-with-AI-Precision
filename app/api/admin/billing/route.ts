import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateInvoiceNumber,
  calculateInvoice,
  generateInvoicePDF,
  type InvoiceData,
  type Invoice,
} from '@/lib/billing/invoice-generator'

const SUBSCRIPTION_PLANS = {
  starter: { name: 'Starter', price: 2900 },
  professional: { name: 'Professional', price: 9900 },
  enterprise: { name: 'Enterprise', price: 29900 },
} as const

// GET: List all invoices or get specific invoice
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('id')
    const clinicId = searchParams.get('clinicId')
    const status = searchParams.get('status')

    // If requesting specific invoice
    if (invoiceId) {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(
          `
          *,
          clinics (
            id,
            name,
            slug,
            settings
          )
        `
        )
        .eq('id', invoiceId)
        .single()

      if (error) {
        console.error('Error fetching invoice:', error)
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }

      return NextResponse.json({ invoice })
    }

    // List invoices with filters
    let query = supabase
      .from('invoices')
      .select(
        `
        *,
        clinics (
          id,
          name,
          slug,
          subscription_plan
        )
      `
      )
      .order('created_at', { ascending: false })

    if (clinicId) {
      query = query.eq('clinic_id', clinicId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: invoices, error } = await query

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }

    // Check for overdue invoices
    const enrichedInvoices = invoices.map((invoice) => {
      const isOverdue =
        invoice.status === 'pending' && new Date(invoice.due_date) < new Date()
      
      return {
        ...invoice,
        isOverdue,
      }
    })

    return NextResponse.json({ invoices: enrichedInvoices })
  } catch (error) {
    console.error('Error in GET /api/admin/billing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create new invoice or generate for clinic
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { clinicId, billingPeriodStart, billingPeriodEnd } = body

    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic ID is required' }, { status: 400 })
    }

    // Get clinic details
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', clinicId)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    // Calculate billing period (default to current month)
    const periodStart = billingPeriodStart
      ? new Date(billingPeriodStart)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    
    const periodEnd = billingPeriodEnd
      ? new Date(billingPeriodEnd)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    // Get subscription plan
    const plan = SUBSCRIPTION_PLANS[clinic.subscription_plan as keyof typeof SUBSCRIPTION_PLANS]
    
    if (!plan) {
      return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 })
    }

    // Calculate invoice
    const { subtotal, tax, total } = calculateInvoice(plan.price)

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber()

    // Due date: 30 days from invoice date
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    // Create invoice in database
    const { data: invoice, error: insertError } = await supabase
      .from('invoices')
      .insert({
        clinic_id: clinicId,
        invoice_number: invoiceNumber,
        billing_period_start: periodStart.toISOString(),
        billing_period_end: periodEnd.toISOString(),
        amount: subtotal,
        tax: tax,
        total: total,
        status: 'pending',
        due_date: dueDate.toISOString(),
        metadata: {
          plan: clinic.subscription_plan,
          planPrice: plan.price,
        },
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating invoice:', insertError)
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'invoice_created',
      resource_type: 'invoice',
      resource_id: invoice.id,
      metadata: {
        clinic_id: clinicId,
        invoice_number: invoiceNumber,
        total,
      },
    })

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error in POST /api/admin/billing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: Update invoice status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { invoiceId, status } = body

    if (!invoiceId || !status) {
      return NextResponse.json(
        { error: 'Invoice ID and status are required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    // If marking as paid, set paid_at
    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }

    const { data: invoice, error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating invoice:', updateError)
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'invoice_updated',
      resource_type: 'invoice',
      resource_id: invoiceId,
      metadata: {
        status,
        paid_at: updateData.paid_at,
      },
    })

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error in PATCH /api/admin/billing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Cancel invoice
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('id')

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // Update status to cancelled instead of deleting
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) {
      console.error('Error cancelling invoice:', error)
      return NextResponse.json({ error: 'Failed to cancel invoice' }, { status: 500 })
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'invoice_cancelled',
      resource_type: 'invoice',
      resource_id: invoiceId,
    })

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error in DELETE /api/admin/billing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
