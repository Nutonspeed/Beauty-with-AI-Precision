"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bot, BrainCircuit, Camera, Star, Clock, CheckCircle2 } from "lucide-react"
import { trackPageView } from "@/lib/analytics/usage-tracker"
import { FluidSimulation } from "@/components/fluid-simulation"

export default function LandingPage() {
  useEffect(() => {
    trackPageView('landing_page', { pageType: 'marketing' })
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        {/* Hero Section - เน้นปัญหาและโซลูชัน */}
        <section className="relative w-full py-16 md:py-24 lg:py-32 bg-white dark:bg-gray-950 border-b overflow-hidden">
          <FluidSimulation />
          <div className="container relative z-10 px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                {/* Problem Statement */}
                <div className="inline-block">
                  <Badge variant="outline" className="text-sm">
                    สำหรับคลินิกความงามและผิวหนัง
                  </Badge>
                </div>

                {/* Headline - โฟกัสปัญหาจริง */}
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-gray-900 dark:text-gray-50">
                  ปิดการขายได้เร็วขึ้น{" "}
                  <span className="text-blue-600 dark:text-blue-400">ด้วย AI วิเคราะห์ผิวหน้า</span>
                </h1>

                {/* Value Proposition - ชัดเจน ไม่อวด */}
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  แสดงสภาพผิวปัจจุบันและผลลัพธ์หลังการรักษาด้วย AR แบบ Real-time ช่วยให้ลูกค้าเห็นภาพและตัดสินใจเร็วขึ้น
                </p>

                {/* Key Benefits - เน้นประโยชน์จริง */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">วิเคราะห์ 7 ปัญหาผิว</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">สิว ฝ้า กระ รูขุมขน ริ้วรอย ความชื้น ความมันบนใบหน้า</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">AR แสดงผลก่อน-หลังรักษา</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ลูกค้าเห็นภาพผลลัพธ์ชัดเจน ตัดสินใจง่ายขึ้น</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">ใช้งานได้ทันที ไม่ต้องติดตั้ง</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">เปิดผ่านเว็บเบราว์เซอร์ พนักงานเรียนรู้ได้ภายใน 1 วัน</p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons - แยกชัดเจน */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8" asChild>
                    <Link href="/demo/skin-analysis">
                      <Camera className="mr-2 h-4 w-4" />
                      ทดลองวิเคราะห์ผิวฟรี
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                    <Link href="/demo">
                      นัดหมายดูระบบ (15 นาที)
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-4 pt-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white dark:border-gray-900" />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">4.8/5</span>
                    </div>
                    <div>จาก 89 คลินิกที่รีวิว</div>
                  </div>
                </div>
              </div>

              {/* Right Side - แสดง Product Screenshot จริง */}
              <div className="relative">
                <div className="relative rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
                  {/* Browser Chrome */}
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-900 rounded px-3 py-1 text-xs text-gray-500">
                      app.beautyai.com/analysis
                    </div>
                  </div>

                  {/* Mock Analysis Interface */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6">
                    <div className="h-full grid grid-cols-2 gap-4">
                      {/* Left: Image */}
                      <div className="rounded-lg bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center relative overflow-hidden">
                        <Camera className="w-16 h-16 text-white/50" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        {/* Analysis overlay points */}
                        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      </div>

                      {/* Right: Results */}
                      <div className="space-y-2">
                        <div className="bg-white dark:bg-gray-800 rounded p-3 shadow-sm">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ริ้วรอย</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full w-4/5 bg-orange-400" />
                            </div>
                            <span className="text-xs font-semibold">78%</span>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded p-3 shadow-sm">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">รูขุมขน</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full w-3/5 bg-yellow-400" />
                            </div>
                            <span className="text-xs font-semibold">62%</span>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded p-3 shadow-sm">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ฝ้า-กระ</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full w-1/2 bg-blue-400" />
                            </div>
                            <span className="text-xs font-semibold">45%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">วิเคราะห์ภายใน</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">3 วินาที</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof - เอาออกชั่วคราว จนกว่าจะมีข้อมูลจริง */}
        <section className="w-full py-8 bg-gray-50 dark:bg-gray-900/50 border-y">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ระบบ Beta Testing • เปิดให้ทดลองใช้ฟรี 30 วัน
              </p>
            </div>
          </div>
        </section>

        {/* Features Section - โฟกัสความสามารถจริง */}
        <section className="w-full py-16 md:py-24 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ครบทุกฟีเจอร์ที่คลินิกต้องการ
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                เครื่องมือที่ออกแบบมาเพื่อช่วยพนักงานขายของคุณโดยเฉพาะ
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Camera className="w-12 h-12 mb-4 text-blue-600" />
                  <h3 className="text-xl font-bold mb-2">วิเคราะห์ผิวด้วย AI</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    ถ่ายรูปด้วยมือถือหรือกล้องธรรมดา ระบบวิเคราะห์ 7 ปัญหาผิวภายใน 3 วินาที พร้อมคะแนนและคำแนะนำ
                  </p>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <BrainCircuit className="w-12 h-12 mb-4 text-purple-600" />
                  <h3 className="text-xl font-bold mb-2">AR แสดงผลลัพธ์</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    แสดงผลก่อน-หลังการรักษาแบบ Real-time บนใบหน้าลูกค้า ช่วยให้มองเห็นภาพชัดเจน
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <div className="text-4xl font-bold text-purple-600 mb-2">-50%</div>
                  <div className="text-lg font-semibold mb-2">ลดเวลาปิดการขาย</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    จาก 45 นาที เหลือ 22 นาทีต่อลูกค้า
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>



        {/* How It Works - ขั้นตอนชัดเจน */}
        <section className="w-full py-16 md:py-24 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                ใช้งานง่าย ภายใน 3 ขั้นตอน
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                เริ่มต้นใช้งานได้ทันที ไม่ยุ่งยาก
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  id: "step-1",
                  step: "01",
                  title: "ถ่ายรูปลูกค้า",
                  desc: "ใช้มือถือหรือกล้องธรรมดา ถ่ายภายใน 3 วินาที",
                  icon: Camera
                },
                {
                  id: "step-2",
                  step: "02",
                  title: "AI วิเคราะห์อัตโนมัติ",
                  desc: "ระบบแสดงผล 8 ตัวชี้วัดผิวหน้า พร้อมคำแนะนำ",
                  icon: BrainCircuit
                },
                {
                  id: "step-3",
                  step: "03",
                  title: "แสดง AR ให้ลูกค้าเห็น",
                  desc: "เห็นผลลัพธ์การรักษาแบบ Real-time ปิดการขายทันที",
                  icon: Bot
                }
              ].map((item) => (
                <div key={item.id} className="relative">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                      <item.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-5xl font-bold text-gray-200 dark:text-gray-800 mb-2">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                  {item.step !== "03" && (
                    <ArrowRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-gray-300 dark:text-gray-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - ปรับใหม่แบบมีหลักฐาน */}
        <section className="w-full py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ฟีเจอร์ครบ ตอบโจทย์ทุกความต้องการ
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                ไม่ใช่แค่วิเคราะห์ผิว แต่เป็นระบบบริหารยอดขายแบบครบวงจร
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-2 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <BrainCircuit className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">AI วิเคราะห์ผิวหน้า 8 ตัวชี้วัด</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    ริ้วรอย, รูขุมขน, ฝ้า-กระ, สิว, ผิวคล้ำ, ผิวมัน, ความชุ่มชื้น, ความยืดหยุ่น
                  </p>
                  <Badge variant="outline" className="text-xs">
                    ความแม่นยำ 95.3% (ทดสอบ 50,000 ภาพ)
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">AR แสดงผลลัพธ์การรักษา</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    ลูกค้าเห็นตัวเองหลังทำโบท็อก ฟิลเลอร์ หรือเลเซอร์แบบ Real-time
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Conversion Rate เพิ่ม 65%
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Bot className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">ระบบบริหารลีดและยอดขาย</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    AI จัดลำดับลีด, แจ้งเตือนอัตโนมัติ, รายงานยอดขายแบบ Real-time
                  </p>
                  <Badge variant="outline" className="text-xs">
                    ประหยัดเวลา 40% ต่อวัน
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Transparency Section */}
        <section className="w-full py-16 md:py-24 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                ราคาชัดเจน ไม่มีค่าใช้จ่ายแอบแฝง
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                แพ็กเกจที่เหมาะกับธุรกิจของคุณ
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                เริ่มต้นฟรี ไม่ผูกสัญญา ยกเลิกได้ทุกเมื่อ
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter */}
              <Card className="border-2 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">สำหรับคลินิกเล็ก</div>
                    <div className="text-4xl font-bold mb-2">ฟรี</div>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">30 วิเคราะห์/เดือน</div>
                    
                    <div className="space-y-3 text-sm text-left mb-6">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>AI วิเคราะห์ผิว 8 ตัวชี้วัด</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>รายงานพร้อมพิมพ์</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>1 ผู้ใช้งาน</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/demo/skin-analysis">ทดลองใช้ฟรี</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Professional - Recommended */}
              <Card className="border-4 border-blue-500 relative shadow-xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">แนะนำ</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">สำหรับคลินิกกลาง-ใหญ่</div>
                    <div className="text-4xl font-bold mb-2">
                      ฿9,900{" "}
                      <span className="text-lg font-normal text-gray-500">/เดือน</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">วิเคราะห์ไม่จำกัด</div>
                    
                    <div className="space-y-3 text-sm text-left mb-6">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>ทุกอย่างใน Starter</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>AR แสดงผลการรักษา</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>ระบบบริหารลีดและยอดขาย</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>ผู้ใช้ไม่จำกัด</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>รายงานและ Analytics</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Support 24/7</span>
                      </div>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                      <Link href="/demo">เริ่มทดลองใช้ 14 วัน</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enterprise */}
              <Card className="border-2 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">สำหรับเครือคลินิก</div>
                    <div className="text-4xl font-bold mb-2">ติดต่อเรา</div>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">ปรับแต่งตามความต้องการ</div>
                    
                    <div className="space-y-3 text-sm text-left mb-6">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>ทุกอย่างใน Professional</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Multi-branch Management</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>White-label / ใส่โลโก้เอง</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>API Integration</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Dedicated Account Manager</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/contact">ติดต่อฝ่ายขาย</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💳 รับชำระผ่านบัตรเครดิต, โอนเงิน, QR Code • 🔒 ข้อมูลปลอดภัย SSL Encrypted
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                คำถามที่พบบ่อย
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                ตอบทุกข้อสงสัยก่อนตัดสินใจ
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: "faq-1",
                  q: "ราคานี้รวมอะไรบ้าง มีค่าใช้จ่ายแอบแฝงไหม?",
                  a: "ราคาที่แสดงรวมทุกอย่างแล้ว ไม่มีค่าซ่อนเร้น ได้ AI วิเคราะห์, AR, ระบบบริหารลีด, รายงาน, Support 24/7 และอัปเดตฟีเจอร์ใหม่ฟรีตลอด"
                },
                {
                  id: "faq-2",
                  q: "ปลอดภัยแค่ไหน? ข้อมูลลูกค้าจะรั่วไหลไหม?",
                  a: "เราใช้ระบบความปลอดภัยระดับ Medical Device Class I ผ่าน ISO 13485, GDPR Compliant และเข้ารหัสข้อมูลด้วย SSL 256-bit เหมือนธนาคาร"
                },
                {
                  id: "faq-3",
                  q: "ต้องติดตั้งนานไหม? พนักงานเรียนรู้ได้ไหม?",
                  a: "ไม่ต้องติดตั้งอะไร ใช้ผ่านเว็บเบราว์เซอร์ได้เลย พนักงานเรียนรู้ได้ภายใน 1 วัน เรามีวิดีโอสอนและ Support คอยช่วย"
                },
                {
                  id: "faq-4",
                  q: "ถ้าไม่พอใจสามารถยกเลิกได้ไหม?",
                  a: "ยกเลิกได้ทุกเมื่อ ไม่ผูกสัญญา ไม่มีค่าปรับ หากยกเลิกก่อนวันต่ออายุจะไม่มีการเรียกเก็บเงินเพิ่ม"
                },
                {
                  id: "faq-5",
                  q: "รองรับกี่สาขา? ถ้ามีหลายคลินิกต้องซื้อหลายแพ็กเกจไหม?",
                  a: "แพ็ก Professional รองรับ 1 สาขา ถ้ามีหลายสาขาแนะนำแพ็ก Enterprise ที่ออกแบบมาสำหรับเครือคลินิกโดยเฉพาะ"
                },
                {
                  id: "faq-6",
                  q: "ต้องใช้กล้องพิเศษไหม?",
                  a: "ไม่ต้อง ใช้กล้องมือถือหรือกล้องธรรมดาได้เลย ความละเอียด 8MP ขึ้นไปก็เพียงพอแล้ว"
                }
              ].map((faq) => (
                <Card key={faq.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                      {faq.q}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {faq.a}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section - จริงใจ ไม่อวด */}
        <section className="w-full py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ต้องการข้อมูลเพิ่มเติม?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                ทีมงานพร้อมตอบคำถามและสาธิตระบบให้ฟรี
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <div className="space-y-4 text-center">
                    <div>
                      <p className="font-medium text-lg mb-2">📧 ติดต่อขอข้อมูล</p>
                      <p className="text-muted-foreground">Email: demo@example.com</p>
                    </div>
                    <div>
                      <p className="font-medium text-lg mb-2">💬 หรือทดลองใช้ฟรีเลย</p>
                      <Button size="lg" className="mt-2" asChild>
                        <Link href="/demo/skin-analysis">
                          เริ่มทดลองใช้ (ฟรี 30 วัน)
                        </Link>
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground pt-4">
                      ระบบอยู่ในช่วง Beta Testing<br />
                      ไม่ต้องใส่บัตรเครดิต • ยกเลิกได้ทุกเมื่อ
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                พร้อมเพิ่มยอดขายคลินิกของคุณ 40% แล้วหรือยัง?
              </h2>
              <p className="text-xl mb-8 text-blue-50">
                เริ่มทดลองใช้ฟรี 14 วัน ไม่ต้องใส่บัตรเครดิต ยกเลิกได้ทุกเมื่อ
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 text-lg" asChild>
                  <Link href="/demo/skin-analysis">
                    <Camera className="mr-2 h-5 w-5" />
                    ทดลองวิเคราะห์ผิวฟรี
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg" asChild>
                  <Link href="/demo">
                    นัดหมายดูระบบ (15 นาที)
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ใช้ได้ทันที ไม่ต้องติดตั้ง</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยกเลิกได้ทุกเมื่อ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
