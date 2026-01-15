'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Upload, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Gift,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth/context'
import { useTranslations } from 'next-intl'

interface CreditInfo {
  has_credits: boolean
  remaining: number
  total_credits: number
  total_used: number
}

export default function SkinAnalysisPage() {
  const t = useTranslations('customerAnalysis')
  const navT = useTranslations('nav')
  const commonT = useTranslations('common')
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null)
  const [creditLoading, setCreditLoading] = useState(true)

  // Check customer credits
  useEffect(() => {
    async function checkCredits() {
      if (!user) return
      setCreditLoading(true)
      try {
        const response = await fetch('/api/credits/check?type=analysis')
        const data = await response.json()
        if (data.success) {
          setCreditInfo(data)
        }
      } catch (error) {
        console.error('Error checking credits:', error)
      } finally {
        setCreditLoading(false)
      }
    }
    
    if (user) {
      checkCredits()
    }
  }, [user])

  useEffect(() => {
    if (authLoading && !user) return
    
    if (!user || (!user.role?.startsWith('customer') && user.role !== 'public')) {
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
    
    // Check if customer has credits
    if (!creditInfo?.has_credits) {
      alert(t('credits.noCreditsAlert'))
      return
    }
    
    setIsAnalyzing(true)
    
    // Use credit before analysis
    try {
      const creditResponse = await fetch('/api/credits/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'analysis' })
      })
      const creditResult = await creditResponse.json()
      
      if (!creditResult.success) {
        alert(creditResult.message || t('credits.useFailedAlert'))
        setIsAnalyzing(false)
        return
      }
      
      // Update credit info
      setCreditInfo(prev => prev ? {
        ...prev,
        remaining: creditResult.credits_remaining,
        total_used: prev.total_used + 1
      } : null)
    } catch (error) {
      console.error('Error using credit:', error)
      setIsAnalyzing(false)
      return
    }
    
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{navT('analysis')}</h1>
          <p className="text-lg text-gray-600">{t('flow.startDesc')}</p>
          
          {/* Credit Status */}
          {!creditLoading && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border">
              <Gift className={`h-5 w-5 ${creditInfo?.has_credits ? 'text-green-600' : 'text-red-500'}`} />
              <span className="text-sm font-medium">
                {creditInfo?.has_credits 
                  ? t('credits.remaining', { count: creditInfo.remaining })
                  : t('credits.none')}
              </span>
            </div>
          )}
          {creditLoading && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm">{t('credits.checking')}</span>
            </div>
          )}
        </motion.div>

        {!analysisResults ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t('flow.startTitle')}</CardTitle>
                <p className="text-center text-gray-600">{t('flow.startDesc')}</p>
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
                        {t('flow.differentImage')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto" />
                      <div>
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center space-x-2">
                            <Upload className="w-5 h-5" />
                            <span>{t('flow.chooseImage')}</span>
                          </span>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">{t('flow.dragDrop')}</p>
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
                        <span>{t('flow.analyzing')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Play className="w-5 h-5" />
                        <span>{t('flow.startBtn')}</span>
                      </div>
                    )}
                  </Button>
                )}

                {/* Tips */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">{t('flow.tips.title')}</h4>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        {(t.raw('flow.tips.list') as string[]).map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
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
                  <h2 className="text-2xl font-bold text-green-600">{t('results.complete')}</h2>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">{analysisResults.skinScore}/100</div>
                  <p className="text-gray-600">{t('results.yourScore')}</p>
                </div>
              </CardHeader>
            </Card>

            {/* Skin Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('results.conditionsTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResults.conditions.map((condition: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{condition.name}</h4>
                        <p className="text-sm text-gray-600">{t('results.confidence')}: {Math.round(condition.confidence * 100)}%</p>
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
                <CardTitle>{t('results.personalizedRecommendations')}</CardTitle>
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
                <CardTitle>{t('results.productsTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysisResults.products.map((product: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                      <p className="text-lg font-bold text-primary mt-2">฿{product.price}</p>
                      <Button className="w-full mt-3" size="sm">
                        {t('results.viewDetails')}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button className="flex-1" size="lg">
                {commonT('save')} {navT('analysis')}
              </Button>
              <Button variant="outline" className="flex-1" size="lg" onClick={() => {
                setAnalysisResults(null)
                setImagePreview(null)
              }}>
                {t('results.newBtn')}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
