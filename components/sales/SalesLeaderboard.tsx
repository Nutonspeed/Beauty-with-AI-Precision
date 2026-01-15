
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
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] h-[600px] flex items-center justify-center ring-1 ring-white/10">
        <div className="text-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Synchronizing performance matrix...</p>
        </div>
      </Card>
    )
  }

  if (!loading && (!data || data.length === 0)) {
    return (
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] h-[400px] flex items-center justify-center ring-1 ring-white/10">
        <div className="text-center space-y-6 opacity-40">
          <Trophy className="h-12 w-12 text-slate-500 mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">No node activity recorded in current cycle.</p>
          <Button variant="outline" size="sm" onClick={fetchLeaderboard} className="h-10 rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest italic">
            Initialize_Sync
          </Button>
        </div>
      </Card>
    )
  }

  const topThree = data?.slice(0, 3) || []
  const rest = data?.slice(3) || []

  return (
    <div className="space-y-10">
      {/* Period Filter */}
      <div className="flex justify-center">
        <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl shadow-inner">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500",
                period === p 
                  ? "bg-white text-[#020617] shadow-2xl scale-105 italic" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Podium - Top 3 Performers */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
            <CardHeader className="p-10 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white italic tracking-tight">Elite_Performers</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-500">Top Sales Nodes in {period}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              {topThree.length === 0 ? (
                <div className="py-20 text-center text-slate-500 italic">No nodes active in current cycle.</div>
              ) : (
                <div className="space-y-8">
                  {topThree.map((entry, idx) => (
                    <motion.div
                      key={entry.sales_staff_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "relative p-8 rounded-[2.5rem] border transition-all overflow-hidden group",
                        idx === 0 
                          ? "bg-pink-500/10 border-pink-500/30 shadow-xl shadow-pink-500/5" 
                          : "bg-white/[0.02] border-white/5"
                      )}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black italic shadow-inner",
                            idx === 0 ? "bg-pink-500 text-white" : idx === 1 ? "bg-slate-300 text-slate-900" : "bg-amber-600 text-white"
                          )}>
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white italic">{entry.sales_staff_name}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{entry.sales_staff_email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2 text-pink-400">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-2xl font-black italic tracking-tighter">{entry.conversion_rate.toFixed(1)}%</span>
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-1">CONVERSION_YIELD</p>
                        </div>
                      </div>
                      
                      {idx === 0 && (
                        <div className="absolute -top-4 -right-4 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                          <Zap className="h-32 w-32 text-pink-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Global Leaderboard - Rest of the team */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-white italic tracking-tight text-blue-400">Performance_Chronology</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comparative node efficiency metrics</CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-1 rounded-full text-[10px] font-black">ACTIVE_CYCLE</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-600">Rank</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-600">Sales Node</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-600">Leads</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-600 text-center">Score</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-600 text-right">Yield</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-10 py-20 text-center text-slate-500 italic">No data recorded in current temporal node.</td>
                      </tr>
                    ) : (
                      data.map((entry, idx) => (
                        <tr key={entry.sales_staff_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-6">
                            <span className={cn(
                              "text-sm font-black italic",
                              idx < 3 ? "text-pink-400" : "text-slate-500"
                            )}>
                              #{entry.rank}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white shadow-inner group-hover:border-pink-500/30 transition-all">
                                {entry.sales_staff_name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white italic truncate">{entry.sales_staff_name}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 truncate">{entry.sales_staff_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-sm font-black text-white italic">
                            {entry.total_leads}
                          </td>
                          <td className="px-6 py-6 text-center">
                            <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 px-2 py-0 text-[10px] font-black italic">
                              {entry.avg_lead_score.toFixed(0)}
                            </Badge>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 text-white">
                              <span className="text-lg font-black italic tracking-tighter">{entry.conversion_rate.toFixed(1)}%</span>
                              <ChevronRight className="h-3 w-3 text-slate-700 group-hover:text-pink-400 transition-colors" />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
