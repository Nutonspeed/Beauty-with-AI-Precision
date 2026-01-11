"use client"

import { motion } from "framer-motion"
import { Heart, Zap, Smile, Activity, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
// @ts-ignore
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
// @ts-ignore
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
// @ts-ignore
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
// @ts-ignore
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

interface AestheticSentimentProps {
  customerName: string
}

export function AestheticSentiment({ customerName }: AestheticSentimentProps) {
  const t = useTranslations()

  const sentimentHistory = [
    { time: t('aestheticSentiment.history.initial'), score: 65 },
    { time: t('aestheticSentiment.history.consult'), score: 72 },
    { time: t('aestheticSentiment.history.scan'), score: 88 },
    { time: t('aestheticSentiment.history.proposal'), score: 94 },
  ]

  const keywords = [
    { word: t('aestheticSentiment.keywords.trust'), weight: 92, color: 'text-emerald-400' },
    { word: t('aestheticSentiment.keywords.precision'), weight: 88, color: 'text-cyan-400' },
    { word: t('aestheticSentiment.keywords.prevention'), weight: 85, color: 'text-pink-400' },
    { word: t('aestheticSentiment.keywords.safety'), weight: 78, color: 'text-amber-400' },
  ]

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group animate-neural-pulse">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Heart className="h-8 w-8 text-pink-500 animate-pulse" />
            {t('aestheticSentiment.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('aestheticSentiment.subtitle')}
          </CardDescription>
        </div>
        <Badge className="bg-pink-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
          {t('ui.status.sentimentActive')}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sentiment Evolution Chart */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('aestheticSentiment.sentimentTrend')}</h4>
              <div className="flex items-center gap-4">
                <Smile className="h-4 w-4 text-emerald-400" />
                <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-emerald-500" />
                </div>
                <span className="text-xs font-bold text-white">94%</span>
              </div>
            </div>
            
            <div className="h-[300px] w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentimentHistory}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#ec4899" 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Keywords & Insight Column */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('aestheticSentiment.keyKeywords')}</h4>
              <div className="flex flex-wrap gap-3">
                {keywords.map((kw, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className={cn("px-4 py-2 rounded-xl border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest italic transition-all hover:scale-110", kw.color)}
                  >
                    {kw.word} ({kw.weight}%)
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-pink-600/10 via-transparent to-transparent border border-pink-500/20 space-y-6 relative overflow-hidden group/insight">
              <Brain className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-pink-500/5 rotate-12 group-hover/insight:scale-110 transition-transform duration-1000" />
              <div className="flex items-center gap-4 relative z-10">
                <Zap className="h-5 w-5 text-pink-400" />
                <h5 className="text-xs font-black text-white uppercase tracking-widest">{t('aestheticSentiment.aiInsight')}</h5>
              </div>
              <p className="text-[11px] text-slate-400 font-light leading-relaxed italic relative z-10">
                {t('aestheticSentiment.aiInsightDesc')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-600">
            <Activity className="h-4 w-4" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">{t('aestheticSentiment.bioSentimentSecure')}</p>
          </div>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">{t('aestheticSentiment.engineInfo')}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
