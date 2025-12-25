/**
 * Customer Payment Detail Page
 * Shows invoice details and allows payment
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CreditCard, Download, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'

interface Invoice {
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
  }
  line_items: Array<{
    description: string
    quantity: number
    unit_price: number
    discount_percent: number
    total: number
  }>
}

export default function PaymentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string)
    }
  }, [params.id])

  const fetchInvoice = async (invoiceId: string) => {
    const { data } = await supabase
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
          tax_id
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (data) {
      // Get line items
      const { data: lineItems } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)

      setInvoice({
        ...data,
        line_items: lineItems || []
      })
    }
    
    setLoading(false)
  }

  const handleStripePayment = async () => {
    if (!invoice) return

    setProcessingPayment(true)
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'create_checkout_session',
          invoice_id: invoice.id,
          success_url: `${window.location.origin}/customer/payments/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/customer/payments/${invoice.id}`
        })
      })

      const data = await response.json()
      
      if (data.success) {
        window.location.href = data.checkout_url
      } else {
        alert(data.error || 'ไม่สามารถเริ่มการชำระเงินได้')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoice) return

    try {
      const response = await fetch(`/api/invoices?type=generate_invoice_pdf&invoice_id=${invoice.id}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoice.invoice_number}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('ไม่สามารถดาวน์โหลดใบแจ้งหนี้ได้')
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'ฉบับร่าง', variant: 'secondary' as const },
      sent: { label: 'ส่งแล้ว', variant: 'default' as const },
      paid: { label: 'ชำระแล้ว', variant: 'default' as const },
      overdue: { label: 'ค้างชำระ', variant: 'destructive' as const },
      cancelled: { label: 'ยกเลิก', variant: 'secondary' as const },
      refunded: { label: 'คืนเงินแล้ว', variant: 'secondary' as const },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบใบแจ้งหนี้</h2>
        <p className="text-gray-600 mb-4">ใบแจ้งหนี้ที่คุณค้นหาไม่มีอยู่</p>
        <Link href="/customer/payments">
          <Button>กลับไปหน้าการชำระเงิน</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            กลับ
          </Button>
          <div>
            <h2 className="text-2xl font-bold">ใบแจ้งหนี้ {invoice.invoice_number}</h2>
            <p className="text-gray-600">
              วันที่ {format(new Date(invoice.issue_date), 'd MMMM yyyy', { locale: th })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(invoice.status)}
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
          >
            <Download className="w-4 h-4 mr-1" />
            ดาวน์โหลด PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* From/To */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-2">จาก:</h3>
                  <p className="font-medium">{invoice.clinic.name}</p>
                  <p className="text-sm text-gray-600">{invoice.clinic.address}</p>
                  <p className="text-sm text-gray-600">โทร: {invoice.clinic.phone}</p>
                  <p className="text-sm text-gray-600">อีเมล: {invoice.clinic.email}</p>
                  {invoice.clinic.tax_id && (
                    <p className="text-sm text-gray-600">
                      เลขประจำตัวผู้เสียภาษี: {invoice.clinic.tax_id}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">ถึง:</h3>
                  <p className="font-medium">{invoice.customer.full_name}</p>
                  {invoice.customer.address && (
                    <p className="text-sm text-gray-600">{invoice.customer.address}</p>
                  )}
                  {invoice.customer.phone && (
                    <p className="text-sm text-gray-600">โทร: {invoice.customer.phone}</p>
                  )}
                  <p className="text-sm text-gray-600">อีเมล: {invoice.customer.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>รายการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.line_items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600">
                        จำนวน {item.quantity} × ฿{item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">฿{item.total.toFixed(2)}</p>
                      {item.discount_percent > 0 && (
                        <p className="text-sm text-gray-500">
                          ส่วนลด {item.discount_percent}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>รวมเป็นเงิน:</span>
                    <span>฿{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>ส่วนลด:</span>
                      <span>-฿{invoice.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>ภาษี {invoice.tax_rate}%:</span>
                    <span>฿{invoice.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>ยอดรวมทั้งสิ้น:</span>
                    <span>฿{invoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>หมายเหตุ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                การชำระเงิน
              </CardTitle>
              <CardDescription>
                {invoice.status === 'paid' 
                  ? 'ใบแจ้งหนี้นี้ได้รับการชำระแล้ว'
                  : `ครบกำหนด: ${format(new Date(invoice.due_date), 'd MMMM yyyy', { locale: th })}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.status === 'paid' ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">ชำระเงินแล้ว</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={handleDownloadPDF}
                  >
                    ดาวน์โหลดใบเสร็จ
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      ฿{invoice.total_amount.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleStripePayment}
                    disabled={processingPayment}
                  >
                    {processingPayment ? 'กำลังดำเนินการ...' : 'ชำระด้วยบัตรเครดิต'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    ปลอดภัยด้วย Stripe
                  </p>
                  <Separator />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">วิธีการชำระอื่น:</p>
                    <ul className="space-y-1">
                      <li>• โอนเงินผ่านธนาคาร</li>
                      <li>• ชำระเงินสดที่คลินิก</li>
                      <li>• QR Code PromptPay</li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>ติดต่อเรา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>อีเมล:</strong> {invoice.clinic.email}
              </p>
              <p>
                <strong>โทร:</strong> {invoice.clinic.phone}
              </p>
              <p className="text-gray-600 mt-2">
                หากมีข้อสอบถามเกี่ยวกับใบแจ้งหนี้นี้
                กรุณาติดต่อฝ่ายบัญชี
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
