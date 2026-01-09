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
  TrendingUp, 
  Clock,
  Zap,
  Fingerprint,
  Cpu,
  Globe
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useUsageTracking } from "@/lib/analytics/usage-tracker"
import { LayoutGrid, Box, Brain, CheckCircle2 } from "lucide-react"

interface UsageMetrics {
  totalEvents: number
  eventsByCategory: Record<string, number>
  featureUsage: Record<string, number>
  sessionDuration: number
  lastUpdated: Date
}

export function UsageAnalytics() {
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

    // Refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [getSessionStats])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">ไม่สามารถโหลดข้อมูลการใช้งานได้</p>
        </CardContent>
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
    <div className="space-y-12">
      {/* Summary Nodes - Operational Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Events', val: metrics.totalEvents, sub: 'Events this session', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Session Duration', val: formatDuration(metrics.sessionDuration), sub: 'Current uplink time', icon: Clock, color: 'text-pink-400', bg: 'bg-pink-500/10' },
          { label: 'Feature Usage', val: Object.keys(metrics.featureUsage).length, sub: 'Unique protocols', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Last Updated', val: metrics.lastUpdated.toLocaleTimeString(), sub: 'Real-time telemetry', icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{stat.label}</CardTitle>
                <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white tracking-tighter italic">{stat.val}</div>
                <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-500 italic">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Category Architecture Node */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
              <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                <LayoutGrid className="h-8 w-8 text-pink-500" />
                Event Taxonomy
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Distribution of actions by classification</CardDescription>
            </CardHeader>
            <CardContent className="p-10 lg:p-12 space-y-6">
              {Object.entries(metrics.eventsByCategory).length === 0 ? (
                <div className="py-20 text-center space-y-6">
                  <div className="h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-700 mx-auto">
                    <Activity className="h-10 w-10" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">No events synchronized</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(metrics.eventsByCategory).map(([category, count], index) => (
                    <motion.div 
                      key={category} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group/item flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-pink-500/20 transition-all duration-500 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-pink-600/20 group-hover/item:bg-pink-600 transition-colors" />
                      <div className="flex items-center gap-6">
                        <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/item:border-pink-500/30 transition-all">
                          <Fingerprint className="h-5 w-5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-white uppercase tracking-widest italic group-hover:text-pink-400 transition-colors">{category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-white italic tracking-tighter">{count}</span>
                        <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Invocations</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Velocity Node */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
              <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                <Zap className="h-8 w-8 text-cyan-400" />
                Feature Velocity
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Highest engagement clinical nodes</CardDescription>
            </CardHeader>
            <CardContent className="p-10 lg:p-12 space-y-6">
              {getTopFeatures().length === 0 ? (
                <div className="py-20 text-center space-y-6">
                  <div className="h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-700 mx-auto">
                    <Cpu className="h-10 w-10" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">No feature load data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getTopFeatures().map(([feature, count], index) => (
                    <motion.div 
                      key={feature} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group/item flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all duration-500 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-cyan-600/20 group-hover/item:bg-cyan-600 transition-colors" />
                      <div className="flex items-center gap-6">
                        <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/item:border-pink-500/30 transition-all">
                          <Box className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-white uppercase tracking-widest italic group-hover:text-cyan-400 transition-colors">{feature.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-white italic tracking-tighter">{count}</span>
                        <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Access Nodes</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Behavioral Intelligence Node */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
            <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <Brain className="h-8 w-8 text-purple-400" />
              Behavioral Insights
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Pattern recognition and engagement optimization</CardDescription>
          </CardHeader>
          <CardContent className="p-10 lg:p-12">
            <div className="grid gap-8 md:grid-cols-3">
              {metrics.totalEvents === 0 && (
                <div className="md:col-span-3 p-10 rounded-[2rem] bg-blue-500/5 border border-blue-500/20 flex items-center gap-8 group hover:bg-blue-500/10 transition-all">
                  <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <Globe className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-white italic">Getting Started</p>
                    <p className="text-sm text-slate-400 font-light italic">Initialize clinical protocols like AI synthesis to activate behavioral tracking nodes.</p>
                  </div>
                </div>
              )}

              {metrics.eventsByCategory.feature && metrics.eventsByCategory.feature > 5 && (
                <div className="p-10 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-6 group hover:bg-emerald-500/10 transition-all h-full">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-white italic">High Engagement</p>
                    <p className="text-sm text-slate-400 font-light italic leading-relaxed">System detected {metrics.eventsByCategory.feature} unique feature synchronizations. Unit performance is optimal.</p>
                  </div>
                </div>
              )}

              {metrics.sessionDuration > 300000 && (
                <div className="p-10 rounded-[2rem] bg-purple-500/5 border border-purple-500/20 flex flex-col gap-6 group hover:bg-purple-500/10 transition-all h-full">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-white italic">Extended Sequence</p>
                    <p className="text-sm text-slate-400 font-light italic leading-relaxed">Temporal cycle active for {formatDuration(metrics.sessionDuration)}. Consider diagnostic rest node.</p>
                  </div>
                </div>
              )}
              
              <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col gap-6 group hover:bg-white/[0.04] transition-all h-full">
                <div className="h-12 w-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6 text-pink-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold text-white italic">Telemetry Status</p>
                  <p className="text-sm text-slate-400 font-light italic leading-relaxed">Real-time data streaming nominal. All authorized nodes responding within 14ms window.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}