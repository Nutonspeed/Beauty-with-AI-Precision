"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Globe, ShieldCheck, Activity, Server, Compass, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MagneticButton } from "@/components/ui/magnetic-button"

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
    <div className="w-full bg-slate-50 border-y border-slate-100 relative overflow-hidden group h-full flex flex-col">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      
      {/* HUD Overlays - Clean Medical Look */}
      <div className="absolute top-12 left-12 z-20 space-y-6">
        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase">
          <Globe className="mr-2 h-3.5 w-3.5" />
          {t('globalCommand.title')}
        </Badge>
        <div className="space-y-1">
          <h3 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            {t('globalCommand.distributed')}<br />
            <span className="text-blue-600">{t('globalCommand.intelligence')}</span>
          </h3>
          <p className="text-slate-500 text-sm font-normal max-w-sm">
            {t('globalCommand.subtitle')}
          </p>
        </div>
      </div>

      <div className="absolute top-12 right-12 z-20 text-right space-y-8 hidden md:block">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('globalCommand.liveTraffic')}</p>
          <p className="text-4xl font-bold text-slate-900 tracking-tight">{liveTraffic.toLocaleString()} <span className="text-sm font-normal text-slate-500">{t('globalCommand.reqPerSec')}</span></p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <Badge className="bg-blue-600 text-white border-none px-4 py-1 text-[9px] font-bold tracking-widest uppercase">
            {t('globalCommand.meshActive')}
          </Badge>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">{t('globalCommand.nodesResilient')}</span>
          </div>
        </div>
      </div>

      {/* Main Map Visualization */}
      <div className="relative flex-1 w-full flex items-center justify-center min-h-[500px]">
        {/* Abstract World Mesh */}
        <div className="relative w-full max-w-6xl aspect-[2/1] opacity-40">
          <svg viewBox="0 0 1000 500" className="w-full h-full text-blue-100 fill-current">
            {/* Simple abstract dots for continents */}
            {Array.from({ length: 200 }).map((_, i) => (
              <circle 
                key={i} 
                cx={Math.random() * 1000} 
                cy={Math.random() * 500} 
                r={1.5} 
                className="opacity-50"
              />
            ))}
          </svg>

          {/* Animated Arcs */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {globalNodes.map((node, i) => (
              globalNodes.slice(i + 1).map((target, j) => (
                <motion.path
                  key={`${node.id}-${target.id}`}
                  d={`M ${node.lon} ${node.lat} Q 500 100 ${target.lon} ${target.lat}`}
                  stroke="url(#beamGrad)"
                  strokeWidth="1"
                  fill="transparent"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 0.3, 0] }}
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
                    "h-3 w-3 rounded-full relative z-10 transition-all duration-500",
                    activeNode === idx ? "bg-blue-600 scale-125 shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "bg-slate-200 border border-slate-300"
                  )}>
                    <motion.div 
                      animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="absolute inset-0 rounded-full bg-blue-400"
                    />
                  </div>
                  
                  {/* Node Tooltip */}
                  <div className={cn(
                    "absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-500 z-30",
                    activeNode === idx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                  )}>
                    <Card className="bg-white border-slate-200 p-4 rounded-xl shadow-lg space-y-3 min-w-[160px]">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{node.name}</span>
                        <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-bold uppercase">{t('globalCommand.optimal')}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{t('globalCommand.load')}</p>
                          <p className="text-xs font-bold text-slate-900">{node.load}%</p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{t('globalCommand.latency')}</p>
                          <p className="text-xs font-bold text-blue-600">12{t('globalCommand.ms')}</p>
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
      <div className="bg-white border-t border-slate-100 p-8 md:p-10 z-20">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-wrap gap-8 md:gap-12 items-center justify-center">
            {[
              { label: t('globalCommand.totalNodes'), val: '12 ONLINE', icon: Server, color: 'text-blue-600' },
              { label: t('globalCommand.securityStatus'), val: 'ACTIVE', icon: ShieldCheck, color: 'text-emerald-600' },
              { label: t('globalCommand.uptime'), val: '99.99%', icon: Activity, color: 'text-indigo-600' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <m.icon className={cn("h-5 w-5", m.color)} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</p>
                  <p className="text-sm font-bold text-slate-900 tracking-tight">{m.val}</p>
                </div>
              </div>
            ))}
          </div>
          
          <MagneticButton strength={0.1}>
            <Button className="h-14 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-600/10 group transition-all">
              {t('globalCommand.joinInfrastructure')}
              <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </MagneticButton>
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
