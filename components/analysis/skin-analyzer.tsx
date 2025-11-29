"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Upload, Loader2 } from 'lucide-react'
import { useMediaPipeFaceDetection } from '@/lib/ai/mediapipe'
import { skinAnalysisModel, SkinAnalysisResult } from '@/lib/ai/tensorflow'
import { generateTreatmentRecommendation } from '@/lib/ai/openai'

export default function SkinAnalyzerComponent() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null)
  const [treatmentRecommendations, setTreatmentRecommendations] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { videoRef, canvasRef, isLoading, detectionResults, startCamera } = useMediaPipeFaceDetection()

  const analyzeImage = useCallback(async (imageSource: HTMLImageElement | HTMLVideoElement) => {
    setIsAnalyzing(true)
    setError('')
    
    try {
      // Convert video/image to image element for analysis
      const imageElement = document.createElement('img')
      
      if (imageSource instanceof HTMLVideoElement) {
        // Capture frame from video
        const canvas = document.createElement('canvas')
        canvas.width = imageSource.videoWidth
        canvas.height = imageSource.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(imageSource, 0, 0)
          imageElement.src = canvas.toDataURL()
        }
      } else {
        imageElement.src = imageSource.src
      }

      // Wait for image to load
      await new Promise((resolve) => {
        imageElement.onload = resolve
      })

      // Perform skin analysis
      const result = await skinAnalysisModel.analyzeImage(imageElement)
      setAnalysisResult(result)

      // Generate treatment recommendations
      const recommendations = await generateTreatmentRecommendation(result, {
        age: 30,
        gender: 'female',
        concerns: [result.primaryConcern]
      })
      setTreatmentRecommendations(recommendations || '')

    } catch (error) {
      console.error('Analysis error:', error)
      setError('Failed to analyze skin. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageElement = document.createElement('img')
        imageElement.src = e.target?.result as string
        imageElement.onload = () => analyzeImage(imageElement)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    if (videoRef.current && detectionResults) {
      analyzeImage(videoRef.current)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Skin Analysis</CardTitle>
          <CardDescription>
            Upload a photo or use your camera for instant skin analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  disabled={isAnalyzing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
              </div>

              {/* Camera Section */}
              <div className="space-y-2">
                <Button
                  onClick={startCamera}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading || isAnalyzing}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {isLoading ? 'Loading Camera...' : 'Start Camera'}
                </Button>
                
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="hidden"
                    autoPlay
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    className="w-full h-64 bg-gray-100 rounded-lg"
                    width={640}
                    height={480}
                  />
                </div>

                {detectionResults && (
                  <Button
                    onClick={handleCameraCapture}
                    className="w-full"
                    disabled={isAnalyzing}
                  >
                    Analyze Current Frame
                  </Button>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing skin...</span>
                  </div>
                  <Progress value={66} />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {analysisResult && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Analysis Results</h3>
                    <div className="space-y-2">
                      <p><strong>Primary Concern:</strong> {analysisResult.primaryConcern}</p>
                      <p><strong>Confidence:</strong> {(analysisResult.confidence * 100).toFixed(1)}%</p>
                      
                      <div className="space-y-1">
                        <p className="font-medium">All Scores:</p>
                        {Object.entries(analysisResult.scores).map(([concern, score]) => (
                          <div key={concern} className="flex justify-between">
                            <span className="capitalize">{concern.replace('_', ' ')}:</span>
                            <span>{(score * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {treatmentRecommendations && (
                    <div>
                      <h3 className="font-semibold mb-2">Treatment Recommendations</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{treatmentRecommendations}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
