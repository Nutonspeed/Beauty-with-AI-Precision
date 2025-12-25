/**
 * Payment API Routes
 * Handles payment processing and management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StripeService } from '@/lib/payment/stripe-service'
import { InvoiceGenerator } from '@/lib/payment/invoice-generator'
import { generateInvoiceNumber } from '@/lib/utils/invoice-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const invoiceId = searchParams.get('invoice_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('payments')
      .select(`
        *,
        invoices!payments_invoice_id_fkey (
          invoice_number,
          customers!invoices_customer_id_fkey (
            full_name,
            email
          )
        )
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: payments, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payments,
      total: count,
      limit,
      offset,
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
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
      case 'create_payment_intent':
        return await createPaymentIntent(data)
      
      case 'create_checkout_session':
        return await createCheckoutSession(data)
      
      case 'record_cash_payment':
        return await recordCashPayment(data)
      
      case 'create_refund':
        return await createRefund(data)
      
      default:
        return NextResponse.json(
          { error: 'Invalid payment type' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createPaymentIntent(data: {
  invoice_id: string
  payment_method_id?: string
}) {
  const supabase = await createClient()
  
  // Get invoice details
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', data.invoice_id)
    .single()

  if (error || !invoice) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    )
  }

  if (invoice.status === 'paid') {
    return NextResponse.json(
      { error: 'Invoice already paid' },
      { status: 400 }
    )
  }

  // Create Stripe payment intent
  const paymentIntent = await StripeService.createPaymentIntent(
    data.invoice_id,
    invoice.total_amount
  )

  // Record pending payment
  await supabase.from('payments').insert({
    invoice_id: data.invoice_id,
    payment_method_id: data.payment_method_id,
    amount: invoice.total_amount,
    currency: 'thb',
    payment_type: 'full',
    transaction_id: paymentIntent.payment_intent_id,
    status: 'pending',
    metadata: { type: 'stripe_payment_intent' },
  })

  return NextResponse.json({
    success: true,
    client_secret: paymentIntent.client_secret,
    payment_intent_id: paymentIntent.payment_intent_id,
  })
}

async function createCheckoutSession(data: {
  invoice_id: string
  success_url: string
  cancel_url: string
}) {
  const supabase = await createClient()
  
  // Verify invoice exists
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', data.invoice_id)
    .single()

  if (error || !invoice) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    )
  }

  // Create Stripe checkout session
  const session = await StripeService.createCheckoutSession(
    data.invoice_id,
    data.success_url,
    data.cancel_url
  )

  // Update invoice status
  await supabase
    .from('invoices')
    .update({ status: 'sent' })
    .eq('id', data.invoice_id)

  return NextResponse.json({
    success: true,
    session_id: session.session_id,
    checkout_url: session.url,
  })
}

async function recordCashPayment(data: {
  invoice_id: string
  amount: number
  payment_date: string
  notes?: string
}) {
  const supabase = await createClient()
  
  // Verify invoice
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', data.invoice_id)
    .single()

  if (error || !invoice) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    )
  }

  // Record cash payment
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      invoice_id: data.invoice_id,
      amount: data.amount,
      currency: 'thb',
      payment_type: data.amount >= invoice.total_amount ? 'full' : 'partial',
      transaction_id: `CASH-${Date.now()}`,
      status: 'completed',
      metadata: {
        payment_method: 'cash',
        payment_date: data.payment_date,
        notes: data.notes,
      },
    })
    .select()
    .single()

  if (paymentError) {
    return NextResponse.json(
      { error: paymentError.message },
      { status: 500 }
    )
  }

  // Update invoice status if fully paid
  const totalPaid = await getTotalPaid(data.invoice_id)
  if (totalPaid >= invoice.total_amount) {
    await supabase
      .from('invoices')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', data.invoice_id)
  }

  return NextResponse.json({
    success: true,
    payment,
  })
}

async function createRefund(data: {
  payment_id: string
  amount?: number
  reason?: string
}) {
  const supabase = await createClient()
  
  // Get payment details
  const { data: payment, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', data.payment_id)
    .single()

  if (error || !payment) {
    return NextResponse.json(
      { error: 'Payment not found' },
      { status: 404 }
    )
  }

  if (payment.status !== 'completed') {
    return NextResponse.json(
      { error: 'Payment cannot be refunded' },
      { status: 400 }
    )
  }

  // Process refund
  let refundId: string | null = null
  
  if (payment.transaction_id?.startsWith('pi_')) {
    // Stripe refund
    const stripeRefund = await StripeService.createRefund(
      payment.transaction_id,
      data.amount,
      data.reason
    )
    refundId = stripeRefund.id
  }

  // Record refund
  const { data: refund, error: refundError } = await supabase
    .from('refunds')
    .insert({
      payment_id: data.payment_id,
      amount: data.amount || payment.amount,
      reason: data.reason,
      refund_id: refundId,
      status: 'completed',
    })
    .select()
    .single()

  if (refundError) {
    return NextResponse.json(
      { error: refundError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    refund,
  })
}

async function getTotalPaid(invoiceId: string): Promise<number> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', invoiceId)
    .eq('status', 'completed')

  return data?.reduce((sum, p) => sum + p.amount, 0) || 0
}
