/**
 * Tax Receipt Management Page
 * Create and manage tax receipts for Thai compliance
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
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { toast } from 'sonner'

interface TaxReceipt {
  id: string
  receipt_number: string
  customer_name: string
  total_amount: number
  status: string
  issue_date: string
  receipt_date: string
  signed_at?: string
}

interface CreateReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function CreateReceiptDialog({ open, onOpenChange, onSuccess }: CreateReceiptDialogProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [payments, setPayments] = useState<any[]>([])
  const [selectedPayment, setSelectedPayment] = useState('')
  const [formData, setFormData] = useState({
    seller_tax_id: '',
    buyer_tax_id: '',
    branch_code: '',
    notes: ''
  })

  useEffect(() => {
    if (open) {
      fetchUnpaidPayments()
    }
  }, [open])

  const fetchUnpaidPayments = async () => {
    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        invoices!inner(
          invoice_number,
          customers!inner(
            full_name
          )
        )
      `)
      .eq('status', 'completed')
      .is('tax_receipt_id', null)
      .order('created_at', { ascending: false })

    setPayments(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPayment) {
      toast.error('กรุณาเลือกการชำระเงิน')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/tax-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'create_from_payment',
          payment_id: selectedPayment,
          ...formData
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('สร้างใบเสร็จรับเงินสำเร็จ')
        onOpenChange(false)
        onSuccess()
        setFormData({
          seller_tax_id: '',
          buyer_tax_id: '',
          branch_code: '',
          notes: ''
        })
        setSelectedPayment('')
      } else {
        toast.error(data.error || 'ไม่สามารถสร้างใบเสร็จได้')
      }
    } catch (error) {
      console.error('Create receipt error:', error)
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>สร้างใบเสร็จรับเงิน/ใบกำกับภาษี</DialogTitle>
          <DialogDescription>
            สร้างใบเสร็จจากการชำระเงินที่เลือก
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="payment">เลือกการชำระเงิน</Label>
            <Select value={selectedPayment} onValueChange={setSelectedPayment}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกการชำระเงิน" />
              </SelectTrigger>
              <SelectContent>
                {payments.map((payment) => (
                  <SelectItem key={payment.id} value={payment.id}>
                    {payment.invoices.invoice_number} - {payment.invoices.customers.full_name} (฿{payment.amount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seller_tax_id">เลขประจำตัวผู้เสียภาษี (ผู้ขาย)</Label>
              <Input
                id="seller_tax_id"
                value={formData.seller_tax_id}
                onChange={(e) => setFormData(prev => ({ ...prev, seller_tax_id: e.target.value }))}
                placeholder="1234567890123"
              />
            </div>
            <div>
              <Label htmlFor="buyer_tax_id">เลขประจำตัวผู้เสียภาษี (ผู้ซื้อ)</Label>
              <Input
                id="buyer_tax_id"
                value={formData.buyer_tax_id}
                onChange={(e) => setFormData(prev => ({ ...prev, buyer_tax_id: e.target.value }))}
                placeholder="1234567890123"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="branch_code">รหัสสาขา</Label>
            <Input
              id="branch_code"
              value={formData.branch_code}
              onChange={(e) => setFormData(prev => ({ ...prev, branch_code: e.target.value }))}
              placeholder="00000"
            />
          </div>

          <div>
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="รายละเอียดเพิ่มเติม"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'กำลังสร้าง...' : 'สร้างใบเสร็จ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TaxReceiptPage() {
  const supabase = createClient()
  
  const [receipts, setReceipts] = useState<TaxReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchReceipts()
  }, [searchTerm, statusFilter, page])

  const fetchReceipts = async () => {
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
      const params = new URLSearchParams({
        clinic_id: userData.clinic_id,
        page: page.toString(),
        limit: '20'
      })

      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      if (searchTerm) {
        // TODO: Implement search in API
      }

      const response = await fetch(`/api/tax-receipts?${params}`)
      const data = await response.json()

      if (data.success) {
        setReceipts(data.receipts)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Fetch receipts error:', error)
      toast.error('ไม่สามารถดึงข้อมูลใบเสร็จได้')
    } finally {
      setLoading(false)
    }
  }

  const handleIssueReceipt = async (receiptId: string) => {
    try {
      const response = await fetch('/api/tax-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'issue_receipt',
          receipt_id: receiptId
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('ออกใบเสร็จสำเร็จ')
        fetchReceipts()
      } else {
        toast.error(data.error || 'ไม่สามารถออกใบเสร็จได้')
      }
    } catch (error) {
      console.error('Issue receipt error:', error)
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  const handleCancelReceipt = async (receiptId: string) => {
    const reason = prompt('กรุณาระบุเหตุผลในการยกเลิกใบเสร็จ:')
    if (!reason) return

    try {
      const response = await fetch('/api/tax-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cancel_receipt',
          receipt_id: receiptId,
          reason
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('ยกเลิกใบเสร็จสำเร็จ')
        fetchReceipts()
      } else {
        toast.error(data.error || 'ไม่สามารถยกเลิกใบเสร็จได้')
      }
    } catch (error) {
      console.error('Cancel receipt error:', error)
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  const handleDownloadPDF = async (receiptId: string, receiptNumber: string) => {
    try {
      const response = await fetch('/api/tax-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generate_pdf',
          receipt_id: receiptId
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('สร้าง PDF สำเร็จ')
        // TODO: Download PDF
      } else {
        toast.error(data.error || 'ไม่สามารถสร้าง PDF ได้')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'ฉบับร่าง', variant: 'secondary' as const },
      issued: { label: 'ออกแล้ว', variant: 'default' as const },
      cancelled: { label: 'ยกเลิก', variant: 'destructive' as const },
      void: { label: 'เป็นโมฆะ', variant: 'destructive' as const },
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
          <h2 className="text-2xl font-bold">จัดการใบเสร็จรับเงิน/ใบกำกับภาษี</h2>
          <p className="text-gray-600">สร้างและจัดการใบเสร็จเพื่อวัตถุประสงค์ทางภาษี</p>
        </div>
        <CreateReceiptDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={fetchReceipts}
        >
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            สร้างใบเสร็จใหม่
          </Button>
        </CreateReceiptDialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาเลขที่ใบเสร็จ..."
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
                <SelectItem value="issued">ออกแล้ว</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
                <SelectItem value="void">เป็นโมฆะ</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              ตัวกรองเพิ่มเติม
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการใบเสร็จ</CardTitle>
          <CardDescription>
            แสดง {receipts.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เลขที่</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>วันที่ออก</TableHead>
                <TableHead className="text-right">จำนวนเงิน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">ดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">
                    {receipt.receipt_number}
                  </TableCell>
                  <TableCell>
                    {receipt.customer_name}
                  </TableCell>
                  <TableCell>
                    {format(new Date(receipt.issue_date), 'd MMMM yyyy', { locale: th })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(receipt.total_amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(receipt.status)}
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
                          <a href={`/clinic/payments/tax-receipts/${receipt.id}`} target="_blank">
                            <Eye className="w-4 h-4 mr-2" />
                            ดูรายละเอียด
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadPDF(receipt.id, receipt.receipt_number)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          ดาวน์โหลด PDF
                        </DropdownMenuItem>
                        {receipt.status === 'draft' && (
                          <DropdownMenuItem
                            onClick={() => handleIssueReceipt(receipt.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            ออกใบเสร็จ
                          </DropdownMenuItem>
                        )}
                        {receipt.status === 'draft' && (
                          <DropdownMenuItem
                            onClick={() => handleCancelReceipt(receipt.id)}
                            className="text-red-600"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            ยกเลิกใบเสร็จ
                          </DropdownMenuItem>
                        )}
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
