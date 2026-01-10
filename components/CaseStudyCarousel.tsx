"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { getCaseStudies } from "@/lib/data/case-studies"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import { ChevronRight, BookOpen, Quote } from "lucide-react"
import Link from "next/link"
import { useLocalizePath } from "@/lib/i18n/locale-link"

export function CaseStudyCarousel() {
  const t = useTranslations()
  const locale = useLocale() as "th" | "en" | "zh"
  const lp = useLocalizePath()
  const items = React.useMemo(() => getCaseStudies(locale), [locale])

  return (
    <section className="py-32 lg:py-64 relative bg-white/[0.01] border-b border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <div className="container relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-24 max-w-4xl text-center space-y-8"
        >
          <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
            <BookOpen className="mr-3 h-3.5 w-3.5 animate-pulse" />
            {t('caseStudies.title')}
          </Badge>
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
            Clinical<br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Outcomes</span>
          </h2>
          <p className="text-xl text-slate-500 font-light tracking-[0.2em] italic max-w-2xl mx-auto leading-relaxed">
            {t('caseStudies.description')}
          </p>
        </motion.div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4 md:-ml-8">
            {items.map((item, index) => (
              <CarouselItem key={item.slug} className="pl-4 md:pl-8 md:basis-1/2 lg:basis-1/2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="h-full"
                >
                  <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group hover:bg-white/[0.03] transition-all duration-700">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                    <CardContent className="p-10 lg:p-12 flex flex-col h-full space-y-8">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-pink-600/10 text-pink-400 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-inner">
                          {t('demo.caseNode', { number: index + 1 })}
                        </Badge>
                        <Quote className="h-8 w-8 text-pink-500/20 group-hover:text-pink-500/40 transition-colors" />
                      </div>

                      <div className="space-y-4 flex-1">
                        <h3 className="text-3xl font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors leading-[1.1]">
                          {item.title}
                        </h3>
                        <p className="text-lg text-slate-500 font-light italic leading-relaxed line-clamp-3">
                          {item.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5 bg-white/[0.02] rounded-2xl px-6">
                        {item.metrics.map((m, i) => (
                          <div key={i} className="space-y-1 text-center">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 italic truncate">{m.label}</p>
                            <p className="text-xl font-bold text-white tracking-tighter italic">{m.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4">
                        <Button asChild variant="ghost" className="p-0 h-auto hover:bg-transparent group/btn">
                          <Link href={lp(`/case-studies/${item.slug}`)} className="inline-flex items-center gap-4 text-pink-500 font-black uppercase tracking-[0.3em] text-[10px] italic">
                            {t('demo.verifyOutcome')}
                            <div className="h-8 w-8 rounded-full bg-pink-600/10 border border-pink-500/20 flex items-center justify-center group-hover/btn:translate-x-2 transition-transform shadow-inner">
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:flex justify-end gap-4 mt-12">
            <CarouselPrevious className="relative inset-auto translate-y-0 h-14 w-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all shadow-2xl" />
            <CarouselNext className="relative inset-auto translate-y-0 h-14 w-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all shadow-2xl" />
          </div>
        </Carousel>
      </div>
    </section>
  )
}
