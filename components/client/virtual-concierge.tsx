"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Minimize2, Info, Calendar, Pill, ChevronRight, Sparkles } from "lucide-react"
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

        const welcomeMessage = t('virtualConcierge.botResponses.personalizedWelcome' as any) || `Welcome back! Based on your ${skinTypeText} profile and current health score of ${analysis.overallScore}, I've synchronized your diagnostic nodes.${planContext}`

        setMessages([
          { 
            role: 'bot', 
            content: welcomeMessage, 
            timestamp: new Date() 
          }
        ])
      } else {
        setMessages([
          { role: 'bot', content: t('virtualConcierge.welcome' as any) || "Neural system synchronized. How can I assist with your aesthetic transformation today?", timestamp: new Date() }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch concierge context:', error)
      setError(true)
      setMessages([
        { role: 'bot', content: t('virtualConcierge.botResponses.error' as any) || "Protocol variance detected. Neural link unstable. Please retry synchronization.", timestamp: new Date() }
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

      setTimeout(async () => {
        let botResponse = t('virtualConcierge.botResponses.analyzed' as any) || "Input analyzed. Committing to neural processing stream..."
        const input = inputValue.toLowerCase()
        let showBookingAction = false
        
        if (input.includes('booking') || input.includes(t('virtualConcierge.keywords.booking' as any)) || input.includes('appointment')) {
          botResponse = t('virtualConcierge.botResponses.booking' as any) || "Authorized. Initializing reservation protocol for your next clinical node sync."
          showBookingAction = true
        } else if ((input.includes('roadmap') || input.includes(t('virtualConcierge.keywords.roadmap' as any)) || input.includes('next step') || input.includes('progress')) && activePlan) {
          const schedule = activePlan.schedule || []
          const completed = schedule.filter((s: any) => s.status === 'completed')
          const nextPending = schedule.find((s: any) => s.status === 'pending')
          
          botResponse = t('virtualConcierge.botResponses.roadmapSummary' as any) || `You have completed ${completed.length} cycles. Your next step is ${nextPending?.step || 'Final Optimization'} focusing on ${nextPending?.focus || 'aesthetic yield'}.`
          
          showBookingAction = true
        } else if ((input.includes('skin') || input.includes(t('virtualConcierge.keywords.skin' as any))) && latestAnalysis) {
          const concerns = latestAnalysis.concerns?.map((c: any) => c.type).join(', ') || 'general wellness'
          botResponse = t('virtualConcierge.botResponses.skinAdvice' as any) || `Your current profile indicates ${concerns} with an integrity score of ${latestAnalysis.overallScore}. I recommend a focused resurfacing protocol.`
          showBookingAction = true
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
      window.location.href = '/booking'
    }
  }

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 flex flex-col h-[650px]",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-pink-50 text-pink-600 border-none px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            PREMIUM_INTELLIGENCE_LOCKED
          </Badge>
          <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none mb-6">{t('virtualConcierge.accessDenied' as any) || 'Access_Restriction'}</h3>
          <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed mb-10 text-base">
            Upgrade to Premium to synchronize with our advanced neural concierge and realize your full aesthetic potential.
          </p>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-pink-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            Authorize_Executive_Sync
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between shrink-0 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-pink-50 group-hover:border-pink-100 transition-all duration-700">
            <Bot className="h-8 w-8 text-pink-600 animate-pulse" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black text-slate-950 italic tracking-tight uppercase leading-none">{t('virtualConcierge.title' as any) || 'Aesthetic_Concierge'}</CardTitle>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Neural_Link: Nominal</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 relative z-10">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-pink-600 transition-all shadow-inner">
            <Minimize2 className="h-6 w-6" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden relative bg-white">
        <ScrollArea ref={scrollRef as any} className="h-full p-10 lg:p-12">
          <div className="space-y-12 pb-10">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className={cn(
                    "flex gap-6 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-all duration-700",
                    msg.role === 'bot' 
                      ? "bg-pink-50 border-pink-100 text-pink-600" 
                      : "bg-slate-50 border-slate-100 text-slate-400"
                  )}>
                    {msg.role === 'bot' ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  </div>
                  <div className={cn(
                    "p-8 rounded-[2.5rem] space-y-6 shadow-sm relative overflow-hidden",
                    msg.role === 'bot' 
                      ? "bg-slate-50 border border-slate-100 text-slate-600 rounded-tl-none" 
                      : "bg-slate-950 text-white rounded-tr-none shadow-2xl"
                  )}>
                    <div className={cn(
                      "absolute top-0 left-0 bottom-0 w-1.5 opacity-20",
                      msg.role === 'bot' ? 'bg-pink-500' : 'bg-blue-500'
                    )} />
                    <p className="text-base font-medium leading-relaxed italic relative z-10">{msg.content}</p>
                    
                    {msg.type === 'action' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="pt-4 relative z-10"
                      >
                        <Button 
                          size="sm" 
                          variant="premium" 
                          onClick={() => handleAction('booking')}
                          className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] italic shadow-xl bg-white text-pink-600 border-none hover:scale-105 active:scale-95 transition-all"
                        >
                          Synchronize_Next_Cycle <ChevronRight className="ml-3 h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between gap-6 pt-4 border-t border-slate-100 relative z-10">
                      <p className={cn(
                        "text-[9px] font-black uppercase tracking-[0.3em] italic",
                        msg.role === 'bot' ? "text-slate-300" : "text-slate-500"
                      )}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {msg.role === 'bot' && (
                        <div className="h-1 w-12 bg-pink-100 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ x: [-48, 48] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="h-full w-6 bg-pink-500/40"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-6">
                <div className="h-12 w-12 rounded-xl bg-pink-50 border border-pink-100 text-pink-600 flex items-center justify-center shadow-inner">
                  <Bot className="h-6 w-6 animate-pulse" />
                </div>
                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] rounded-tl-none shadow-sm">
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
                        className="h-2 w-2 bg-pink-500 rounded-full shadow-glow-pink" 
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
        <div className="w-full space-y-10 relative z-10">
          <div className="flex flex-wrap gap-4">
            {[
              { icon: Calendar, label: t('virtualConcierge.bookingHelp' as any) || 'Booking_Sync' },
              { icon: Pill, label: t('virtualConcierge.regimenSupport' as any) || 'Regimen_Log' },
              { icon: Sparkles, label: 'Optimization_Logic' }
            ].map((btn, i) => (
              <motion.div key={i} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="h-12 rounded-xl border-slate-200 bg-white text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-pink-600 hover:border-pink-100 italic transition-all px-6 shadow-sm">
                  <btn.icon className="mr-3 h-4 w-4" /> {btn.label}
                </Button>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-6">
            <div className="relative flex-1 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('virtualConcierge.placeholder' as any) || "Initialize query sequence..."}
                className="h-18 rounded-[1.5rem] border-slate-100 bg-white text-slate-950 focus:border-pink-500/30 focus:ring-pink-500/10 placeholder:text-slate-300 italic font-light px-10 text-base transition-all relative z-10 shadow-inner"
              />
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleSend}
                className="h-18 w-18 rounded-[1.5rem] bg-slate-950 hover:bg-pink-600 shadow-2xl transition-all border-none relative overflow-hidden group/send"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/send:translate-x-[100%] transition-transform duration-1000" />
                <Send className="h-7 w-7 text-white relative z-10" />
              </Button>
            </motion.div>
          </div>
          <div className="flex items-center gap-5 px-4 opacity-40 hover:opacity-100 transition-opacity duration-700">
            <Info className="h-5 w-5 text-slate-400" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-relaxed">
              Inferences generated via BIP_CORE_v4.2 // Clinical validation required for protocol commitment.
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
