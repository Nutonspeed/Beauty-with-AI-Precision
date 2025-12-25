'use client';

/**
 * Treatment Simulator Component
 * Before/After comparison with adjustable effects
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { SkinEffectProcessor, type SkinEffectOptions } from '@/lib/ar/skin-effects';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, RefreshCw, Sparkles } from 'lucide-react';

const SIMULATOR_TRANSLATIONS = {
  en: {
    title: 'Treatment Simulator',
    custom: 'Custom',
    mild: 'Mild',
    moderate: 'Moderate',
    intensive: 'Intensive',
    smoothing: 'Smoothing',
    brightening: 'Brightening',
    spotRemoval: 'Spot Removal',
    rednessReduction: 'Redness Reduction',
    poreMinimizing: 'Pore Minimizing',
    wrinkleReduction: 'Wrinkle Reduction',
    reset: 'Reset',
    export: 'Export Result',
    presetDescription: 'Select a treatment intensity preset or customize individual effects'
  },
  th: {
    title: 'จำลองการรักษา',
    custom: 'กำหนดเอง',
    mild: 'เบา',
    moderate: 'ปานกลาง',
    intensive: 'เข้มข้น',
    smoothing: 'เรียบผิว',
    brightening: 'เพิ่มความสว่าง',
    spotRemoval: 'ลดจุดด่างดำ',
    rednessReduction: 'ลดรอยแดง',
    poreMinimizing: 'ลดรูขุมขน',
    wrinkleReduction: 'ลดริ้วรอย',
    reset: 'รีเซ็ต',
    export: 'ส่งออกผลลัพธ์',
    presetDescription: 'เลือกระดับการรักษาหรือปรับแต่งแต่ละเอฟเฟกต์'
  }
};

export interface TreatmentSimulatorProps {
  beforeImage: string | HTMLImageElement | HTMLCanvasElement;
  onExport?: (imageData: Blob) => void;
  className?: string;
  locale?: string;
}

export function TreatmentSimulator({
  beforeImage,
  onExport,
  className = '',
  locale = 'en'
}: TreatmentSimulatorProps) {
  const t = SIMULATOR_TRANSLATIONS[locale as keyof typeof SIMULATOR_TRANSLATIONS] || SIMULATOR_TRANSLATIONS.en;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processorRef = useRef<SkinEffectProcessor | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<'custom' | 'mild' | 'moderate' | 'intensive'>('custom');
  const [effectOptions, setEffectOptions] = useState<SkinEffectOptions>({
    smoothing: 0,
    brightening: 0,
    spotRemoval: 0,
    rednessReduction: 0,
    poreMinimizing: 0,
    wrinkleReduction: 0,
  });

  /**
   * Initialize Pixi.js processor
   */
  useEffect(() => {
    const init = async () => {
      if (!canvasRef.current) return;

      try {
        const processor = new SkinEffectProcessor();
        await processor.initialize(canvasRef.current, 800, 600);
        await processor.loadImage(beforeImage);

        processorRef.current = processor;
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    init();

    return () => {
      if (processorRef.current) {
        processorRef.current.dispose();
      }
    };
  }, [beforeImage]);

  /**
   * Apply effects when options change
   */
  useEffect(() => {
    if (isInitialized && processorRef.current) {
      processorRef.current.applyEffects(effectOptions);
    }
  }, [isInitialized, effectOptions]);

  /**
   * Update effect option
   */
  const updateEffect = useCallback((key: keyof SkinEffectOptions, value: number) => {
    setEffectOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPreset('custom');
  }, []);

  /**
   * Apply preset
   */
  const applyPreset = useCallback((preset: 'mild' | 'moderate' | 'intensive') => {
    const presets: Record<string, SkinEffectOptions> = {
      mild: {
        smoothing: 0.2,
        brightening: 0.1,
        spotRemoval: 0.15,
        rednessReduction: 0.1,
        poreMinimizing: 0.15,
        wrinkleReduction: 0.1,
      },
      moderate: {
        smoothing: 0.4,
        brightening: 0.25,
        spotRemoval: 0.35,
        rednessReduction: 0.3,
        poreMinimizing: 0.35,
        wrinkleReduction: 0.3,
      },
      intensive: {
        smoothing: 0.7,
        brightening: 0.4,
        spotRemoval: 0.6,
        rednessReduction: 0.5,
        poreMinimizing: 0.6,
        wrinkleReduction: 0.5,
      },
    };

    setEffectOptions(presets[preset]);
    setCurrentPreset(preset);
  }, []);

  /**
   * Reset effects
   */
  const resetEffects = useCallback(() => {
    setEffectOptions({
      smoothing: 0,
      brightening: 0,
      spotRemoval: 0,
      rednessReduction: 0,
      poreMinimizing: 0,
      wrinkleReduction: 0,
    });
    setCurrentPreset('custom');
  }, []);

  /**
   * Export result
   */
  const handleExport = useCallback(async () => {
    if (!processorRef.current) return;

    try {
      const blob = await processorRef.current.exportImage('png');
      if (onExport) {
        onExport(blob);
      } else {
        // Download automatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `treatment-result-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  }, [onExport]);

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {t.title}
        </h3>

        {/* Canvas */}
        <div className="mb-4 sm:mb-6 bg-black rounded-lg overflow-hidden">
          <div className="relative aspect-[4/3] sm:aspect-[16/9]">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Controls */}
        <Tabs value={currentPreset} onValueChange={(value) => {
          if (value === 'custom') {
            setCurrentPreset('custom');
          } else {
            applyPreset(value as 'mild' | 'moderate' | 'intensive');
          }
        }}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-0">
            <TabsTrigger value="custom">{t.custom}</TabsTrigger>
            <TabsTrigger value="mild">{t.mild}</TabsTrigger>
            <TabsTrigger value="moderate">{t.moderate}</TabsTrigger>
            <TabsTrigger value="intensive">{t.intensive}</TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="space-y-4 mt-4">
            {/* Smoothing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{t.smoothing}</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(effectOptions.smoothing * 100)}%
                </span>
              </div>
              <Slider
                value={[effectOptions.smoothing * 100]}
                onValueChange={(value) => updateEffect('smoothing', value[0] / 100)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Brightening */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{t.brightening}</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(effectOptions.brightening * 100)}%
                </span>
              </div>
              <Slider
                value={[effectOptions.brightening * 100]}
                onValueChange={(value) => updateEffect('brightening', value[0] / 100)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Spot Removal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{t.spotRemoval}</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(effectOptions.spotRemoval * 100)}%
                </span>
              </div>
              <Slider
                value={[effectOptions.spotRemoval * 100]}
                onValueChange={(value) => updateEffect('spotRemoval', value[0] / 100)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Redness Reduction */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{t.rednessReduction}</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(effectOptions.rednessReduction * 100)}%
                </span>
              </div>
              <Slider
                value={[effectOptions.rednessReduction * 100]}
                onValueChange={(value) => updateEffect('rednessReduction', value[0] / 100)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Pore Minimizing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{t.poreMinimizing}</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(effectOptions.poreMinimizing * 100)}%
                </span>
              </div>
              <Slider
                value={[effectOptions.poreMinimizing * 100]}
                onValueChange={(value) => updateEffect('poreMinimizing', value[0] / 100)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Wrinkle Reduction */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{t.wrinkleReduction}</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(effectOptions.wrinkleReduction * 100)}%
                </span>
              </div>
              <Slider
                value={[effectOptions.wrinkleReduction * 100]}
                onValueChange={(value) => updateEffect('wrinkleReduction', value[0] / 100)}
                min={0}
                max={100}
                step={1}
              />
            </div>
          </TabsContent>

          <TabsContent value="mild" className="mt-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Mild treatment preset applied. Switch to Custom tab to adjust.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="moderate" className="mt-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Moderate treatment preset applied. Switch to Custom tab to adjust.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="intensive" className="mt-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Intensive treatment preset applied. Switch to Custom tab to adjust.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-6">
          <Button onClick={resetEffects} variant="outline" className="flex-1 gap-2">
            <RefreshCw className="w-4 h-4" />
            {t.reset}
          </Button>
          <Button onClick={handleExport} className="flex-1 gap-2">
            <Download className="w-4 h-4" />
            {t.export}
          </Button>
        </div>
      </div>
    </Card>
  );
}
