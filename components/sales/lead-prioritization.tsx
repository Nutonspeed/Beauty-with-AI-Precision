'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion"
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
        return { label: 'HOT_NODE', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' }
      case 'active':
        return { label: 'ACTIVE_SYNC', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' }
      case 'warm':
        return { label: 'WARM_SIGNAL', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
      default:
        return { label: status.toUpperCase(), color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100' }
    }
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tight flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                <Target className="h-8 w-8 text-pink-600 group-hover:text-white" />
              </div>
              Propensity Matrix
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">High-conversion identity node prioritization</CardDescription>
          </div>
          <Badge className="bg-pink-600 text-white border-none px-6 py-2 text-[10px] font-black tracking-widest uppercase italic shadow-lg shadow-pink-600/30 animate-pulse rounded-full">
            AI_Rank_Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-10 lg:p-12 space-y-8">
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {loading && leads.length === 0 ? (
              <div className="py-32 text-center space-y-8 bg-slate-50/50 rounded-[3rem] border border-slate-100 border-dashed italic">
                <div className="relative h-16 w-16 mx-auto">
                  <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
                  <Loader2 className="h-10 w-10 animate-spin mx-auto text-pink-600 relative" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Lead Vectors...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="py-24 text-center space-y-8 bg-slate-50/50 rounded-[3rem] border border-slate-100 border-dashed italic">
                <div className="mx-auto h-20 w-20 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200">
                  <Target className="h-10 w-10" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">No high-propensity nodes detected.</p>
              </div>
            ) : (
              leads.map((lead, idx) => {
                const config = getStatusConfig(lead.status)
                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-700 group/item relative overflow-hidden shadow-sm hover:shadow-premium"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-50 group-hover/item:bg-pink-600 transition-all duration-700" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                      <div className="flex items-center gap-8">
                        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/item:bg-pink-50 group-hover/item:border-pink-500/20 transition-all duration-700">
                          <User className="h-8 w-8 text-slate-300 group-hover/item:text-pink-600" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-6">
                            <h4 className="text-2xl font-black text-slate-950 italic uppercase group-hover/item:text-pink-600 transition-colors tracking-tighter leading-none">{lead.name}</h4>
                            <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-sm italic leading-none", config.bg, config.color)}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{lead.concern}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-16">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Est_Value</p>
                          <p className="text-xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{lead.value}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Propensity</p>
                          <div className="flex items-center gap-3">
                            <p className={cn("text-xl font-black italic tracking-tighter leading-none", lead.score > 80 ? "text-emerald-600" : "text-amber-600")}>{lead.score}%</p>
                            <TrendingUp className={cn("h-4 w-4", lead.score > 80 ? "text-emerald-600" : "text-amber-600")} />
                          </div>
                        </div>
                        <div className="hidden md:block space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">AI_Inference</p>
                          <p className="text-[11px] text-slate-500 font-light italic truncate max-w-[180px] leading-none pt-1">{lead.reason}</p>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" className="h-14 w-14 rounded-[1.25rem] bg-slate-50 text-slate-300 hover:bg-pink-50 hover:text-pink-600 transition-all duration-500 shadow-inner border border-transparent hover:border-pink-500/20">
                        <ArrowUpRight className="h-7 w-7" />
                      </Button>
                    </div>
                    
                    {lead.score > 85 && (
                      <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover/item:scale-110 group-hover/item:rotate-12 transition-transform duration-1000">
                        <Sparkles className="w-24 h-24 text-pink-600" />
                      </div>
                    )}
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
        
        <Button 
          variant="outline" 
          size="xl"
          onClick={fetchPrioritizedLeads}
          className="w-full h-18 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[10px] italic shadow-premium hover:bg-slate-50 transition-all group/refresh"
        >
          <Zap className={cn("mr-4 h-5 w-5 text-amber-500 transition-transform duration-700 group-hover/refresh:rotate-12", loading && "animate-spin")} />
          Synchronize Propensity Node
        </Button>
      </CardContent>
    </Card>
  )
}
