"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeftRight, 
  Sparkles, 
  Download, 
  Share2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface TreatmentPreviewProps {
  beforeImage: string;
  concerns: Array<{
    name: string;
    severity: number;
    description: string;
  }>;
  recommendations: Array<{
    treatment: string;
    price: number;
    duration: string;
    expectedOutcome: string;
  }>;
}

export default function ARTreatmentPreview({ 
  beforeImage, 
  concerns, 
  recommendations 
}: TreatmentPreviewProps) {
  const [comparison, setComparison] = useState(50); // 0-100 slider
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(0);
  const [afterImage, setAfterImage] = useState<string>('');

  // Generate simulated "after" image based on concerns
  useEffect(() => {
    generateAfterImage();
  }, [beforeImage, selectedTreatment, concerns]);

  const generateAfterImage = () => {
    // Create canvas to apply visual improvements
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Get selected treatment improvement level
      const improvementLevel = recommendations[selectedTreatment]?.price > 30000 ? 0.4 : 0.2;
      
      // Apply image enhancements based on concerns
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Brighten skin (reduce pigmentation appearance)
        if (concerns.some(c => c.name.includes('Pigmentation') || c.name.includes('Sun Damage'))) {
          data[i] = Math.min(255, data[i] + 15 * improvementLevel);     // R
          data[i + 1] = Math.min(255, data[i + 1] + 15 * improvementLevel); // G
          data[i + 2] = Math.min(255, data[i + 2] + 15 * improvementLevel); // B
        }
        
        // Smooth skin (reduce wrinkles appearance)
        if (concerns.some(c => c.name.includes('Wrinkles') || c.name.includes('Fine Lines'))) {
          // Apply subtle blur effect by averaging nearby pixels
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i] * 0.7 + avg * 0.3;
          data[i + 1] = data[i + 1] * 0.7 + avg * 0.3;
          data[i + 2] = data[i + 2] * 0.7 + avg * 0.3;
        }
        
        // Enhance redness (reduce acne/redness)
        if (concerns.some(c => c.name.includes('Acne') || c.name.includes('Redness'))) {
          data[i] = Math.max(0, data[i] - 10 * improvementLevel); // Reduce red channel
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Add subtle glow effect
      ctx.globalAlpha = 0.1;
      ctx.filter = 'blur(20px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.globalAlpha = 1.0;
      ctx.filter = 'none';
      
      setAfterImage(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = beforeImage;
  };

  // Auto-animation effect
  useEffect(() => {
    let animationFrame: number;
    if (isAnimating) {
      let direction = 1;
      const animate = () => {
        setComparison(prev => {
          const next = prev + direction * 2;
          if (next >= 100 || next <= 0) direction *= -1;
          return Math.max(0, Math.min(100, next));
        });
        animationFrame = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isAnimating]);

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const beforeImg = new Image();
    const afterImg = new Image();
    
    beforeImg.crossOrigin = 'anonymous';
    afterImg.crossOrigin = 'anonymous';
    
    afterImg.onload = () => {
      beforeImg.onload = () => {
        canvas.width = beforeImg.width * 2 + 40;
        canvas.height = beforeImg.height + 100;
        
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw before image
        ctx.drawImage(beforeImg, 20, 60);
        
        // Draw after image
        ctx.drawImage(afterImg, beforeImg.width + 40, 60);
        
        // Add labels
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Before', beforeImg.width / 2 + 20, 40);
        ctx.fillText('After', beforeImg.width * 1.5 + 40, 40);
        
        // Download
        const link = document.createElement('a');
        link.download = `treatment-preview-${Date.now()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
      };
      beforeImg.src = beforeImage;
    };
    afterImg.src = afterImage;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AR Treatment Preview
            </CardTitle>
            <CardDescription>
              See the expected results after treatment
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnimating(!isAnimating)}
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComparison(50)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement share functionality
                alert('Share functionality coming soon!');
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={selectedTreatment.toString()} onValueChange={(v) => setSelectedTreatment(parseInt(v))}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${recommendations.length}, 1fr)` }}>
            {recommendations.map((rec, idx) => (
              <TabsTrigger key={idx} value={idx.toString()}>
                {rec.treatment}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {recommendations.map((rec, idx) => (
            <TabsContent key={idx} value={idx.toString()} className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Price</div>
                  <div className="font-semibold text-lg">฿{rec.price.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-semibold">{rec.duration}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Expected Result</div>
                  <Badge variant="secondary">{rec.expectedOutcome}</Badge>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Before/After Comparison */}
        <div className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden">
          {/* After Image (full) */}
          {afterImage && (
            <img
              src={afterImage}
              alt="After treatment"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          {/* Before Image (clipped by slider) */}
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}
          >
            <img
              src={beforeImage}
              alt="Before treatment"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          
          {/* Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
            style={{ left: `${comparison}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          
          {/* Labels */}
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
            Before
          </div>
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
            After
          </div>
        </div>

        {/* Slider Control */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Before</span>
            <span>{comparison}%</span>
            <span>After</span>
          </div>
          <Slider
            value={[comparison]}
            onValueChange={(value) => setComparison(value[0])}
            max={100}
            step={1}
            className="cursor-pointer"
          />
        </div>

        {/* Improvements List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Expected Improvements:</h4>
          <div className="grid gap-2">
            {concerns.map((concern, idx) => {
              const improvement = Math.min(100, Math.round((10 - concern.severity) * 10 + 30));
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{concern.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Severity: {concern.severity}/10
                    </div>
                  </div>
                  <Badge variant={improvement >= 60 ? 'default' : 'secondary'}>
                    {improvement}% improvement
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground italic">
          * Results shown are simulated based on typical outcomes. Actual results may vary depending on individual skin condition and treatment response.
        </p>
      </CardContent>
    </Card>
  );
}
