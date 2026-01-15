
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
    <Card className="border-white bg-white/40 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-premium relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight italic flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              Recommended_Protocols
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AI-curated programs based on your latest skin node scan</CardDescription>
          </div>
          <Badge variant="outline" className="h-8 px-4 border-blue-500/20 text-blue-600 bg-blue-500/5 font-black italic">
            98% PRECISION MATCH
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-10 lg:p-12 space-y-8">
        {!isPremium && (
          <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 mb-6">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-6 w-6 text-amber-600" />
              <p className="text-xs text-amber-800 font-medium italic">
                Advanced AI insights are limited in Standard mode. Upgrade to Premium for 100% precision matching.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group/item p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/5 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/item:opacity-[0.08] transition-opacity">
                <Target className="h-24 w-24 text-blue-600" />
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-600 text-white font-black italic rounded-lg">
                      {program.matchScore}% MATCH
                    </Badge>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{program.category}</span>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 group-hover/item:text-blue-600 transition-colors italic">{program.name}</h4>
                  <p className="text-sm text-slate-500 font-medium italic leading-relaxed max-w-xl">
                    "{program.description}"
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {program.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100 text-slate-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                  <div className="text-center sm:text-right px-6 py-3 border-r border-slate-100 hidden sm:block">
                    <div className="flex items-center justify-end gap-2 text-slate-400 mb-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{program.duration}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 italic">Fast Track Results</p>
                  </div>
                  <Button variant="premium" className="h-14 px-10 rounded-2xl shadow-xl shadow-blue-600/10 text-[10px] font-black uppercase tracking-widest group-hover/item:scale-105 transition-all" asChild>
                    <Link href={lp(`/booking?program=${program.id}`)}>
                      Secure_Spot <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-400">
            <Zap className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Next generation AI recommendation engine v4.2 active</span>
          </div>
          <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:bg-blue-50 rounded-xl px-6" asChild>
            <Link href={lp('/programs')}>
              Explore_All_Protocols <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
