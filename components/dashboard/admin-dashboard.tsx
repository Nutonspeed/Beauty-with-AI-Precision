"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Package, 
  TrendingUp,
  ArrowRight,
  BarChart3,
  Settings,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import type { UserRole } from '@/lib/auth/role-config';
import { mockDashboardData, type DashboardData } from '@/lib/mock/dashboard-mock-data';

interface AdminDashboardProps {
  role: UserRole;
}

export default function AdminDashboard({ role }: AdminDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data if API fails
        setData(mockDashboardData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">ไม่สามารถโหลดข้อมูลได้</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          จัดการและควบคุมคลินิกของคุณ
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ป่วยทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.totalClients.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{data.stats.newClientsThisMonth} คนใหม่เดือนนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นัดหมายวันนี้</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.appointmentsToday}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.cancelledAppointments} คนยกเลิก
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้เดือนนี้</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{data.stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className={`text-xs ${data.stats.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.stats.revenueChange >= 0 ? '+' : ''}{data.stats.revenueChange}% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สต็อกต่ำ</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              ต้องสั่งเพิ่ม
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <CardTitle>นัดหมายล่าสุด</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/appointments">
                  ดูทั้งหมด <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">{appointment.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.treatment} • {appointment.time}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอการยืนยัน'}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-orange-600" />
                <CardTitle>สินค้าใกล้หมด</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/inventory">
                  ดูทั้งหมด <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      เหลือ {item.currentStock} ชิ้น (ขั้นต่ำ {item.minStock} ชิ้น)
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    สั่งซื้อ
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Treatments */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <CardTitle>บริการยอดนิยม</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.popularTreatments.map((treatment, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{treatment.name}</span>
                    <span className="text-sm text-muted-foreground">{treatment.count} ครั้ง</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600" 
                      style={{ width: `${(treatment.count / data.popularTreatments[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Patient Management */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              <CardTitle>จัดการผู้ป่วย</CardTitle>
            </div>
            <CardDescription>
              ดูและจัดการข้อมูลผู้ป่วยทั้งหมด
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/patients">
                เปิดจัดการ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Staff Management */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-600" />
              <CardTitle>จัดการพนักงาน</CardTitle>
            </div>
            <CardDescription>
              จัดการข้อมูลและตารางงานพนักงาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/staff">
                เปิดจัดการ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Inventory Management */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-orange-600" />
              <CardTitle>จัดการสต็อก</CardTitle>
            </div>
            <CardDescription>
              ตรวจสอบและจัดการสินค้า/อุปกรณ์
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/inventory">
                เปิดจัดการ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Bookings Management */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-green-600" />
              <CardTitle>จัดการนัดหมาย</CardTitle>
            </div>
            <CardDescription>
              ดูและจัดการนัดหมายทั้งหมด
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin-dashboard/bookings">
                ดูนัดหมาย
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Reports & Analytics */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
              <CardTitle>รายงานและวิเคราะห์</CardTitle>
            </div>
            <CardDescription>
              ดูสถิติและรายงานต่างๆ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/reports">
                ดูรายงาน
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-gray-600" />
              <CardTitle>ตั้งค่าระบบ</CardTitle>
            </div>
            <CardDescription>
              ปรับแต่งการตั้งค่าคลินิก
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin-dashboard/settings">
                ตั้งค่า
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            กิจกรรมล่าสุด
          </CardTitle>
          <CardDescription>
            การเปลี่ยนแปลงและกิจกรรมที่สำคัญ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="h-2 w-2 bg-blue-600 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">ผู้ป่วยใหม่ลงทะเบียน</p>
                <p className="text-xs text-muted-foreground">สมชาย ใจดี - 15 นาทีที่แล้ว</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="h-2 w-2 bg-green-600 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">นัดหมายสำเร็จ</p>
                <p className="text-xs text-muted-foreground">สุดา ดีมาก - 1 ชั่วโมงที่แล้ว</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="h-2 w-2 bg-orange-600 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">สต็อกต่ำ - ต้องสั่งซื้อ</p>
                <p className="text-xs text-muted-foreground">เซรั่มวิตามินซี - 2 ชั่วโมงที่แล้ว</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Super Admin Section */}
      {isSuperAdmin && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Super Admin Tools
            </CardTitle>
            <CardDescription>
              เครื่องมือสำหรับ Super Admin เท่านั้น
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/super-admin">
                เปิด Super Admin Panel
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
