"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { 
  Clock, 
  Phone,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  Shield,
  Users,
  Binary,
  Zap,
  ShieldCheck,
  Loader2,
  ShieldAlert
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

interface SkinCondition {
  name?: string
  type: string
  description: string
  severity: 'low' | 'medium' | 'high'
  confidence?: number
}

interface Recommendation {
  title?: string
  category: string
  description?: string
  recommendation: string
  products?: string[]
}

interface ShareReportViewProps {
  analysis: {
    share_token: string
    overall_score?: number
    ai_results?: {
      overall_score?: number
      skin_conditions?: SkinCondition[]
      recommendations?: Recommendation[]
    }
    heatmap_image_url?: string
    image_url: string
  }
  center: {
    name: string
    logo_url?: string
    brand_color?: string
    contact_phone?: string
  }
  salesStaff: {
    full_name: string
  } | null
  remainingDays: number | null
}

export function ShareReportView({ 
  analysis, 
  center, 
  salesStaff,
  remainingDays 
}: ShareReportViewProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const startTimeRef = useRef<number>(Date.now())
  const interactionsRef = useRef<number>(0)

  const _unusedImageError = imageError;


  useEffect(() => {
    // Start tracking engagement
    const token = analysis.share_token
    if (!token) return

    const startTime = startTimeRef.current;

    const handleInteraction = () => {
      interactionsRef.current += 1
    }

    // Heartbeat to track active time more reliably
    const heartbeatInterval = setInterval(() => {
      const activeDuration = Math.round((Date.now() - startTime) / 1000)
      if (activeDuration > 0 && activeDuration % 30 === 0) { // Every 30s
        fetch(`/api/share/${token}/telemetry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration_seconds: activeDuration,
            interactions: interactionsRef.current,
            scroll_depth: Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100)
          }),
          keepalive: true
        }).catch(() => {})
      }
    }, 10000) // Check every 10s

    window.addEventListener('click', handleInteraction)
    window.addEventListener('scroll', handleInteraction)

    return () => {
      clearInterval(heartbeatInterval)
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)

      const endTime = Date.now()
      const durationSeconds = Math.round((endTime - startTime) / 1000)
      
      if (durationSeconds > 5) {
        const data = JSON.stringify({
          duration_seconds: durationSeconds,
          interactions: interactionsRef.current,
          scroll_depth: Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100)
        })

        if (navigator.sendBeacon) {
          navigator.sendBeacon(`/api/share/${token}/telemetry`, data)
        } else {
          fetch(`/api/share/${token}/telemetry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true
          }).catch(() => {})
        }
      }
    }
  }, [analysis.share_token])

  // Parse AI results with deep defensive checks
  const aiResults = analysis?.ai_results || {}
  const overallScore = aiResults.overall_score || analysis?.overall_score || 0
  const skinConditions: SkinCondition[] = aiResults.skin_conditions || []
  const recommendations: Recommendation[] = aiResults.recommendations || []
  const heatmapUrl = analysis?.heatmap_image_url
  const displayUrl = analysis?.image_url

  // Data Integrity Check
  const hasPartialData = !analysis || !aiResults || skinConditions.length === 0

  // Determine overall health status
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 }
    if (score >= 60) return { label: "Good", color: "text-blue-400", bg: "bg-blue-500/10", icon: Info }
    if (score >= 40) return { label: "Fair", color: "text-amber-400", bg: "bg-amber-500/10", icon: AlertCircle }
    return { label: "Needs Attention", color: "text-rose-400", bg: "bg-rose-500/10", icon: AlertCircle }
  }

  const healthStatus = getHealthStatus(overallScore)
  const StatusIcon = healthStatus.icon

  // Get brand color or use default
  const brandColor = center?.brand_color || "#2563eb"

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <Card className="border-rose-500/30 bg-rose-500/5 backdrop-blur-3xl rounded-[3rem] p-12 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Neural_Sync_Failure</h2>
          <p className="text-slate-400 font-light italic leading-relaxed">The requested diagnostic node could not be synchronized. The share token may be invalid or expired.</p>
          <Button variant="outline" className="mt-8 border-white/10 hover:bg-white/5" onClick={() => window.location.reload()}>
            Initialize_Retry_Sequence
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      {/* Infrastructure Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 relative z-10 space-y-16">
        {hasPartialData && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-400 rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <ShieldAlert className="h-6 w-6" />
                <AlertDescription className="text-xs font-black uppercase tracking-widest italic">
                  Partial Intelligence Signal Detected: Some diagnostic nodes are currently offline or pending synchronization.
                </AlertDescription>
              </div>
            </Alert>
          </motion.div>
        )}

        {/* Center Header Interface */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 pb-12 border-b border-white/10"
        >
          <div className="flex items-center gap-8">
            <div className="relative group">
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl" 
              />
              <div className="relative h-24 w-24 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center p-4 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                {center?.logo_url ? (
                  <Image src={center.logo_url} alt={center.name} width={70} height={70} className="object-contain" />
                ) : (
                  <Shield className="h-12 w-12 text-blue-500" />
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
                {center?.name}
              </h1>
              <div className="flex items-center gap-6">
                <Badge variant="outline" className="px-4 py-1 rounded-full border-blue-500/30 text-blue-400 bg-blue-500/5 uppercase tracking-[0.4em] text-[9px] font-black italic shadow-inner">
                  Neural_Diagnostic_Node
                </Badge>
                {remainingDays !== null && (
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 italic">
                    <Clock className="h-3 w-3 text-blue-500" /> Node_Access: {remainingDays}d
                  </span>
                )}
              </div>
            </div>
          </div>

          {salesStaff && (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-5 bg-white/[0.02] border border-white/5 p-5 rounded-3xl backdrop-blur-2xl shadow-2xl ring-1 ring-white/10"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center shadow-inner">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Authorized_Node_Lead</p>
                <p className="text-lg font-black italic text-white tracking-tight">{salesStaff.full_name}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Result Matrix */}
          <div className="lg:col-span-7 space-y-12">
            {/* Visual Core: The Scan */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="border-white/10 bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.15)] relative group ring-1 ring-white/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                <div className="relative aspect-square">
                  {imageLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-md z-20">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/60 animate-pulse">Syncing_Neural_Visuals...</p>
                    </div>
                  )}
                  <Image
                    src={heatmapUrl || displayUrl}
                    alt="Neural Analysis"
                    fill
                    sizes="(max-width: 768px) 100vw, 700px"
                    priority
                    quality={90}
                    className={cn(
                      "object-cover group-hover:scale-110 transition-transform duration-[3000ms] ease-out",
                      imageLoading ? "opacity-0" : "opacity-100"
                    )}
                    onLoadingComplete={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true)
                      setImageLoading(false)
                    }}
                  />
                  
                  {/* Neural Overlay Pattern */}
                  <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
                  
                  {/* Dynamic Corner Accents */}
                  <div className="absolute top-8 left-8 h-4 w-4 border-t-2 border-l-2 border-blue-500/40" />
                  <div className="absolute top-8 right-8 h-4 w-4 border-t-2 border-r-2 border-blue-500/40" />
                  <div className="absolute bottom-8 left-8 h-4 w-4 border-b-2 border-l-2 border-blue-500/40" />
                  <div className="absolute bottom-8 right-8 h-4 w-4 border-b-2 border-r-2 border-blue-500/40" />
                  
                  {/* Score Overlay */}
                  <div className="absolute bottom-12 left-12 flex items-end gap-8">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="h-28 w-28 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/20 group/score"
                    >
                      <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-5xl font-black italic text-white tracking-tighter"
                      >
                        {overallScore}
                      </motion.span>
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em] mt-1 italic">Index</span>
                    </motion.div>
                    <div className="space-y-3 pb-2">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className={cn("inline-flex items-center gap-3 px-4 py-1.5 rounded-full text-[10px] font-black italic uppercase tracking-[0.3em] shadow-lg ring-1 ring-white/10", healthStatus.bg, healthStatus.color)}
                      >
                        <StatusIcon className="h-4 w-4" />
                        {healthStatus.label}_Status
                      </motion.div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Aesthetic_Neural_Sync_Active
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Condition Matrix */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 italic">Diagnostic_Vectors</h3>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{skinConditions.length} Nodes Detected</span>
              </div>
              <div className="grid gap-4">
                {skinConditions.map((condition: SkinCondition, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: idx * 0.1,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.04] transition-all duration-500 group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-8">
                      <div className="h-16 w-16 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                        <Binary className="h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-black text-white italic text-xl tracking-tight uppercase">{condition.name || condition.type}</h4>
                        <p className="text-sm text-slate-500 font-light italic max-w-sm leading-relaxed">{condition.description}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-3">
                      <Badge variant="outline" className={cn(
                        "px-4 py-1 rounded-full text-[9px] font-black uppercase italic border-none shadow-sm tracking-widest",
                        condition.severity === 'high' ? "bg-rose-500/10 text-rose-400" : 
                        condition.severity === 'medium' ? "bg-amber-500/10 text-amber-400" : 
                        "bg-emerald-500/10 text-emerald-400"
                      )}>
                        {condition.severity}_Intensity
                      </Badge>
                      {condition.confidence && (
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Neural_Trust</p>
                          <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden ml-auto">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${Math.round(condition.confidence * 100)}%` }}
                              transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                              className="h-full bg-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Intelligent Recommendations */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-400 italic text-center lg:text-left">Intelligent_Protocols</h3>
              <div className="space-y-6">
                {recommendations.map((rec: Recommendation, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: idx * 0.1,
                      type: "spring",
                      stiffness: 120,
                      damping: 12
                    }}
                  >
                    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/[0.04] hover:border-pink-500/30 transition-all duration-700 group overflow-hidden relative shadow-2xl">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-10">
                        <div className="flex items-center justify-between mb-8">
                          <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-pink-500/10 border border-pink-500/20 text-pink-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-inner">
                            <Sparkles className="h-8 w-8" />
                          </div>
                          <Badge className="bg-pink-600/20 text-pink-400 font-black italic rounded-lg px-4 py-1 text-[10px] tracking-widest border border-pink-500/30 uppercase">
                            Neural_Protocol
                          </Badge>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">{rec.title || rec.category}</h4>
                          <p className="text-sm text-slate-400 font-light leading-relaxed italic">
                            "{rec.description || rec.recommendation}"
                          </p>
                        </div>
                        
                        {rec.products && rec.products.length > 0 && (
                          <div className="mt-8 pt-8 border-t border-white/5">
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 italic">Optimized_Agents</p>
                            <div className="flex flex-wrap gap-4">
                              {rec.products.map((product: string, i: number) => (
                                <Badge key={i} variant="outline" className="bg-white/5 border-white/10 text-white px-5 py-2 rounded-2xl font-bold italic text-[10px] hover:border-pink-500/40 hover:bg-pink-500/5 transition-all cursor-default">
                                  {product}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Inflow Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <Card className="border-pink-500/30 bg-pink-500/[0.03] backdrop-blur-3xl rounded-[3.5rem] p-12 text-center space-y-10 relative overflow-hidden shadow-[0_0_80px_rgba(236,72,153,0.15)] ring-1 ring-pink-500/20 group/action">
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[80px]" />
                
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-black italic uppercase tracking-widest">
                    <Zap className="h-4 w-4 fill-current animate-bounce" />
                    Evolution_Protocol_Pending
                  </div>
                  <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Ready to Evolve?</h3>
                  <p className="text-slate-400 font-light text-base italic leading-relaxed max-w-sm mx-auto">
                    Secure your specialized consultation node at <span className="text-pink-400 font-bold">{center?.name}</span> to initialize your aesthetic transformation.
                  </p>
                </div>
                
                <div className="relative z-10 grid gap-5">
                  <Button 
                    className="h-20 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.4em] text-sm shadow-[0_20px_60px_rgba(37,99,235,0.4)] transition-all hover:translate-y-[-4px] active:scale-95 border-none group/btn relative overflow-hidden"
                    style={{ backgroundColor: brandColor }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative flex items-center gap-4">
                      <Zap className="h-5 w-5 fill-current" />
                      Initialize_Your_Node
                    </span>
                  </Button>
                  {center?.contact_phone && (
                    <Button variant="outline" className="h-18 rounded-[2rem] border-white/10 bg-white/5 text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] italic hover:text-white hover:bg-white/10 transition-all" asChild>
                      <a href={`tel:${center.contact_phone}`}>
                        <Phone className="h-4 w-4 mr-3" />
                        Direct_Sync: {center.contact_phone}
                      </a>
                    </Button>
                  )}
                </div>
                
                <div className="relative z-10 pt-4 flex items-center justify-center gap-4">
                  <div className="h-px w-12 bg-white/10" />
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">
                      Verified_Neural_Security
                    </p>
                  </div>
                  <div className="h-px w-12 bg-white/10" />
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
