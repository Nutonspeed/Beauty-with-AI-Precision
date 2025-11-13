"use client"

/**
 * Multi-Mode Analysis Demo Page
 * หน้าทดสอบ 8 โหมดการวิเคราะห์ผิว ตามที่ลูกค้าต้องการ
 */

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MultiModeViewer, type AnalysisMode } from '@/components/analysis/multi-mode-viewer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Image, Loader2, AlertCircle } from 'lucide-react'
import { analyzeMultiMode } from '@/lib/api/ai-analysis-service'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Static mock data - แก้ไข hydration mismatch โดยใช้ค่าคงที่แทน Math.random()
const MOCK_DETECTION_DATA = {
  spots: [
    { x: 25.3, y: 32.1, radius: 3.2 },
    { x: 45.7, y: 28.5, radius: 2.8 },
    { x: 62.1, y: 41.3, radius: 3.5 },
    { x: 38.9, y: 55.7, radius: 2.5 },
    { x: 71.2, y: 35.8, radius: 4.1 },
    { x: 29.4, y: 48.2, radius: 2.9 },
    { x: 53.6, y: 62.4, radius: 3.3 },
    { x: 67.8, y: 51.9, radius: 2.7 },
    { x: 41.5, y: 38.6, radius: 3.8 },
    { x: 58.3, y: 44.2, radius: 2.6 },
    { x: 33.7, y: 59.8, radius: 3.1 },
    { x: 76.2, y: 47.3, radius: 2.4 },
    { x: 48.9, y: 71.5, radius: 3.6 },
    { x: 64.1, y: 58.7, radius: 2.8 },
    { x: 27.6, y: 65.2, radius: 3.4 },
    { x: 51.8, y: 33.9, radius: 2.9 },
    { x: 69.4, y: 68.1, radius: 3.2 },
    { x: 35.2, y: 42.7, radius: 2.7 },
    { x: 72.9, y: 54.3, radius: 3.5 },
    { x: 44.6, y: 63.8, radius: 2.5 },
    { x: 59.7, y: 36.4, radius: 3.7 },
    { x: 31.3, y: 52.6, radius: 2.6 },
    { x: 66.5, y: 45.9, radius: 3.3 },
    { x: 42.8, y: 69.2, radius: 2.8 },
    { x: 74.1, y: 41.7, radius: 3.1 },
    { x: 28.9, y: 57.4, radius: 2.4 },
    { x: 55.4, y: 48.8, radius: 3.9 },
    { x: 68.7, y: 61.5, radius: 2.7 },
    { x: 37.2, y: 34.6, radius: 3.4 },
    { x: 61.8, y: 73.2, radius: 2.9 },
    { x: 49.3, y: 39.7, radius: 3.2 },
    { x: 73.6, y: 56.8, radius: 2.5 },
    { x: 34.7, y: 67.3, radius: 3.6 },
    { x: 57.9, y: 43.1, radius: 2.8 },
    { x: 70.2, y: 49.6, radius: 3.3 },
    { x: 26.4, y: 54.9, radius: 2.6 },
    { x: 52.1, y: 70.4, radius: 3.8 },
    { x: 65.8, y: 37.2, radius: 2.4 },
    { x: 39.6, y: 60.7, radius: 3.1 },
    { x: 75.3, y: 64.5, radius: 2.7 },
    { x: 47.4, y: 46.3, radius: 3.5 },
    { x: 63.2, y: 53.8, radius: 2.9 },
    { x: 30.8, y: 40.2, radius: 3.4 },
    { x: 56.7, y: 66.9, radius: 2.5 },
    { x: 69.9, y: 72.6, radius: 3.7 },
    { x: 43.1, y: 50.4, radius: 2.8 },
    { x: 77.5, y: 44.7, radius: 3.2 },
  ],
  wrinkles: [
    { x1: 30.5, y1: 45.2, x2: 38.7, y2: 47.8 },
    { x1: 42.1, y1: 52.6, x2: 51.3, y2: 54.9 },
    { x1: 55.8, y1: 38.4, x2: 63.2, y2: 41.7 },
    { x1: 27.3, y1: 61.5, x2: 35.9, y2: 63.2 },
    { x1: 48.6, y1: 48.9, x2: 56.4, y2: 51.3 },
    { x1: 62.7, y1: 55.8, x2: 70.1, y2: 57.6 },
    { x1: 33.9, y1: 42.3, x2: 41.5, y2: 44.8 },
    { x1: 58.2, y1: 64.7, x2: 66.8, y2: 67.1 },
    { x1: 25.6, y1: 50.2, x2: 33.4, y2: 52.7 },
    { x1: 44.3, y1: 57.9, x2: 52.7, y2: 60.4 },
    { x1: 67.9, y1: 43.6, x2: 75.2, y2: 46.1 },
    { x1: 29.8, y1: 68.3, x2: 37.6, y2: 70.8 },
    { x1: 51.4, y1: 35.7, x2: 59.3, y2: 38.2 },
    { x1: 73.5, y1: 59.4, x2: 81.2, y2: 61.9 },
    { x1: 36.7, y1: 46.8, x2: 44.9, y2: 49.3 },
    { x1: 60.1, y1: 71.2, x2: 68.4, y2: 73.7 },
    { x1: 24.9, y1: 54.6, x2: 32.8, y2: 57.1 },
    { x1: 47.5, y1: 40.3, x2: 55.6, y2: 42.8 },
    { x1: 69.3, y1: 66.7, x2: 77.1, y2: 69.2 },
    { x1: 32.6, y1: 58.9, x2: 40.4, y2: 61.4 },
    { x1: 54.8, y1: 62.5, x2: 62.9, y2: 65.0 },
    { x1: 75.7, y1: 48.1, x2: 83.4, y2: 50.6 },
    { x1: 28.4, y1: 72.8, x2: 36.2, y2: 75.3 },
  ],
  pores: [
    { x: 31.2, y: 37.5, size: 3.4 },
    { x: 46.8, y: 42.9, size: 2.8 },
    { x: 58.3, y: 35.2, size: 3.7 },
    { x: 64.7, y: 49.1, size: 2.5 },
    { x: 39.5, y: 54.6, size: 3.1 },
    { x: 52.1, y: 47.3, size: 2.9 },
    { x: 68.9, y: 41.8, size: 3.5 },
    { x: 73.4, y: 56.2, size: 2.6 },
    { x: 28.7, y: 44.9, size: 3.8 },
    { x: 43.6, y: 61.7, size: 2.7 },
    { x: 55.2, y: 38.4, size: 3.2 },
    { x: 61.8, y: 52.8, size: 2.4 },
    { x: 35.9, y: 48.5, size: 3.6 },
    { x: 49.3, y: 43.2, size: 2.8 },
    { x: 66.4, y: 58.9, size: 3.3 },
    { x: 71.6, y: 45.7, size: 2.5 },
    { x: 26.5, y: 51.3, size: 3.9 },
    { x: 41.7, y: 36.8, size: 2.7 },
    { x: 57.8, y: 63.4, size: 3.1 },
    { x: 63.2, y: 40.6, size: 2.9 },
    { x: 37.4, y: 57.2, size: 3.4 },
    { x: 51.9, y: 50.9, size: 2.6 },
    { x: 69.1, y: 34.5, size: 3.7 },
    { x: 74.8, y: 48.3, size: 2.4 },
    { x: 30.3, y: 42.7, size: 3.5 },
    { x: 45.2, y: 55.1, size: 2.8 },
    { x: 59.6, y: 46.9, size: 3.2 },
    { x: 65.9, y: 62.7, size: 2.5 },
    { x: 33.8, y: 39.3, size: 3.8 },
    { x: 48.7, y: 67.5, size: 2.7 },
    { x: 62.3, y: 53.6, size: 3.1 },
    { x: 67.5, y: 37.9, size: 2.9 },
    { x: 24.6, y: 59.8, size: 3.6 },
    { x: 40.1, y: 45.4, size: 2.6 },
    { x: 56.4, y: 70.2, size: 3.3 },
    { x: 72.7, y: 41.2, size: 2.4 },
    { x: 29.9, y: 65.6, size: 3.7 },
    { x: 44.5, y: 32.8, size: 2.8 },
    { x: 60.7, y: 56.4, size: 3.4 },
    { x: 76.3, y: 49.7, size: 2.5 },
    { x: 32.4, y: 68.9, size: 3.9 },
    { x: 47.8, y: 40.5, size: 2.7 },
    { x: 63.6, y: 73.1, size: 3.2 },
    { x: 69.8, y: 44.8, size: 2.6 },
    { x: 27.1, y: 52.4, size: 3.5 },
    { x: 42.9, y: 58.7, size: 2.8 },
    { x: 58.1, y: 35.6, size: 3.1 },
    { x: 64.3, y: 60.3, size: 2.9 },
    { x: 38.6, y: 47.1, size: 3.6 },
    { x: 53.7, y: 41.9, size: 2.4 },
    { x: 70.4, y: 66.5, size: 3.8 },
    { x: 75.9, y: 53.2, size: 2.7 },
    { x: 31.7, y: 43.6, size: 3.3 },
    { x: 46.3, y: 69.8, size: 2.5 },
    { x: 61.2, y: 38.7, size: 3.7 },
    { x: 77.1, y: 55.9, size: 2.6 },
    { x: 25.8, y: 48.2, size: 3.4 },
    { x: 41.4, y: 64.6, size: 2.8 },
    { x: 57.3, y: 51.7, size: 3.2 },
    { x: 73.2, y: 36.4, size: 2.9 },
    { x: 28.5, y: 71.3, size: 3.5 },
    { x: 44.8, y: 39.8, size: 2.7 },
    { x: 60.9, y: 45.3, size: 3.1 },
    { x: 66.7, y: 68.7, size: 2.4 },
    { x: 34.2, y: 54.8, size: 3.9 },
    { x: 49.6, y: 33.5, size: 2.6 },
    { x: 65.1, y: 57.4, size: 3.6 },
    { x: 71.9, y: 62.9, size: 2.5 },
    { x: 26.3, y: 46.7, size: 3.8 },
    { x: 42.7, y: 72.4, size: 2.8 },
    { x: 58.9, y: 42.1, size: 3.3 },
    { x: 74.5, y: 50.8, size: 2.7 },
    { x: 30.6, y: 58.3, size: 3.4 },
    { x: 45.9, y: 37.2, size: 2.9 },
    { x: 62.8, y: 65.1, size: 3.7 },
    { x: 68.2, y: 52.6, size: 2.4 },
    { x: 23.4, y: 44.3, size: 3.5 },
    { x: 39.7, y: 69.5, size: 2.6 },
    { x: 55.8, y: 56.8, size: 3.2 },
    { x: 72.3, y: 48.9, size: 2.8 },
    { x: 27.8, y: 34.7, size: 3.1 },
    { x: 43.4, y: 61.2, size: 2.5 },
    { x: 59.4, y: 74.6, size: 3.9 },
    { x: 75.6, y: 43.8, size: 2.7 },
    { x: 31.9, y: 50.5, size: 3.6 },
    { x: 48.1, y: 66.3, size: 2.4 },
    { x: 64.6, y: 39.4, size: 3.3 },
    { x: 70.7, y: 57.1, size: 2.9 },
  ],
  redness: [
    { x: 35.4, y: 42.8, width: 8.3, height: 7.5 },
    { x: 52.7, y: 38.6, width: 9.1, height: 8.2 },
    { x: 48.3, y: 55.2, width: 7.8, height: 6.9 },
    { x: 61.9, y: 47.3, width: 8.7, height: 7.4 },
    { x: 29.6, y: 51.7, width: 9.4, height: 8.6 },
    { x: 68.2, y: 59.4, width: 7.2, height: 6.5 },
    { x: 41.8, y: 63.9, width: 8.9, height: 7.8 },
    { x: 56.4, y: 44.1, width: 9.6, height: 8.3 },
    { x: 73.1, y: 36.8, width: 7.5, height: 6.8 },
    { x: 33.7, y: 68.5, width: 8.4, height: 7.6 },
    { x: 65.8, y: 52.6, width: 9.2, height: 8.1 },
    { x: 44.2, y: 49.3, width: 7.9, height: 7.2 },
    { x: 59.6, y: 71.8, width: 8.6, height: 7.7 },
    { x: 26.9, y: 45.7, width: 9.3, height: 8.5 },
    { x: 70.4, y: 64.2, width: 7.6, height: 6.9 },
    { x: 38.5, y: 57.9, width: 8.8, height: 7.3 },
    { x: 54.1, y: 34.5, width: 9.7, height: 8.4 },
    { x: 76.7, y: 48.6, width: 7.4, height: 6.7 },
  ],
}

const INITIAL_ANALYSIS_DATA: AnalysisMode[] = [
  { id: 'spots', name: 'Spots', count: 47, color: 'rgba(255, 255, 0, 0.3)', description: 'จุดด่างดำ' },
  { id: 'wrinkles', name: 'Wrinkles', count: 23, color: 'rgba(0, 255, 0, 0.3)', description: 'รอยย่น' },
  { id: 'texture', name: 'Texture', count: 65, color: 'rgba(255, 200, 100, 0.3)', description: 'พื้นผิว' },
  { id: 'pores', name: 'Pores', count: 89, color: 'rgba(255, 150, 255, 0.3)', description: 'รูขุมขน' },
  { id: 'uv_spots', name: 'UV Spots', count: 31, color: 'rgba(255, 215, 0, 0.5)', description: 'จุดใต้ UV' },
  { id: 'brown_spots', name: 'Brown Spots', count: 42, color: 'rgba(139, 90, 43, 0.4)', description: 'จุดสีน้ำตาล' },
  { id: 'red_areas', name: 'Red Areas', count: 18, color: 'rgba(255, 0, 0, 0.3)', description: 'บริเวณแดง' },
  { id: 'porphyrins', name: 'Porphyrins', count: 12, color: 'rgba(0, 100, 255, 0.4)', description: 'แบคทีเรีย' },
]

export default function MultiModeAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<string>('/test-face.jpg')
  const [analysisData, setAnalysisData] = useState<AnalysisMode[]>(INITIAL_ANALYSIS_DATA)
  const [detectionData, setDetectionData] = useState(MOCK_DETECTION_DATA)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useRealAPI, setUseRealAPI] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Show image preview immediately
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)

    // If real API is enabled, analyze the image
    if (useRealAPI) {
      setIsAnalyzing(true)
      try {
        const result = await analyzeMultiMode(file)
        
        // Update detection data - convert from API format to UI format
        setDetectionData({
          spots: result.spots.detections.map(s => ({ 
            x: s.x + s.width / 2, 
            y: s.y + s.height / 2, 
            radius: Math.max(s.width, s.height) / 2 
          })),
          wrinkles: result.wrinkles.detections.map(w => ({
            x1: w.x,
            y1: w.y,
            x2: w.x + w.width,
            y2: w.y + w.height,
          })),
          pores: result.pores.detections.map(p => ({
            x: p.x + p.width / 2,
            y: p.y + p.height / 2,
            size: Math.max(p.width, p.height),
          })),
          redness: [],
        })

        // Update analysis counts
        setAnalysisData(prev => prev.map(mode => {
          if (mode.id === 'spots') return { ...mode, count: result.spots.statistics.total_count }
          if (mode.id === 'wrinkles') return { ...mode, count: result.wrinkles.statistics.total_count }
          if (mode.id === 'pores') return { ...mode, count: result.pores.statistics.total_count }
          if (mode.id === 'texture') return { ...mode, count: Math.round(result.texture.metrics.overall_score * 100) }
          return mode
        }))

        console.log('✅ Analysis complete:', {
          spots: result.spots.statistics.total_count,
          wrinkles: result.wrinkles.statistics.total_count,
          pores: result.pores.statistics.total_count,
          texture: result.texture.metrics.overall_score,
          overall_score: result.overall_score,
          processing_time: result.processing_time_ms + 'ms'
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to analyze image'
        setError(message)
        console.error('❌ Analysis error:', err)
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-background to-muted/30">
        <div className="container py-12">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Multi-Mode Skin Analysis
              </h1>
              <p className="text-xl text-primary">
                การวิเคราะห์ผิว 8 โหมด
              </p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                ระบบวิเคราะห์ผิวหน้าแบบครบวงจร ด้วย AI และ Computer Vision 
                แสดงผลใน 8 โหมดต่างๆ เพื่อการวิเคราะห์ที่ละเอียดและแม่นยำ
              </p>
            </div>

            {/* Upload Section */}
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Image / อัพโหลดรูปภาพ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* API Toggle */}
                  <div className="flex items-center justify-center gap-3 p-3 bg-muted rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useRealAPI}
                        onChange={(e) => setUseRealAPI(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-medium">
                        🚀 Use Real AI Analysis (Python FastAPI)
                      </span>
                    </label>
                    {!useRealAPI && (
                      <span className="text-xs text-muted-foreground">
                        (Currently using mock data)
                      </span>
                    )}
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Upload Button */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Button 
                      variant="outline" 
                      className="relative"
                      disabled={isAnalyzing}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        aria-label="Upload image file"
                        title="Upload image"
                        disabled={isAnalyzing}
                      />
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Image className="mr-2 h-4 w-4" />
                          Choose Image
                        </>
                      )}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      {isAnalyzing 
                        ? '🔬 AI is analyzing your image...' 
                        : 'หรือใช้ภาพตัวอย่างด้านล่าง'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {analysisData.find(m => m.id === 'spots')?.count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Spots Detected</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analysisData.find(m => m.id === 'wrinkles')?.count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Wrinkles Detected</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {analysisData.find(m => m.id === 'pores')?.count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Pores Detected</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {analysisData.find(m => m.id === 'red_areas')?.count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Red Areas</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Multi-Mode Viewer */}
            <MultiModeViewer
              originalImage={selectedImage}
              modes={analysisData}
              detectionData={detectionData}
            />

            {/* Information */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">🔬 เทคโนโลยีที่ใช้</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Computer Vision:</strong> 6 algorithms สำหรับ spots, pores, wrinkles, texture, color, redness</li>
                  <li>• <strong>AI Analysis:</strong> Hugging Face + Google Vision + Gemini 2.0</li>
                  <li>• <strong>UV Detection:</strong> Spectral analysis สำหรับจุดใต้ผิว</li>
                  <li>• <strong>Porphyrins Detection:</strong> Fluorescence detection สำหรับแบคทีเรีย</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
