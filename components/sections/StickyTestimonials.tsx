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
      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative grid md:grid-cols-3 gap-8 items-center">
            {/* Quote */}
            <div className="md:col-span-2 space-y-6">
              <Quote className="w-12 h-12 text-blue-100" />
              <p className="text-xl md:text-2xl text-slate-700 leading-relaxed font-medium">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4 pt-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{testimonial.author}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                  <div className="text-xs text-blue-600 font-medium">{testimonial.clinic}</div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-5 h-5",
                      i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"
                    )} 
                  />
                ))}
              </div>
            </div>

            {/* Metric Card */}
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {testimonial.metric}
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-2">
                {testimonial.metricLabel}
              </div>
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
      className="h-full bg-blue-500 rounded-full"
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
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
              scale: bgScale
            }}
          />
        </div>

        <div className="container relative z-10">
          {/* Header - Fixed */}
          <div className="absolute top-8 left-0 right-0 text-center">
            <motion.span 
              className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {t('badge')}
            </motion.span>
            <motion.h2 
              className="text-3xl md:text-5xl font-bold text-slate-900"
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
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
            {localizedTestimonials.map((_, i) => (
              <div
                key={i}
                className="w-12 h-1 rounded-full bg-slate-200 overflow-hidden"
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
