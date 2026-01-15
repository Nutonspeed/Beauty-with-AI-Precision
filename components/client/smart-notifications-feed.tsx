
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Loader2
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
      case 'milestone': return <Trophy className="h-5 w-5 text-amber-400" />
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      case 'warning': return <Zap className="h-5 w-5 text-pink-400" />
      default: return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getBg = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-amber-500/10 border-amber-500/20'
      case 'success': return 'bg-emerald-500/10 border-emerald-500/20'
      case 'warning': return 'bg-pink-500/10 border-pink-500/20'
      default: return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <Card className="border-white bg-white/40 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative group h-full">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <CardHeader className="p-10 pb-6 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-xl font-bold text-slate-900 tracking-tight italic flex items-center gap-3">
            <Bell className="h-5 w-5 text-blue-600" />
            Neural_Feed
          </CardTitle>
          <CardDescription className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Real-time aesthetic journey updates</CardDescription>
        </div>
        <Badge variant="outline" className="h-6 border-blue-500/20 text-blue-600 bg-blue-500/5 font-black italic text-[8px]">
          {notifications.filter(n => !n.read).length} NEW
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-50 max-h-[450px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">Syncing stream...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 opacity-20">
                <Bell className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-400 italic text-sm">Your biological data stream is clear.</p>
            </div>
          ) : (
            notifications.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-8 hover:bg-white/60 transition-all group/n relative overflow-hidden",
                  !n.read && "bg-blue-500/[0.02]"
                )}
              >
                {!n.read && <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-600" />}
                <div className="flex gap-6 items-start relative z-10">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover/n:scale-110", getBg(n.type))}>
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-bold text-slate-900 italic truncate text-sm">{n.title}</h4>
                      <span className="text-[8px] font-black text-slate-400 whitespace-nowrap">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 italic line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    {n.type === 'milestone' && (
                      <Button variant="ghost" size="sm" className="h-8 px-4 rounded-xl text-[9px] font-black uppercase text-blue-600 hover:bg-blue-50 mt-2" asChild>
                        <Link href={lp('/customer/dashboard')}>
                          Claim Rewards <ArrowRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/30 text-center">
          <Button variant="link" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600" asChild>
            <Link href={lp('/notifications')}>Archive_Logs</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
