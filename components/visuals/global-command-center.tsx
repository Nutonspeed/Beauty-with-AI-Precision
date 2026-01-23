"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Globe, ShieldCheck, Activity, Server, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MagneticButton } from "@/components/ui/magnetic-button"

export function GlobalCommandCenter() {
  const t = useTranslations()
  const [activeNode, setActiveNode] = useState(0)
  const [liveTraffic, setLiveTraffic] = useState(4820)

  const mapWidth = 1000
  const mapHeight = 500

  const globalNodes = [
    { id: 'ap-bkk', name: 'Bangkok Core', region: 'APAC', lat: 13.75, lon: 100.5, status: 'optimal', load: 72, latency: 22 },
    { id: 'ap-sg', name: 'Singapore Edge', region: 'APAC', lat: 1.29, lon: 103.85, status: 'optimal', load: 58, latency: 18 },
    { id: 'ap-tok', name: 'Tokyo Edge', region: 'APAC', lat: 35.68, lon: 139.69, status: 'optimal', load: 64, latency: 24 },
    { id: 'ap-seo', name: 'Seoul Edge', region: 'APAC', lat: 37.56, lon: 126.97, status: 'optimal', load: 55, latency: 26 },
    { id: 'ap-syd', name: 'Sydney Core', region: 'APAC', lat: -33.86, lon: 151.2, status: 'optimal', load: 49, latency: 32 },
    { id: 'ap-bom', name: 'Mumbai Core', region: 'APAC', lat: 19.07, lon: 72.88, status: 'optimal', load: 61, latency: 29 },
    { id: 'me-dxb', name: 'Dubai Transit', region: 'EMEA', lat: 25.2, lon: 55.27, status: 'optimal', load: 57, latency: 33 },
    { id: 'eu-fra', name: 'Frankfurt Core', region: 'EMEA', lat: 50.11, lon: 8.68, status: 'optimal', load: 66, latency: 28 },
    { id: 'eu-lon', name: 'London Core', region: 'EMEA', lat: 51.5, lon: -0.12, status: 'optimal', load: 62, latency: 25 },
    { id: 'sa-sao', name: 'Sao Paulo Edge', region: 'AMER', lat: -23.55, lon: -46.63, status: 'optimal', load: 53, latency: 41 },
    { id: 'na-nyc', name: 'New York Core', region: 'AMER', lat: 40.71, lon: -74.0, status: 'optimal', load: 70, latency: 27 },
    { id: 'na-sjc', name: 'San Jose Edge', region: 'AMER', lat: 37.33, lon: -121.89, status: 'optimal', load: 48, latency: 23 },
  ]

  const activeHub = globalNodes[activeNode]
  const activeSessions = Math.round(liveTraffic * 0.36)
  const averageLatency = Math.round(
    globalNodes.reduce((sum, node) => sum + node.latency, 0) / globalNodes.length
  )

  const project = (lat: number, lon: number) => ({
    x: (lon + 180) * (mapWidth / 360),
    y: (90 - lat) * (mapHeight / 180),
  })

  const mapDots = Array.from({ length: 180 }, (_, i) => ({
    x: (i * 73) % mapWidth,
    y: (i * 41) % mapHeight,
    r: i % 5 === 0 ? 1.6 : 1.1,
    opacity: i % 4 === 0 ? 0.45 : 0.25,
  }))

  const hubPoint = project(activeHub.lat, activeHub.lon)
  const connectionNodes = globalNodes.filter(node => node.id !== activeHub.id)

  const headlineMetrics = [
    { label: t('globalCommand.totalNodes'), value: globalNodes.length.toString() },
    { label: t('globalCommand.activeSessions'), value: activeSessions.toLocaleString() },
    { label: t('globalCommand.nodeLatency'), value: `<${averageLatency}${t('globalCommand.ms')}` },
    { label: t('globalCommand.uptime'), value: '99.99%' },
  ]

  const summaryMetrics = [
    { label: t('globalCommand.meshActive'), value: t('globalCommand.optimal'), icon: Server, color: 'text-blue-600' },
    { label: t('globalCommand.nodesResilient'), value: 'N+2', icon: Activity, color: 'text-emerald-600' },
    { label: t('globalCommand.securityStatus'), value: 'ISO 27001', icon: ShieldCheck, color: 'text-indigo-600' },
    { label: t('globalCommand.uptime'), value: '99.99%', icon: Activity, color: 'text-slate-700' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode(prev => (prev + 1) % globalNodes.length)
      setLiveTraffic(prev => {
        const delta = Math.floor(Math.random() * 140) - 60
        const next = prev + delta
        return Math.min(5600, Math.max(4300, next))
      })
    }, 2600)
    return () => clearInterval(interval)
  }, [globalNodes.length])

  return (
    <div className="w-full bg-white border-y border-slate-100 relative overflow-hidden group h-full flex flex-col">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#ec4899 1px, transparent 1px), linear-gradient(90deg, #ec4899 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      
      {/* HUD Overlays - High-End Aesthetic */}
      <div className="absolute top-10 left-10 z-20 space-y-6 max-w-xl">
        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 font-black tracking-[0.2em] text-[10px] uppercase animate-pulse shadow-lg shadow-pink-500/5">
          <Globe className="mr-2 h-3.5 w-3.5" />
          {t('globalCommand.title')}
        </Badge>
        <div className="space-y-3">
          <h3 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tighter leading-[0.9] italic">
            {t('globalCommand.distributed')}<br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic uppercase text-2xl tracking-[0.3em] font-black">{t('globalCommand.intelligence')}</span>
          </h3>
          <p className="text-slate-500 text-lg font-light leading-relaxed max-w-md italic">
            {t('globalCommand.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {headlineMetrics.map((metric, index) => (
            <div
              key={`${metric.label}-${index}`}
              className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-xl px-4 py-3 shadow-premium hover:border-pink-500/20 transition-all duration-500"
            >
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{metric.label}</p>
              <p className="text-base font-black text-slate-900 tracking-tighter italic">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-10 right-10 z-20 hidden md:flex flex-col items-end gap-8">
        <div className="space-y-1 text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('globalCommand.liveTraffic')}</p>
          <p className="text-5xl font-black text-slate-900 tracking-tighter italic">
            {liveTraffic.toLocaleString()} <span className="text-sm font-black uppercase tracking-widest text-pink-500">{t('globalCommand.reqPerSec')}</span>
          </p>
        </div>
        <Card className="w-72 bg-white/90 backdrop-blur-2xl border-slate-100 p-6 rounded-[2.5rem] shadow-premium hover:border-pink-500/20 transition-all duration-700">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('globalCommand.meshActive')}</span>
            <Badge className="bg-pink-50 text-pink-600 border-none text-[9px] font-black uppercase tracking-widest animate-pulse">
              {t('globalCommand.optimal')}
            </Badge>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-lg font-bold text-slate-900 italic uppercase">{activeHub.name}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500">{activeHub.region}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('globalCommand.load')}</p>
              <p className="text-base font-black text-slate-900 italic">{activeHub.load}%</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('globalCommand.latency')}</p>
              <p className="text-base font-black text-pink-600 italic">{activeHub.latency}{t('globalCommand.ms')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Map Visualization */}
      <div className="relative flex-1 w-full flex items-center justify-center min-h-[600px] px-6 pb-16 pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-blue-50/30" />
        <div className="relative w-full max-w-6xl aspect-[2/1] rounded-[48px] border border-slate-100 bg-white shadow-premium overflow-hidden group/map">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.1),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(37,99,235,0.1),transparent_52%)]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.2) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
          <div className="relative w-full h-full p-12">
            <svg viewBox="0 0 1000 500" className="w-full h-full text-slate-100 fill-current">
              {mapDots.map((dot, index) => (
                <circle
                  key={`dot-${index}`}
                  cx={dot.x}
                  cy={dot.y}
                  r={dot.r}
                  style={{ opacity: dot.opacity }}
                />
              ))}
            </svg>

            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              {connectionNodes.map((node, index) => {
                const targetPoint = project(node.lat, node.lon)
                const midX = (hubPoint.x + targetPoint.x) / 2
                const midY = Math.min(hubPoint.y, targetPoint.y) - 80 - (index % 3) * 14
                return (
                  <motion.path
                    key={`${activeHub.id}-${node.id}`}
                    d={`M ${hubPoint.x} ${hubPoint.y} Q ${midX} ${midY} ${targetPoint.x} ${targetPoint.y}`}
                    stroke="url(#beamGrad)"
                    strokeWidth="1.5"
                    fill="transparent"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 0.6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 + index * 0.4 }}
                  />
                )
              })}
            </svg>

            <div className="absolute left-12 bottom-12 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
              <span className="h-2 w-2 rounded-full bg-pink-500 shadow-glow-pink animate-pulse" />
              {t('globalCommand.mapTitle')}
            </div>

            {/* Interactive Nodes */}
            <div className="absolute inset-0">
              {globalNodes.map((node, idx) => {
                const point = project(node.lat, node.lon)
                const isActive = activeNode === idx
                return (
                  <motion.div
                    key={node.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group/node"
                    style={{
                      left: `${(point.x / mapWidth) * 100}%`,
                      top: `${(point.y / mapHeight) * 100}%`,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="relative">
                      {isActive ? (
                        <motion.div
                          className="absolute inset-[-8px] rounded-full bg-pink-400/20"
                          animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.2] }}
                          transition={{ repeat: Infinity, duration: 3 }}
                        />
                      ) : null}
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full relative z-10 border-2 transition-all duration-700",
                          isActive
                            ? "bg-pink-500 border-white shadow-glow-pink"
                            : "bg-white border-slate-200 group-hover/node:border-pink-300"
                        )}
                      />

                      {/* Node Tooltip */}
                      <div
                        className={cn(
                          "absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-700 z-30",
                          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                        )}
                      >
                        <Card className="bg-white/95 backdrop-blur-xl border-slate-100 p-5 rounded-2xl shadow-premium min-w-[200px]">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider italic">
                              {node.name}
                            </span>
                            <Badge className="bg-pink-50 text-pink-600 border-none text-[8px] font-black uppercase tracking-widest">
                              {t('globalCommand.optimal')}
                            </Badge>
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-pink-500 mb-4">
                            {node.region}
                          </p>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">
                                {t('globalCommand.load')}
                              </p>
                              <p className="text-xs font-black text-slate-900 italic">{node.load}%</p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">
                                {t('globalCommand.latency')}
                              </p>
                              <p className="text-xs font-black text-pink-600 italic">
                                {node.latency}{t('globalCommand.ms')}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interface Bar */}
      <div className="bg-white border-t border-slate-100 p-10 md:p-12 z-20">
        <div className="container mx-auto flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {summaryMetrics.map((metric, i) => (
              <div key={i} className="flex items-center gap-4 group/metric">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/metric:bg-pink-50 group-hover/metric:border-pink-100 transition-all duration-500 shadow-sm">
                  <metric.icon className={cn("h-6 w-6 transition-colors duration-500", metric.color.replace('blue', 'pink').replace('emerald', 'pink').replace('indigo', 'pink'))} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{metric.label}</p>
                  <p className="text-base font-black text-slate-900 tracking-tighter italic">{metric.value}</p>
                </div>
              </div>
            ))}
          </div>

          <MagneticButton strength={0.1}>
            <Button className="h-16 px-12 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-pink-500/20 group transition-all hover:scale-105 active:scale-95">
              {t('globalCommand.joinInfrastructure')}
              <ArrowRight className="ml-4 h-5 w-5 group-hover:translate-x-2 transition-transform" />
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
