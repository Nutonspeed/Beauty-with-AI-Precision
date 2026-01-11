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
import { useLocalizePath } from '@/lib/i18n/locale-link';
import type { UserRole } from '@/lib/auth/role-config';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface CustomerDashboardProps {
  role: UserRole;
}

export default function CustomerDashboard({ role }: CustomerDashboardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isThaiLocale = locale === 'th';
  const isPremium = role === 'premium_customer';
  const [showOnboarding, setShowOnboarding] = useState(false);
  const lp = useLocalizePath();

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
          {/* Onboarding Infrastructure */}
          <AnimatePresence>
            {showOnboarding && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Alert className="border-pink-500/20 bg-pink-500/[0.02] backdrop-blur-3xl rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                    <Lightbulb className="w-32 h-32 text-pink-500" />
                  </div>
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 shadow-inner">
                      <Lightbulb className="h-8 w-8 text-pink-400 animate-pulse" />
                    </div>
                    <AlertDescription className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
                      <div className="space-y-2 text-center md:text-left">
                        <p className="text-2xl font-bold text-white tracking-tight italic">
                          {isThaiLocale ? 'ยินดีต้อนรับสู่ CenterIQ AI! 👋' : 'Welcome to CenterIQ AI! 👋'}
                        </p>
                        <p className="text-slate-400 font-light tracking-wide italic">
                          {isThaiLocale 
                            ? 'ใหม่กับระบบหรือเปล่า? ดูคู่มือเริ่มต้นใช้งาน 3 ขั้นตอน (ใช้เวลา 2 นาที)' 
                            : 'New to the system? View our 3-step initialization guide (2 min).'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-12 px-8" onClick={dismissOnboarding}>
                          {isThaiLocale ? 'ข้ามไป' : 'Bypass'}
                        </Button>
                        <Button variant="premium" className="rounded-xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest h-12 px-8" asChild>
                          <Link href={lp('/onboarding/customer')}>
                            {isThaiLocale ? 'ดูคู่มือ' : 'Initialize Guide'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Welcome Interface Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-pink-500/50" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/60 italic">System Status: Operational</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
              {isThaiLocale ? 'ยินดีต้อนรับสู่' : 'Welcome to'}<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent italic">
                CenterIQ <span className="not-italic">AI</span>
              </span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic">
              {isThaiLocale ? 'เริ่มต้นการดูแลผิวพรรณของคุณด้วยระบบสังเคราะห์ความแม่นยำสูง' : 'Initialize your aesthetic journey with precision AI synthesis.'}
            </p>
          </motion.div>

          {/* Quick Actions Grid - Infrastructure Modules */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                icon: Camera, 
                title: isThaiLocale ? 'วิเคราะห์ผิวหน้า' : 'Skin Synthesis', 
                desc: isThaiLocale ? 'อัปโหลดภาพเพื่อวิเคราะห์สภาพผิวด้วย AI' : 'Perform high-precision AI skin diagnostic.',
                href: '/analysis',
                cta: isThaiLocale ? 'เริ่มวิเคราะห์' : 'Begin Synthesis',
                color: 'from-blue-500/20 to-indigo-600/20',
                iconColor: 'text-blue-400',
                badge: !isPremium ? (isThaiLocale ? 'ฟรี' : 'OPEN') : null
              },
              { 
                icon: Sparkles, 
                title: isThaiLocale ? 'ทดลอง AR' : 'AR Simulation', 
                desc: isThaiLocale ? 'ดูผลการรักษาแบบ 3D ก่อนตัดสินใจ' : 'Visualize program outcomes in real-time 3D.',
                href: '/ar-simulator',
                cta: isThaiLocale ? 'เริ่มทดลอง' : 'Initialize AR',
                color: 'from-purple-500/20 to-pink-600/20',
                iconColor: 'text-purple-400',
                badge: !isPremium ? (isThaiLocale ? 'ฟรี' : 'OPEN') : null,
                variant: 'outline'
              },
              { 
                icon: Star, 
                title: isThaiLocale ? 'คำแนะนำเฉพาะคุณ' : 'Aesthetic Protocol', 
                desc: isThaiLocale ? 'ดูคำแนะนำจาก AI ที่ปรับแต่งเฉพาะผิวคุณ' : 'View personalized program algorithms.',
                href: '/recommendations',
                cta: isThaiLocale ? 'ดูคำแนะนำ' : 'View Protocol',
                color: 'from-amber-500/20 to-orange-600/20',
                iconColor: 'text-amber-400',
                badge: 'AI',
                premium: true
              },
              { 
                icon: Calendar, 
                title: isThaiLocale ? 'จองนัดหมาย' : 'Access Node', 
                desc: isThaiLocale ? 'จองนัดกับผู้เชี่ยวชาญของเรา' : 'Secure a diagnostic session with experts.',
                href: '/booking',
                cta: isThaiLocale ? 'จองเลย' : 'Secure Session',
                color: 'from-emerald-500/20 to-teal-600/20',
                iconColor: 'text-emerald-400',
                variant: 'outline'
              },
              { 
                icon: BarChart3, 
                title: isThaiLocale ? 'ติดตามความก้าวหน้า' : 'Metrics Progress', 
                desc: isThaiLocale ? 'ดูกราฟและเปรียบเทียบผลการรักษา' : 'Analyze program efficacy trends.',
                href: '/analysis/progress',
                cta: isThaiLocale ? 'ดูความก้าวหน้า' : 'View Metrics',
                color: 'from-cyan-500/20 to-blue-500/20',
                iconColor: 'text-cyan-400',
                variant: 'outline'
              },
              { 
                icon: History, 
                title: isThaiLocale ? 'ประวัติการวิเคราะห์' : 'Diagnostic History', 
                desc: isThaiLocale ? 'ดูภาพและผลการวิเคราะห์ย้อนหลัง' : 'Review historical synthesis logs.',
                href: '/analysis/history',
                cta: isThaiLocale ? 'ดูประวัติ' : 'Review Logs',
                color: 'from-rose-500/20 to-red-600/20',
                iconColor: 'text-rose-400',
                variant: 'outline'
              }
            ].map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] transition-all duration-700 hover:bg-white/[0.03] hover:border-white/10 group shadow-2xl relative overflow-hidden ${action.premium ? 'border-amber-500/20' : ''}`}>
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <CardHeader className="p-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${action.color} border border-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3`}>
                        <action.icon className={`h-8 w-8 ${action.iconColor}`} />
                      </div>
                      {action.badge && (
                        <Badge className={`${action.premium ? 'bg-amber-600/20 text-amber-400 border-amber-500/30' : 'bg-white/[0.03] text-slate-500 border-white/10'} uppercase tracking-[0.2em] text-[9px] font-black italic`}>
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{action.title}</CardTitle>
                      <CardDescription className="text-sm text-slate-500 font-light leading-relaxed italic">{action.desc}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0">
                    <Button 
                      asChild 
                      variant={(action.variant as any) || "premium"} 
                      className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-[1.02] active:scale-[0.98] ${action.premium ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : ''}`}
                    >
                      <Link href={lp(action.href)}>
                        {action.cta}
                        <ArrowRight className="ml-3 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Getting Started Guide Infrastructure */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <CardHeader className="p-12 pb-6">
                  <CardTitle className="text-3xl font-bold text-white tracking-tight italic">{isThaiLocale ? 'เริ่มต้นใช้งาน' : 'System Initialization'}</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{isThaiLocale ? 'ทำตามขั้นตอนเหล่านี้เพื่อประสบการณ์ที่ดีที่สุด' : 'Follow protocol for optimal performance'}</CardDescription>
                </CardHeader>
                <CardContent className="p-12 pt-6 space-y-8">
                  {[
                    { step: "1", title: isThaiLocale ? 'อัปโหลดรูปภาพผิวหน้า' : 'Ingest Dermal Assets', desc: isThaiLocale ? 'ถ่ายภาพในแสงสว่างเพียงพอ หน้าตรง ไม่เอียง' : 'Capture clinical-grade direct orientation images.' },
                    { step: "2", title: isThaiLocale ? 'รับผลการวิเคราะห์จาก AI' : 'Execute AI Synthesis', desc: isThaiLocale ? 'ดู Heatmap และคำแนะนำโปรแกรม' : 'Generate diagnostic heatmaps and recommendations.' },
                    { step: "3", title: isThaiLocale ? 'ทดลอง AR Simulator' : 'AR Outcome Simulation', desc: isThaiLocale ? 'ดูผลโปรแกรมแบบ 3D ก่อนตัดสินใจ' : 'Simulate therapeutic results in real-time 3D.' },
                    { step: "4", title: isThaiLocale ? 'จองนัดหมายผู้เชี่ยวชาญ' : 'Authorize Consultant', desc: isThaiLocale ? 'ปรึกษาแผนงานโปรแกรมที่เหมาะสมกับคุณ' : 'Confirm clinical implementation parameters.' }
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-6 group">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 text-[10px] font-black text-slate-500 group-hover:text-pink-400 group-hover:border-pink-500/30 transition-all shadow-inner italic">
                        {s.step}
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{s.title}</p>
                        <p className="text-sm text-slate-500 font-light italic leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full h-16 rounded-[1.5rem] border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 mt-6">
                    <Link href={lp('/onboarding/customer')}>
                      {isThaiLocale ? 'ดูคู่มือการใช้งานแบบเต็ม' : 'Full Protocol Manual'}
                      <ArrowRight className="ml-3 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity Module */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                <CardHeader className="p-12 pb-6">
                  <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                    <History className="h-8 w-8 text-pink-500" />
                    {isThaiLocale ? 'ประวัติการใช้งาน' : 'System Logs'}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{isThaiLocale ? 'การวิเคราะห์และนัดหมายล่าสุดของคุณ' : 'Historical diagnostic and access nodes'}</CardDescription>
                </CardHeader>
                <CardContent className="p-12 pt-6">
                  <div className="text-center py-20 space-y-8 bg-white/[0.01] rounded-[2rem] border border-white/5 border-dashed">
                    <div className="mx-auto h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-700 animate-pulse">
                      <FileText className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-slate-400 italic">{isThaiLocale ? 'ยังไม่มีประวัติการใช้งาน' : 'Logs Empty'}</p>
                      <p className="text-sm text-slate-600 font-light italic">{isThaiLocale ? 'เริ่มต้นด้วยการวิเคราะห์ผิวหน้าครั้งแรกของคุณ!' : 'Execute your first clinical synthesis.'}</p>
                    </div>
                    <Button asChild variant="premium" className="h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-pink-500/20">
                      <Link href={lp('/analysis')}>
                        {isThaiLocale ? 'วิเคราะห์เลย' : 'Begin Log'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Premium Deployment Infrastructure CTA */}
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="border-pink-500/20 bg-pink-500/[0.02] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-[0_0_80px_-20px_rgba(236,72,153,0.2)] group relative">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                  <TrendingUp className="w-64 h-64 text-pink-500" />
                </div>
                <CardContent className="p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
                  <div className="space-y-10 flex-1">
                    <div className="space-y-4">
                      <Badge className="bg-pink-600 text-white px-6 py-2 rounded-full border-none shadow-2xl shadow-pink-600/40 uppercase tracking-[0.2em] text-[10px] font-black italic">ELITE UPGRADE</Badge>
                      <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight italic">
                        {isThaiLocale ? 'อัพเกรดเป็น Premium' : 'Deploy Premium Infrastructure'}
                      </h2>
                      <p className="text-xl text-slate-400 font-light italic leading-relaxed max-w-xl">
                        {isThaiLocale ? 'ปลดล็อคฟีเจอร์พิเศษเพื่อประสิทธิภาพการดูแลผิวขั้นสูงสุด' : 'Unlock elite aesthetic modules for maximum diagnostic performance.'}
                      </p>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-6">
                      {[
                        isThaiLocale ? 'วิเคราะห์ไม่จำกัดครั้ง' : 'Infinite Synthesis Cycles',
                        isThaiLocale ? 'รายงานแบบละเอียด พร้อม PDF' : 'Full Aesthetic Export (PDF)',
                        isThaiLocale ? 'ติดตามความก้าวหน้าแบบ Timeline' : 'Longitudinal Analytics',
                        isThaiLocale ? 'ปรึกษาผู้เชี่ยวชาญทาง Chat' : 'Direct Expert Gateway'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-4 group/item">
                          <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors italic">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="shrink-0 w-full lg:w-auto">
                    <Button size="xl" className="w-full lg:w-auto h-20 px-16 rounded-[2rem] bg-pink-600 text-white hover:bg-pink-500 shadow-2xl shadow-pink-600/40 text-lg font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95" asChild>
                      <Link href={lp('/pricing')}>
                        {isThaiLocale ? 'ดูแพ็กเกจ Premium' : 'Initialize Elite Tier'}
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
