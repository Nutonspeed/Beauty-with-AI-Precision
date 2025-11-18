"use client"

import { Suspense, useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { 
  Environment,
  MeshDistortMaterial,
  Sphere,
  Trail,
  Html,
  Sparkles
} from "@react-three/drei"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import * as THREE from "three"
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing"
import { Physics } from "@react-three/rapier"
import { easing } from "maath"
import { colors } from "@/lib/design/tokens"
import { AiMetricsPanel } from "@/components/ai-metrics-panel"

function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      })
    }
    window.addEventListener("mousemove", updateMousePosition)
    return () => window.removeEventListener("mousemove", updateMousePosition)
  }, [])
  return mousePosition
}

function SimpleParticles({ scrollProgress }: { scrollProgress: number }) {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 120
  const { positions, colors: colorArray } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 3 + Math.random() * 2
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      colors[i * 3] = 0.9
      colors[i * 3 + 1] = 0.5
      colors[i * 3 + 2] = 0.7
    }
    return { positions, colors }
  }, [particleCount])
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1
      const scale = 1 + Math.sin(scrollProgress * Math.PI * 2) * 0.2
      particlesRef.current.scale.setScalar(scale)
    }
  })
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function InteractiveSphere({ scrollProgress, targetPosition, rippleTrigger }: { scrollProgress: number; targetPosition: [number, number, number]; rippleTrigger: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isHovered, setIsHovered] = useState(false)
  const lastRipple = useRef<number>(0)
  useFrame((state, delta) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime
      easing.damp3(meshRef.current.position, targetPosition, 0.25, delta)
      meshRef.current.rotation.y = t * 0.3
      const baseScale = isHovered ? 1.08 : 1
      let pulse = 0
      if (rippleTrigger !== lastRipple.current) lastRipple.current = rippleTrigger
      const elapsedSinceRipple = t - rippleTrigger
      if (elapsedSinceRipple >= 0 && elapsedSinceRipple < 0.8) {
        const phase = elapsedSinceRipple / 0.8
        pulse = Math.sin(phase * Math.PI) * 0.18
      }
      meshRef.current.scale.setScalar(baseScale + Math.sin(t * 1.6) * 0.035 + pulse)
    }
  })
  const getSphereColor = () => {
    if (scrollProgress < 0.25) return colors.accentPink
    if (scrollProgress < 0.5) return colors.accentPurple
    if (scrollProgress < 0.75) return colors.accentYellow
    return colors.accentGreen
  }
  return (
    <Trail width={2} length={6} color={getSphereColor()} attenuation={(t) => t * t}>
      <mesh ref={meshRef} onPointerOver={() => setIsHovered(true)} onPointerOut={() => setIsHovered(false)}>
        <Sphere args={[1.2, 64, 64]}>
          <MeshDistortMaterial color={getSphereColor()} attach="material" distort={0.3} speed={2} roughness={0.2} metalness={0.8} />
        </Sphere>
      </mesh>
    </Trail>
  )
}

function Card3D({ position, title, icon, color, isActive, onPointerOver, onPointerOut }: { position: [number, number, number]; title: string; icon: string; color: string; isActive: boolean; onPointerOver?: () => void; onPointerOut?: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const activeColorClass = useMemo(() => {
    switch (color) {
      case colors.accentPink: return 'text-pink-500'
      case colors.accentPurple: return 'text-purple-500'
      case colors.accentYellow: return 'text-yellow-500'
      case colors.accentGreen: return 'text-green-500'
      default: return 'text-pink-500'
    }
  }, [color])
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15
      const targetScale = isActive ? 1.15 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })
  return (
    <group position={position}>
      <mesh ref={meshRef} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={isActive ? 0.95 : 0.6} emissive={color} emissiveIntensity={isActive ? 0.4 : 0.05} />
      </mesh>
      <Html transform occlude position={[0, 0, 0.01]} style={{ width: '180px', pointerEvents: isActive ? 'auto' : 'none' }}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">{icon}</div>
          <h3 className={`text-lg font-bold ${isActive ? activeColorClass : 'text-gray-500'}`}>{title}</h3>
        </div>
      </Html>
      {isActive && (<Sparkles count={15} scale={2.5} size={1.5} speed={0.3} color={color} />)}
    </group>
  )
}

function DynamicCamera({ scrollProgress, mousePos }: { scrollProgress: number; mousePos: { x: number; y: number } }) {
  const { camera } = useThree()
  useFrame(() => {
    let targetZ = 8
    let targetY = 0
    if (scrollProgress < 0.25) { targetZ = 8; targetY = 0 } else if (scrollProgress < 0.5) { targetZ = 6; targetY = 1 } else if (scrollProgress < 0.75) { targetZ = 10; targetY = 2 } else { targetZ = 5; targetY = 0 }
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mousePos.x * 0.5, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + mousePos.y * 0.5, 0.05)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05)
    camera.lookAt(0, 0, 0)
  })
  return null
}

function Scene3D({ scrollProgress, mousePos, activeCard, setActiveCard, rippleTrigger }: { scrollProgress: number; mousePos: { x: number; y: number }; activeCard: number; setActiveCard: (card: number) => void; rippleTrigger: number }) {
  const getSphereTargetPosition = (): [number, number, number] => {
    const cardPositions: [number, number, number][] = [
      [-2, 0.8, -1],
      [2, 0.8, -1],
      [-2, -0.8, -1],
      [2, -0.8, -1]
    ]
    if (activeCard >= 0 && activeCard < 4) return cardPositions[activeCard]
    return [0, 0, 0]
  }
  return (
    <>
      <color attach="background" args={[colors.backgroundAlt]} />
      <fog attach="fog" args={[colors.backgroundAlt, 8, 20]} />
      <ambientLight intensity={0.6} />
      <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 0, 5]} intensity={0.8} color={colors.accentPink} />
      <Suspense fallback={null}>
        <Physics gravity={[0, 0, 0]}>
          <InteractiveSphere scrollProgress={scrollProgress} targetPosition={getSphereTargetPosition()} rippleTrigger={rippleTrigger} />
          <SimpleParticles scrollProgress={scrollProgress} />
          <Card3D position={[-3.5, 1.5, -3]} title="AI Analysis" icon="🔬" color={colors.accentPink} isActive={activeCard === 0} onPointerOver={() => setActiveCard(0)} onPointerOut={() => setActiveCard(-1)} />
          <Card3D position={[3.5, 1.5, -3]} title="3D Scanning" icon="📸" color={colors.accentPurple} isActive={activeCard === 1} onPointerOver={() => setActiveCard(1)} onPointerOut={() => setActiveCard(-1)} />
          <Card3D position={[-3.5, -1.5, -3]} title="Treatment" icon="💎" color={colors.accentYellow} isActive={activeCard === 2} onPointerOver={() => setActiveCard(2)} onPointerOut={() => setActiveCard(-1)} />
          <Card3D position={[3.5, -1.5, -3]} title="Results" icon="✨" color={colors.accentGreen} isActive={activeCard === 3} onPointerOver={() => setActiveCard(3)} onPointerOut={() => setActiveCard(-1)} />
        </Physics>
        <Environment preset="sunset" />
      </Suspense>
      <DynamicCamera scrollProgress={scrollProgress} mousePos={mousePos} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={1} />
        <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={2} />
      </EffectComposer>
    </>
  )
}

export default function AdvancedSphereScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState(-1)
  const mousePos = useMousePosition()
  const [rippleTrigger, setRippleTrigger] = useState(0)
  const activatedCardsRef = useRef<Set<number>>(new Set())
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] })
  const scrollProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  const scene1Opacity = useTransform(scrollProgress, [0, 0.2], [1, 0])
  const scene2Opacity = useTransform(scrollProgress, [0.2, 0.35, 0.45, 0.55], [0, 1, 1, 0])
  const scene3Opacity = useTransform(scrollProgress, [0.5, 0.6, 0.7, 0.8], [0, 1, 1, 0])
  const scene4Opacity = useTransform(scrollProgress, [0.75, 0.85], [0, 1])
  return (
    <div ref={containerRef} className="relative bg-gradient-to-b from-pink-50 via-white to-rose-50">
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
          <Scene3D scrollProgress={scrollYProgress.get()} mousePos={mousePos} activeCard={activeCard} setActiveCard={(c) => { setActiveCard(c); if (c >= 0 && !activatedCardsRef.current.has(c)) { activatedCardsRef.current.add(c); setRippleTrigger(performance.now() / 1000) } }} rippleTrigger={rippleTrigger} />
        </Canvas>
      </div>
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 via-yellow-500 to-green-500 z-50 origin-left" style={{ scaleX: scrollProgress }} />
      {activeCard >= 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-2xl">
          <p className="text-sm font-medium text-gray-700" aria-live="polite">Sphere เคลื่อนที่เข้าหา Card นี้! 🎯</p>
        </motion.div>
      )}
      <div className="fixed top-6 right-6 z-40"><AiMetricsPanel /></div>
      <motion.section style={{ opacity: scene1Opacity }} className="relative h-screen flex items-center justify-center z-20">
        <div className="text-center space-y-6 px-4 max-w-3xl">
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-7xl md:text-9xl font-light">
            <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent">Advanced</span><br />
            <span className="text-gray-900">Interactive</span><br />
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">Experience</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-2xl text-gray-600">เลื่อนสกอลล์และเลื่อนเมาส์เพื่อดูความมหัศจรรย์ ✨</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-4 justify-center text-sm text-gray-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500"></div><span>Scroll Reactive</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span>Mouse Following</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Physics Based</span></div>
          </motion.div>
        </div>
      </motion.section>
      <motion.section style={{ opacity: scene2Opacity }} className="relative min-h-screen flex items-center justify-center z-20">
        <div className="text-center space-y-8 px-4 max-w-4xl">
          <motion.h2 className="text-6xl md:text-7xl font-light text-gray-900" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>ลอง <span className="text-purple-500 font-normal">Hover</span><br />บน Cards ดูสิ!</motion.h2>
          <motion.p className="text-xl text-gray-600">Sphere จะเคลื่อนที่เข้าหา Card ที่คุณ hover</motion.p>
        </div>
      </motion.section>
      <motion.section style={{ opacity: scene3Opacity }} className="relative min-h-screen flex items-center justify-center z-20">
        <div className="text-center space-y-8 px-4 max-w-4xl">
          <motion.h2 className="text-6xl md:text-7xl font-light text-gray-900" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>สังเกต <span className="text-yellow-500 font-normal">Particles</span><br />ที่ตาม Mouse</motion.h2>
          <motion.p className="text-xl text-gray-600">1000 อนุภาคที่เปลี่ยนสีและโต้ตอบกับ cursor</motion.p>
        </div>
      </motion.section>
      <motion.section style={{ opacity: scene4Opacity }} className="relative min-h-screen flex items-center justify-center z-20">
        <div className="text-center space-y-8 px-4 max-w-4xl">
          <motion.h2 className="text-7xl md:text-8xl font-light text-gray-900" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}>Award-Winning<br /><span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent font-normal">Level Experience</span></motion.h2>
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(52, 211, 153, 0.4)" }} whileTap={{ scale: 0.95 }} className="px-12 py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-xl font-medium shadow-2xl">เริ่มต้นการเดินทาง 🚀</motion.button>
                    <motion.button aria-label="Start interactive journey" whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(52, 211, 153, 0.4)" }} whileTap={{ scale: 0.95 }} className="px-12 py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-xl font-medium shadow-2xl">เริ่มต้นการเดินทาง 🚀</motion.button>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[{ icon: "🎨", value: "1000+", label: "Particles" }, { icon: "⚡", value: "60fps", label: "Performance" }, { icon: "🎯", value: "Physics", label: "Real-time" }, { icon: "✨", value: "Advanced", label: "Effects" }].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05, y: -5 }} className="p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl">
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-green-500 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      <motion.div style={{ opacity: scene1Opacity }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <div className="text-center">
          <div className="w-6 h-10 border-2 border-pink-400 rounded-full flex justify-center p-2 mx-auto mb-2">
            <motion.div animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
          </div>
          <p className="text-sm text-gray-500">Scroll & Move Mouse</p>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="fixed bottom-10 left-10 z-30 px-4 py-2 bg-black/80 backdrop-blur-sm rounded-full text-white text-xs space-y-1">
        <div>🎨 React Three Fiber</div>
        <div>⚡ Rapier Physics</div>
        <div>✨ Advanced Shaders</div>
      </motion.div>
    </div>
  )
}
