'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  const [selectedTemplate, setSelectedTemplate] = useState('stripe')
  const [selectedTheme, setSelectedTheme] = useState('stripe')
  const [showPreview, setShowPreview] = useState(false)

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'stripe':
        return (
          <StripeHero
            title="Unified Beauty Platform"
            subtitle="AI-powered skin analysis and treatment tracking for modern aesthetic clinics. Built for scale, designed for simplicity."
            theme={selectedTheme as 'stripe' | 'ocean' | 'sunset' | 'emerald'}
            stats={[
              { value: '98.5%', label: 'Analysis Accuracy' },
              { value: '50k+', label: 'Skin Analyses' },
              { value: '500+', label: 'Partner Clinics' }
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
            subtitle="The platform for modern beauty clinics."
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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <h1 className="text-2xl font-bold">🎨 3D Design System Showcase</h1>
        <p className="text-gray-400 text-sm">เลือก template และ theme ที่ชอบ แล้วกด Preview</p>
      </div>

      <div className="flex">
        {/* Sidebar - Template Selection */}
        <div className="w-80 border-r border-white/10 p-6 space-y-6">
          {/* Templates */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Templates</h2>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedTemplate === template.id
                      ? 'bg-white/10 border border-white/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.preview}</span>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-400">{template.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Themes */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Color Themes</h2>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-3 rounded-lg transition-all ${
                    selectedTheme === theme.id
                      ? 'ring-2 ring-white'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div 
                    className="w-full h-8 rounded-md mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.join(', ')})`
                    }}
                  />
                  <div className="text-sm font-medium">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Button */}
          <motion.button
            onClick={() => setShowPreview(true)}
            className="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🚀 Preview Full Screen
          </motion.button>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 p-6">
          <div className="bg-gray-900 rounded-2xl overflow-hidden border border-white/10 aspect-video">
            <div className="transform scale-50 origin-top-left w-[200%] h-[200%]">
              {renderTemplate()}
            </div>
          </div>

          {/* Code Preview */}
          <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-white/10">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">📝 Code Usage</h3>
            <pre className="text-sm text-green-400 overflow-x-auto">
{`import { ${selectedTemplate === 'stripe' ? 'StripeHero' : 
  selectedTemplate === 'apple' ? 'AppleHero' :
  selectedTemplate === 'linear' ? 'LinearHero' :
  selectedTemplate === 'vercel' ? 'VercelHero' : 'CustomHero'} } from '@/components/3d-system/templates'

export default function Page() {
  return (
    <${selectedTemplate === 'stripe' ? `StripeHero
      title="Your Title"
      subtitle="Your subtitle here"
      theme="${selectedTheme}"
      stats={[
        { value: '98.5%', label: 'Accuracy' },
        { value: '50k+', label: 'Users' }
      ]}
    />` : 
    selectedTemplate === 'apple' ? `AppleHero
      title="Your Title"
      subtitle="Your subtitle"
    />` :
    selectedTemplate === 'linear' ? `LinearHero
      title="Your Title"
      subtitle="Your subtitle"
      badge="New Feature"
      features={['Feature 1', 'Feature 2']}
    />` :
    selectedTemplate === 'vercel' ? `VercelHero
      title="Your Title"
      subtitle="Your subtitle"
    />` : `CustomHero
      background="${selectedTemplate}"
      backgroundProps={{ /* custom props */ }}
    >
      <YourContent />
    </CustomHero>`}
  )
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
