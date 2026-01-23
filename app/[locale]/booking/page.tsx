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
import { CalendarIcon, Clock, CheckCircle2, Loader2, User, XCircle } from "lucide-react"
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
      <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-pink-500/10">
        <Header />
        
        <main className="flex-1 relative overflow-hidden flex flex-col">
          {/* Infrastructure Background - Light Theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
          </div>

          <div className="container relative z-10 py-12 md:py-20 flex-1 flex flex-col max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-10"
            >
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-emerald-50 border border-emerald-100 text-emerald-500 shadow-2xl shadow-emerald-500/10">
                <CheckCircle2 className="h-14 w-14" />
              </div>
              <div className="space-y-6">
                <h2 className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-tight">
                  {t('booking.success.title')}
                </h2>
                <p className="text-2xl text-slate-500 font-light leading-relaxed max-w-md mx-auto italic">
                  {t('booking.success.description')}
                </p>
              </div>
              
              <Card className="max-w-md mx-auto border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <CardContent className="p-12 space-y-8">
                  <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-6">
                    <span className="text-slate-400 uppercase font-black tracking-[0.3em] text-[10px] italic">{t('booking.details.date')}</span>
                    <span className="text-slate-900 font-black italic uppercase tracking-tight">{date && format(date, "PPP", { locale: locale === 'th' ? th : enUS })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-6">
                    <span className="text-slate-400 uppercase font-black tracking-[0.3em] text-[10px] italic">{t('booking.details.time')}</span>
                    <span className="text-slate-900 font-black italic uppercase tracking-tight">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 uppercase font-black tracking-[0.3em] text-[10px] italic">{t('booking.details.program')}</span>
                    <span className="text-pink-600 font-black italic uppercase tracking-tight">{programsData.find((p) => p.id === selectedProgram)?.name}</span>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="premium"
                size="xl"
                className="h-18 px-14 rounded-2xl shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic"
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
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background - Light Theme */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-24 px-6 space-y-20 max-w-7xl mx-auto">
          {/* Booking Header Interface */}
          <div className="text-center space-y-12 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-8 py-2.5 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <CalendarIcon className="mr-3 h-3.5 w-3.5" />
                Aesthetic Reservation Protocol
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-9xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase"
            >
              Program<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em]">Scheduling</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-2xl text-slate-500 font-light max-w-2xl mx-auto italic leading-relaxed tracking-tight"
            >
              Synchronize your aesthetic transformation cycle with our precision center nodes.
            </motion.p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Alert variant="destructive" className="bg-rose-50 border-rose-100 text-rose-600 rounded-[2.5rem] p-10 max-w-3xl mx-auto shadow-premium relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                    <XCircle className="w-24 h-24" />
                  </div>
                  <AlertDescription className="text-center text-lg font-black uppercase tracking-[0.3em] italic relative z-10">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-12 lg:grid-cols-12">
              {/* Program Selection Node */}
              <motion.div 
                className="lg:col-span-4 space-y-10"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardHeader className="p-10 pb-6 border-b border-slate-50">
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('booking.selectProgram')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-8 space-y-5">
                    {programsData.map((program) => (
                      <motion.div
                        key={program.id}
                        whileHover={{ scale: 1.02, x: 8 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "cursor-pointer transition-all duration-500 rounded-[2rem] p-8 border group relative overflow-hidden",
                          selectedProgram === program.id 
                            ? "bg-pink-50 border-pink-500/30 shadow-inner" 
                            : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-pink-500/20 shadow-sm"
                        )}
                        onClick={() => setSelectedProgram(program.id)}
                      >
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="space-y-5 relative z-10">
                          <div className="font-black text-xl text-slate-950 tracking-tight italic group-hover:text-pink-600 transition-colors uppercase">{program.name}</div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600 transition-colors italic">
                              <Clock className="h-4 w-4 text-pink-500/60" />
                              {program.duration}
                            </span>
                            <Badge className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-none shadow-sm transition-all italic",
                              selectedProgram === program.id ? "bg-pink-500 text-white shadow-pink-600/30" : "bg-white text-slate-400"
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
              <div className="lg:col-span-8 space-y-12">
                <motion.div 
                  className="grid gap-12 md:grid-cols-2"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                    <CardHeader className="p-10 pb-6 border-b border-slate-50">
                      <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('booking.selectDate')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-8 flex justify-center">
                      <div className="rounded-[2.5rem] bg-slate-50/50 p-2 shadow-inner border border-slate-100">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          className="rounded-[2.2rem] p-6 text-slate-900 font-medium"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="h-full">
                    <BioAdaptiveScheduler 
                      _selectedDate={date} 
                      onTimeSelect={setSelectedTime} 
                      selectedTime={selectedTime} 
                    />
                  </div>
                </motion.div>

                {/* Client Information Interface */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                    <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50">
                      <CardTitle className="text-4xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase">
                        <div className="p-4 bg-slate-50 rounded-2xl shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                          <User className="h-8 w-8" />
                        </div>
                        {t('booking.clientInfo' as any) || t('booking.customerInfo')}
                      </CardTitle>
                      <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-pink-600 mt-6 italic">Initialize aesthetic credential binding</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 lg:p-16 space-y-12">
                      <div className="grid gap-10 md:grid-cols-2">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic">{t('booking.firstName')}</Label>
                          <Input
                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 text-slate-950 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-light shadow-inner"
                            placeholder="NODE_INIT_NAME"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic">{t('booking.lastName')}</Label>
                          <Input
                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 text-slate-950 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-light shadow-inner"
                            placeholder="NODE_INIT_SURNAME"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid gap-10 md:grid-cols-2">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic">{t('booking.email')}</Label>
                          <Input
                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 text-slate-950 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-light shadow-inner"
                            placeholder="identity@aesthetic.ai"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic">{t('booking.phone')}</Label>
                          <Input
                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 text-slate-950 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 italic font-light shadow-inner"
                            placeholder="+66-SYNC-ID"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic">{t('booking.notes')} ({t('booking.optional')})</Label>
                        <Textarea
                          className="rounded-[2.5rem] border-slate-100 bg-slate-50/50 text-slate-950 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-8 py-6 resize-none italic font-light shadow-inner"
                          placeholder={t('booking.notesPlaceholder')}
                          rows={4}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>

                      <div className="pt-10">
                        <Button
                          type="submit"
                          size="xl"
                          variant="premium"
                          className="w-full h-20 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic"
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
