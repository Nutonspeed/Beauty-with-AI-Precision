/**
 * Invoice Generator Service
 * Handles PDF invoice generation with professional Thai templates
 */

import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export interface InvoiceData {
  invoice: {
    id: string
    invoice_number: string
    issue_date: string
    due_date: string
    subtotal: number
    discount_amount: number
    tax_rate: number
    tax_amount: number
    total_amount: number
    status: string
    notes?: string
    payment_terms?: string
  }
  customer: {
    full_name: string
    email: string
    phone?: string
    address?: string
  }
  clinic: {
    name: string
    email: string
    phone: string
    address: string
    tax_id?: string
    branch?: string
  }
  line_items: Array<{
    description: string
    quantity: number
    unit_price: number
    discount_percent: number
    total: number
  }>
}

export class InvoiceGenerator {
  /**
   * Generate invoice data from database
   */
  static async getInvoiceData(invoiceId: string): Promise<InvoiceData> {
    const supabase = await createClient()

    // Get invoice with relations
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers!invoices_customer_id_fkey (
          full_name,
          email,
          phone,
          address
        ),
        clinics!invoices_clinic_id_fkey (
          name,
          email,
          phone,
          address,
          tax_id,
          branch
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      throw new Error(`Invoice not found: ${error?.message}`)
    }

    // Get line items
    const { data: lineItems, error: itemsError } = await supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at')

    if (itemsError) {
      throw new Error(`Failed to fetch line items: ${itemsError.message}`)
    }

    return {
      invoice: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        subtotal: invoice.subtotal,
        discount_amount: invoice.discount_amount,
        tax_rate: invoice.tax_rate,
        tax_amount: invoice.tax_amount,
        total_amount: invoice.total_amount,
        status: invoice.status,
        notes: invoice.notes,
        payment_terms: invoice.payment_terms,
      },
      customer: {
        full_name: invoice.customers.full_name,
        email: invoice.customers.email,
        phone: invoice.customers.phone,
        address: invoice.customers.address,
      },
      clinic: {
        name: invoice.clinics.name,
        email: invoice.clinics.email,
        phone: invoice.clinics.phone,
        address: invoice.clinics.address,
        tax_id: invoice.clinics.tax_id,
        branch: invoice.clinics.branch,
      },
      line_items: lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        total: item.total,
      })),
    }
  }

  /**
   * Generate HTML invoice template
   */
  static generateHTMLInvoice(data: InvoiceData): string {
    const { invoice, customer, clinic, line_items } = data

    return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ใบเสร็จ/ใบกำกับภาษี ${invoice.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Sarabun', 'Tahoma', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 20px;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #ddd;
      padding: 30px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .logo {
      flex: 1;
    }
    .logo h1 {
      font-size: 28px;
      color: #333;
      margin-bottom: 5px;
    }
    .logo p {
      color: #666;
      font-size: 14px;
    }
    .invoice-info {
      text-align: right;
      flex: 1;
    }
    .invoice-info h2 {
      font-size: 24px;
      margin-bottom: 10px;
      color: #333;
    }
    .invoice-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    .addresses {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .address-box {
      flex: 1;
      padding: 15px;
      border: 1px solid #ddd;
    }
    .address-box h3 {
      font-size: 16px;
      margin-bottom: 10px;
      color: #333;
    }
    .address-box p {
      margin: 5px 0;
      font-size: 14px;
    }
    .line-items {
      margin-bottom: 30px;
    }
    .line-items table {
      width: 100%;
      border-collapse: collapse;
    }
    .line-items th {
      background: #f5f5f5;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #ddd;
    }
    .line-items td {
      padding: 12px;
      border: 1px solid #ddd;
    }
    .line-items .text-right {
      text-align: right;
    }
    .line-items .text-center {
      text-align: center;
    }
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .totals table {
      width: 100%;
    }
    .totals td {
      padding: 8px;
      text-align: right;
    }
    .totals .total-row {
      font-weight: bold;
      font-size: 18px;
      border-top: 2px solid #333;
    }
    .notes {
      margin-top: 30px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 5px;
    }
    .notes h3 {
      font-size: 16px;
      margin-bottom: 10px;
    }
    .notes p {
      font-size: 14px;
      color: #666;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(0, 0, 0, 0.1);
      z-index: -1;
    }
    @media print {
      body { padding: 0; }
      .invoice { border: none; }
    }
  </style>
</head>
<body>
  ${invoice.status === 'paid' ? '<div class="watermark">PAID</div>' : ''}
  
  <div class="invoice">
    <div class="header">
      <div class="logo">
        <h1>${clinic.name}</h1>
        <p>${clinic.branch ? `สาขา${clinic.branch}` : ''}</p>
        <p>${clinic.address}</p>
        <p>โทร: ${clinic.phone}</p>
        <p>อีเมล: ${clinic.email}</p>
        ${clinic.tax_id ? `<p>เลขประจำตัวผู้เสียภาษี: ${clinic.tax_id}</p>` : ''}
      </div>
      
      <div class="invoice-info">
        <h2>ใบเสร็จ/ใบกำกับภาษี</h2>
        <p><strong>เลขที่:</strong> ${invoice.invoice_number}</p>
        <p><strong>วันที่:</strong> ${format(new Date(invoice.issue_date), 'd MMMM yyyy', { locale: th })}</p>
        <p><strong>วันครบกำหนด:</strong> ${format(new Date(invoice.due_date), 'd MMMM yyyy', { locale: th })}</p>
        <p><strong>สถานะ:</strong> ${this.getStatusText(invoice.status)}</p>
      </div>
    </div>
    
    <div class="addresses">
      <div class="address-box">
        <h3>รายละเอียดลูกค้า</h3>
        <p><strong>${customer.full_name}</strong></p>
        ${customer.address ? `<p>${customer.address}</p>` : ''}
        ${customer.phone ? `<p>โทร: ${customer.phone}</p>` : ''}
        <p>อีเมล: ${customer.email}</p>
      </div>
      
      <div class="address-box">
        <h3>ข้อมูลการชำระเงิน</h3>
        <p><strong>เงื่อนไขการชำระ:</strong></p>
        <p>${invoice.payment_terms || 'ชำระภายใน 30 วัน'}</p>
        <p><strong>วิธีการชำระ:</strong></p>
        <p>โอนเงิน / บัตรเครดิต / เงินสด</p>
      </div>
    </div>
    
    <div class="line-items">
      <table>
        <thead>
          <tr>
            <th width="50%">รายการ</th>
            <th width="10%" class="text-center">จำนวน</th>
            <th width="15%" class="text-right">ราคา/หน่วย</th>
            <th width="10%" class="text-center">ส่วนลด</th>
            <th width="15%" class="text-right">จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          ${line_items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">${item.unit_price.toFixed(2)}</td>
              <td class="text-center">${item.discount_percent > 0 ? item.discount_percent + '%' : '-'}</td>
              <td class="text-right">${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="totals">
      <table>
        <tr>
          <td>รวมเป็นเงิน:</td>
          <td>${invoice.subtotal.toFixed(2)}</td>
        </tr>
        ${invoice.discount_amount > 0 ? `
          <tr>
            <td>ส่วนลด:</td>
            <td>-${invoice.discount_amount.toFixed(2)}</td>
          </tr>
        ` : ''}
        <tr>
          <td>ภาษี ${invoice.tax_rate}%:</td>
          <td>${invoice.tax_amount.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>ยอดรวมทั้งสิ้น:</td>
          <td>${invoice.total_amount.toFixed(2)} บาท</td>
        </tr>
      </table>
    </div>
    
    ${invoice.notes ? `
      <div class="notes">
        <h3>หมายเหตุ</h3>
        <p>${invoice.notes}</p>
      </div>
    ` : ''}
    
    <div class="footer">
      <p>นี่คือใบเสร็จที่สร้างขึ้นโดยระบบ Beauty AI Precision</p>
      <p>ขอบคุณที่ใช้บริการ</p>
      <p>วันที่พิมพ์: ${format(new Date(), 'd MMMM yyyy HH:mm:ss', { locale: th })}</p>
    </div>
  </div>
</body>
</html>
    `
  }

  /**
   * Get status text in Thai
   */
  private static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      draft: 'ฉบับร่าง',
      sent: 'ส่งแล้ว',
      paid: 'ชำระแล้ว',
      overdue: 'ค้างชำระ',
      cancelled: 'ยกเลิก',
      refunded: 'คืนเงินแล้ว',
    }
    return statusMap[status] || status
  }

  /**
   * Generate PDF from HTML (using external service)
   */
  static async generatePDF(invoiceId: string): Promise<Buffer> {
    const data = await this.getInvoiceData(invoiceId)
    const html = this.generateHTMLInvoice(data)

    // For now, return HTML as buffer
    // In production, use Puppeteer or external PDF service
    return Buffer.from(html, 'utf-8')
  }

  /**
   * Save invoice to file system or storage
   */
  static async saveInvoicePDF(invoiceId: string): Promise<string> {
    const pdfBuffer = await this.generatePDF(invoiceId)
    const filename = `invoice-${invoiceId}.pdf`
    
    // TODO: Save to cloud storage (S3, Supabase Storage, etc.)
    // For now, return filename
    return filename
  }

  /**
   * Send invoice via email
   */
  static async sendInvoiceEmail(invoiceId: string, to?: string): Promise<void> {
    const data = await this.getInvoiceData(invoiceId)
    const { sendInvoiceEmail } = await import('@/lib/email/gmail-templates')
    
    await sendInvoiceEmail({
      to: to || data.customer.email,
      invoiceNumber: data.invoice.invoice_number,
      customerName: data.customer.full_name,
      totalAmount: data.invoice.total_amount,
      dueDate: data.invoice.due_date,
      downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceId}/download`,
    })
  }
}
