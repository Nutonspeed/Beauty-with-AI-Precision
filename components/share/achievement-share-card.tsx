
'use client'

import { useRef, useState } from 'react'
import { 
  Trophy, 
  Share2, 
  Download,
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'

interface AchievementShareCardProps {
  milestone: {
    title: string
    description: string
    achievedAt: string
    type: string
    xp: number
  }
  userName: string
  centerName: string
  shareUrl?: string
}

export function AchievementShareCard({ milestone, userName, centerName, shareUrl }: AchievementShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const _finalShareUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : '')

  const downloadImage = async () => {
    if (!cardRef.current) return
    
    setIsGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#020617',
        logging: false,
        useCORS: true
      })
      
      const link = document.createElement('a')
      link.download = `aesthetic-achievement-${milestone.type}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('Achievement card downloaded!')
    } catch (error) {
      console.error('Failed to generate image:', error)
      toast.error('Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Shareable Area (Hidden from direct view but rendered for html2canvas) */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={cardRef}
          className="w-[400px] h-[600px] bg-[#020617] p-10 flex flex-col justify-between relative overflow-hidden text-white"
        >
          {/* Background Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-600/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05]" />

          {/* Header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
                <Sparkles className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Aesthetic_Milestone</span>
            </div>
            <h1 className="text-4xl font-black italic leading-[0.9] tracking-tighter">
              EVOLUTION<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent not-italic">SYNCHRONIZED</span>
            </h1>
          </div>

          {/* Achievement Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center space-y-8">
            <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/40">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold italic text-white">{milestone.title}</h2>
              <p className="text-sm text-slate-400 italic max-w-[250px] mx-auto leading-relaxed">
                "{milestone.description}"
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Badge className="bg-white/10 border-white/20 text-blue-400 font-black italic px-4 py-1.5 rounded-xl">
                +{milestone.xp} XP
              </Badge>
              <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 font-black italic px-4 py-1.5 rounded-xl">
                VERIFIED
              </Badge>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 pt-8 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Authorized_Client</p>
                <p className="text-sm font-bold italic text-white">{userName}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Neural_Node</p>
                <p className="text-sm font-bold italic text-white">{centerName}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-3 w-3 text-blue-500" />
              <p className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-600">Beauty with AI Precision_System v4.2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={downloadImage} 
          disabled={isGenerating}
          className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest italic text-[10px]"
        >
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Export_Capture
        </Button>
        <Button 
          variant="outline"
          className="flex-1 h-12 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-black uppercase tracking-widest italic text-[10px]"
          onClick={() => {
            const shareText = `I just achieved the "${milestone.title}" milestone on ${centerName}! #AestheticEvolution #CenterIQ`
            if (navigator.share) {
              navigator.share({
                title: 'My Aesthetic Achievement',
                text: shareText,
                url: window.location.href
              }).catch(console.error)
            } else {
              navigator.clipboard.writeText(shareText + ' ' + window.location.href)
              toast.success('Link and achievement text copied to clipboard!')
            }
          }}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share_Node
        </Button>
      </div>
    </div>
  )
}

function Loader2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
