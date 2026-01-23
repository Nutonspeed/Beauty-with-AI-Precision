"use client"

/**
 * Advanced AR Viewer Component interface
 *
 * Real-time AR visualization with:
 * - Object detection and tracking
 * - Skin condition analysis
 * - Interactive overlays
 * - Performance monitoring
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, Activity, Zap, Target, ShieldCheck, RefreshCw } from "lucide-react"
import {
  getObjectRecognitionSystem,
  type ObjectRecognitionResult,
  type DetectedObject,
  type SkinCondition,
} from "@/lib/ar/advanced-object-recognition"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function AdvancedARViewer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [isActive, setIsActive] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [result, setResult] = useState<ObjectRecognitionResult | null>(null)
  const [fps, setFps] = useState(0)
  const [error, setError] = useState<string | null>(null)

  /**
   * Draw interface overlays interface
   */
  const drawOverlays = useCallback((
    ctx: CanvasRenderingContext2D,
    result: ObjectRecognitionResult,
    width: number,
    height: number,
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw detected objects interface
    result.objects.forEach((obj) => {
      drawObject(ctx, obj, width, height)
    })

    // Draw skin conditions interface
    result.skinConditions.forEach((condition) => {
      drawSkinCondition(ctx, condition, width, height)
    })
  }, [fps])

  /**
   * Process interface frames interface
   */
  const processFrames = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const startTime = performance.now()

    try {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const system = getObjectRecognitionSystem()
      const analysisResult = await system.analyzeFrame(video)

      setResult(analysisResult)
      drawOverlays(ctx, analysisResult, canvas.width, canvas.height)

      const processingTime = performance.now() - startTime
      setFps(Math.round(1000 / Math.max(1, processingTime)))
    } catch (err) {
      console.error("Frame processing error:", err)
    }

    animationFrameRef.current = requestAnimationFrame(processFrames)
  }, [isActive, drawOverlays])

  /**
   * Start camera and AR system interface
   */
  const startAR = useCallback(async () => {
    if (!videoRef.current) return

    setIsInitializing(true)
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      const system = getObjectRecognitionSystem()
      await system.initialize()

      setIsActive(true)
      processFrames()
    } catch (err) {
      console.error("Failed to start AR:", err)
      setError(err instanceof Error ? err.message : "Failed to synchronize imaging node")
    } finally {
      setIsInitializing(false)
    }
  }, [processFrames])

  /**
   * Stop camera and AR system interface
   */
  const stopAR = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    setIsActive(false)
    setResult(null)
  }, [])

  /**
   * Draw detected object interface
   */
  const drawObject = (ctx: CanvasRenderingContext2D, obj: DetectedObject, width: number, height: number) => {
    const x = obj.boundingBox.normalized ? obj.boundingBox.x * width : obj.boundingBox.x
    const y = obj.boundingBox.normalized ? obj.boundingBox.y * height : obj.boundingBox.y
    const w = obj.boundingBox.normalized ? obj.boundingBox.width * width : obj.boundingBox.width
    const h = obj.boundingBox.normalized ? obj.boundingBox.height * height : obj.boundingBox.height

    ctx.strokeStyle = obj.tracking.stable ? "#ff69b4" : "#03a9f4"
    ctx.lineWidth = 3
    ctx.setLineDash([10, 5])
    ctx.strokeRect(x, y, w, h)
    ctx.setLineDash([])

    // Draw identity node interface
    ctx.fillStyle = "rgba(2, 6, 23, 0.8)"
    ctx.fillRect(x, y - 30, 180, 30)
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 12px italic sans-serif"
    ctx.fillText(`${obj.label.toUpperCase()} [${(obj.confidence * 100).toFixed(0)}%]`, x + 10, y - 10)
  }

  /**
   * Draw skin condition interface
   */
  const drawSkinCondition = (
    ctx: CanvasRenderingContext2D,
    condition: SkinCondition,
    width: number,
    height: number,
  ) => {
    const bbox = condition.location.boundingBox
    const x = bbox.normalized ? bbox.x * width : bbox.x
    const y = bbox.normalized ? bbox.y * height : bbox.y
    const w = bbox.normalized ? bbox.width * width : bbox.width
    const h = bbox.normalized ? bbox.height * height : bbox.height

    const severity = condition.severity
    const color = severity > 70 ? "#f43f5e" : severity > 40 ? "#f59e0b" : "#10b981"

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x + w/2, y + h/2, Math.max(w, h)/2, 0, 2 * Math.PI)
    ctx.stroke()

    // Draw label interface
    ctx.fillStyle = "rgba(2, 6, 23, 0.8)"
    ctx.fillRect(x + w/2 - 60, y + h + 10, 120, 25)
    ctx.fillStyle = color
    ctx.font = "bold 10px italic sans-serif"
    ctx.fillText(`${condition.type.toUpperCase()}: ${severity.toFixed(0)}%`, x + w/2 - 50, y + h + 27)
  }

  useEffect(() => {
    return () => {
      stopAR()
      const system = getObjectRecognitionSystem()
      system.dispose()
    }
  }, [stopAR])

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group flex flex-col min-h-[800px] transition-all duration-700 hover:border-pink-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <Target className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            Advanced_AR_Recognition
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            Real-time multi-node object detection and dermal variance mapping
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Inference_Stream</p>
            <p className={cn("text-lg font-black italic tracking-tighter uppercase leading-none mt-1", isActive ? 'text-emerald-600' : 'text-slate-300')}>
              {isActive ? 'NOMINAL_SYNC' : 'NODE_OFFLINE'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <Activity className={cn("h-6 w-6 transition-colors", isActive ? 'text-emerald-500 animate-pulse' : 'text-slate-300')} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 h-full">
          {/* Main interface viewport interface */}
          <div className="lg:col-span-8 relative group/viewport">
            <div className="relative aspect-video rounded-[3.5rem] overflow-hidden bg-slate-950 border-4 border-white shadow-premium group/canvas">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
              
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity duration-1000"
                playsInline
                muted
                style={{ display: isActive ? "none" : "block" }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full object-cover z-10"
                style={{ display: isActive ? "block" : "none" }}
              />

              {/* HUD interface interface */}
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 pointer-events-none p-10"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-4">
                        <Badge className="bg-white/10 backdrop-blur-md text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl tracking-[0.2em] uppercase leading-none">
                          <Zap className="mr-3 h-3.5 w-3.5 text-pink-500 animate-pulse" />
                          {fps} FPS_STABILITY
                        </Badge>
                        <div className="flex items-center gap-4 bg-slate-950/40 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10 shadow-xl">
                          <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Signal_Fidelity: 99.9%</span>
                        </div>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                        <Target className="h-7 w-7 text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent shadow-glow-pink animate-scan-line" />
                  </motion.div>
                )}
              </AnimatePresence>

              {!isActive && !isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm z-30">
                  <div className="text-center space-y-8 italic group/init">
                    <div className="relative mx-auto h-24 w-24">
                      <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
                      <CameraOff className="h-20 w-20 text-slate-400 relative z-10 mx-auto opacity-40 group-hover/init:opacity-100 group-hover/init:text-blue-600 transition-all duration-700" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-2xl font-black text-white uppercase tracking-tighter leading-none">AR_Stream_Inactive</p>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Initialize imaging node to authorize sync</p>
                    </div>
                  </div>
                </div>
              )}

              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl z-30">
                  <div className="text-center space-y-8 italic">
                    <div className="relative h-20 w-20 mx-auto">
                      <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full animate-pulse" />
                      <RefreshCw className="h-14 w-14 animate-spin mx-auto text-pink-600 relative" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Synchronizing_Neural_Cluster...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls interface interface */}
            <div className="mt-10 flex gap-6">
              {!isActive ? (
                <Button 
                  onClick={startAR} 
                  disabled={isInitializing} 
                  size="xl"
                  className="flex-1 h-20 rounded-[2.5rem] bg-slate-950 text-white border-none font-black uppercase tracking-[0.3em] text-xs italic shadow-2xl transition-all hover:bg-pink-600 active:scale-95 group/start relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/start:translate-x-[100%] transition-transform duration-1000" />
                  <Camera className="mr-4 h-6 w-6 group-hover/start:scale-110 transition-transform" />
                  {isInitializing ? 'INITIALIZING_AR_UPLINK...' : 'Initialize_AR_System'}
                </Button>
              ) : (
                <Button 
                  onClick={stopAR} 
                  variant="outline" 
                  size="xl"
                  className="flex-1 h-20 rounded-[2.5rem] border-slate-200 bg-white text-rose-600 font-black uppercase tracking-[0.3em] text-[11px] italic shadow-premium hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 group/stop"
                >
                  <CameraOff className="mr-4 h-6 w-6 group-hover/stop:scale-110 transition-transform" />
                  Deactivate_AR_Stream
                </Button>
              )}
            </div>
          </div>

          {/* Analysis Results Column interface */}
          <div className="lg:col-span-4 space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Inference_Registry_Log
            </h4>
            
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <Card className="border-slate-100 bg-slate-50/50 rounded-[3rem] shadow-inner p-10 space-y-8 transition-all duration-700 hover:bg-white hover:border-blue-500/20">
                    <div className="space-y-6">
                      {[
                        { label: 'Objects_Detected', val: result.objects.length, icon: Box, color: 'text-blue-600' },
                        { label: 'Variance_Nodes', val: result.skinConditions.length, icon: Activity, color: 'text-pink-600' },
                        { label: 'Global_Precision', val: `${(result.confidence * 100).toFixed(1)}%`, icon: Target, color: 'text-emerald-600' }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center group/item">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                              <item.icon className={cn("h-5 w-5", item.color)} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/item:text-slate-950 transition-colors">{item.label}</span>
                          </div>
                          <span className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Skin Conditions interface interface */}
                  {result.skinConditions.length > 0 && (
                    <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic">Heuristic_Dermal_Analysis</p>
                      <div className="grid gap-4">
                        {result.skinConditions.map((condition, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-6 group/cond hover:border-blue-500/20 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight group-hover/cond:text-blue-600 transition-colors leading-none">{condition.type.replace("_", " ")}</span>
                              <span className="text-2xl font-black text-slate-950 italic tracking-tighter leading-none">{condition.severity.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-50 p-0.5 shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${condition.severity}%` }}
                                transition={{ duration: 1.5, delay: index * 0.1 }}
                                className={cn(
                                  "h-full rounded-full",
                                  condition.severity > 70 ? "bg-rose-500 shadow-glow-rose/30" : 
                                  condition.severity > 40 ? "bg-amber-500 shadow-glow-amber/30" : 
                                  "bg-emerald-500 shadow-glow-emerald/30"
                                )}
                              />
                            </div>
                            {condition.recommendations.length > 0 && (
                              <div className="flex items-start gap-4 pt-4 border-t border-slate-50">
                                <Sparkles className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />
                                <p className="text-[13px] text-slate-500 font-medium italic leading-relaxed tracking-tight group-hover/cond:text-slate-950 transition-colors">"{condition.recommendations[0]}"</p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-[4rem] border border-slate-100 shadow-inner italic grayscale group-hover:grayscale-0 transition-all duration-1000">
                  <div className="relative h-32 w-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-blue-500/5 blur-[60px] rounded-full" />
                    <div className="h-32 w-32 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm relative z-10">
                      <Target className="h-16 w-16 text-slate-200" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">Awaiting_Sync</p>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Initialize AR stream to Authorize Node recognition</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Neural_Recognition_Layer: 2026_VERSION</p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            BIP-Standard-Recognition-v4.8
          </Badge>
        </div>
      </CardFooter>
    </Card>
  )
}
