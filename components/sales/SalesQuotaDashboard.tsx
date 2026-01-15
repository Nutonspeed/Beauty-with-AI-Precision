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
  Loader2
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
      setError(t('salesQuota.noData'))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className={cn("animate-pulse", compact && "p-4")}>
        <CardContent className="p-6">
          <div className="h-20 bg-slate-100 rounded-lg flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-3 text-slate-400" />
            <span className="text-xs text-slate-400 font-bold italic uppercase tracking-widest">{t('salesQuota.syncing')}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-bold italic">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('salesQuota.retry')}
          </Button>
        </CardContent>
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
        <Card className="border-white/5 bg-white/[0.01] rounded-3xl p-10 flex items-center justify-center opacity-40">
          <div className="text-center space-y-4">
            <Users className="h-8 w-8 text-slate-500 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">No sales nodes detected in current center.</p>
          </div>
        </Card>
      )
    }

    if (compact) {
      // Compact view - just summary stats
      const totalAnalysisUsed = data.sales_users.reduce((sum, u) => sum + u.analysis_used, 0)
      const totalARUsed = data.sales_users.reduce((sum, u) => sum + u.ar_used, 0)
      
      return (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 italic">{data.sales_users.length} SALES_NODES</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    {totalAnalysisUsed} {t('salesQuota.analysis').toUpperCase()} • {totalARUsed} {t('salesQuota.ar').toUpperCase()}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchData}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="border-white/10 bg-slate-900/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative ring-1 ring-white/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-50" />
        <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              {t('salesQuota.teamTitle')}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
              {data.sales_users[0]?.current_month || 'Current Cycle'} • {data.sales_users.length} Active Nodes
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="h-10 rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all">
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            {t('salesQuota.refresh')}
          </Button>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          {data.sales_users.map((user) => (
            <SalesUserQuotaRow key={user.sales_user_id} user={user} />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-white/5 bg-white/[0.01] rounded-3xl p-10 flex items-center justify-center">
      <CardContent className="p-0 text-center space-y-4 opacity-40">
        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
          <Zap className="h-6 w-6 text-slate-500" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{t('salesQuota.noData')}</p>
      </CardContent>
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
        "border-white/10 transition-all duration-500 hover:shadow-xl ring-1 ring-white/5",
        analysisCritical && "border-red-500/30 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]",
        analysisLow && !analysisCritical && "border-amber-500/30 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
      )}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shadow-inner transition-all duration-500",
                analysisCritical ? "bg-red-500/20 text-red-400" : analysisLow ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
              )}>
                <Zap className={cn(
                  "h-6 w-6",
                  analysisCritical ? "animate-pulse" : ""
                )} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white italic truncate tracking-tight uppercase leading-none mb-1">
                  {isUnlimited(quota.analysis_quota) ? t('salesQuota.unlimited') : formatQuota(quota.analysis_used, quota.analysis_quota)}
                </p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate">{t('salesQuota.analysis')}</p>
              </div>
            </div>
            {!isUnlimited(quota.analysis_quota) && (
              <div className="w-28 space-y-2">
                <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                  <span>{analysisPercent}%</span>
                  <span>{t('salesQuota.usage')}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={cn(
                      "h-full transition-all duration-1000",
                      analysisCritical ? "bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                      analysisLow ? "bg-gradient-to-r from-amber-600 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : 
                      "bg-gradient-to-r from-blue-600 to-cyan-400"
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
    <Card className="border-white/10 bg-slate-900/20 backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-2xl relative ring-1 ring-white/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent opacity-50" />
      <CardHeader className="p-10 flex flex-row items-center justify-between pb-6 border-b border-white/5">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-black text-white italic tracking-tight uppercase leading-none">{t('salesQuota.personalTitle')}</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-1">{quota.current_month}</CardDescription>
        </div>
        <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/20 bg-pink-500/5 text-pink-400 text-[10px] font-black italic shadow-lg ring-1 ring-white/5 uppercase tracking-widest">
          {quota.subscription_tier}
        </Badge>
      </CardHeader>
      <CardContent className="p-10 space-y-10">
        {/* Analysis Quota */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Zap className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-lg font-black text-white italic tracking-tight uppercase leading-none">{t('salesQuota.analysis')}</span>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Neural Diagnostic Nodes</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className={cn(
                "text-2xl font-black italic tracking-tighter leading-none",
                analysisCritical ? "text-red-400" : analysisLow ? "text-amber-400" : "text-emerald-400"
              )}>
                {formatQuota(quota.analysis_used, quota.analysis_quota)}
              </span>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-700 italic">SYNC_STATUS: {analysisPercent}%</p>
            </div>
          </div>
          {!isUnlimited(quota.analysis_quota) && (
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${analysisPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn(
                  "h-full transition-all duration-1000 relative overflow-hidden",
                  analysisCritical ? "bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]" : 
                  analysisLow ? "bg-gradient-to-r from-amber-600 to-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]" : 
                  "bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
              </motion.div>
            </div>
          )}
          {isUnlimited(quota.analysis_quota) && (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1 rounded-lg text-[9px] font-black italic shadow-lg ring-1 ring-white/5 uppercase tracking-widest">
              <CheckCircle2 className="h-3 w-3 mr-2" />
              {t('salesQuota.unlimited')}
            </Badge>
          )}
        </div>

        {/* AR Quota */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-lg font-black text-white italic tracking-tight uppercase leading-none">{t('salesQuota.ar')}</span>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Visual Simulation Vectors</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-2xl font-black italic tracking-tighter leading-none text-white">
                {formatQuota(quota.ar_used, quota.ar_quota)}
              </span>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-700 italic">SYNC_STATUS: {arPercent}%</p>
            </div>
          </div>
          {!isUnlimited(quota.ar_quota) && (
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${arPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-400 shadow-[0_0_20px_rgba(139,92,246,0.3)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
              </motion.div>
            </div>
          )}
          {isUnlimited(quota.ar_quota) && (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1 rounded-lg text-[9px] font-black italic shadow-lg ring-1 ring-white/5 uppercase tracking-widest">
              <CheckCircle2 className="h-3 w-3 mr-2" />
              {t('salesQuota.unlimited')}
            </Badge>
          )}
        </div>

        {/* Alert Indicators */}
        {analysisLow && !isUnlimited(quota.analysis_quota) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden ring-1",
              analysisCritical ? "border-red-500/30 bg-red-500/5 ring-red-500/10" : "border-amber-500/30 bg-amber-500/5 ring-amber-500/10"
            )}
          >
            <div className="flex items-center gap-6 relative z-10">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ring-1",
                analysisCritical ? "bg-red-500/20 text-red-400 ring-red-500/20" : "bg-amber-500/20 text-amber-400 ring-amber-500/20"
              )}>
                <AlertTriangle className={cn("h-8 w-8", analysisCritical && "animate-pulse")} />
              </div>
              <div className="space-y-2">
                <p className={cn(
                  "text-xl font-black italic tracking-tight uppercase leading-none",
                  analysisCritical ? "text-red-400" : "text-amber-400"
                )}>
                  {analysisCritical ? t('salesQuota.criticalQuota') : t('salesQuota.lowQuota')}
                </p>
                <p className="text-xs text-slate-500 font-light italic leading-relaxed uppercase tracking-widest">
                  {analysisCritical 
                    ? 'Quota almost depleted! Consider immediate center sync.' 
                    : 'Quota running low. Plan biological cycles accordingly.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <Button 
          variant="outline" 
          size="xl" 
          className="w-full h-18 rounded-[2rem] border-white/10 bg-white/5 text-[11px] font-black uppercase tracking-[0.4em] italic hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl group/refresh relative overflow-hidden" 
          onClick={onRefresh}
          disabled={loading}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/refresh:translate-x-[100%] transition-transform duration-1000" />
          <RefreshCw className={cn("h-5 w-5 mr-4 relative z-10", loading && "animate-spin")} />
          <span className="relative z-10">{t('salesQuota.refresh')}</span>
        </Button>
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
        "p-10 rounded-[3rem] border transition-all duration-500 hover:bg-white/[0.03] ring-1 group/row",
        analysisCritical ? "border-red-500/30 bg-red-500/[0.02] ring-red-500/5 shadow-[0_0_50px_rgba(239,68,68,0.1)]" : 
        analysisLow ? "border-amber-500/30 bg-amber-500/[0.02] ring-amber-500/5 shadow-[0_0_50px_rgba(245,158,11,0.1)]" : 
        "border-white/5 bg-white/[0.01] ring-white/5"
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className={cn(
            "h-16 w-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner transition-transform duration-500 group-hover/row:scale-110 group-hover/row:rotate-3 ring-1",
            analysisCritical ? "bg-red-500/20 text-red-400 ring-red-500/20" : 
            analysisLow ? "bg-amber-500/20 text-amber-400 ring-amber-500/20" : 
            "bg-blue-500/10 text-blue-400 ring-blue-500/20"
          )}>
            {user.sales_name?.charAt(0) || '?'}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h4 className="text-2xl font-black text-white italic tracking-tight uppercase leading-none group-hover/row:text-blue-400 transition-colors">{user.sales_name || 'Unknown'}</h4>
              {analysisCritical && (
                <Badge className="bg-red-500 text-white border-none px-3 py-0.5 text-[9px] font-black italic tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-2" />
                  {t('salesQuota.criticalQuota').toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{user.subscription_tier} NODE • {user.current_month}</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{t('salesQuota.analysis')}</span>
              <span className={cn(
                "font-black italic text-lg tracking-tighter leading-none",
                analysisCritical ? "text-red-400" : analysisLow ? "text-amber-400" : "text-white"
              )}>
                {formatQuota(user.analysis_used, user.analysis_quota)}
              </span>
            </div>
            {!isUnlimited(user.analysis_quota) && (
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn(
                    "h-full relative overflow-hidden",
                    analysisCritical ? "bg-gradient-to-r from-red-600 to-rose-400" : 
                    analysisLow ? "bg-gradient-to-r from-amber-600 to-yellow-400" : 
                    "bg-gradient-to-r from-blue-600 to-cyan-400"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
                </motion.div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{t('salesQuota.ar')}</span>
              <span className="font-black italic text-lg tracking-tighter leading-none text-white">
                {formatQuota(user.ar_used, user.ar_quota)}
              </span>
            </div>
            {!isUnlimited(user.ar_quota) && (
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${getQuotaPercentage(user.ar_used, user.ar_quota)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-600 to-violet-400 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SalesQuotaDashboard
