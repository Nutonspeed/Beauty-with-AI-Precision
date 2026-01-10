"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Globe, ShieldCheck, Activity, Server, Compass } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function GlobalCommandCenter() {
  const t = useTranslations()
  const [activeNode, setActiveNode] = useState(0)
  const [liveTraffic, setLiveTraffic] = useState(1240)

  const globalNodes = [
    { id: 'asia-1', name: 'Bangkok_Prime', lat: '13.75', lon: '100.5', status: 'optimal', load: 82 },
    { id: 'asia-2', name: 'Tokyo_Edge', lat: '35.67', lon: '139.6', status: 'optimal', load: 45 },
    { id: 'eu-1', name: 'London_Core', lat: '51.50', lon: '-0.12', status: 'optimal', load: 68 },
    { id: 'us-1', name: 'NY_Distributed', lat: '40.71', lon: '-74.00', status: 'warning', load: 94 },
    { id: 'us-2', name: 'Silicon_Valley', lat: '37.33', lon: '-121.8', status: 'optimal', load: 38 },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode(Math.floor(Math.random() * globalNodes.length))
      setLiveTraffic(prev => prev + Math.floor(Math.random() * 50) - 20)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full bg-[#020617] border-y border-white/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center animate-grid-drift" />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
      
      {/* Cinematic HUD Overlays */}
      <div className="absolute top-12 left-12 z-20 space-y-6">
        <Badge variant="outline" className="px-6 py-2 rounded-full border-cyan-500/30 text-cyan-400 bg-cyan-500/5 backdrop-blur-md uppercase tracking-[0.4em] text-[10px] font-black italic">
          <Globe className="mr-3 h-4 w-4 animate-spin-slow" />
          {t('globalCommand.title')}
        </Badge>
        <div className="space-y-1">
          <h3 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.8]">
            {t('globalCommand.distributed')}<br />
            <span className="text-cyan-500">{t('globalCommand.intelligence')}</span>
          </h3>
          <p className="text-slate-500 text-xs font-light tracking-[0.2em] italic max-w-sm">
            {t('globalCommand.subtitle')}
          </p>
        </div>
      </div>

      <div className="absolute top-12 right-12 z-20 text-right space-y-8 hidden md:block">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{t('globalCommand.liveTraffic')}</p>
          <p className="text-4xl font-black text-white italic tracking-tighter">{liveTraffic.toLocaleString()} {t('globalCommand.reqPerSec')}</p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <Badge className="bg-emerald-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('globalCommand.meshActive')}
          </Badge>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">{t('globalCommand.nodesResilient')}</span>
          </div>
        </div>
      </div>

      {/* Main Map Visualization */}
      <div className="relative h-[800px] w-full flex items-center justify-center">
        {/* Abstract World Mesh */}
        <div className="relative w-full max-w-6xl aspect-[2/1] opacity-20">
          <svg viewBox="0 0 1000 500" className="w-full h-full text-white/10 fill-current">
            {/* Simple abstract dots for continents */}
            {Array.from({ length: 200 }).map((_, i) => (
              <circle 
                key={i} 
                cx={Math.random() * 1000} 
                cy={Math.random() * 500} 
                r={1} 
                className="animate-pulse" 
                style={{ animationDelay: `${Math.random() * 5}s` }} 
              />
            ))}
          </svg>

          {/* Animated Synaptic Arcs */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {globalNodes.map((node, i) => (
              globalNodes.slice(i + 1).map((target, j) => (
                <motion.path
                  key={`${node.id}-${target.id}`}
                  d={`M ${node.lon} ${node.lat} Q 500 100 ${target.lon} ${target.lat}`}
                  stroke="url(#beamGrad)"
                  strokeWidth="0.5"
                  fill="transparent"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 0.2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: Math.random() * 5 }}
                />
              ))
            ))}
          </svg>

          {/* Interactive Nodes */}
          <div className="absolute inset-0">
            {globalNodes.map((node, idx) => (
              <motion.div
                key={node.id}
                className="absolute group/node cursor-pointer"
                style={{ 
                  top: `${(parseFloat(node.lat) + 90) * (500/180)}px`, 
                  left: `${(parseFloat(node.lon) + 180) * (1000/360)}px` 
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.2 }}
              >
                <div className="relative">
                  <div className={cn(
                    "h-4 w-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] relative z-10 transition-all duration-500",
                    activeNode === idx ? "bg-cyan-400 scale-125" : "bg-cyan-900/40 border border-cyan-500/30"
                  )}>
                    <motion.div 
                      animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="absolute inset-0 rounded-full bg-cyan-400"
                    />
                  </div>
                  
                  {/* Node Tooltip */}
                  <div className={cn(
                    "absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-500",
                    activeNode === idx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                  )}>
                    <Card className="bg-[#020617]/90 backdrop-blur-xl border-white/10 p-4 rounded-2xl shadow-2xl space-y-3 min-w-[180px]">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest italic">{node.name}</span>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[7px] font-black italic">{t('globalCommand.optimal')}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest italic">{t('globalCommand.load')}</p>
                          <p className="text-xs font-bold text-white">{node.load}%</p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest italic">{t('globalCommand.latency')}</p>
                          <p className="text-xs font-bold text-cyan-400">12{t('globalCommand.ms')}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Interface Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/[0.01] border-t border-white/5 backdrop-blur-3xl z-20">
        <div className="container mx-auto px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex gap-12 items-center">
            {[
              { label: t('globalCommand.totalNodes'), val: '12 ONLINE', icon: Server, color: 'text-cyan-400' },
              { label: t('globalCommand.securityStatus'), val: 'QUANTUM_SAFE', icon: ShieldCheck, color: 'text-emerald-400' },
              { label: t('globalCommand.uptime'), val: '99.99%', icon: Activity, color: 'text-pink-400' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center animate-synaptic-fire">
                  <m.icon className={cn("h-5 w-5", m.color)} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{m.label}</p>
                  <p className="text-sm font-black text-white italic tracking-tighter">{m.val}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-pink-500/20 uppercase text-[10px] font-black tracking-[0.3em] italic group transition-all">
            {t('globalCommand.joinInfrastructure')}
            <Compass className="ml-4 h-5 w-5 group-hover:rotate-90 transition-transform duration-700" />
          </Button>
        </div>
      </div>

      {/* Cinematic Corner Lines */}
      <div className="absolute bottom-12 right-12 opacity-20 pointer-events-none">
        <div className="h-20 w-20 border-b-2 border-r-2 border-white/20 rounded-br-3xl" />
      </div>
      <div className="absolute top-12 left-12 opacity-20 pointer-events-none hidden md:block">
        <div className="h-40 w-1 bg-gradient-to-b from-cyan-500 via-transparent to-transparent" />
      </div>
    </div>
  )
}
