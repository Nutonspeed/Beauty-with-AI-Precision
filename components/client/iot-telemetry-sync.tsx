"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Smartphone, Wind, Sun, Droplets, Thermometer, RefreshCw, Link as LinkIcon, ShieldCheck, Zap, Activity, Info } from "lucide-react"
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
    { label: t('iotSync.environmentalData.humidity' as any) || 'Hydraulic_Index', val: '42%', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50', status: t('iotSync.environmentalData.dry' as any) || 'DRY_NODE' },
    { label: t('iotSync.environmentalData.uv' as any) || 'Spectral_Intensity', val: 'Low', icon: Sun, color: 'text-amber-600', bg: 'bg-amber-50', status: t('iotSync.environmentalData.safe' as any) || 'SAFE_ZONE' },
    { label: t('iotSync.environmentalData.airQuality' as any) || 'Atmospheric_Integrity', val: '12 AQI', icon: Wind, color: 'text-emerald-600', bg: 'bg-emerald-50', status: t('iotSync.environmentalData.excellent' as any) || 'NOMINAL' },
    { label: t('iotSync.environmentalData.temp' as any) || 'Thermal_State', val: '24°C', icon: Thermometer, color: 'text-rose-600', bg: 'bg-rose-50', status: t('iotSync.environmentalData.optimal' as any) || 'OPTIMAL' },
  ]

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/20 flex flex-col min-h-[600px]",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-blue-50 text-blue-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            {t('iotSync.locked' as any) || 'IOT_SYNC_RESTRICTED'}
          </Badge>
          <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none mb-6">{t('iotSync.title' as any) || 'Global_Device_Telemetry'}</h3>
          <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed mb-10 text-base">
            {t('iotSync.unlockDesc' as any) || 'Unlock real-time environmental data synchronization and authorize smart node links.'}
          </p>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-blue-600/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            {t('iotSync.linkDevice' as any) || 'Authorize_IoT_Uplink'}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
              <Smartphone className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            {t('iotSync.title' as any) || 'Telemetry_Sync'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('iotSync.subtitle' as any) || 'Real-time environmental parameter synchronization'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('iotSync.deviceStatus' as any) || 'NODE_SYNC_STATE'}</p>
            <p className="text-lg font-black text-emerald-600 italic tracking-tighter uppercase leading-none mt-1">{t('iotSync.connectedMesh' as any) || 'ACTIVE_MESH'}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSync}
            disabled={isSyncing}
            className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-300 hover:text-blue-600 transition-all shadow-inner"
          >
            <RefreshCw className={cn("h-6 w-6 text-blue-600", isSyncing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1">
        <div className="grid lg:grid-cols-12 gap-16 h-full">
          {/* Real-time Telemetry Node interface */}
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center gap-5 ml-4">
              <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('iotSync.realtimeTelemetry' as any) || 'Environmental_Node_Matrix'}</h4>
            </div>
            <div className="grid grid-cols-2 gap-8">
              {environmentalData.map((data, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 group/iot hover:bg-white hover:border-blue-500/20 transition-all duration-700 shadow-inner hover:shadow-premium relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/iot:bg-blue-600 transition-all duration-700" />
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={cn("h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/iot:scale-110 transition-all duration-700", data.color)}>
                      <data.icon className="h-7 w-7" />
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black border-none bg-white text-slate-400 italic px-4 py-1.5 rounded-full shadow-sm group-hover/iot:text-blue-600 transition-colors uppercase tracking-widest">{data.status}</Badge>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic group-hover/iot:text-slate-950 transition-colors">{data.label}</p>
                    <p className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/iot:text-blue-600 transition-colors">{data.val}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Smart Link interface */}
          <div className="lg:col-span-5 space-y-10">
            <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 relative overflow-hidden group/mirror transition-all duration-700 hover:bg-white hover:border-blue-500/20 shadow-inner hover:shadow-premium">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover/mirror:scale-110 group-hover/mirror:rotate-12 transition-transform duration-1000">
                <Smartphone className="w-48 h-48 text-blue-600" />
              </div>
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover/mirror:scale-110 group-hover/mirror:bg-white transition-all duration-700 shadow-sm">
                    <Zap className="h-7 w-7 text-blue-600 animate-pulse" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-950 italic tracking-tight uppercase leading-none">{t('iotSync.mirrorLinkLabel' as any) || 'Neural_Bridge_Link'}</h4>
                </div>
                <p className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight">
                  {t('iotSync.mirrorLinkDesc' as any) || 'Authorize real-time synchronization between your localized aesthetic nodes and the BIP global cloud infrastructure.'}
                </p>
                <div className="pt-8 border-t border-slate-100 space-y-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t('iotSync.linkStability' as any) || 'SIGNAL_STABILITY'}</span>
                    <span className="text-2xl font-black text-emerald-600 italic tracking-tighter uppercase leading-none">99.8% {t('iotSync.efficient' as any) || 'NOMINAL'}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50 p-0.5 shadow-inner">
                    <motion.div initial={{ width: 0 }} animate={{ width: "99.8%" }} transition={{ duration: 2, ease: "easeOut" }} className="h-full bg-emerald-500 shadow-glow-emerald/30 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-slate-950 text-white relative overflow-hidden group/box shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover/box:rotate-12 group-hover/box:scale-110 transition-transform duration-1000">
                <ShieldCheck className="w-32 h-32 text-white" />
              </div>
              <div className="flex items-center gap-6 relative z-10 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-lg">
                  <ShieldCheck className="h-6 w-6 animate-pulse" />
                </div>
                <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400 italic">Security_Standard</h5>
              </div>
              <p className="text-sm text-slate-400 font-medium italic leading-relaxed relative z-10 tracking-tight">
                {t('iotSync.encryptionInfo' as any) || 'All telemetry packets are encrypted via BIP-Standard quantum-resistant nodes before being committed to the registry.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
              <Info className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-slate-950 transition-colors">
              {t('iotSync.lastSync' as any) || 'TEMPORAL_SYNC'}: <span className="text-slate-950">{lastSync.toLocaleString(t('common.locale' as any) || 'th-TH')}</span>
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-16 px-10 rounded-2xl bg-slate-950 hover:bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-[10px] italic transition-all duration-500 shadow-2xl hover:shadow-blue-500/20 border-none group/btn">
            {t('iotSync.configureMesh' as any) || 'Configure_Network_Mesh'}
            <LinkIcon className="ml-4 h-5 w-5 group-hover:rotate-45 transition-transform" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
