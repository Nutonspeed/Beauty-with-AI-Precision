'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  TrendingUp, 
  Zap, 
  Loader2, 
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  sales_staff_id: string
  sales_staff_name: string
  sales_staff_email: string
  total_leads: number
  hot_leads: number
  converted_leads: number
  conversion_rate: number
  avg_lead_score: number
  rank: number
}

export function SalesLeaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leads/leaderboard?period=${period}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data.leaderboard)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [period])

  if (loading && (!data || data.length === 0)) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-premium">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Synchronizing performance matrix...</p>
        </div>
      </div>
    )
  }

  if (!loading && (!data || data.length === 0)) {
    return (
      <Card className="border-slate-100 bg-slate-50/30 rounded-[3rem] h-[400px] flex items-center justify-center italic shadow-inner">
        <div className="text-center space-y-8">
          <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse">
            <Trophy className="h-12 w-12" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">No node activity recorded in current cycle.</p>
          <Button variant="outline" size="sm" onClick={fetchLeaderboard} className="h-12 px-8 rounded-xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest italic shadow-sm hover:bg-slate-50 transition-all">
            <RefreshCw className="h-4 w-4 mr-3" />
            Initialize_Sync
          </Button>
        </div>
      </Card>
    )
  }

  const topThree = data?.slice(0, 3) || []
  const rest = data?.slice(3) || []

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Period Filter interface */}
      <div className="flex justify-center">
        <div className="flex bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shadow-inner">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-700 italic",
                period === p 
                  ? "bg-white text-slate-950 shadow-premium scale-105" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Podium interface */}
        <div className="lg:col-span-5 space-y-10">
          <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:bg-pink-50 group-hover:border-pink-500/20 transition-all duration-700">
                  <Trophy className="h-8 w-8 text-pink-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">Elite_Performers</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Top Sales Nodes in {period.toUpperCase()}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 lg:p-12 space-y-8">
              {topThree.map((entry, idx) => (
                <motion.div
                  key={entry.sales_staff_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "relative p-8 rounded-[2.5rem] border transition-all duration-700 overflow-hidden group/podium",
                    idx === 0 
                      ? "bg-pink-50/20 border-pink-100 shadow-sm" 
                      : "bg-white border-slate-100"
                  )}
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-50 group-hover/podium:bg-pink-500 transition-all duration-700" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-8">
                      <div className={cn(
                        "h-16 w-16 rounded-2xl flex items-center justify-center text-3xl font-black italic shadow-inner transition-transform group-hover/podium:scale-110",
                        idx === 0 ? "bg-pink-500 text-white shadow-glow-pink/30" : idx === 1 ? "bg-slate-100 text-slate-400" : "bg-orange-100 text-orange-600"
                      )}>
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black text-slate-950 italic uppercase tracking-tight group-hover/podium:text-pink-600 transition-colors leading-none">{entry.sales_staff_name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{entry.sales_staff_email}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center justify-end gap-3 text-pink-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-3xl font-black italic tracking-tighter uppercase leading-none">{entry.conversion_rate.toFixed(1)}%</span>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic leading-none">Yield Coefficient</p>
                    </div>
                  </div>
                  
                  {idx === 0 && (
                    <div className="absolute -top-10 -right-10 p-12 opacity-[0.03] group-hover/podium:scale-110 group-hover/podium:rotate-12 transition-transform duration-1000">
                      <Zap className="h-48 w-48 text-pink-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Global Registry interface */}
        <div className="lg:col-span-7 space-y-10">
          <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10 h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/30">
              <div className="space-y-3">
                <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none text-blue-600">Performance_Registry</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Comparative unit efficiency synchronization</CardDescription>
              </div>
              <Badge variant="outline" className="bg-white border-blue-100 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest animate-pulse">ACTIVE_CYCLE</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/20 border-b border-slate-100">
                      <th className="px-10 py-10 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Rank</th>
                      <th className="px-10 py-10 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Personnel_Node</th>
                      <th className="px-10 py-10 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Inferences</th>
                      <th className="px-10 py-10 text-[10px] font-black uppercase tracking-widest text-slate-400 italic text-center">Score</th>
                      <th className="px-10 py-10 text-[10px] font-black uppercase tracking-widest text-slate-400 italic text-right">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rest.map((entry, idx) => (
                      <tr key={entry.sales_staff_id} className="group/row transition-all duration-500 hover:bg-slate-50/50 relative">
                        <td className="px-10 py-10">
                          <span className={cn(
                            "text-xl font-black italic",
                            entry.rank <= 5 ? "text-pink-600" : "text-slate-300"
                          )}>
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="px-10 py-10">
                          <div className="flex items-center gap-6">
                            <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-300 shadow-inner group-hover/row:bg-white group-hover/row:text-blue-600 group-hover/row:border-blue-100 transition-all duration-700 uppercase">
                              {entry.sales_staff_name.charAt(0)}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <p className="text-lg font-black text-slate-950 italic truncate uppercase tracking-tight group-hover/row:text-pink-600 transition-colors leading-none">{entry.sales_staff_name}</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate italic">{entry.sales_staff_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-10 text-lg font-black text-slate-950 italic uppercase tracking-tighter">
                          {entry.total_leads} <span className="text-[10px] text-slate-300 not-italic ml-1">UNITS</span>
                        </td>
                        <td className="px-10 py-10 text-center">
                          <Badge variant="outline" className="border-emerald-100 text-emerald-600 bg-emerald-50 px-4 py-1.5 text-[10px] font-black italic rounded-full shadow-sm">
                            {entry.avg_lead_score.toFixed(0)} INDEX
                          </Badge>
                        </td>
                        <td className="px-10 py-10 text-right">
                          <div className="flex items-center justify-end gap-4 group/btn cursor-pointer">
                            <span className="text-2xl font-black italic tracking-tighter text-slate-950 group-hover/row:text-pink-600 transition-colors uppercase leading-none">{entry.conversion_rate.toFixed(1)}%</span>
                            <ChevronRight className="h-5 w-5 text-slate-200 group-hover/btn:translate-x-2 group-hover/btn:text-pink-600 transition-all" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function RefreshCw(props: any) {
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
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
