import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoicePDF, type InvoiceData } from '@/lib/billing/invoice-generator'

const SUBSCRIPTION_PLANS = {
  starter: { name: 'Starter', price: 2900 },
  professional: { name: 'Professional', price: 9900 },
  enterprise: { name: 'Enterprise', price: 29900 },
} as const

// GET: Download invoice PDF
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

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // Get invoice with clinic details
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(
        `
        *,
        clinics (
          id,
          name,
          slug,
          settings,
          subscription_plan
        )
      `
      )
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const clinic = Array.isArray(invoice.clinics) ? invoice.clinics[0] : invoice.clinics

    // Get plan details
    const plan = SUBSCRIPTION_PLANS[clinic.subscription_plan as keyof typeof SUBSCRIPTION_PLANS]

    // Prepare invoice data for PDF
    const invoiceData: InvoiceData = {
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.created_at,
      dueDate: invoice.due_date,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        address: clinic.settings?.address,
        phone: clinic.settings?.phone,
        email: clinic.settings?.email,
        taxId: clinic.settings?.taxId,
      },
      billingPeriod: {
        start: invoice.billing_period_start,
        end: invoice.billing_period_end,
      },
      items: [
        {
          description: `${plan.name} Plan Subscription`,
          quantity: 1,
          unitPrice: plan.price,
          amount: plan.price,
        },
      ],
      subtotal: invoice.amount,
      tax: invoice.tax,
      total: invoice.total,
      notes: 'Payment is due within 30 days. Thank you for your business!',
    }

    // Generate PDF
    const pdfBlob = generateInvoicePDF(invoiceData)

    // Convert Blob to Buffer for Next.js response
    const buffer = await pdfBlob.arrayBuffer()

    // Return PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/admin/billing/download:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
