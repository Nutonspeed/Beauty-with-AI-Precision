/**
 * Stripe Payment Service
 * Handles Stripe integration for multi-tenant clinics
 */

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export interface StripePaymentIntent {
  client_secret: string
  payment_intent_id: string
}

export class StripeService {
  /**
   * Create a payment intent for an invoice
   */
  static async createPaymentIntent(
    invoiceId: string,
    amount: number,
    currency: string = 'thb'
  ): Promise<StripePaymentIntent> {
    const supabase = await createClient()
    
    // Get invoice details
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers!invoices_customer_id_fkey (
          email,
          full_name
        ),
        clinics!invoices_clinic_id_fkey (
          name
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      throw new Error(`Invoice not found: ${error?.message}`)
    }

    // Get Stripe configuration for clinic
    const { data: paymentMethod } = await supabase
      .from('payment_methods')
      .select('config')
      .eq('clinic_id', invoice.clinic_id)
      .eq('type', 'stripe')
      .eq('is_active', true)
      .single()

    if (!paymentMethod) {
      throw new Error('Stripe not configured for this clinic')
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        invoice_id: invoiceId,
        clinic_id: invoice.clinic_id,
        customer_id: invoice.customer_id,
        invoice_number: invoice.invoice_number,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: invoice.customers.email,
      description: `Invoice ${invoice.invoice_number} - ${invoice.clinics.name}`,
    })

    return {
      client_secret: paymentIntent.client_secret!,
      payment_intent_id: paymentIntent.id,
    }
  }

  /**
   * Confirm a payment intent
   */
  static async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
      return paymentIntent
    } catch (error) {
      throw new Error(`Failed to confirm payment: ${error}`)
    }
  }

  /**
   * Retrieve payment intent status
   */
  static async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent
    } catch (error) {
      throw new Error(`Failed to retrieve payment: ${error}`)
    }
  }

  /**
   * Create a refund
   */
  static async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
        reason: reason as Stripe.RefundCreateParams.Reason || 'requested_by_customer',
        metadata: {
          refunded_by: 'system',
        },
      })
      return refund
    } catch (error) {
      throw new Error(`Failed to create refund: ${error}`)
    }
  }

  /**
   * Create a checkout session for one-time payment
   */
  static async createCheckoutSession(
    invoiceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ session_id: string; url: string }> {
    const supabase = await createClient()
    
    // Get invoice details
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers!invoices_customer_id_fkey (
          email,
          full_name
        ),
        clinics!invoices_clinic_id_fkey (
          name
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      throw new Error(`Invoice not found: ${error?.message}`)
    }

    // Get line items
    const { data: lineItems } = await supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoiceId)

    if (!lineItems?.length) {
      throw new Error('No line items found for invoice')
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'promptpay'],
      line_items: lineItems.map(item => ({
        price_data: {
          currency: 'thb',
          product_data: {
            name: item.description,
            description: `Invoice ${invoice.invoice_number}`,
          },
          unit_amount: Math.round(item.unit_price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: invoice.customers.email,
      metadata: {
        invoice_id: invoiceId,
        clinic_id: invoice.clinic_id,
        customer_id: invoice.customer_id,
        invoice_number: invoice.invoice_number,
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    })

    return {
      session_id: session.id,
      url: session.url!,
    }
  }

  /**
   * Handle webhook events
   */
  static async handleWebhook(
    rawBody: string,
    signature: string,
    webhookSecret: string
  ): Promise<void> {
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error}`)
    }

    const supabase = await createClient()

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabase)
        break

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabase)
        break

      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  }

  private static async handlePaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
    supabase: any
  ): Promise<void> {
    const invoiceId = paymentIntent.metadata.invoice_id

    // Create payment record
    await supabase.from('payments').insert({
      invoice_id: invoiceId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      payment_type: 'full',
      transaction_id: paymentIntent.id,
      status: 'completed',
      gateway_response: paymentIntent,
      metadata: paymentIntent.metadata,
    })

    // Update invoice status
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
  }

  private static async handlePaymentFailed(
    paymentIntent: Stripe.PaymentIntent,
    supabase: any
  ): Promise<void> {
    const invoiceId = paymentIntent.metadata.invoice_id

    // Create failed payment record
    await supabase.from('payments').insert({
      invoice_id: invoiceId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      payment_type: 'full',
      transaction_id: paymentIntent.id,
      status: 'failed',
      gateway_response: paymentIntent,
      metadata: paymentIntent.metadata,
    })
  }

  private static async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
    supabase: any
  ): Promise<void> {
    const invoiceId = session.metadata?.invoice_id

    if (!invoiceId) return

    // Update invoice status
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)

    // Create payment record
    await supabase.from('payments').insert({
      invoice_id: invoiceId,
      amount: session.amount_total / 100,
      currency: session.currency.toUpperCase(),
      payment_type: 'full',
      transaction_id: session.payment_intent as string,
      status: 'completed',
      gateway_response: session,
      metadata: session.metadata,
    })
  }

  /**
   * Create a customer in Stripe
   */
  static async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      })
      return customer
    } catch (error) {
      throw new Error(`Failed to create Stripe customer: ${error}`)
    }
  }

  /**
   * Get payment methods for a customer
   */
  static async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      })
      return paymentMethods.data
    } catch (error) {
      throw new Error(`Failed to get payment methods: ${error}`)
    }
  }
}
