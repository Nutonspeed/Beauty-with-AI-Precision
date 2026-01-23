"use client"

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { useTranslations } from "next-intl"
import { Quote, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// testimonials array is currently unused
// const testimonials: any[] = [] 

function TestimonialCard({
  testimonial,
  index,
  total,
  scrollYProgress
}: {
  testimonial: {
    quote: string
    author: string
    role: string
    clinic?: string
    rating: number
    image: string
    metric: string
    metricLabel: string
  }
  index: number
  total: number
  scrollYProgress: MotionValue<number>
}) {
  const start = index / total
  const end = (index + 1) / total
  const mid = start + (end - start) / 2

  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.1, end - 0.1, end],
    [0, 1, 1, 0]
  )

  const y = useTransform(
    scrollYProgress,
    [start, mid, end],
    [100, 0, -100]
  )

  const scale = useTransform(
    scrollYProgress,
    [start, mid, end],
    [0.9, 1, 0.9]
  )

  const rotateX = useTransform(
    scrollYProgress,
    [start, mid, end],
    [10, 0, -10]
  )

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity, y, scale, rotateX, transformPerspective: 1000 }}
    >
      <div className="max-w-5xl w-full mx-auto px-6">
        <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 p-10 md:p-16 relative overflow-hidden group/card hover:border-pink-500/20 transition-all duration-700">
          {/* Background decoration with neon glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:from-pink-500/10 transition-colors" />
          
          <div className="relative grid md:grid-cols-3 gap-12 items-center">
            {/* Quote */}
            <div className="md:col-span-2 space-y-8">
              <div className="p-4 bg-pink-50 w-fit rounded-2xl group-hover:bg-pink-500 group-hover:text-white transition-colors duration-500 shadow-sm">
                <Quote className="w-8 h-8 text-pink-500 group-hover:text-white" />
              </div>
              <p className="text-2xl md:text-3xl text-slate-800 leading-relaxed font-light italic tracking-tight">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-6 pt-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pink-500/20">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-slate-900">{testimonial.author}</div>
                  <div className="text-sm font-black uppercase tracking-widest text-slate-400">{testimonial.role}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">{testimonial.clinic}</div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-4 h-4 transition-transform duration-500 hover:scale-125",
                      i < testimonial.rating ? "text-pink-500 fill-pink-500 shadow-glow-pink" : "text-slate-100"
                    )} 
                  />
                ))}
              </div>
            </div>

            {/* Metric Card with High-End Look */}
            <div className="flex flex-col items-center justify-center p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner group-hover:bg-white group-hover:border-pink-500/20 transition-all duration-700">
              <div className="text-6xl md:text-7xl font-black italic tracking-tighter bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                {testimonial.metric}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-4 text-center">
                {testimonial.metricLabel}
              </div>
              <div className="mt-6 h-1 w-12 bg-gradient-to-r from-pink-500 to-blue-600 rounded-full opacity-40" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TestimonialProgress({ index, total, scrollYProgress }: { index: number, total: number, scrollYProgress: MotionValue<number> }) {
  const scaleX = useTransform(
    scrollYProgress,
    [index / total, (index + 1) / total],
    [0, 1]
  )

  return (
    <motion.div
      className="h-full bg-gradient-to-r from-pink-500 to-blue-600 rounded-full shadow-glow-pink/50"
      style={{
        scaleX,
        transformOrigin: 'left'
      }}
    />
  )
}

export function StickyTestimonials() {
  const t = useTranslations('testimonials')
  const containerRef = useRef<HTMLDivElement>(null)
  
  const localizedTestimonials = Array.isArray(t.raw('items')) 
    ? (t.raw('items') as any[]).map((item, idx) => ({
        ...item,
        rating: 5,
        image: `/testimonials/${idx === 2 ? 'doctor' : 'owner'}-${idx === 2 ? 1 : idx + 1}.jpg`,
        metric: idx === 0 ? "3x" : idx === 1 ? "65%" : t('currencySymbol') + "2M+"
      }))
    : [];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const bgScale = useTransform(scrollYProgress, [0, 1], [0.8, 1.5])

  return (
    <div 
      ref={containerRef} 
      className="relative bg-white"
      style={{ height: `${(localizedTestimonials.length + 1) * 100}vh` }}
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Background with Neon Orbs */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white" />
          <motion.div 
            className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
              scale: bgScale
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
              scale: bgScale
            }}
          />
        </div>

        <div className="container relative z-10">
          {/* Header - Fixed with Neon Accent */}
          <div className="absolute top-12 left-0 right-0 text-center">
            <motion.span 
              className="inline-block px-4 py-1.5 rounded-full bg-pink-500/5 border border-pink-500/10 text-[10px] font-black tracking-[0.3em] text-pink-500 uppercase mb-6 animate-pulse"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {t('badge')}
            </motion.span>
            <motion.h2 
              className="text-4xl md:text-6xl font-bold text-slate-900 italic tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {t('title')}
            </motion.h2>
          </div>

          {/* Testimonial Cards - Stacked and Revealed */}
          <div className="relative h-[60vh] mt-32">
            {localizedTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                index={index}
                total={localizedTestimonials.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

          {/* Navigation Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6">
            {localizedTestimonials.map((_, i) => (
              <div
                key={i}
                className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner"
              >
                <TestimonialProgress index={i} total={localizedTestimonials.length} scrollYProgress={scrollYProgress} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
