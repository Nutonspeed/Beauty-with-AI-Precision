"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  WifiOff, 
  RefreshCw, 
  Database,
  Clock,
  Smartphone,
  Camera,
  Users,
  ArrowLeft,
  Activity,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />

      <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="w-full max-w-4xl relative z-10 space-y-12">
          {/* Main Offline Node Architecture */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-orange-500/20">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
              <CardHeader className="text-center p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
                <div className="space-y-8">
                  <motion.div 
                    className="mx-auto flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-white border border-slate-100 shadow-inner group-hover:scale-110 transition-all duration-700"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <WifiOff className="w-10 h-10 text-orange-500" />
                  </motion.div>
                  <div className="space-y-3">
                    <Badge variant="outline" className="px-6 py-2 rounded-full border-orange-500/30 text-orange-600 bg-orange-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-sm animate-pulse italic">
                      Offline_Protocol_Active
                    </Badge>
                    <CardTitle className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                      Connection Node<br />
                      <span className="bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent not-italic">Synchronized_Offline</span>
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-500 font-light max-w-md mx-auto italic leading-relaxed pt-4">
                      No internet connection detected. The system has switched to high-precision local caching protocols.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-12 lg:p-16 space-y-12">
                <Alert className="border-orange-100 bg-orange-50/50 rounded-2xl p-6 shadow-inner flex items-center gap-6">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-orange-100 shadow-sm shrink-0">
                    <Zap className="h-5 w-5 text-orange-500" />
                  </div>
                  <AlertDescription className="text-sm font-medium text-orange-900 leading-relaxed italic">
                    <span className="font-black uppercase block mb-1">Telemetry Status</span> 
                    The application is running using localized datasets. Real-time neural inference and cloud synchronization will resume upon reconnection.
                  </AlertDescription>
                </Alert>

                {/* Available Features Schema */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { icon: Database, label: 'Cached Memory Access', desc: 'Access recent customer records, analysis history, and protocol schemas.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { icon: Camera, label: 'Basic Image Ingestion', desc: 'Perform skin scans; results will be queued for neural processing.', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: Users, label: 'Local Unit Management', desc: 'Modify customer parameters; changes will auto-sync to the mesh.', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { icon: Clock, label: 'Temporal Sync Queue', desc: 'All manual operations are logged and awaiting cloud reconciliation.', color: 'text-amber-600', bg: 'bg-amber-50' }
                  ].map((m, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 8 }}
                      className="flex items-start gap-6 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm transition-all duration-500 hover:bg-white hover:border-orange-500/20 group/feat"
                    >
                      <div className={cn("h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover/feat:scale-110 transition-transform duration-700", m.bg)}>
                        <m.icon className={cn("h-6 w-6", m.color)} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-900 italic uppercase tracking-tight leading-none group-hover/feat:text-orange-600 transition-colors">{m.label}</h3>
                        <p className="text-sm text-slate-500 font-light italic leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Unavailable Protocols interface */}
                <div className="p-10 rounded-[3rem] bg-slate-950 text-white relative overflow-hidden group/dark shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                    <ShieldCheck className="w-32 h-32 text-white" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-orange-500 mb-8 italic flex items-center gap-4 relative z-10">
                    <Activity className="h-4 w-4" />
                    Restricted_Infrastructure_Nodes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
                    {[
                      'Real-time Appointment Synchronization',
                      'High-Latency Neural Cloud Analysis',
                      'Immersive 3D AR Simulator Inflow',
                      'Real-time Collaboration Protocol',
                      'Automated Push Notification Relay'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group/item">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500/30 group-hover/item:bg-orange-500 group-hover/item:scale-150 transition-all duration-500" />
                        <span className="text-[11px] font-black text-slate-400 group-hover:text-white transition-colors italic uppercase tracking-widest">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Controls interface */}
                <div className="flex flex-col sm:flex-row gap-8 pt-4">
                  <Button
                    onClick={() => window.location.reload()}
                    size="xl"
                    className="flex-1 h-20 rounded-[2rem] bg-gradient-to-r from-orange-500 to-rose-600 border-none text-white font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <RefreshCw className="h-6 w-6 mr-4" />
                    Retry Sync Sequence
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    onClick={() => window.history.back()}
                    className="h-20 px-12 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[11px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                  >
                    <ArrowLeft className="h-6 w-6 mr-4" />
                    Return to Terminal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* PWA Install Node interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="border-pink-100 bg-pink-50/20 backdrop-blur-xl rounded-[3rem] shadow-premium relative group transition-all duration-700 hover:border-pink-500/20">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                <Smartphone className="w-40 h-40 text-pink-600" />
              </div>
              <CardContent className="p-10 lg:p-12 flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Smartphone className="h-8 w-8" />
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">
                    Optimize Offline Performance
                  </h3>
                  <p className="text-lg text-slate-500 font-light italic leading-relaxed">
                    Install our PWA interface for enhanced data persistence and faster node loading in restricted bandwidth environments.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    const event = new CustomEvent('pwa-install-request')
                    window.dispatchEvent(event)
                  }}
                  size="xl"
                  className="h-18 px-14 rounded-2xl bg-slate-950 hover:bg-pink-600 text-white font-black uppercase tracking-[0.3em] text-[10px] italic shadow-2xl transition-all hover:scale-105 active:scale-95 border-none"
                >
                  Authorize Install
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
