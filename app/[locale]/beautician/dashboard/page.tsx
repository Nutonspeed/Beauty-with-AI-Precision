"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  User
} from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  treatment: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export default function BeauticianDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  const [isLoading, setIsLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(lp('/auth/login'));
      return;
    }

    // Only clinic_staff, clinic_owner, or super_admin can access
    if (!['clinic_staff', 'clinic_owner', 'super_admin'].includes(user.role)) {
      router.push(lp('/unauthorized'));
      return;
    }

    // Load appointment data
    const loadData = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/beautician/appointments');
        // const data = await response.json();
        
        // Mock data for now
        setTodayAppointments([
          {
            id: '1',
            patientName: 'คุณสมศรี ใจดี',
            treatment: 'Acne Treatment',
            time: '10:00',
            status: 'scheduled'
          },
          {
            id: '2',
            patientName: 'คุณจิรา สวยงาม',
            treatment: 'Anti-Aging Facial',
            time: '11:30',
            status: 'in-progress'
          },
          {
            id: '3',
            patientName: 'คุณนิตยา ผิวขาว',
            treatment: 'Pigmentation Treatment',
            time: '14:00',
            status: 'scheduled'
          }
        ]);
      } catch (error) {
        console.error('Error loading appointment data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router, lp]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">กำลังโหลด Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Beautician Dashboard</h1>
        <p className="text-muted-foreground">
          จัดการนัดหมายและให้บริการรักษาผิวของคุณ
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นัดหมายวันนี้</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayAppointments.filter(a => a.status === 'completed').length} เสร็จแล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้าวันนี้</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              รอบริการ {todayAppointments.filter(a => a.status !== 'completed').length} คน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เวลาทำงานวันนี้</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.5 ชม.</div>
            <p className="text-xs text-muted-foreground">
              จาก 8 ชม. ที่วางแผนไว้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ประสิทธิภาพ</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              คะแนนความพึงพอใจ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>นัดหมายวันนี้</CardTitle>
          <CardDescription>
            รายการนัดหมายของคุณประจำวัน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>ไม่มีนัดหมายวันนี้</p>
              </div>
            ) : (
              todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.treatment}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{appointment.time}</p>
                      <div className="flex items-center gap-1">
                        {appointment.status === 'completed' && (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">เสร็จแล้ว</span>
                          </>
                        )}
                        {appointment.status === 'in-progress' && (
                          <>
                            <AlertCircle className="h-3 w-3 text-orange-600" />
                            <span className="text-xs text-orange-600">กำลังให้บริการ</span>
                          </>
                        )}
                        {appointment.status === 'scheduled' && (
                          <>
                            <Clock className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-600">รอให้บริการ</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      ดูรายละเอียด
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Calendar className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle className="text-lg">ตารางนัดหมาย</CardTitle>
            <CardDescription>
              ดูและจัดการนัดหมายทั้งหมด
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={lp('/schedule')}>
                เปิดตารางนัดหมาย
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle className="text-lg">ลูกค้าของฉัน</CardTitle>
            <CardDescription>
              ดูประวัติและข้อมูลลูกค้า
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href={lp('/clinic/customers')}>
                ดูรายชื่อลูกค้า
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle className="text-lg">รายงานประสิทธิภาพ</CardTitle>
            <CardDescription>
              ดูสถิติและผลงาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href={lp('/clinic/reports')}>
                ดูรายงาน
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips for Beauticians */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle>💡 เคล็ดลับการให้บริการ</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-pink-600">•</span>
              <span>บันทึกผลการรักษาทุกครั้งเพื่อติดตามความก้าวหน้า</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600">•</span>
              <span>ถ่ายรูป Before/After เพื่อแสดงผลการรักษา</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600">•</span>
              <span>แนะนำผลิตภัณฑ์บำรุงผิวที่เหมาะสมสำหรับลูกค้าแต่ละคน</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600">•</span>
              <span>ทักทายลูกค้าด้วยความเป็นมิตรและให้ความสนใจ</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
