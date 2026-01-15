'use client'

import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Target, TrendingUp, ArrowUpRight, User, Sparkles, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface PrioritizedLead {
  id: string
  name: string
  score: number
  value: string
  concern: string
  status: 'hot' | 'warm' | 'new' | 'contacted'
  reason: string
}

export function LeadPrioritization() {
  const t = useTranslations()
  const [leads, setLeads] = useState<PrioritizedLead[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPrioritizedLeads = async () => {
    setLoading(true)
    try {
      // Fetch from the enhanced hot-leads service which includes telemetry
      const response = await fetch('/api/sales/hot-leads?limit=5')
      const result = await response.json()
      
      if (result.leads) {
        const mapped = result.leads.map((l: any) => ({
          id: l.id,
          name: l.name,
          score: l.score || 0,
          value: `฿${(l.estimatedValue || 0).toLocaleString()}`,
          concern: l.topConcern || 'General Wellness',
          status: l.status,
          reason: l.lastEngagementDuration 
            ? `Engaged with report for ${l.lastEngagementDuration}s` 
            : l.primary_concern || 'High conversion probability',
          lastEngagementDuration: l.lastEngagementDuration,
          isOnline: l.isOnline
        }))
        setLeads(mapped)
      }
    } catch (error) {
      console.error('Failed to fetch prioritized leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrioritizedLeads()
    const interval = setInterval(fetchPrioritizedLeads, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'hot':
        return { label: 'HOT_NODE', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
      case 'active':
        return { label: 'ACTIVE_SYNC', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
      case 'warm':
        return { label: 'WARM_SIGNAL', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
      default:
        return { label: status.toUpperCase(), color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10' }
    }
  }

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group animate-neural-pulse">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Target className="h-8 w-8 text-pink-500" />
            {t('leadPrioritization.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('leadPrioritization.subtitle')}
          </CardDescription>
        </div>
        <Badge className="bg-pink-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
          {t('leadPrioritization.propensityEngine')}
        </Badge>
      </CardHeader>
      <CardContent className="p-10 lg:p-12 space-y-8">
        <div className="space-y-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-24 rounded-[2rem] bg-white/5 animate-pulse" />
            ))
          ) : leads.length === 0 ? (
            <div className="py-10 text-center text-slate-500 italic text-sm">
              No high-priority leads detected at this node.
            </div>
          ) : (
            leads.map((lead, idx) => {
              const config = getStatusConfig(lead.status)
              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all group/item relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/item:border-pink-500/30 transition-all animate-synaptic-fire">
                        <User className="h-6 w-6 text-slate-500 group-hover/item:text-pink-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-bold text-white italic">{lead.name}</h4>
                          <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest", config.bg, config.color, config.border)}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{lead.concern}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('leadPrioritization.estValue')}</p>
                        <p className="text-sm font-black text-white italic">{lead.value}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('leadPrioritization.scoreLabel')}</p>
                        <div className="flex items-center gap-2">
                          <p className={cn("text-sm font-black italic", lead.score > 80 ? "text-emerald-400" : "text-amber-400")}>{lead.score}%</p>
                          <TrendingUp className={cn("h-3 w-3", lead.score > 80 ? "text-emerald-400" : "text-amber-400")} />
                        </div>
                      </div>
                      <div className="hidden md:block space-y-1">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('leadPrioritization.aiReasoning')}</p>
                        <p className="text-[10px] text-slate-400 font-light italic truncate max-w-[150px]">{lead.reason}</p>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-500 hover:text-white hover:bg-pink-500 transition-all group/btn">
                      <ArrowUpRight className="h-5 w-5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Button>
                  </div>
                  
                  {/* Background Sparkles for High Propensity */}
                  {lead.score > 85 && (
                    <div className="absolute top-0 right-0 p-4">
                      <Sparkles className="h-12 w-12 text-pink-500/10 animate-pulse" />
                    </div>
                  )}
                </motion.div>
              )
            })
          )}
        </div>
        
        <Button 
          variant="outline" 
          onClick={fetchPrioritizedLeads}
          className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 italic"
        >
          <Zap className={cn("mr-3 h-4 w-4 text-amber-400", loading && "animate-spin")} />
          {t('leadPrioritization.syncMatrix')}
        </Button>
      </CardContent>
    </Card>
  )
}
