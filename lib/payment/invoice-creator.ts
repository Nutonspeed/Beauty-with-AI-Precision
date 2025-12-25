/**
 * Invoice Creator Helper
 * Creates invoices for appointments automatically
 */

import { createClient } from '@/lib/supabase/server'
import { generateInvoiceNumber } from '@/lib/utils/invoice-utils'

export async function createInvoiceForAppointment(
  appointmentId: string,
  serviceData: { id: string; name: string; price: number },
  customerData: { id: string; full_name: string },
  clinicId: string
) {
  const supabase = await createClient()

  try {
    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(clinicId)

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        clinic_id: clinicId,
        customer_id: customerData.id,
        appointment_id: appointmentId,
        subtotal: serviceData.price,
        discount_amount: 0,
        tax_rate: 7,
        tax_amount: Math.round(serviceData.price * 0.07 * 100) / 100,
        total_amount: Math.round(serviceData.price * 1.07 * 100) / 100,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      return null
    }

    // Create line item
    const { error: itemError } = await supabase
      .from('invoice_line_items')
      .insert({
        invoice_id: invoice.id,
        service_id: serviceData.id,
        description: serviceData.name,
        quantity: 1,
        unit_price: serviceData.price,
        discount_percent: 0,
        total: serviceData.price,
      })

    if (itemError) {
      console.error('Error creating invoice line item:', itemError)
      // Rollback invoice
      await supabase.from('invoices').delete().eq('id', invoice.id)
      return null
    }

    // Update appointment with invoice_id
    await supabase
      .from('appointments')
      .update({ invoice_id: invoice.id })
      .eq('id', appointmentId)

    return {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      total_amount: invoice.total_amount,
      status: invoice.status,
    }

  } catch (error) {
    console.error('Error in createInvoiceForAppointment:', error)
    return null
  }
}
