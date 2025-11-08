"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  Clock, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  Shield
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface ShareReportViewProps {
  analysis: any
  clinic: any
  salesStaff: any
  remainingDays: number | null
}

export function ShareReportView({ 
  analysis, 
  clinic, 
  salesStaff,
  remainingDays 
}: ShareReportViewProps) {
  const [imageError, setImageError] = useState(false)

  // Parse AI results
  const aiResults = analysis.ai_results || {}
  const overallScore = aiResults.overall_score || 0
  const skinConditions = aiResults.skin_conditions || []
  const recommendations = aiResults.recommendations || []
  const heatmapUrl = analysis.heatmap_image_url

  // Determine overall health status
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-600", icon: CheckCircle2 }
    if (score >= 60) return { label: "Good", color: "text-blue-600", icon: Info }
    if (score >= 40) return { label: "Fair", color: "text-yellow-600", icon: AlertCircle }
    return { label: "Needs Attention", color: "text-red-600", icon: AlertCircle }
  }

  const healthStatus = getHealthStatus(overallScore)
  const StatusIcon = healthStatus.icon

  // Get brand color or use default
  const brandColor = clinic.brand_color || "#667eea"

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Clinic Header */}
      <div 
        className="rounded-xl p-8 mb-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${brandColor} 0%, #764ba2 100%)`
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {clinic.logo_url && (
              <div className="bg-white rounded-lg p-2">
                <Image
                  src={clinic.logo_url}
                  alt={clinic.name}
                  width={60}
                  height={60}
                  className="rounded"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-1">{clinic.name}</h1>
              <p className="text-white/90 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                AI-Powered Skin Analysis Report
              </p>
            </div>
          </div>

          {remainingDays !== null && (
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Clock className="mr-1 h-3 w-3" />
              Expires in {remainingDays} {remainingDays === 1 ? 'day' : 'days'}
            </Badge>
          )}
        </div>
      </div>

      {/* Overall Score */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Overall Skin Health Score</CardTitle>
          <CardDescription>Based on comprehensive AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={brandColor}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - overallScore / 100)}`}
                  className="transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{overallScore}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${healthStatus.color}`} />
              <span className={`text-lg font-semibold ${healthStatus.color}`}>
                {healthStatus.label}
              </span>
            </div>

            <p className="text-center text-muted-foreground max-w-md">
              Your skin analysis reveals detailed insights about your skin condition and personalized recommendations for optimal skin health.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Visualization */}
      {heatmapUrl && !imageError && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Analysis Heatmap
            </CardTitle>
            <CardDescription>
              Visual representation of detected skin conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden">
              <Image
                src={heatmapUrl}
                alt="Skin Analysis Heatmap"
                fill
                className="object-contain"
                onError={() => setImageError(true)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skin Conditions */}
      {skinConditions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detected Skin Conditions</CardTitle>
            <CardDescription>
              AI-detected conditions with confidence levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skinConditions.map((condition: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{condition.name || condition.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {condition.description}
                      </p>
                    </div>
                    <Badge 
                      variant={condition.severity === 'high' ? 'destructive' : 
                              condition.severity === 'medium' ? 'default' : 'secondary'}
                    >
                      {condition.severity || 'Low'}
                    </Badge>
                  </div>
                  
                  {condition.confidence && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">{Math.round(condition.confidence * 100)}%</span>
                      </div>
                      <Progress value={condition.confidence * 100} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              Personalized Recommendations
            </CardTitle>
            <CardDescription>
              Expert advice for improving your skin health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec: any, index: number) => (
                <div 
                  key={index}
                  className="flex gap-3 p-4 rounded-lg border bg-muted/50"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{rec.title || rec.category}</h4>
                    <p className="text-sm text-muted-foreground">{rec.description || rec.recommendation}</p>
                    
                    {rec.products && rec.products.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rec.products.map((product: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Alert className="mb-8">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This report is private and confidential. It has been shared securely with you by {clinic.name}. 
          {remainingDays !== null && ` This link will expire in ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}.`}
        </AlertDescription>
      </Alert>

      <Separator className="my-8" />

      {/* Clinic Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact {clinic.name}</CardTitle>
          <CardDescription>
            Have questions? Get in touch with us
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clinic.contact_phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${clinic.contact_phone}`}
                  className="hover:underline"
                >
                  {clinic.contact_phone}
                </a>
              </div>
            )}

            {clinic.contact_email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${clinic.contact_email}`}
                  className="hover:underline"
                >
                  {clinic.contact_email}
                </a>
              </div>
            )}

            {clinic.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{clinic.address}</span>
              </div>
            )}

            {salesStaff && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Report prepared by: <span className="font-medium">{salesStaff.full_name}</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Powered by AI Beauty Platform</p>
        <p className="mt-1">© {new Date().getFullYear()} {clinic.name}. All rights reserved.</p>
      </div>
    </div>
  )
}
