"use client"

import { motion } from "framer-motion"
import { Database, Zap, Activity, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AestheticDataLake() {
  const dataNodes = [
    { id: "NODE_01", status: "active", latency: "12ms", health: 98 },
    { id: "NODE_02", status: "syncing", latency: "45ms", health: 100 },
    { id: "NODE_03", status: "active", latency: "15ms", health: 99 },
    { id: "NODE_04", status: "active", latency: "18ms", health: 97 },
  ]

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <CardContent className="p-10 lg:p-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataNodes.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-cyan-500/30 text-cyan-400 bg-cyan-500/5">
                  {node.id}
                </Badge>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Status</p>
                <p className="text-sm font-bold text-white italic uppercase tracking-tighter">{node.status}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span className="text-[10px] font-bold text-slate-400">{node.latency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-cyan-400" />
                  <span className="text-[10px] font-bold text-slate-400">{node.health}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-600/10 via-transparent to-transparent border border-cyan-500/20 space-y-6 relative overflow-hidden">
          <Database className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-cyan-500/5 rotate-12" />
          <div className="flex items-center gap-4 relative z-10">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h5 className="text-xs font-black text-white uppercase tracking-widest">Autonomous Data Orchestration</h5>
          </div>
          <p className="text-sm text-slate-400 font-light leading-relaxed italic relative z-10">
            Real-time aesthetic biometric data lake with quantum-safe encryption. Synchronizing global center nodes with precision inference layers.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
