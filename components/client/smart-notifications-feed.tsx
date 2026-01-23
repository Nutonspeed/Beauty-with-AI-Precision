"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Loader2,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useLocalizePath } from '@/lib/i18n/locale-link'

interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'milestone'
  title: string
  message: string
  created_at: string
  read: boolean
  data?: any
}

export function SmartNotificationsFeed() {
  const lp = useLocalizePath()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch('/api/notifications?limit=5')
        const result = await response.json()
        if (result.success) {
          setNotifications(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Trophy className="h-5 w-5 text-amber-600" />
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      case 'warning': return <Zap className="h-5 w-5 text-pink-600" />
      default: return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBg = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-amber-50 border-amber-100'
      case 'success': return 'bg-emerald-50 border-emerald-100'
      case 'warning': return 'bg-pink-50 border-pink-100'
      default: return 'bg-blue-50 border-blue-100'
    }
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10 flex flex-col h-full">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <Bell className="h-8 w-8 text-pink-600 group-hover:text-white animate-swing" />
            </div>
            Neural_Feed
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">Real-time aesthetic journey node updates</CardDescription>
        </div>
        <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-white font-black italic text-[10px] shadow-sm uppercase animate-pulse">
          {notifications.filter(n => !n.read).length} NEW_SIGNALS
        </Badge>
      </CardHeader>
      <CardContent className="p-0 bg-white">
        <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-32 text-center space-y-8 italic">
              <div className="relative h-16 w-16 mx-auto">
                <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-pink-600 relative" />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Syncing Stream...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-32 text-center space-y-10 italic bg-slate-50/20">
              <div className="h-20 w-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto border border-slate-100 shadow-sm opacity-40">
                <Bell className="h-10 w-10 text-slate-300" />
              </div>
              <div className="space-y-4">
                <p className="text-xl font-black text-slate-950 uppercase tracking-tighter leading-none">Registry_Clear</p>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No active biological signals detected.</p>
              </div>
            </div>
          ) : (
            notifications.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-10 hover:bg-slate-50/50 transition-all duration-700 group/n relative overflow-hidden",
                  !n.read && "bg-blue-50/20"
                )}
              >
                <div className={cn(
                  "absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/n:bg-pink-600 transition-all duration-700",
                  !n.read && 'bg-blue-500'
                )} />
                <div className="flex gap-8 items-start relative z-10">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover/n:scale-110", getBg(n.type))}>
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-3 flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-6">
                      <h4 className="font-black text-xl text-slate-950 italic group-hover/n:text-pink-600 transition-colors uppercase tracking-tight truncate leading-none">{n.title}</h4>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic whitespace-nowrap">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium italic line-clamp-2 leading-relaxed tracking-tight group-hover/n:text-slate-900 transition-colors">
                      {n.message}
                    </p>
                    {n.type === 'milestone' && (
                      <div className="pt-4">
                        <Button variant="ghost" size="sm" className="h-10 px-6 rounded-xl text-[10px] font-black uppercase text-pink-600 bg-white border border-pink-100 hover:bg-pink-600 hover:text-white transition-all italic shadow-sm" asChild>
                          <Link href={lp('/customer/dashboard')}>
                            Claim_Reward_Node <ChevronRight className="ml-2 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
        <div className="p-10 border-t border-slate-100 bg-slate-50/30 text-center">
          <Button variant="ghost" className="h-auto p-0 text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-pink-600 hover:bg-transparent hover:translate-x-3 transition-all italic group/btn" asChild>
            <Link href={lp('/notifications')}>
              Archive_Logs_Registry <ArrowRight className="ml-4 h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
