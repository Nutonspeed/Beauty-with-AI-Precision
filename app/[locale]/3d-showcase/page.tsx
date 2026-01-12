'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LayoutGrid, Palette, Rocket, Box } from "lucide-react"
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
  {
    id: 'stripe',
    name: 'Stripe Style',
    description: 'Gradient mesh with clean typography',
    preview: '🟣'
  },
  {
    id: 'apple',
    name: 'Apple Style',
    description: 'Minimalist with focus on product',
    preview: '⚫'
  },
  {
    id: 'linear',
    name: 'Linear Style',
    description: 'Dark mode with grid patterns',
    preview: '🔮'
  },
  {
    id: 'vercel',
    name: 'Vercel Style',
    description: 'Modern with triangular motifs',
    preview: '▲'
  },
  {
    id: 'particles',
    name: 'Particle Field',
    description: '3D particles floating in space',
    preview: '✨'
  },
  {
    id: 'shapes',
    name: 'Floating Shapes',
    description: '3D geometric shapes',
    preview: '🔷'
  },
  {
    id: 'wave',
    name: 'Wave Field',
    description: 'Animated wave terrain',
    preview: '🌊'
  },
  {
    id: 'stars',
    name: 'Star Field',
    description: 'Space/starry background',
    preview: '⭐'
  }
]

// Theme configurations
const themes = [
  { id: 'stripe', name: 'Stripe', colors: ['#635bff', '#a960ee', '#f97316'] },
  { id: 'ocean', name: 'Ocean', colors: ['#0ea5e9', '#6366f1', '#8b5cf6'] },
  { id: 'sunset', name: 'Sunset', colors: ['#f59e0b', '#ef4444', '#ec4899'] },
  { id: 'emerald', name: 'Emerald', colors: ['#10b981', '#06b6d4', '#3b82f6'] }
]

export default function ThreeDShowcasePage() {
  const t = useTranslations()
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
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
              <h1 className="text-6xl md:text-8xl font-bold mb-6">Particle Field</h1>
              <p className="text-xl text-gray-400">3D particles floating in space</p>
            </div>
          </CustomHero>
        )
      case 'shapes':
        return (
          <CustomHero background="shapes" backgroundProps={{ colors: themes.find(t => t.id === selectedTheme)?.colors }}>
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-6">Floating Shapes</h1>
              <p className="text-xl text-gray-400">3D geometric shapes in motion</p>
            </div>
          </CustomHero>
        )
      case 'wave':
        return (
          <CustomHero background="wave" backgroundProps={{ color: themes.find(t => t.id === selectedTheme)?.colors[0] }}>
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-6">Wave Field</h1>
              <p className="text-xl text-gray-400">Animated wave terrain</p>
            </div>
          </CustomHero>
        )
      case 'stars':
        return (
          <CustomHero background="stars">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-6">Star Field</h1>
              <p className="text-xl text-gray-400">Journey through the cosmos</p>
            </div>
          </CustomHero>
        )
      default:
        return null
    }
  }

  if (showPreview) {
    return (
      <div className="relative">
        {renderTemplate()}
        <motion.button
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          onClick={() => setShowPreview(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ← Back to Editor
        </motion.button>
      </div>
    )
  }

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

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-12 max-w-7xl mx-auto flex-1">
          {/* Showcase Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Box className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Dimensional Design System Hub
              </Badge>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                3D System<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Showcase</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Orchestrate immersive aesthetic experiences through precision dimensional rendering and advanced visual nodes.
              </p>
            </motion.div>
            
            <div className="shrink-0">
              <Button size="xl" variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border" onClick={() => setShowPreview(true)}>
                <Rocket className="mr-3 h-5 w-5" />
                Execute Full Render
              </Button>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-12">
            {/* Template Parameter Node */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                    <LayoutGrid className="h-6 w-6 text-pink-500" />
                    Template Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ x: 10 }}
                      className={cn(
                        "group/item cursor-pointer p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden",
                        selectedTemplate === template.id 
                          ? "bg-pink-600/10 border-pink-500/40 shadow-inner" 
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                      )}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-center gap-6 relative z-10">
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-all duration-700",
                          selectedTemplate === template.id ? "bg-pink-600/20 text-pink-400 border-pink-500/30" : "bg-white/[0.03] text-slate-500"
                        )}>
                          <span className="text-2xl group-hover/item:scale-110 transition-transform">{template.preview}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-white italic group-hover/item:text-pink-400 transition-colors">{template.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{template.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Theme Configuration Node */}
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
                    <Palette className="h-6 w-6 text-cyan-400" />
                    Color Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  <div className="grid grid-cols-2 gap-4">
                    {themes.map((theme) => (
                      <motion.div
                        key={theme.id}
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          "cursor-pointer p-4 rounded-2xl border transition-all duration-500 group/theme",
                          selectedTheme === theme.id 
                            ? "bg-white/[0.05] border-cyan-500/40 shadow-inner ring-1 ring-cyan-500/20" 
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                        )}
                        onClick={() => setSelectedTheme(theme.id)}
                      >
                        <div 
                          className="w-full h-10 rounded-xl mb-3 shadow-2xl transition-transform group-hover/theme:rotate-3"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.join(', ')})`
                          }}
                        />
                        <p className="text-[9px] font-black uppercase tracking-widest text-center text-slate-500 group-hover/theme:text-cyan-400 transition-colors">{theme.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rendering Engine Hub */}
            <div className="lg:col-span-8 space-y-10">
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3.5rem] overflow-hidden shadow-2xl relative aspect-video flex items-center justify-center group/render">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                
                {/* Visual Output Port */}
                <div className="absolute inset-4 rounded-[3rem] overflow-hidden bg-black/40 border border-white/5">
                  <div className="transform scale-[0.6] lg:scale-[0.7] origin-top-left w-[166%] h-[166%]">
                    {renderTemplate()}
                  </div>
                </div>

                {/* Telemetry HUD */}
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end pointer-events-none">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-pink-400">Render Pipeline Active</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 tracking-widest uppercase">LATENCY: 8MS</p>
                      <p className="text-[8px] font-black text-slate-600 tracking-widest uppercase">THREADS: 128_ASYNC</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[8px] font-black text-slate-600 tracking-widest uppercase italic">BUILD_HASH: {selectedTemplate.toUpperCase()}_NODE</p>
                    <p className="text-[8px] font-black text-slate-600 tracking-widest uppercase italic">DEPLOY_VECTOR: {selectedTheme.toUpperCase()}_SYNC</p>
                  </div>
                </div>
              </Card>

              {/* Functional Schema Node */}
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Module Schema Extraction</CardTitle>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  <div className="relative group/code">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur opacity-20 group-hover/code:opacity-40 transition duration-1000" />
                    <pre className="relative z-10 bg-black/40 rounded-2xl p-8 overflow-x-auto text-xs font-mono text-cyan-400 scrollbar-hide border border-white/5">
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
