"use client"

import { Suspense, useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { 
  OrbitControls, 
  Environment,
  ContactShadows,
  Float,
  MeshTransmissionMaterial,
  Sparkles
} from "@react-three/drei"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import * as THREE from "three"
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing"

// Particle System Component
function Particles({ count = 100 }) {
  const points = useRef<THREE.Points>(null)
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15
    }
    return positions
  }, [count])

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particlesPosition, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#e8b4f0"
        sizeAttenuation
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Animated Robot with Camera Tracking
function RobotModel({ scrollProgress, cameraMode }: { scrollProgress: number; cameraMode: number }) {
  const gltf = useLoader(GLTFLoader, "/models/robot.glb")
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto"
  }, [hovered])

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime
      
      // Different animations based on scroll position
      if (cameraMode === 0) {
        // Scene 1: Auto rotate + float
        meshRef.current.rotation.y = t * 0.3
        meshRef.current.position.y = Math.sin(t * 0.8) * 0.5
      } else if (cameraMode === 1) {
        // Scene 2: Dramatic rotation
        meshRef.current.rotation.y = t * 0.5
        meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2
        meshRef.current.position.y = Math.sin(t) * 0.3
      } else if (cameraMode === 2) {
        // Scene 3: Showcase mode
        meshRef.current.rotation.y = scrollProgress * Math.PI * 2
        meshRef.current.position.y = 0
      } else {
        // Scene 4: Final spin
        meshRef.current.rotation.y = t * 0.4
        meshRef.current.rotation.z = Math.sin(t * 0.5) * 0.1
      }

      // Hover effect
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(2.3, 2.3, 2.3), 0.1)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(2, 2, 2), 0.1)
      }
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive 
        ref={meshRef}
        object={gltf.scene} 
        scale={2} 
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
    </Float>
  )
}

// Animated Camera
function AnimatedCamera({ cameraMode }: { cameraMode: number }) {
  const { camera } = useThree()
  
  useFrame(() => {
    const targetPosition = new THREE.Vector3()
    const targetLookAt = new THREE.Vector3(0, 0, 0)
    
    switch(cameraMode) {
      case 0: // Hero - Front view
        targetPosition.set(0, 1, 8)
        break
      case 1: // Features - Side view
        targetPosition.set(6, 2, 4)
        break
      case 2: // Details - Close up
        targetPosition.set(0, 0, 4)
        break
      case 3: // Final - Top view
        targetPosition.set(0, 5, 6)
        break
      default:
        targetPosition.set(0, 0, 8)
    }
    
    camera.position.lerp(targetPosition, 0.05)
    camera.lookAt(targetLookAt)
  })
  
  return null
}

// Glass Sphere Decoration
function GlassSphere({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={2}>
      <mesh position={position}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.5}
          chromaticAberration={0.5}
          anisotropy={1}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
        />
      </mesh>
    </Float>
  )
}

// 3D Scene
function Scene3D({ scrollProgress, cameraMode }: { scrollProgress: number; cameraMode: number }) {
  return (
    <>
      <color attach="background" args={["#f8f9fa"]} />
      <fog attach="fog" args={["#f8f9fa", 8, 25]} />
      
      <AnimatedCamera cameraMode={cameraMode} />
      
      {/* Lighting - Soft, clinical lighting */}
      <ambientLight intensity={0.8} />
      <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow color="#ffffff" />
      <spotLight position={[-10, 5, -5]} angle={0.3} penumbra={1} intensity={1} color="#f0f4f8" />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#fef7f0" />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      
      {/* Robot */}
      <Suspense fallback={null}>
        <RobotModel scrollProgress={scrollProgress} cameraMode={cameraMode} />
        <Environment preset="city" />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.5}
          scale={15}
          blur={2.5}
          far={4}
        />
      </Suspense>
      
      {/* Decorative Elements - Soft, elegant particles */}
      <Particles count={80} />
      <Sparkles count={60} scale={10} size={1.5} speed={0.3} color="#e8b4f0" />
      <Sparkles count={40} scale={8} size={2} speed={0.2} color="#ffd1dc" />
      
      {/* Glass Spheres - Soft pink/rose gold tones */}
      <GlassSphere position={[-3, 2, -2]} />
      <GlassSphere position={[3, -1, -3]} />
      <GlassSphere position={[0, 3, -4]} />
      
      {/* Post Processing - Subtle, professional */}
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.8} 
          luminanceSmoothing={0.5} 
          intensity={0.5}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.2} darkness={0.2} />
        <DepthOfField focusDistance={0.01} focalLength={0.05} bokehScale={2} />
      </EffectComposer>
      
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  )
}

// Info Hotspot
function InfoHotspot({ position, label, description }: { position: [number, number]; label: string; description: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <motion.div
      className="absolute"
      style={{ left: `${position[0]}%`, top: `${position[1]}%` }}
      onHoverStart={() => setIsOpen(true)}
      onHoverEnd={() => setIsOpen(false)}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-8 h-8 rounded-full bg-rose-200/60 backdrop-blur-sm border-2 border-rose-400 flex items-center justify-center cursor-pointer shadow-lg"
      >
        <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
      </motion.div>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 left-1/2 -translate-x-1/2 w-64 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-rose-200 shadow-xl z-50"
        >
          <h4 className="text-rose-600 font-bold mb-2">{label}</h4>
          <p className="text-gray-700 text-sm">{description}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

// Main Component
export default function RobotShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cameraMode, setCameraMode] = useState(0)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const scrollProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  // Update camera mode based on scroll
  useEffect(() => {
    return scrollProgress.on("change", (latest) => {
      if (latest < 0.25) setCameraMode(0)
      else if (latest < 0.5) setCameraMode(1)
      else if (latest < 0.75) setCameraMode(2)
      else setCameraMode(3)
    })
  }, [scrollProgress])

  const scene1Opacity = useTransform(scrollProgress, [0, 0.2], [1, 0])
  const scene2Opacity = useTransform(scrollProgress, [0.2, 0.35, 0.45, 0.55], [0, 1, 1, 0])
  const scene3Opacity = useTransform(scrollProgress, [0.5, 0.6, 0.7, 0.8], [0, 1, 1, 0])
  const scene4Opacity = useTransform(scrollProgress, [0.75, 0.85], [0, 1])

  return (
    <div ref={containerRef} className="relative bg-gradient-to-b from-white via-pink-50/30 to-rose-50/50 text-gray-900">
      {/* Fixed 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <Scene3D 
            scrollProgress={scrollYProgress.get()} 
            cameraMode={cameraMode}
          />
        </Canvas>
      </div>
      
      {/* Soft gradient overlays */}
      <div className="fixed inset-0 z-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-rose-100/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,182,193,0.1),transparent_50%)]" />
      </div>

      {/* Interactive Hotspots - Medical/Beauty themed */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          <InfoHotspot 
            position={[30, 40]} 
            label="AI Skin Analysis" 
            description="Advanced AI technology for precise skin diagnostics and treatment planning"
          />
          <InfoHotspot 
            position={[70, 35]} 
            label="Medical Grade" 
            description="FDA-approved medical technology with clinical certification"
          />
          <InfoHotspot 
            position={[50, 60]} 
            label="Safety First" 
            description="Non-invasive procedures with proven safety protocols"
          />
        </div>
      </div>

      {/* Scene 1: Epic Hero */}
      <motion.section
        style={{ opacity: scene1Opacity }}
        className="relative h-screen flex items-center justify-center z-20 pointer-events-none"
      >
        <div className="text-center space-y-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          >
            <motion.h1 
              className="text-7xl md:text-9xl font-light mb-6 tracking-tight"
            >
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 bg-clip-text text-transparent">
                Beauty AI
              </span>
            </motion.h1>
            <p className="text-3xl md:text-4xl text-gray-600 mb-8 font-light tracking-wide">
              เทคโนโลยีเสริมความงามที่ทันสมัย
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-rose-600">
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                <span>ปลอดภัย</span>
              </motion.div>
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                <span>มาตรฐานสากล</span>
              </motion.div>
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                <span>ผลลัพธ์ที่แท้จริง</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Scene 2: Technical Specs */}
      <motion.section
        style={{ opacity: scene2Opacity }}
        className="relative min-h-screen flex items-center justify-center z-20 pointer-events-none"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                title: "การวิเคราะห์ผิว", 
                specs: ["AI Skin Diagnostics", "3D Facial Mapping", "Real-time Analysis"],
                icon: "🔬"
              },
              { 
                title: "การรักษา", 
                specs: ["Non-Invasive", "FDA Approved", "Clinical Grade"],
                icon: "💎"
              },
              { 
                title: "ผลลัพธ์", 
                specs: ["Visible Results", "Long-lasting", "Natural Look"],
                icon: "✨"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-200/40 to-pink-200/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative p-8 rounded-2xl border border-rose-200 bg-white/80 backdrop-blur-md hover:border-rose-300 hover:shadow-xl transition-all">
                  <div className="text-6xl mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-semibold text-rose-600 mb-4">{item.title}</h3>
                  <ul className="space-y-2">
                    {item.specs.map((spec, j) => (
                      <li key={j} className="text-gray-700 flex items-center gap-2">
                        <span className="text-rose-400">▸</span> {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Scene 3: Interactive Features */}
      <motion.section
        style={{ opacity: scene3Opacity }}
        className="relative min-h-screen flex items-center justify-center z-20 pointer-events-none"
      >
        <div className="text-center space-y-12 px-4">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-7xl font-light"
          >
            <span className="bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
              เทคโนโลยีที่ทันสมัย
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { title: "มุมมอง 360°", desc: "ดูรายละเอียดทุกมุมด้วยเทคโนโลยี 3D", icon: "🔄" },
              { title: "ระบบแสงอัจฉริยะ", desc: "แสดงผลแบบ Real-time สมจริง", icon: "💡" },
              { title: "กล้องอัตโนมัติ", desc: "ระบบกล้องเคลื่อนไหวอย่างนุ่มนวล", icon: "🎥" },
              { title: "คุณภาพระดับสูง", desc: "กราฟิกระดับมืออาชีพ", icon: "✨" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="p-6 rounded-xl border border-rose-100 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-2xl font-semibold text-rose-600 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            คลิกที่จุดสีชมพูเพื่อดูข้อมูลเพิ่มเติม
          </motion.p>
        </div>
      </motion.section>

      {/* Scene 4: Final CTA */}
      <motion.section
        style={{ opacity: scene4Opacity }}
        className="relative min-h-screen flex items-center justify-center z-20 pointer-events-none"
      >
        <div className="text-center space-y-8 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-6xl md:text-8xl font-light mb-6">
              พร้อมแล้วหรือยัง
              <br />
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 bg-clip-text text-transparent font-normal">
                สำหรับความงามใหม่?
              </span>
            </h2>

            <p className="text-2xl text-gray-600 mb-12">
              เทคโนโลยี AI เพื่อความงามที่สมบูรณ์แบบ
            </p>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(244, 114, 182, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="pointer-events-auto px-16 py-6 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 text-white rounded-full text-2xl font-medium shadow-2xl relative overflow-hidden group"
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
              <span className="relative z-10">นัดหมายปรึกษา</span>
            </motion.button>

            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[
                { label: "ลูกค้า", value: "10K+" },
                { label: "ความพึงพอใจ", value: "98%" },
                { label: "การรักษา", value: "50+" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-rose-500 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        style={{ opacity: scene1Opacity }}
      >
        <div className="w-6 h-10 border-2 border-rose-400/50 rounded-full flex justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-rose-400 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  )
}
