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
  const t = useTranslations()
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
      case 'opportunity': return { icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/10', label: t('synapticNotifications.opportunity') }
      case 'alert': return { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', label: t('synapticNotifications.operationalAlert') }
      case 'health': return { icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: t('synapticNotifications.clientHealth') }
      default: return { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: t('synapticNotifications.actionTriggered') }
    }
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Bell className="h-8 w-8 text-pink-500 animate-swing" />
            {t('synapticNotifications.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('synapticNotifications.subtitle')}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all italic">
          {t('synapticNotifications.dismissAll')}
        </Button>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 flex-1 overflow-y-auto custom-scrollbar">
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
                    "p-6 rounded-[2rem] border transition-all duration-500 group/notif relative",
                    n.read ? "bg-white/[0.01] border-white/5 opacity-60 grayscale-[0.5]" : "bg-white/[0.03] border-white/10 shadow-xl"
                  )}
                >
                  {!n.read && (
                    <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                  )}
                  
                  <div className="flex items-start gap-6">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover/notif:scale-110", config.bg, config.color)}>
                      <config.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{config.label}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">{n.timestamp}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white italic tracking-tight">{n.title}</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed italic">{n.desc}</p>
                      <div className="pt-4 flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="h-8 px-4 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500 hover:text-[#020617] transition-all italic">
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

      <div className="px-10 lg:p-12 py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-4 text-slate-600">
          <Activity className="h-4 w-4" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">{t('ui.hud.alertSystemOk')}</p>
        </div>
        <Badge variant="outline" className="text-[8px] font-black border-white/5 text-slate-700 italic uppercase">{t('ui.hud.syncProtocolV4')}</Badge>
      </div>
    </Card>
  )
}
