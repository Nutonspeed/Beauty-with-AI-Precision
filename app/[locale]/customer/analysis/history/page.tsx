
'use client'

import { useState, useEffect } from 'react'
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
import { useTranslations } from 'next-intl'
import { useLocalizePath } from '@/lib/i18n/locale-link'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AchievementShareCard } from '@/components/share/achievement-share-card'

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
  const lp = useLocalizePath()
  const { user } = useAuth()
  const [history, setHistory] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compare'>('grid')
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch('/api/analysis/history?limit=50')
        const result = await response.json()
        
        if (result.data) {
          // Map API data to our component interface
          const mappedHistory: AnalysisRecord[] = result.data.map((item: any) => ({
            id: item.id,
            created_at: item.createdAt,
            skin_score: item.overallScore || 80, // Default if not present
            summary: item.summary || 'AI Skin Analysis record.',
            image_url: item.displayUrl || item.imageUrl,
            conditions: item.concerns?.map((c: any) => ({
              name: c.type,
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

  const [comparisonResults, setComparisonResults] = useState<any>(null)
  const [isComparing, setIsComparing] = useState(false)

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

  const comparisonData = selectedForComparison.map(id => history.find(h => h.id === id)).filter(Boolean) as AnalysisRecord[]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none h-[500px]">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <Link href={lp('/customer/dashboard')}>
              <Button variant="ghost" size="sm" className="pl-0 text-slate-500 hover:text-blue-600 group transition-all">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Node Dashboard
              </Button>
            </Link>
            <div className="space-y-2">
              <h1 className="text-5xl font-bold tracking-tight text-slate-900 italic">
                Analysis_<span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent not-italic">Chronology</span>
              </h1>
              <p className="text-slate-500 font-light italic tracking-wide">Tracking your biological evolution across the temporal dimension.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className="rounded-xl px-4"
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Grid
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className="rounded-xl px-4"
            >
              <LayoutList className="h-4 w-4 mr-2" /> List
            </Button>
            <Button 
              variant={viewMode === 'compare' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('compare')}
              className="rounded-xl px-4"
            >
              <Columns className="h-4 w-4 mr-2" /> Compare
            </Button>
          </div>
        </div>

        {/* Comparison Engine Area */}
        <AnimatePresence>
          {viewMode === 'compare' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-blue-500/10 bg-blue-500/[0.02] backdrop-blur-xl rounded-[3rem] shadow-premium p-10">
                <div className="flex flex-col md:flex-row gap-10">
                  {comparisonData.length === 0 ? (
                    <div className="w-full py-20 text-center space-y-4">
                      <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                        <Columns className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-slate-500 italic">Select two records below to initialize Before & After delta analysis.</p>
                    </div>
                  ) : comparisonData.length === 1 ? (
                    <>
                      <ComparisonSlot record={comparisonData[0]} />
                      <div className="flex-1 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center">
                        <p className="text-slate-400 text-sm italic">Select one more record to compare</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ComparisonSlot record={comparisonData[0]} title="Baseline (Before)" />
                      <div className="hidden md:flex flex-col items-center justify-center gap-6">
                        <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 relative z-10">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <Button 
                          onClick={handleRunComparison} 
                          disabled={isComparing}
                          variant="premium" 
                          size="sm" 
                          className="h-10 px-6 rounded-xl relative z-10 font-black italic text-[9px] uppercase tracking-widest"
                        >
                          {isComparing ? 'Processing...' : 'Run_Delta_Sync'}
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
                    className="mt-10 pt-10 border-t border-blue-500/10 grid grid-cols-1 md:grid-cols-3 gap-8"
                  >
                    <div className="bg-white p-6 rounded-3xl border border-blue-500/5 shadow-sm">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Overall Improvement</h5>
                      <div className="text-4xl font-black italic text-blue-600">
                        {comparisonResults.summary.overallImprovement > 0 ? '+' : ''}{comparisonResults.summary.overallImprovement}%
                      </div>
                      <p className="text-xs text-slate-500 mt-2 italic">Aesthetic index variance over {comparisonResults.summary.timeSpanDays} days.</p>
                    </div>

                    <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {comparisonResults.metrics.map((m: any) => (
                        <div key={m.parameter} className="bg-white/40 p-4 rounded-2xl border border-white">
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">{m.parameterLabel.en}</p>
                          <div className={cn(
                            "text-sm font-bold italic",
                            m.trend === 'improving' ? 'text-emerald-500' : m.trend === 'declining' ? 'text-rose-500' : 'text-slate-500'
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

        {/* Records Search & Filter */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              placeholder="Search temporal data nodes..." 
              className="h-16 pl-14 rounded-2xl bg-white border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 italic"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-16 px-8 rounded-2xl border-slate-200 hover:bg-white text-[10px] font-black uppercase tracking-widest italic">
            <Filter className="mr-3 h-4 w-4" /> Filter_Tags
          </Button>
        </div>

        {/* History Grid/List */}
        <div className={cn(
          "grid gap-8",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-96 rounded-[2.5rem] bg-slate-200 animate-pulse" />
            ))
          ) : history.length === 0 ? (
            <div className="col-span-full py-40 text-center space-y-6 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-100 shadow-inner">
                <Clock className="h-10 w-10 text-slate-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 italic">No Chronology Found</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm mt-2">Initialize your first AI skin analysis to begin tracking your aesthetic journey.</p>
              </div>
              <Button variant="premium" className="h-12 px-8 rounded-xl" asChild>
                <Link href={lp('/customer/analysis')}>Start Initial Scan</Link>
              </Button>
            </div>
          ) : (
            history.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {viewMode === ('compare' as any) ? (
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
      "group border-white bg-white/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-premium transition-all hover:translate-y-[-8px] hover:shadow-2xl relative",
      isSelected && "ring-2 ring-blue-500 border-blue-500/50 shadow-blue-500/20 shadow-2xl"
    )}>
      <div className="h-48 overflow-hidden relative">
        <img src={record.image_url} alt="Analysis" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-blue-600 border-none font-black italic">
          {record.skin_score}/100
        </Badge>
        {compareMode && (
          <button 
            onClick={(e) => { e.preventDefault(); onSelect(); }}
            className={cn(
              "absolute top-4 left-4 h-8 w-8 rounded-lg flex items-center justify-center transition-all",
              isSelected ? "bg-blue-600 text-white" : "bg-white/90 text-slate-400 hover:text-blue-600"
            )}
          >
            <CheckCircle2 className="h-5 w-5" />
          </button>
        )}
      </div>
      <CardContent className="p-8 space-y-4">
        <div className="flex items-center gap-3 text-slate-400">
          <Calendar className="h-3 w-3" />
          <span className="text-[10px] font-black uppercase tracking-widest">{new Date(record.created_at).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2 italic font-medium leading-relaxed">
          "{record.summary}"
        </p>
        <div className="flex flex-wrap gap-2">
          {record.conditions.map(c => (
            <Badge key={c.name} variant="outline" className="text-[8px] px-2 py-0 border-slate-100 bg-slate-50/50 text-slate-500 italic">
              {c.name}: {c.severity}
            </Badge>
          ))}
        </div>
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-transparent" asChild>
            <Link href={lp(`/customer/analysis/results/${record.id}`)}>
              Inspect_Log <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            {!compareMode && (
               <Button variant="ghost" size="sm" onClick={onSelect} className={cn("text-[9px] font-bold uppercase", isSelected ? "text-blue-600" : "text-slate-400")}>
                 Compare
               </Button>
            )}
            <Dialog onOpenChange={(open) => open && !shareData && handleShare()}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600">
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#020617] border-white/10 text-white rounded-[2.5rem] max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold italic">Share Analysis Result</DialogTitle>
                  <DialogDescription className="text-slate-500 uppercase tracking-widest text-[10px] font-black">
                    Export your aesthetic evolution to your social network
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                  {isSharing ? (
                    <div className="h-64 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Generating Secure Node Link...</p>
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
      "group border-white bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-premium transition-all hover:bg-white relative",
      isSelected && "ring-2 ring-blue-500"
    )}>
      <CardContent className="p-6 flex flex-col md:flex-row items-center gap-8">
        <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
          <img src={record.image_url} alt="Analysis" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-slate-900 italic">{new Date(record.created_at).toLocaleDateString()}</span>
              <Badge className="bg-blue-100 text-blue-600 border-none italic font-black text-[10px]">
                SCORE: {record.skin_score}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl h-10 px-6 text-[10px] font-black uppercase italic" asChild>
                <Link href={lp(`/customer/analysis/results/${record.id}`)}>View Detailed Result</Link>
              </Button>
              <Button 
                variant={isSelected ? "secondary" : "ghost"} 
                size="sm" 
                onClick={onSelect}
                className={cn("rounded-xl h-10 px-4", isSelected && "text-blue-600 bg-blue-50")}
              >
                {isSelected ? <CheckCircle2 className="h-4 w-4" /> : <Columns className="h-4 w-4" />}
              </Button>
              <Dialog onOpenChange={(open) => open && !shareData && handleShare()}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#020617] border-white/10 text-white rounded-[2.5rem] max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold italic">Share Analysis Result</DialogTitle>
                    <DialogDescription className="text-slate-500 uppercase tracking-widest text-[10px] font-black">
                      Export your aesthetic evolution to your social network
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6">
                    {isSharing ? (
                      <div className="h-64 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Generating Secure Node Link...</p>
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
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium italic">"{record.summary}"</p>
          <div className="flex gap-4 items-center pt-2">
             <div className="flex -space-x-2">
               {record.conditions.map((c, i) => (
                 <div key={i} className="h-6 px-3 rounded-full bg-slate-100 border border-white text-[9px] flex items-center justify-center font-bold text-slate-600 uppercase tracking-tighter">
                   {c.name}
                 </div>
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
    <div className="flex-1 space-y-6">
      {title && <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/60 text-center">{title}</h4>}
      <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-inner group relative">
        <img src={record.image_url} alt="Comparison" className="w-full h-full object-cover" />
        <div className="absolute top-6 right-6 h-12 w-12 rounded-2xl bg-white/90 backdrop-blur-md flex flex-col items-center justify-center shadow-lg">
          <span className="text-xs font-black text-blue-600 italic leading-none">{record.skin_score}</span>
          <span className="text-[8px] font-black text-slate-400 uppercase leading-none mt-1">Idx</span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold italic text-slate-900">{new Date(record.created_at).toLocaleDateString()}</span>
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {record.conditions.map(c => (
            <div key={c.name} className="p-3 bg-white border border-slate-100 rounded-2xl flex flex-col gap-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{c.name}</span>
              <span className="text-xs font-bold italic text-slate-900">{c.severity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
