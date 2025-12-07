"use client"

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel
export const dynamic = "force-dynamic"
export const revalidate = 0

import { AIErrorBoundary } from "@/components/error-boundary"
import { AnalysisTutorialWrapper } from "@/components/tutorial/analysis-tutorial-wrapper"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { LightingQualityChecker } from "@/components/lighting-quality-checker"
import { AnalysisInteractionPanel } from "@/components/analysis-interaction-panel"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Lightbulb } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { GradientSpinner } from "@/components/ui/modern-loader"

function AnalysisContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <GradientSpinner size="lg" className="mx-auto mb-6" />
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground"
            >
              กำลังโหลด...
            </motion.p>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Tutorial Wrapper */}
      <AnalysisTutorialWrapper />

      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                AI Skin Analysis
                <br />
                <span className="text-primary">วิเคราะห์ผิวหน้าด้วย AI</span>
              </h1>
              <p className="text-balance text-muted-foreground leading-relaxed">
                Upload a photo or take a selfie to get instant skin analysis
                <br />
                อัปโหลดรูปภาพหรือถ่ายเซลฟี่เพื่อรับการวิเคราะห์ผิวหน้าทันที
              </p>
            </div>

            {!isLoggedIn && (
              <Alert className="mb-6 bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Free Analysis Mode</strong> - You can analyze your skin without logging in, but results
                  won&apos;t be saved.{" "}
                  <Link href="/auth/login" className="underline font-medium">
                    Login
                  </Link>{" "}
                  to save your analysis history.
                  <br />
                  <span className="text-sm">
                    <strong>โหมดทดลองฟรี</strong> - คุณสามารถวิเคราะห์ผิวได้โดยไม่ต้องล็อกอิน แต่ผลการวิเคราะห์จะไม่ถูกบันทึก{" "}
                    <Link href="/auth/login" className="underline font-medium">
                      ล็อกอิน
                    </Link>{" "}
                    เพื่อบันทึกประวัติการวิเคราะห์
                  </span>
                </AlertDescription>
              </Alert>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4" data-tour="photo-tips">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Camera Positioning / การจัดตำแหน่งกล้อง
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Face directly at camera / หันหน้าเข้าหากล้องโดยตรง</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Keep 30-50cm distance / ระยะห่าง 30-50 ซม.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Neutral expression / สีหน้าเป็นกลาง</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">○</span>
                    <span>Remove glasses if possible / ถอดแว่นถ้าเป็นไปได้</span>
                  </li>
                </ul>
              </div>

              <LightingQualityChecker />
            </div>

            <AnalysisInteractionPanel isLoggedIn={isLoggedIn} />

            <div className="mt-12 rounded-lg border border-border bg-muted/30 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Lightbulb className="h-5 w-5 text-primary" />
                Tips for Best Results / เคล็ดลับสำหรับผลลัพธ์ที่ดีที่สุด
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span>Use good lighting - natural daylight is best / ใช้แสงสว่างที่ดี แสงธรรมชาติดีที่สุด</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span>Face the camera directly / หันหน้าเข้าหากล้องโดยตรง</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span>Remove makeup for accurate analysis / ล้างเครื่องสำอางออกเพื่อความแม่นยำ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span>Keep hair away from face / เก็บผมให้พ้นจากใบหน้า</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span>Use a neutral expression / ใช้สีหน้าเป็นกลาง</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span className="font-medium text-primary">
                    Follow the positioning guide above for best accuracy / ปฏิบัติตามคำแนะนำด้านบนเพื่อความแม่นยำสูงสุด
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function AnalysisPage() {
  return (
    <AIErrorBoundary>
      <AnalysisContent />
    </AIErrorBoundary>
  )
}
