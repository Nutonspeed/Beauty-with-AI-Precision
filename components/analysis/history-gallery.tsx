"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  Clock, 
  Target,
  ShieldCheck,
  Zap,
  Layers,
  Fingerprint,
  RefreshCw,
  Filter,
  LayoutGrid,
  List
} from "lucide-react"
import type { AnalysisHistoryItem } from "@/types/api"
import { useAuth } from "@/lib/auth/context"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function AnalysisHistoryGallery() {
  const t = useTranslations('analysisHistory')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const lp = useLocalizePath()
  const locale = useLocale()
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ total: 0, limit: 12, offset: 0 })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const loadHistory = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/analysis/history?userId=${user.id}&limit=${pagination.limit}&offset=${pagination.offset}`)
      
      if (!response.ok) {
        throw new Error(t('loadError' as any) || 'Registry Synchronization Failure')
      }

      const result = await response.json()
      setHistory(result.data)
      setPagination(result.pagination)
    } catch (err) {
      console.error('[HistoryGallery] Failed to load history:', err)
      const errorMessage = err instanceof Error ? err.message : (t('loadError' as any) || 'Load Error')
      
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        router.push(lp('/auth/login?callbackUrl=/analysis/history'))
        return
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, router, lp, pagination.limit, pagination.offset, t])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push(lp('/auth/login?callbackUrl=/analysis/history'))
      return
    }
    if (user?.id) {
      loadHistory()
    }
  }, [authLoading, user, router, lp, loadHistory])

  const handleViewAnalysis = (item: AnalysisHistoryItem) => {
    sessionStorage.setItem('analysisImage', item.imageUrl)
    sessionStorage.setItem('analysisResults', JSON.stringify({
      concerns: item.concerns,
      timestamp: item.createdAt,
    }))
    router.push(lp('/analysis/results'))
  }

  const loadMore = () => {
    setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }))
  }

  if (authLoading || isLoading && history.length === 0) {
    return (
      <div className="flex items-center justify-center py-40 bg-white">
        <div className="text-center space-y-8 italic">
          <div className="relative h-24 w-24 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-3xl rounded-full animate-pulse" />
            <RefreshCw className="h-16 w-16 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">Synchronizing_Temporal_Registry...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 bg-white">
        <Card className="max-w-2xl w-full border-slate-100 bg-white shadow-premium rounded-[4rem] p-16 text-center space-y-10 group transition-all duration-700 hover:border-rose-500/20">
          <div className="h-20 w-20 bg-rose-50 rounded-[1.5rem] flex items-center justify-center mx-auto border border-rose-100 group-hover:scale-110 transition-transform duration-700 shadow-sm">
            <Activity className="h-10 w-10 text-rose-600 animate-pulse" />
          </div>
          <div className="space-y-4">
            <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">Registry_Sync_Failure</CardTitle>
            <p className="text-lg text-slate-500 font-medium italic leading-relaxed px-10">{error}</p>
          </div>
          <Button variant="outline" size="xl" className="w-full h-20 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[11px] italic shadow-premium group/retry transition-all hover:bg-slate-50 active:scale-95" onClick={loadHistory}>
            <RefreshCw className="h-6 w-6 mr-4 group-retry:rotate-180 transition-transform duration-700" />
            Re-Initialize_Temporal_Node
          </Button>
        </Card>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <Card className="border-slate-100 bg-slate-50/30 rounded-[5rem] p-32 text-center space-y-12 italic shadow-inner relative overflow-hidden group/empty transition-all duration-1000 hover:border-pink-500/10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />
        <div className="relative h-40 w-40 mx-auto mb-4">
          <div className="absolute inset-0 bg-pink-500/5 blur-[80px] rounded-full animate-pulse" />
          <div className="h-40 w-40 rounded-[3.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-premium group-hover/empty:scale-110 transition-transform duration-700">
            <Layers className="h-20 w-20 text-slate-200 group-hover/empty:text-pink-600/20 transition-colors" />
          </div>
        </div>
        <div className="space-y-6 relative z-10">
          <h3 className="text-4xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('noHistory' as any) || 'REGISTRY_CLEAR'}</h3>
          <p className="text-xl text-slate-400 font-medium italic max-w-lg mx-auto leading-relaxed">{t('noHistoryDesc' as any) || 'No biological synchronization nodes detected in your temporal log.'}</p>
        </div>
        <Button 
          variant="premium" 
          size="xl" 
          className="h-24 px-16 rounded-[3rem] bg-slate-950 text-white border-none shadow-2xl transition-all hover:scale-105 active:scale-95 font-black text-xs uppercase tracking-[0.4em] italic group/btn relative overflow-hidden" 
          onClick={() => router.push(lp('/analysis'))}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
          <Zap className="mr-6 h-8 w-8 group-hover/btn:scale-110 transition-transform" />
          Initialize_Diagnostic_Protocol
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-20 animate-in fade-in duration-1000 bg-white">
      {/* Dashboard Control interface interface */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-slate-50 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black italic shadow-sm animate-pulse">
              <History className="mr-3 h-3.5 w-3.5" />
              TEMPORAL_REGISTRY_v4.8
            </Badge>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-950 italic tracking-tighter uppercase leading-[0.8] transition-all duration-700 group-hover:tracking-tight">
            Historical_Log<br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-4 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">Biological_Registry_Nodes</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-50/50 p-2 rounded-[2rem] border border-slate-100 shadow-inner">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewMode('grid')}
            className={cn(
              "h-14 w-14 rounded-2xl transition-all duration-700",
              viewMode === 'grid' ? "bg-white text-pink-600 shadow-premium scale-110" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <LayoutGrid className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewMode('list')}
            className={cn(
              "h-14 w-14 rounded-2xl transition-all duration-700",
              viewMode === 'list' ? "bg-white text-blue-600 shadow-premium scale-110" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <List className="h-6 w-6" />
          </Button>
          <div className="h-8 w-px bg-slate-200 mx-2" />
          <Button variant="ghost" className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-slate-400 hover:text-slate-950 transition-all group/filter">
            <Filter className="mr-3 h-4 w-4 group-hover/filter:scale-110 transition-transform" />
            FILTER_NODES
          </Button>
        </div>
      </div>

      {/* Stats Summary Matrix matrix interface */}
      <div className="grid gap-10 md:grid-cols-3">
        {[
          { label: t('totalAnalyses' as any) || 'Registry_Nodes', val: pagination.total, sub: 'Global_Multi-Spectrum_Inferences', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('mostCommonConcern' as any) || 'Dominant_Variance', val: getMostCommonConcern(history, t), sub: 'Primary_Optimization_Target', icon: Target, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: t('latestAnalysis' as any) || 'Last_Synchronisation', val: formatRelativeTime(history[0]?.createdAt, t), sub: 'Temporal_Registry_Node', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map((node, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] transition-all duration-1000 hover:border-pink-500/20 group relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-12 pb-8 relative z-10">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic group-hover:text-slate-950 transition-colors leading-none">{node.label}</CardTitle>
                <div className={cn("p-4 rounded-[1.5rem] border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", node.bg)}>
                  <node.icon className={cn("h-7 w-7", node.color)} />
                </div>
              </CardHeader>
              <CardContent className="p-12 pt-0 space-y-4 relative z-10">
                <div className="text-6xl font-black text-slate-950 tracking-tighter italic uppercase leading-[0.8] transition-transform group-hover:scale-105 origin-left duration-700">{node.val}</div>
                <div className="flex items-center gap-4 mt-6">
                  <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", node.color.replace('text', 'bg'))} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-600 transition-colors leading-none">
                    {node.sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gallery/List Hub grid matrix interface */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "grid gap-12",
            viewMode === 'grid' ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}
        >
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 4) * 0.1 }}
            >
              <Card
                className={cn(
                  "group/card cursor-pointer overflow-hidden transition-all duration-1000 hover:shadow-premium border-slate-100 bg-white hover:border-pink-500/20 rounded-[4rem] h-full flex relative",
                  viewMode === 'grid' ? "flex-col" : "flex-row md:items-center p-8 gap-10"
                )}
                onClick={() => handleViewAnalysis(item)}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                <div className={cn(
                  "relative overflow-hidden bg-slate-50 shadow-inner group-hover/card:shadow-none transition-all duration-1000",
                  viewMode === 'grid' ? "aspect-square w-full" : "h-40 w-40 rounded-[2.5rem] shrink-0"
                )}>
                  <Image
                    src={item.thumbnailUrl || item.displayUrl || '/placeholder.svg'}
                    alt={`Analysis Node ${item.id.slice(0, 8)}`}
                    fill
                    className="object-cover transition-transform duration-[4000ms] group-hover/card:scale-110"
                    priority={index < 4}
                    loading={index < 4 ? "eager" : "lazy"}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover/card:opacity-20 transition-opacity duration-1000" />
                  
                  {viewMode === 'grid' && (
                    <div className="absolute bottom-8 left-8 right-8 translate-y-6 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-700">
                      <div className="flex flex-col gap-3">
                        <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] italic shadow-2xl leading-none">
                          NODE_SYNC: {new Date(item.createdAt).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
                          <span className="text-[9px] font-black text-white/80 uppercase tracking-widest italic">FIDELITY_STABLE</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={cn(
                  "p-10 flex-1 flex flex-col justify-between space-y-8 bg-white relative z-10",
                  viewMode === 'list' && "p-0"
                )}>
                  <div className="space-y-6">
                    {viewMode === 'list' && (
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">TEMPORAL_STAMP</p>
                          <h4 className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
                            {new Date(item.createdAt).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                          </h4>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-pink-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-lg uppercase tracking-widest leading-none">NODE_VERIFIED</Badge>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {Object.entries(item.concernCount)
                        .filter(([_, count]) => count > 0)
                        .slice(0, 4)
                        .map(([type, count], i) => (
                          <Badge
                            key={type}
                            variant="outline"
                            className={cn(
                              "px-4 py-1.5 rounded-full border-slate-100 bg-slate-50 text-slate-400 text-[9px] font-black italic uppercase tracking-widest shadow-sm group-hover/card:border-pink-500/20 group-hover/card:text-pink-600 transition-all duration-700",
                              i % 2 === 0 ? "group-hover/card:bg-pink-50" : "group-hover/card:bg-blue-50 group-hover/card:text-blue-600 group-hover/card:border-blue-500/20"
                            )}
                          >
                            {getConcernLabel(type, t)}: {count}
                          </Badge>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-5 text-slate-400 group-hover/card:text-slate-950 transition-colors duration-700">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/card:bg-white group-hover/card:border-pink-100 group-hover/card:scale-110 transition-all">
                        <Fingerprint className="h-5 w-5 text-slate-300 group-hover/card:text-pink-600 transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] italic leading-none">NODE_IDENTIFIER</p>
                        <p className="text-[10px] font-bold tracking-widest font-mono text-slate-300 group-hover/card:text-slate-500 transition-colors italic">{item.id.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" className="w-full h-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 text-slate-400 group-hover/card:bg-slate-950 group-hover/card:border-none group-hover/card:text-white group-hover/card:shadow-2xl transition-all duration-700 font-black text-[10px] uppercase tracking-[0.4em] italic shadow-inner group-hover/card:scale-105">
                    Open_Inference_Log 
                    <ArrowUpRight className="ml-3 h-5 w-5 group-hover/card:translate-x-1 group-hover/card:-translate-y-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Load More Trigger interface interface */}
      {pagination.offset + pagination.limit < pagination.total && (
        <div className="flex flex-col items-center gap-10 pt-10 pb-40">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <Button 
            size="xl" 
            onClick={loadMore} 
            variant="outline" 
            disabled={isLoading}
            className="h-24 px-16 rounded-[3rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.5em] text-xs italic shadow-premium hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all group/load relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent translate-x-[-100%] group-hover/load:translate-x-[100%] transition-transform duration-1000" />
            {isLoading ? (
              <RefreshCw className="mr-6 h-8 w-8 animate-spin text-pink-600" />
            ) : (
              <div className="flex items-center gap-6">
                Synchronize_Remaining_Nodes 
                <Badge className="bg-slate-950 text-white border-none px-4 py-1 rounded-full text-[10px] font-black italic shadow-lg">
                  {pagination.total - pagination.offset - pagination.limit}
                </Badge>
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Global Metadata Registry interface interface */}
      <div className="p-12 lg:p-16 border-t border-slate-100 bg-slate-50/20 flex flex-col md:flex-row items-center justify-between gap-12 rounded-[5rem] opacity-30 hover:opacity-100 transition-all duration-1000 grayscale hover:grayscale-0 group/meta">
        <div className="flex items-center gap-10 text-slate-400 group/status cursor-default">
          <div className="h-16 w-16 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/meta:bg-emerald-50 group-hover/meta:border-emerald-100 transition-all duration-700">
            <ShieldCheck className="h-8 w-8 group-hover/status:text-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 italic leading-none">REGISTRY_INTEGRITY_VERIFIED</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] italic text-slate-400 group-hover/meta:text-slate-600 transition-colors">Neural_Identity_Mesh: SECURE</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex items-center gap-4 bg-white px-8 py-3 rounded-full border border-slate-100 shadow-sm group/infra">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
            <span className="text-[10px] font-black text-slate-950 uppercase tracking-[0.3em] italic group-hover/infra:text-emerald-600 transition-colors">INFRASTRUCTURE_OPTIMAL</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic group-hover/meta:text-slate-500 transition-colors">
            <span>BIP_DOSS_v4.8</span>
            <div className="h-4 w-px bg-slate-200" />
            <span>EPOCH_2026.4_STABLE</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function History(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

// Helper functions
function getMostCommonConcern(history: AnalysisHistoryItem[], t: any): string {
  const counts: Record<string, number> = {}
  
  for (const item of history) {
    for (const [type, count] of Object.entries(item.concernCount)) {
      if (count > 0) {
        counts[type] = (counts[type] || 0) + count
      }
    }
  }

  const entries = Object.entries(counts)
  if (entries.length === 0) return 'Nominal'

  const [topConcern] = entries.reduce((a, b) => (a[1] > b[1] ? a : b))
  return getConcernLabel(topConcern, t)
}

function getConcernLabel(type: string, t: any): string {
  const labels: Record<string, string> = {
    wrinkle: t('wrinkle' as any) || 'Wrinkles',
    pigmentation: t('pigmentation' as any) || 'Pigment',
    pore: t('pore' as any) || 'Pores',
    redness: t('redness' as any) || 'Redness',
    acne: t('acne' as any) || 'Acne',
    dark_circle: t('dark_circle' as any) || 'Dark_Circles',
  }
  return labels[type] || type.toUpperCase()
}

function formatRelativeTime(dateStr: string, t: any): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t('today' as any) || 'TODAY'
  if (diffDays === 1) return t('yesterday' as any) || 'YESTERDAY'
  if (diffDays < 7) return (t('daysAgo' as any || '{days} Days Ago').replace('{days}', String(diffDays))) || `${diffDays}D_AGO`
  return date.toLocaleDateString()
}
