
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { 
  Zap, 
  ArrowRight, 
  RefreshCw, 
  Info,
  Loader2,
  Brain
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Suggestion {
  type: string
  priority: 'high' | 'medium' | 'low'
  from_staff_id: string
  from_name: string
  to_staff_id: string
  to_name: string
  amount: number
  reason: string
}

interface AIQuotaRebalancingProps {
  onRebalanceComplete: () => void
}

export function AIQuotaRebalancing({ onRebalanceComplete }: AIQuotaRebalancingProps) {
  const t = useTranslations()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState<string | null>(null)

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/quota/rebalance-suggestions')
      const result = await response.json()
      if (result.success) {
        setSuggestions(result.suggestions)
      }
    } catch (error) {
      console.error('Failed to fetch rebalance suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const handleExecute = async (s: Suggestion) => {
    setExecuting(s.to_staff_id)
    try {
      const response = await fetch('/api/quota/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_sales_user_id: s.from_staff_id,
          to_sales_user_id: s.to_staff_id,
          amount: s.amount,
          type: 'analysis'
        })
      })
      const result = await response.json()
      if (result.success) {
        toast.success(t('quotaRebalance.successMessage', { amount: s.amount, name: s.to_name }))
        setSuggestions(prev => prev.filter(item => item.to_staff_id !== s.to_staff_id))
        onRebalanceComplete()
      } else {
        toast.error(result.error || 'Failed to execute transfer')
      }
    } catch (error) {
      console.error('Rebalance execution error:', error)
      toast.error('Sync failed')
    } finally {
      setExecuting(null)
    }
  }

  if (loading) {
    return (
      <Card className="border-blue-500/20 bg-blue-500/[0.01] backdrop-blur-3xl rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('quotaRebalance.analyzing')}</p>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 group">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
          <Brain className="h-6 w-6" />
        </div>
        <div className="text-center">
          <p className="font-bold text-white italic">{t('quotaRebalance.optimized')}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-1">{t('quotaRebalance.optimizedDesc')}</p>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Card className="border-blue-500/20 bg-slate-900/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden relative shadow-[0_0_100px_rgba(37,99,235,0.1)] ring-1 ring-white/10 group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />
        
        <CardHeader className="p-10 lg:p-12 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] -rotate-12 translate-x-10 -translate-y-10 group-hover:translate-x-5 transition-transform duration-[2000ms]">
            <Brain className="h-40 w-40 text-white" />
          </div>
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
              <CardTitle className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{t('quotaRebalance.title')}</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic ml-1">{t('salesEfficiency.subtitle')}</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={fetchSuggestions} 
            className="h-14 w-14 rounded-2xl text-slate-500 hover:bg-blue-500/10 hover:text-blue-400 transition-all active:scale-90 relative z-10 shadow-2xl ring-1 ring-white/5"
          >
            <RefreshCw className={cn("h-6 w-6", loading && "animate-spin")} />
          </Button>
        </CardHeader>
        <CardContent className="p-10 lg:p-12 space-y-10 relative z-10">
          <div className="grid gap-8">
            <AnimatePresence mode="popLayout">
              {suggestions.map((s, idx) => (
                <motion.div
                  key={`${s.from_staff_id}-${s.to_staff_id}`}
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ 
                    delay: idx * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  className="p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 flex flex-col xl:flex-row xl:items-center justify-between gap-10 group/item hover:bg-white/[0.03] hover:border-blue-500/20 transition-all duration-500 ring-1 ring-white/5 shadow-2xl"
                >
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-5">
                      <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-[0.3em] border-none px-4 py-1 rounded-lg shadow-lg italic",
                        s.priority === 'high' ? "bg-rose-500/20 text-rose-400" : "bg-blue-500/20 text-blue-400"
                      )}>
                        {s.priority.toUpperCase()}_{t('quotaRebalance.prioritySync')}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">{t('quotaRebalance.deviationDetected')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="flex items-center gap-5">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">{t('quotaRebalance.sourceNode')}</p>
                          <span className="text-xl font-black text-white italic tracking-tight uppercase leading-none">{s.from_name}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <ArrowRight className="h-5 w-5 text-slate-700 group-hover/item:text-blue-500 group-hover/item:translate-x-1 transition-all duration-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">{t('quotaRebalance.targetNode')}</p>
                          <span className="text-xl font-black text-blue-400 italic tracking-tight uppercase leading-none">{s.to_name}</span>
                        </div>
                      </div>
                      <div className="h-12 w-px bg-white/5" />
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">{t('quotaRebalance.vectorDelta')}</p>
                        <Badge variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-400 font-black italic text-xl px-5 py-1 rounded-xl shadow-inner tracking-tighter">
                          +{s.amount} <span className="text-[9px] not-italic ml-2 opacity-50 tracking-widest">{t('quotaRebalance.cycles')}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 group-hover/item:bg-white/[0.04] transition-colors">
                      <p className="text-sm text-slate-400 font-light leading-relaxed italic flex items-start gap-4">
                        <Info className="h-5 w-5 shrink-0 text-blue-500/40 mt-0.5" />
                        "{s.reason}"
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button 
                      onClick={() => handleExecute(s)}
                      disabled={executing === s.to_staff_id}
                      className="h-20 px-12 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.4em] italic text-[11px] shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all hover:translate-y-[-4px] active:scale-95 border-none relative overflow-hidden group/btn"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                      <span className="relative flex items-center gap-4">
                        {executing === s.to_staff_id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-5 w-5" />
                        )}
                        {t('quotaRebalance.executeSync')}
                      </span>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
