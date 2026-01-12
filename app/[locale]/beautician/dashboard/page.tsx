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
  Stethoscope
} from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

interface Appointment {
  id: string;
  clientName: string;
  program: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export default function BeauticianDashboard() {
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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
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
                <Badge variant="outline" className="px-4 py-1 rounded-full border-blue-500/30 text-blue-600 bg-blue-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-lg shadow-blue-500/5">
                  <Stethoscope className="mr-3 h-3.5 w-3.5 animate-pulse" />
                  Aesthetic Personnel Node
                </Badge>
                <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-slate-900 leading-[0.9] italic">
                  Beautician<br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent not-italic">Dashboard</span>
                </h1>
                <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                  Orchestrate aesthetic program protocols and manage temporal service sequences.
                </p>
              </motion.div>
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <Card className="bg-white/40 backdrop-blur-md border-white/60 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('common.profile')}</p>
                    <p className="text-lg font-bold text-slate-900 italic">{user?.full_name || 'Personnel Node'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Precision Stats Grid - Operational Nodes */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: isThaiLocale ? 'นัดหมายวันนี้' : 'Temporal Cycles', val: todayAppointments.length, sub: isThaiLocale ? `${todayAppointments.filter(a => a.status === 'completed').length} เสร็จสิ้น` : `${todayAppointments.filter(a => a.status === 'completed').length} SYNCED`, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: isThaiLocale ? 'ผู้รับบริการวันนี้' : 'Active Units', val: todayAppointments.length, sub: isThaiLocale ? `รอบริการ ${todayAppointments.filter(a => a.status !== 'completed').length} ท่าน` : `${todayAppointments.filter(a => a.status !== 'completed').length} QUEUED`, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: isThaiLocale ? 'เวลาทำงานวันนี้' : 'Operational Time', val: '6.5h', sub: isThaiLocale ? 'จาก 8 ชม. ที่วางแผนไว้' : 'TARGET: 8.0H', icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50' },
              { label: isThaiLocale ? 'ประสิทธิภาพ' : 'System Yield', val: '94%', sub: isThaiLocale ? 'คะแนนความพึงพอใจ' : 'CLIENT SENTIMENT', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white bg-white/60 backdrop-blur-xl rounded-[2.5rem] hover:bg-white/80 transition-all duration-500 group shadow-premium relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{stat.label}</CardTitle>
                    <div className={cn("p-3 rounded-2xl border border-white shadow-inner group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter italic">{stat.val}</div>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-3 text-slate-500 italic">
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
              <Card className="border-white bg-white/60 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight italic flex items-center gap-4">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      {isThaiLocale ? 'นัดหมายวันนี้' : 'Live temporal cycles'}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aesthetic schedule synchronization</CardDescription>
                  </div>
                  <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest italic hover:bg-slate-50">
                    <Clock3 className="mr-2 h-4 w-4" />
                    Full Timeline
                  </Button>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  <AnimatePresence mode="popLayout">
                    {todayAppointments.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 text-center space-y-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-200 border-dashed"
                      >
                        <div className="mx-auto h-20 w-20 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 animate-pulse shadow-sm">
                          <Calendar className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xl font-bold text-slate-400 italic">{isThaiLocale ? 'ไม่มีนัดหมายวันนี้' : 'Temporal Void'}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No active sessions detected</p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="grid gap-6">
                        {todayAppointments.map((appointment, index) => (
                          <motion.div
                            key={appointment.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2.5rem] border border-slate-100 bg-white/40 group/item hover:bg-white hover:border-blue-500/20 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-lg"
                          >
                            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-600/10 group-hover/item:bg-blue-600 transition-colors" />
                            <div className="flex items-center gap-8 mb-6 md:mb-0">
                              <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/item:border-blue-500/30 transition-all">
                                <User className="h-8 w-8 text-slate-400 group-hover/item:text-blue-600 transition-colors" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-2xl font-bold text-slate-900 tracking-tight italic group-hover/item:text-blue-600 transition-colors">{appointment.clientName}</p>
                                <Badge variant="outline" className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 border-slate-200 group-hover/item:text-blue-600 group-hover/item:border-blue-100 transition-colors italic px-4 py-1 rounded-lg">
                                  PROTOCOL: {appointment.program}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-10">
                              <div className="text-right space-y-2">
                                <p className="text-2xl font-black text-slate-900 tracking-tighter italic">{appointment.time}</p>
                                <div className="flex items-center justify-end gap-3">
                                  {appointment.status === 'completed' && (
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-sm">
                                      <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                      {isThaiLocale ? 'เสร็จแล้ว' : 'SYNCED'}
                                    </Badge>
                                  )}
                                  {appointment.status === 'in-progress' && (
                                    <Badge className="bg-blue-50 text-blue-600 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-sm">
                                      <AlertCircle className="h-3 w-3 mr-1.5 animate-pulse" />
                                      {isThaiLocale ? 'กำลังให้บริการ' : 'ACTIVE'}
                                    </Badge>
                                  )}
                                  {appointment.status === 'scheduled' && (
                                    <Badge className="bg-slate-100 text-slate-500 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-sm">
                                      <Clock className="h-3 w-3 mr-1.5" />
                                      {isThaiLocale ? 'รอให้บริการ' : 'QUEUED'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button size="icon" variant="outline" className="h-14 w-14 rounded-2xl border-slate-200 bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
                                <ChevronRight className="h-6 w-6" />
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
              <Card className="border-white bg-white/60 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-100">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Command Terminal</CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-6">
                  {[
                    { icon: Calendar, title: isThaiLocale ? 'ตารางนัดหมาย' : 'Temporal Grid', desc: isThaiLocale ? 'จัดการนัดหมายทั้งหมด' : 'Unified scheduling node orchestration', href: '/center/appointments', color: 'text-blue-600' },
                    { icon: Users, title: isThaiLocale ? 'ทะเบียนผู้รับบริการ' : 'Client Registry', desc: isThaiLocale ? 'ดูประวัติและข้อมูลผู้รับบริการ' : 'Client historical telemetry archive', href: '/center/clients', color: 'text-indigo-600' },
                    { icon: TrendingUp, title: isThaiLocale ? 'รายงานประสิทธิภาพ' : 'System Intelligence', desc: isThaiLocale ? 'ดูสถิติและผลงาน' : 'Performance metrics visualization', href: '/center/revenue', color: 'text-emerald-600' }
                  ].map((action, i) => (
                    <motion.div key={i} whileHover={{ x: 10 }} transition={{ duration: 0.3 }}>
                      <Link href={lp(action.href)}>
                        <Card className="border-white bg-white/40 rounded-[2rem] hover:bg-white hover:border-blue-500/20 transition-all duration-500 shadow-sm hover:shadow-xl overflow-hidden group/action">
                          <CardContent className="p-8">
                            <div className="flex items-center gap-6 mb-6">
                              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 shadow-inner group-hover/action:scale-110 transition-transform duration-700", action.color)}>
                                <action.icon className="h-7 w-7" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-slate-900 text-xl tracking-tight italic group-hover/action:text-blue-600 transition-colors">{action.title}</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{action.desc}</p>
                              </div>
                            </div>
                            <Button variant="premium" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-blue-600/10">
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
              <Card className="border-blue-500/20 bg-blue-500/[0.02] backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-blue-500/10">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight italic flex items-center gap-4">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                    {isThaiLocale ? 'เคล็ดลับการให้บริการ' : 'Aesthetic Protocols'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  <div className="space-y-6">
                    {[
                      isThaiLocale ? 'บันทึกผลโปรแกรมความงามทุกครั้งเพื่อติดตามความก้าวหน้า' : 'Log aesthetic deltas for longitudinal tracking.',
                      isThaiLocale ? 'ถ่ายรูป Before/After เพื่อแสดงผลลัพธ์ที่ชัดเจน' : 'Capture visual transformation assets.',
                      isThaiLocale ? 'แนะนำผลิตภัณฑ์บำรุงผิวที่เหมาะสมสำหรับผู้รับบริการแต่ละท่าน' : 'Synchronize dermal care recommendations.',
                      isThaiLocale ? 'ทักทายผู้รับบริการด้วยความเป็นมิตรและให้ความสนใจ' : 'Maintain high-sentiment client interface.'
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-4 group/tip">
                        <div className="h-6 w-6 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shrink-0 group-hover/tip:bg-blue-600 transition-all">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover/tip:bg-white" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium italic group-hover/tip:text-slate-900 transition-colors leading-relaxed">{tip}</p>
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

      <Footer />
    </div>
  );
}
