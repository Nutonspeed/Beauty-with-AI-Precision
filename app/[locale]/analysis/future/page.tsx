"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Sparkles, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/language-context"

import { LifestyleQuestionnaire } from "@/components/analysis/lifestyle-questionnaire"
import { SkinFuturePrediction } from "@/components/analysis/skin-future-prediction"
import { SkinComparisonTimeline } from "@/components/analysis/skin-comparison-timeline"
import { predictSkinFuture, type SkinAgePrediction, type LifestyleFactors } from "@/lib/ai/skin-age-predictor"

export default function FuturePredictionPage() {
  const { language } = useLanguage()
  const locale = language as 'th' | 'en'
  
  const [step, setStep] = useState<'questionnaire' | 'prediction' | 'history'>('questionnaire')
  const [prediction, setPrediction] = useState<SkinAgePrediction | null>(null)

  // Mock analysis results (in real app, this would come from actual analysis)
  const mockAnalysisResults = {
    wrinkles: 25,
    spots: 30,
    pores: 35,
    texture: 70,
    elasticity: 75,
    uvDamage: 20
  }

  // Mock history records
  const mockRecords = [
    {
      id: '1',
      date: new Date('2024-06-01'),
      imageUrl: '',
      scores: { wrinkles: 35, spots: 40, pores: 45, texture: 60, elasticity: 65, hydration: 55, uvDamage: 30 },
      skinAge: 38,
      overallScore: 62
    },
    {
      id: '2',
      date: new Date('2024-09-01'),
      imageUrl: '',
      scores: { wrinkles: 30, spots: 35, pores: 40, texture: 65, elasticity: 70, hydration: 60, uvDamage: 25 },
      skinAge: 35,
      overallScore: 68
    },
    {
      id: '3',
      date: new Date('2024-12-01'),
      imageUrl: '',
      scores: { wrinkles: 25, spots: 30, pores: 35, texture: 70, elasticity: 75, hydration: 65, uvDamage: 20 },
      skinAge: 32,
      overallScore: 75
    }
  ]

  const handleQuestionnaireComplete = async (data: LifestyleFactors & { age: number }) => {
    // Calculate prediction
    const result = await predictSkinFuture(
      mockAnalysisResults,
      data.age,
      {
        sunExposure: data.sunExposure,
        smoking: data.smoking,
        sleepHours: data.sleepHours,
        stressLevel: data.stressLevel,
        hydrationLevel: data.hydrationLevel,
        diet: data.diet,
        skinCareRoutine: data.skinCareRoutine
      }
    )
    
    setPrediction(result)
    setStep('prediction')
  }

  const t = {
    th: {
      title: "ทำนายสภาพผิวในอนาคต",
      subtitle: "วิเคราะห์แนวโน้มและวางแผนการดูแลผิวของคุณ",
      back: "กลับ",
      tabs: {
        questionnaire: "แบบสอบถาม",
        prediction: "ทำนายอนาคต",
        history: "ประวัติ"
      }
    },
    en: {
      title: "Future Skin Prediction",
      subtitle: "Analyze trends and plan your skincare journey",
      back: "Back",
      tabs: {
        questionnaire: "Questionnaire",
        prediction: "Prediction",
        history: "History"
      }
    }
  }[locale]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <Link href="/analysis" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-primary/80 to-purple-500/80 text-white">
              <Sparkles className="mr-2 h-3 w-3" />
              AI Prediction
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* Tabs */}
          <Tabs value={step} onValueChange={(v) => setStep(v as typeof step)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="questionnaire" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {t.tabs.questionnaire}
              </TabsTrigger>
              <TabsTrigger value="prediction" disabled={!prediction} className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t.tabs.prediction}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t.tabs.history}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questionnaire">
              <LifestyleQuestionnaire 
                onComplete={handleQuestionnaireComplete}
                locale={locale}
              />
            </TabsContent>

            <TabsContent value="prediction">
              {prediction && (
                <SkinFuturePrediction 
                  prediction={prediction}
                  locale={locale}
                />
              )}
            </TabsContent>

            <TabsContent value="history">
              <SkinComparisonTimeline 
                records={mockRecords}
                locale={locale}
              />
            </TabsContent>
          </Tabs>

          {/* Feature Highlights */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            <Card className="text-center p-4">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary mb-1">1-5</div>
                <div className="text-sm text-muted-foreground">
                  {locale === 'th' ? 'ทำนายล่วงหน้า (ปี)' : 'Years Ahead'}
                </div>
              </CardContent>
            </Card>
            <Card className="text-center p-4">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary mb-1">7</div>
                <div className="text-sm text-muted-foreground">
                  {locale === 'th' ? 'ปัจจัยวิเคราะห์' : 'Lifestyle Factors'}
                </div>
              </CardContent>
            </Card>
            <Card className="text-center p-4">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary mb-1">95%</div>
                <div className="text-sm text-muted-foreground">
                  {locale === 'th' ? 'ความแม่นยำ' : 'Accuracy'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
