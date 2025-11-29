'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

// ==========================================
// BACKGROUND 1: Stripe-style Gradient Mesh
// ==========================================
interface GradientMeshProps {
  colors?: string[]
  speed?: number
  blur?: number
  className?: string
  noise?: boolean
}

export function GradientMesh({
  colors = ['#635bff', '#a960ee', '#f97316', '#00d4ff'],
  speed = 0.003,
  blur = 80,
  className = '',
  noise = true
}: GradientMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrame: number
    let time = 0

    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()
    window.addEventListener('resize', setSize)

    const animate = () => {
      time += speed

      // Create animated gradient
      const gradient = ctx.createLinearGradient(
        canvas.width * (0.5 + Math.sin(time) * 0.3),
        0,
        canvas.width * (0.5 + Math.cos(time * 0.7) * 0.3),
        canvas.height
      )

      // Animate color stops
      colors.forEach((color, i) => {
        const offset = (i / (colors.length - 1) + Math.sin(time + i) * 0.1) % 1
        gradient.addColorStop(Math.max(0, Math.min(1, offset)), color)
      })

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add noise effect
      if (noise) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const n = (Math.random() - 0.5) * 15
          data[i] += n
          data[i + 1] += n
          data[i + 2] += n
        }
        ctx.putImageData(imageData, 0, 0)
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', setSize)
      cancelAnimationFrame(animationFrame)
    }
  }, [colors, speed, noise])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ filter: `blur(${blur}px)` }}
    />
  )
}

// ==========================================
// BACKGROUND 2: 3D Particle Field
// ==========================================
interface ParticleFieldProps {
  count?: number
  color?: string
  size?: number
  speed?: number
  spread?: number
  className?: string
}

function ParticleCloud({ count, color, size, speed, spread }: Omit<ParticleFieldProps, 'className'>) {
  const ref = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count! * 3)
    for (let i = 0; i < count!; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread!
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread!
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread!
    }
    return pos
  }, [count, spread])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed! * 0.1
      ref.current.rotation.y = state.clock.elapsedTime * speed! * 0.15
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  )
}

export function ParticleField({
  count = 5000,
  color = '#ffffff',
  size = 0.02,
  speed = 1,
  spread = 10,
  className = ''
}: ParticleFieldProps) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ParticleCloud count={count} color={color} size={size} speed={speed} spread={spread} />
      </Canvas>
    </div>
  )
}

// ==========================================
// BACKGROUND 3: Floating 3D Shapes
// ==========================================
interface FloatingShapesProps {
  count?: number
  colors?: string[]
  speed?: number
  className?: string
}

function FloatingShape({ 
  position, 
  color, 
  speed, 
  shape 
}: { 
  position: [number, number, number]
  color: string
  speed: number
  shape: 'box' | 'sphere' | 'octahedron' | 'torus'
}) {
  const ref = useRef<THREE.Mesh>(null)
  const randomOffset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.5 + randomOffset
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.3
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + randomOffset) * 0.5
    }
  })

  const geometry = useMemo(() => {
    switch (shape) {
      case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />
      case 'octahedron': return <octahedronGeometry args={[0.5]} />
      case 'torus': return <torusGeometry args={[0.4, 0.15, 16, 32]} />
      default: return <boxGeometry args={[0.8, 0.8, 0.8]} />
    }
  }, [shape])

  return (
    <mesh ref={ref} position={position}>
      {geometry}
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.7}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  )
}

export function FloatingShapes({
  count = 15,
  colors = ['#635bff', '#a960ee', '#00d4ff', '#f97316'],
  speed = 0.5,
  className = ''
}: FloatingShapesProps) {
  const shapes = useMemo(() => {
    const shapeTypes: ('box' | 'sphere' | 'octahedron' | 'torus')[] = ['box', 'sphere', 'octahedron', 'torus']
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 - 2
      ] as [number, number, number],
      color: colors[i % colors.length],
      speed: speed * (0.5 + Math.random()),
      shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)]
    }))
  }, [count, colors, speed])

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a960ee" />
        {shapes.map((shape, i) => (
          <FloatingShape key={i} {...shape} />
        ))}
      </Canvas>
    </div>
  )
}

// ==========================================
// BACKGROUND 4: Wave Field
// ==========================================
interface WaveFieldProps {
  color?: string
  wireframe?: boolean
  speed?: number
  amplitude?: number
  className?: string
}

function WavePlane({ color, wireframe, speed, amplitude }: Omit<WaveFieldProps, 'className'>) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      const geometry = ref.current.geometry as THREE.PlaneGeometry
      const positions = geometry.attributes.position
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const z = Math.sin(x * 0.5 + state.clock.elapsedTime * speed!) * amplitude! +
                  Math.sin(y * 0.5 + state.clock.elapsedTime * speed! * 0.8) * amplitude!
        positions.setZ(i, z)
      }
      positions.needsUpdate = true
    }
  })

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[20, 20, 64, 64]} />
      <meshStandardMaterial 
        color={color}
        wireframe={wireframe}
        side={THREE.DoubleSide}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

export function WaveField({
  color = '#635bff',
  wireframe = true,
  speed = 1,
  amplitude = 0.5,
  className = ''
}: WaveFieldProps) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <WavePlane color={color} wireframe={wireframe} speed={speed} amplitude={amplitude} />
      </Canvas>
    </div>
  )
}

// ==========================================
// BACKGROUND 5: Star Field (Space Effect)
// ==========================================
interface StarFieldProps {
  count?: number
  speed?: number
  depth?: number
  className?: string
}

export function StarField({
  count = 1000,
  speed: _speed = 0.5, // Reserved for animation
  depth = 50,
  className = ''
}: StarFieldProps) {
  const [stars, setStars] = useState<{ x: number, y: number, z: number, size: number }[]>([])

  useEffect(() => {
    setStars(
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        z: Math.random() * depth,
        size: Math.random() * 2 + 0.5
      }))
    )
  }, [count, depth])

  return (
    <div className={`fixed inset-0 -z-10 bg-black overflow-hidden ${className}`}>
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${50 + star.x}%`,
            top: `${50 + star.y}%`,
            width: star.size,
            height: star.size,
            opacity: 1 - star.z / depth
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  )
}

// ==========================================
// Export All
// ==========================================
export default {
  GradientMesh,
  ParticleField,
  FloatingShapes,
  WaveField,
  StarField
}
