/**
 * Invoice API Routes
 * Handles invoice creation, management, and PDF generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InvoiceGenerator } from '@/lib/payment/invoice-generator'
import { generateInvoiceNumber } from '@/lib/utils/invoice-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const customerId = searchParams.get('customer_id')
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('invoices')
      .select(`
        *,
        customers!invoices_customer_id_fkey (
          full_name,
          email
        ),
        clinics!invoices_clinic_id_fkey (
          name
        )
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (startDate) {
      query = query.gte('issue_date', startDate)
    }

    if (endDate) {
      query = query.lte('issue_date', endDate)
    }

    const { data: invoices, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      invoices,
      total: count,
      limit,
      offset,
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { type, ...data } = body

    switch (type) {
      case 'create_invoice':
        return await createInvoice(data)
      
      case 'generate_invoice_pdf':
        return await generateInvoicePDF(data)
      
      case 'send_invoice_email':
        return await sendInvoiceEmail(data)
      
      default:
        return NextResponse.json(
          { error: 'Invalid invoice operation' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error processing invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createInvoice(data: {
  customer_id: string
  appointment_id?: string
  items: Array<{
    service_id?: string
    description: string
    quantity: number
    unit_price: number
    discount_percent?: number
  }>
  discount_amount?: number
  tax_rate?: number
  issue_date?: string
  due_date?: string
  notes?: string
  payment_terms?: string
}) {
  const supabase = await createClient()
  
  // Get clinic ID from auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get user's clinic
  const { data: userData } = await supabase
    .from('users')
    .select('clinic_id')
    .eq('id', user.id)
    .single()

  if (!userData?.clinic_id) {
    return NextResponse.json(
      { error: 'Clinic not found' },
      { status: 404 }
    )
  }

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber(userData.clinic_id)

  // Calculate totals
  let subtotal = 0
  const lineItems = data.items.map(item => {
    const total = item.quantity * item.unit_price
    const discount = total * (item.discount_percent || 0) / 100
    const finalTotal = total - discount
    subtotal += finalTotal
    
    return {
      ...item,
      total: finalTotal,
    }
  })

  const discountAmount = data.discount_amount || 0
  const taxRate = data.tax_rate || 7
  const taxAmount = Math.round((subtotal - discountAmount) * taxRate / 100 * 100) / 100
  const totalAmount = subtotal - discountAmount + taxAmount

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      clinic_id: userData.clinic_id,
      customer_id: data.customer_id,
      appointment_id: data.appointment_id,
      subtotal,
      discount_amount: discountAmount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      issue_date: data.issue_date || new Date().toISOString().split('T')[0],
      due_date: data.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: data.notes,
      payment_terms: data.payment_terms,
      status: 'draft',
    })
    .select()
    .single()

  if (invoiceError) {
    return NextResponse.json(
      { error: invoiceError.message },
      { status: 500 }
    )
  }

  // Create line items
  const { error: itemsError } = await supabase
    .from('invoice_line_items')
    .insert(
      lineItems.map(item => ({
        invoice_id: invoice.id,
        service_id: item.service_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        total: item.total,
      }))
    )

  if (itemsError) {
    // Rollback invoice creation
    await supabase.from('invoices').delete().eq('id', invoice.id)
    return NextResponse.json(
      { error: itemsError.message },
      { status: 500 }
    )
  }

  // Update appointment if linked
  if (data.appointment_id) {
    await supabase
      .from('appointments')
      .update({ invoice_id: invoice.id })
      .eq('id', data.appointment_id)
  }

  return NextResponse.json({
    success: true,
    invoice,
  })
}

async function generateInvoicePDF(data: { invoice_id: string }) {
  try {
    const pdfBuffer = await InvoiceGenerator.generatePDF(data.invoice_id)
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${data.invoice_id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

async function sendInvoiceEmail(data: { 
  invoice_id: string
  to?: string
  subject?: string
  message?: string
}) {
  try {
    await InvoiceGenerator.sendInvoiceEmail(
      data.invoice_id,
      data.to
    )

    // Update invoice status
    const supabase = await createClient()
    await supabase
      .from('invoices')
      .update({ status: 'sent' })
      .eq('id', data.invoice_id)

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    )
  }
}
