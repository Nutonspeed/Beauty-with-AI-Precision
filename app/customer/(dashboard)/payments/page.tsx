/**
 * Customer Payments Page
 * Shows invoices and payment history
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreditCard, Download, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, isPast, addDays } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'

interface Invoice {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  status: string
  notes?: string
}

interface Payment {
  id: string
  amount: number
  currency: string
  payment_type: string
  transaction_id: string
  status: string
  created_at: string
  invoice: {
    invoice_number: string
  }
}

export default function CustomerPaymentsPage() {
  const supabase = createClient()
  
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) return

    // Fetch invoices
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customer.id)
      .order('issue_date', { ascending: false })

    // Fetch payments with invoice info
    const { data: paymentData } = await supabase
      .from('payments')
      .select(`
        *,
        invoices!payments_invoice_id_fkey (
          invoice_number
        )
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    setInvoices(invoiceData || [])
    setPayments(paymentData || [])
    setLoading(false)
  }

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices?type=generate_invoice_pdf&invoice_id=${invoiceId}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoiceId}.pdf`
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

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'paid' && isPast(new Date(dueDate))
  }

  const unpaidInvoices = invoices.filter(inv => 
    inv.status !== 'paid' && inv.status !== 'cancelled' && inv.status !== 'refunded'
  )

  const paidInvoices = invoices.filter(inv => 
    inv.status === 'paid' || inv.status === 'refunded'
  )

  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              วันที่ {format(new Date(invoice.issue_date), 'd MMMM yyyy', { locale: th })}
            </div>
            <div className="text-sm text-gray-600">
              ครบกำหนด {format(new Date(invoice.due_date), 'd MMMM yyyy', { locale: th })}
            </div>
            {isOverdue(invoice.due_date, invoice.status) && (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ เกินกำหนดชำระ
              </p>
            )}
          </div>
          <div className="text-right space-y-2">
            {getStatusBadge(invoice.status)}
            <p className="font-semibold text-lg">
              ฿{invoice.total_amount.toFixed(2)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadInvoice(invoice.id)}
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <Link href={`/customer/payments/${invoice.id}`}>
                  <Button size="sm">
                    ชำระเงิน
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold">{payment.invoice.invoice_number}</h3>
            <p className="text-sm text-gray-600">
              วันที่ {format(new Date(payment.created_at), 'd MMMM yyyy HH:mm', { locale: th })}
            </p>
            <p className="text-sm text-gray-600">
              รหัสธุรกรรม: {payment.transaction_id}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">
              ฿{payment.amount.toFixed(2)}
            </p>
            <Badge variant="default" className="mt-1">
              {payment.payment_type === 'full' ? 'ชำระเต็มจำนวน' : 'ชำระบางส่วน'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">การชำระเงิน</h2>
        <p className="text-gray-600">ดูและจัดการการชำระเงินของคุณ</p>
      </div>

      <Tabs defaultValue="unpaid" className="w-full">
        <TabsList>
          <TabsTrigger value="unpaid">
            รอชำระ ({unpaidInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            ชำระแล้ว ({paidInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            ประวัติการชำระ ({payments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unpaid" className="space-y-4">
          {unpaidInvoices.length > 0 ? (
            unpaidInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ไม่มีใบแจ้งหนี้รอชำระ
                </h3>
                <p className="text-gray-600">
                  คุณได้ชำระเงินทั้งหมดแล้ว
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          {paidInvoices.length > 0 ? (
            paidInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ยังไม่มีการชำระเงิน
                </h3>
                <p className="text-gray-600">
                  ใบแจ้งหนี้ที่ชำระแล้วจะแสดงที่นี่
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ไม่มีประวัติการชำระเงิน
                </h3>
                <p className="text-gray-600">
                  ประวัติการชำระเงินของคุณจะแสดงที่นี่
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
