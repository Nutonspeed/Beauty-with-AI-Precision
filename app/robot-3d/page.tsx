"use client"

import { Suspense, useRef } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { motion, useScroll, useTransform } from "framer-motion"
import * as THREE from "three"

function RobotModel() {
  const gltf = useLoader(GLTFLoader, "/models/robot.glb")
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Auto rotate
      meshRef.current.rotation.y += 0.005
      
      // Gentle float animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3
    }
  })

  return (
    <primitive 
      ref={meshRef}
      object={gltf.scene} 
      scale={2} 
      position={[0, 0, 0]}
    />
  )
}

function Scene3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <RobotModel />
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>
    </div>
  )
}

export default function Robot3DShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const scene1Opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scene2Opacity = useTransform(scrollYProgress, [0.15, 0.3, 0.5, 0.6], [0, 1, 1, 0])
  const scene3Opacity = useTransform(scrollYProgress, [0.55, 0.65], [0, 1])

  return (
    <div ref={containerRef} className="relative bg-black text-white">
      {/* Fixed 3D Robot Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Scene3D />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />
      </div>

      {/* Animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-3xl"
        />
      </div>

      {/* Scene 1: Hero */}
      <motion.section
        style={{ opacity: scene1Opacity }}
        className="relative h-screen flex items-center justify-center"
      >
        <div className="text-center space-y-6 px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Robot
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-8">
              เทคโนโลยี 3D ที่ทันสมัยที่สุด
            </p>
            <p className="text-lg text-gray-400">
              ⬅️ ลากเมาส์เพื่อหมุนดู 360° • Scroll เพื่อดูเนื้อหา
            </p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Scene 2: Features */}
      <motion.section
        style={{ opacity: scene2Opacity }}
        className="relative min-h-screen flex items-center justify-center"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ฟีเจอร์ล้ำสมัย
                </span>
              </h2>
              
              <div className="space-y-4">
                {[
                  { title: "3D Rendering", desc: "แสดงผล 3D แบบ Real-time" },
                  { title: "Interactive", desc: "ลาก หมุน ซูม ได้ตามใจ" },
                  { title: "Smooth Animation", desc: "Animation ลื่นไหล 60 FPS" },
                  { title: "GLB Support", desc: "รองรับไฟล์ 3D มาตรฐาน" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
                  >
                    <h3 className="text-xl font-bold text-cyan-400 mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="relative text-center p-8 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <div className="text-6xl font-bold text-cyan-400 mb-2">360°</div>
                  <p className="text-gray-300">มุมมองทุกด้าน</p>
                  <p className="text-sm text-gray-500 mt-4">ลากเพื่อหมุนดู Robot</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Scene 3: CTA */}
      <motion.section
        style={{ opacity: scene3Opacity }}
        className="relative min-h-screen flex items-center justify-center"
      >
        <div className="text-center space-y-8 px-4 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              พร้อมสัมผัส
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                เทคโนโลยี 3D
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-12">
              เพิ่ม 3D Models เข้าเว็บไซต์ของคุณได้ง่ายๆ
            </p>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(6, 182, 212, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-2xl font-bold shadow-2xl relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
              <span className="relative z-10">เริ่มใช้งานเลย</span>
            </motion.button>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Drag to Rotate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Scroll Wheel to Zoom</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
