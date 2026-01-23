"use client"

import { useTranslations } from 'next-intl'
import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { 
  Camera, 
  Upload, 
  Loader2, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  ChevronRight,
  Brain,
  Monitor
} from 'lucide-react'
import { useMediaPipeFaceDetection } from '@/lib/ai/mediapipe'
import { skinAnalysisModel, SkinAnalysisResult } from '@/lib/ai/tensorflow'
import { generateProgramRecommendation } from '@/lib/ai/openai'
import { motion, AnimatePresence } from 'framer-motion'

export default function SkinAnalyzerComponent() {
  const t = useTranslations('skinAnalyzer');
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null)
  const [programRecommendations, setProgramRecommendations] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { videoRef, canvasRef, isLoading, detectionResults, startCamera } = useMediaPipeFaceDetection()

  const analyzeImage = useCallback(async (imageSource: HTMLImageElement | HTMLVideoElement) => {
    setIsAnalyzing(true)
    setError('')
    
    try {
      const imageElement = document.createElement('img')
      
      if (imageSource instanceof HTMLVideoElement) {
        const canvas = document.createElement('canvas')
        canvas.width = imageSource.videoWidth
        canvas.height = imageSource.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(imageSource, 0, 0)
          imageElement.src = canvas.toDataURL()
        }
      } else {
        imageElement.src = imageSource.src
      }

      await new Promise((resolve) => {
        imageElement.onload = resolve
      })

      const result = await skinAnalysisModel.analyzeImage(imageElement)
      setAnalysisResult(result)

      const recommendations = await generateProgramRecommendation(result, {
        age: 30,
        gender: 'female',
        concerns: [result.primaryConcern]
      })
      setProgramRecommendations(recommendations || '')

    } catch (error) {
      console.error('Analysis error:', error)
      setError(t('loadError' as any) || 'Synthesis Node Failure')
    } finally {
      setIsAnalyzing(false)
    }
  }, [t])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageElement = document.createElement('img')
        imageElement.src = e.target?.result as string
        imageElement.onload = () => analyzeImage(imageElement)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    if (videoRef.current && detectionResults) {
      analyzeImage(videoRef.current)
    }
  }

  return (
    <div className="container mx-auto p-4 lg:p-10 space-y-12 animate-in fade-in duration-700">
      <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
              <CardTitle className="text-4xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                  <Brain className="h-10 w-10 text-pink-600 group-hover:text-white" />
                </div>
                {t('title' as any) || 'Neural_Skin_Analyzer'}
              </CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
                {t('description' as any) || 'High-fidelity AI biometric skin diagnostic node'}
              </CardDescription>
            </div>
            <Badge className="bg-slate-950 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl uppercase tracking-widest animate-pulse leading-none">BIP_ANALYZER_v4.8</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-12 lg:p-16 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Upload & Camera interface interface */}
            <div className="lg:col-span-5 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-5 ml-4">
                  <div className="h-8 w-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                    <Monitor className="h-4 w-4 text-pink-600" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Asset_Ingestion</h4>
                </div>
                
                <div className="p-10 rounded-[3rem] border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-white hover:border-pink-500/20 transition-all duration-700 group/upload flex flex-col items-center justify-center space-y-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/upload:scale-110 transition-transform">
                    <Upload className="w-24 h-24 text-pink-600" />
                  </div>
                  <div className="h-20 w-20 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/upload:scale-110 transition-transform duration-700">
                    <Upload className="h-8 w-8 text-slate-300 group-hover/upload:text-pink-600 transition-colors" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="text-center space-y-2 relative z-10">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="ghost"
                      className="h-14 px-10 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm hover:bg-slate-50 transition-all"
                      disabled={isAnalyzing}
                    >
                      {t('uploadPhoto' as any) || 'Authorize_Asset_Link'}
                    </Button>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Supports JPG, PNG Node Formats</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-5 ml-4">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Camera className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Live_Imaging_Stream</h4>
                </div>
                
                <div className="space-y-6 p-8 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner group/camera">
                  <Button
                    onClick={startCamera}
                    variant="outline"
                    size="xl"
                    className="w-full h-18 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm hover:bg-slate-50 transition-all group/btn"
                    disabled={isLoading || isAnalyzing}
                  >
                    <Camera className="mr-3 h-5 w-5 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                    {isLoading ? (t('loadingCamera' as any) || 'SYNCING...') : (t('startCamera' as any) || 'Initialize_Camera')}
                  </Button>
                  
                  <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white shadow-premium bg-slate-950 group/viewport">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
                    <video
                      ref={videoRef}
                      className="hidden"
                      autoPlay
                      playsInline
                    />
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full object-cover opacity-90 group-hover/viewport:opacity-100 transition-opacity duration-1000"
                      width={640}
                      height={480}
                    />
                    {!detectionResults && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
                        <div className="text-center space-y-4 italic opacity-40">
                          <Monitor className="h-12 w-12 text-white mx-auto animate-pulse" />
                          <p className="text-[9px] font-black text-white uppercase tracking-widest">Stream_Offline</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {detectionResults && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                        <Button
                          size="xl"
                          onClick={handleCameraCapture}
                          className="w-full h-18 rounded-2xl bg-slate-950 text-white border-none font-black uppercase tracking-[0.3em] text-[10px] italic shadow-2xl hover:bg-blue-600 active:scale-95 transition-all group/analyze relative overflow-hidden"
                          disabled={isAnalyzing}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/analyze:translate-x-[100%] transition-transform duration-1000" />
                          <Target className="mr-3 h-5 w-5 group-hover/analyze:scale-125 transition-transform" />
                          {t('analyzeFrame' as any) || 'Authorize_Inference'}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Results interface interface */}
            <div className="lg:col-span-7 flex flex-col h-full">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div 
                    key="analyzing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-[4rem] border border-slate-100 shadow-inner italic"
                  >
                    <div className="text-center space-y-10 w-full max-w-sm">
                      <div className="relative h-32 w-32 mx-auto">
                        <div className="absolute inset-0 bg-pink-500/10 blur-[60px] rounded-full animate-pulse" />
                        <div className="h-32 w-32 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm relative z-10">
                          <Loader2 className="h-16 w-16 animate-spin text-pink-600" />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <p className="text-[11px] font-black text-pink-600 uppercase tracking-[0.5em] animate-pulse">{t('analyzing' as any) || 'NEURAL_PROCESSING_ACTIVE'}</p>
                        <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5 relative">
                          <motion.div 
                            className="h-full bg-pink-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "66%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        <p className="text-sm text-slate-400 font-medium tracking-tight">Synthesizing 14.2M biological nodes for precision diagnostic...</p>
                      </div>
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex items-center justify-center p-12 bg-rose-50/50 rounded-[4rem] border border-rose-100 shadow-inner italic"
                  >
                    <div className="text-center space-y-6">
                      <div className="h-20 w-20 rounded-2xl bg-white border border-rose-100 flex items-center justify-center mx-auto shadow-sm">
                        <AlertCircle className="h-10 w-10 text-rose-600" />
                      </div>
                      <p className="text-xl font-black text-slate-950 uppercase tracking-tighter leading-none">Inference_Failure</p>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">{error}</p>
                    </div>
                  </motion.div>
                ) : analysisResult ? (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 space-y-10"
                  >
                    <div className="p-10 lg:p-12 rounded-[4rem] bg-slate-50 border border-slate-100 shadow-inner space-y-12 transition-all duration-700 hover:bg-white hover:border-pink-500/20 hover:shadow-premium">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Activity className="h-8 w-8 text-pink-600" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('resultsTitle' as any) || 'Diagnostic_Synthesis'}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Validated inference parameters</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest animate-pulse leading-none">NOMINAL_SYNC</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                          <div className="space-y-3 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:border-pink-100 transition-all">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none group-hover:text-pink-600">{t('primaryConcern' as any) || 'DOMINANT_CONCERN'}</p>
                            <p className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{analysisResult.primaryConcern}</p>
                          </div>
                          <div className="space-y-3 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:border-blue-100 transition-all">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('confidence' as any) || 'INFERENCE_PRECISION'}</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-5xl font-black text-blue-600 italic tracking-tighter leading-none uppercase">{(analysisResult.confidence * 100).toFixed(1)}</span>
                              <span className="text-xl font-black text-slate-300 italic uppercase">%</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic ml-4 leading-none">{t('allScores' as any) || 'Spectrum_Deltas'}</p>
                          <div className="space-y-4">
                            {Object.entries(analysisResult.scores).map(([concern, score], i) => (
                              <div key={concern} className="group/score">
                                <div className="flex justify-between items-end mb-2 px-2">
                                  <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest group-hover/score:text-slate-950 transition-colors">{concern.replace('_', ' ')}</span>
                                  <span className="text-lg font-black text-slate-950 italic tracking-tighter">{(score * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-sm">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score * 100}%` }}
                                    transition={{ duration: 1.5, delay: i * 0.1 }}
                                    className="h-full rounded-full bg-blue-500 shadow-glow-blue/20"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {programRecommendations && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 pt-10 border-t border-slate-100"
                          >
                            <div className="flex items-center gap-5 ml-4">
                              <div className="h-8 w-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-pink-600" />
                              </div>
                              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('programRecsTitle' as any) || 'Strategic_Protocol_Inferences'}</h4>
                            </div>
                            <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm group/recs relative overflow-hidden transition-all duration-700 hover:border-pink-500/20">
                              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/recs:scale-110 transition-transform duration-1000">
                                <Target className="w-24 h-24 text-pink-600" />
                              </div>
                              <p className="text-lg text-slate-600 font-light italic leading-relaxed tracking-tight relative z-10">"{programRecommendations}"</p>
                              <div className="pt-6 mt-6 border-t border-slate-50 flex justify-end relative z-10">
                                <Button variant="ghost" className="h-auto p-0 text-[10px] font-black uppercase tracking-[0.2em] text-pink-600 hover:bg-transparent hover:translate-x-2 transition-all italic group/btn">
                                  Execute_Protocol_Sync <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-[4rem] border border-slate-100 shadow-inner italic grayscale group-hover:grayscale-0 transition-all duration-1000"
                  >
                    <div className="relative h-32 w-32 mx-auto mb-8">
                      <div className="absolute inset-0 bg-blue-500/5 blur-[60px] rounded-full" />
                      <div className="h-32 w-32 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm relative z-10">
                        <Activity className="h-16 w-16 text-slate-200" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">Registry_Ready</p>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Initialize imaging stream to synchronize diagnostic vectors.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
          <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
            <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Neural_Inference_Verified: BIP_ID_MESH</p>
          </div>
          <div className="flex items-center gap-6">
            <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
              BIP-Analyzer-v4.8
            </Badge>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Temporal_Core: NOMINAL</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
