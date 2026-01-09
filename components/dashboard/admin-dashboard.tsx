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
  MoreHorizontal,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import type { UserRole } from '@/lib/auth/role-config';
import { mockDashboardData, type DashboardData } from '@/lib/mock/dashboard-mock-data';
import { useTranslations, useLocale } from 'next-intl';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminDashboardProps {
  role: UserRole;
}

export default function AdminDashboard({ role }: AdminDashboardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isThaiLocale = locale === 'th';
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSuperAdmin = role === 'super_admin';
  const lp = useLocalizePath();

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
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl">
          {/* Welcome Interface Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-pink-500/50" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/60 italic">System Administrator Node</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
              {isSuperAdmin ? 'Elite' : 'Clinical'}<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent italic">
                Dashboard <span className="not-italic">Control</span>
              </span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic">
              {isThaiLocale ? 'จัดการและควบคุมคลินิกของคุณด้วยระบบอัจฉริยะ' : 'Command and monitor your clinical infrastructure with precision intelligence.'}
            </p>
          </motion.div>

          {/* Quick Stats Grid - Infrastructure Nodes */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'ผู้ป่วยทั้งหมด', val: data.stats.totalClients.toLocaleString(), sub: `+${data.stats.newClientsThisMonth} คนใหม่เดือนนี้`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'นัดหมายวันนี้', val: data.stats.appointmentsToday, sub: `${data.stats.cancelledAppointments} คนยกเลิก`, icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'รายได้เดือนนี้', val: `฿${data.stats.monthlyRevenue.toLocaleString()}`, sub: `${data.stats.revenueChange >= 0 ? '+' : ''}${data.stats.revenueChange}% จากเดือนที่แล้ว`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: data.stats.revenueChange >= 0 },
              { label: 'สต็อกต่ำ', val: data.stats.lowStockItems, sub: 'ต้องสั่งเพิ่ม', icon: Package, color: 'text-orange-400', bg: 'bg-orange-500/10' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</CardTitle>
                    <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner group-hover:scale-110 transition-transform", stat.bg)}>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-white tracking-tighter italic">{stat.val}</div>
                    <p className={cn("text-[9px] font-black uppercase tracking-widest mt-2", stat.trend !== undefined ? (stat.trend ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-600')}>
                      {stat.sub}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Upcoming Appointments Architecture */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <CardHeader className="p-10 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                        <Calendar className="h-8 w-8 text-pink-500" />
                        {isThaiLocale ? 'นัดหมายล่าสุด' : 'Recent Appointments'}
                      </CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live scheduling synchronization</CardDescription>
                    </div>
                    <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest" asChild>
                      <Link href={lp('/admin/appointments')}>
                        View Node <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-6 space-y-6">
                  {data.recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all duration-500">
                      <div className="space-y-2">
                        <p className="font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{appointment.clientName}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                          {appointment.treatment} • <span className="text-slate-400">{appointment.time}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={cn("px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-none shadow-inner", 
                          appointment.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        )}>
                          {appointment.status === 'confirmed' ? (isThaiLocale ? 'ยืนยันแล้ว' : 'CONFIRMED') : (isThaiLocale ? 'รอการยืนยัน' : 'PENDING')}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5 text-slate-600 hover:text-white transition-all">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* popular treatments grid */}
            <div className="space-y-10">
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  <CardHeader className="p-10 pb-6">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                      <BarChart3 className="h-6 w-6 text-cyan-400" />
                      {isThaiLocale ? 'บริการยอดนิยม' : 'Popular Protocols'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-6 space-y-8">
                    {data.popularTreatments.map((treatment, index) => (
                      <div key={index} className="space-y-3 group">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-300 group-hover:text-cyan-400 transition-colors italic">{treatment.name}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{treatment.count} cycles</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(treatment.count / data.popularTreatments[0].count) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                  <CardHeader className="p-10 pb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                        <Package className="h-6 w-6 text-orange-400" />
                        {isThaiLocale ? 'สินค้าใกล้หมด' : 'Inventory Depletion'}
                      </CardTitle>
                      <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest h-8" asChild>
                        <Link href={lp('/admin/inventory')}>Audit</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-6 space-y-6">
                    {data.lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-orange-500/30 transition-all">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white italic group-hover:text-orange-400 transition-colors">{item.name}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                            REMAINING: <span className="text-orange-400">{item.currentStock}</span> / MIN: {item.minStock}
                          </p>
                        </div>
                        <Button variant="premium" className="h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl shadow-pink-500/10">
                          Order
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Main Command Actions */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'จัดการผู้ป่วย', desc: 'Clinical patient data orchestration', href: '/admin/patients' },
              { icon: UserCheck, color: 'text-purple-400', bg: 'bg-purple-500/10', title: 'จัดการพนักงาน', desc: 'Staff allocation and scheduling node', href: '/admin/staff' },
              { icon: Package, color: 'text-orange-400', bg: 'bg-orange-500/10', title: 'จัดการสต็อก', desc: 'Asset supply chain management', href: '/admin/inventory' },
              { icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/10', title: 'จัดการนัดหมาย', desc: 'Temporal appointment synchronization', href: '/admin-dashboard/bookings' },
              { icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'รายงานและวิเคราะห์', desc: 'Global performance intelligence', href: '/admin/reports' },
              { icon: Settings, color: 'text-slate-400', bg: 'bg-white/5', title: 'ตั้งค่าระบบ', desc: 'Clinical parameter configuration', href: '/admin-dashboard/settings' }
            ].map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] transition-all duration-700 hover:bg-white/[0.03] hover:border-white/10 group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <CardHeader className="p-10 space-y-6">
                    <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3", action.bg)}>
                      <action.icon className={cn("h-8 w-8", action.color)} />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{action.title}</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{action.desc}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0">
                    <Button asChild variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-white/10 bg-white/5 hover:bg-white/10 group-hover:border-pink-500/30 transition-all">
                      <Link href={lp(action.href)}>
                        Initialize Module
                        <ArrowRight className="ml-3 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Activity Logs Architecture */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              <CardHeader className="p-12 pb-6">
                <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                  <FileText className="h-8 w-8 text-purple-400" />
                  {isThaiLocale ? 'กิจกรรมล่าสุด' : 'System Event Logs'}
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Historical system-wide delta logs</CardDescription>
              </CardHeader>
              <CardContent className="p-12 pt-6">
                <div className="space-y-8">
                  {[
                    { label: 'ผู้ป่วยใหม่ลงทะเบียน', sub: 'สมชาย ใจดี - 15 นาทีที่แล้ว', color: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' },
                    { label: 'นัดหมายสำเร็จ', sub: 'สุดา ดีมาก - 1 ชั่วโมงที่แล้ว', color: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' },
                    { label: 'สต็อกต่ำ - ต้องสั่งซื้อ', sub: 'เซรั่มวิตามินซี - 2 ชั่วโมงที่แล้ว', color: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' }
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-8 group">
                      <div className={cn("h-2.5 w-2.5 rounded-full mt-2 shrink-0 transition-transform duration-500 group-hover:scale-150", log.color)} />
                      <div className="flex-1 space-y-1">
                        <p className="text-lg font-bold text-white italic group-hover:text-pink-400 transition-colors">{log.label}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{log.sub}</p>
                      </div>
                      <div className="h-px w-full bg-gradient-to-r from-white/5 to-transparent absolute bottom-[-16px] left-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Super Admin Elite Tier section */}
          {isSuperAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="border-pink-500/20 bg-pink-500/[0.02] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-[0_0_80px_-20px_rgba(236,72,153,0.2)] group relative">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                  <Settings className="w-64 h-64 text-pink-500" />
                </div>
                <CardContent className="p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
                  <div className="space-y-6 flex-1">
                    <Badge className="bg-pink-600 text-white px-6 py-2 rounded-full border-none shadow-2xl shadow-pink-600/40 uppercase tracking-[0.2em] text-[10px] font-black italic">SUPER ADMIN GATEWAY</Badge>
                    <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight italic">
                      Elite Command Panel
                    </h2>
                    <p className="text-xl text-slate-400 font-light italic leading-relaxed max-w-xl">
                      Access top-tier system orchestration and global clinic management parameters.
                    </p>
                  </div>
                  <div className="shrink-0 w-full lg:w-auto">
                    <Button size="xl" className="w-full lg:w-auto h-20 px-16 rounded-[2rem] bg-pink-600 text-white hover:bg-pink-500 shadow-2xl shadow-pink-600/40 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" asChild>
                      <Link href={lp('/super-admin')}>
                        Authorize Terminal
                        <ArrowRight className="ml-4 h-7 w-7" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
