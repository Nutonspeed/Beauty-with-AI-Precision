// Skin Analysis Component
'use client';

import { useState, useRef } from 'react';
import { useSkinAnalysis } from '@/hooks/useAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Camera, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import Image from 'next/image';

export default function SkinAnalysisComponent() {
  const { analyzeImage, loading, error, result } = useSkinAnalysis();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze image
    await analyzeImage(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'mild':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">AI Skin Analysis</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload a clear photo of your skin to receive a comprehensive analysis with personalized recommendations
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Photo</CardTitle>
          <CardDescription>
            For best results, use a clear, well-lit photo of your face
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload skin photo"
              />
              
              {imagePreview ? (
                <div className="relative w-full max-w-md">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={400}
                    height={400}
                    className="rounded-lg object-cover"
                  />
                  <Button
                    onClick={handleUploadClick}
                    variant="outline"
                    className="mt-4 w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Different Photo
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <Button onClick={handleUploadClick} size="lg">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supports: JPG, PNG, HEIC (max 10MB)
                  </p>
                </div>
              )}
            </div>

            {loading && (
              <div className="text-center py-4">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                <p className="mt-2 text-sm text-gray-600">Analyzing your skin...</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Overall Health Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Skin Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Health Score</span>
                  <span className={`text-2xl font-bold ${getHealthScoreColor(result.overallSkinHealth)}`}>
                    {result.overallSkinHealth}/100
                  </span>
                </div>
                <Progress value={result.overallSkinHealth} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Skin Type & Concerns */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skin Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-lg py-2 px-4">
                    {result.skinType}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skin Concerns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.skinConcerns.map((concern, index) => (
                    <Badge key={index} variant="secondary">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detected Conditions */}
          {result.detectedConditions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Conditions</CardTitle>
                <CardDescription>
                  AI has identified the following skin conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.detectedConditions.map((condition, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{condition.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{condition.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getSeverityColor(condition.severity)}>
                            {condition.severity}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(condition.confidence)}% confidence
                          </Badge>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Symptoms</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {condition.symptoms.slice(0, 3).map((symptom, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{symptom}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Causes</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {condition.causes.slice(0, 3).map((cause, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{cause}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Treatments</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {condition.treatments.slice(0, 3).map((treatment, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{treatment}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {condition.whenToSeeDermatologist && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            <strong>When to see a dermatologist:</strong> {condition.whenToSeeDermatologist}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Image Quality Info */}
          <Card>
            <CardHeader>
              <CardTitle>Image Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="text-lg font-semibold">{result.imageQuality.score}/100</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lighting</p>
                  <p className="text-lg font-semibold capitalize">{result.imageQuality.lighting}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resolution</p>
                  <p className="text-lg font-semibold capitalize">{result.imageQuality.resolution}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clarity</p>
                  <p className="text-lg font-semibold capitalize">{result.imageQuality.clarity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Disclaimer */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. 
              Please consult a licensed dermatologist for proper diagnosis and treatment.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
