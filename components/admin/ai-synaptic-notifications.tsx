"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Zap, ShieldCheck, Activity, ArrowRight, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: 'opportunity' | 'alert' | 'health' | 'action'
  title: string
  desc: string
  timestamp: string
  read: boolean
}

export function SynapticNotifications() {
  const t = useTranslations('home.salesWizard')
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'sn1',
      type: 'opportunity',
      title: t('synapticNotifications.items.sn1.title'),
      desc: t('synapticNotifications.items.sn1.desc'),
      timestamp: t('ui.time.justNow'),
      read: false
    },
    {
      id: 'sn2',
      type: 'alert',
      title: t('synapticNotifications.items.sn2.title'),
      desc: t('synapticNotifications.items.sn2.desc'),
      timestamp: t('ui.time.minsAgo', { val: 5 }),
      read: false
    },
    {
      id: 'sn3',
      type: 'health',
      title: t('synapticNotifications.items.sn3.title'),
      desc: t('synapticNotifications.items.sn3.desc'),
      timestamp: t('ui.time.minsAgo', { val: 12 }),
      read: true
    }
  ])

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'opportunity': return { icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50', label: t('synapticNotifications.opportunity') }
      case 'alert': return { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', label: t('synapticNotifications.operationalAlert') }
      case 'health': return { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', label: t('synapticNotifications.clientHealth') }
      default: return { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', label: t('synapticNotifications.actionTriggered') }
    }
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group h-full flex flex-col transition-all duration-700 hover:border-pink-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50 flex flex-row items-center justify-between">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-black text-slate-950 tracking-tight italic flex items-center gap-5 uppercase leading-none">
            <Bell className="h-8 w-8 text-pink-600 animate-swing" />
            {t('synapticNotifications.title')}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('synapticNotifications.subtitle')}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-pink-600 transition-all italic hover:bg-pink-50 rounded-xl px-4">
          {t('synapticNotifications.dismissAll')}
        </Button>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => {
              const config = getTypeConfig(n.type)
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "p-8 rounded-[2.5rem] border transition-all duration-500 group/notif relative",
                    n.read ? "bg-white/50 border-slate-100 opacity-60 grayscale-[0.5]" : "bg-white border-slate-100 shadow-sm hover:shadow-premium hover:border-pink-500/20"
                  )}
                >
                  {!n.read && (
                    <div className="absolute top-8 right-8 h-2.5 w-2.5 rounded-full bg-pink-500 shadow-glow-pink animate-pulse" />
                  )}
                  
                  <div className="flex items-start gap-8">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner transition-transform group-hover/notif:scale-110 duration-700", config.bg, config.color)}>
                      <config.icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{config.label}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">{n.timestamp}</span>
                      </div>
                      <h4 className="text-xl font-black text-slate-950 italic tracking-tight uppercase group-hover:text-pink-600 transition-colors leading-none">{n.title}</h4>
                      <p className="text-[13px] text-slate-500 font-light leading-relaxed italic tracking-tight">{n.desc}</p>
                      <div className="pt-4 flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="h-10 px-6 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-pink-600 hover:bg-pink-500 hover:text-white transition-all italic">
                          {t('synapticNotifications.viewDetails')}
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </CardContent>

      <div className="px-10 lg:p-12 py-8 border-t border-slate-50 bg-white flex items-center justify-between">
        <div className="flex items-center gap-5 text-slate-400">
          <Activity className="h-5 w-5" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">{t('ui.hud.alertSystemOk')}</p>
        </div>
        <Badge variant="outline" className="text-[10px] font-black border-none bg-slate-50 text-slate-400 italic px-5 py-1.5 rounded-full shadow-sm uppercase tracking-widest">{t('ui.hud.syncProtocolV4')}</Badge>
      </div>
    </Card>
  )
}
