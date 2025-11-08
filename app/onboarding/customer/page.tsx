"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Scan, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  X,
  Upload,
  Eye,
  Box,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_STEPS = 4;

export default function CustomerOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: 'ยินดีต้อนรับสู่ AI367 Beauty',
      description: 'แพลตฟอร์มวิเคราะห์ผิวหน้าด้วย AI และจำลองผลการรักษาแบบ AR',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
              <Sparkles className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">เริ่มต้นใช้งาน 3 ขั้นตอน</h3>
            <p className="text-muted-foreground">
              ใช้เวลาเพียง 2-3 นาที เพื่อค้นพบผิวที่สวยงามของคุณ
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Scan className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg text-foreground">1. วิเคราะห์ผิว</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  อัปโหลดรูปภาพและรับการวิเคราะห์ผิวหน้าแบบละเอียด 8 จุด ด้วย AI
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Box className="h-8 w-8 text-emerald-600 mb-2" />
                <CardTitle className="text-lg text-foreground">2. ดู AR Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  จำลองผลการรักษาด้วย AR 3D แบบ 360° เพื่อดูผลลัพธ์ก่อนตัดสินใจ
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle className="text-lg text-foreground">3. จองนัดหมาย</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  เลือกคลินิกที่ต้องการและจองนัดหมายได้ทันที พร้อมรับคำปรึกษาจากผู้เชี่ยวชาญ
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'ขั้นตอนที่ 1: วิเคราะห์ผิว',
      description: 'อัปโหลดรูปภาพเพื่อรับการวิเคราะห์ผิวหน้าด้วย AI แบบละเอียด',
      icon: Scan,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Instructions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Upload className="h-5 w-5" />
                วิธีการถ่ายภาพที่ดี
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">แสงสว่างเพียงพอ</p>
                    <p className="text-sm text-muted-foreground">ควรถ่ายในที่ที่มีแสงธรรมชาติหรือแสงสว่างเพียงพอ</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">หน้าตรง ไม่เอียง</p>
                    <p className="text-sm text-muted-foreground">มองตรงกล้อง ใบหน้าควรอยู่ในกรอบ</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">ผิวสะอาด ไม่แต่งหน้า</p>
                    <p className="text-sm text-muted-foreground">ควรล้างหน้าให้สะอาดก่อนถ่าย เพื่อความแม่นยำ</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <X className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">หลีกเลี่ยงแสงแรง</p>
                    <p className="text-sm text-muted-foreground">ไม่ควรถ่ายกลางแดดจัดหรือใช้แฟลช</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Example Image */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Eye className="h-5 w-5" />
                ตัวอย่างภาพที่ดี
              </h3>
              
              <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2 p-6">
                    <div className="w-40 h-40 mx-auto rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center">
                      <Upload className="h-16 w-16 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-foreground">แสงสว่างเพียงพอ</p>
                    <p className="text-sm font-medium text-foreground">หน้าตรง ระยะใกล้พอดี</p>
                    <p className="text-sm font-medium text-foreground">ไม่แต่งหน้า</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">💡 เคล็ดลับ</p>
                <p className="text-sm text-blue-700">
                  AI จะวิเคราะห์ 8 จุด: ริ้วรอย, ฝ้า-กระ, รูขุมขน, ความชุ่มชื้น, 
                  ความยืดหยุ่น, ผิวหมองคล้ำ, สิว และความเรียบเนียน
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button size="lg" onClick={() => router.push('/analysis')}>
              เริ่มวิเคราะห์เลย
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'ขั้นตอนที่ 2: ดู AR Preview',
      description: 'จำลองผลการรักษาด้วย AR 3D แบบ 360° เพื่อดูผลลัพธ์ล่วงหน้า',
      icon: Box,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Box className="h-5 w-5" />
                ฟีเจอร์ AR Simulator
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="h-5 w-5 text-emerald-600" />
                    <p className="font-medium">3D Face Model</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    หมุนดูใบหน้า 360° ด้วย Face Mesh 468 จุด แบบ Real-time
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <p className="font-medium">จำลองการรักษา</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ดู Before/After ของการรักษาต่างๆ เช่น Botox, Filler, Laser
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <p className="font-medium">ปรับความเข้ม</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ปรับ Intensity 0-100% เพื่อเห็นผลลัพธ์ในระดับต่างๆ
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-emerald-900 mb-2">✨ พิเศษ</p>
                <p className="text-sm text-emerald-700">
                  Premium Members สามารถบันทึกและแชร์ผลลัพธ์ได้ + 
                  เปรียบเทียบหลายการรักษาพร้อมกัน
                </p>
              </div>
            </div>

            {/* Right: Visual Demo */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                การรักษาที่รองรับ
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Botox', desc: 'ลดริ้วรอย', color: 'bg-blue-100' },
                  { name: 'Filler', desc: 'เติมเต็ม', color: 'bg-purple-100' },
                  { name: 'Laser', desc: 'ลบฝ้า-กระ', color: 'bg-pink-100' },
                  { name: 'IPL', desc: 'ผิวกระจ่างใส', color: 'bg-orange-100' },
                  { name: 'RF', desc: 'กระชับผิว', color: 'bg-green-100' },
                  { name: 'HydraFacial', desc: 'ทำความสะอาด', color: 'bg-cyan-100' },
                ].map((treatment, i) => (
                  <div key={i} className={`${treatment.color} p-3 rounded-lg`}>
                    <p className="font-medium text-sm">{treatment.name}</p>
                    <p className="text-xs text-muted-foreground">{treatment.desc}</p>
                  </div>
                ))}
              </div>

              <div className="aspect-video bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Box className="h-16 w-16 mx-auto text-emerald-600 mb-2" />
                  <p className="text-sm font-medium">Interactive 3D Viewer</p>
                  <p className="text-xs text-muted-foreground">Drag to rotate • Pinch to zoom</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button size="lg" onClick={() => router.push('/ar-simulator')}>
              ลองดู AR Simulator
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'ขั้นตอนที่ 3: จองนัดหมาย',
      description: 'เลือกคลินิกและจองนัดหมายเพื่อรับคำปรึกษาจากผู้เชี่ยวชาญ',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Booking Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                ระบบจองนัดหมาย
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600" />
                    <p className="font-medium">เลือกคลินิกใกล้คุณ</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ดูรีวิว ราคา และโปรโมชั่นจากคลินิกต่างๆ
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600" />
                    <p className="font-medium">เลือกวันและเวลา</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ดูปฏิทินว่างและจองเวลาที่สะดวก
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-600" />
                    <p className="font-medium">รับการยืนยัน</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ได้รับอีเมล + แจ้งเตือนก่อนนัดหมาย
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-orange-900 mb-2">🎁 สิทธิพิเศษ</p>
                <p className="text-sm text-orange-700">
                  Premium Members จะได้ส่วนลดพิเศษ 10-20% จากคลินิกพันธมิตร + 
                  Priority Booking
                </p>
              </div>
            </div>

            {/* Right: Next Steps */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                พร้อมเริ่มต้นแล้ว!
              </h3>
              
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">สิ่งที่คุณจะได้รับ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm">วิเคราะห์ผิวแบบละเอียด 8 จุด</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm">AR Simulator ฟรี 3 ครั้ง</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm">เปรียบเทียบผลการรักษา</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm">จองนัดหมายได้ไม่จำกัด</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg">อัปเกรดเป็น Premium?</CardTitle>
                  <CardDescription>รับฟีเจอร์เพิ่มเติม</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">วิเคราะห์ไม่จำกัด + บันทึกประวัติ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Advanced Heatmap + เปรียบเทียบหลายภาพ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">ส่วนลดจากคลินิก 10-20%</span>
                  </div>
                  <Button variant="outline" className="w-full mt-2" onClick={() => router.push('/pricing')}>
                    ดูแพ็กเกจ Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center space-y-4">
            <Button size="lg" onClick={() => router.push('/booking')}>
              จองนัดหมายเลย
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              หรือ <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/dashboard')}>
                ไปที่ Dashboard
              </Button> เพื่อเริ่มใช้งาน
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps.find(s => s.id === currentStep) || steps[0];
  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Getting Started</h1>
            <Button variant="ghost" onClick={handleSkip}>
              ข้ามไป
              <X className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>ขั้นตอนที่ {currentStep} จาก {TOTAL_STEPS}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex justify-center gap-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                step.id === currentStep
                  ? 'border-primary bg-primary text-white scale-110'
                  : step.id < currentStep
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-muted-foreground/20 bg-background text-muted-foreground'
              }`}
            >
              {step.id < currentStep ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`${currentStepData.bgColor} border-2`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm`}>
                    <currentStepData.icon className={`h-6 w-6 ${currentStepData.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-foreground">{currentStepData.title}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">{currentStepData.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {currentStepData.content}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ย้อนกลับ
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <Button onClick={handleNext}>
              ถัดไป
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSkip}>
              เริ่มใช้งาน
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
