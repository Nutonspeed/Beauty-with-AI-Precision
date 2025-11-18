"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Camera, Sparkles, Brain, TrendingUp, Star, Zap, Award, Users, Heart } from "lucide-react"

export default function AdvancedScrollDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  // Smooth scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Smooth spring animations
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Mascot animations - เคลื่อนไหวตาม scroll
  const mascotY = useTransform(smoothProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, -100, 50, -50, 100, 0])
  const mascotRotate = useTransform(smoothProgress, [0, 0.25, 0.5, 0.75, 1], [0, 10, -10, 5, 0])
  const mascotScale = useTransform(smoothProgress, [0, 0.3, 0.6, 1], [1, 1.2, 0.8, 1])

  // Background layers - Parallax
  const bgLayer1Y = useTransform(smoothProgress, [0, 1], [0, -300])
  const bgLayer2Y = useTransform(smoothProgress, [0, 1], [0, -200])
  const bgLayer3Y = useTransform(smoothProgress, [0, 1], [0, -100])

  // Scene transitions
  const scene1Opacity = useTransform(smoothProgress, [0, 0.15], [1, 0])
  const scene2Opacity = useTransform(smoothProgress, [0.1, 0.2, 0.35, 0.45], [0, 1, 1, 0])
  const scene2Scale = useTransform(smoothProgress, [0.1, 0.2], [0.8, 1])
  const scene3Opacity = useTransform(smoothProgress, [0.4, 0.5, 0.65, 0.75], [0, 1, 1, 0])
  const scene3Y = useTransform(smoothProgress, [0.4, 0.5], [200, 0])
  const scene4Opacity = useTransform(smoothProgress, [0.7, 0.8], [0, 1])
  const scene4Scale = useTransform(smoothProgress, [0.7, 0.85], [0.5, 1])

  // Morphing blob animations
  const blobScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.5, 1])
  const blobRotate = useTransform(smoothProgress, [0, 1], [0, 360])

  return (
    <div ref={containerRef} className="relative bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white overflow-hidden">
      {/* Multi-layer Parallax Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Layer 1 - Farthest */}
        <motion.div style={{ y: bgLayer1Y }} className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-10 blur-3xl bg-blue-500" />
          <div className="absolute bottom-40 right-40 w-96 h-96 rounded-full opacity-10 blur-3xl bg-purple-500" />
        </motion.div>

        {/* Layer 2 - Middle */}
        <motion.div style={{ y: bgLayer2Y }} className="absolute inset-0">
          <motion.div
            style={{ scale: blobScale, rotate: blobRotate }}
            className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl bg-gradient-to-r from-pink-500 to-purple-500"
          />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl bg-cyan-500" />
        </motion.div>

        {/* Layer 3 - Closest */}
        <motion.div style={{ y: bgLayer3Y }} className="absolute inset-0">
          <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full opacity-25 blur-2xl bg-gradient-to-br from-yellow-400 to-pink-500" />
        </motion.div>

        {/* Animated grid */}
        <motion.div 
          style={{ opacity: useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.05, 0.1, 0.05, 0]) }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-animated-grid" />
        </motion.div>
      </div>

      {/* Animated Mascot - ตัวการ์ตูน/ไอคอนเคลื่อนไหวตาม scroll */}
      <motion.div
        style={{
          y: mascotY,
          rotate: mascotRotate,
          scale: mascotScale,
          x: mousePosition.x * 2,
        }}
        className="fixed top-20 right-20 z-50 pointer-events-none hidden md:block"
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          {/* Mascot glow effect */}
          <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-50 rounded-full" />
          
          {/* Mascot body */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
            <Sparkles className="w-16 h-16 text-white" />
            
            {/* Floating particles */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-3 -left-3 w-5 h-5 bg-cyan-400 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Scene 1: Hero with morphing shapes */}
      <motion.section
        style={{ opacity: scene1Opacity }}
        className="sticky top-0 h-screen flex items-center justify-center relative"
      >
        {/* Morphing background shapes */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            borderRadius: ["30%", "50%", "30%"]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"
        />

        <div className="text-center space-y-8 px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{ x: mousePosition.x, y: mousePosition.y }}
          >
            {/* Animated badge */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </motion.div>
              <span className="text-sm text-purple-200">AI Beauty Technology</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <motion.span
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent"
                style={{ backgroundSize: "200% 200%" }}
              >
                อนาคตของ
                <br />
                ความงาม
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
            >
              วิเคราะห์ผิวด้วย AI • AR แสดงผล • เพิ่มยอดขาย 65%
            </motion.p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
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

      {/* Scene 2: Animated feature cards with 3D effect */}
      <motion.section
        style={{ opacity: scene2Opacity, scale: scene2Scale }}
        className="sticky top-0 h-screen flex items-center justify-center relative"
      >
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            เทคโนโลยี <span className="text-purple-400">ล้ำสมัย</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Camera, color: "from-blue-500 to-cyan-500", title: "AI Skin Analysis", delay: 0 },
              { icon: Brain, color: "from-purple-500 to-pink-500", title: "AR Visualization", delay: 0.2 },
              { icon: TrendingUp, color: "from-pink-500 to-rose-500", title: "Sales Boost", delay: 0.4 }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, rotateY: -30, z: -100 }}
                whileInView={{ opacity: 1, rotateY: 0, z: 0 }}
                transition={{ duration: 0.8, delay: item.delay }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: 1000
                }}
                className="relative group"
              >
                {/* Card glow */}
                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-opacity duration-300`} />
                
                {/* Card content */}
                <div className="relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all h-full">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 mx-auto shadow-lg`}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-center">{item.title}</h3>
                  <p className="text-gray-400 text-center">
                    ระบบ AI ที่ทันสมัยที่สุด พร้อมให้บริการคุณ
                  </p>

                  {/* Animated corner accents */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Scene 3: Animated process with timeline */}
      <motion.section
        style={{ opacity: scene3Opacity, y: scene3Y }}
        className="sticky top-0 h-screen flex items-center justify-center relative"
      >
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-6xl font-bold text-center mb-20"
          >
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              3 ขั้นตอนสู่ความสำเร็จ
            </span>
          </motion.h2>

          <div className="relative">
            {/* Animated timeline */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left"
              style={{ transformOrigin: "left" }}
            />

            <div className="grid md:grid-cols-3 gap-12 relative">
              {[
                { step: "01", title: "ถ่ายภาพ", desc: "ใช้กล้องมือถือ 3 วินาที", icon: Camera, delay: 0.2 },
                { step: "02", title: "AI วิเคราะห์", desc: "ผลลัพธ์ทันทีแม่นยำ 95%", icon: Brain, delay: 0.5 },
                { step: "03", title: "AR แสดงผล", desc: "ปิดการขายเพิ่ม 65%", icon: Zap, delay: 0.8 }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: item.delay, type: "spring" }}
                  className="relative text-center"
                >
                  {/* Step number */}
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="relative inline-block mb-6"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl">
                      <item.icon className="w-12 h-12" />
                    </div>
                    {/* Orbiting dot */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 left-0 w-full h-full"
                    >
                      <div className="absolute top-0 left-1/2 w-3 h-3 bg-yellow-400 rounded-full -translate-x-1/2" />
                    </motion.div>
                  </motion.div>

                  <div className="text-6xl font-bold text-gray-700 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Scene 4: Results with animated stats */}
      <motion.section
        style={{ opacity: scene4Opacity, scale: scene4Scale }}
        className="sticky top-0 h-screen flex items-center justify-center relative"
      >
        <div className="text-center space-y-12 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <Award className="w-32 h-32 mx-auto text-yellow-400 mb-8" />
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              ผลลัพธ์ที่<span className="text-purple-400">พิสูจน์แล้ว</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { value: "95.3%", label: "ความแม่นยำ", icon: Brain, color: "text-blue-400" },
              { value: "65%", label: "เพิ่มยอดขาย", icon: TrendingUp, color: "text-purple-400" },
              { value: "89+", label: "คลินิก", icon: Users, color: "text-pink-400" },
              { value: "4.8★", label: "คะแนน", icon: Heart, color: "text-red-400" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.1, y: -10 }}
                className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <stat.icon className={`w-10 h-10 mx-auto mb-4 ${stat.color}`} />
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.2, type: "spring" }}
                  className={`text-5xl font-bold mb-2 ${stat.color}`}
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-transparent via-purple-950/50 to-black">
        <div className="text-center space-y-8 px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              พร้อมเปลี่ยนโฉมหน้าคลินิก<br />
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                ของคุณแล้วหรือยัง?
              </span>
            </h2>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full text-2xl font-bold shadow-2xl relative overflow-hidden group"
            >
              <motion.div
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              <span className="relative z-10">เริ่มทดลองใช้ฟรี</span>
            </motion.button>

            <p className="text-gray-400 mt-6">30 วันทดลองใช้ฟรี • ไม่ต้องใส่บัตรเครดิต</p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
