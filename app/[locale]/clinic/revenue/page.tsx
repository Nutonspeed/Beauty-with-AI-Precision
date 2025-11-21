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

const LineChart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => ({ default: mod.Pie })), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => ({ default: mod.Cell })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => ({ default: mod.Legend })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false });

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
  byTreatment: Array<{
    name: string;
    revenue: number;
    percentage: number;
  }>;
  byPaymentMethod: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ClinicRevenuePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState<RevenueData | null>(null);

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
  }, [user, authLoading, router, lp, period]);

  const loadRevenueData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/clinic/revenue?period=${period}`);
      // const result = await response.json();
      // setData(result);
      
      // Mock data for now
      setData({
        summary: {
          totalRevenue: 1250000,
          totalBookings: 156,
          averageOrderValue: 8013,
          growthRate: 12.5
        },
        chartData: generateMockChartData(period),
        byTreatment: [
          { name: 'Laser Treatment', revenue: 450000, percentage: 36 },
          { name: 'Anti-Aging Facial', revenue: 350000, percentage: 28 },
          { name: 'Acne Treatment', revenue: 200000, percentage: 16 },
          { name: 'Pigmentation', revenue: 150000, percentage: 12 },
          { name: 'Other', revenue: 100000, percentage: 8 }
        ],
        byPaymentMethod: [
          { method: 'Cash', amount: 500000, count: 62 },
          { method: 'Credit Card', amount: 450000, count: 56 },
          { method: 'PromptPay', amount: 300000, count: 38 }
        ]
      });
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

  const generateMockChartData = (period: string) => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 50000) + 30000,
        bookings: Math.floor(Math.random() * 10) + 3
      });
    }
    
    return data;
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast({
      title: 'กำลังส่งออก',
      description: `กำลังสร้างรายงาน ${format.toUpperCase()}...`
    });
    // TODO: Implement export functionality
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

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
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            <h1 className="text-3xl font-bold">รายงานรายได้</h1>
          </div>
          <p className="text-muted-foreground">
            รายงานการเงินและวิเคราะห์รายได้ของคลินิก
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
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

      <Tabs defaultValue="trend" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trend">แนวโน้มรายได้</TabsTrigger>
          <TabsTrigger value="treatment">รายได้ตามทรีตเมนต์</TabsTrigger>
          <TabsTrigger value="payment">วิธีการชำระเงิน</TabsTrigger>
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
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis yAxisId="left" tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === 'revenue') return [formatCurrency(value), 'รายได้'];
                      return [value, 'การจอง'];
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('th-TH');
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    name="รายได้"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#82ca9d"
                    name="การจอง"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue by Treatment */}
        <TabsContent value="treatment">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>รายได้ตามประเภททรีตเมนต์</CardTitle>
                <CardDescription>
                  สัดส่วนรายได้จากแต่ละทรีตเมนต์
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.byTreatment}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.percentage}%`}
                    >
                      {data.byTreatment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดทรีตเมนต์</CardTitle>
                <CardDescription>
                  รายได้และสัดส่วนของแต่ละทรีตเมนต์
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.byTreatment.map((treatment, index) => (
                    <div key={treatment.name} className="flex items-center gap-4">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{treatment.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(treatment.revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${treatment.percentage}%`,
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
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>รายได้ตามวิธีการชำระเงิน</CardTitle>
              <CardDescription>
                แยกตามประเภทการชำระเงิน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.byPaymentMethod}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`} />
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
