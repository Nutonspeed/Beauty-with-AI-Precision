"use client"

/**
 * AR Tools Hub - AR/AI tools for Sales Team
 * Covers all aesthetic center nodes
 */

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useState } from "react"
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Camera, 
  Download, 
  ArrowLeft,
  Sparkles,
  Zap,
  Video,
  Upload,
  Maximize2,
  Box,
  Heart
} from "lucide-react"
import Link from 'next/link';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { useTranslations, useLocale } from 'next-intl';

// Import Simulators
import { FillerLipSimulator } from '@/components/sales/filler-lip-simulator';
import { BodyContouringSimulator } from '@/components/sales/body-contouring-simulator';
import { HairRestorationSimulator } from '@/components/sales/hair-restoration-simulator';
import { EyeEnhancementSimulator } from '@/components/sales/eye-enhancement-simulator';

export default function ARToolsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const lp = useLocalizePath();
  const isThaiLocale = locale === 'th';
  const [selectedTool, setSelectedTool] = useState<string>('filler');
  const [clientImage, setClientImage] = useState<string>('');
  const [showUpload, setShowUpload] = useState(true);
  const [intensity, setIntensity] = useState([50]);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  const TOOLS = [
    {
      id: 'skin',
      name: t('salesArTools.tools.skin.name'),
      icon: Sparkles,
      color: 'from-violet-600 to-purple-600',
      description: t('salesArTools.tools.skin.description')
    },
    {
      id: 'filler',
      name: t('salesArTools.tools.filler.name'),
      icon: Heart,
      color: 'from-pink-600 to-rose-600',
      description: t('salesArTools.tools.filler.description')
    },
    {
      id: 'body',
      name: t('salesArTools.tools.body.name'),
      icon: Zap,
      color: 'from-orange-600 to-red-600',
      description: t('salesArTools.tools.body.description')
    },
    {
      id: 'hair',
      name: t('salesArTools.tools.hair.name'),
      icon: Video,
      color: 'from-emerald-600 to-teal-600',
      description: t('salesArTools.tools.hair.description')
    },
    {
      id: 'eye',
      name: t('salesArTools.tools.eye.name'),
      icon: Upload,
      color: 'from-blue-600 to-indigo-600',
      description: t('salesArTools.tools.eye.description')
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setClientImage(event.target?.result as string);
        setShowUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `program-preview-${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateProposal = (data: any) => {
    console.log('Generate Proposal:', data);
    alert(t('salesArTools.generatingProposal'));
  };

  const handleCapture = () => {
    console.log('Capture sequence initiated');
  };

  const selectedToolInfo = TOOLS.find(t => t.id === selectedTool);

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* AR Tools Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Box className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Dimensional Visualization Hub
              </Badge>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                AR Simulator<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Nodes</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Synchronize aesthetic transformations through real-time dimensional rendering engines.
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Link href={lp('/sales/dashboard')}>
                <Button size="xl" variant="outline" className="h-16 px-10 rounded-2xl border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-white/10 italic">
                  <ArrowLeft className="mr-3 h-5 w-5" />
                  Terminal Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-12">
            {/* Control Hub Node */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                    <Maximize2 className="h-6 w-6 text-pink-500" />
                    Operational Control
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Initialize aesthetic rendering parameters</CardDescription>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Dimensional Target</Label>
                      <Select value={selectedTool} onValueChange={setSelectedTool}>
                        <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-6 text-[10px] font-black uppercase tracking-widest italic">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                          <SelectItem value="lip-filler" className="text-[10px] font-black uppercase tracking-widest italic">Lip Augmentation Sync</SelectItem>
                          <SelectItem value="skin-tightening" className="text-[10px] font-black uppercase tracking-widest italic">Dermal Elasticity Mapping</SelectItem>
                          <SelectItem value="jawline" className="text-[10px] font-black uppercase tracking-widest italic">Mandibular Definition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">Intensity Vector</Label>
                        <span className="text-pink-400 font-black italic">{intensity[0]}%</span>
                      </div>
                      <Slider
                        value={intensity}
                        onValueChange={setIntensity}
                        max={100}
                        step={1}
                        className="py-4"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/[0.02] shadow-inner group/toggle">
                      <div className="space-y-1">
                        <Label className="text-sm font-bold text-white italic group-hover/toggle:text-pink-400 transition-colors">Temporal Comparison</Label>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Dual-node visualization</p>
                      </div>
                      <Switch
                        className="data-[state=checked]:bg-pink-600"
                        checked={showBeforeAfter}
                        onCheckedChange={setShowBeforeAfter}
                      />
                    </div>
                  </div>

                  <div className="pt-6 space-y-4">
                    <Button size="xl" variant="premium" className="w-full h-16 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 border" onClick={handleCapture}>
                      <Camera className="mr-3 h-4 w-4" />
                      Capture Sequence
                    </Button>
                    <Button size="xl" variant="outline" className="w-full h-16 rounded-2xl border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white/10 italic">
                      <Download className="mr-3 h-4 w-4" />
                      Export Render
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rendering Engine Hub */}
            <div className="lg:col-span-8 space-y-10">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative min-h-[600px] flex items-center justify-center group/render">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                
                <AnimatePresence mode="wait">
                  {!clientImage ? (
                    <motion.div 
                      key="upload"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="text-center space-y-8 p-12"
                    >
                      <div className="mx-auto h-24 w-24 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/render:border-pink-500/30 transition-all duration-700 animate-pulse">
                        <Upload className="h-10 w-10 text-slate-500" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-white italic">Awaiting Dermal Ingestion</h3>
                        <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em]">Synchronize client visual data node</p>
                      </div>
                      <label className="inline-block cursor-pointer">
                        <div className="h-16 px-10 rounded-2xl bg-pink-600 hover:bg-pink-500 shadow-2xl shadow-pink-500/20 text-white flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 border border-pink-500/30">
                          <Upload className="h-5 w-5" />
                          Initialize Uplink
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="simulator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full p-8"
                    >
                      {selectedTool === 'filler' && (
                        <FillerLipSimulator 
                          beforeImage={clientImage}
                          onExport={handleExport}
                          onGenerateProposal={handleGenerateProposal}
                        />
                      )}
                      
                      {selectedTool === 'body' && (
                        <BodyContouringSimulator
                          beforeImage={clientImage}
                          onExport={handleExport}
                          onGenerateProposal={handleGenerateProposal}
                        />
                      )}
                      
                      {selectedTool === 'hair' && (
                        <HairRestorationSimulator
                          beforeImage={clientImage}
                          onExport={handleExport}
                          onGenerateProposal={handleGenerateProposal}
                        />
                      )}
                      
                      {selectedTool === 'eye' && (
                        <EyeEnhancementSimulator
                          beforeImage={clientImage}
                          onExport={handleExport}
                          onGenerateProposal={handleGenerateProposal}
                        />
                      )}
                      
                      {selectedTool === 'skin' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
                          <div className="h-20 w-20 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <Sparkles className="h-10 w-10 text-purple-400" />
                          </div>
                          <div className="space-y-4 max-w-md">
                            <h3 className="text-2xl font-bold text-white italic">{t('salesArTools.tools.skin.title')}</h3>
                            <p className="text-slate-400">{t('salesArTools.tools.skin.desc')}</p>
                            <Link href={lp('/analysis')}>
                              <Button className="h-14 px-8 rounded-xl bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-500/20">
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t('salesArTools.tools.skin.action')}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-3 z-50">
        <div className="flex items-center gap-3">
          {clientImage ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 border-white/20 text-white h-11"
                onClick={() => {
                  setClientImage('');
                  setShowUpload(true);
                }}
              >
                <Camera className="w-4 h-4 mr-2" />
                {t('salesArTools.change')}
              </Button>
              <Button 
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 h-11"
                onClick={() => handleGenerateProposal({ tool: selectedTool, image: clientImage })}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('salesArTools.proposal')}
              </Button>
            </>
          ) : (
            <label className="flex-1">
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 h-12"
              >
                <Upload className="w-5 h-5 mr-2" />
                {t('salesArTools.uploadPhoto')}
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
