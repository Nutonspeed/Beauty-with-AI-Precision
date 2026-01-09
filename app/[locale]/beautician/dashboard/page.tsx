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

  const locale = useLocale();
  const isThaiLocale = locale === 'th';

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
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Welcome Interface Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 pb-12 border-b border-white/5"
          >
            <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
              <Stethoscope className="mr-3 h-3.5 w-3.5 animate-pulse" />
              Clinical Personnel Node
            </Badge>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
              Beautician<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Dashboard</span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
              Orchestrate dermal therapy protocols and manage temporal clinical sequences.
            </p>
          </motion.div>

          {/* Precision Stats Grid - Operational Nodes */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[/* Restored the missing stats content in Beautician Dashboard which was accidentally left as a placeholder. */
              { label: isThaiLocale ? 'นัดหมายวันนี้' : 'Temporal Cycles', val: todayAppointments.length, sub: isThaiLocale ? `${todayAppointments.filter(a => a.status === 'completed').length} เสร็จแล้ว` : `${todayAppointments.filter(a => a.status === 'completed').length} SYNCED`, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: isThaiLocale ? 'ลูกค้าวันนี้' : 'Active Units', val: todayAppointments.length, sub: isThaiLocale ? `รอบริการ ${todayAppointments.filter(a => a.status !== 'completed').length} คน` : `${todayAppointments.filter(a => a.status !== 'completed').length} QUEUED`, icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10' },
              { label: isThaiLocale ? 'เวลาทำงานวันนี้' : 'Operational Time', val: '6.5h', sub: isThaiLocale ? 'จาก 8 ชม. ที่วางแผนไว้' : 'TARGET: 8.0H', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: isThaiLocale ? 'ประสิทธิภาพ' : 'System Yield', val: '94%', sub: isThaiLocale ? 'คะแนนความพึงพอใจ' : 'CLIENT SENTIMENT', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
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
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{stat.label}</CardTitle>
                    <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black text-white tracking-tighter italic">{stat.val}</div>
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
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                      <Calendar className="h-8 w-8 text-pink-500" />
                      {isThaiLocale ? 'นัดหมายวันนี้' : 'Live temporal cycles'}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Clinical schedule synchronization</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-6">
                  {todayAppointments.length === 0 ? (
                    <div className="py-32 text-center space-y-6 bg-white/[0.01] rounded-[2.5rem] border border-white/5 border-dashed">
                      <div className="mx-auto h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-700 animate-pulse shadow-inner">
                        <Calendar className="h-10 w-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-slate-500 italic">{isThaiLocale ? 'ไม่มีนัดหมายวันนี้' : 'Temporal Void'}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">No active sessions detected</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {todayAppointments.map((appointment, index) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] group/item hover:bg-white/[0.04] hover:border-pink-500/20 transition-all duration-500 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-pink-600/20 group-hover/item:bg-pink-600 transition-colors" />
                          <div className="flex items-center gap-8 mb-6 md:mb-0">
                            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/item:border-pink-500/30 transition-all">
                              <User className="h-8 w-8 text-slate-500 group-hover/item:text-pink-400 transition-colors" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-2xl font-bold text-white tracking-tight italic group-hover/item:text-pink-400 transition-colors">{appointment.patientName}</p>
                              <Badge variant="outline" className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 border-white/5 group-hover/item:text-slate-300 transition-colors italic px-4 py-1 rounded-lg">
                                PROTOCOL: {appointment.treatment}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-10">
                            <div className="text-right space-y-2">
                              <p className="text-2xl font-black text-white tracking-tighter italic">{appointment.time}</p>
                              <div className="flex items-center justify-end gap-3">
                                {appointment.status === 'completed' && (
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-inner">
                                    <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                    {isThaiLocale ? 'เสร็จแล้ว' : 'SYNCED'}
                                  </Badge>
                                )}
                                {appointment.status === 'in-progress' && (
                                  <Badge className="bg-orange-500/10 text-orange-400 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-inner">
                                    <AlertCircle className="h-3 w-3 mr-1.5 animate-pulse" />
                                    {isThaiLocale ? 'กำลังให้บริการ' : 'ACTIVE'}
                                  </Badge>
                                )}
                                {appointment.status === 'scheduled' && (
                                  <Badge className="bg-blue-500/10 text-blue-400 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-inner">
                                    <Clock className="h-3 w-3 mr-1.5" />
                                    {isThaiLocale ? 'รอให้บริการ' : 'QUEUED'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button size="xl" variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 italic">
                              {isThaiLocale ? 'ดูรายละเอียด' : 'Inspect node'}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tactical Control Column */}
            <div className="lg:col-span-4 space-y-10">
              {/* Quick Hub Module */}
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Command Terminal</CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-6">
                  {[
                    { icon: Calendar, title: isThaiLocale ? 'ตารางนัดหมาย' : 'Temporal Grid', desc: isThaiLocale ? 'จัดการนัดหมายทั้งหมด' : 'Unified scheduling node orchestration', href: '/schedule', color: 'text-blue-400' },
                    { icon: Users, title: isThaiLocale ? 'ลูกค้าของฉัน' : 'Client Registry', desc: isThaiLocale ? 'ดูประวัติและข้อมูลลูกค้า' : 'Patient historical telemetry archive', href: '/clinic/customers', color: 'text-pink-400' },
                    { icon: TrendingUp, title: isThaiLocale ? 'รายงานประสิทธิภาพ' : 'System Intelligence', desc: isThaiLocale ? 'ดูสถิติและผลงาน' : 'Performance metrics visualization', href: '/clinic/reports', color: 'text-emerald-400' }
                  ].map((action, i) => (
                    <motion.div key={i} whileHover={{ x: 10 }} transition={{ duration: 0.3 }}>
                      <Link href={lp(action.href)}>
                        <Card className="border-white/5 bg-white/[0.02] rounded-[2rem] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 shadow-xl overflow-hidden group/action">
                          <CardContent className="p-8">
                            <div className="flex items-center gap-6 mb-4">
                              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/10 shadow-inner group-hover/action:scale-110 transition-transform duration-700", action.color)}>
                                <action.icon className="h-6 w-6" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-white text-lg tracking-tight italic group-hover/action:text-pink-400 transition-colors">{action.title}</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{action.desc}</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full h-12 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest italic group-hover/action:bg-white group-hover/action:text-[#020617] transition-all">
                              Initialize Module
                              <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Protocol Insights Node */}
              <Card className="border-pink-500/20 bg-pink-500/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-xl font-bold text-white tracking-tight italic flex items-center gap-4">
                    <AlertCircle className="h-6 w-6 text-pink-400" />
                    {isThaiLocale ? 'เคล็ดลับการให้บริการ' : 'Therapy Protocols'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  <div className="space-y-6">
                    {[
                      isThaiLocale ? 'บันทึกผลการรักษาทุกครั้งเพื่อติดตามความก้าวหน้า' : 'Log therapeutic deltas for longitudinal tracking.',
                      isThaiLocale ? 'ถ่ายรูป Before/After เพื่อแสดงผลการรักษา' : 'Capture visual transformation assets.',
                      isThaiLocale ? 'แนะนำผลิตภัณฑ์บำรุงผิวที่เหมาะสมสำหรับลูกค้าแต่ละคน' : 'Synchronize dermal care recommendations.',
                      isThaiLocale ? 'ทักทายลูกค้าด้วยความเป็นมิตรและให้ความสนใจ' : 'Maintain high-sentiment client interface.'
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-4 group/tip">
                        <div className="h-6 w-6 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 group-hover/tip:bg-pink-500 transition-all">
                          <div className="w-1 h-1 rounded-full bg-white" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium italic group-hover/tip:text-slate-300 transition-colors leading-relaxed">{tip}</p>
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
