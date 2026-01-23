'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LayoutGrid, Palette, Rocket, Box, Cpu } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { 
  StripeHero, 
  AppleHero, 
  LinearHero, 
  VercelHero, 
  CustomHero 
} from '@/components/3d-system/templates'

// Template configurations
const templates = [
  { id: 'stripe', name: 'Stripe Sequence', description: 'Gradient mesh with neural typography', preview: '🟣' },
  { id: 'apple', name: 'Aesthetic Minimalist', description: 'Precision focus on digital twin', preview: '⚫' },
  { id: 'linear', name: 'Quantum Grid', description: 'Low-latency structural motifs', preview: '🔮' },
  { id: 'vercel', name: 'Geometric Synthesis', description: 'Modern triangular data nodes', preview: '▲' },
  { id: 'particles', name: 'Inference Field', description: 'Neural particles floating in void', preview: '✨' },
  { id: 'shapes', name: 'Dimensional Voxels', description: 'Volumetric geometric primitives', preview: '🔷' },
  { id: 'wave', name: 'Signal Terrain', description: 'Animated biometric frequency', preview: '🌊' },
  { id: 'stars', name: 'Cosmic Protocol', description: 'Deep-space diagnostic telemetry', preview: '⭐' }
]

// Theme configurations
const themes = [
  { id: 'stripe', name: 'Neural Indigo', colors: ['#635bff', '#a960ee', '#f97316'] },
  { id: 'ocean', name: 'Aesthetic Cyan', colors: ['#0ea5e9', '#6366f1', '#8b5cf6'] },
  { id: 'sunset', name: 'Neon Rose', colors: ['#ff69b4', '#ef4444', '#ec4899'] },
  { id: 'emerald', name: 'Precision Mint', colors: ['#10b981', '#06b6d4', '#3b82f6'] }
]

export default function ThreeDShowcasePage() {
  const t = useTranslations()
  const locale = useLocale()
  const [selectedTemplate, setSelectedTemplate] = useState('stripe')
  const [selectedTheme, setSelectedTheme] = useState('stripe')
  const [showPreview, setShowPreview] = useState(false)

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'stripe':
        return (
          <StripeHero
            title="Unified Beauty Platform"
            subtitle="AI-powered skin analysis and program tracking for modern aesthetic centers. Built for scale, designed for simplicity."
            theme={selectedTheme as 'stripe' | 'ocean' | 'sunset' | 'emerald'}
            stats={[
              { value: '98.5%', label: 'Analysis Accuracy' },
              { value: '50k+', label: 'Skin Analyses' },
              { value: '500+', label: 'Partner Centers' }
            ]}
          />
        )
      case 'apple':
        return (
          <AppleHero
            title="Beautiful. Powerful. Simple."
            subtitle="The future of aesthetic medicine."
            cta="Learn more →"
          />
        )
      case 'linear':
        return (
          <LinearHero
            title="Build better products"
            subtitle="Linear is a better way to build products. Meet the system designed for modern software teams."
            badge="✨ Now with AI-powered analysis"
            features={['AI Analysis', 'Real-time Tracking', 'Team Collaboration', 'Analytics']}
          />
        )
      case 'vercel':
        return (
          <VercelHero
            title="Develop. Preview. Ship."
            subtitle="The platform for modern beauty centers."
          />
        )
      case 'particles':
        return (
          <CustomHero background="particles" backgroundProps={{ count: 3000, color: themes.find(t => t.id === selectedTheme)?.colors[0] }}>
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-black italic mb-6 uppercase text-white">Particle Field</h1>
              <p className="text-xl text-white/60 italic font-light">3D particles floating in space</p>
            </div>
          </CustomHero>
        )
      case 'shapes':
        return (
          <CustomHero background="shapes" backgroundProps={{ colors: themes.find(t => t.id === selectedTheme)?.colors }}>
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-black italic mb-6 uppercase text-white">Floating Shapes</h1>
              <p className="text-xl text-white/60 italic font-light">3D geometric shapes in motion</p>
            </div>
          </CustomHero>
        )
      case 'wave':
        return (
          <CustomHero background="wave" backgroundProps={{ color: themes.find(t => t.id === selectedTheme)?.colors[0] }}>
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-black italic mb-6 uppercase text-white">Wave Field</h1>
              <p className="text-xl text-white/60 italic font-light">Animated wave terrain</p>
            </div>
          </CustomHero>
        )
      case 'stars':
        return (
          <CustomHero background="stars">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-black italic mb-6 uppercase text-white">Star Field</h1>
              <p className="text-xl text-white/60 italic font-light">Journey through the cosmos</p>
            </div>
          </CustomHero>
        )
      default:
        return null
    }
  }

  if (showPreview) {
    return (
      <div className="relative h-screen w-full bg-slate-950 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTemplate}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            {renderTemplate()}
          </motion.div>
        </AnimatePresence>
        <motion.button
          className="fixed top-8 right-8 z-50 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-white/20 transition-all italic shadow-2xl"
          onClick={() => setShowPreview(false)}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          ← Back to Terminal
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Showcase Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6">
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Box className="mr-3 h-3.5 w-3.5" />
                  Dimensional Design Hub
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                3D System<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">Showcase</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-tight max-w-2xl italic leading-relaxed">
                Orchestrate immersive aesthetic experiences through precision dimensional rendering and neural visual nodes.
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Button size="xl" variant="premium" className="h-20 px-12 rounded-[2rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={() => setShowPreview(true)}>
                <Rocket className="mr-4 h-6 w-6" />
                Initialize Render
              </Button>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-12">
            {/* Control Panel Column */}
            <div className="lg:col-span-4 space-y-12">
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50">
                  <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase leading-none">
                    <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
                      <LayoutGrid className="h-8 w-8 text-pink-600" />
                    </div>
                    Template Schema
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-6 max-h-[600px] overflow-y-auto scrollbar-hide bg-slate-50/30">
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ x: 12 }}
                      className={cn(
                        "group/item cursor-pointer p-6 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden",
                        selectedTemplate === template.id 
                          ? "bg-white border-pink-500/30 shadow-premium" 
                          : "bg-white/50 border-slate-100 hover:bg-white hover:border-pink-500/20 shadow-sm"
                      )}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-center gap-6 relative z-10">
                        <div className={cn(
                          "h-16 w-16 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner transition-all duration-700",
                          selectedTemplate === template.id ? "bg-pink-50 text-pink-600 border-pink-100" : "bg-white text-slate-300"
                        )}>
                          <span className="text-3xl group-hover/item:scale-110 transition-transform">{template.preview}</span>
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <p className="text-lg font-black text-slate-950 italic group-hover/item:text-pink-600 transition-colors uppercase tracking-tight leading-none">{template.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{template.description}</p>
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="h-2 w-2 rounded-full bg-pink-500 shadow-glow-pink animate-pulse" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50">
                  <CardTitle className="text-2xl font-black text-slate-950 tracking-tighter italic flex items-center gap-6 uppercase leading-none">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
                      <Palette className="h-8 w-8 text-blue-600" />
                    </div>
                    Color Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 bg-slate-50/30">
                  <div className="grid grid-cols-2 gap-6">
                    {themes.map((theme) => (
                      <motion.div
                        key={theme.id}
                        whileHover={{ scale: 1.05, y: -4 }}
                        className={cn(
                          "cursor-pointer p-6 rounded-[2.5rem] border transition-all duration-500 group/theme relative overflow-hidden",
                          selectedTheme === theme.id 
                            ? "bg-white border-blue-500/30 shadow-premium" 
                            : "bg-white/50 border-slate-100 hover:bg-white hover:border-blue-500/20"
                        )}
                        onClick={() => setSelectedTheme(theme.id)}
                      >
                        <div 
                          className="w-full h-14 rounded-2xl mb-4 shadow-lg transition-transform group-hover/theme:rotate-3 group-hover/theme:scale-105 duration-700"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.join(', ')})`
                          }}
                        />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-slate-400 group-hover/theme:text-blue-600 transition-colors italic">{theme.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rendering Hub Column */}
            <div className="lg:col-span-8 space-y-12">
              <Card className="border-slate-100 bg-slate-950 shadow-2xl rounded-[4rem] overflow-hidden relative aspect-video flex items-center justify-center group/render">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-blue-600/5 pointer-events-none" />
                
                {/* Visual Port interface */}
                <div className="absolute inset-8 rounded-[3.5rem] overflow-hidden bg-slate-900 border border-white/5 shadow-inner">
                  <div className="transform scale-[0.6] lg:scale-[0.7] origin-top-left w-[166%] h-[166%]">
                    {renderTemplate()}
                  </div>
                </div>

                {/* HUD Diagnostics interface */}
                <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end pointer-events-none">
                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse shadow-glow-pink" />
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-500 italic">Render Pipeline: NOMINAL</span>
                    </div>
                    <div className="flex gap-10">
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase leading-none">LATENCY</p>
                        <p className="text-xl font-black text-white italic tracking-tighter leading-none">0.008s</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase leading-none">THROUGHPUT</p>
                        <p className="text-xl font-black text-white italic tracking-tighter leading-none">4.2 GB/s</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-3">
                    <div className="bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                      <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase italic leading-none">NODE_SYNC: {selectedTemplate.toUpperCase()}</p>
                    </div>
                    <p className="text-[9px] font-black text-slate-600 tracking-[0.2em] uppercase italic pr-2">DEPLOY_VECTOR: {selectedTheme.toUpperCase()}_SYNC</p>
                  </div>
                </div>
              </Card>

              {/* Technical Schematic Node interface */}
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Module Schematic Logic</CardTitle>
                    <p className="text-lg font-black text-slate-950 italic uppercase tracking-tight leading-none">Neural Parameter Export</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300 hover:text-blue-600 transition-colors bg-slate-50 shadow-inner">
                    <Cpu className="h-6 w-6" />
                  </Button>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 bg-slate-50/30">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-600/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
                    <pre className="relative z-10 bg-slate-950 rounded-[2.5rem] p-12 overflow-x-auto text-[14px] font-mono text-pink-400 scrollbar-hide border border-white/5 shadow-2xl">
{`import { ${selectedTemplate === 'stripe' ? 'StripeHero' : 
  selectedTemplate === 'apple' ? 'AppleHero' :
  selectedTemplate === 'linear' ? 'LinearHero' :
  selectedTemplate === 'vercel' ? 'VercelHero' : 'CustomHero'} } from '@/components/3d-system/templates'

export default function PrecisionNode() {
  return (
    <${selectedTemplate === 'stripe' ? `StripeHero
      title="Cinematic Transformation"
      subtitle="AI-driven dermal orchestration"
      theme="${selectedTheme}"
      stats={[
        { value: '98.5%', label: 'Precision' },
        { value: '50k+', label: 'Cycles' }
      ]}
    />` : 
    selectedTemplate === 'apple' ? `AppleHero
      title="Centeral Accuracy"
      subtitle="The future of aesthetic medicine"
    />` :
    selectedTemplate === 'linear' ? `LinearHero
      title="System Synthesis"
      subtitle="Precision architecture control"
      badge="Node Sync v2.0"
      features={['AI Analysis', 'Real-time Telemetry']}
    />` :
    selectedTemplate === 'vercel' ? `VercelHero
      title="Deploy. Visualize. Transform."
      subtitle="Advanced centeral infrastructure"
    />` : `CustomHero
      background="${selectedTemplate}"
      backgroundProps={{ /* node parameters */ }}
    >
      <CenteralContent />
    </CustomHero>`}
  )
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
