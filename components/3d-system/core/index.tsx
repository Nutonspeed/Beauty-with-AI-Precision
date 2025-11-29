'use client'

import { Suspense, ReactNode, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Preload } from '@react-three/drei'
import * as THREE from 'three'

// ==========================================
// CORE: ThreeCanvas - Base 3D Canvas Wrapper
// ==========================================
interface ThreeCanvasProps {
  children: ReactNode
  className?: string
  camera?: { position?: [number, number, number], fov?: number }
  controls?: boolean
  background?: string
  dpr?: [number, number]
  performance?: 'high' | 'medium' | 'low'
}

export function ThreeCanvas({
  children,
  className = '',
  camera = { position: [0, 0, 5], fov: 75 },
  controls = false,
  background = 'transparent',
  dpr: _dpr = [1, 2], // Overridden by performance setting
  performance = 'high'
}: ThreeCanvasProps) {
  const [isWebGLSupported, setIsWebGLSupported] = useState(true)

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    setIsWebGLSupported(!!gl)
  }, [])

  if (!isWebGLSupported) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-900 to-black`}>
        <p className="text-white/60">3D not supported on this device</p>
      </div>
    )
  }

  const dprSettings = {
    high: [1, 2],
    medium: [1, 1.5],
    low: [0.5, 1]
  }

  return (
    <div className={className}>
      <Canvas
        dpr={dprSettings[performance] as [number, number]}
        camera={{ position: camera.position, fov: camera.fov }}
        style={{ background }}
        gl={{ 
          antialias: performance === 'high',
          alpha: true,
          powerPreference: performance === 'high' ? 'high-performance' : 'default'
        }}
      >
        <Suspense fallback={null}>
          {children}
          {controls && <OrbitControls enableZoom={false} enablePan={false} />}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}

// ==========================================
// CORE: Lighting Presets
// ==========================================
type LightingPreset = 'studio' | 'natural' | 'dramatic' | 'soft' | 'neon'

interface LightingProps {
  preset?: LightingPreset
  intensity?: number
}

export function Lighting({ preset = 'studio', intensity = 1 }: LightingProps) {
  const presets = {
    studio: (
      <>
        <ambientLight intensity={0.5 * intensity} />
        <directionalLight position={[10, 10, 5]} intensity={1 * intensity} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3 * intensity} />
      </>
    ),
    natural: (
      <>
        <ambientLight intensity={0.4 * intensity} />
        <directionalLight position={[5, 10, 2]} intensity={0.8 * intensity} castShadow />
        <hemisphereLight intensity={0.3 * intensity} />
      </>
    ),
    dramatic: (
      <>
        <ambientLight intensity={0.1 * intensity} />
        <spotLight position={[10, 10, 10]} angle={0.3} intensity={2 * intensity} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5 * intensity} color="#ff6b6b" />
      </>
    ),
    soft: (
      <>
        <ambientLight intensity={0.8 * intensity} />
        <directionalLight position={[0, 10, 5]} intensity={0.3 * intensity} />
      </>
    ),
    neon: (
      <>
        <ambientLight intensity={0.2 * intensity} />
        <pointLight position={[5, 5, 5]} intensity={1 * intensity} color="#00ff88" />
        <pointLight position={[-5, -5, 5]} intensity={1 * intensity} color="#ff00ff" />
        <pointLight position={[0, 0, -5]} intensity={0.5 * intensity} color="#00ffff" />
      </>
    )
  }

  return presets[preset]
}

// ==========================================
// CORE: Performance Monitor
// ==========================================
interface PerformanceMonitorProps {
  onPerformanceDrop?: () => void
  targetFPS?: number
}

export function PerformanceMonitor({ 
  onPerformanceDrop, 
  targetFPS = 30 
}: PerformanceMonitorProps) {
  const frameCount = useRef(0)
  const lastTime = useRef(Date.now())

  useFrame(() => {
    frameCount.current++
    const currentTime = Date.now()
    
    if (currentTime - lastTime.current >= 1000) {
      const fps = frameCount.current
      if (fps < targetFPS && onPerformanceDrop) {
        onPerformanceDrop()
      }
      frameCount.current = 0
      lastTime.current = currentTime
    }
  })

  return null
}

// ==========================================
// CORE: Scene Container
// ==========================================
interface SceneProps {
  children: ReactNode
  fog?: { color: string, near: number, far: number }
}

export function Scene({ children, fog }: SceneProps) {
  const { scene } = useThree()

  useEffect(() => {
    if (fog) {
      scene.fog = new THREE.Fog(fog.color, fog.near, fog.far)
    }
    return () => {
      scene.fog = null
    }
  }, [scene, fog])

  return <>{children}</>
}

// ==========================================
// PRESETS: Design Tokens
// ==========================================
export const designTokens = {
  colors: {
    // Stripe-inspired
    stripe: {
      primary: '#635bff',
      secondary: '#0a2540',
      accent: '#00d4ff',
      gradients: ['#635bff', '#a960ee', '#f97316']
    },
    // Ocean theme
    ocean: {
      primary: '#0ea5e9',
      secondary: '#1e293b',
      accent: '#06b6d4',
      gradients: ['#0ea5e9', '#6366f1', '#8b5cf6']
    },
    // Sunset theme
    sunset: {
      primary: '#f59e0b',
      secondary: '#1c1917',
      accent: '#ef4444',
      gradients: ['#f59e0b', '#ef4444', '#ec4899']
    },
    // Emerald theme
    emerald: {
      primary: '#10b981',
      secondary: '#064e3b',
      accent: '#34d399',
      gradients: ['#10b981', '#06b6d4', '#3b82f6']
    },
    // Minimal theme
    minimal: {
      primary: '#18181b',
      secondary: '#fafafa',
      accent: '#3b82f6',
      gradients: ['#18181b', '#3f3f46', '#52525b']
    }
  },
  
  animations: {
    // Stripe-style easing
    stripe: [0.16, 1, 0.3, 1],
    // Apple-style easing
    apple: [0.25, 0.1, 0.25, 1],
    // Bounce
    bounce: [0.68, -0.55, 0.265, 1.55],
    // Smooth
    smooth: [0.4, 0, 0.2, 1],
    // Snappy
    snappy: [0.87, 0, 0.13, 1]
  },

  typography: {
    display: {
      size: 'text-7xl md:text-8xl lg:text-9xl',
      weight: 'font-bold',
      leading: 'leading-none'
    },
    heading1: {
      size: 'text-5xl md:text-6xl',
      weight: 'font-bold',
      leading: 'leading-tight'
    },
    heading2: {
      size: 'text-3xl md:text-4xl',
      weight: 'font-semibold',
      leading: 'leading-snug'
    },
    body: {
      size: 'text-lg md:text-xl',
      weight: 'font-normal',
      leading: 'leading-relaxed'
    },
    caption: {
      size: 'text-sm md:text-base',
      weight: 'font-normal',
      leading: 'leading-normal'
    }
  },

  spacing: {
    section: 'py-24 md:py-32 lg:py-40',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    gap: {
      small: 'gap-4',
      medium: 'gap-8',
      large: 'gap-12 md:gap-16'
    }
  }
}

// ==========================================
// UTILS: Animation Variants
// ==========================================
export const animationVariants = {
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: designTokens.animations.stripe }
  },
  fadeInDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: designTokens.animations.stripe }
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: designTokens.animations.stripe }
  },
  fadeInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: designTokens.animations.stripe }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: designTokens.animations.stripe }
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
}

export default {
  ThreeCanvas,
  Lighting,
  PerformanceMonitor,
  Scene,
  designTokens,
  animationVariants
}
