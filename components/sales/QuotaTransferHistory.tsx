
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Search,
  Zap,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TransferRecord {
  id: string
  timestamp: string
  userId: string
  userName: string
  userEmail: string
  type: string
  amount: number
  direction: 'in' | 'out'
  metadata: {
    transfer_to?: string
    transfer_from?: string
    transfer_by: string
  }
}

export function QuotaTransferHistory() {
  const [history, setHistory] = useState<TransferRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/quota/transfer-history')
      const result = await response.json()
      if (result.success) {
        setHistory(result.history)
      }
    } catch (error) {
      console.error('Failed to fetch transfer history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const filteredHistory = history.filter(item => 
    item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
          <Input 
            placeholder="Search transfer chronology..." 
            className="h-14 pl-14 rounded-2xl bg-white/5 border-white/10 text-white focus:ring-pink-500/20 focus:border-pink-500 italic"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={fetchHistory}
          className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 italic text-[10px] font-black uppercase tracking-widest"
        >
          <RefreshCw className={cn("mr-3 h-4 w-4", loading && "animate-spin")} />
          Sync_Logs
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-3xl bg-white/5 animate-pulse" />
          ))
        ) : filteredHistory.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10">
            <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto opacity-20">
              <History className="h-8 w-8 text-white" />
            </div>
            <p className="text-slate-500 italic">No resource rebalancing events recorded in this node.</p>
          </div>
        ) : (
          filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner",
                  item.direction === 'in' ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"
                )}>
                  {item.direction === 'in' ? (
                    <ArrowDownLeft className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="h-6 w-6 text-rose-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-white italic">{item.userName}</h4>
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0",
                      item.direction === 'in' ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" : "border-rose-500/20 text-rose-400 bg-rose-500/5"
                    )}>
                      {item.direction === 'in' ? 'Received' : 'Sent'}
                    </Badge>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1 italic">{item.userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-10">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.type === 'analysis' ? <Zap className="h-3 w-3 text-blue-400" /> : <Sparkles className="h-3 w-3 text-purple-400" />}
                    <span className="text-xl font-black italic text-white">
                      {item.direction === 'in' ? '+' : '-'}{item.amount}
                    </span>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1 italic">
                    {item.type === 'analysis' ? 'AI_CYCLES' : 'AR_SIMS'}
                  </p>
                </div>
                
                <div className="text-right min-w-[120px]">
                  <div className="flex items-center justify-end gap-2 text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-black italic">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-700 mt-1">LOG_ID: {item.id.slice(0, 8)}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
