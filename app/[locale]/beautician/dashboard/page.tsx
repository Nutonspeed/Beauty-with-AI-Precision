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
  User,
  Stethoscope,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

interface Appointment {
  id: string;
  clientName: string;
  program: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export default function BeauticianDashboard() {
  const t = useTranslations();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  const [isLoading, setIsLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  const locale = useLocale();
  const isThaiLocale = locale === 'th';

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(lp('/auth/login'));
      return;
    }

    // Only center_staff, center_owner, or super_admin can access
    const allowedRoles = ['center_staff', 'center_owner', 'super_admin'];
    if (!allowedRoles.includes(user.role)) {
      router.push(lp('/unauthorized'));
      return;
    }

    // Load appointment data
    const loadData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/beautician/appointments?date=${today}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        
        const data = await response.json();
        setTodayAppointments(data.appointments || []);
      } catch (error) {
        console.error('Error loading appointment data:', error);
        setTodayAppointments([]);
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

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Welcome Interface Header */}
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Stethoscope className="mr-3 h-3.5 w-3.5" />
                  Aesthetic Personnel Node
                </Badge>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                  Beautician<br />
                  <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Dashboard</span>
                </h1>
                <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                  Orchestrate aesthetic program protocols and manage temporal service sequences with precision.
                </p>
              </motion.div>
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] p-8 transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm group-hover:scale-110 transition-transform duration-700">
                    <User className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic group-hover:text-slate-900 transition-colors">{t('common.profile')}</p>
                    <p className="text-xl font-black text-slate-950 italic uppercase tracking-tight">{user?.full_name || 'Personnel Node'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Precision Stats Grid - Operational Nodes */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: isThaiLocale ? 'นัดหมายวันนี้' : 'Temporal Cycles', val: todayAppointments.length, sub: isThaiLocale ? `${todayAppointments.filter(a => a.status === 'completed').length} เสร็จสิ้น` : `${todayAppointments.filter(a => a.status === 'completed').length} SYNCED`, icon: Calendar, color: 'text-pink-600', bg: 'bg-pink-50' },
              { label: isThaiLocale ? 'ผู้รับบริการวันนี้' : 'Active Units', val: todayAppointments.length, sub: isThaiLocale ? `รอบริการ ${todayAppointments.filter(a => a.status !== 'completed').length} ท่าน` : `${todayAppointments.filter(a => a.status !== 'completed').length} QUEUED`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: isThaiLocale ? 'เวลาทำงานวันนี้' : 'Operational Time', val: '6.5h', sub: isThaiLocale ? 'จาก 8 ชม. ที่วางแผนไว้' : 'TARGET: 8.0H', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: isThaiLocale ? 'ประสิทธิภาพ' : 'System Yield', val: '94%', sub: isThaiLocale ? 'คะแนนความพึงพอใจ' : 'CLIENT SENTIMENT', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{stat.label}</CardTitle>
                    <div className={cn("p-3 rounded-2xl border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0">
                    <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase">{stat.val}</div>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-4 text-slate-400 italic group-hover:text-slate-600 transition-colors">
                      {stat.sub}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-12">
            {/* Cycle Registry Column */}
            <div className="lg:col-span-8 space-y-10">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                  <div className="space-y-3">
                    <CardTitle className="text-3xl font-black text-slate-950 tracking-tight italic flex items-center gap-5 uppercase">
                      <div className="p-3 bg-pink-50 rounded-2xl shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                        <Calendar className="h-8 w-8 text-pink-600 group-hover:text-white" />
                      </div>
                      {isThaiLocale ? 'นัดหมายวันนี้' : 'Live temporal cycles'}
                    </CardTitle>
                    <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">Aesthetic schedule synchronization</CardDescription>
                  </div>
                  <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-sm italic shrink-0">
                    <Clock className="mr-3 h-4 w-4" />
                    Full Timeline
                  </Button>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 bg-slate-50/30">
                  <AnimatePresence mode="popLayout">
                    {todayAppointments.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 text-center space-y-10 bg-white rounded-[3rem] border border-slate-100 border-dashed italic shadow-inner"
                      >
                        <div className="mx-auto h-28 w-28 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-sm">
                          <Calendar className="h-14 w-14" />
                        </div>
                        <div className="space-y-4">
                          <p className="text-3xl font-black text-slate-950 italic uppercase tracking-tight">{isThaiLocale ? 'ไม่มีนัดหมายวันนี้' : 'Temporal Void'}</p>
                          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">No active sessions detected in current node</p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="grid gap-8">
                        {todayAppointments.map((appointment, index) => (
                          <motion.div
                            key={appointment.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col md:flex-row md:items-center justify-between p-10 rounded-[3rem] border border-slate-100 bg-white group/item hover:border-pink-500/20 transition-all duration-700 relative overflow-hidden shadow-sm hover:shadow-premium"
                          >
                            <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-pink-500 to-blue-600 opacity-10 group-hover/item:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-10 mb-8 md:mb-0">
                              <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/item:border-pink-500/30 transition-all duration-700">
                                <User className="h-10 w-10 text-slate-300 group-hover/item:text-pink-600 transition-colors" />
                              </div>
                              <div className="space-y-3">
                                <p className="text-3xl font-black text-slate-950 tracking-tight italic group-hover/item:text-pink-600 transition-colors uppercase">{appointment.clientName}</p>
                                <Badge variant="outline" className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-none group-hover/item:text-blue-600 transition-colors italic px-5 py-1.5 rounded-full shadow-sm">
                                  PROTOCOL: {appointment.program}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-12">
                              <div className="text-right space-y-3">
                                <p className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase">{appointment.time}</p>
                                <div className="flex items-center justify-end gap-4">
                                  {appointment.status === 'completed' && (
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-widest italic shadow-sm">
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                      {isThaiLocale ? 'เสร็จแล้ว' : 'SYNCED'}
                                    </Badge>
                                  )}
                                  {appointment.status === 'in-progress' && (
                                    <Badge className="bg-pink-50 text-pink-600 border-none rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-widest italic shadow-sm animate-pulse">
                                      <AlertCircle className="h-3.5 w-3.5 mr-2" />
                                      {isThaiLocale ? 'กำลังให้บริการ' : 'ACTIVE'}
                                    </Badge>
                                  )}
                                  {appointment.status === 'scheduled' && (
                                    <Badge className="bg-slate-50 text-slate-400 border-none rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-widest italic shadow-sm">
                                      <Clock className="h-3.5 w-3.5 mr-2" />
                                      {isThaiLocale ? 'รอให้บริการ' : 'QUEUED'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button size="icon" variant="outline" className="h-16 w-16 rounded-[1.5rem] border-slate-200 bg-white hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 hover:text-white hover:border-none transition-all duration-500 shadow-premium hover:scale-110">
                                <ChevronRight className="h-8 w-8" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>

            {/* Tactical Control Column */}
            <div className="lg:col-span-4 space-y-10">
              {/* Quick Hub Module */}
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50">
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                    Command Terminal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-8 bg-slate-50/30">
                  {[
                    { icon: Calendar, title: isThaiLocale ? 'ตารางนัดหมาย' : 'Temporal Grid', desc: isThaiLocale ? 'จัดการนัดหมายทั้งหมด' : 'Unified scheduling node orchestration', href: '/center/appointments', color: 'text-pink-600', bg: 'bg-pink-50' },
                    { icon: Users, title: isThaiLocale ? 'ทะเบียนผู้รับบริการ' : 'Client Registry', desc: isThaiLocale ? 'ดูประวัติและข้อมูลผู้รับบริการ' : 'Client historical telemetry archive', href: '/center/clients', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: TrendingUp, title: isThaiLocale ? 'รายงานประสิทธิภาพ' : 'System Intelligence', desc: isThaiLocale ? 'ดูสถิติและผลงาน' : 'Performance metrics visualization', href: '/center/revenue', color: 'text-purple-600', bg: 'bg-purple-50' }
                  ].map((action, i) => (
                    <motion.div key={i} whileHover={{ x: 12 }} transition={{ duration: 0.5 }}>
                      <Link href={lp(action.href)}>
                        <Card className="border-slate-100 bg-white rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-700 shadow-sm overflow-hidden group/action">
                          <CardContent className="p-8">
                            <div className="flex items-center gap-6 mb-8">
                              <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner group-hover/action:scale-110 transition-transform duration-700", action.bg)}>
                                <action.icon className={cn("h-8 w-8", action.color)} />
                              </div>
                              <div className="space-y-1.5">
                                <h4 className="font-black text-slate-950 text-xl tracking-tight italic group-hover/action:text-pink-600 transition-colors uppercase leading-none">{action.title}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{action.desc}</p>
                              </div>
                            </div>
                            <Button variant="premium" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic shadow-xl shadow-pink-500/10 transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white">
                              Initialize Module
                              <ArrowRight className="ml-3 h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Protocol Insights Node */}
              <Card className="border-pink-100 bg-pink-50/10 shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-pink-50">
                  <CardTitle className="text-2xl font-black text-slate-950 tracking-tight italic flex items-center gap-5 uppercase leading-none">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      <Sparkles className="h-8 w-8 text-pink-600 animate-pulse" />
                    </div>
                    {isThaiLocale ? 'เคล็ดลับการให้บริการ' : 'Aesthetic Protocols'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 bg-white/50">
                  <div className="space-y-8">
                    {[
                      isThaiLocale ? 'บันทึกผลโปรแกรมความงามทุกครั้งเพื่อติดตามความก้าวหน้า' : 'Log aesthetic deltas for longitudinal tracking.',
                      isThaiLocale ? 'ถ่ายรูป Before/After เพื่อแสดงผลลัพธ์ที่ชัดเจน' : 'Capture visual transformation assets.',
                      isThaiLocale ? 'แนะนำผลิตภัณฑ์บำรุงผิวที่เหมาะสมสำหรับผู้รับบริการแต่ละท่าน' : 'Synchronize dermal care recommendations.',
                      isThaiLocale ? 'ทักทายผู้รับบริการด้วยความเป็นมิตรและให้ความสนใจ' : 'Maintain high-sentiment client interface.'
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-5 group/tip">
                        <div className="h-7 w-7 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 group-hover/tip:bg-pink-500 transition-all duration-500">
                          <div className="w-2 h-2 rounded-full bg-pink-500 group-hover/tip:bg-white animate-pulse" />
                        </div>
                        <p className="text-base text-slate-500 font-medium italic group-hover/tip:text-slate-950 transition-colors leading-relaxed tracking-tight">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
