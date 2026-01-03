'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Upload, 
  Play, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Droplets,
  Sun,
  Heart,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth/context'

export default function SkinAnalysisPage() {
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  useEffect(() => {
    if (authLoading && !user) return
    
    if (!user || (user.role !== 'customer' && user.role !== 'customer_free' && user.role !== 'customer_premium')) {
      setIsLoading(false)
      return
    }

    setIsLoading(false)
  }, [user, authLoading])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalysis = async () => {
    if (!imagePreview) return
    
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResults({
        skinScore: 85,
        conditions: [
          { name: 'Acne', severity: 'mild', confidence: 0.75 },
          { name: 'Dryness', severity: 'moderate', confidence: 0.82 },
          { name: 'Fine Lines', severity: 'minimal', confidence: 0.45 }
        ],
        recommendations: [
          'Use gentle cleanser twice daily',
          'Apply moisturizer with hyaluronic acid',
          'Use sunscreen SPF 30+ daily',
          'Consider weekly hydrating mask'
        ],
        products: [
          { name: 'Gentle Cleanser', brand: 'DermCare', price: 450 },
          { name: 'Hydrating Serum', brand: 'SkinLab', price: 1200 },
          { name: 'SPF 50 Sunscreen', brand: 'SunGuard', price: 650 }
        ]
      })
      setIsAnalyzing(false)
    }, 3000)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Skin Analysis</h1>
          <p className="text-lg text-gray-600">AI-powered skin analysis for personalized recommendations</p>
        </motion.div>

        {!analysisResults ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Start Your Analysis</CardTitle>
                <p className="text-center text-gray-600">Upload a clear photo of your face for accurate analysis</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={imagePreview} 
                        alt="Skin preview" 
                        className="w-full max-w-sm mx-auto rounded-lg"
                      />
                      <Button 
                        onClick={() => setImagePreview(null)}
                        variant="outline"
                        className="w-full"
                      >
                        Choose Different Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto" />
                      <div>
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center space-x-2">
                            <Upload className="w-5 h-5" />
                            <span>Choose Image</span>
                          </span>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis Button */}
                {imagePreview && (
                  <Button 
                    onClick={handleAnalysis}
                    disabled={isAnalyzing}
                    className="w-full text-lg py-6"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Play className="w-5 h-5" />
                        <span>Start Analysis</span>
                      </div>
                    )}
                  </Button>
                )}

                {/* Tips */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Tips for best results:</h4>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• Use good, even lighting</li>
                        <li>• Remove makeup and accessories</li>
                        <li>• Face the camera directly</li>
                        <li>• Keep a neutral expression</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Results Header */}
            <Card>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h2 className="text-2xl font-bold text-green-600">Analysis Complete!</h2>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">{analysisResults.skinScore}/100</div>
                  <p className="text-gray-600">Your Skin Score</p>
                </div>
              </CardHeader>
            </Card>

            {/* Skin Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Skin Conditions Detected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResults.conditions.map((condition: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{condition.name}</h4>
                        <p className="text-sm text-gray-600">Confidence: {Math.round(condition.confidence * 100)}%</p>
                      </div>
                      <Badge variant={condition.severity === 'mild' ? 'default' : condition.severity === 'moderate' ? 'secondary' : 'outline'}>
                        {condition.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResults.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <p className="text-green-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysisResults.products.map((product: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                      <p className="text-lg font-bold text-primary mt-2">฿{product.price}</p>
                      <Button className="w-full mt-3" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button className="flex-1" size="lg">
                Save Analysis
              </Button>
              <Button variant="outline" className="flex-1" size="lg" onClick={() => {
                setAnalysisResults(null)
                setImagePreview(null)
              }}>
                New Analysis
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
