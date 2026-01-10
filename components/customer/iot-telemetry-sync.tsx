"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Smartphone, Wind, Sun, Droplets, Thermometer, RefreshCw, Link as LinkIcon, ShieldCheck, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface IoTTelemetrySyncProps {
  isPremium: boolean
}

export function IoTTelemetrySync({ isPremium }: IoTTelemetrySyncProps) {
  const t = useTranslations()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date>(new Date())

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setLastSync(new Date())
    }, 2000)
  }

  const environmentalData = [
    { label: t('iotSync.environmentalData.humidity'), val: '42%', icon: Droplets, color: 'text-cyan-400', status: t('iotSync.environmentalData.dry') },
    { label: t('iotSync.environmentalData.uv'), val: 'Low', icon: Sun, color: 'text-amber-400', status: t('iotSync.environmentalData.safe') },
    { label: t('iotSync.environmentalData.airQuality'), val: '12 AQI', icon: Wind, color: 'text-emerald-400', status: t('iotSync.environmentalData.excellent') },
    { label: t('iotSync.environmentalData.temp'), val: '24°C', icon: Thermometer, color: 'text-rose-400', status: t('iotSync.environmentalData.optimal') },
  ]

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase font-black tracking-widest">{t('iotSync.locked')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('iotSync.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('iotSync.unlockDesc')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-blue-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('iotSync.linkDevice')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Smartphone className="h-8 w-8 text-blue-400" />
            {t('iotSync.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('iotSync.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('iotSync.deviceStatus')}</p>
            <p className="text-xs font-bold text-emerald-400 italic">{t('iotSync.connectedMesh')}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSync}
            disabled={isSyncing}
            className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <RefreshCw className={cn("h-6 w-6 text-blue-400", isSyncing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Real-time Telemetry Node */}
          <div className="lg:col-span-7 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('iotSync.realtimeTelemetry')}</h4>
            <div className="grid grid-cols-2 gap-6">
              {environmentalData.map((data, idx) => (
                <div key={idx} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group/iot hover:bg-white/[0.04] transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn("h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/iot:scale-110 transition-all", data.color)}>
                      <data.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black border-white/5 text-slate-600 italic">{data.status}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{data.label}</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter">{data.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Mirror Link Node */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 via-blue-600/5 to-transparent border border-blue-500/20 relative overflow-hidden group/mirror">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover/mirror:scale-110 transition-transform duration-1000">
                <Smartphone className="w-40 h-40" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white italic tracking-tight">{t('iotSync.mirrorLinkLabel')}</h4>
                </div>
                <p className="text-xs text-slate-400 font-light leading-relaxed italic">
                  {t('iotSync.mirrorLinkDesc')}
                </p>
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <span>{t('iotSync.linkStability')}</span>
                    <span className="text-emerald-400 italic italic">99.8% {t('iotSync.efficient')}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "99.8%" }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex items-center gap-4">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              <p className="text-[10px] text-slate-500 font-light italic leading-relaxed">
                {t('iotSync.encryptionInfo')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
            {t('iotSync.lastSync')}: {lastSync.toLocaleString(t('common.locale'))}
          </p>
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 italic">
            {t('iotSync.configureMesh')}
            <LinkIcon className="ml-3 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
