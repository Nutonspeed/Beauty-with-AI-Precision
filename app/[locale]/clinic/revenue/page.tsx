"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  CreditCard,
  Users,
  Package
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';

const LineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart as unknown as React.ComponentType<any> })), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line as unknown as React.ComponentType<any> })), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart as unknown as React.ComponentType<any> })), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar as unknown as React.ComponentType<any> })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart as unknown as React.ComponentType<any> })), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => ({ default: mod.Pie as unknown as React.ComponentType<any> })), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => ({ default: mod.Cell as unknown as React.ComponentType<any> })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis as unknown as React.ComponentType<any> })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis as unknown as React.ComponentType<any> })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid as unknown as React.ComponentType<any> })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip as unknown as React.ComponentType<any> })), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => ({ default: mod.Legend as unknown as React.ComponentType<any> })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer as unknown as React.ComponentType<any> })), { ssr: false });

interface RevenueData {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    averageOrderValue: number;
    growthRate: number;
  };
  chartData: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  byPaymentMethod: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
}

interface AppointmentAnalytics {
  summary: {
    totalAppointments: number;
    completedAppointments: number;
    paidAppointments: number;
    completionRate: number;
    paymentRate: number;
    paymentAfterCompletionRate: number;
  };
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  dailyData: Array<{
    date: string;
    total: number;
    completed: number;
    paid: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

type ClinicSubscriptionStatus = {
  isActive: boolean
  isTrial: boolean
  isTrialExpired: boolean
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled'
  plan: string
  message: string
}

export default function ClinicRevenuePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState<RevenueData | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'trend' | 'payment' | 'appointments'>('trend');

  const [subscription, setSubscription] = useState<ClinicSubscriptionStatus | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(lp('/auth/login'));
      return;
    }

    // Only clinic_owner, clinic_admin, and super_admin can access
    if (!['clinic_owner', 'clinic_admin', 'super_admin'].includes(user.role)) {
      router.push(lp('/unauthorized'));
      return;
    }

    loadRevenueData();
    
    // Load appointment data if appointments tab is active
    if (activeTab === 'appointments') {
      loadAppointmentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router, lp, period, activeTab]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setSubscriptionLoading(true)
        const res = await fetch('/api/clinic/subscription-status')
        if (!res.ok) {
          setSubscription(null)
          return
        }
        const result = await res.json()
        setSubscription(result?.subscription || null)
      } catch (_e) {
        setSubscription(null)
      } finally {
        setSubscriptionLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchSubscription()
    }
  }, [authLoading, user])

  const loadAppointmentData = async () => {
    try {
      const response = await fetch(`/api/clinic/appointments/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error(`Failed to load appointment data: ${response.status}`);
      }
      const result = await response.json();
      setAppointmentData(result);
    } catch (error) {
      console.error('Error loading appointment data:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลการนัดหมายได้',
        variant: 'destructive'
      });
    }
  };

  const loadRevenueData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clinic/revenue?period=${period}`);
      if (!response.ok) {
        throw new Error(`Failed to load revenue data: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error loading revenue data:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลรายได้ได้',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!canUsePaidFeatures) {
      toast({
        title: 'Subscription จำกัดการใช้งาน',
        description: subscription?.message || 'Subscription is not active',
        variant: 'destructive'
      })
      return
    }
    if (format === 'excel') {
      exportCsv();
    } else {
      // For PDF, use browser print functionality
      window.print();
    }
  };

  const exportCsv = () => {
    if (!data) return;

    // Create CSV content
    const header = [
      'Revenue Report',
      `Period: ${period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}`,
      '',
      'Summary',
      `Total Revenue,${data.summary.totalRevenue}`,
      `Total Bookings,${data.summary.totalBookings}`,
      `Average Order Value,${data.summary.averageOrderValue}`,
      `Growth Rate,${data.summary.growthRate}%`,
      '',
      'Daily Revenue',
      'Date,Revenue,Bookings'
    ];

    // Add daily data
    const dailyRows = data.chartData.map(row => 
      `${row.date},${row.revenue},${row.bookings}`
    );

    // Add payment methods section
    const paymentHeader = [
      '',
      'Payment Methods',
      'Method,Amount,Count,Average'
    ];

    const paymentRows = data.byPaymentMethod.map(method => 
      `${method.method},${method.amount},${method.count},${method.amount / method.count}`
    );

    // Combine all sections
    const csvContent = [
      ...header,
      ...dailyRows,
      ...paymentHeader,
      ...paymentRows
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `revenue-report-${period}-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({
      title: 'ส่งออกสำเร็จ',
      description: 'ดาวน์โหลดรายงาน CSV เรียบร้อยแล้ว'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const canUsePaidFeatures = subscriptionLoading ? false : (subscription?.isActive ?? true)

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">กำลังโหลดรายงานรายได้...</p>
        </div>
      </div>
    );
  }

  if (!user || !data) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 print:py-4 print:px-2">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-before {
            page-break-before: always;
          }
          .print\\:break-after {
            page-break-after: always;
          }
          .print\\:text-xs {
            font-size: 0.75rem !important;
          }
          .print\\:text-sm {
            font-size: 0.875rem !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <DollarSign className="h-8 w-8 print:h-6 print:w-6" />
            <h1 className="text-3xl font-bold print:text-2xl">รายงานรายได้</h1>
          </div>
          <p className="text-muted-foreground print:text-sm">
            รายงานการเงินและวิเคราะห์รายได้ของคลินิก
          </p>
          <p className="text-sm text-muted-foreground print:text-xs">
            ช่วงเวลา: {period === '7d' ? '7 วันล่าสุด' : period === '30d' ? '30 วันล่าสุด' : '90 วันล่าสุด'} | 
            วันที่ส่งออก: {new Date().toLocaleDateString('th-TH')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!canUsePaidFeatures}
            onClick={() => {
              if (!canUsePaidFeatures) {
                toast({
                  title: 'Subscription จำกัดการใช้งาน',
                  description: subscription?.message || 'Subscription is not active',
                  variant: 'destructive'
                })
                return
              }
              router.push(lp('/clinic/payments'))
            }}
          >
            Payments
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} disabled={!canUsePaidFeatures}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} disabled={!canUsePaidFeatures}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {!subscriptionLoading && subscription && !subscription.isActive ? (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/30 print:hidden">
          <CardContent className="p-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                Subscription จำกัดการใช้งาน
              </div>
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                {subscription.message}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">รายงานรายได้คลินิก</h1>
        <p className="text-sm text-gray-600">
          ช่วงเวลา: {period === '7d' ? '7 วันล่าสุด' : period === '30d' ? '30 วันล่าสุด' : '90 วันล่าสุด'}
        </p>
        <p className="text-xs text-gray-500">
          วันที่ส่งออก: {new Date().toLocaleDateString('th-TH')}
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 print:hidden">
        <Button
          variant={period === '7d' ? 'default' : 'outline'}
          onClick={() => setPeriod('7d')}
        >
          7 วัน
        </Button>
        <Button
          variant={period === '30d' ? 'default' : 'outline'}
          onClick={() => setPeriod('30d')}
        >
          30 วัน
        </Button>
        <Button
          variant={period === '90d' ? 'default' : 'outline'}
          onClick={() => setPeriod('90d')}
        >
          90 วัน
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {data.summary.growthRate >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{data.summary.growthRate}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{data.summary.growthRate}%</span>
                </>
              )}
              <span>จากช่วงก่อนหน้า</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การจองทั้งหมด</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              รายการทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่าเฉลี่ย</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ต่อ 1 รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้าที่ชำระแล้ว</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.byPaymentMethod.reduce((sum, m) => sum + m.count, 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              รายการที่ชำระแล้ว
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trend" className="space-y-6" value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="print:hidden">
          <TabsTrigger value="trend">แนวโน้มรายได้</TabsTrigger>
          <TabsTrigger value="payment">วิธีการชำระเงิน</TabsTrigger>
          <TabsTrigger value="appointments">การนัดหมาย</TabsTrigger>
        </TabsList>

        {/* Revenue Trend Chart */}
        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>แนวโน้มรายได้รายวัน</CardTitle>
              <CardDescription>
                รายได้และจำนวนการจองตามช่วงเวลา
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Chart - Hidden when printing */}
              <div className="print:hidden">
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="รายได้"
                      />
                      <Line
                        type="monotone"
                        dataKey="bookings"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="จำนวนการจอง"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table - Only visible when printing */}
              <div className="hidden print:block">
                <table className="w-full text-sm print:text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">วันที่</th>
                      <th className="text-right py-2">รายได้</th>
                      <th className="text-right py-2">จำนวนการจอง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.chartData.map((row, index) => (
                      <tr key={row.date} className="border-b print:border">
                        <td className="py-2">{row.date}</td>
                        <td className="text-right py-2">{formatCurrency(row.revenue)}</td>
                        <td className="text-right py-2">{row.bookings}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td className="pt-2">รวม</td>
                      <td className="text-right pt-2">{formatCurrency(data.summary.totalRevenue)}</td>
                      <td className="text-right pt-2">{data.summary.totalBookings}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payment" className="print:break-before">
          <Card>
            <CardHeader>
              <CardTitle>รายได้ตามวิธีการชำระเงิน</CardTitle>
              <CardDescription>
                แยกตามประเภทการชำระเงิน
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Chart - Hidden when printing */}
              <div className="print:hidden">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.byPaymentMethod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis tickFormatter={(value: any) => `฿${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Bar dataKey="amount" fill="#8884d8" name="รายได้" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6 space-y-3">
                  {data.byPaymentMethod.map((method) => (
                    <div key={method.method} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{method.method}</p>
                          <p className="text-sm text-muted-foreground">{method.count} รายการ</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(method.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          ค่าเฉลี่ย {formatCurrency(method.amount / method.count)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table - Only visible when printing */}
              <div className="hidden print:block">
                <table className="w-full text-sm print:text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">วิธีการชำระเงิน</th>
                      <th className="text-right py-2">จำนวนรายการ</th>
                      <th className="text-right py-2">รายได้รวม</th>
                      <th className="text-right py-2">ค่าเฉลี่ย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byPaymentMethod.map((method) => (
                      <tr key={method.method} className="border-b print:border">
                        <td className="py-2">{method.method}</td>
                        <td className="text-right py-2">{method.count}</td>
                        <td className="text-right py-2">{formatCurrency(method.amount)}</td>
                        <td className="text-right py-2">{formatCurrency(method.amount / method.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td className="pt-2">รวม</td>
                      <td className="text-right pt-2">{data.byPaymentMethod.reduce((sum, m) => sum + m.count, 0)}</td>
                      <td className="text-right pt-2">{formatCurrency(data.summary.totalRevenue)}</td>
                      <td className="text-right pt-2">{formatCurrency(data.summary.averageOrderValue)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Analytics */}
        <TabsContent value="appointments">
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">การนัดหมายทั้งหมด</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentData?.summary.totalAppointments || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ในช่วง {period === '7d' ? '7 วัน' : period === '30d' ? '30 วัน' : '90 วัน'} ที่ผ่านมา
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">อัตราการเสร็จสิ้น</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentData?.summary.completionRate || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {appointmentData?.summary.completedAppointments || 0} จาก {appointmentData?.summary.totalAppointments || 0} การนัดหมาย
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">อัตราการชำระเงิน</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentData?.summary.paymentRate || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {appointmentData?.summary.paidAppointments || 0} จาก {appointmentData?.summary.totalAppointments || 0} การชำระเงิน
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>สถานะการนัดหมาย</CardTitle>
                <CardDescription>
                  สัดส่วนของแต่ละสถานะ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={appointmentData?.statusBreakdown || []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry: any) => `${entry.percentage}%`}
                    >
                      {(appointmentData?.statusBreakdown || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดสถานะ</CardTitle>
                <CardDescription>
                  จำนวนและสัดส่วนของแต่ละสถานะ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(appointmentData?.statusBreakdown || []).map((status, index) => (
                    <div key={status.status} className="flex items-center gap-4">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{status.status}</span>
                          <span className="text-sm text-muted-foreground">
                            {status.count} รายการ
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${status.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>แนวโน้มการนัดหมายรายวัน</CardTitle>
              <CardDescription>
                จำนวนการนัดหมายและการชำระเงินตามช่วงเวลา
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="print:hidden">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={appointmentData?.dailyData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="ทั้งหมด"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="เสร็จสิ้น"
                    />
                    <Line
                      type="monotone"
                      dataKey="paid"
                      stroke="#ffc658"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="ชำระเงิน"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Print Table */}
              <div className="hidden print:block">
                <table className="w-full text-sm print:text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">วันที่</th>
                      <th className="text-right py-2">ทั้งหมด</th>
                      <th className="text-right py-2">เสร็จสิ้น</th>
                      <th className="text-right py-2">ชำระเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(appointmentData?.dailyData || []).map((row, index) => (
                      <tr key={row.date} className="border-b print:border">
                        <td className="py-2">{row.date}</td>
                        <td className="text-right py-2">{row.total}</td>
                        <td className="text-right py-2">{row.completed}</td>
                        <td className="text-right py-2">{row.paid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
