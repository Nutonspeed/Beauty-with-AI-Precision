'use client'

import { ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GradientMesh, ParticleField, FloatingShapes, WaveField, StarField } from '../backgrounds'
import { designTokens } from '../core'

// ==========================================
// TEMPLATE 1: Stripe-style Hero
// ==========================================
interface StripeHeroProps {
  title: string | ReactNode
  subtitle?: string
  cta?: { primary: string, secondary?: string }
  stats?: { value: string, label: string }[]
  theme?: 'stripe' | 'ocean' | 'sunset' | 'emerald'
}

export function StripeHero({
  title,
  subtitle,
  cta = { primary: 'Get started →', secondary: 'Contact sales' },
  stats,
  theme = 'stripe'
}: StripeHeroProps) {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const colors = designTokens.colors[theme]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: colors.secondary }}
    >
      <GradientMesh colors={colors.gradients} blur={100} />
      
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Title */}
        <motion.h1 
          className={`${designTokens.typography.display.size} ${designTokens.typography.display.weight} ${designTokens.typography.display.leading} mb-8`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {typeof title === 'string' ? (
            <>
              <span className="block text-white">{title.split(' ').slice(0, 2).join(' ')}</span>
              <span 
                className="block text-transparent bg-clip-text"
                style={{ 
                  backgroundImage: `linear-gradient(to right, ${colors.gradients.join(', ')})` 
                }}
              >
                {title.split(' ').slice(2).join(' ')}
              </span>
            </>
          ) : title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p 
            className={`${designTokens.typography.body.size} text-gray-300 max-w-3xl mx-auto mb-12 ${designTokens.typography.body.leading}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button
            className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {cta.primary}
          </motion.button>
          
          {cta.secondary && (
            <motion.button
              className="px-8 py-4 bg-transparent border-2 border-white/20 text-white rounded-lg font-semibold text-lg hover:border-white/40 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {cta.secondary}
            </motion.button>
          )}
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div 
            className="grid grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div 
            className="w-1.5 h-3 bg-white/50 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  )
}

// ==========================================
// TEMPLATE 2: Apple-style Hero (Minimalist)
// ==========================================
interface AppleHeroProps {
  title: string
  subtitle?: string
  cta?: string
  image?: string
}

export function AppleHero({
  title,
  subtitle,
  cta = 'Learn more →',
  image
}: AppleHeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 text-center">
        {/* Minimal Title */}
        <motion.h1 
          className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p 
            className="text-2xl md:text-3xl text-gray-400 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* CTA */}
        <motion.a
          href="#"
          className="inline-flex items-center text-xl text-blue-500 hover:text-blue-400 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {cta}
        </motion.a>

        {/* Product Image */}
        {image && (
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <img src={image} alt={title} className="max-w-full mx-auto" />
          </motion.div>
        )}
      </div>
    </section>
  )
}

// ==========================================
// TEMPLATE 3: Linear-style Hero (Dark Mode)
// ==========================================
interface LinearHeroProps {
  title: string
  subtitle?: string
  badge?: string
  features?: string[]
}

export function LinearHero({
  title,
  subtitle,
  badge,
  features
}: LinearHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Badge */}
        {badge && (
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {badge}
          </motion.div>
        )}

        {/* Title */}
        <motion.h1 
          className="text-5xl md:text-6xl lg:text-7xl font-medium text-white tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p 
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Features */}
        {features && (
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {features.map((feature, i) => (
              <span 
                key={i}
                className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300"
              >
                {feature}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

// ==========================================
// TEMPLATE 4: Vercel-style Hero (Modern)
// ==========================================
interface VercelHeroProps {
  title: string
  subtitle?: string
  gradient?: boolean
}

export function VercelHero({
  title,
  subtitle,
  gradient = true
}: VercelHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Gradient Background */}
      {gradient && (
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 rounded-full blur-3xl" />
        </div>
      )}

      {/* Triangle Grid Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="triangles" width="100" height="100" patternUnits="userSpaceOnUse">
              <polygon points="50,0 100,100 0,100" fill="none" stroke="rgba(255,255,255,0.1)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#triangles)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Logo Triangle */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <svg className="w-16 h-16 mx-auto text-white" viewBox="0 0 76 65" fill="currentColor">
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
            {title}
          </span>
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p 
            className="text-xl text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  )
}

// ==========================================
// TEMPLATE 5: Custom Hero (Fully Customizable)
// ==========================================
type BackgroundType = 'gradient' | 'particles' | 'shapes' | 'wave' | 'stars' | 'none'

interface CustomHeroProps {
  children: ReactNode
  background?: BackgroundType
  backgroundProps?: Record<string, unknown>
  className?: string
  darkMode?: boolean
}

export function CustomHero({
  children,
  background = 'gradient',
  backgroundProps = {},
  className = '',
  darkMode = true
}: CustomHeroProps) {
  const backgrounds = {
    gradient: <GradientMesh {...backgroundProps} />,
    particles: <ParticleField {...backgroundProps} />,
    shapes: <FloatingShapes {...backgroundProps} />,
    wave: <WaveField {...backgroundProps} />,
    stars: <StarField {...backgroundProps} />,
    none: null
  }

  return (
    <section 
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
        darkMode ? 'bg-black text-white' : 'bg-white text-black'
      } ${className}`}
    >
      {backgrounds[background]}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}

// ==========================================
// Export All
// ==========================================
export default {
  StripeHero,
  AppleHero,
  LinearHero,
  VercelHero,
  CustomHero
}
