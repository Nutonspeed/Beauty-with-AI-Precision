"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TreatmentSimulator } from "@/components/ar/treatment-simulator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { useLanguage } from "@/lib/i18n/language-context"

export default function ARSimulatorPage() {
  const { language } = useLanguage()
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
            {language === "th" ? "กลับไปวิเคราะห์ผิว" : "Back to Analysis"}
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-primary/10 text-primary">
              <Sparkles className="mr-2 h-3 w-3" />
              {language === "th" ? "AR Treatment Simulator" : "AR Treatment Simulator"}
            </Badge>
            <h1 className="text-3xl font-bold mb-4">
              {language === "th" ? "จำลองผลลัพธ์การรักษา" : "Treatment Result Simulator"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "th" 
                ? "อัพโหลดรูปภาพของคุณและดูผลลัพธ์การรักษาแบบ Real-time ด้วยเทคโนโลยี AR"
                : "Upload your photo and see treatment results in real-time with AR technology"}
            </p>
          </div>

          {/* Content */}
          {!uploadedImage ? (
            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center">
                  {language === "th" ? "อัพโหลดรูปภาพ" : "Upload Image"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    {language === "th" ? "คลิกเพื่ออัพโหลด" : "Click to upload"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "th" ? "รองรับ JPG, PNG (สูงสุด 10MB)" : "Supports JPG, PNG (max 10MB)"}
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
                    {language === "th" ? "หรือใช้รูปตัวอย่าง" : "Or use sample image"}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setUploadedImage("/images/samples/face-sample.jpg")}
                  >
                    {language === "th" ? "ใช้รูปตัวอย่าง" : "Use Sample Image"}
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
                  {language === "th" ? "อัพโหลดรูปใหม่" : "Upload New Image"}
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
