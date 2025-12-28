"use client"

// Build-time guard: render dynamically to avoid heavy prerendering on Vercel
export const dynamic = "force-dynamic"
export const revalidate = 0

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TreatmentSimulator } from "@/components/ar/treatment-simulator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { useTranslations, useLocale } from "next-intl"

export default function ARSimulatorPage() {
  const t = useTranslations()
  const locale = useLocale()
  const language = locale as 'th' | 'en'
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Back Button */}
          <Link href="/analysis" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            {t('arSimulator.backToAnalysis')}
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-primary/10 text-primary">
              <Sparkles className="mr-2 h-3 w-3" />
              {t('arSimulator.badge')}
            </Badge>
            <h1 className="text-3xl font-bold mb-4">
              {t('arSimulator.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('arSimulator.description')}
            </p>
          </div>

          {/* Content */}
          {!uploadedImage ? (
            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center">
                  {t('arSimulator.uploadImage')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    {t('arSimulator.clickToUpload')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('arSimulator.supports')}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('arSimulator.orUseSample')}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setUploadedImage("/images/samples/face-sample.jpg")}
                  >
                    {t('arSimulator.useSampleImage')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-4xl mx-auto">
              <TreatmentSimulator 
                beforeImage={uploadedImage}
                locale={language}
onExport={(image) => {
                  // Download exported image
                  const link = document.createElement('a')
                  link.download = 'treatment-simulation.png'
                  // Handle both Blob and string types
                  if (image instanceof Blob) {
                    link.href = URL.createObjectURL(image)
                  } else {
                    link.href = image
                  }
                  link.click()
                }}
              />
              
              <div className="mt-6 text-center">
                <Button 
                  variant="outline"
                  onClick={() => setUploadedImage(null)}
                >
                  {t('arSimulator.uploadNewImage')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
