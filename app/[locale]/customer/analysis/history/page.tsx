"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Search,
  Filter,
  ArrowLeft,
  LayoutGrid,
  LayoutList,
  Columns,
  ShieldCheck,
  TrendingUp, 
  Clock,
  Share2,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/context'
import { useTranslations, useLocale } from 'next-intl'
import { useLocalizePath } from '@/lib/i18n/locale-link'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AchievementShareCard } from '@/components/share/achievement-share-card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface AnalysisRecord {
  id: string
  created_at: string
  skin_score: number
  summary: string
  image_url: string
  conditions: { name: string; severity: string }[]
}

export default function AnalysisHistoryPage() {
  const t = useTranslations()
  const locale = useLocale()
  const lp = useLocalizePath()
  const { user } = useAuth()
  const [history, setHistory] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compare'>('grid')
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [comparisonResults, setComparisonResults] = useState<any>(null)
  const [isComparing, setIsComparing] = useState(false)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch('/api/analysis/history?limit=50')
        const result = await response.json()
        
        if (result.data) {
          const mappedHistory: AnalysisRecord[] = result.data.map((item: any) => ({
            id: item.id,
            created_at: item.createdAt || item.created_at,
            skin_score: item.overallScore || 80,
            summary: item.summary || 'AI Skin Analysis record.',
            image_url: item.displayUrl || item.imageUrl,
            conditions: item.concerns?.map((c: any) => ({
              name: c.type || c.name,
              severity: c.severity > 70 ? 'High' : c.severity > 30 ? 'Moderate' : 'Low'
            })) || []
          }))
          setHistory(mappedHistory)
        }
      } catch (error) {
        console.error('Failed to fetch analysis history:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchHistory()
    }
  }, [user])

  const toggleCompare = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter(i => i !== id))
    } else if (selectedForComparison.length < 2) {
      setSelectedForComparison([...selectedForComparison, id])
    }
  }

  const handleRunComparison = async () => {
    if (selectedForComparison.length < 2) return

    setIsComparing(true)
    try {
      const response = await fetch('/api/analysis/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisIds: selectedForComparison,
          userId: user?.id
        })
      })
      const result = await response.json()
      if (result.success) {
        setComparisonResults(result.data)
      }
    } catch (error) {
      console.error('Comparison error:', error)
    } finally {
      setIsComparing(false)
    }
  }

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history
    const query = searchQuery.toLowerCase()
    return history.filter(item => 
      item.customerName?.toLowerCase().includes(query) || 
      item.summary.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    )
  }, [history, searchQuery])

  const comparisonData = selectedForComparison.map(id => history.find(h => h.id === id)).filter(Boolean) as AnalysisRecord[]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Synchronizing Chronology Nodes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6">
                <Link href={lp('/customer/dashboard')}>
                  <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Calendar className="mr-3 h-3.5 w-3.5" />
                  Evolutionary Chronology Node
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Analysis_<span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Chronology</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                Tracking your biological evolution across the temporal dimension with precision AI telemetry.
              </p>
            </motion.div>

            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shadow-inner shrink-0">
              <Button 
                variant={viewMode === 'grid' ? 'premium' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest italic transition-all",
                  viewMode === 'grid' ? "shadow-premium" : "text-slate-400 hover:text-slate-900"
                )}
              >
                <LayoutGrid className="h-4 w-4 mr-2" /> Grid
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'premium' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('list')}
                className={cn(
                  "rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest italic transition-all",
                  viewMode === 'list' ? "shadow-premium" : "text-slate-400 hover:text-slate-900"
                )}
              >
                <LayoutList className="h-4 w-4 mr-2" /> List
              </Button>
              <Button 
                variant={viewMode === 'compare' ? 'premium' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('compare')}
                className={cn(
                  "rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest italic transition-all",
                  viewMode === 'compare' ? "shadow-premium" : "text-slate-400 hover:text-slate-900"
                )}
              >
                <Columns className="h-4 w-4 mr-2" /> Compare
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {viewMode === 'compare' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="border-slate-100 bg-slate-50/30 backdrop-blur-3xl rounded-[3.5rem] shadow-premium p-12 mb-16 relative group">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <div className="flex flex-col md:flex-row gap-12">
                    {comparisonData.length === 0 ? (
                      <div className="w-full py-24 text-center space-y-8 bg-white rounded-[3rem] border border-slate-100 shadow-inner italic">
                        <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 animate-pulse">
                          <Columns className="h-10 w-10 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xl font-black text-slate-950 uppercase tracking-tighter">Delta Sequence Pending</p>
                          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Select two records below to initialize Before & After analysis.</p>
                        </div>
                      </div>
                    ) : comparisonData.length === 1 ? (
                      <>
                        <ComparisonSlot record={comparisonData[0]} />
                        <div className="flex-1 border-2 border-dashed border-slate-200 rounded-[3rem] flex items-center justify-center bg-white/50 italic">
                          <p className="text-slate-400 text-sm font-black uppercase tracking-widest animate-pulse">Awaiting Secondary Node Selection</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <ComparisonSlot record={comparisonData[0]} title="Baseline (Before)" />
                        <div className="hidden md:flex flex-col items-center justify-center gap-8">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-pink-500/30 relative z-10 animate-glow-pulse">
                            <TrendingUp className="h-8 w-8" />
                          </div>
                          <Button 
                            onClick={handleRunComparison} 
                            disabled={isComparing}
                            variant="premium" 
                            size="xl" 
                            className="h-16 px-10 rounded-2xl relative z-10 font-black italic text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border-none shadow-premium"
                          >
                            {isComparing ? (
                              <div className="flex items-center gap-3">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                              </div>
                            ) : 'Run_Delta_Sync'}
                          </Button>
                        </div>
                        <ComparisonSlot record={comparisonData[1]} title="Current (After)" />
                      </>
                    )}
                  </div>

                  {comparisonResults && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 pt-12 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-10"
                    >
                      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium relative overflow-hidden group/metric">
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500 transition-all duration-700" />
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic group-hover/metric:text-emerald-600 transition-colors">Overall Improvement</h5>
                        <div className="text-6xl font-black italic text-emerald-600 tracking-tighter leading-none">
                          {comparisonResults.summary.overallImprovement > 0 ? '+' : ''}{comparisonResults.summary.overallImprovement}%
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-6 italic">Aesthetic index variance over {comparisonResults.summary.timeSpanDays} days.</p>
                      </div>

                      <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {comparisonResults.metrics.map((m: any) => (
                          <div key={m.parameter} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm transition-all duration-500 hover:shadow-premium group/sub">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 italic group-hover/sub:text-pink-600 transition-colors">{m.parameterLabel.en}</p>
                            <div className={cn(
                              "text-2xl font-black italic tracking-tighter uppercase leading-none transition-transform duration-500 group-hover/sub:translate-x-1",
                              m.trend === 'improving' ? 'text-emerald-600' : m.trend === 'declining' ? 'text-rose-600' : 'text-slate-400'
                            )}>
                              {m.changePercent > 0 ? '+' : ''}{m.changePercent}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search & Filter */}
          <div className="grid gap-10 lg:grid-cols-12 items-end">
            <div className="lg:col-span-9 space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2 italic leading-none">Temporal Data Search</Label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-blue-600/20 rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none z-20">
                  <Search className="h-6 w-6 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                </div>
                <Input 
                  placeholder="Search temporal data nodes..." 
                  className="h-16 pl-20 pr-10 rounded-2xl border-slate-100 bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all text-base font-bold italic shadow-inner relative z-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <Button variant="outline" className="w-full h-16 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic shadow-premium hover:bg-slate-50">
                <Filter className="mr-4 h-5 w-5" /> Filter_Tags
              </Button>
            </div>
          </div>

          <div className={cn(
            "grid gap-8",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {history.length === 0 ? (
              <div className="col-span-full py-40 text-center space-y-10 bg-white rounded-[3.5rem] border border-slate-100 italic shadow-sm">
                <div className="mx-auto h-32 w-32 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse shadow-inner">
                  <Clock className="h-16 w-16" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">No Chronology Found</h3>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Initialize your first AI skin analysis to begin tracking.</p>
                </div>
                <Button variant="premium" size="xl" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" asChild>
                  <Link href={lp('/customer/analysis')}>Start Initial Scan</Link>
                </Button>
              </div>
            ) : (
              filteredHistory.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {viewMode === 'grid' ? (
                    <HistoryGridItem 
                      record={record} 
                      isSelected={selectedForComparison.includes(record.id)} 
                      onSelect={() => toggleCompare(record.id)}
                      compareMode={viewMode === 'compare'}
                    />
                  ) : (
                    <HistoryListItem 
                      record={record}
                      isSelected={selectedForComparison.includes(record.id)} 
                      onSelect={() => toggleCompare(record.id)}
                      compareMode={viewMode === 'compare'}
                    />
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function HistoryGridItem({ record, isSelected, onSelect, compareMode }: { record: AnalysisRecord, isSelected: boolean, onSelect: () => void, compareMode: boolean }) {
  const lp = useLocalizePath()
  const [isSharing, setIsSharing] = useState(false)
  const [shareData, setShareData] = useState<any>(null)

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const response = await fetch('/api/analysis/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: record.id,
          expiry_days: 30
        })
      })
      const result = await response.json()
      if (result.success) {
        setShareData(result.data)
      }
    } catch (error) {
      console.error('Failed to create share link:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Card className={cn(
      "group border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10",
      isSelected && "ring-2 ring-pink-500 border-pink-500/30"
    )}>
      <div className="h-56 overflow-hidden relative">
        <img src={record.image_url} alt="Analysis" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <Badge className="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-pink-600 border-none font-black italic shadow-premium px-4 py-1.5 rounded-full text-[11px] uppercase tracking-widest">
          {record.skin_score}/100
        </Badge>
        {compareMode && (
          <button 
            onClick={(e) => { e.preventDefault(); onSelect(); }}
            className={cn(
              "absolute top-6 left-6 h-10 w-10 rounded-xl flex items-center justify-center transition-all shadow-premium",
              isSelected ? "bg-pink-600 text-white" : "bg-white/90 text-slate-400 hover:text-pink-600"
            )}
          >
            <CheckCircle2 className="h-6 w-6" />
          </button>
        )}
      </div>
      <CardContent className="p-10 space-y-6 bg-slate-50/30">
        <div className="flex items-center gap-4 text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-inner w-fit">
          <Calendar className="h-3.5 w-3.5 text-pink-500/40" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">{new Date(record.created_at).toLocaleDateString()}</span>
        </div>
        <p className="text-lg text-slate-600 line-clamp-2 italic font-light leading-relaxed group-hover:text-slate-950 transition-colors">
          "{record.summary}"
        </p>
        <div className="flex flex-wrap gap-3">
          {record.conditions.map(c => (
            <Badge key={c.name} variant="outline" className="text-[9px] px-4 py-1.5 border-slate-200 bg-white text-slate-500 italic font-black uppercase tracking-widest shadow-sm">
              {c.name}: {c.severity}
            </Badge>
          ))}
        </div>
        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
          <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] text-pink-600 hover:bg-transparent transition-all hover:translate-x-2 italic" asChild>
            <Link href={lp(`/customer/analysis/results/${record.id}`)}>
              Inspect_Log <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Dialog onOpenChange={(open) => open && !shareData && handleShare()}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-pink-600 bg-white border border-slate-100 shadow-inner transition-all">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="border-slate-100 p-12 rounded-[3.5rem] shadow-premium max-w-xl bg-white overflow-hidden selection:bg-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <DialogHeader className="space-y-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-pink-50 border border-pink-100 shadow-sm mb-2 group">
                    <Share2 className="h-10 w-10 text-pink-600 transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <DialogTitle className="text-4xl font-black text-slate-950 tracking-tight italic uppercase leading-none">Share Analysis Result</DialogTitle>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Export your aesthetic evolution to your social network</p>
                </DialogHeader>
                <div className="py-10 bg-slate-50/30 rounded-[2.5rem] border border-slate-50 mt-8 shadow-inner">
                  {isSharing ? (
                    <div className="h-64 flex flex-col items-center justify-center space-y-6">
                      <Loader2 className="h-12 w-12 animate-spin text-pink-600" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse italic">Generating Secure Node Link...</p>
                    </div>
                  ) : (
                    <AchievementShareCard 
                      milestone={{
                        title: `Aesthetic Score: ${record.skin_score}/100`,
                        description: record.summary,
                        achievedAt: record.created_at,
                        type: 'analysis_result',
                        xp: 250
                      }}
                      userName="Aesthetic Explorer"
                      centerName="Aesthetic Intelligence Hub"
                      shareUrl={shareData?.share_url}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HistoryListItem({ record, isSelected, onSelect, compareMode }: { record: AnalysisRecord, isSelected: boolean, onSelect: () => void, compareMode: boolean }) {
  const lp = useLocalizePath()
  const [isSharing, setIsSharing] = useState(false)
  const [shareData, setShareData] = useState<any>(null)

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const response = await fetch('/api/analysis/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: record.id,
          expiry_days: 30
        })
      })
      const result = await response.json()
      if (result.success) {
        setShareData(result.data)
      }
    } catch (error) {
      console.error('Failed to create share link:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Card className={cn(
      "group border-slate-100 bg-white shadow-premium rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:border-pink-500/10 relative",
      isSelected && "ring-2 ring-pink-500 border-pink-500/30"
    )}>
      <CardContent className="p-8 flex flex-col md:flex-row items-center gap-10">
        <div className="h-32 w-32 rounded-[2rem] overflow-hidden shrink-0 border border-slate-100 shadow-inner group-hover:scale-105 transition-all duration-1000">
          <img src={record.image_url} alt="Analysis" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 shadow-inner">
                <Calendar className="h-3 w-3 text-pink-500/40" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">{new Date(record.created_at).toLocaleDateString()}</span>
              </div>
              <Badge className="bg-pink-50 text-pink-600 border-none italic font-black text-[11px] px-5 py-1.5 rounded-full shadow-sm">
                SCORE: {record.skin_score}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="h-12 px-6 rounded-xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic shadow-premium hover:bg-slate-50" asChild>
                <Link href={lp(`/customer/analysis/results/${record.id}`)}>Inspect Detailed Results</Link>
              </Button>
              <Button 
                variant={isSelected ? "premium" : "ghost"} 
                size="sm" 
                onClick={onSelect}
                className={cn("h-12 px-6 rounded-xl transition-all font-black uppercase tracking-widest italic text-[10px] shadow-sm", isSelected ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none shadow-premium" : "text-slate-400 bg-slate-50 border border-slate-100 shadow-inner hover:text-pink-600")}
              >
                {isSelected ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Columns className="h-4 w-4 mr-2" />}
                {isSelected ? "Selected" : "Compare"}
              </Button>
              <Dialog onOpenChange={(open) => open && !shareData && handleShare()}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-400 hover:text-pink-600 bg-slate-50 border border-slate-100 shadow-inner transition-all">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-slate-100 p-12 rounded-[3.5rem] shadow-premium max-w-xl bg-white overflow-hidden selection:bg-pink-500/10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                  <DialogHeader className="space-y-6 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-pink-50 border border-pink-100 shadow-sm mb-2 group">
                      <Share2 className="h-10 w-10 text-pink-600 transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <DialogTitle className="text-4xl font-black text-slate-950 tracking-tight italic uppercase leading-none">Share Analysis Result</DialogTitle>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Export your aesthetic evolution to your social network</p>
                  </DialogHeader>
                  <div className="py-10 bg-slate-50/30 rounded-[2.5rem] border border-slate-50 mt-8 shadow-inner">
                    {isSharing ? (
                      <div className="h-64 flex flex-col items-center justify-center space-y-6">
                        <Loader2 className="h-12 w-12 animate-spin text-pink-600" />
                        <p className="text-[10px] font-black uppercase widests text-slate-400 animate-pulse italic">Generating Secure Node Link...</p>
                      </div>
                    ) : (
                      <AchievementShareCard 
                        milestone={{
                          title: `Aesthetic Score: ${record.skin_score}/100`,
                          description: record.summary,
                          achievedAt: record.created_at,
                          type: 'analysis_result',
                          xp: 250
                        }}
                        userName="Aesthetic Explorer"
                        centerName="Aesthetic Intelligence Hub"
                        shareUrl={shareData?.share_url}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <p className="text-xl text-slate-500 font-light italic leading-relaxed group-hover:text-slate-950 transition-colors">"{record.summary}"</p>
          <div className="flex gap-4 items-center pt-4">
             <div className="flex flex-wrap gap-3">
               {record.conditions.map((c, i) => (
                 <Badge key={i} variant="outline" className="h-8 px-5 rounded-full bg-slate-50 border border-slate-100 text-[10px] flex items-center justify-center font-black text-slate-400 uppercase tracking-widest italic group-hover:text-pink-600 group-hover:border-pink-500/20 transition-all shadow-inner">
                   {c.name}: {c.severity}
                 </Badge>
               ))}
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ComparisonSlot({ record, title }: { record: AnalysisRecord, title?: string }) {
  return (
    <div className="flex-1 space-y-8">
      {title && <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-600/60 text-center italic leading-none">{title}</h4>}
      <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden border border-slate-100 shadow-premium group relative bg-slate-50">
        <img src={record.image_url} alt="Comparison" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute top-8 right-8 h-16 w-16 rounded-3xl bg-white/90 backdrop-blur-md flex flex-col items-center justify-center shadow-premium border border-white/20">
          <span className="text-2xl font-black text-pink-600 italic tracking-tighter leading-none">{record.skin_score}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase leading-none mt-1.5 italic">Idx</span>
        </div>
      </div>
      <div className="space-y-6 px-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-lg font-black italic text-slate-950 uppercase tracking-tight leading-none">{new Date(record.created_at).toLocaleDateString()}</span>
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {record.conditions.map(c => (
            <div key={c.name} className="p-5 bg-white border border-slate-50 rounded-2xl flex flex-col gap-2 shadow-sm hover:shadow-premium transition-all duration-500">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{c.name}</span>
              <span className="text-sm font-black italic text-slate-950 uppercase">{c.severity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
