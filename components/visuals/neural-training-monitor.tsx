"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Brain, Zap, Activity, ShieldCheck, RefreshCw, Server, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
// @ts-ignore
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
// @ts-ignore
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
// @ts-ignore
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
// @ts-ignore
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
// @ts-ignore
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
// @ts-ignore
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });

export function NeuralTrainingMonitor() {
  const t = useTranslations()
  const [isTraining, setIsTraining] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [accuracy, setAccuracy] = useState(94.2)
  const [loss, setLoss] = useState(0.12)
  const [data, setData] = useState<{ epoch: number; acc: number; loss: number }[]>([])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTraining) {
      interval = setInterval(() => {
        setEpoch(prev => {
          const next = prev + 1
          if (next >= 100) {
            setIsTraining(false)
            return 100
          }
          
          // Update stats
          const newAcc = Math.min(99.9, accuracy + (Math.random() * 0.1))
          const newLoss = Math.max(0.01, loss - (Math.random() * 0.005))
          setAccuracy(newAcc)
          setLoss(newLoss)
          setData(prevData => [...prevData, { epoch: next, acc: newAcc, loss: newLoss }].slice(-20))
          
          return next
        })
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isTraining, accuracy, loss])

  const handleStart = () => {
    setIsTraining(true)
    if (epoch >= 100) {
      setEpoch(0)
      setAccuracy(94.2)
      setLoss(0.12)
      setData([])
    }
  }

  const metrics = [
    { label: t('neuralTraining.activeEpoch'), value: `EPOCH_${epoch}`, icon: RefreshCw, color: 'text-pink-400' },
    { label: t('neuralTraining.accuracyDelta'), value: `${accuracy.toFixed(2)}%`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: t('neuralTraining.lossGradient'), value: loss.toFixed(4), icon: Activity, color: 'text-amber-400' },
    { label: t('neuralTraining.activeNeurons'), value: '4.2M', icon: Brain, color: 'text-cyan-400' },
  ]

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group animate-neural-pulse">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      
      <CardHeader className="p-8 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Brain className="h-8 w-8 text-pink-400" />
            {t('neuralTraining.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('neuralTraining.subtitle')}
          </CardDescription>
        </div>
        <div className="flex gap-4 relative z-10">
          <Button 
            onClick={handleStart} 
            disabled={isTraining}
            className={cn(
              "h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[9px] italic transition-all shadow-lg",
              isTraining ? "bg-pink-500/20 text-pink-400 animate-pulse" : "bg-pink-600 text-white hover:bg-pink-500 shadow-pink-600/20"
            )}
          >
            {isTraining ? <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> : <Zap className="mr-2 h-3 w-3" />}
            {isTraining ? "TUNING_VECTORS..." : t('neuralTraining.startTraining')}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-8 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Training Curve */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('ui.hud.convergenceCurve')}</h4>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black italic uppercase">
                  {t('ui.hud.learningRate', { val: '0.00042' })}
                </Badge>
              </div>
            </div>
            
            <div className="h-[350px] w-full bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="epoch" 
                    hide
                  />
                  <YAxis hide domain={[90, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="acc" 
                    stroke="#ec4899" 
                    fillOpacity={1} 
                    fill="url(#colorAcc)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Training Metrics */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('ui.hud.nodeVitals')}</h4>
            <div className="grid grid-cols-1 gap-4">
              {metrics.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group/metric"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner animate-synaptic-fire", m.color)}>
                        <m.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{m.label}</p>
                        <p className="text-xl font-black text-white italic tracking-tighter">{m.value}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-pink-600/10 via-transparent to-transparent border border-pink-500/20 space-y-6 relative overflow-hidden group/box">
              <Server className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-pink-500/5 rotate-12 transition-transform duration-1000 group-hover/box:rotate-90" />
              <div className="flex items-center gap-4 relative z-10">
                <ShieldCheck className="h-5 w-5 text-pink-400" />
                <h5 className="text-xs font-black text-white uppercase tracking-widest">{t('ui.hud.computeNode', { node: 'BIP-GPU-X1' })}</h5>
              </div>
              <p className="text-[10px] text-slate-500 font-light leading-relaxed italic relative z-10">
                {t('ui.hud.fineTuningDesc', { model: 'BIP-Neural-v4.2' })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-8 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex items-center justify-between">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">{t('neuralTraining.verified')}</p>
          <p className="text-[9px] font-black text-pink-500/60 uppercase tracking-widest italic">{t('ui.hud.inferenceNode', { node: 'SG-INFERENCE-01' })}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
