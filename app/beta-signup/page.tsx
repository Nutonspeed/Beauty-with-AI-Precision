'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  Calendar, 
  Users, 
  Sparkles, 
  Trophy,
  Clock,
  ArrowRight,
  Star,
  Gift,
  Zap
} from 'lucide-react'

export default function BetaSignupPage() {
  // Google Form URL (จะต้องสร้างจริงและใส่ URL)
  const GOOGLE_FORM_URL = "https://forms.gle/YOUR_FORM_ID"

  const benefits = [
    {
      icon: <Gift className="w-5 h-5" />,
      title: "Premium 6 เดือนฟรี",
      description: "มูลค่า ฿1,794",
      highlight: true
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "ชื่อใน Special Thanks",
      description: "Recognition บนเว็บไซต์"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Early Access",
      description: "ใช้ features ใหม่ก่อนใคร"
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Beta Tester Badge",
      description: "Exclusive badge"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "ส่วนลด 50%",
      description: "เมื่อ subscribe จริง"
    }
  ]

  const targetGroups = [
    {
      title: "🏥 Clinic Owners",
      count: "3-5 คน",
      requirements: [
        "เจ้าของคลินิกความงาม / skincare",
        "สนใจใช้ AI ในธุรกิจ",
        "มีลูกค้า 50-500 คน/เดือน"
      ]
    },
    {
      title: "💄 Beauty Professionals",
      count: "3-5 คน",
      requirements: [
        "Dermatologist, Beautician, Esthetician",
        "ประสบการณ์ > 2 ปี",
        "เข้าใจเรื่อง skin analysis"
      ]
    },
    {
      title: "👤 End Customers",
      count: "5-7 คน",
      requirements: [
        "สนใจ skincare / beauty",
        "ใช้ technology/apps บ่อย",
        "อายุ 20-50 ปี"
      ]
    }
  ]

  const timeline = [
    { date: "3-4 พ.ย.", event: "รับสมัคร", status: "current" },
    { date: "5 พ.ย.", event: "ประกาศผล", status: "upcoming" },
    { date: "5-10 พ.ย.", event: "ทดสอบ (6 วัน)", status: "upcoming" },
    { date: "21 พ.ย.", event: "🚀 Launch", status: "upcoming" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
            <Sparkles className="w-3 h-3 mr-1" />
            Beta Testing Program
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Join AI367 Beta Testing!
          </h1>
          
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            ระบบวิเคราณ์ผิวหน้าด้วย AI + AR Treatment Simulator
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>จำนวนจำกัด 10-15 คน</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Deadline: 4 พ.ย. 2025</span>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
            onClick={() => window.open(GOOGLE_FORM_URL, '_blank')}
          >
            สมัครเลย (ใช้เวลา 3 นาที)
            <ArrowRight className="ml-2" />
          </Button>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            🎁 สิทธิประโยชน์ Beta Testers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {benefits.map((benefit) => (
              <Card
                key={benefit.title}
                className={`hover:shadow-lg transition-shadow ${
                  benefit.highlight ? 'border-purple-300 bg-purple-50' : ''
                }`}
              >
                <CardContent className="pt-6 text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                    benefit.highlight ? 'bg-purple-200 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Target Groups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            👥 เรากำลังมองหา
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {targetGroups.map((group) => (
              <Card key={group.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{group.title}</CardTitle>
                  <CardDescription className="text-lg font-semibold text-purple-600">
                    {group.count}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {group.requirements.map((req) => (
                      <li key={req} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            📅 กำหนดการ
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200" />
              <div className="space-y-8">
                {timeline.map((item) => (
                  <div key={item.date} className="relative flex items-center justify-center">
                    <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${
                      item.status === 'current' ? 'bg-purple-600' : 'bg-gray-300'
                    }`} />
                    <div className="grid grid-cols-2 gap-8 w-full">
                      <div className="text-right">
                        <div className="inline-block">
                          <Badge variant={item.status === 'current' ? 'default' : 'secondary'}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {item.date}
                          </Badge>
                          <p className="mt-2 font-medium">{item.event}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* What You'll Do */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            📋 ทำอะไรบ้าง?
          </h2>
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Must Test (ทุกคน)
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Registration + Login (5 นาที)</li>
                    <li>• Skin Analysis (10 นาที)</li>
                    <li>• Analysis History (5 นาที)</li>
                    <li>• Profile Management (3 นาที)</li>
                    <li>• Mobile Testing (10 นาที)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Nice to Test
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• AR Treatment Simulator (10 นาที)</li>
                    <li>• Booking System (5 นาที)</li>
                    <li>• Dashboard (Clinic Owners)</li>
                    <li>• Customer Management (Clinic Owners)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 text-center">
                  <Clock className="w-4 h-4 inline mr-1" />
                  เวลาลงทุนทั้งหมด: <strong>3-5 ชั่วโมง/สัปดาห์</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">
                พร้อมร่วมเป็นส่วนหนึ่ง?
              </h2>
              <p className="text-lg mb-6 text-purple-100">
                รับเพียง 10-15 คน | Deadline: 4 พฤศจิกายน 2025
              </p>
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg"
                onClick={() => window.open(GOOGLE_FORM_URL, '_blank')}
              >
                สมัครเลย
                <ArrowRight className="ml-2" />
              </Button>
              <p className="mt-4 text-sm text-purple-100">
                ใช้เวลาเพียง 3 นาที | ไม่ใช่ first-come-first-served
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>มีคำถาม? ติดต่อได้ที่ <a href="mailto:beta@ai367bar.com" className="text-purple-600 hover:underline">beta@ai367bar.com</a></p>
        </div>
      </div>
    </div>
  )
}
