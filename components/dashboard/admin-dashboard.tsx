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
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto">
          {/* Welcome Interface Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-5">
              <div className="h-1.5 w-16 bg-gradient-to-r from-pink-500 to-blue-600 rounded-full" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-600 italic animate-pulse">System Administrator Node: Online</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
              {isSuperAdmin ? 'Elite' : 'Aesthetic'}<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent italic not-italic block mt-6">
                Center <span className="not-italic">Control</span>
              </span>
            </h1>
            <p className="text-2xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
              {isThaiLocale ? 'จัดการและควบคุมเซ็นเตอร์ของคุณด้วยระบบอัจฉริยะ' : 'Command and monitor your aesthetic infrastructure with precision intelligence.'}
            </p>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: isThaiLocale ? 'ลูกค้าทั้งหมด' : 'Total Customers', val: data.stats.totalCustomers.toLocaleString(), sub: isThaiLocale ? `+${data.stats.newCustomersThisMonth} คนใหม่เดือนนี้` : `+${data.stats.newCustomersThisMonth} new this month`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: isThaiLocale ? 'นัดหมายวันนี้' : 'Sessions Today', val: data.stats.sessionsToday, sub: isThaiLocale ? `${data.stats.cancelledSessions} คนยกเลิก` : `${data.stats.cancelledSessions} cancelled`, icon: Calendar, color: 'text-pink-600', bg: 'bg-pink-50' },
              { label: isThaiLocale ? 'รายได้เดือนนี้' : 'Monthly Revenue', val: `฿${data.stats.monthlyRevenue.toLocaleString()}`, sub: `${data.stats.revenueChange >= 0 ? '+' : ''}${data.stats.revenueChange}% ${isThaiLocale ? 'จากเดือนที่แล้ว' : 'from last month'}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: data.stats.revenueChange >= 0 },
              { label: isThaiLocale ? 'สต็อกต่ำ' : 'Low Stock', val: data.stats.lowStockItems, sub: isThaiLocale ? 'ต้องสั่งเพิ่ม' : 'Order required', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-500 group relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-950 transition-colors italic">{stat.label}</CardTitle>
                    <div className={cn("p-3 rounded-xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-500", stat.bg)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase">{stat.val}</div>
                    <p className={cn("text-[9px] font-black uppercase tracking-widest mt-3 italic", stat.trend !== undefined ? (stat.trend ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400')}>
                      {stat.sub}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Appointments Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group hover:border-pink-500/20 transition-all duration-700 h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-12 pb-8 border-b border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-pink-50 rounded-2xl shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                        <Calendar className="h-8 w-8 text-pink-600 group-hover:text-white" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{isThaiLocale ? 'นัดหมายล่าสุด' : 'Aesthetic Sessions'}</CardTitle>
                        <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-pink-600 italic">Live scheduling synchronization</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-12 px-6 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium hover:bg-slate-50" asChild>
                      <Link href={lp('/admin/appointments')}>
                        View Node <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-12 space-y-6">
                  {data.recentSessions.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-6 rounded-[2rem] border border-slate-50 bg-slate-50/30 group hover:bg-white hover:border-pink-500/20 hover:shadow-premium transition-all duration-500">
                      <div className="space-y-2">
                        <p className="text-xl font-black text-slate-950 tracking-tight italic uppercase group-hover:text-pink-600 transition-colors">{session.customerName}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                          {session.program} • <span className="text-pink-500/60">{session.time}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={cn("px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border-none shadow-sm", 
                          session.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        )}>
                          {session.status === 'confirmed' ? (isThaiLocale ? 'ยืนยันแล้ว' : 'CONFIRMED') : (isThaiLocale ? 'รอการยืนยัน' : 'PENDING')}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-pink-50 text-slate-300 hover:text-pink-600 transition-all">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <div className="space-y-10">
              {/* Popular Programs Section */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group hover:border-blue-500/20 transition-all duration-700">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 pb-6 border-b border-slate-50">
                    <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase flex items-center gap-4">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      {isThaiLocale ? 'โปรแกรมยอดนิยม' : 'Popular Protocols'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    {data.popularPrograms.map((program, index) => (
                      <div key={index} className="space-y-3 group/item">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-950 group-hover/item:text-blue-600 transition-colors italic uppercase tracking-widest">{program.name}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{program.count} cycles</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(program.count / data.popularPrograms[0].count) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-glow-blue" 
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Inventory Section */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group hover:border-orange-500/20 transition-all duration-700">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 pb-6 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase flex items-center gap-4">
                        <Package className="h-6 w-6 text-orange-600" />
                        {isThaiLocale ? 'สินค้าใกล้หมด' : 'Inventory Depletion'}
                      </CardTitle>
                      <Button variant="outline" className="rounded-xl border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest h-10 px-4 italic hover:bg-slate-50 shadow-sm" asChild>
                        <Link href={lp('/admin/inventory')}>Audit</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-6">
                    {data.lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/30 border border-slate-50 group/item hover:bg-white hover:border-orange-500/20 transition-all duration-500">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-950 italic uppercase group-hover/item:text-orange-600 transition-colors">{item.name}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            REMAINING: <span className="text-orange-600 font-bold">{item.currentStock}</span> / MIN: {item.minStock}
                          </p>
                        </div>
                        <Button variant="premium" className="h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl shadow-pink-500/10 bg-slate-950 text-white border-none hover:bg-pink-600 transition-all italic">
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
              { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', title: isThaiLocale ? 'จัดการลูกค้า' : 'Customer Hub', desc: 'Aesthetic customer data orchestration', href: '/admin/customers' },
              { icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50', title: isThaiLocale ? 'จัดการพนักงาน' : 'Staff Allocation', desc: 'Staff allocation and scheduling node', href: '/admin/staff' },
              { icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', title: isThaiLocale ? 'จัดการสต็อก' : 'Asset Supply', desc: 'Asset supply chain management', href: '/admin/inventory' },
              { icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', title: isThaiLocale ? 'จัดการนัดหมาย' : 'Temporal Sync', desc: 'Temporal session synchronization', href: '/admin-dashboard/bookings' },
              { icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50', title: isThaiLocale ? 'รายงานและวิเคราะห์' : 'Global Intel', desc: 'Global performance intelligence', href: '/admin/reports' },
              { icon: Settings, color: 'text-slate-400', bg: 'bg-slate-50', title: isThaiLocale ? 'ตั้งค่าระบบ' : 'Aesthetic Config', desc: 'Aesthetic parameter configuration', href: '/admin-dashboard/settings' }
            ].map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 space-y-8">
                    <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border border-slate-50 shadow-inner transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3", action.bg)}>
                      <action.icon className={cn("h-8 w-8", action.color)} />
                    </div>
                    <div className="space-y-3">
                      <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic group-hover:text-pink-600 transition-colors uppercase leading-none">{action.title}</CardTitle>
                      <CardDescription className="text-lg text-slate-500 font-light leading-relaxed italic">{action.desc}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0">
                    <Button asChild variant="outline" className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-slate-200 bg-white text-slate-950 hover:bg-slate-50 hover:border-pink-500/30 transition-all italic shadow-sm">
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
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group hover:border-purple-500/20 transition-all duration-700">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50">
                <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase">
                  <div className="p-4 bg-purple-50 rounded-2xl shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-all duration-700">
                    <FileText className="h-8 w-8 text-purple-600 group-hover:text-white" />
                  </div>
                  {isThaiLocale ? 'กิจกรรมล่าสุด' : 'System Event Logs'}
                </CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-pink-600 mt-6 italic">Historical system-wide delta logs</CardDescription>
              </CardHeader>
              <CardContent className="p-12 lg:p-16">
                <div className="space-y-10">
                  {[
                    { label: isThaiLocale ? 'ลูกค้าใหม่ลงทะเบียน' : 'New Client Registration', sub: isThaiLocale ? 'สมชาย ใจดี - 15 นาทีที่แล้ว' : 'Somchai Jaidee - 15m ago', color: 'bg-blue-500' },
                    { label: isThaiLocale ? 'นัดหมายสำเร็จ' : 'Session Confirmation', sub: isThaiLocale ? 'สุดา ดีมาก - 1 ชั่วโมงที่แล้ว' : 'Suda Deemak - 1h ago', color: 'bg-emerald-500' },
                    { label: isThaiLocale ? 'สต็อกต่ำ - ต้องสั่งซื้อ' : 'Inventory Alert', sub: isThaiLocale ? 'เซรั่มวิตามินซี - 2 ชั่วโมงที่แล้ว' : 'Vitamin C Serum - 2h ago', color: 'bg-orange-500' }
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-8 group/item relative pb-10 last:pb-0">
                      {i < 2 && <div className="absolute left-[5px] top-6 w-px h-full bg-slate-100" />}
                      <div className={cn("h-3 w-3 rounded-full mt-2 shrink-0 transition-transform duration-500 group-hover/item:scale-150 relative z-10 shadow-lg", log.color)} />
                      <div className="flex-1 space-y-2">
                        <p className="text-xl font-black text-slate-950 italic uppercase group-hover/item:text-pink-600 transition-colors leading-none">{log.label}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{log.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Super Admin Elite Tier Section */}
          {isSuperAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="border-pink-500/20 bg-pink-50/10 shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/30">
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                  <Settings className="w-80 h-80 text-pink-500" />
                </div>
                <CardContent className="p-16 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-20 relative z-10">
                  <div className="space-y-10 flex-1">
                    <div className="space-y-6">
                      <Badge className="bg-pink-500 text-white px-8 py-3 rounded-full border-none shadow-2xl shadow-pink-500/40 uppercase tracking-[0.3em] text-[10px] font-black italic animate-glow-pulse">SUPER ADMIN GATEWAY</Badge>
                      <h2 className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter leading-[0.8] italic uppercase">
                        Elite Command<br />Panel
                      </h2>
                      <p className="text-2xl text-slate-500 font-light italic leading-relaxed max-w-2xl">
                        Access top-tier system orchestration and global center management parameters.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 w-full lg:w-auto">
                    <Button size="xl" className="w-full lg:w-auto h-24 px-20 rounded-[2.5rem] bg-slate-950 hover:bg-pink-600 text-white shadow-2xl shadow-pink-500/20 text-xl font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 italic border-none" asChild>
                      <Link href={lp('/super-admin')} className="flex items-center">
                        Authorize Terminal
                        <ArrowRight className="ml-6 h-8 w-8" />
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
