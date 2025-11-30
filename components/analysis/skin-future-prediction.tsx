"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2,
  Sun,
  Moon,
  Droplets,
  Activity,
  Sparkles
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { SkinAgePrediction, YearlyPrediction } from "@/lib/ai/skin-age-predictor"

interface SkinFuturePredictionProps {
  prediction: SkinAgePrediction
  locale?: 'th' | 'en'
  className?: string
}

const translations = {
  th: {
    title: "ทำนายสภาพผิวในอนาคต",
    subtitle: "วิเคราะห์แนวโน้มการเปลี่ยนแปลงของผิวใน 1-5 ปี",
    currentSkinAge: "อายุผิวปัจจุบัน",
    biologicalAge: "อายุจริง",
    skinAgeGap: "ส่วนต่าง",
    yearsOlder: "ปี (ผิวแก่กว่าจริง)",
    yearsYounger: "ปี (ผิวอ่อนกว่าจริง)",
    year: "ปี",
    year1: "1 ปีข้างหน้า",
    year3: "3 ปีข้างหน้า", 
    year5: "5 ปีข้างหน้า",
    predictedAge: "อายุผิวที่คาดการณ์",
    riskLevel: "ระดับความเสี่ยง",
    low: "ต่ำ",
    moderate: "ปานกลาง",
    high: "สูง",
    concerns: "ปัญหาที่คาดว่าจะเกิด",
    wrinkles: "ริ้วรอย",
    spots: "จุดด่างดำ",
    pores: "รูขุมขน",
    elasticity: "ความยืดหยุ่น",
    hydration: "ความชุ่มชื้น",
    uvDamage: "ความเสียหายจาก UV",
    agingFactors: "ปัจจัยที่ทำให้ผิวแก่",
    recommendations: "คำแนะนำส่วนตัว",
    preventionTips: "วิธีป้องกัน",
    impact: "ผลกระทบ"
  },
  en: {
    title: "Future Skin Prediction",
    subtitle: "Analyze skin changes over 1-5 years",
    currentSkinAge: "Current Skin Age",
    biologicalAge: "Biological Age",
    skinAgeGap: "Gap",
    yearsOlder: "years (skin older than actual)",
    yearsYounger: "years (skin younger than actual)",
    year: "Year",
    year1: "In 1 Year",
    year3: "In 3 Years",
    year5: "In 5 Years",
    predictedAge: "Predicted Skin Age",
    riskLevel: "Risk Level",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    concerns: "Predicted Concerns",
    wrinkles: "Wrinkles",
    spots: "Dark Spots",
    pores: "Pores",
    elasticity: "Elasticity",
    hydration: "Hydration",
    uvDamage: "UV Damage",
    agingFactors: "Aging Factors",
    recommendations: "Personalized Recommendations",
    preventionTips: "Prevention Tips",
    impact: "Impact"
  }
}

export function SkinFuturePrediction({ 
  prediction, 
  locale = 'th',
  className = ''
}: SkinFuturePredictionProps) {
  const t = translations[locale]
  const [selectedYear, setSelectedYear] = useState<'year1' | 'year3' | 'year5'>('year1')

  const yearPrediction = prediction.futureCondition[selectedYear]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-emerald-500 bg-emerald-500/10'
      case 'moderate': return 'text-amber-500 bg-amber-500/10'
      case 'high': return 'text-red-500 bg-red-500/10'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  const getConcernIcon = (concern: string) => {
    switch (concern) {
      case 'wrinkles': return <Activity className="h-4 w-4" />
      case 'spots': return <Sun className="h-4 w-4" />
      case 'pores': return <Droplets className="h-4 w-4" />
      case 'elasticity': return <Sparkles className="h-4 w-4" />
      case 'hydration': return <Droplets className="h-4 w-4" />
      case 'uvDamage': return <Sun className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Skin Age Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">
                {prediction.currentSkinAge}
              </div>
              <div className="text-sm text-muted-foreground">{t.currentSkinAge}</div>
            </div>
            <div>
              <div className="text-4xl font-bold">
                {prediction.biologicalAge}
              </div>
              <div className="text-sm text-muted-foreground">{t.biologicalAge}</div>
            </div>
            <div>
              <div className={`text-4xl font-bold ${prediction.skinAgeGap > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {prediction.skinAgeGap > 0 ? '+' : ''}{prediction.skinAgeGap}
              </div>
              <div className="text-sm text-muted-foreground">
                {prediction.skinAgeGap > 0 ? t.yearsOlder : t.yearsYounger}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Timeline Tabs */}
      <Tabs value={selectedYear} onValueChange={(v) => setSelectedYear(v as typeof selectedYear)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="year1" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t.year1}
          </TabsTrigger>
          <TabsTrigger value="year3" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t.year3}
          </TabsTrigger>
          <TabsTrigger value="year5" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t.year5}
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedYear}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value={selectedYear} className="mt-4 space-y-4">
              {/* Predicted Age & Risk */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">{t.predictedAge}</div>
                      <div className="text-3xl font-bold">
                        {yearPrediction.estimatedSkinAge} {t.year}
                      </div>
                    </div>
                    <Badge className={getRiskColor(yearPrediction.riskLevel)}>
                      {yearPrediction.riskLevel === 'low' && <CheckCircle2 className="h-4 w-4 mr-1" />}
                      {yearPrediction.riskLevel === 'moderate' && <AlertTriangle className="h-4 w-4 mr-1" />}
                      {yearPrediction.riskLevel === 'high' && <AlertTriangle className="h-4 w-4 mr-1" />}
                      {t.riskLevel}: {t[yearPrediction.riskLevel as keyof typeof t]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Predicted Concerns */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.concerns}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(yearPrediction.predictedConcerns).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {getConcernIcon(key)}
                          {t[key as keyof typeof t] || key}
                        </span>
                        <span className={value > 60 ? 'text-red-500' : value > 40 ? 'text-amber-500' : 'text-emerald-500'}>
                          {Math.round(value)}%
                        </span>
                      </div>
                      <Progress 
                        value={value} 
                        className={`h-2 ${value > 60 ? '[&>div]:bg-red-500' : value > 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Prevention Tips */}
              {yearPrediction.preventionTips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t.preventionTips}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {yearPrediction.preventionTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Aging Factors */}
      {prediction.agingFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              {t.agingFactors}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prediction.agingFactors.map((factor, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{factor.factor}</span>
                      <Badge variant={getImpactColor(factor.impact) as "default" | "secondary" | "destructive" | "outline"}>
                        {factor.impact} {t.impact}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({factor.contribution}%)
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{factor.description}</p>
                    <p className="text-sm text-primary">{factor.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            {t.recommendations}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {prediction.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
