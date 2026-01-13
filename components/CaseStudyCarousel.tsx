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
import { MagneticButton } from "@/components/ui/magnetic-button"

export function CaseStudyCarousel() {
  const t = useTranslations()
  const locale = useLocale() as "th" | "en" | "zh"
  const lp = useLocalizePath()
  const items = React.useMemo(() => getCaseStudies(locale), [locale])

  return (
    <section className="py-24 lg:py-32 relative bg-white overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px] -z-10" />
      <div className="container relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-4xl text-center space-y-6"
        >
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase glow-badge">
            <BookOpen className="mr-2 h-3.5 w-3.5" />
            {t('caseStudies.title')}
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight text-reveal">
            Aesthetic <span className="text-blue-600">Outcomes</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
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
                  <Card className="h-full border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm medical-card-hover group/card">
                    <CardContent className="p-8 lg:p-10 flex flex-col h-full space-y-8">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-none rounded-full px-4 py-1 text-[9px] font-bold uppercase tracking-widest">
                          {t('demo.caseNode', { number: index + 1 })}
                        </Badge>
                        <Quote className="h-6 w-6 text-blue-100 group-hover/card:text-blue-200 transition-colors" />
                      </div>

                      <div className="space-y-4 flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 leading-tight group-hover/card:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 font-normal leading-relaxed line-clamp-3">
                          {item.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-100 bg-slate-50/50 rounded-xl px-6">
                        {item.metrics.map((m, i) => (
                          <div key={i} className="space-y-1 text-center">
                            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500 truncate">{m.label}</p>
                            <p className="text-lg font-bold text-slate-900">{m.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <Button asChild variant="ghost" className="p-0 h-auto hover:bg-transparent group/btn text-blue-600 font-bold uppercase tracking-wider text-[10px]">
                          <Link href={lp(`/case-studies/${item.slug}`)} className="inline-flex items-center gap-2">
                            {t('demo.verifyOutcome')}
                            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
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
            <MagneticButton strength={0.2}>
              <CarouselPrevious className="relative inset-auto translate-y-0 h-14 w-14 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-md transition-all active:scale-90" />
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <CarouselNext className="relative inset-auto translate-y-0 h-14 w-14 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-md transition-all active:scale-90" />
            </MagneticButton>
          </div>
        </Carousel>
      </div>
    </section>
  )
}
