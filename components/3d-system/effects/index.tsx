'use client'

import { useRef, useEffect, useState, ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'

// ==========================================
// EFFECT 1: Mouse Follow Effect
// ==========================================
interface MouseFollowProps {
  children: ReactNode
  intensity?: number
  className?: string
}

export function MouseFollow({ children, intensity = 20, className = '' }: MouseFollowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { damping: 25, stiffness: 150 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      x.set((e.clientX - centerX) / intensity)
      y.set((e.clientY - centerY) / intensity)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [intensity, x, y])

  return (
    <motion.div
      ref={ref}
      style={{ x: xSpring, y: ySpring }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ==========================================
// EFFECT 2: Magnetic Button
// ==========================================
interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
}

export function MagneticButton({ 
  children, 
  className = '', 
  strength = 0.3,
  onClick 
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { damping: 15, stiffness: 200 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}

// ==========================================
// EFFECT 3: 3D Parallax Scroll
// ==========================================
interface Parallax3DProps {
  children: ReactNode
  className?: string
  depth?: number
  rotateX?: boolean
  rotateY?: boolean
}

export function Parallax3D({ 
  children, 
  className = '',
  depth = 50,
  rotateX = true,
  rotateY = true
}: Parallax3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [depth, -depth])
  const rotX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15])
  const rotY = useTransform(scrollYProgress, [0, 0.5, 1], [-10, 0, 10])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9])

  return (
    <motion.div
      ref={ref}
      style={{
        y,
        rotateX: rotateX ? rotX : 0,
        rotateY: rotateY ? rotY : 0,
        scale,
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ==========================================
// EFFECT 4: Morphing Text
// ==========================================
interface MorphingTextProps {
  texts: string[]
  interval?: number
  className?: string
}

export function MorphingText({ texts, interval = 3000, className = '' }: MorphingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length)
    }, interval)
    return () => clearInterval(timer)
  }, [texts.length, interval])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {texts.map((text, index) => (
        <motion.span
          key={text}
          className="absolute inset-0"
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{
            opacity: index === currentIndex ? 1 : 0,
            y: index === currentIndex ? 0 : -20,
            filter: index === currentIndex ? 'blur(0px)' : 'blur(10px)'
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {text}
        </motion.span>
      ))}
      {/* Invisible text for sizing */}
      <span className="invisible">{texts[0]}</span>
    </div>
  )
}

// ==========================================
// EFFECT 5: Reveal on Scroll
// ==========================================
interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
}

export function RevealOnScroll({ 
  children, 
  className = '',
  direction = 'up',
  delay = 0
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  })

  const directionOffset = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { y: 0, x: 50 },
    right: { y: 0, x: -50 }
  }

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const y = useTransform(scrollYProgress, [0, 0.5], [directionOffset[direction].y, 0])
  const x = useTransform(scrollYProgress, [0, 0.5], [directionOffset[direction].x, 0])

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, x }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ==========================================
// EFFECT 6: Floating Animation
// ==========================================
interface FloatingProps {
  children: ReactNode
  className?: string
  amplitude?: number
  duration?: number
}

export function Floating({ 
  children, 
  className = '',
  amplitude = 10,
  duration = 3
}: FloatingProps) {
  return (
    <motion.div
      animate={{
        y: [0, -amplitude, 0],
        rotate: [-1, 1, -1]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ==========================================
// EFFECT 7: Glow Effect
// ==========================================
interface GlowProps {
  children: ReactNode
  className?: string
  color?: string
  intensity?: number
}

export function Glow({ 
  children, 
  className = '',
  color = '#635bff',
  intensity = 20
}: GlowProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        filter: isHovered 
          ? `drop-shadow(0 0 ${intensity}px ${color})` 
          : `drop-shadow(0 0 ${intensity / 3}px ${color})`
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// ==========================================
// EFFECT 8: Stagger Children
// ==========================================
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({ 
  children, 
  className = '',
  staggerDelay = 0.1
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// ==========================================
// EFFECT 9: Cursor Spotlight
// ==========================================
interface CursorSpotlightProps {
  children: ReactNode
  className?: string
  size?: number
  color?: string
}

export function CursorSpotlight({ 
  children, 
  className = '',
  size = 300,
  color = 'rgba(99, 91, 255, 0.15)'
}: CursorSpotlightProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }

    const element = ref.current
    element?.addEventListener('mousemove', handleMouseMove)
    return () => element?.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${color}, transparent)`
        }}
      />
      {children}
    </div>
  )
}

// ==========================================
// Export All Effects
// ==========================================
export default {
  MouseFollow,
  MagneticButton,
  Parallax3D,
  MorphingText,
  RevealOnScroll,
  Floating,
  Glow,
  StaggerContainer,
  StaggerItem,
  CursorSpotlight
}
