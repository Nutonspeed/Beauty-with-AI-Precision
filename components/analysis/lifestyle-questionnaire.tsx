"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { 
  Sun, 
  Moon, 
  Droplets, 
  Activity, 
  Utensils,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { LifestyleFactors } from "@/lib/ai/skin-age-predictor"

interface LifestyleQuestionnaireProps {
  onComplete: (data: LifestyleFactors & { age: number }) => void
  locale?: 'th' | 'en'
  className?: string
}

const translations = {
  th: {
    title: "แบบสอบถามไลฟ์สไตล์",
    subtitle: "ช่วยให้เราทำนายสภาพผิวได้แม่นยำขึ้น",
    age: "อายุของคุณ",
    ageYears: "ปี",
    sunExposure: "คุณโดนแดดบ่อยแค่ไหน?",
    sunLow: "น้อย (อยู่ในร่ม)",
    sunModerate: "ปานกลาง (บางครั้ง)",
    sunHigh: "มาก (กลางแจ้งบ่อย)",
    smoking: "คุณสูบบุหรี่หรือไม่?",
    smokingYes: "สูบ",
    smokingNo: "ไม่สูบ",
    sleep: "คุณนอนวันละกี่ชั่วโมง?",
    sleepHours: "ชั่วโมง/คืน",
    stress: "ระดับความเครียดของคุณ?",
    stressLow: "ต่ำ (สบายๆ)",
    stressModerate: "ปานกลาง",
    stressHigh: "สูง (เครียดมาก)",
    hydration: "คุณดื่มน้ำเพียงพอหรือไม่?",
    hydrationPoor: "น้อย (<4 แก้ว)",
    hydrationAdequate: "พอดี (4-8 แก้ว)",
    hydrationGood: "ดี (>8 แก้ว)",
    diet: "พฤติกรรมการกินของคุณ?",
    dietPoor: "ไม่ดี (อาหารจังก์ฟู้ด)",
    dietAverage: "ปานกลาง",
    dietHealthy: "ดี (ผัก ผลไม้)",
    skincare: "คุณดูแลผิวอย่างไร?",
    skincareNone: "ไม่ดูแล",
    skincareBasic: "พื้นฐาน (ล้างหน้า+มอยส์)",
    skincareComprehensive: "ครบถ้วน (เซรั่ม, กันแดด)",
    next: "ถัดไป",
    back: "กลับ",
    submit: "วิเคราะห์",
    step: "ขั้นตอน"
  },
  en: {
    title: "Lifestyle Questionnaire",
    subtitle: "Help us predict your skin more accurately",
    age: "Your Age",
    ageYears: "years",
    sunExposure: "How often are you exposed to sun?",
    sunLow: "Low (mostly indoors)",
    sunModerate: "Moderate (sometimes)",
    sunHigh: "High (often outdoors)",
    smoking: "Do you smoke?",
    smokingYes: "Yes",
    smokingNo: "No",
    sleep: "How many hours do you sleep?",
    sleepHours: "hours/night",
    stress: "Your stress level?",
    stressLow: "Low (relaxed)",
    stressModerate: "Moderate",
    stressHigh: "High (very stressed)",
    hydration: "Do you drink enough water?",
    hydrationPoor: "Poor (<4 glasses)",
    hydrationAdequate: "Adequate (4-8 glasses)",
    hydrationGood: "Good (>8 glasses)",
    diet: "Your eating habits?",
    dietPoor: "Poor (junk food)",
    dietAverage: "Average",
    dietHealthy: "Healthy (veggies, fruits)",
    skincare: "Your skincare routine?",
    skincareNone: "None",
    skincareBasic: "Basic (cleanser + moisturizer)",
    skincareComprehensive: "Comprehensive (serum, sunscreen)",
    next: "Next",
    back: "Back",
    submit: "Analyze",
    step: "Step"
  }
}

export function LifestyleQuestionnaire({ 
  onComplete, 
  locale = 'th',
  className = ''
}: LifestyleQuestionnaireProps) {
  const t = translations[locale]
  const [step, setStep] = useState(0)
  const [data, setData] = useState<{
    age: number
    sunExposure: 'low' | 'moderate' | 'high'
    smoking: boolean
    sleepHours: number
    stressLevel: 'low' | 'moderate' | 'high'
    hydrationLevel: 'poor' | 'adequate' | 'good'
    diet: 'poor' | 'average' | 'healthy'
    skinCareRoutine: 'none' | 'basic' | 'comprehensive'
  }>({
    age: 30,
    sunExposure: 'moderate',
    smoking: false,
    sleepHours: 7,
    stressLevel: 'moderate',
    hydrationLevel: 'adequate',
    diet: 'average',
    skinCareRoutine: 'basic'
  })

  const steps = [
    // Step 0: Age
    {
      icon: <Activity className="h-6 w-6" />,
      title: t.age,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={data.age}
              onChange={(e) => setData({ ...data, age: parseInt(e.target.value) || 25 })}
              className="w-24 text-center text-2xl font-bold"
              min={15}
              max={80}
            />
            <span className="text-muted-foreground">{t.ageYears}</span>
          </div>
          <Slider
            value={[data.age]}
            onValueChange={([v]) => setData({ ...data, age: v })}
            min={15}
            max={80}
            step={1}
            className="w-full"
          />
        </div>
      )
    },
    // Step 1: Sun Exposure
    {
      icon: <Sun className="h-6 w-6" />,
      title: t.sunExposure,
      content: (
        <RadioGroup
          value={data.sunExposure}
          onValueChange={(v) => setData({ ...data, sunExposure: v as 'low' | 'moderate' | 'high' })}
          className="space-y-3"
        >
          {[
            { value: 'low', label: t.sunLow },
            { value: 'moderate', label: t.sunModerate },
            { value: 'high', label: t.sunHigh }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value={option.value} id={`sun-${option.value}`} />
              <Label htmlFor={`sun-${option.value}`} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
    },
    // Step 2: Sleep
    {
      icon: <Moon className="h-6 w-6" />,
      title: t.sleep,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-4xl font-bold">{data.sleepHours}</span>
            <span className="text-muted-foreground ml-2">{t.sleepHours}</span>
          </div>
          <Slider
            value={[data.sleepHours]}
            onValueChange={([v]) => setData({ ...data, sleepHours: v })}
            min={3}
            max={12}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>3h</span>
            <span className={data.sleepHours >= 7 && data.sleepHours <= 9 ? 'text-emerald-500 font-medium' : ''}>
              7-9h ✓
            </span>
            <span>12h</span>
          </div>
        </div>
      )
    },
    // Step 3: Stress
    {
      icon: <Activity className="h-6 w-6" />,
      title: t.stress,
      content: (
        <RadioGroup
          value={data.stressLevel}
          onValueChange={(v) => setData({ ...data, stressLevel: v as 'low' | 'moderate' | 'high' })}
          className="space-y-3"
        >
          {[
            { value: 'low', label: t.stressLow },
            { value: 'moderate', label: t.stressModerate },
            { value: 'high', label: t.stressHigh }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value={option.value} id={`stress-${option.value}`} />
              <Label htmlFor={`stress-${option.value}`} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
    },
    // Step 4: Hydration
    {
      icon: <Droplets className="h-6 w-6" />,
      title: t.hydration,
      content: (
        <RadioGroup
          value={data.hydrationLevel}
          onValueChange={(v) => setData({ ...data, hydrationLevel: v as 'poor' | 'adequate' | 'good' })}
          className="space-y-3"
        >
          {[
            { value: 'poor', label: t.hydrationPoor },
            { value: 'adequate', label: t.hydrationAdequate },
            { value: 'good', label: t.hydrationGood }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value={option.value} id={`hydration-${option.value}`} />
              <Label htmlFor={`hydration-${option.value}`} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
    },
    // Step 5: Diet
    {
      icon: <Utensils className="h-6 w-6" />,
      title: t.diet,
      content: (
        <RadioGroup
          value={data.diet}
          onValueChange={(v) => setData({ ...data, diet: v as 'poor' | 'average' | 'healthy' })}
          className="space-y-3"
        >
          {[
            { value: 'poor', label: t.dietPoor },
            { value: 'average', label: t.dietAverage },
            { value: 'healthy', label: t.dietHealthy }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value={option.value} id={`diet-${option.value}`} />
              <Label htmlFor={`diet-${option.value}`} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
    },
    // Step 6: Skincare
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: t.skincare,
      content: (
        <RadioGroup
          value={data.skinCareRoutine}
          onValueChange={(v) => setData({ ...data, skinCareRoutine: v as 'none' | 'basic' | 'comprehensive' })}
          className="space-y-3"
        >
          {[
            { value: 'none', label: t.skincareNone },
            { value: 'basic', label: t.skincareBasic },
            { value: 'comprehensive', label: t.skincareComprehensive }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value={option.value} id={`skincare-${option.value}`} />
              <Label htmlFor={`skincare-${option.value}`} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
    }
  ]

  const handleSubmit = () => {
    onComplete({
      age: data.age,
      sunExposure: data.sunExposure,
      smoking: data.smoking,
      sleepHours: data.sleepHours,
      stressLevel: data.stressLevel,
      hydrationLevel: data.hydrationLevel,
      diet: data.diet,
      skinCareRoutine: data.skinCareRoutine
    })
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        
        {/* Progress */}
        <div className="flex justify-center gap-1 mt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t.step} {step + 1} / {steps.length}
        </p>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Question Icon & Title */}
            <div className="flex items-center gap-3 text-primary">
              {steps[step].icon}
              <h3 className="text-lg font-medium">{steps[step].title}</h3>
            </div>

            {/* Question Content */}
            {steps[step].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t.back}
          </Button>

          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)}>
              {t.next}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-primary">
              <Sparkles className="h-4 w-4 mr-2" />
              {t.submit}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
