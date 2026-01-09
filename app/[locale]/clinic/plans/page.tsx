'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, CheckCircle2, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    highlight: false,
    description: 'สำหรับคลินิกที่ต้องการเริ่มทดลองใช้ AR / AI กับทีมเซล 1 คน',
    price: 'สอบถามแพ็กเกจ',
    badge: 'เริ่มต้น',
    maxSalesUsers: 1,
    features: [
      'Sales User สูงสุด 1 คน',
      'ลูกค้า / Lead ได้ไม่จำกัด',
      'AI Skin Analysis ต่อเดือนในระดับเริ่มต้น',
      'Sales Dashboard พื้นฐาน',
      'รองรับ Quick Scan และ AR Simulator พื้นฐาน',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    highlight: true,
    description: 'สำหรับคลินิกที่มีทีมเซลหลายคน ต้องการดันยอดขายด้วย AR / AI แบบจริงจัง',
    price: 'แพ็กเกจแนะนำ',
    badge: 'ยอดนิยม',
    maxSalesUsers: 3,
    features: [
      'Sales User สูงสุด 3 คน',
      'ลูกค้า / Lead ได้ไม่จำกัด',
      'AI Skin Analysis ต่อเดือนได้มากกว่า Basic',
      'Sales Dashboard ขั้นสูง + Sales Funnel',
      'Top Packages / Revenue Overview ต่อเซล',
      'Template ข้อความขาย และ Follow-up พื้นฐาน',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    highlight: false,
    description: 'สำหรับเชนคลินิกหรือองค์กรขนาดใหญ่ ที่ต้องการเชื่อมต่อข้อมูลหลายสาขา',
    price: 'Customized',
    badge: 'สำหรับองค์กร',
    maxSalesUsers: null,
    features: [
      'Sales User ไม่จำกัด (ตามข้อตกลง)',
      'ลูกค้า / Lead ได้ไม่จำกัด',
      'AI Skin Analysis / เดือน ตามข้อตกลง',
      'Global Dashboard สำหรับเจ้าของหลายสาขา',
      'รองรับการเชื่อมต่อ CRM / ERP ภายนอก',
      'Dedicated Support & Training ทีมเซล',
    ],
  },
]

export default function ClinicPlansPage() {
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const [currentPlanId, setCurrentPlanId] = useState<'basic' | 'pro' | 'enterprise'>('basic')
  const [currentMaxSalesUsers, setCurrentMaxSalesUsers] = useState<number | null>(1)

  useEffect(() => {
    let cancelled = false

    const fetchPlan = async () => {
      try {
        const res = await fetch('/api/clinic/plan', { headers: { Accept: 'application/json' } })
        if (!res.ok) return
        const data: { planId?: string; maxSalesUsers?: number } = await res.json()
        if (cancelled) return
        if (data.planId === 'basic' || data.planId === 'pro' || data.planId === 'enterprise') {
          setCurrentPlanId(data.planId)
        }
        if (typeof data.maxSalesUsers === 'number') {
          setCurrentMaxSalesUsers(data.maxSalesUsers)
        }
      } catch {
        // เงียบไว้ ถ้าโหลดแพ็กเกจไม่ได้ให้ใช้ค่า default
      }
    }

    fetchPlan()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto">
          {/* Plans Header Interface */}
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Package className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Service Subscription Tiers
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic"
            >
              Clinical Plan<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Infrastructure</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-xl text-slate-500 font-light tracking-widest max-w-2xl mx-auto italic leading-relaxed"
            >
              Select the optimal resource allocation node for your clinical orchestration and sales force optimization.
            </motion.p>
          </div>

          {/* Current Activation State Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl relative group overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:rotate-12 transition-transform duration-1000">
                <CheckCircle2 className="w-48 h-48 text-pink-500" />
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 relative z-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/60 italic">Active System Node</p>
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black text-white tracking-tighter italic">
                      {plans.find((p) => p.id === currentPlanId)?.name ?? 'Basic'} Tier
                    </h2>
                    <p className="text-lg text-slate-400 font-light italic tracking-wide">
                      Capacity: <span className="text-white font-bold">{currentMaxSalesUsers ?? plans.find((p) => p.id === currentPlanId)?.maxSalesUsers ?? 1}</span> Sales Nodes • Infinite Lead Buffering
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <Button variant="outline" className="h-14 px-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">
                    Full Audit Logs
                  </Button>
                  <Button variant="premium" className="h-14 px-10 rounded-xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
                    Node Upgrade
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Resource Allocation Nodes Grid */}
          <div className="grid gap-10 md:grid-cols-3">
            {plans.map((plan, i) => {
              const isCurrent = plan.id === currentPlanId

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                >
                  <Card className={`relative flex flex-col h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] transition-all duration-700 hover:bg-white/[0.03] hover:border-white/10 group shadow-2xl overflow-hidden ${plan.highlight ? 'border-pink-500/20 bg-pink-500/[0.01] shadow-[0_0_80px_-20px_rgba(236,72,153,0.1)]' : ''}`}>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    {isCurrent && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                        <Badge className="bg-emerald-500 text-white px-6 py-1.5 rounded-full border-none shadow-2xl shadow-emerald-500/40 uppercase tracking-[0.2em] text-[8px] font-black italic">ACTIVE NODE</Badge>
                      </div>
                    )}

                    <CardHeader className="p-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-3xl font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{plan.name}</CardTitle>
                        <Badge className={cn(
                          "uppercase tracking-[0.2em] text-[9px] font-black italic border-none shadow-inner",
                          plan.highlight ? "bg-pink-600 text-white" : "bg-white/[0.03] text-slate-500 border-white/5"
                        )}>
                          {plan.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 font-light italic leading-relaxed">{plan.description}</p>
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-white tracking-tighter italic">{plan.price}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 italic">Financial Commitment Vector</p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-10 pt-0 flex-1 flex flex-col justify-between">
                      <ul className="space-y-5 mb-10">
                        <li className="flex items-start gap-4 group/item">
                          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-500/50 group-hover/item:bg-pink-500 transition-colors shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                          <span className="text-sm text-slate-400 font-light italic">
                            Sales Infrastructure: <span className="text-white font-bold">{plan.maxSalesUsers ?? 'Infinite'} Nodes</span>
                          </span>
                        </li>
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-4 group/item">
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-500/50 group-hover/item:bg-pink-500 transition-colors shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                            <span className="text-sm text-slate-400 font-light italic leading-snug group-hover/item:text-slate-200 transition-colors">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        variant={plan.highlight ? "premium" : "outline"}
                        className={cn(
                          "w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-[1.02] active:scale-[0.98]",
                          !plan.highlight && "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {isCurrent ? 'VERIFIED ACTIVE' : 'SELECT NODE'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Technical Parameter FAQ Nodes */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              <CardHeader className="p-12 pb-6">
                <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                  <Stethoscope className="h-8 w-8 text-purple-400" />
                  Protocol Inquiries
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Clinical Plan Specification parameters</CardDescription>
              </CardHeader>
              <CardContent className="p-12 pt-6">
                <div className="grid md:grid-cols-3 gap-12">
                  {[
                    { q: 'ถ้าใช้แพ็กเกจ Basic แล้วอยากเพิ่มเซลมากกว่า 1 คน ทำอย่างไร?', a: 'คุณสามารถอัปเกรดเป็นแพ็กเกจ Pro หรือ Enterprise ได้ทุกเมื่อ ข้อมูลลูกค้าและผลวิเคราะห์ทั้งหมดจะยังอยู่ครบเหมือนเดิม' },
                    { q: 'จำนวนลูกค้า / Lead จำกัดหรือไม่?', a: 'ไม่จำกัดในทุกแพ็กเกจ เซลสามารถบันทึกลูกค้าได้ไม่จำกัดจำนวน' },
                    { q: 'AI Skin Analysis ต่อเดือนถ้าเต็มแล้วจะใช้งานต่อได้หรือไม่?', a: 'ระบบจะแจ้งเตือนเมื่อใกล้ถึง limit ตามแพ็กเกจ และคุณสามารถซื้อ add-on เพิ่มหรืออัปเกรดแพ็กเกจได้ตามความเหมาะสม' }
                  ].map((faq, i) => (
                    <div key={i} className="space-y-4 group">
                      <div className="h-px w-8 bg-purple-500/50 group-hover:w-full transition-all duration-700" />
                      <p className="font-bold text-white tracking-tight italic group-hover:text-purple-400 transition-colors">{faq.q}</p>
                      <p className="text-sm text-slate-500 font-light italic leading-relaxed group-hover:text-slate-300 transition-colors">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
