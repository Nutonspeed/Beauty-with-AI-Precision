'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2,
  Users,
  Zap,
  Sparkles,
  RefreshCw,
  Loader2,
  Info
} from 'lucide-react'
import { 
  getQuotaSummary, 
  formatQuota, 
  getQuotaPercentage, 
  isQuotaLow, 
  isQuotaCritical, 
  isUnlimited, 
  type QuotaSummary 
} from '@/lib/quota'
import { cn } from '@/lib/utils'

interface SalesQuotaDashboardProps {
  showAllSales?: boolean // For clinic owners to see all sales users
  compact?: boolean
}

export function SalesQuotaDashboard({ showAllSales = false, compact = false }: SalesQuotaDashboardProps) {
  const t = useTranslations()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    view: 'center' | 'personal'
    sales_users?: QuotaSummary[]
    quota?: QuotaSummary | null
  } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    const result = await getQuotaSummary()
    if (result) {
      setData(result)
    } else {
      setError(t('salesQuota.noData' as any) || 'No telemetry data ingested.')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-10 bg-white rounded-[3rem] border border-slate-100 shadow-premium", compact && "p-6 rounded-[2.5rem]")}>
        <div className="text-center space-y-6">
          <div className="relative h-16 w-16 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">{t('salesQuota.syncing' as any) || 'Syncing_Quota_Nodes...'}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-rose-100 bg-rose-50/50 rounded-[3rem] p-10 text-center space-y-6 shadow-premium">
        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-rose-100">
          <AlertTriangle className="h-8 w-8 text-rose-600" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-black text-slate-950 italic uppercase tracking-tighter">{error}</p>
        </div>
        <Button variant="outline" size="sm" className="h-12 px-8 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-3" />
          {t('salesQuota.retry' as any) || 'Re-Initialize'}
        </Button>
      </Card>
    )
  }

  // Personal view (sales staff)
  if (data?.view === 'personal' && data.quota) {
    return <PersonalQuotaCard quota={data.quota} compact={compact} loading={loading} onRefresh={fetchData} />
  }

  // Center view (clinic owners) - show all sales users
  if (data?.view === 'center' && data.sales_users) {
    if (data.sales_users.length === 0) {
      return (
        <Card className="border-slate-100 bg-slate-50/30 rounded-[3rem] p-16 text-center space-y-8 italic shadow-inner">
          <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse">
            <Users className="h-12 w-12" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">No sales nodes detected in current node.</p>
        </Card>
      )
    }

    if (compact) {
      const totalAnalysisUsed = data.sales_users.reduce((sum, u) => sum + u.analysis_used, 0)
      const totalARUsed = data.sales_users.reduce((sum, u) => sum + u.ar_used, 0)
      
      return (
        <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] overflow-hidden group hover:border-pink-500/20 transition-all duration-700">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:bg-pink-50 group-hover:border-pink-500/20 transition-all duration-700">
                  <Users className="h-7 w-7 text-slate-300 group-hover:text-pink-600 transition-colors" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-950 italic uppercase tracking-tighter leading-none">{data.sales_users.length} Active_Nodes</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">
                    {totalAnalysisUsed} SYNCS • {totalARUsed} AR_CYCLES
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 hover:text-pink-600 transition-all shadow-inner" onClick={fetchData}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div className="space-y-3">
              <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tight flex items-center gap-6 uppercase leading-none">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
                  <BarChart3 className="h-8 w-8 text-blue-600 group-hover:text-white" />
                </div>
                Team_Resource_Grid
              </CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
                {data.sales_users[0]?.current_month || 'Current Cycle'} • {data.sales_users.length} Operational Units
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} className="h-12 px-8 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic shadow-sm hover:bg-slate-50 transition-all shrink-0">
              <RefreshCw className={cn("h-4 w-4 mr-3", loading && "animate-spin")} />
              {t('salesQuota.refresh' as any) || 'Sync_Matrix'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-10 lg:p-12 space-y-10">
          <div className="grid gap-8">
            {data.sales_users.map((user) => (
              <SalesUserQuotaRow key={user.sales_user_id} user={user} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-100 bg-slate-50/30 rounded-[3rem] p-16 text-center space-y-8 italic shadow-inner">
      <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-sm">
        <Zap className="h-12 w-12" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{t('salesQuota.noData' as any) || 'No telemetry data detected.'}</p>
    </Card>
  )
}

function PersonalQuotaCard({ 
  quota, 
  compact, 
  loading,
  onRefresh 
}: { 
  quota: QuotaSummary
  compact: boolean
  loading?: boolean
  onRefresh: () => void 
}) {
  const t = useTranslations()
  const analysisPercent = getQuotaPercentage(quota.analysis_used, quota.analysis_quota)
  const arPercent = getQuotaPercentage(quota.ar_used, quota.ar_quota)
  const analysisLow = isQuotaLow(quota.analysis_used, quota.analysis_quota)
  const analysisCritical = isQuotaCritical(quota.analysis_used, quota.analysis_quota)

  if (compact) {
    return (
      <Card className={cn(
        "border-slate-100 bg-white transition-all duration-700 hover:shadow-premium shadow-sm group overflow-hidden rounded-[2.5rem]",
        analysisCritical ? "border-rose-200 bg-rose-50/20" : analysisLow ? "border-amber-200 bg-amber-50/20" : ""
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-6 min-w-0">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner transition-all duration-700 group-hover:scale-110",
                analysisCritical ? "bg-rose-50 text-rose-600 border border-rose-100" : analysisLow ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"
              )}>
                <Zap className={cn("h-7 w-7", analysisCritical && "animate-pulse")} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-xl font-black text-slate-950 italic truncate tracking-tight uppercase leading-none group-hover:text-pink-600 transition-colors">
                  {isUnlimited(quota.analysis_quota) ? 'UNLIMITED' : formatQuota(quota.analysis_used, quota.analysis_quota)}
                </p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate italic">{t('salesQuota.analysis' as any) || 'Aesthetic_Syncs'}</p>
              </div>
            </div>
            {!isUnlimited(quota.analysis_quota) && (
              <div className="w-32 space-y-3">
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-slate-950 transition-colors">
                  <span>{analysisPercent}%</span>
                  <span>LOAD</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      analysisCritical ? "bg-rose-500 shadow-glow-rose/30" : 
                      analysisLow ? "bg-amber-500 shadow-glow-amber/30" : 
                      "bg-blue-500 shadow-glow-blue/30"
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('salesQuota.personalTitle' as any) || 'Entity_Resource_Index'}</CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic leading-none">{quota.current_month}</CardDescription>
        </div>
        <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/20 bg-white text-pink-600 text-[10px] font-black italic shadow-sm uppercase tracking-widest">
          {quota.subscription_tier} Node
        </Badge>
      </CardHeader>
      <CardContent className="p-10 lg:p-16 space-y-16">
        {/* Analysis Quota interface */}
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="h-16 w-16 rounded-[1.5rem] bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <Zap className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <span className="text-2xl font-black text-slate-950 italic tracking-tight uppercase leading-none group-hover:text-pink-600 transition-colors">{t('salesQuota.analysis' as any) || 'Aesthetic_Inferences'}</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">Neural Diagnostic Nodes</p>
              </div>
            </div>
            <div className="text-right space-y-3">
              <span className={cn(
                "text-4xl font-black italic tracking-tighter leading-none uppercase",
                analysisCritical ? "text-rose-600" : analysisLow ? "text-amber-600" : "text-emerald-600"
              )}>
                {formatQuota(quota.analysis_used, quota.analysis_quota)}
              </span>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">THROUGHPUT: {analysisPercent}%</p>
            </div>
          </div>
          {!isUnlimited(quota.analysis_quota) && (
            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-1 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${analysisPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full transition-all duration-1000 relative overflow-hidden",
                  analysisCritical ? "bg-rose-500 shadow-glow-rose/30" : 
                  analysisLow ? "bg-amber-500 shadow-glow-amber/30" : 
                  "bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
              </motion.div>
            </div>
          )}
          {isUnlimited(quota.analysis_quota) && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest">
              <CheckCircle2 className="h-4 w-4 mr-3" />
              {t('salesQuota.unlimited' as any) || 'Infinite_Sync_Enabled'}
            </Badge>
          )}
        </div>

        {/* AR Quota interface */}
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="h-16 w-16 rounded-[1.5rem] bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <span className="text-2xl font-black text-slate-950 italic tracking-tight uppercase leading-none group-hover:text-pink-600 transition-colors">{t('salesQuota.ar' as any) || 'Dimensional_Cycles'}</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">AR Visual Synthetics</p>
              </div>
            </div>
            <div className="text-right space-y-3">
              <span className="text-4xl font-black italic tracking-tighter leading-none text-slate-950 uppercase">
                {formatQuota(quota.ar_used, quota.ar_quota)}
              </span>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">COMPOSITE: {arPercent}%</p>
            </div>
          </div>
          {!isUnlimited(quota.ar_quota) && (
            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-1 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${arPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-400 shadow-glow-purple/20 relative overflow-hidden rounded-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
              </motion.div>
            </div>
          )}
          {isUnlimited(quota.ar_quota) && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest">
              <CheckCircle2 className="h-4 w-4 mr-3" />
              {t('salesQuota.unlimited' as any) || 'Infinite_Visualization'}
            </Badge>
          )}
        </div>

        {/* Alert Indicators interface */}
        {analysisLow && !isUnlimited(quota.analysis_quota) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "p-10 rounded-[3rem] border shadow-premium relative overflow-hidden group/alert transition-all duration-700",
              analysisCritical ? "bg-rose-50 border-rose-100 hover:border-rose-300" : "bg-amber-50 border-amber-100 hover:border-amber-300"
            )}
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/alert:scale-110 transition-transform duration-1000">
              <AlertTriangle className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-8 relative z-10">
              <div className={cn(
                "h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-inner transition-transform duration-700",
                analysisCritical ? "bg-white text-rose-600 border border-rose-100 shadow-glow-rose/10" : "bg-white text-amber-600 border border-amber-100 shadow-glow-amber/10"
              )}>
                <AlertTriangle className={cn("h-8 w-8", analysisCritical && "animate-pulse")} />
              </div>
              <div className="space-y-2">
                <p className={cn(
                  "text-2xl font-black italic tracking-tighter uppercase leading-none",
                  analysisCritical ? "text-rose-600" : "text-amber-600"
                )}>
                  {analysisCritical ? (t('salesQuota.criticalQuota' as any) || 'Node_Exhaustion_Impending') : (t('salesQuota.lowQuota' as any) || 'Sequence_Depletion_Warning')}
                </p>
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic leading-relaxed">
                  {analysisCritical 
                    ? 'Inference cycles critically low. System sync required.' 
                    : 'Aesthetic node resources entering depletion zone.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-6">
          <Button 
            variant="premium" 
            size="xl" 
            className="flex-1 h-20 rounded-[2rem] bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl transition-all hover:bg-pink-600 active:scale-95 border-none group/refresh relative overflow-hidden" 
            onClick={onRefresh}
            disabled={loading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/refresh:translate-x-[100%] transition-transform duration-1000" />
            {loading ? <Loader2 className="mr-4 h-6 w-6 animate-spin" /> : <RefreshCw className="mr-4 h-6 w-6 group-hover/refresh:rotate-180 transition-transform duration-700" />}
            {t('salesQuota.refresh' as any) || 'Re-Authorize_Telemetry'}
          </Button>
          <Button variant="outline" size="xl" className="h-20 px-12 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[11px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105">
            <Info className="mr-4 h-6 w-6 text-blue-600" />
            Audit_Matrix
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SalesUserQuotaRow({ user }: { user: QuotaSummary }) {
  const t = useTranslations()
  const analysisPercent = getQuotaPercentage(user.analysis_used, user.analysis_quota)
  const analysisLow = isQuotaLow(user.analysis_used, user.analysis_quota)
  const analysisCritical = isQuotaCritical(user.analysis_used, user.analysis_quota)

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      className={cn(
        "p-10 rounded-[3rem] border transition-all duration-700 hover:bg-slate-50/50 relative group/row",
        analysisCritical ? "bg-rose-50/20 border-rose-100" : 
        analysisLow ? "bg-amber-50/20 border-amber-100" : 
        "bg-white border-slate-100 shadow-sm hover:shadow-premium"
      )}
    >
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/row:bg-pink-600 transition-all duration-700" />
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
        <div className="flex items-center gap-10">
          <div className={cn(
            "h-20 w-20 rounded-[1.5rem] flex items-center justify-center font-black text-3xl shadow-inner transition-all duration-700 group-hover/row:scale-110 group-hover/row:rotate-3 border",
            analysisCritical ? "bg-white text-rose-600 border-rose-100 shadow-glow-rose/10" : 
            analysisLow ? "bg-white text-amber-600 border-amber-100 shadow-glow-amber/10" : 
            "bg-slate-50 text-slate-300 border-slate-100"
          )}>
            {user.sales_name?.charAt(0) || '?'}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-6">
              <h4 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase group-hover/row:text-pink-600 transition-colors leading-none">{user.sales_name || 'Personnel_Node'}</h4>
              {analysisCritical && (
                <Badge className="bg-rose-600 text-white border-none px-4 py-1 text-[9px] font-black italic tracking-widest uppercase shadow-glow-rose/30 animate-pulse rounded-full">
                  <AlertTriangle className="h-3 w-3 mr-2" />
                  CRITICAL_DELTA
                </Badge>
              )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover/row:bg-blue-500 transition-colors" />
              {user.subscription_tier} NODE <span className="text-slate-200 mx-2">//</span> {user.current_month}
            </p>
          </div>
        </div>
        
        <div className="flex-1 max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/row:text-slate-950 transition-colors">Aesthetic_Inferences</span>
              <span className={cn(
                "font-black italic text-xl tracking-tighter leading-none uppercase",
                analysisCritical ? "text-rose-600" : analysisLow ? "text-amber-600" : "text-slate-950"
              )}>
                {formatQuota(user.analysis_used, user.analysis_quota)}
              </span>
            </div>
            {!isUnlimited(user.analysis_quota) && (
              <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    analysisCritical ? "bg-rose-500 shadow-glow-rose/30" : 
                    analysisLow ? "bg-amber-500 shadow-glow-amber/30" : 
                    "bg-blue-500 shadow-glow-blue/30"
                  )}
                />
              </div>
            )}
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/row:text-slate-950 transition-colors">Visual_Cycles</span>
              <span className="font-black italic text-xl tracking-tighter leading-none text-slate-950 uppercase">
                {formatQuota(user.ar_used, user.ar_quota)}
              </span>
            </div>
            {!isUnlimited(user.ar_quota) && (
              <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${getQuotaPercentage(user.ar_used, user.ar_quota)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-purple-500 shadow-glow-purple/20 rounded-full transition-all duration-1000"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SalesQuotaDashboard
