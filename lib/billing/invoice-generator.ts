import { jsPDF } from 'jspdf'

export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  clinic: {
    id: string
    name: string
    address?: string
    phone?: string
    email?: string
    taxId?: string
  }
  billingPeriod: {
    start: string
    end: string
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    amount: number
  }>
  subtotal: number
  tax: number
  total: number
  notes?: string
}

export interface Invoice {
  id: string
  clinic_id: string
  invoice_number: string
  billing_period_start: string
  billing_period_end: string
  amount: number
  tax: number
  total: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_at: string | null
  created_at: string
  metadata?: Record<string, any>
}

/**
 * Generate invoice number
 * Format: INV-YYYYMM-XXXXX
 */
export function generateInvoiceNumber(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 99999)).padStart(5, '0')
  return `INV-${year}${month}-${random}`
}

/**
 * Calculate invoice totals
 */
export function calculateInvoice(
  subscriptionPrice: number,
  usageCharges: number = 0,
  taxRate: number = 0.07 // 7% VAT in Thailand
) {
  const subtotal = subscriptionPrice + usageCharges
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return {
    subtotal,
    tax,
    total,
  }
}

/**
 * Generate PDF invoice
 */
export function generateInvoicePDF(data: InvoiceData): Blob {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Header
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 15

  // Company Info (Your Company)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Beauty with AI Precision', 14, yPosition)
  yPosition += 5
  doc.setFont('helvetica', 'normal')
  doc.text('123 Technology Park, Bangkok 10110', 14, yPosition)
  yPosition += 5
  doc.text('Tel: +66-2-123-4567', 14, yPosition)
  yPosition += 5
  doc.text('Email: billing@beautyai.com', 14, yPosition)
  yPosition += 5
  doc.text('Tax ID: 0123456789012', 14, yPosition)

  // Invoice Details (Right side)
  let rightX = pageWidth - 70
  yPosition = 35
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice Number:', rightX, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(data.invoiceNumber, rightX + 35, yPosition)
  
  yPosition += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice Date:', rightX, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date(data.invoiceDate).toLocaleDateString('en-US'), rightX + 35, yPosition)
  
  yPosition += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Due Date:', rightX, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date(data.dueDate).toLocaleDateString('en-US'), rightX + 35, yPosition)

  yPosition += 15

  // Bill To
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', 14, yPosition)
  yPosition += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(data.clinic.name, 14, yPosition)
  yPosition += 5
  doc.setFont('helvetica', 'normal')
  if (data.clinic.address) {
    doc.text(data.clinic.address, 14, yPosition)
    yPosition += 5
  }
  if (data.clinic.phone) {
    doc.text(`Tel: ${data.clinic.phone}`, 14, yPosition)
    yPosition += 5
  }
  if (data.clinic.email) {
    doc.text(`Email: ${data.clinic.email}`, 14, yPosition)
    yPosition += 5
  }
  if (data.clinic.taxId) {
    doc.text(`Tax ID: ${data.clinic.taxId}`, 14, yPosition)
    yPosition += 5
  }

  // Billing Period
  yPosition += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Billing Period:', 14, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${new Date(data.billingPeriod.start).toLocaleDateString('en-US')} - ${new Date(data.billingPeriod.end).toLocaleDateString('en-US')}`,
    50,
    yPosition
  )

  yPosition += 10

  // Table Header
  doc.setFillColor(66, 66, 66)
  doc.rect(14, yPosition, pageWidth - 28, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('Description', 16, yPosition + 5.5)
  doc.text('Qty', pageWidth - 80, yPosition + 5.5)
  doc.text('Unit Price', pageWidth - 60, yPosition + 5.5)
  doc.text('Amount', pageWidth - 30, yPosition + 5.5, { align: 'right' })

  yPosition += 10
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')

  // Table Items
  data.items.forEach((item) => {
    doc.text(item.description, 16, yPosition)
    doc.text(item.quantity.toString(), pageWidth - 80, yPosition)
    doc.text(`฿${item.unitPrice.toLocaleString()}`, pageWidth - 60, yPosition)
    doc.text(`฿${item.amount.toLocaleString()}`, pageWidth - 16, yPosition, { align: 'right' })
    yPosition += 7
  })

  // Totals
  yPosition += 5
  const totalsX = pageWidth - 70

  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', totalsX, yPosition)
  doc.text(`฿${data.subtotal.toLocaleString()}`, pageWidth - 16, yPosition, { align: 'right' })
  
  yPosition += 7
  doc.text('VAT (7%):', totalsX, yPosition)
  doc.text(`฿${data.tax.toLocaleString()}`, pageWidth - 16, yPosition, { align: 'right' })
  
  yPosition += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Total:', totalsX, yPosition)
  doc.text(`฿${data.total.toLocaleString()}`, pageWidth - 16, yPosition, { align: 'right' })

  // Notes
  if (data.notes) {
    yPosition += 15
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Notes:', 14, yPosition)
    yPosition += 5
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(data.notes, pageWidth - 28)
    doc.text(lines, 14, yPosition)
  }

  // Footer
  yPosition = pageHeight - 20
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text(
    'Thank you for your business! Please make payment within 30 days of invoice date.',
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  )

  return doc.output('blob')
}

/**
 * Format Thai Baht currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount)
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  return (
    invoice.status === 'pending' &&
    new Date(invoice.due_date) < new Date()
  )
}

/**
 * Calculate days until due or days overdue
 */
export function getDaysUntilDue(dueDate: string): number {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}
