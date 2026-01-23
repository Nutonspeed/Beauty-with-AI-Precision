'use client'

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Zap, 
  Target,
  ShieldCheck,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useLocalizePath } from '@/lib/i18n/locale-link'

interface Program {
  id: string
  name: string
  description: string
  matchScore: number
  duration: string
  benefit: string
  category: 'Rejuvenation' | 'Hydration' | 'Acne' | 'Lifting'
  tags: string[]
}

export function RecommendedPrograms({ isPremium }: { isPremium: boolean }) {
  const lp = useLocalizePath()

  const programs: Program[] = [
    {
      id: '1',
      name: 'Ultra-Hydra Glow Protocol',
      description: 'Synchronized biological hydration boost using cross-linked hyaluronic acid and AI-pulsed delivery.',
      matchScore: 98,
      duration: '45 mins',
      benefit: 'Deep cellular hydration & immediate glow',
      category: 'Hydration',
      tags: ['Bestseller', 'AI-Optimized']
    },
    {
      id: '2',
      name: 'Collagen Matrix Synthesis',
      description: 'Advanced radiofrequency combined with bioactive peptides to restructure dermal support layers.',
      matchScore: 92,
      duration: '60 mins',
      benefit: 'Dermal density improvement & fine line reduction',
      category: 'Rejuvenation',
      tags: ['Premium', 'Non-Invasive']
    },
    {
      id: '3',
      name: 'Precision Laser Resurfacing',
      description: 'Fractional energy nodes targeting texture irregularities with nanometer precision.',
      matchScore: 85,
      duration: '30 mins',
      benefit: 'Texture uniformity & pore refinement',
      category: 'Lifting',
      tags: ['High-Performance']
    }
  ]

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
                <Sparkles className="h-8 w-8 text-blue-600 group-hover:text-white" />
              </div>
              Recommended_Protocols
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">AI-curated programs based on your latest biometric node scan</CardDescription>
          </div>
          <Badge variant="outline" className="px-6 py-2 rounded-full border-blue-500/30 text-blue-600 bg-white font-black italic tracking-[0.2em] text-[10px] uppercase shadow-sm animate-pulse">
            98% PRECISION MATCH
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-10 lg:p-12 space-y-10 bg-white">
        {!isPremium && (
          <div className="p-8 rounded-[2.5rem] bg-amber-50/50 border border-amber-100 mb-8 relative overflow-hidden group/alert shadow-inner">
            <div className="flex items-center gap-6 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-white border border-amber-100 flex items-center justify-center shadow-sm shrink-0">
                <ShieldCheck className="h-6 w-6 text-amber-600 animate-pulse" />
              </div>
              <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                Advanced AI insights are currently operating in restricted mode. <span className="text-slate-950 font-black uppercase">Upgrade to Premium</span> for 100% precision node matching and longitudinal tracking.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group/item p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-500/20 hover:shadow-premium transition-all duration-700 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/item:bg-blue-600 transition-all duration-700" />
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover/item:scale-110 group-hover/item:rotate-12 transition-transform duration-1000">
                <Target className="h-32 w-32 text-blue-600" />
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                <div className="space-y-6 flex-1">
                  <div className="flex items-center gap-6">
                    <Badge className="bg-blue-600 text-white font-black italic rounded-full px-5 py-1.5 text-[10px] tracking-widest shadow-lg shadow-blue-600/20 uppercase border-none">
                      {program.matchScore}% MATCH
                    </Badge>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{program.category} Node</span>
                  </div>
                  <h4 className="text-3xl font-black text-slate-950 group-hover/item:text-blue-600 transition-colors tracking-tighter italic uppercase leading-none">{program.name}</h4>
                  <p className="text-lg text-slate-500 font-medium italic leading-relaxed max-w-2xl tracking-tight">
                    "{program.description}"
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {program.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 bg-white text-slate-400 italic px-4 py-1.5 rounded-full shadow-sm hover:border-pink-500/20 hover:text-pink-600 transition-all">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 shrink-0">
                  <div className="text-center sm:text-right px-8 py-4 border-r border-slate-100 hidden sm:block">
                    <div className="flex items-center justify-end gap-3 text-slate-400 mb-2">
                      <Clock className="h-4 w-4 text-pink-500/40" />
                      <span className="text-[10px] font-black uppercase tracking-widest italic">{program.duration}</span>
                    </div>
                    <p className="text-xs font-black text-slate-950 uppercase italic tracking-tight">Fast_Track_Sequence</p>
                  </div>
                  <Button variant="premium" className="h-18 px-12 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-[0.3em] text-[10px] italic shadow-2xl transition-all hover:bg-blue-600 active:scale-95 group-hover/item:scale-105 border-none" asChild>
                    <Link href={lp(`/booking?program=${program.id}`)}>
                      Secure_Spot <ChevronRight className="ml-3 h-5 w-5 group-hover/item:translate-x-2 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5 text-slate-400 group/status cursor-default">
            <Zap className="h-5 w-5 group-hover:text-blue-600 transition-colors animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">BIP_Recommendation_Engine_v4.2 // Operational</span>
          </div>
          <Button variant="ghost" className="h-auto p-0 text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 hover:bg-transparent hover:translate-x-3 transition-all italic group/btn" asChild>
            <Link href={lp('/programs')}>
              Explore_All_Protocols <ArrowRight className="ml-4 h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
