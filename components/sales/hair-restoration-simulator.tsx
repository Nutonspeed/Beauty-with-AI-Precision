"use client";

/**
 * Hair Restoration & Density Simulator
 * AR tool for visualizing hair transplant and treatment results
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Download, Scissors } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

const PROGRAMS = [
  { id: "fue", effectiveness: 95, pricePerGraft: 80 },
  { id: "dhi", effectiveness: 92, pricePerGraft: 100 },
  { id: "prp", effectiveness: 70, pricePerSession: 8000 },
  { id: "mesotherapy", effectiveness: 65, pricePerSession: 5000 },
  { id: "laser", effectiveness: 55, pricePerSession: 3000 },
];

interface HairRestorationProps {
  beforeImage: string;
  onExport?: (imageData: Blob) => void;
  onGenerateProposal?: (program: any) => void;
  className?: string;
  isEnterprise?: boolean;
}

export function HairRestorationSimulator({
  beforeImage,
  onExport,
  onGenerateProposal,
  className = "",
  isEnterprise = true,
}: HairRestorationProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [selectedZone, setSelectedZone] = useState("frontal");
  const [selectedProgram, setSelectedProgram] = useState("fue");
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparison, setComparison] = useState(50);
  const [afterImage, setAfterImage] = useState("");

  const [settings, setSettings] = useState({
    density: 40,
    hairline_advancement: 20,
    coverage: 30,
  });

  const [estimatedGrafts, setEstimatedGrafts] = useState(1000);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const HAIR_ZONES = {
    frontal: { id: "frontal", name: t("hairRestorationSimulator.areas.frontal") },
    crown: { id: "crown", name: t("hairRestorationSimulator.areas.crown") },
    temples: { id: "temples", name: t("hairRestorationSimulator.areas.temples") },
    midscalp: { id: "midscalp", name: t("hairRestorationSimulator.areas.midscalp") },
    beard: { id: "beard", name: t("hairRestorationSimulator.areas.beard") },
    eyebrows: { id: "eyebrows", name: t("hairRestorationSimulator.areas.eyebrows") },
  };

  const LOCAL_PROGRAMS = PROGRAMS.map((tr) => ({
    ...tr,
    name: t(`hairRestorationSimulator.programs.${tr.id}.name`),
    description: t(`hairRestorationSimulator.programs.${tr.id}.description`),
  }));

  useEffect(() => {
    const program = PROGRAMS.find((t) => t.id === selectedProgram);
    if (!program) return;

    const grafts = Math.round((settings.density + settings.coverage) * 15);
    setEstimatedGrafts(grafts);

    if (program.pricePerGraft) {
      setEstimatedCost(grafts * program.pricePerGraft);
    } else if (program.pricePerSession) {
      const sessions = Math.ceil(settings.density / 20);
      setEstimatedCost(sessions * program.pricePerSession);
    }
  }, [selectedProgram, settings]);

  const generateEnhancedImage = useCallback(() => {
    if (!beforeImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const hairlineY = canvas.height * 0.15;
      const hairRegionHeight = canvas.height * 0.35;
      const densityFactor = settings.density / 100;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (y > hairlineY && y < hairlineY + hairRegionHeight) {
            const distFromHairline = (y - hairlineY) / hairRegionHeight;
            const idx = (y * canvas.width + x) * 4;

            if (Math.random() < densityFactor * (1 - distFromHairline * 0.5)) {
              const darkenAmount = 30 * densityFactor;
              data[idx] = Math.max(0, data[idx] - darkenAmount);
              data[idx + 1] = Math.max(0, data[idx + 1] - darkenAmount);
              data[idx + 2] = Math.max(0, data[idx + 2] - darkenAmount);
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      ctx.globalAlpha = 0.05;
      ctx.filter = "blur(1px)";
      ctx.drawImage(canvas, 0, 0);
      ctx.globalAlpha = 1.0;
      ctx.filter = "none";

      setAfterImage(canvas.toDataURL("image/jpeg", 0.92));
      setIsProcessing(false);
    };
    img.src = beforeImage;
  }, [beforeImage, settings]);

  useEffect(() => {
    generateEnhancedImage();
  }, [generateEnhancedImage]);

  const selectedZoneInfo = HAIR_ZONES[selectedZone as keyof typeof HAIR_ZONES];
  const selectedProgramInfo = LOCAL_PROGRAMS.find((t) => t.id === selectedProgram);

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-black border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">{t("hairRestorationSimulator.title")}</CardTitle>
              <p className="text-sm text-gray-400">{t("hairRestorationSimulator.subtitle")}</p>
            </div>
          </div>
          {isEnterprise && (
            <Badge className="bg-emerald-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
              {t('hairRestorationSimulator.aiPowered')}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-white">{t("bodyContouringSimulator.selectArea")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(HAIR_ZONES).map(([key, zone]) => (
              <Button
                key={key}
                variant={selectedZone === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedZone(key)}
                className={
                  selectedZone === key
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    : "border-white/20 text-gray-300"
                }
              >
                {zone.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black">
          {beforeImage && (
            <div className="relative w-full h-full">
              <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
              {afterImage && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}
                >
                  <img src={afterImage} alt="After" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="absolute top-0 bottom-0 w-1 bg-white" style={{ left: `${comparison}%` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">↔</span>
                </div>
              </div>
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
                {t("arProgramPreview.before")}
              </div>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm">
                {t("arProgramPreview.after")}
              </div>
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 animate-spin text-white" />
                  <span className="ml-2 text-white">{t("bodyContouringSimulator.processing")}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <Slider value={[comparison]} onValueChange={([v]) => setComparison(v)} min={0} max={100} />

        <Tabs defaultValue="density" className="w-full">
          <TabsList className="grid grid-cols-2 bg-white/5">
            <TabsTrigger value="density">{t("hairRestorationSimulator.density")}</TabsTrigger>
            <TabsTrigger value="program">{t("salesArTools.mobileTitle")}</TabsTrigger>
          </TabsList>

          <TabsContent value="density" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-gray-300">{t("hairRestorationSimulator.density")}</Label>
                <span className="text-emerald-400 font-mono">{settings.density}%</span>
              </div>
              <Slider
                value={[settings.density]}
                onValueChange={([v]) => setSettings((s) => ({ ...s, density: v }))}
                min={0}
                max={100}
                step={5}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-gray-300">{t("hairRestorationSimulator.hairline")}</Label>
                <span className="text-emerald-400 font-mono">{settings.hairline_advancement}%</span>
              </div>
              <Slider
                value={[settings.hairline_advancement]}
                onValueChange={([v]) => setSettings((s) => ({ ...s, hairline_advancement: v }))}
                min={0}
                max={50}
                step={5}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-gray-300">{t("bodyContouringSimulator.selectArea")}</Label>
                <span className="text-emerald-400 font-mono">{settings.coverage}%</span>
              </div>
              <Slider
                value={[settings.coverage]}
                onValueChange={([v]) => setSettings((s) => ({ ...s, coverage: v }))}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </TabsContent>

          <TabsContent value="program" className="space-y-3 mt-4">
            {LOCAL_PROGRAMS.map((program) => (
              <motion.div
                key={program.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedProgram(program.id)}
                className={`p-3 rounded-xl border cursor-pointer ${
                  selectedProgram === program.id ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{program.name}</p>
                    <p className="text-sm text-gray-400">{program.description}</p>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                    {program.effectiveness}%
                  </Badge>
                </div>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>

        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">{t("hairRestorationSimulator.grafts")}</span>
            <span className="text-white font-bold">{t('hairRestorationSimulator.graftsCount', { count: estimatedGrafts.toLocaleString() })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">{t("bodyContouringSimulator.estimatedCost")}</span>
            <span className="text-2xl font-bold text-emerald-400">
              {t("format.currency", { amount: estimatedCost.toLocaleString() })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-white/20 text-white"
            onClick={() => afterImage && onExport && fetch(afterImage).then((r) => r.blob()).then(onExport)}
          >
            <Download className="w-4 h-4 mr-2" />
            {t("hairRestorationSimulator.saveImage")}
          </Button>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
            onClick={() =>
              onGenerateProposal &&
              onGenerateProposal({
                zone: selectedZoneInfo,
                program: selectedProgramInfo,
                estimatedGrafts,
                estimatedCost,
                settings,
                afterImage,
              })
            }
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t("hairRestorationSimulator.createProposal")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default HairRestorationSimulator;
