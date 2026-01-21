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
    <div className="w-full bg-slate-50 border-y border-slate-100 relative overflow-hidden group h-full flex flex-col">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      
      {/* HUD Overlays - Clean Medical Look */}
      <div className="absolute top-10 left-10 z-20 space-y-5 max-w-xl">
        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase">
          <Globe className="mr-2 h-3.5 w-3.5" />
          {t('globalCommand.title')}
        </Badge>
        <div className="space-y-2">
          <h3 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            {t('globalCommand.distributed')}<br />
            <span className="text-blue-600">{t('globalCommand.intelligence')}</span>
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md">
            {t('globalCommand.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {headlineMetrics.map((metric, index) => (
            <div
              key={`${metric.label}-${index}`}
              className="rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur px-3 py-2 shadow-sm"
            >
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{metric.label}</p>
              <p className="text-sm font-bold text-slate-900 tracking-tight">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-10 right-10 z-20 hidden md:flex flex-col items-end gap-6">
        <div className="space-y-1 text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('globalCommand.liveTraffic')}</p>
          <p className="text-4xl font-bold text-slate-900 tracking-tight">
            {liveTraffic.toLocaleString()} <span className="text-sm font-normal text-slate-500">{t('globalCommand.reqPerSec')}</span>
          </p>
        </div>
        <Card className="w-64 bg-white/90 border-slate-200 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('globalCommand.meshActive')}</span>
            <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-bold uppercase">
              {t('globalCommand.optimal')}
            </Badge>
          </div>
          <div className="mt-3">
            <p className="text-sm font-semibold text-slate-900">{activeHub.name}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{activeHub.region}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('globalCommand.load')}</p>
              <p className="text-sm font-bold text-slate-900">{activeHub.load}%</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('globalCommand.latency')}</p>
              <p className="text-sm font-bold text-blue-600">{activeHub.latency}{t('globalCommand.ms')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Map Visualization */}
      <div className="relative flex-1 w-full flex items-center justify-center min-h-[520px] px-6 pb-12 pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-blue-50/60" />
        <div className="relative w-full max-w-6xl aspect-[2/1] rounded-[36px] border border-blue-100/70 bg-white/70 shadow-[0_25px_70px_rgba(15,23,42,0.12)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.15),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(14,116,144,0.14),transparent_52%)]" />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)',
              backgroundSize: '90px 90px',
            }}
          />
          <div className="relative w-full h-full">
            <svg viewBox="0 0 1000 500" className="w-full h-full text-slate-200 fill-current">
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
                  <stop offset="50%" stopColor="#2563eb" stopOpacity="0.9" />
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
                    strokeWidth="1.2"
                    fill="transparent"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 0.55, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 1.2 + index * 0.3 }}
                  />
                )
              })}
            </svg>

            <div className="absolute left-8 bottom-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
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
                          className="absolute inset-0 rounded-full bg-blue-400/40"
                          animate={{ scale: [1, 2.4, 1], opacity: [0.5, 0, 0.35] }}
                          transition={{ repeat: Infinity, duration: 2.8 }}
                        />
                      ) : null}
                      <div
                        className={cn(
                          "h-3.5 w-3.5 rounded-full relative z-10 border transition-all duration-500",
                          isActive
                            ? "bg-blue-600 border-blue-100 shadow-[0_0_18px_rgba(37,99,235,0.6)]"
                            : "bg-white border-slate-300"
                        )}
                      />

                      {/* Node Tooltip */}
                      <div
                        className={cn(
                          "absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-500 z-30",
                          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                        )}
                      >
                        <Card className="bg-white border-slate-200 p-4 rounded-xl shadow-lg space-y-3 min-w-[176px]">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                              {node.name}
                            </span>
                            <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-bold uppercase">
                              {t('globalCommand.optimal')}
                            </Badge>
                          </div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {node.region}
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                {t('globalCommand.load')}
                              </p>
                              <p className="text-xs font-bold text-slate-900">{node.load}%</p>
                            </div>
                            <div className="text-right space-y-0.5">
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                {t('globalCommand.latency')}
                              </p>
                              <p className="text-xs font-bold text-blue-600">
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
      <div className="bg-white border-t border-slate-100 p-8 md:p-10 z-20">
        <div className="container mx-auto flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {summaryMetrics.map((metric, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <metric.icon className={cn("h-5 w-5", metric.color)} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{metric.label}</p>
                  <p className="text-sm font-bold text-slate-900 tracking-tight">{metric.value}</p>
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
