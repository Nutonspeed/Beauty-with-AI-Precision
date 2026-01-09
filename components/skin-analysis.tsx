// Skin Analysis Component
'use client';

import { useState, useRef } from 'react';
import { useSkinAnalysis } from '@/hooks/useAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Camera, AlertCircle, CheckCircle2, Info, Sparkles, Brain } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function SkinAnalysisComponent() {
  const { analyzeImage, isProcessing, error, result } = useSkinAnalysis();
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* Header - Professional AI Branding */}
      <div className="text-center space-y-4 py-8">
        <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary bg-primary/5 rounded-full uppercase tracking-widest text-[10px] font-bold">
          Clinical Grade Analysis
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          AI Skin <span className="text-primary">Diagnostic</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light leading-relaxed">
          Advanced computer vision algorithm for comprehensive dermatological assessment and personalized treatment protocols.
        </p>
      </div>

      {/* Upload Section - Modern Glass UI */}
      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5">
          <Card className="glass-panel border-white/10 overflow-hidden sticky top-24">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Image Acquisition</CardTitle>
              <CardDescription className="font-light">
                Position your face within the guide for optimal precision.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className={cn(
                  "relative group flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-4 transition-all duration-500",
                  imagePreview ? "border-primary/50 bg-primary/5" : "border-white/10 hover:border-primary/30 hover:bg-white/5"
                )}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Upload skin photo"
                  />
                  
                  {imagePreview ? (
                    <div className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-2xl">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <Button
                          onClick={handleUploadClick}
                          variant="glass"
                          size="sm"
                          className="w-full"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Replace Asset
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 space-y-6 cursor-pointer" onClick={handleUploadClick}>
                      <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-glow-primary transition-all duration-500">
                        <Camera className="h-10 w-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium">Capture or Upload</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">
                          JPG • PNG • HEIC (MAX 10MB)
                        </p>
                      </div>
                      <Button variant="premium" size="sm" className="px-8 shadow-glow-primary">
                        Initialize Scanner
                      </Button>
                    </div>
                  )}
                </div>

                {isProcessing && (
                  <div className="flex flex-col items-center py-8 space-y-4 animate-in fade-in">
                    <div className="relative h-12 w-12">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <div className="absolute inset-0 blur-lg bg-primary/20 rounded-full animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold tracking-widest uppercase">Analyzing Pixels</p>
                      <p className="text-xs text-muted-foreground mt-1">Cross-referencing dermatological database...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground rounded-2xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-medium uppercase tracking-tight">{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section - Premium Data Viz */}
        <div className="lg:col-span-7">
          {result && !isProcessing ? (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-700">
              {/* Score Metric Card */}
              <Card className="premium-card bg-gradient-to-br from-white/10 to-transparent border-primary/20">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative h-32 w-32 flex items-center justify-center">
                      <svg className="h-full w-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-white/5"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeDasharray={364.4}
                          strokeDashoffset={364.4 - (364.4 * result.overallSkinHealth) / 100}
                          className={cn(
                            "transition-all duration-1000 ease-out",
                            result.overallSkinHealth >= 80 ? "text-emerald-500" : 
                            result.overallSkinHealth >= 60 ? "text-amber-500" : "text-rose-500"
                          )}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{result.overallSkinHealth}</span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Index</span>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                      <h3 className="text-2xl font-bold">Dermatological Health Index</h3>
                      <p className="text-muted-foreground font-light leading-relaxed">
                        A composite score based on hydration, texture, elasticity, and pore health metrics.
                      </p>
                      <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-3">
                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 rounded-full px-4 py-1">
                          {result.skinType} Type
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-4 py-1 border-white/10 bg-white/5">
                          {result.detectedConditions.length} Issues Detected
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specific Conditions Grid */}
              <div className="grid gap-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-bold tracking-tight">AI Identification</h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Detailed Analysis</p>
                </div>
                {result.detectedConditions.map((condition, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="premium-card hover:border-primary/30 overflow-hidden group">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className={cn(
                            "w-full md:w-2 bg-gradient-to-b transition-all duration-500 group-hover:w-3",
                            condition.severity.toLowerCase() === 'severe' ? "from-rose-500 to-rose-600" :
                            condition.severity.toLowerCase() === 'moderate' ? "from-amber-500 to-amber-600" : "from-emerald-500 to-emerald-600"
                          )} />
                          <div className="flex-1 p-6 space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{condition.name}</h4>
                                <p className="text-sm text-muted-foreground font-light mt-1">{condition.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={cn(
                                  "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                                  getSeverityColor(condition.severity)
                                )}>
                                  {condition.severity}
                                </Badge>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                                  {Math.round(condition.confidence)}% ACC
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                              <div className="space-y-2">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                  <AlertCircle className="h-3 w-3 text-primary" /> Symptoms
                                </p>
                                <ul className="text-xs text-muted-foreground space-y-1.5 font-light">
                                  {condition.symptoms.slice(0, 3).map((s, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="h-1 w-1 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                  <Info className="h-3 w-3 text-primary" /> Core Causes
                                </p>
                                <ul className="text-xs text-muted-foreground space-y-1.5 font-light">
                                  {condition.causes.slice(0, 3).map((c, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="h-1 w-1 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                                      {c}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Protocol
                                </p>
                                <ul className="text-xs text-muted-foreground space-y-1.5 font-light">
                                  {condition.treatments.slice(0, 3).map((t, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="h-1 w-1 rounded-full bg-emerald-500/50 mt-1.5 shrink-0" />
                                      {t}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Personalized Protocol */}
              <Card className="glass-panel border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                      Personalized Treatment Protocol
                    </CardTitle>
                    <Badge variant="premium" className="rounded-full text-[10px]">AI Optimized</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {result.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-[15px] text-muted-foreground leading-relaxed font-light">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button variant="premium" className="flex-1 h-12 shadow-glow-primary">
                      Book Professional Consultation
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 glass">
                      Download Full Diagnostic (PDF)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Image Quality Assurance */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Confidence", val: `${result.imageQuality.score}%`, status: result.imageQuality.score > 80 ? "Pass" : "Warn" },
                  { label: "Luminosity", val: result.imageQuality.lighting, status: "Normal" },
                  { label: "Resolution", val: result.imageQuality.resolution, status: "Optimal" },
                  { label: "Stability", val: result.imageQuality.clarity, status: "Locked" }
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-4 rounded-2xl border-white/5 flex flex-col items-center justify-center space-y-1">
                    <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.val}</p>
                    <Badge variant="outline" className="text-[8px] h-4 py-0 rounded-full border-primary/20 text-primary">
                      {stat.status}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Disclaimer - Legal Grade */}
              <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-3xl flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-rose-500 tracking-[0.2em]">Clinical Disclaimer</p>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    This automated analysis uses proprietary computer vision models for informational screening only. It does not constitute a medical diagnosis. For clinical assessment, please consult with a board-certified dermatologist.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 glass-panel border-white/5 rounded-[3rem]">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                <Brain className="h-24 w-24 text-white/10 relative" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">System Ready for Scan</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-light">
                  Our neural network is optimized and waiting for your data input. Upload a photo to initiate clinical-grade analysis.
                </p>
              </div>
              <div className="flex gap-4 opacity-30 grayscale grayscale-100">
                <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10" />
                <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10" />
                <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
