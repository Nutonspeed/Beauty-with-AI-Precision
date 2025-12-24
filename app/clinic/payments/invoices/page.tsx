/**
 * Invoice Management Page
 * List and manage all invoices for the clinic
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Mail,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { format, isPast } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'
import { toast } from 'sonner'

interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  customer_email: string
  total_amount: number
  status: string
  issue_date: string
  due_date: string
  paid_at?: string
}

export default function InvoiceManagementPage() {
  const supabase = createClient()
  
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchInvoices()
  }, [searchTerm, statusFilter, dateFilter, page])

  const fetchInvoices = async () => {
    setLoading(true)
    
    try {
      // Get clinic ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

      if (!userData?.clinic_id) return

      // Build query
      let query = supabase
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey (
            full_name,
            email
          )
        `, { count: 'exact' })
        .eq('clinic_id', userData.clinic_id)
        .order('issue_date', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1)

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (dateFilter !== 'all') {
        const now = new Date()
        let startDate: Date | null = null

        switch (dateFilter) {
          case '7':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case '30':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case '90':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
        }

        if (startDate) {
          query = query.gte('issue_date', startDate.toISOString())
        }
      }

      if (searchTerm) {
        query = query.or(`invoice_number.ilike.%${searchTerm}%,customers.full_name.ilike.%${searchTerm}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      setInvoices(
        data?.map(inv => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          customer_name: inv.customers?.full_name || 'Unknown',
          customer_email: inv.customers?.email || '',
          total_amount: inv.total_amount,
          status: inv.status,
          issue_date: inv.issue_date,
          due_date: inv.due_date,
          paid_at: inv.paid_at
        })) || []
      )

      setTotalPages(Math.ceil((count || 0) / 20))
    } catch (error) {
      console.error('Fetch invoices error:', error)
      toast.error('ไม่สามารถดึงข้อมูลใบแจ้งหนี้ได้')
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'send_invoice_email',
          invoice_id: invoiceId
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('ส่งใบแจ้งหนีย์เรียบร้อย')
      } else {
        toast.error(data.error || 'ไม่สามารถส่งใบแจ้งหนี้ได้')
      }
    } catch (error) {
      console.error('Send invoice error:', error)
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/invoices?type=generate_invoice_pdf&invoice_id=${invoiceId}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        toast.error('ไม่สามารถดาวน์โหลดใบแจ้งหนี้ได้')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = status !== 'paid' && isPast(new Date(dueDate))
    
    if (isOverdue) {
      return <Badge variant="destructive">ค้างชำระ</Badge>
    }

    const statusConfig = {
      draft: { label: 'ฉบับร่าง', variant: 'secondary' as const },
      sent: { label: 'ส่งแล้ว', variant: 'default' as const },
      paid: { label: 'ชำระแล้ว', variant: 'default' as const },
      cancelled: { label: 'ยกเลิก', variant: 'secondary' as const },
      refunded: { label: 'คืนเงินแล้ว', variant: 'secondary' as const },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">จัดการใบแจ้งหนี้</h2>
          <p className="text-gray-600">ดูและจัดการใบแจ้งหนี้ทั้งหมด</p>
        </div>
        <Link href="/clinic/payments/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            สร้างใบแจ้งหนี้ใหม่
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาเลขที่หรือชื่อลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="draft">ฉบับร่าง</SelectItem>
                <SelectItem value="sent">ส่งแล้ว</SelectItem>
                <SelectItem value="paid">ชำระแล้ว</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
                <SelectItem value="refunded">คืนเงินแล้ว</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="ช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกช่วงเวลา</SelectItem>
                <SelectItem value="7">7 วันล่าสุด</SelectItem>
                <SelectItem value="30">30 วันล่าสุด</SelectItem>
                <SelectItem value="90">3 เดือนล่าสุด</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              ตัวกรองเพิ่มเติม
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการใบแจ้งหนี้</CardTitle>
          <CardDescription>
            แสดง {invoices.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เลขที่</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>วันที่ออก</TableHead>
                <TableHead>วันครบกำหนด</TableHead>
                <TableHead className="text-right">จำนวนเงิน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">ดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{invoice.customer_name}</p>
                      <p className="text-sm text-gray-500">{invoice.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.issue_date), 'd MMMM yyyy', { locale: th })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.due_date), 'd MMMM yyyy', { locale: th })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(invoice.total_amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status, invoice.due_date)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/clinic/payments/invoices/${invoice.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            ดูรายละเอียด
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/clinic/payments/invoices/${invoice.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            แก้ไข
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSendInvoice(invoice.id)}
                          disabled={invoice.status === 'paid'}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          ส่งอีเมล
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          ดาวน์โหลด PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                หน้า {page} จาก {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  ก่อนหน้า
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
