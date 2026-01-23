"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { Calendar, Clock, MapPin, Loader2, ChevronRight, Zap, XCircle } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Booking {
  id: string
  booking_date: string
  booking_time: string
  program_type: string
  status: string
  notes?: string
  center?: {
    name: string
    address: string
  }
}

export function BookingHistoryList({ userId }: { userId: string }) {
  const t = useTranslations()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch("/api/customer/bookings")
        const data = await response.json()
        if (data.success) {
          setBookings(data.bookings)
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-6">
          <div className="relative h-16 w-16 mx-auto">
            <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Synchronizing Temporal Cycles...</p>
        </div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card className="border-slate-100 bg-slate-50/30 rounded-[3rem] p-20 text-center space-y-8 italic shadow-inner">
        <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse">
          <Calendar className="h-12 w-12" />
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('bookingHistory.noBookings' as any) || 'CYCLE_REGISTRY_EMPTY'}</h3>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('bookingHistory.startBooking' as any) || 'Synchronize your first clinical reservation'}</p>
        </div>
        <Button variant="premium" className="h-14 px-10 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] italic shadow-2xl transition-all hover:scale-105 active:scale-95 border-none">
          <Zap className="mr-3 h-4 w-4" />
          {t('bookingHistory.bookProgram' as any) || 'AUTHORIZE_BOOKING'}
        </Button>
      </Card>
    )
  }

  return (
    <div className="grid gap-8">
      {bookings.map((booking, index) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden group transition-all duration-700 hover:border-blue-500/20 relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover:bg-blue-600 transition-all duration-700" />
            
            <CardContent className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="flex items-center gap-10 flex-1 min-w-0">
                <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-700">
                  <Calendar className="h-10 w-10 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                
                <div className="space-y-4 flex-1 min-w-0">
                  <div className="flex items-center gap-6">
                    <h4 className="font-black text-3xl text-slate-950 italic uppercase tracking-tighter group-hover:text-blue-600 transition-colors truncate leading-none">{booking.program_type}</h4>
                    <Badge className={cn(
                      "px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic border-none shadow-sm leading-none",
                      booking.status === "confirmed" ? "bg-emerald-50 text-emerald-600" : 
                      booking.status === "completed" ? "bg-blue-50 text-blue-600" : 
                      "bg-slate-50 text-slate-400"
                    )}>
                      {booking.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-500/40" />
                      <span>{format(new Date(booking.booking_date), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-blue-500/40" />
                      <span>{booking.booking_time}</span>
                    </div>
                    {booking.center && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-pink-500/40" />
                        <span className="truncate max-w-[200px]">{booking.center.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                {booking.status === "confirmed" && (
                  <>
                    <Button variant="outline" className="h-14 px-8 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm hover:bg-slate-50 transition-all">
                      {t('bookingHistory.reschedule' as any) || 'RESCHEDULE'}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100">
                      <XCircle className="h-6 w-6" />
                    </Button>
                  </>
                )}
                {booking.status === "completed" && (
                  <Button variant="premium" className="h-14 px-10 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] italic shadow-2xl transition-all hover:bg-blue-600 border-none group/btn">
                    {t('bookingHistory.bookAgain' as any) || 'INITIALIZE_REPEAT'}
                    <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
