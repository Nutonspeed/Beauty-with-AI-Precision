'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { 
  Brain, 
  Scan, 
  ChartLineUp, 
  ShieldCheck, 
  Calendar,
  VideoCamera,
  Sparkle,
  Users,
  Lightning
} from '@phosphor-icons/react'

const services = [
  { 
    icon: Brain, 
    title: 'AI Skin Analysis', 
    description: 'Advanced 8-mode detection system with 468-point facial mapping. Medical-grade accuracy powered by deep learning.',
    gradient: 'from-purple-600 to-violet-600',
    stats: '99.2% accuracy'
  },
  { 
    icon: Scan, 
    title: 'Real-time Detection', 
    description: 'Instant facial landmark detection in under 100ms. Analyze wrinkles, spots, texture, pores, and more.',
    gradient: 'from-cyan-600 to-blue-600',
    stats: '<100ms response'
  },
  { 
    icon: ChartLineUp, 
    title: 'Progress Tracking', 
    description: 'Visual timeline with before/after comparisons. Track treatment efficacy with data-driven insights.',
    gradient: 'from-emerald-600 to-green-600',
    stats: '360° analytics'
  },
  { 
    icon: ShieldCheck, 
    title: 'Enterprise Security', 
    description: 'HIPAA compliant with end-to-end encryption. Row-level security on all patient data.',
    gradient: 'from-slate-600 to-zinc-600',
    stats: 'SOC 2 certified'
  },
  { 
    icon: Calendar, 
    title: 'Smart Scheduling', 
    description: 'AI-optimized appointment booking. Reduce no-shows and maximize clinic efficiency.',
    gradient: 'from-blue-600 to-indigo-600',
    stats: '80% time saved'
  },
  { 
    icon: VideoCamera, 
    title: 'Video Consultations', 
    description: 'Built-in WebRTC video calling with screen sharing. Connect with patients anywhere.',
    gradient: 'from-rose-600 to-pink-600',
    stats: 'HD quality'
  },
  { 
    icon: Sparkle, 
    title: 'Treatment Plans', 
    description: 'AI-generated personalized recommendations based on skin analysis and patient history.',
    gradient: 'from-amber-600 to-orange-600',
    stats: 'Personalized'
  },
  { 
    icon: Users, 
    title: 'CRM & Lead Management', 
    description: 'Complete sales pipeline with lead scoring, automated follow-ups, and conversion tracking.',
    gradient: 'from-red-600 to-rose-600',
    stats: '+300% leads'
  },
]

export function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section ref={containerRef} className="relative py-32 bg-black overflow-hidden" id="features">
      {/* Background effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl"
          style={{ y }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl"
          style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
        />
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 mb-6"
          >
            <Lightning weight="fill" className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Powerful Features</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-white">Everything you need to </span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              grow your clinic
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            A complete AI-powered platform that handles skin analysis, patient management, 
            scheduling, and business growth — all in one place.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="group relative p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Icon */}
              <motion.div 
                className={`inline-flex p-3 md:p-4 rounded-2xl bg-gradient-to-br ${service.gradient} mb-4 md:mb-6`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <service.icon weight="duotone" className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </motion.div>
              
              {/* Stats badge */}
              <div className={`absolute top-6 right-6 px-2 py-1 rounded-full bg-gradient-to-r ${service.gradient} text-white text-xs font-bold opacity-80`}>
                {service.stats}
              </div>
              
              {/* Content */}
              <h3 className="text-lg md:text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See All Features
            <Lightning weight="bold" className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default ServicesSection
