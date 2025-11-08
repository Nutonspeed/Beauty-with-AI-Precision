"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { 
  Camera, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  BarChart3,
  History,
  Star
} from 'lucide-react';
import Link from 'next/link';
import type { UserRole } from '@/lib/auth/role-config';

interface CustomerDashboardProps {
  role: UserRole;
}

export default function CustomerDashboard({ role }: CustomerDashboardProps) {
  const isPremium = role === 'premium_customer';
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Onboarding Alert */}
      {showOnboarding && (
        <Alert className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50">
          <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <AlertDescription className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-foreground">ยินดีต้อนรับสู่ AI367 Beauty! 👋</p>
              <p className="text-sm text-muted-foreground">
                ใหม่กับระบบหรือเปล่า? ดูคู่มือเริ่มต้นใช้งาน 3 ขั้นตอน (ใช้เวลา 2 นาที)
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={dismissOnboarding}>
                ข้ามไป
              </Button>
              <Button size="sm" asChild>
                <Link href="/onboarding/customer">
                  ดูคู่มือ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">ยินดีต้อนรับสู่ AI367 Beauty</h1>
        <p className="text-muted-foreground">
          เริ่มต้นการดูแลผิวพรรณของคุณด้วย AI
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Skin Analysis Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Camera className="h-8 w-8 text-primary" />
              {!isPremium && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
                  ฟรี
                </span>
              )}
            </div>
            <CardTitle>วิเคราะห์ผิวหน้า</CardTitle>
            <CardDescription>
              อัปโหลดภาพเพื่อวิเคราะห์สภาพผิวด้วย AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full group-hover:bg-primary/90">
              <Link href="/analysis">
                เริ่มวิเคราะห์
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* AR Simulator Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              {!isPremium && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
                  ฟรี
                </span>
              )}
            </div>
            <CardTitle>ทดลอง AR</CardTitle>
            <CardDescription>
              ดูผลการรักษาแบบ 3D ก่อนตัดสินใจ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full group-hover:bg-muted">
              <Link href="/ar-simulator">
                เริ่มทดลอง
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Personalized Recommendations Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-2 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Star className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
                AI
              </span>
            </div>
            <CardTitle>คำแนะนำเฉพาะคุณ</CardTitle>
            <CardDescription>
              ดูคำแนะนำจาก AI ที่ปรับแต่งเฉพาะผิวคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800">
              <Link href="/recommendations">
                ดูคำแนะนำ
                <Star className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Booking Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>จองนัดหมาย</CardTitle>
            <CardDescription>
              จองนัดกับผู้เชี่ยวชาญของเรา
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full group-hover:bg-muted">
              <Link href="/booking">
                จองเลย
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Progress Tracking Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>ติดตามความก้าวหน้า</CardTitle>
            <CardDescription>
              ดูกราฟและเปรียบเทียบผลการรักษา
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full group-hover:bg-muted">
              <Link href="/analysis/progress">
                ดูความก้าวหน้า
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Analysis History Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <History className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle>ประวัติการวิเคราะห์</CardTitle>
            <CardDescription>
              ดูภาพและผลการวิเคราะห์ย้อนหลัง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full group-hover:bg-muted">
              <Link href="/analysis/history">
                ดูประวัติ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* View Results Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle>ผลการวิเคราะห์ล่าสุด</CardTitle>
            <CardDescription>
              ดูรายงานและ Heatmap แบบละเอียด
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full group-hover:bg-muted">
              <Link href="/analysis/results">
                ดูผลลัพธ์
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>เริ่มต้นใช้งาน</CardTitle>
          <CardDescription>
            ทำตามขั้นตอนเหล่านี้เพื่อประสบการณ์ที่ดีที่สุด
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">1. อัปโหลดรูปภาพผิวหน้า</p>
                <p className="text-sm text-muted-foreground">
                  ถ่ายภาพในแสงสว่างเพียงพอ หน้าตรง ไม่เอียง
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">2. รับผลการวิเคราะห์จาก AI</p>
                <p className="text-sm text-muted-foreground">
                  ดู Heatmap และคำแนะนำการรักษา
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">3. ทดลอง AR Treatment Simulator</p>
                <p className="text-sm text-muted-foreground">
                  ดูผลการรักษาแบบ 3D ก่อนตัดสินใจ
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">4. จองนัดหมายกับผู้เชี่ยวชาญ</p>
                <p className="text-sm text-muted-foreground">
                  ปรึกษาแผนการรักษาที่เหมาะสมกับคุณ
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button asChild variant="outline" className="w-full">
              <Link href="/onboarding/customer">
                ดูคู่มือการใช้งานแบบเต็ม
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ประวัติการใช้งาน
          </CardTitle>
          <CardDescription>
            การวิเคราะห์และนัดหมายล่าสุดของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>ยังไม่มีประวัติการใช้งาน</p>
            <p className="text-sm mt-2">เริ่มต้นด้วยการวิเคราะห์ผิวหน้าครั้งแรกของคุณ!</p>
            <Button asChild className="mt-4">
              <Link href="/analysis">
                วิเคราะห์เลย
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Premium Upgrade CTA */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              อัพเกรดเป็น Premium
            </CardTitle>
            <CardDescription>
              ปลดล็อคฟีเจอร์พิเศษทั้งหมด
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                วิเคราะห์ไม่จำกัดครั้ง
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                รายงานแบบละเอียด พร้อม PDF
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ติดตามความก้าวหน้าแบบ Timeline
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ปรึกษาผู้เชี่ยวชาญทาง Chat
              </li>
            </ul>
            <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Link href="/pricing">
                ดูแพ็กเกจ Premium
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
