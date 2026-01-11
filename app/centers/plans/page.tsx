'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

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
        // ถ้าโหลดแพ็กเกจไม่ได้ให้ใช้ค่า default
      }
    }

    fetchPlan()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            แพ็กเกจการใช้งาน ClinicIQ
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            เลือกแพ็กเกจที่เหมาะกับขนาดทีมเซลของคลินิกคุณ
            เพื่อใช้ AR / AI วิเคราะห์ผิวและปิดการขายจากที่บ้านได้มากขึ้น
          </p>
        </header>

        <section className="bg-white/80 backdrop-blur rounded-2xl border border-blue-100 p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
              แพ็กเกจปัจจุบันของคลินิกคุณ
            </p>
            <p className="text-lg md:text-xl font-bold text-gray-900">
              {plans.find((p) => p.id === currentPlanId)?.name ?? 'Basic'}
            </p>
            <p className="text-sm text-gray-600">
              Sales User สูงสุด{' '}
              <span className="font-semibold">
                {currentMaxSalesUsers ?? plans.find((p) => p.id === currentPlanId)?.maxSalesUsers ?? 1}
              </span>{' '}
              คน • ลูกค้า / Lead ได้ไม่จำกัด
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button variant="outline" className="w-full sm:w-auto">
              ดูรายละเอียดแพ็กเกจทั้งหมด
            </Button>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              อัปเกรดแพ็กเกจ
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col h-full border-2 ${
                  plan.highlight
                    ? 'border-blue-500 shadow-md shadow-blue-100'
                    : 'border-slate-100'
                } ${isCurrent ? 'ring-2 ring-emerald-400/70' : ''}`}
              >
                <CardHeader className="space-y-1 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {plan.name}
                    </CardTitle>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        plan.highlight
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                  <p className="text-base font-semibold text-blue-700 mt-1">
                    {plan.price}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <ul className="space-y-2 mb-4 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>
                        Sales User สูงสุด{' '}
                        <span className="font-semibold">
                          {plan.maxSalesUsers ?? 'ไม่จำกัด'}
                        </span>{' '}
                        คน
                      </span>
                    </li>
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-auto ${
                      plan.highlight
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                    variant={plan.highlight ? 'default' : 'default'}
                  >
                    {isCurrent ? 'แพ็กเกจปัจจุบัน' : 'เลือกแพ็กเกจนี้'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section className="bg-white/70 backdrop-blur rounded-2xl border border-slate-100 p-4 md:p-6 space-y-3 text-sm text-gray-700">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            คำถามที่พบบ่อยเกี่ยวกับแพ็กเกจ
          </h2>
          <div className="space-y-2">
            <div>
              <p className="font-semibold">ถ้าใช้แพ็กเกจ Basic แล้วอยากเพิ่มเซลมากกว่า 1 คน ทำอย่างไร?</p>
              <p className="text-gray-600">
                คุณสามารถอัปเกรดเป็นแพ็กเกจ Pro หรือ Enterprise ได้ทุกเมื่อ ข้อมูลลูกค้าและผลวิเคราะห์ทั้งหมดจะยังอยู่ครบเหมือนเดิม
              </p>
            </div>
            <div>
              <p className="font-semibold">จำนวนลูกค้า / Lead จำกัดหรือไม่?</p>
              <p className="text-gray-600">ไม่จำกัดในทุกแพ็กเกจ เซลสามารถบันทึกลูกค้าได้ไม่จำกัดจำนวน</p>
            </div>
            <div>
              <p className="font-semibold">AI Skin Analysis ต่อเดือนถ้าเต็มแล้วจะใช้งานต่อได้หรือไม่?</p>
              <p className="text-gray-600">
                ระบบจะแจ้งเตือนเมื่อใกล้ถึง limit ตามแพ็กเกจ และคุณสามารถซื้อ add-on เพิ่มหรืออัปเกรดแพ็กเกจได้ตามความเหมาะสม
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
