"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Send, Bot, User, Minimize2, Info, Calendar, Pill, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface Message {
  role: 'bot' | 'user'
  content: string
  timestamp: Date
  type?: 'text' | 'action'
}

interface VirtualConciergeProps {
  isPremium: boolean
}

export function VirtualConcierge({ isPremium }: VirtualConciergeProps) {
  const t = useTranslations()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [_error, setError] = useState(false)
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null)
  const [activePlan, setActivePlan] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchContext = useCallback(async () => {
    setError(false)
    try {
      // 1. Fetch latest analysis
      const analysisRes = await fetch('/api/analysis/history?limit=1')
      const analysisResult = await analysisRes.json()
      
      // 2. Fetch active treatment plan
      const planRes = await fetch('/api/program-plans')
      const planResult = await planRes.json()
      
      if (planResult.plans && planResult.plans.length > 0) {
        setActivePlan(planResult.plans[0])
      }

      if (analysisResult.data && analysisResult.data.length > 0) {
        const analysis = analysisResult.data[0]
        setLatestAnalysis(analysis)
        
        // Personalized welcome message
        const skinTypeText = analysis.skinType || 'analyzed'
        const planContext = planResult.plans && planResult.plans.length > 0 
          ? ` I'm also tracking your active "${planResult.plans[0].concern_type}" roadmap.`
          : ''

        const welcomeMessage = t('virtualConcierge.botResponses.personalizedWelcome', {
          skinType: skinTypeText,
          score: analysis.overallScore,
          planContext: planContext
        })

        setMessages([
          { 
            role: 'bot', 
            content: welcomeMessage, 
            timestamp: new Date() 
          }
        ])
      } else {
        setMessages([
          { role: 'bot', content: t('virtualConcierge.welcome'), timestamp: new Date() }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch concierge context:', error)
      setError(true)
      setMessages([
        { role: 'bot', content: t('virtualConcierge.botResponses.error'), timestamp: new Date() }
      ])
    }
  }, [t])

  useEffect(() => {
    fetchContext()
  }, [fetchContext])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate Smarter AI Response
    setTimeout(async () => {
      let botResponse = t('virtualConcierge.botResponses.analyzed')
      const input = inputValue.toLowerCase()
      let detectedIntent = false
      let showBookingAction = false
      let programName = ''
      
      if (input.includes('booking') || input.includes(t('virtualConcierge.keywords.booking')) || input.includes('appointment')) {
        botResponse = t('virtualConcierge.botResponses.booking')
        detectedIntent = true
        showBookingAction = true
        programName = 'General Appointment'
      } else if ((input.includes('roadmap') || input.includes(t('virtualConcierge.keywords.roadmap')) || input.includes('next step') || input.includes('progress')) && activePlan) {
        const schedule = activePlan.schedule || []
        const completed = schedule.filter((s: any) => s.status === 'completed')
        const nextPending = schedule.find((s: any) => s.status === 'pending')
        
        botResponse = t('virtualConcierge.botResponses.roadmapSummary', {
          count: completed.length,
          step: nextPending?.step || 'Final Optimization',
          focus: nextPending?.focus || 'aesthetic yield'
        })
        
        detectedIntent = true
        showBookingAction = true
        programName = activePlan.concern_type
      } else if ((input.includes('skin') || input.includes(t('virtualConcierge.keywords.skin'))) && latestAnalysis) {
        const concerns = latestAnalysis.concerns?.map((c: any) => c.type).join(', ') || 'general wellness'
        botResponse = t('virtualConcierge.botResponses.skinAdvice', {
          concerns: concerns,
          score: latestAnalysis.overallScore
        })
        detectedIntent = true
        showBookingAction = true
        programName = concerns
      } else if (input.includes('premium') || input.includes('upgrade')) {
        botResponse = t('virtualConcierge.botResponses.premiumUpgrade')
      }

      // AUTO LEAD CAPTURE: Send intent to sales team if detected
      if (detectedIntent) {
        try {
          fetch('/api/leads/capture-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              intent: 'inquiry',
              program_name: programName,
              notes: `User inquired about: ${inputValue}`
            })
          })
        } catch (e) {
          console.error('Failed to capture lead intent:', e)
        }
      }

      const botMessage: Message = {
        role: 'bot',
        content: botResponse,
        timestamp: new Date(),
        type: showBookingAction ? 'action' : 'text'
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleAction = (actionType: string) => {
    if (actionType === 'booking') {
      const lpPath = '/booking'
      // In a real app, use the localized path
      window.location.href = lpPath
    }
  }

  return (
    <Card className={cn(
      "border-white/10 bg-slate-900/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(236,72,153,0.1)] relative flex flex-col h-[650px] ring-1 ring-white/10 group",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#020617]/80 backdrop-blur-md p-12 text-center">
          <Badge className="mb-6 bg-pink-500/20 text-pink-400 border border-pink-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic shadow-lg">
            {t('virtualConcierge.premiumIntelligence')}
          </Badge>
          <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">{t('virtualConcierge.accessDenied')}</h3>
          <p className="text-slate-400 max-w-sm font-light italic leading-relaxed mb-10 text-sm">
            {t('virtualConcierge.upgradeUnlock')}
          </p>
          <Button variant="premium" className="h-18 px-12 rounded-[2rem] shadow-[0_20px_50px_rgba(236,72,153,0.3)] uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-pink-600 text-white hover:scale-105 active:scale-95 transition-all">
            {t('customerProfile.upgradeToPremium')}
          </Button>
        </div>
      )}

      <CardHeader className="p-8 lg:p-10 border-b border-white/5 flex flex-row items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/[0.03] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Bot className="h-7 w-7 text-pink-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black text-white italic tracking-tight uppercase leading-none">{t('virtualConcierge.title')}</CardTitle>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('virtualConcierge.neuralActive')}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-500 hover:bg-white/5 hover:text-white transition-all">
            <Minimize2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden relative">
        <ScrollArea ref={scrollRef} className="h-full p-8 lg:p-10">
          <div className="space-y-10 pb-6">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className={cn(
                  "flex gap-5 max-w-[90%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xl ring-1 transition-all duration-500",
                  msg.role === 'bot' 
                    ? "bg-pink-500/10 border-pink-500/20 text-pink-400 ring-pink-500/5" 
                    : "bg-white/[0.03] border-white/10 text-slate-400 ring-white/5"
                )}>
                  {msg.role === 'bot' ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
                </div>
                <div className={cn(
                  "p-6 rounded-[2.5rem] space-y-4 shadow-2xl relative ring-1",
                  msg.role === 'bot' 
                    ? "bg-white/[0.02] border border-white/5 text-slate-300 rounded-tl-none ring-white/5" 
                    : "bg-pink-600 text-white rounded-tr-none ring-pink-500/20"
                )}>
                  <p className="text-sm font-light leading-relaxed italic">{msg.content}</p>
                  
                  {msg.type === 'action' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="pt-2"
                    >
                      <Button 
                        size="sm" 
                        variant="premium" 
                        onClick={() => handleAction('booking')}
                        className="h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] italic shadow-[0_10px_30px_rgba(236,72,153,0.3)] border-none bg-white text-pink-600 hover:scale-105 active:scale-95 transition-all"
                      >
                        {t('virtualConcierge.secureNodeAccess')} <ChevronRight className="ml-3 h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-3">
                    <p className={cn(
                      "text-[9px] font-black uppercase tracking-[0.3em] italic",
                      msg.role === 'bot' ? "text-slate-600" : "text-pink-200"
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {msg.role === 'bot' && (
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-pink-500/20 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ x: [-32, 32] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="h-full w-4 bg-pink-500/40"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-5">
                <div className="h-12 w-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shadow-inner">
                  <Bot className="h-6 w-6 animate-pulse" />
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] rounded-tl-none shadow-2xl ring-1 ring-white/5">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.4, 1, 0.4] 
                        }} 
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1, 
                          delay: i * 0.2 
                        }} 
                        className="h-2 w-2 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" 
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-8 lg:p-10 border-t border-white/5 bg-white/[0.01] shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
        <div className="w-full space-y-8 relative z-10">
          <div className="flex flex-wrap gap-4">
            {[
              { icon: Calendar, label: t('virtualConcierge.bookingHelp') },
              { icon: Pill, label: t('virtualConcierge.regimenSupport') }
            ].map((btn, i) => (
              <motion.div key={i} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="h-11 rounded-2xl border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/10 italic transition-all px-6">
                  <btn.icon className="mr-3 h-4 w-4" /> {btn.label}
                </Button>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-5">
            <div className="relative flex-1 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('virtualConcierge.placeholder')}
                className="h-16 rounded-2xl border-white/10 bg-white/[0.03] text-white focus:border-pink-500/40 focus:ring-pink-500/20 placeholder:text-slate-700 italic font-light px-8 text-base transition-all relative z-10"
              />
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleSend}
                className="h-16 w-16 rounded-2xl bg-pink-600 hover:bg-pink-500 shadow-[0_15px_40px_rgba(236,72,153,0.4)] border-none relative overflow-hidden group/send"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/send:translate-x-[100%] transition-transform duration-1000" />
                <Send className="h-6 w-6 text-white relative z-10" />
              </Button>
            </motion.div>
          </div>
          <div className="flex items-center gap-4 px-2 opacity-40 hover:opacity-100 transition-opacity">
            <Info className="h-4 w-4 text-slate-600" />
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic leading-relaxed">
              {t('virtualConcierge.disclaimer')}
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
