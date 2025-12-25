/**
 * Payment Dashboard Page
 * Overview of payments, invoices, and revenue for clinics
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  FileText, 
  Calendar,
  Download,
  Filter,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'
import RevenueChart from '@/components/payments/revenue-chart'

interface DashboardStats {
  totalRevenue: number
  revenueThisMonth: number
  revenueLastMonth: number
  unpaidInvoices: number
  paidInvoices: number
  totalTransactions: number
  averageTransactionValue: number
}

interface RecentInvoice {
  id: string
  invoice_number: string
  customer_name: string
  total_amount: number
  status: string
  issue_date: string
  due_date: string
}

interface RecentPayment {
  id: string
  amount: number
  payment_type: string
  status: string
  created_at: string
  invoice_number: string
  customer_name: string
}

export default function PaymentDashboardPage() {
  const supabase = createClient()
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([])
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clinicId, setClinicId] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [dateRange, statusFilter])

  const fetchDashboardData = async () => {
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

      // Set clinic_id for chart
      setClinicId(userData.clinic_id)

      // Calculate date range
      const endDate = new Date()
      const startDate = subDays(endDate, parseInt(dateRange))

      // Fetch stats
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('clinic_id', userData.clinic_id)
        .gte('issue_date', startDate.toISOString())
        .lte('issue_date', endDate.toISOString())

      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'completed')

      // Calculate stats
      const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
      
      const thisMonthStart = startOfMonth(new Date())
      const thisMonthEnd = endOfMonth(new Date())
      
      const { data: thisMonthPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', thisMonthStart.toISOString())
        .lte('created_at', thisMonthEnd.toISOString())

      const revenueThisMonth = thisMonthPayments?.reduce((sum, p) => sum + p.amount, 0) || 0

      const lastMonthStart = startOfMonth(subDays(new Date(), 30))
      const lastMonthEnd = endOfMonth(subDays(new Date(), 30))
      
      const { data: lastMonthPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString())

      const revenueLastMonth = lastMonthPayments?.reduce((sum, p) => sum + p.amount, 0) || 0

      const unpaidCount = invoices?.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length || 0
      const paidCount = invoices?.filter(inv => inv.status === 'paid').length || 0
      const totalTransactions = payments?.length || 0
      const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

      setStats({
        totalRevenue,
        revenueThisMonth,
        revenueLastMonth,
        unpaidInvoices: unpaidCount,
        paidInvoices: paidCount,
        totalTransactions,
        averageTransactionValue: avgTransaction
      })

      // Fetch recent invoices
      const { data: recentInvData } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey (
            full_name
          )
        `)
        .eq('clinic_id', userData.clinic_id)
        .order('issue_date', { ascending: false })
        .limit(10)

      setRecentInvoices(
        recentInvData?.map(inv => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          customer_name: inv.customers?.full_name || 'Unknown',
          total_amount: inv.total_amount,
          status: inv.status,
          issue_date: inv.issue_date,
          due_date: inv.due_date
        })) || []
      )

      // Fetch recent payments
      const { data: recentPayData } = await supabase
        .from('payments')
        .select(`
          *,
          invoices!payments_invoice_id_fkey (
            invoice_number,
            customers!invoices_customer_id_fkey (
              full_name
            )
          )
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentPayments(
        recentPayData?.map(pay => ({
          id: pay.id,
          amount: pay.amount,
          payment_type: pay.payment_type,
          status: pay.status,
          created_at: pay.created_at,
          invoice_number: pay.invoices?.invoice_number || 'Unknown',
          customer_name: pay.invoices?.customers?.full_name || 'Unknown'
        })) || []
      )

    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'ฉบับร่าง', variant: 'secondary' as const },
      sent: { label: 'ส่งแล้ว', variant: 'default' as const },
      paid: { label: 'ชำระแล้ว', variant: 'default' as const },
      overdue: { label: 'ค้างชำระ', variant: 'destructive' as const },
      cancelled: { label: 'ยกเลิก', variant: 'secondary' as const },
      refunded: { label: 'คืนเงิน', variant: 'secondary' as const },
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

  const revenueGrowth = stats?.revenueLastMonth 
    ? ((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth * 100)
    : 0

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
          <h2 className="text-2xl font-bold">ภาพรวมการชำระเงิน</h2>
          <p className="text-gray-600">ติดตามรายได้และการชำระเงินของคลินิก</p>
        </div>
        <div className="flex gap-2">
          <Link href="/clinic/payments/invoices/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              สร้างใบแจ้งหนี้
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <Label>ช่วงเวลา:</Label>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 วันล่าสุด</SelectItem>
                <SelectItem value="30">30 วันล่าสุด</SelectItem>
                <SelectItem value="90">3 เดือนล่าสุด</SelectItem>
                <SelectItem value="365">1 ปีล่าสุด</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              จากทั้งหมด {stats?.totalTransactions || 0} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้เดือนนี้</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.revenueThisMonth || 0)}</div>
            <p className={`text-xs ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ใบแจ้งหนี้รอชำระ</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unpaidInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              จากทั้งหมด {(stats?.paidInvoices || 0) + (stats?.unpaidInvoices || 0)} ใบ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่าเฉลี่ย/รายการ</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.averageTransactionValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              ต่อการธุรกรรม
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <RevenueChart clinicId={clinicId} />

      {/* Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">ใบแจ้งหนี้ล่าสุด</TabsTrigger>
          <TabsTrigger value="payments">การชำระเงินล่าสุด</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ใบแจ้งหนี้ล่าสุด</CardTitle>
              <CardDescription>
                10 ใบแจ้งหนี้ล่าสุด
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-gray-600">{invoice.customer_name}</p>
                      <p className="text-xs text-gray-500">
                        วันที่ {format(new Date(invoice.issue_date), 'd MMMM yyyy', { locale: th })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(invoice.total_amount)}</p>
                      {getStatusBadge(invoice.status)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/clinic/payments/invoices">
                  <Button variant="outline">ดูทั้งหมด</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>การชำระเงินล่าสุด</CardTitle>
              <CardDescription>
                10 รายการชำระเงินล่าสุด
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.invoice_number}</p>
                      <p className="text-sm text-gray-600">{payment.customer_name}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(payment.created_at), 'd MMMM yyyy HH:mm', { locale: th })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                      <Badge variant="outline">
                        {payment.payment_type === 'full' ? 'ชำระเต็มจำนวน' : 'ชำระบางส่วน'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/clinic/payments/transactions">
                  <Button variant="outline">ดูทั้งหมด</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
