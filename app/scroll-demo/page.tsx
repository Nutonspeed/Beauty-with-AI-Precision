"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Camera, Sparkles, Brain, TrendingUp, ArrowDown } from "lucide-react"

export default function ScrollAnimationDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Scene 1: Hero - opacity and scale
  const scene1Opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scene1Scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  // Scene 2: Features - slide in from bottom
  const scene2Y = useTransform(scrollYProgress, [0.15, 0.35], [100, 0])
  const scene2Opacity = useTransform(scrollYProgress, [0.15, 0.25, 0.4, 0.5], [0, 1, 1, 0])

  // Scene 3: Process - rotate and fade
  const scene3Y = useTransform(scrollYProgress, [0.4, 0.6], [100, 0])
  const scene3Opacity = useTransform(scrollYProgress, [0.4, 0.5, 0.65, 0.75], [0, 1, 1, 0])
  const scene3Rotate = useTransform(scrollYProgress, [0.4, 0.6], [15, 0])

  // Scene 4: Results - scale up
  const scene4Scale = useTransform(scrollYProgress, [0.7, 0.85], [0.8, 1])
  const scene4Opacity = useTransform(scrollYProgress, [0.7, 0.8], [0, 1])

  return (
    <div ref={containerRef} className="relative bg-black text-white">
      {/* Fixed background with animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%)",
            x: useTransform(scrollYProgress, [0, 1], [0, 200]),
            y: useTransform(scrollYProgress, [0, 1], [0, -100]),
          }}
        />
        <motion.div
          className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)",
            x: useTransform(scrollYProgress, [0, 1], [0, -150]),
            y: useTransform(scrollYProgress, [0, 1], [0, 200]),
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, transparent 70%)",
            scale: useTransform(scrollYProgress, [0, 1], [1, 1.5]),
          }}
        />
      </div>

      {/* Scene 1: Hero */}
      <motion.section
        style={{ opacity: scene1Opacity, scale: scene1Scale }}
        className="sticky top-0 h-screen flex items-center justify-center"
      >
        <div className="text-center space-y-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                BeautyAI
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300">
              วิเคราะห์ผิวด้วย AI ใน 3 วินาที
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1, repeat: Infinity, repeatType: "reverse" }}
            className="pt-12"
          >
            <ArrowDown className="w-8 h-8 mx-auto text-gray-400" />
          </motion.div>
        </div>
      </motion.section>

      {/* Scene 2: Features */}
      <motion.section
        style={{ y: scene2Y, opacity: scene2Opacity }}
        className="sticky top-0 h-screen flex items-center justify-center"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 mx-auto">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">วิเคราะห์ผิว AI</h3>
              <p className="text-gray-400 text-center">
                ถ่ายภาพแค่ 3 วินาที<br />รับผลวิเคราะห์ 8 ตัวชี้วัด
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 mx-auto">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">AR แสดงผล</h3>
              <p className="text-gray-400 text-center">
                เห็นผลการรักษา<br />Real-time บนใบหน้า
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">เพิ่มยอดขาย</h3>
              <p className="text-gray-400 text-center">
                ลูกค้าตัดสินใจเร็วขึ้น<br />ถึง 65%
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Scene 3: Process */}
      <motion.section
        style={{ y: scene3Y, opacity: scene3Opacity, rotateX: scene3Rotate }}
        className="sticky top-0 h-screen flex items-center justify-center"
      >
        <div className="text-center space-y-12 px-4 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold">
            ง่ายแค่ <span className="text-purple-400">3 ขั้นตอน</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "ถ่ายรูป", desc: "ใช้กล้องมือถือ" },
              { step: "02", title: "AI วิเคราะห์", desc: "ใน 3 วินาที" },
              { step: "03", title: "แสดง AR", desc: "ปิดการขายทันที" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="relative"
              >
                <div className="text-7xl font-bold text-gray-800 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Scene 4: Results */}
      <motion.section
        style={{ scale: scene4Scale, opacity: scene4Opacity }}
        className="sticky top-0 h-screen flex items-center justify-center"
      >
        <div className="text-center space-y-8 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Sparkles className="w-20 h-20 mx-auto text-yellow-400 mb-6" />
            <h2 className="text-5xl md:text-7xl font-bold mb-4">
              ผลลัพธ์ที่พิสูจน์แล้ว
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
              <div>
                <div className="text-5xl font-bold text-blue-400 mb-2">95.3%</div>
                <div className="text-gray-400">ความแม่นยำ</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-purple-400 mb-2">65%</div>
                <div className="text-gray-400">เพิ่มยอดขาย</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">89+</div>
                <div className="text-gray-400">คลินิกใช้งาน</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Final Section - Fixed at bottom */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-b from-black to-purple-950">
        <div className="text-center space-y-6 px-4">
          <h2 className="text-4xl md:text-6xl font-bold">
            พร้อมเริ่มต้นแล้วหรือยัง?
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            ทดลองใช้ฟรี 30 วัน
          </motion.button>
        </div>
      </section>
    </div>
  )
}
