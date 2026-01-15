"use client"

import { motion } from "framer-motion"
import { Globe, Zap, Server, Activity, ShieldCheck, Share2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function AINetworkTopology() {
  const t = useTranslations()

  const nodes = [
    { id: 'asia-1', name: 'Bangkok_Node', x: '75%', y: '60%', status: 'active' },
    { id: 'asia-2', name: 'Tokyo_Node', x: '85%', y: '35%', status: 'active' },
    { id: 'eu-1', name: 'London_Node', x: '45%', y: '30%', status: 'active' },
    { id: 'us-1', name: 'NewYork_Node', x: '25%', y: '35%', status: 'active' },
    { id: 'us-2', name: 'SiliconValley_Node', x: '15%', y: '45%', status: 'active' },
  ]

  return (
    <div className="w-full aspect-video bg-white/[0.01] border border-white/5 rounded-[3rem] p-12 relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center" />
      
      {/* Background World Map Silhouette (Abstract) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02]">
        <Globe className="w-[80%] h-[80%] text-white" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-[0.2em] flex items-center gap-4">
              <Share2 className="h-6 w-6 text-cyan-400" />
              {t('networkTopology.title')}
            </h3>
            <p className="text-[10px] text-slate-500 font-light italic tracking-widest">{t('networkTopology.subtitle')}</p>
          </div>
          <Badge className="bg-emerald-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('ui.status.globalSyncStable')}
          </Badge>
        </div>

        <div className="flex-1 relative">
          {/* Animated Synaptic Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            {nodes.map((node, i) => (
              nodes.slice(i + 1).map((target) => (
                <motion.line
                  key={`${node.id}-${target.id}`}
                  x1={node.x}
                  y1={node.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="white"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: Math.random() * 5 }}
                />
              ))
            ))}
          </svg>

          {/* Network Nodes */}
          {nodes.map((node, idx) => (
            <motion.div
              key={node.id}
              className="absolute group/node"
              style={{ top: node.y, left: node.x }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
            >
              <div className="relative">
                <div className="h-4 w-4 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] relative z-10">
                  <motion.div 
                    animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full bg-cyan-400"
                  />
                </div>
                <div className={cn(
                  "absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-500",
                  idx === 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                )}>
                  <div className="bg-[#020617]/90 backdrop-blur-xl border-white/10 p-4 rounded-2xl shadow-2xl space-y-3 min-w-[180px]">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[9px] font-black text-white uppercase tracking-widest italic">{node.name}</span>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[7px] font-black italic">{t('ui.status.optimal')}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest italic">{t('networkTopology.load')}</p>
                        <p className="text-xs font-bold text-white">{node.status === 'active' ? '100%' : '0%'}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest italic">{t('ui.status.latency')}</p>
                        <p className="text-xs font-bold text-cyan-400">12{t('ui.status.ms')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-8 border-t border-white/5">
          {[
            { label: t('networkTopology.globalNodes'), val: '12 ACTIVE', icon: Server, color: 'text-cyan-400' },
            { label: t('networkTopology.activeConnections'), val: '1.2M LINKS', icon: Activity, color: 'text-pink-400' },
            { label: t('networkTopology.syncLatency'), val: '0.04s AVG', icon: Zap, color: 'text-amber-400' },
            { label: t('networkTopology.cloudIntegrity'), val: '99.99%', icon: ShieldCheck, color: 'text-emerald-400' },
            { label: 'Cloud Integrity', val: '99.99%', icon: ShieldCheck, color: 'text-emerald-400' },
          ].map((m, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-3">
                <m.icon className={cn("h-4 w-4", m.color)} />
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{m.label}</p>
              </div>
              <p className="text-sm font-black text-white italic tracking-tighter">{m.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
