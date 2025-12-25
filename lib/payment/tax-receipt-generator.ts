/**
 * Tax Receipt Generator
 * Generates Thai tax receipts with proper compliance
 */

import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface TaxReceiptData {
  id: string
  receipt_number: string
  issue_date: string
  receipt_date: string
  subtotal: number
  discount_amount: number
  vat_rate: number
  vat_amount: number
  total_amount: number
  seller_tax_id?: string
  buyer_tax_id?: string
  branch_code?: string
  notes?: string
  status: string
  signed_at?: string
  
  clinic: {
    name: string
    address: string
    phone: string
    email: string
    tax_id?: string
  }
  
  customer: {
    full_name: string
    address?: string
    tax_id?: string
  }
  
  line_items: Array<{
    description: string
    quantity: number
    unit_price: number
    discount_percent: number
    vat_rate: number
    vat_amount: number
    line_total: number
  }>
}

export class TaxReceiptGenerator {
  /**
   * Get tax receipt data
   */
  static async getTaxReceiptData(receiptId: string): Promise<TaxReceiptData> {
    const supabase = await createClient()
    
    // Get receipt details
    const { data: receipt, error } = await supabase
      .from('tax_receipts')
      .select(`
        *,
        clinics!tax_receipts_clinic_id_fkey (
          name,
          address,
          phone,
          email,
          tax_id
        ),
        customers!tax_receipts_customer_id_fkey (
          full_name,
          address,
          tax_id
        )
      `)
      .eq('id', receiptId)
      .single()
    
    if (error || !receipt) {
      throw new Error('Tax receipt not found')
    }
    
    // Get line items
    const { data: lineItems } = await supabase
      .from('tax_receipt_line_items')
      .select('*')
      .eq('tax_receipt_id', receiptId)
      .order('created_at')
    
    return {
      ...receipt,
      clinic: receipt.clinics,
      customer: receipt.customers,
      line_items: lineItems || []
    }
  }
  
  /**
   * Generate HTML tax receipt
   */
  static generateHTMLTaxReceipt(data: TaxReceiptData): string {
    const buddhistYear = new Date(data.issue_date).getFullYear() + 543
    
    return `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ใบเสร็จรับเงิน/ใบกำกับภาษี</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Sarabun', 'Prompt', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #000;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            margin-bottom: 5px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-section {
            border: 1px solid #ccc;
            padding: 10px;
        }
        .info-title {
            font-weight: bold;
            margin-bottom: 5px;
            text-decoration: underline;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }
        .receipt-number {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th,
        .items-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
        }
        .items-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .items-table .text-left {
            text-align: left;
        }
        .items-table .text-right {
            text-align: right;
        }
        .totals-section {
            margin-left: auto;
            width: 300px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .total-row.grand-total {
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 5px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
        }
        .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 100px;
            margin-top: 60px;
        }
        .signature-box {
            text-align: center;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            margin: 40px 0 5px;
        }
        .notes {
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        @media print {
            .container {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">ใบเสร็จรับเงิน / ใบกำกับภาษี</h1>
            <p class="subtitle">RECEIPT / TAX INVOICE</p>
        </div>
        
        <div class="receipt-number">
            เลขที่ ${data.receipt_number} / No. ${data.receipt_number}
        </div>
        
        <div class="info-grid">
            <div class="info-section">
                <div class="info-title">ผู้ขาย / SELLER</div>
                <div class="info-row">
                    <span>ชื่อ / Name:</span>
                    <span class="text-left">${data.clinic.name}</span>
                </div>
                <div class="info-row">
                    <span>ที่อยู่ / Address:</span>
                    <span class="text-left">${data.clinic.address}</span>
                </div>
                <div class="info-row">
                    <span>เลขประจำตัวผู้เสียภาษี:</span>
                    <span>${data.seller_tax_id || data.clinic.tax_id || '-'}</span>
                </div>
                <div class="info-row">
                    <span>สำนักงานใหญ่ / H.O.:</span>
                    <span>${data.clinic.address}</span>
                </div>
                <div class="info-row">
                    <span>โทร / Tel:</span>
                    <span>${data.clinic.phone}</span>
                </div>
                ${data.branch_code ? `
                <div class="info-row">
                    <span>สาขา / Branch:</span>
                    <span>${data.branch_code}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="info-section">
                <div class="info-title">ผู้ซื้อ / BUYER</div>
                <div class="info-row">
                    <span>ชื่อ / Name:</span>
                    <span class="text-left">${data.customer.full_name}</span>
                </div>
                <div class="info-row">
                    <span>ที่อยู่ / Address:</span>
                    <span class="text-left">${data.customer.address || '-'}</span>
                </div>
                <div class="info-row">
                    <span>เลขประจำตัวผู้เสียภาษี:</span>
                    <span>${data.buyer_tax_id || data.customer.tax_id || '-'}</span>
                </div>
                <div class="info-row">
                    <span>วันที่ / Date:</span>
                    <span>${format(new Date(data.receipt_date), 'd/M/')}${buddhistYear}</span>
                </div>
            </div>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th width="50">ลำดับ<br>No.</th>
                    <th class="text-left">รายการ / Description</th>
                    <th width="80">จำนวน<br>Qty</th>
                    <th width="100">ราคาต่อหน่วย<br>Unit Price</th>
                    <th width="80">ส่วนลด<br>Disc.%</th>
                    <th width="100">ภาษี<br>VAT</th>
                    <th width="120">จำนวนเงิน<br>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${data.line_items.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td class="text-left">${item.description}</td>
                    <td>${item.quantity}</td>
                    <td class="text-right">${item.unit_price.toFixed(2)}</td>
                    <td class="text-right">${item.discount_percent > 0 ? item.discount_percent.toFixed(2) : '-'}</td>
                    <td class="text-right">${item.vat_amount.toFixed(2)}</td>
                    <td class="text-right">${(item.line_total + item.vat_amount).toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals-section">
            <div class="total-row">
                <span>รวมเป็นเงิน / Subtotal:</span>
                <span>${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>ส่วนลด / Discount:</span>
                <span>${data.discount_amount.toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>ภาษีมูลค่าเพิ่ม ${data.vat_rate}% / VAT ${data.vat_rate}%:</span>
                <span>${data.vat_amount.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
                <span>จำนวนเงินทั้งสิ้น / TOTAL:</span>
                <span>${data.total_amount.toFixed(2)}</span>
            </div>
        </div>
        
        ${data.notes ? `
        <div class="notes">
            <strong>หมายเหตุ / Remarks:</strong> ${data.notes}
        </div>
        ` : ''}
        
        <div class="footer">
            <p>*** กรุณาตรวจสอบความถูกต้องก่อนกลับ / Please check before leaving ***</p>
            <p>ใบเสร็จนี้จะถือว่าหมดอายุหากไม่ได้แสดงภายใน 90 วัน / This receipt will be void if not presented within 90 days</p>
        </div>
        
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <p>ผู้จ่ายเงิน / Payer</p>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <p>ผู้รับเงิน / Receiver</p>
                <p style="font-size: 12px; margin-top: 5px;">(${data.clinic.name})</p>
            </div>
        </div>
    </div>
</body>
</html>
    `
  }
  
  /**
   * Generate PDF tax receipt (placeholder)
   */
  static async generatePDF(receiptId: string): Promise<Buffer> {
    // TODO: Implement PDF generation with Puppeteer or similar
    const data = await this.getTaxReceiptData(receiptId)
    const html = this.generateHTMLTaxReceipt(data)
    
    // For now, return HTML as buffer
    return Buffer.from(html, 'utf-8')
  }
  
  /**
   * Save tax receipt PDF
   */
  static async saveTaxReceiptPDF(receiptId: string): Promise<string> {
    const pdfBuffer = await this.generatePDF(receiptId)
    const data = await this.getTaxReceiptData(receiptId)
    
    // TODO: Save to cloud storage (S3, Supabase Storage, etc.)
    const filename = `tax-receipt-${data.receipt_number}.pdf`
    
    // For now, just return filename
    return filename
  }
  
  /**
   * Issue tax receipt
   */
  static async issueTaxReceipt(receiptId: string): Promise<void> {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('tax_receipts')
      .update({
        status: 'issued',
        signed_at: new Date().toISOString()
      })
      .eq('id', receiptId)
    
    if (error) {
      throw new Error('Failed to issue tax receipt')
    }
  }
  
  /**
   * Cancel tax receipt
   */
  static async cancelTaxReceipt(receiptId: string, reason: string): Promise<void> {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('tax_receipts')
      .update({
        status: 'cancelled',
        notes: reason
      })
      .eq('id', receiptId)
    
    if (error) {
      throw new Error('Failed to cancel tax receipt')
    }
  }
}
