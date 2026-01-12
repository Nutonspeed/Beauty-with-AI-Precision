"use client"

import StaffScheduleClient from "@/app/centers/staff/my-schedule/schedule-client";
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, MapPin } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function MySchedulePage() {
  const t = useTranslations()
  const locale = useLocale()

  // Mock schedule data
  const todaySchedule = [
    { time: "09:00", customer: "คุณสมหญิง", program: "Botox", duration: "30 นาที", room: "ห้อง 1" },
    { time: "10:00", customer: "คุณมานี", program: "Filler", duration: "45 นาที", room: "ห้อง 2" },
    { time: "11:00", customer: "คุณวิชัย", program: "Laser", duration: "60 นาที", room: "ห้อง 1" },
    { time: "14:00", customer: "คุณสุดา", program: "Facial", duration: "90 นาที", room: "ห้อง 3" },
    { time: "16:00", customer: "คุณประภา", program: "Consultation", duration: "30 นาที", room: "ห้อง 1" },
  ]

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

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-12 max-w-5xl mx-auto flex-1">
          {/* Header - Temporal Operational Interface */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
              <Calendar className="mr-3 h-3.5 w-3.5 animate-pulse" />
              Specialist Operational Node
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[0.9] italic">
              My<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Schedule</span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-widest italic">
              {t('mySchedule.today')} {new Date().toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          {/* Operational Metrics - Aesthetic Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: t('mySchedule.todayAppointments'), val: todaySchedule.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: t('mySchedule.completed'), val: '2', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: t('mySchedule.pending'), val: '3', color: 'text-amber-400', bg: 'bg-amber-500/10' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden text-center">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <CardContent className="p-8">
                    <div className={cn("text-4xl font-black tracking-tighter italic mb-2", stat.color)}>{stat.val}</div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 italic">{stat.label}</p>
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
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
              <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                    <Calendar className="h-8 w-8 text-pink-500" />
                    {t('mySchedule.scheduleTitle')}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live temporal synchronization</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8 lg:p-10 space-y-6">
                <AnimatePresence>
                  {todaySchedule.map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (index * 0.1) }}
                      className="group flex items-center gap-8 p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-pink-500/20 transition-all duration-500 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-pink-600/20 group-hover:bg-pink-600 transition-colors" />
                      
                      <div className="text-center min-w-[100px] space-y-1">
                        <div className="text-2xl font-black text-white tracking-tighter italic group-hover:text-pink-400 transition-colors">{item.time}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">{item.duration}</div>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-pink-500/30 transition-all shadow-inner">
                            <User className="w-5 h-5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                          </div>
                          <div className="font-bold text-xl text-white tracking-tight italic group-hover:text-white transition-colors">{item.customer}</div>
                        </div>
                        <div className="pl-14">
                          <Badge variant="outline" className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 border-white/5 group-hover:text-slate-300 transition-colors italic">
                            PROTOCOL: {item.program}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                          <MapPin className="h-4 w-4 text-pink-500/60" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{item.room}</span>
                        </div>
                        
                        <Badge className={cn(
                          "px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner transition-all",
                          index < 2 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-white/[0.03] text-slate-600"
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
