/**
 * Invoice Utility Functions
 * Helper functions for invoice numbering and calculations
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Generate unique invoice number for a clinic
 * Format: INV-YYYY-NNNNN (e.g., INV-2025-00001)
 */
export async function generateInvoiceNumber(clinicId: string): Promise<string> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('generate_invoice_number', { clinic_id_param: clinicId })
  
  if (error) {
    console.error('Error generating invoice number:', error)
    // Fallback to simple format
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
    return `INV-${year}-${random}`
  }
  
  return data
}

/**
 * Calculate tax amount
 */
export function calculateTaxAmount(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * taxRate / 100 * 100) / 100
}

/**
 * Calculate line item total with discount
 */
export function calculateLineItemTotal(
  quantity: number,
  unitPrice: number,
  discountPercent: number = 0
): number {
  const subtotal = quantity * unitPrice
  const discount = subtotal * discountPercent / 100
  return Math.round((subtotal - discount) * 100) / 100
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'THB'): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Get invoice status color
 */
export function getInvoiceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'gray',
    sent: 'blue',
    paid: 'green',
    overdue: 'red',
    cancelled: 'gray',
    refunded: 'orange',
  }
  return colors[status] || 'gray'
}

/**
 * Get invoice status text in Thai
 */
export function getInvoiceStatusText(status: string): string {
  const texts: Record<string, string> = {
    draft: 'ฉบับร่าง',
    sent: 'ส่งแล้ว',
    paid: 'ชำระแล้ว',
    overdue: 'ค้างชำระ',
    cancelled: 'ยกเลิก',
    refunded: 'คืนเงินแล้ว',
  }
  return texts[status] || status
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(dueDate: string, status: string): boolean {
  if (status === 'paid' || status === 'cancelled' || status === 'refunded') {
    return false
  }
  return new Date(dueDate) < new Date()
}

/**
 * Calculate days until due
 */
export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Generate receipt number
 * Format: REC-YYYY-NNNNN
 */
export async function generateReceiptNumber(clinicId: string): Promise<string> {
  const supabase = await createClient()
  const year = new Date().getFullYear()
  
  const { data, error } = await supabase
    .from('payments')
    .select('transaction_id')
    .like('transaction_id', `REC-${year}-%`)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
  
  let seqNum = 1
  if (!error && data && data.length > 0) {
    const lastReceipt = data[0].transaction_id
    const lastNum = parseInt(lastReceipt.split('-')[2])
    seqNum = lastNum + 1
  }
  
  return `REC-${year}-${seqNum.toString().padStart(5, '0')}`
}

/**
 * Validate invoice data
 */
export function validateInvoiceData(data: {
  customer_id: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
  }>
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.customer_id) {
    errors.push('Customer is required')
  }
  
  if (!data.items || data.items.length === 0) {
    errors.push('At least one item is required')
  } else {
    data.items.forEach((item, index) => {
      if (!item.description) {
        errors.push(`Item ${index + 1}: Description is required`)
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
      }
      if (!item.unit_price || item.unit_price < 0) {
        errors.push(`Item ${index + 1}: Unit price must be 0 or greater`)
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
