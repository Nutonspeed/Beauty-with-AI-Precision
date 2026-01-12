"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, CheckCircle2, Loader2, User } from "lucide-react"
import { format } from "date-fns"
import { th, enUS } from "date-fns/locale"
import { useTranslations, useLocale } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BioAdaptiveScheduler } from "@/components/booking/bio-adaptive-scheduler"

export default function BookingPage() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = useLocalizePath()

  const programsData = [
    { id: "consultation", name: t('booking.programs.consultation'), duration: t('booking.duration.min30'), price: t('booking.priceFree'), priceValue: 0 },
    { id: "botox", name: t('booking.programs.botox'), duration: t('booking.duration.min45'), price: t('format.currency', { amount: '8,000' }), priceValue: 8000 },
    { id: "filler", name: t('booking.programs.filler'), duration: t('booking.duration.min60'), price: t('format.currency', { amount: '12,000' }), priceValue: 12000 },
    { id: "laser", name: t('booking.programs.laser'), duration: t('booking.duration.min45'), price: t('format.currency', { amount: '6,000' }), priceValue: 6000 },
    { id: "peel", name: t('booking.programs.peel'), duration: t('booking.duration.min60'), price: t('format.currency', { amount: '5,000' }), priceValue: 5000 },
    { id: "microneedling", name: t('booking.programs.microneedling'), duration: t('booking.duration.min60'), price: t('format.currency', { amount: '7,000' }), priceValue: 7000 },
  ]

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ]

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedProgram, setSelectedProgram] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          programId: selectedProgram,
          date: date ? format(date, "yyyy-MM-dd") : "",
          time: selectedTime,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t('analysis.notFound'));
        }
        throw new Error(t('booking.error'));
      }

      const data = await response.json();
      console.log("[v0] Booking created:", data);
      setIsSubmitted(true);
    } catch (err) {
      console.error("[v0] Booking error:", err);
      setError(err instanceof Error ? err.message : t('booking.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
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

          <div className="container relative z-10 py-12 md:py-20 flex-1 flex flex-col max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-2xl shadow-emerald-500/10">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white tracking-tight italic">
                  {t('booking.success.title')}
                </h2>
                <p className="text-xl text-slate-400 font-light leading-relaxed max-w-md mx-auto italic">
                  {t('booking.success.description')}
                </p>
              </div>
              
              <Card className="max-w-md mx-auto border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <CardContent className="p-10 space-y-6">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                    <span className="text-slate-500 uppercase font-black tracking-widest text-[10px] italic">{t('booking.details.date')}</span>
                    <span className="text-white font-bold italic">{date && format(date, "PPP", { locale: locale === 'th' ? th : enUS })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                    <span className="text-slate-500 uppercase font-black tracking-widest text-[10px] italic">{t('booking.details.time')}</span>
                    <span className="text-white font-bold italic">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 uppercase font-black tracking-widest text-[10px] italic">{t('booking.details.program')}</span>
                    <span className="text-white font-bold italic">{programsData.find((p) => p.id === selectedProgram)?.name}</span>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="premium"
                size="xl"
                className="h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                onClick={() => {
                  setIsSubmitted(false)
                  setFormData({ firstName: "", lastName: "", email: "", phone: "", notes: "" })
                  setSelectedProgram("")
                  setSelectedTime("")
                  setDate(new Date())
                }}
              >
                {t('booking.bookAnother')}
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    )
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

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto">
          {/* Booking Header Interface */}
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <CalendarIcon className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Aesthetic Reservation Protocol
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic"
            >
              Program<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Scheduling</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-xl text-slate-500 font-light tracking-widest max-w-2xl mx-auto italic leading-relaxed"
            >
              Synchronize your aesthetic transformation cycle with our precision center nodes.
            </motion.p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-400 rounded-[2rem] p-6 max-w-3xl mx-auto">
                  <AlertDescription className="text-center text-sm font-bold uppercase tracking-widest">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-10 lg:grid-cols-12">
              {/* Program Selection Node */}
              <motion.div 
                className="lg:col-span-4 space-y-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardHeader className="p-10 pb-6">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('booking.selectProgram')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 space-y-4">
                    {programsData.map((program) => (
                      <motion.div
                        key={program.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "cursor-pointer transition-all duration-500 rounded-3xl p-6 border group relative overflow-hidden",
                          selectedProgram === program.id 
                            ? "bg-pink-600/10 border-pink-500/40 shadow-inner" 
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                        )}
                        onClick={() => setSelectedProgram(program.id)}
                      >
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="space-y-4 relative z-10">
                          <div className="font-bold text-lg text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{program.name}</div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 italic">
                              <Clock className="h-3.5 w-3.5 text-pink-500/60" />
                              {program.duration}
                            </span>
                            <Badge className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none shadow-inner transition-all",
                              selectedProgram === program.id ? "bg-pink-600 text-white shadow-pink-600/20" : "bg-white/[0.03] text-slate-600"
                            )}>
                              {program.price}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Date & Time Hub */}
              <div className="lg:col-span-8 space-y-10">
                <motion.div 
                  className="grid gap-10 md:grid-cols-2"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                    <CardHeader className="p-10 pb-6">
                      <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('booking.selectDate')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 flex justify-center">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-[2rem] border-white/5 bg-white/[0.02] p-6 shadow-inner text-slate-300"
                      />
                    </CardContent>
                  </Card>

                  <BioAdaptiveScheduler 
                    selectedDate={date} 
                    onTimeSelect={setSelectedTime} 
                    selectedTime={selectedTime} 
                  />
                </motion.div>

                {/* Client Information Interface */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                      <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                        <User className="h-8 w-8 text-pink-500" />
                        {t('booking.clientInfo' as any) || t('booking.customerInfo')}
                      </CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Initialize aesthetic credential binding</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-12 space-y-8">
                      <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('booking.firstName')}</Label>
                          <Input
                            className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            placeholder="NODE_INIT_NAME"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('booking.lastName')}</Label>
                          <Input
                            className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            placeholder="NODE_INIT_SURNAME"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('booking.email')}</Label>
                          <Input
                            className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            placeholder="identity@aesthetic.ai"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('booking.phone')}</Label>
                          <Input
                            className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-6"
                            placeholder="+66-SYNC-ID"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">{t('booking.notes')} ({t('booking.optional')})</Label>
                        <Textarea
                          className="rounded-[2rem] border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 transition-all px-6 py-4 resize-none italic font-light"
                          placeholder={t('booking.notesPlaceholder')}
                          rows={4}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>

                      <div className="pt-6">
                        <Button
                          type="submit"
                          size="xl"
                          variant="premium"
                          className="w-full h-20 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-xs font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98]"
                          disabled={!selectedProgram || !date || !selectedTime || isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-4">
                              <Loader2 className="h-6 w-6 animate-spin" />
                              {t('booking.confirming')}
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <CheckCircle2 className="h-6 w-6" />
                              {t('booking.confirm')}
                            </div>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
