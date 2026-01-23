"use client"

import { useEffect, useState } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Activity, 
  Eye, 
  Clock,
  Zap,
  Fingerprint,
  Cpu,
  Globe,
  LayoutGrid,
  Box,
  Brain,
  CheckCircle2,
  ShieldCheck
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useUsageTracking } from "@/lib/analytics/usage-tracker"
import { useTranslations } from "next-intl"

interface UsageMetrics {
  totalEvents: number
  eventsByCategory: Record<string, number>
  featureUsage: Record<string, number>
  sessionDuration: number
  lastUpdated: Date
}

export function UsageAnalytics() {
  const t = useTranslations()
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getSessionStats } = useUsageTracking()

  useEffect(() => {
    const loadMetrics = () => {
      try {
        const sessionStats = getSessionStats()
        const mockMetrics: UsageMetrics = {
          totalEvents: sessionStats.totalEvents,
          eventsByCategory: sessionStats.eventsByCategory,
          featureUsage: sessionStats.featureUsage,
          sessionDuration: sessionStats.sessionDuration,
          lastUpdated: new Date(),
        }
        setMetrics(mockMetrics)
      } catch (error) {
        console.error('Failed to load usage metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()

    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [getSessionStats])

  if (isLoading && !metrics) {
    return (
      <div className="space-y-12 animate-in fade-in duration-700">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-[3rem] bg-slate-100" />
          ))}
        </div>
        <Skeleton className="h-[500px] rounded-[4rem] bg-slate-100" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <Card className="border-slate-100 bg-slate-50/30 rounded-[4rem] p-40 text-center space-y-10 italic shadow-inner">
        <div className="mx-auto h-32 w-32 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-inner">
          <Activity className="h-16 w-16" />
        </div>
        <div className="space-y-4">
          <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('usageAnalytics.errorLoad' as any) || 'TELEMETRY_OFFLINE'}</h3>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Unable to establish secure telemetry uplink node.</p>
        </div>
      </Card>
    )
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const getTopFeatures = () => {
    return Object.entries(metrics.featureUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Summary Nodes interface */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: t('usageAnalytics.totalEvents' as any) || 'Total_Invocations', val: metrics.totalEvents, sub: t('usageAnalytics.eventsThisSession' as any) || 'Active Cycle Events', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('usageAnalytics.sessionDuration' as any) || 'Temporal_Uptime', val: formatDuration(metrics.sessionDuration), sub: t('usageAnalytics.currentUplinkTime' as any) || 'Active Link Session', icon: Clock, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: t('usageAnalytics.featureUsage' as any) || 'Module_Interactions', val: Object.keys(metrics.featureUsage).length, sub: t('usageAnalytics.uniqueProtocols' as any) || 'Distinct Feature Syncs', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('usageAnalytics.lastUpdated' as any) || 'Last_Telemetry_Sync', val: metrics.lastUpdated.toLocaleTimeString(), sub: t('usageAnalytics.realtimeTelemetry' as any) || 'Neural Data Inflow', icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{stat.label}</CardTitle>
                <div className={cn("p-3 rounded-2xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{stat.val}</div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic group-hover:text-slate-600 transition-colors leading-relaxed">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Category Architecture Node interface */}
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10 h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                  <LayoutGrid className="h-8 w-8 text-pink-600 group-hover:text-white" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('usageAnalytics.eventTaxonomy' as any) || 'Event_Log_Distribution'}</CardTitle>
                  <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2 italic">{t('usageAnalytics.distributionDesc' as any) || 'Analysis of active node event categorization'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 lg:p-16 space-y-8 bg-white flex-1">
              {Object.entries(metrics.eventsByCategory).length === 0 ? (
                <div className="py-24 text-center space-y-8 italic opacity-40">
                  <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto shadow-inner">
                    <Activity className="h-12 w-12 text-slate-300" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{t('usageAnalytics.noEventsSync' as any) || 'NO_EVENT_PAYLOADS_DETECTED'}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(metrics.eventsByCategory).map(([category, count], index) => (
                    <motion.div 
                      key={category} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group/item p-8 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-pink-500/20 transition-all duration-700 shadow-inner hover:shadow-premium relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/item:bg-pink-600 transition-all duration-700" />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-8">
                          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/item:scale-110 group-hover/item:border-pink-100 transition-all duration-700">
                            <Fingerprint className="h-7 w-7 text-slate-300 group-hover/item:text-pink-600 transition-colors" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-xl font-black text-slate-950 uppercase tracking-tighter italic group-hover/item:text-pink-600 transition-colors leading-none">{category}</span>
                            <Badge variant="outline" className="text-[8px] font-black border-slate-200 bg-white text-slate-400 italic px-3 py-1 rounded-full uppercase">PROTOCOL_NODE</Badge>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-4xl font-black text-slate-950 italic tracking-tighter leading-none group-hover/item:scale-110 transition-transform duration-700">{count}</span>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic leading-none">{t('usageAnalytics.invocations' as any) || 'SYNC_LOGS'}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Velocity interface */}
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-blue-500/10 h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-700">
                  <Zap className="h-8 w-8 text-blue-600 group-hover:text-white" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('usageAnalytics.featureVelocity' as any) || 'Feature_Engage_Velocity'}</CardTitle>
                  <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2 italic">{t('usageAnalytics.highestEngagement' as any) || 'Top-tier interaction nodes within current temporal sequence'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 lg:p-16 space-y-8 bg-white flex-1">
              {getTopFeatures().length === 0 ? (
                <div className="py-24 text-center space-y-8 italic opacity-40">
                  <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto shadow-inner">
                    <Cpu className="h-12 w-12 text-slate-300" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{t('usageAnalytics.noFeatureLoad' as any) || 'NO_FEATURE_SYNC_DETECTED'}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {getTopFeatures().map(([feature, count], index) => (
                    <motion.div 
                      key={feature} 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group/feature p-8 rounded-[3rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-500/20 transition-all duration-700 shadow-inner hover:shadow-premium relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/feature:bg-blue-600 transition-all duration-700" />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-8">
                          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/feature:scale-110 group-hover/feature:border-blue-100 transition-all duration-700">
                            <Box className="h-7 w-7 text-slate-300 group-hover/feature:text-blue-600 transition-colors" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-xl font-black text-slate-950 uppercase tracking-tighter italic group-hover/feature:text-blue-600 transition-colors leading-none">{feature.replace(/_/g, ' ')}</span>
                            <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black italic shadow-sm uppercase tracking-widest px-3 py-1 rounded-lg leading-none">High_Engagement</Badge>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-4xl font-black text-slate-950 italic tracking-tighter leading-none group-hover/feature:scale-110 transition-transform duration-700">{count}</span>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic leading-none">{t('usageAnalytics.accessNodes' as any) || 'NODE_HITS'}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Behavioral Intelligence interface */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                <Brain className="h-8 w-8 text-pink-600 group-hover:text-white" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('usageAnalytics.behavioralInsights' as any) || 'Behavioral_Intelligence_Mesh'}</CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2 italic">{t('usageAnalytics.patternRecognitionDesc' as any) || 'Autonomous identity behavior mapping and recursive cycle optimization'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 lg:p-16 bg-white">
            <div className="grid gap-10 md:grid-cols-3">
              {metrics.totalEvents === 0 ? (
                <div className="md:col-span-3 p-12 rounded-[3rem] bg-slate-50 border border-slate-100 border-dashed flex flex-col items-center gap-8 group/init transition-all duration-700 hover:bg-white hover:border-blue-500/20 shadow-inner">
                  <div className="h-20 w-20 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/init:scale-110 group-hover/init:border-blue-100 transition-all">
                    <Globe className="h-10 w-10 text-slate-200 group-hover/init:text-blue-600 transition-colors" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('usageAnalytics.gettingStarted' as any) || 'Awaiting_Initialization'}</p>
                    <p className="text-sm text-slate-500 font-medium italic">{t('usageAnalytics.initProtocols' as any) || 'Initialize biometric protocols to authorize behavioral telemetry inflow.'}</p>
                  </div>
                </div>
              ) : (
                <>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-10 rounded-[3rem] bg-emerald-50/50 border border-emerald-100 flex flex-col gap-10 group/insight transition-all duration-700 hover:bg-white hover:border-emerald-500/20 shadow-inner hover:shadow-premium"
                  >
                    <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-emerald-100 flex items-center justify-center shadow-sm group-hover/insight:scale-110 transition-transform duration-700">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover/insight:text-emerald-600 transition-colors">{t('usageAnalytics.highEngagement' as any) || 'High_Yield_State'}</p>
                      <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">{t('usageAnalytics.unitPerformanceOptimal' as any || 'Unit performance optimized with {count} active module syncs.').replace('{count}', String(metrics.eventsByCategory.feature || 0))}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="p-10 rounded-[3rem] bg-purple-50/50 border border-purple-100 flex flex-col gap-10 group/insight transition-all duration-700 hover:bg-white hover:border-purple-500/20 shadow-inner hover:shadow-premium"
                  >
                    <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-purple-100 flex items-center justify-center shadow-sm group-hover/insight:scale-110 transition-transform duration-700">
                      <Clock className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover/insight:text-purple-600 transition-colors">{t('usageAnalytics.extendedSequence' as any) || 'Deep_Temporal_Sync'}</p>
                      <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">{t('usageAnalytics.temporalCycleActive' as any || 'Long-duration temporal cycle active: {duration} established.').replace('{duration}', formatDuration(metrics.sessionDuration))}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="p-10 rounded-[3rem] bg-blue-50/50 border border-blue-100 flex flex-col gap-10 group/insight transition-all duration-700 hover:bg-white hover:border-blue-500/20 shadow-inner hover:shadow-premium"
                  >
                    <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-blue-100 flex items-center justify-center shadow-sm group-hover/insight:scale-110 transition-transform duration-700">
                      <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover/insight:text-blue-600 transition-colors">{t('usageAnalytics.telemetryStatus' as any) || 'Telemetry_Nominal'}</p>
                      <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">{t('usageAnalytics.streamingNominal' as any) || 'Continuous biological telemetry stream verified and committed to registry.'}</p>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Behavior_Logic_Verified: BIP_BEHAVE_v4.2</p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="bg-white border-slate-100 text-slate-300 text-[8px] font-black italic uppercase tracking-widest px-4 py-1.5 rounded-full">BIP-Usage-v4.8</Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Temporal_Log: {metrics.lastUpdated.toISOString()}</p>
        </div>
      </div>
    </div>
  )
}
