"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, MapPin, CheckCircle2, Clock } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function MySchedulePage() {
  const t = useTranslations()
  const locale = useLocale()

  // Mock schedule data
  const todaySchedule = [
    { time: "09:00", customer: t('mySchedule.mock.customer1'), program: "Botox", duration: t('mySchedule.mock.duration30'), room: t('mySchedule.mock.room1') },
    { time: "10:00", customer: t('mySchedule.mock.customer2'), program: "Filler", duration: t('mySchedule.mock.duration45'), room: t('mySchedule.mock.room2') },
    { time: "11:00", customer: t('mySchedule.mock.customer3'), program: "Laser", duration: t('mySchedule.mock.duration60'), room: t('mySchedule.mock.room1') },
    { time: "14:00", customer: t('mySchedule.mock.customer4'), program: "Facial", duration: t('mySchedule.mock.duration90'), room: t('mySchedule.mock.room3') },
    { time: "16:00", customer: t('mySchedule.mock.customer5'), program: "Consultation", duration: t('mySchedule.mock.duration30'), room: t('mySchedule.mock.room1') },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-5xl mx-auto flex-1">
          {/* Header - Temporal Operational Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <Calendar className="mr-3 h-3.5 w-3.5" />
                Specialist Operational Node
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                My<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Schedule</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                {t('mySchedule.today')} <span className="text-slate-950 font-black uppercase ml-2">{new Date().toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </p>
            </motion.div>
          </div>

          {/* Operational Metrics - Aesthetic Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: t('mySchedule.todayAppointments'), val: todaySchedule.length, color: 'text-blue-600', icon: Calendar },
              { label: t('mySchedule.completed'), val: '2', color: 'text-emerald-600', icon: CheckCircle2 },
              { label: t('mySchedule.pending'), val: '3', color: 'text-amber-600', icon: Clock }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardContent className="p-10 flex items-center justify-between">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{stat.label}</p>
                      <div className={cn("text-5xl font-black tracking-tighter italic uppercase", stat.color)}>{stat.val}</div>
                    </div>
                    <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center border transition-all duration-700 group-hover:scale-110 shadow-sm bg-slate-50 border-slate-100")}>
                      <stat.icon className={cn("h-8 w-8", stat.color)} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Schedule Architecture - Precision Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10 group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
              <CardHeader className="p-10 lg:p-16 pb-8 border-b border-slate-50">
                <div className="space-y-3">
                  <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase leading-none">
                    <div className="p-4 bg-pink-50 rounded-2xl shadow-sm">
                      <Calendar className="h-10 w-10 text-pink-600" />
                    </div>
                    {t('mySchedule.scheduleTitle')}
                  </CardTitle>
                  <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">Live temporal synchronization</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-10 lg:p-16 space-y-8 bg-slate-50/30">
                <AnimatePresence>
                  {todaySchedule.map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (index * 0.1) }}
                      className="group flex items-center gap-10 p-10 rounded-[2.5rem] border border-slate-100 bg-white hover:border-pink-500/20 hover:shadow-premium transition-all duration-700 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover:bg-pink-600 transition-all duration-700" />
                      
                      <div className="text-center min-w-[120px] space-y-2">
                        <div className="text-3xl font-black text-slate-950 tracking-tighter italic group-hover:text-pink-600 transition-colors uppercase">{item.time}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{item.duration}</div>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-pink-50 group-hover:border-pink-500/20 transition-all duration-700 shadow-inner">
                            <User className="h-7 w-7 text-slate-300 group-hover:text-pink-600 transition-colors" />
                          </div>
                          <div className="font-black text-2xl text-slate-950 tracking-tight italic group-hover:text-pink-600 transition-colors uppercase leading-none">{item.customer}</div>
                        </div>
                        <div className="pl-20">
                          <Badge variant="outline" className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-none group-hover:text-slate-900 transition-colors italic px-5 py-2 rounded-full shadow-sm">
                            PROTOCOL: {item.program}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-6">
                        <div className="flex items-center gap-4 text-slate-400 group-hover:text-slate-950 transition-colors bg-slate-50 px-5 py-2 rounded-full border border-slate-100 shadow-inner">
                          <MapPin className="h-4 w-4 text-pink-500/60" />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">{item.room}</span>
                        </div>
                        
                        <Badge className={cn(
                          "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm transition-all italic",
                          index < 2 
                            ? "bg-emerald-50 text-emerald-600" 
                            : "bg-slate-50 text-slate-400"
                        )}>
                          {index < 2 
                            ? t('mySchedule.done')
                            : t('mySchedule.pending')}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
